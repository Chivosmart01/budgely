import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';
import { FinancialCalc } from '../common/utils/financial-calc';
import Decimal from 'decimal.js';
import { format } from 'date-fns';

@Injectable()
export class BudgetCategoriesService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, budgetId: string, dto: CreateCategoryDto) {
    const budget = await this.prisma.budget.findFirst({
      where: { id: budgetId, userId },
    });

    if (!budget) {
      throw new NotFoundException('Budget not found');
    }

    const category = await this.prisma.budgetCategory.create({
      data: {
        budgetId,
        name: dto.name.trim(),
        description: dto.description,
        icon: dto.icon || 'Receipt',
        color: dto.color || '#10B981',
        allocatedAmount: new Decimal(dto.allocatedAmount),
        trackingType: dto.trackingType || 'DAILY',
        isSavings: dto.isSavings || false,
      },
    });

    return this.findOne(userId, category.id);
  }

  async findAllByBudget(userId: string, budgetId: string) {
    const budget = await this.prisma.budget.findFirst({
      where: { id: budgetId, userId },
    });

    if (!budget) {
      throw new NotFoundException('Budget not found');
    }

    const categories = await this.prisma.budgetCategory.findMany({
      where: { budgetId },
      include: {
        expenses: {
          select: { amount: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    return categories.map((c) => {
      const allocated = FinancialCalc.format(c.allocatedAmount);
      const spent = FinancialCalc.sum(c.expenses.map((e) => e.amount));
      const remaining = FinancialCalc.subtract(allocated, spent);
      const usagePercentage = FinancialCalc.percentage(spent, allocated);
      const status = FinancialCalc.getStatus(usagePercentage);

      return {
        id: c.id,
        budgetId: c.budgetId,
        name: c.name,
        description: c.description,
        icon: c.icon,
        color: c.color,
        allocatedAmount: allocated,
        trackingType: c.trackingType,
        isSavings: c.isSavings,
        spent,
        remaining,
        usagePercentage,
        status,
        expensesCount: c.expenses.length,
        createdAt: c.createdAt,
      };
    });
  }

  async findOne(userId: string, categoryId: string) {
    const category = await this.prisma.budgetCategory.findUnique({
      where: { id: categoryId },
      include: {
        budget: true,
        expenses: {
          orderBy: { expenseDate: 'desc' },
        },
      },
    });

    if (!category || category.budget.userId !== userId) {
      throw new NotFoundException('Budget category not found');
    }

    const allocated = FinancialCalc.format(category.allocatedAmount);
    const spent = FinancialCalc.sum(category.expenses.map((e) => e.amount));
    const remaining = FinancialCalc.subtract(allocated, spent);
    const usagePercentage = FinancialCalc.percentage(spent, allocated);
    const status = FinancialCalc.getStatus(usagePercentage);

    // Group expenses by date (YYYY-MM-DD) for calendar view
    const dailyMap: Record<
      string,
      { total: number; count: number; expenses: any[] }
    > = {};

    category.expenses.forEach((e) => {
      const dateKey = format(new Date(e.expenseDate), 'yyyy-MM-dd');
      if (!dailyMap[dateKey]) {
        dailyMap[dateKey] = { total: 0, count: 0, expenses: [] };
      }
      const expAmount = FinancialCalc.format(e.amount);
      dailyMap[dateKey].total = FinancialCalc.sum([
        dailyMap[dateKey].total,
        expAmount,
      ]);
      dailyMap[dateKey].count += 1;
      dailyMap[dateKey].expenses.push({
        id: e.id,
        amount: expAmount,
        description: e.description,
        expenseDate: e.expenseDate,
        paymentMethod: e.paymentMethod,
        merchant: e.merchant,
        notes: e.notes,
        createdAt: e.createdAt,
      });
    });

    return {
      id: category.id,
      budgetId: category.budgetId,
      budgetMonth: category.budget.month,
      budgetYear: category.budget.year,
      name: category.name,
      description: category.description,
      icon: category.icon,
      color: category.color,
      allocatedAmount: allocated,
      trackingType: category.trackingType,
      isSavings: category.isSavings,
      spent,
      remaining,
      usagePercentage,
      status,
      expensesCount: category.expenses.length,
      dailyExpenses: dailyMap,
      expenses: category.expenses.map((e) => ({
        id: e.id,
        amount: FinancialCalc.format(e.amount),
        description: e.description,
        expenseDate: e.expenseDate,
        paymentMethod: e.paymentMethod,
        merchant: e.merchant,
        notes: e.notes,
        createdAt: e.createdAt,
      })),
      createdAt: category.createdAt,
    };
  }

  async update(userId: string, categoryId: string, dto: UpdateCategoryDto) {
    const category = await this.prisma.budgetCategory.findUnique({
      where: { id: categoryId },
      include: { budget: true },
    });

    if (!category || category.budget.userId !== userId) {
      throw new NotFoundException('Budget category not found');
    }

    await this.prisma.budgetCategory.update({
      where: { id: categoryId },
      data: {
        ...(dto.name !== undefined && { name: dto.name.trim() }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.icon !== undefined && { icon: dto.icon }),
        ...(dto.color !== undefined && { color: dto.color }),
        ...(dto.allocatedAmount !== undefined && {
          allocatedAmount: new Decimal(dto.allocatedAmount),
        }),
        ...(dto.trackingType !== undefined && {
          trackingType: dto.trackingType,
        }),
        ...(dto.isSavings !== undefined && { isSavings: dto.isSavings }),
      },
    });

    return this.findOne(userId, categoryId);
  }

  async delete(userId: string, categoryId: string) {
    const category = await this.prisma.budgetCategory.findUnique({
      where: { id: categoryId },
      include: { budget: true },
    });

    if (!category || category.budget.userId !== userId) {
      throw new NotFoundException('Budget category not found');
    }

    await this.prisma.budgetCategory.delete({
      where: { id: categoryId },
    });

    return { message: 'Category and associated expenses deleted successfully' };
  }
}
