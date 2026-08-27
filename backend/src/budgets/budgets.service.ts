import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';
import { CopyBudgetDto } from './dto/copy-budget.dto';
import { FinancialCalc } from '../common/utils/financial-calc';
import Decimal from 'decimal.js';

@Injectable()
export class BudgetsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateBudgetDto) {
    const existing = await this.prisma.budget.findUnique({
      where: {
        userId_month_year: {
          userId,
          month: dto.month,
          year: dto.year,
        },
      },
    });

    if (existing) {
      throw new ConflictException(
        `A budget for ${this.getMonthName(dto.month)} ${dto.year} already exists`,
      );
    }

    // Calculate total allocated from categories
    const categoryAllocations = dto.categories || [];
    const totalAllocated = FinancialCalc.sum(
      categoryAllocations.map((c) => c.allocatedAmount),
    );

    if (totalAllocated > dto.totalIncome && !dto.allowOverAllocation) {
      throw new BadRequestException(
        `Allocated amount (₦${totalAllocated.toLocaleString()}) exceeds monthly income (₦${dto.totalIncome.toLocaleString()}). Check 'allow over-allocation' to proceed anyway.`,
      );
    }

    return this.prisma.$transaction(async (tx) => {
      const budget = await tx.budget.create({
        data: {
          userId,
          month: dto.month,
          year: dto.year,
          totalIncome: new Decimal(dto.totalIncome),
          notes: dto.notes,
        },
      });

      if (categoryAllocations.length > 0) {
        await tx.budgetCategory.createMany({
          data: categoryAllocations.map((cat) => ({
            budgetId: budget.id,
            name: cat.name.trim(),
            description: cat.description,
            icon: cat.icon || 'Receipt',
            color: cat.color || '#10B981',
            allocatedAmount: new Decimal(cat.allocatedAmount),
            trackingType: cat.trackingType || 'DAILY',
            isSavings: cat.isSavings || false,
          })),
        });
      }

      return this.findOne(userId, budget.id, tx);
    });
  }

  async findAll(userId: string) {
    const budgets = await this.prisma.budget.findMany({
      where: { userId },
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
      include: {
        categories: {
          include: {
            expenses: {
              select: { amount: true },
            },
          },
        },
        expenses: {
          select: { amount: true },
        },
      },
    });

    return budgets.map((b) => {
      const totalIncome = FinancialCalc.format(b.totalIncome);
      const totalAllocated = FinancialCalc.sum(
        b.categories.map((c) => c.allocatedAmount),
      );
      const totalSpent = FinancialCalc.sum(b.expenses.map((e) => e.amount));
      const remaining = FinancialCalc.subtract(totalIncome, totalSpent);
      const utilization = FinancialCalc.percentage(totalSpent, totalIncome);

      return {
        id: b.id,
        month: b.month,
        monthName: this.getMonthName(b.month),
        year: b.year,
        totalIncome,
        totalAllocated,
        totalSpent,
        remaining,
        utilization,
        categoriesCount: b.categories.length,
        expensesCount: b.expenses.length,
        createdAt: b.createdAt,
        updatedAt: b.updatedAt,
      };
    });
  }

  async findByDate(userId: string, month: number, year: number) {
    const budget = await this.prisma.budget.findUnique({
      where: {
        userId_month_year: {
          userId,
          month: Number(month),
          year: Number(year),
        },
      },
    });

    if (!budget) {
      return null;
    }

    return this.findOne(userId, budget.id);
  }

  async findOne(userId: string, id: string, tx?: any) {
    const prisma = tx || this.prisma;
    const budget = await prisma.budget.findFirst({
      where: { id, userId },
      include: {
        categories: {
          include: {
            expenses: {
              orderBy: { expenseDate: 'desc' },
              select: {
                id: true,
                amount: true,
                description: true,
                expenseDate: true,
                paymentMethod: true,
                merchant: true,
                notes: true,
                createdAt: true,
              },
            },
          },
          orderBy: { name: 'asc' },
        },
        expenses: {
          orderBy: { expenseDate: 'desc' },
          include: {
            category: {
              select: { id: true, name: true, icon: true, color: true },
            },
          },
        },
      },
    });

    if (!budget) {
      throw new NotFoundException('Budget not found');
    }

    const totalIncome = FinancialCalc.format(budget.totalIncome);
    const totalAllocated = FinancialCalc.sum(
      budget.categories.map((c: any) => c.allocatedAmount),
    );
    const totalSpent = FinancialCalc.sum(
      budget.expenses.map((e: any) => e.amount),
    );
    const remaining = FinancialCalc.subtract(totalIncome, totalSpent);
    const utilization = FinancialCalc.percentage(totalSpent, totalIncome);

    // Savings calculations
    const savingsCategories = budget.categories.filter((c: any) => c.isSavings);
    const totalSavingsAllocated = FinancialCalc.sum(
      savingsCategories.map((c: any) => c.allocatedAmount),
    );
    const totalSavingsSpent = FinancialCalc.sum(
      savingsCategories.flatMap((c: any) => c.expenses.map((e: any) => e.amount)),
    );
    const savingsRate = FinancialCalc.percentage(
      totalSavingsAllocated,
      totalIncome,
    );

    const enrichedCategories = budget.categories.map((cat: any) => {
      const allocated = FinancialCalc.format(cat.allocatedAmount);
      const spent = FinancialCalc.sum(cat.expenses.map((e: any) => e.amount));
      const catRemaining = FinancialCalc.subtract(allocated, spent);
      const usagePercentage = FinancialCalc.percentage(spent, allocated);
      const status = FinancialCalc.getStatus(usagePercentage);

      return {
        id: cat.id,
        budgetId: cat.budgetId,
        name: cat.name,
        description: cat.description,
        icon: cat.icon,
        color: cat.color,
        allocatedAmount: allocated,
        trackingType: cat.trackingType,
        isSavings: cat.isSavings,
        spent,
        remaining: catRemaining,
        usagePercentage,
        status,
        expensesCount: cat.expenses.length,
        createdAt: cat.createdAt,
      };
    });

    return {
      id: budget.id,
      userId: budget.userId,
      month: budget.month,
      monthName: this.getMonthName(budget.month),
      year: budget.year,
      totalIncome,
      totalAllocated,
      totalSpent,
      remaining,
      utilization,
      unallocatedAmount: FinancialCalc.subtract(totalIncome, totalAllocated),
      isOverAllocated: totalAllocated > totalIncome,
      totalSavingsAllocated,
      totalSavingsSpent,
      savingsRate,
      notes: budget.notes,
      categories: enrichedCategories,
      recentExpenses: budget.expenses.slice(0, 10).map((e: any) => ({
        id: e.id,
        amount: FinancialCalc.format(e.amount),
        description: e.description,
        expenseDate: e.expenseDate,
        paymentMethod: e.paymentMethod,
        merchant: e.merchant,
        notes: e.notes,
        category: e.category,
        createdAt: e.createdAt,
      })),
      createdAt: budget.createdAt,
      updatedAt: budget.updatedAt,
    };
  }

  async update(userId: string, id: string, dto: UpdateBudgetDto) {
    const budget = await this.prisma.budget.findFirst({
      where: { id, userId },
      include: { categories: true },
    });

    if (!budget) {
      throw new NotFoundException('Budget not found');
    }

    if (dto.totalIncome !== undefined) {
      const totalAllocated = FinancialCalc.sum(
        budget.categories.map((c) => c.allocatedAmount),
      );
      if (totalAllocated > dto.totalIncome && !dto.allowOverAllocation) {
        throw new BadRequestException(
          `Allocated amount (₦${totalAllocated.toLocaleString()}) exceeds new income (₦${dto.totalIncome.toLocaleString()})`,
        );
      }
    }

    await this.prisma.budget.update({
      where: { id },
      data: {
        ...(dto.totalIncome !== undefined && {
          totalIncome: new Decimal(dto.totalIncome),
        }),
        ...(dto.notes !== undefined && { notes: dto.notes }),
      },
    });

    return this.findOne(userId, id);
  }

  async delete(userId: string, id: string) {
    const budget = await this.prisma.budget.findFirst({
      where: { id, userId },
    });

    if (!budget) {
      throw new NotFoundException('Budget not found');
    }

    await this.prisma.budget.delete({ where: { id } });
    return { message: 'Budget and associated expenses deleted successfully' };
  }

  async copy(userId: string, sourceBudgetId: string, dto: CopyBudgetDto) {
    const source = await this.prisma.budget.findFirst({
      where: { id: sourceBudgetId, userId },
      include: { categories: true },
    });

    if (!source) {
      throw new NotFoundException('Source budget not found');
    }

    const existing = await this.prisma.budget.findUnique({
      where: {
        userId_month_year: {
          userId,
          month: dto.targetMonth,
          year: dto.targetYear,
        },
      },
    });

    if (existing) {
      throw new ConflictException(
        `A budget for ${this.getMonthName(dto.targetMonth)} ${dto.targetYear} already exists`,
      );
    }

    const newIncome = dto.newTotalIncome !== undefined ? dto.newTotalIncome : FinancialCalc.format(source.totalIncome);

    return this.prisma.$transaction(async (tx) => {
      const newBudget = await tx.budget.create({
        data: {
          userId,
          month: dto.targetMonth,
          year: dto.targetYear,
          totalIncome: new Decimal(newIncome),
          notes: `Copied from ${this.getMonthName(source.month)} ${source.year}`,
        },
      });

      if (source.categories.length > 0) {
        await tx.budgetCategory.createMany({
          data: source.categories.map((c) => ({
            budgetId: newBudget.id,
            name: c.name,
            description: c.description,
            icon: c.icon,
            color: c.color,
            allocatedAmount: c.allocatedAmount,
            trackingType: c.trackingType,
            isSavings: c.isSavings,
          })),
        });
      }

      return this.findOne(userId, newBudget.id, tx);
    });
  }

  private getMonthName(month: number): string {
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December',
    ];
    return monthNames[month - 1] || 'Unknown';
  }
}
