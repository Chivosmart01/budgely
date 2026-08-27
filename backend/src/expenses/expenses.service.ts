import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import {
  CreateExpenseDto,
  UpdateExpenseDto,
  QueryExpenseDto,
} from './dto/expense.dto';
import { FinancialCalc } from '../common/utils/financial-calc';
import Decimal from 'decimal.js';
import { format } from 'date-fns';

@Injectable()
export class ExpensesService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateExpenseDto) {
    // 1. Verify budget belongs to user
    const budget = await this.prisma.budget.findFirst({
      where: { id: dto.budgetId, userId },
    });

    if (!budget) {
      throw new NotFoundException('Budget not found');
    }

    // 2. Verify category belongs to this budget
    const category = await this.prisma.budgetCategory.findFirst({
      where: { id: dto.budgetCategoryId, budgetId: dto.budgetId },
    });

    if (!category) {
      throw new BadRequestException(
        'The specified category does not belong to the selected budget',
      );
    }

    const expense = await this.prisma.expense.create({
      data: {
        userId,
        budgetId: dto.budgetId,
        budgetCategoryId: dto.budgetCategoryId,
        amount: new Decimal(dto.amount),
        description: dto.description.trim(),
        expenseDate: new Date(dto.expenseDate),
        paymentMethod: dto.paymentMethod || 'CASH',
        merchant: dto.merchant ? dto.merchant.trim() : null,
        notes: dto.notes ? dto.notes.trim() : null,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            icon: true,
            color: true,
            allocatedAmount: true,
          },
        },
      },
    });

    return {
      ...expense,
      amount: FinancialCalc.format(expense.amount),
      category: {
        ...expense.category,
        allocatedAmount: FinancialCalc.format(expense.category.allocatedAmount),
      },
    };
  }

  async findAll(userId: string, query: QueryExpenseDto) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;
    const skip = (page - 1) * limit;

    const where: any = { userId };

    if (query.budgetId) {
      where.budgetId = query.budgetId;
    }

    if (query.budgetCategoryId) {
      where.budgetCategoryId = query.budgetCategoryId;
    }

    if (query.paymentMethod) {
      where.paymentMethod = query.paymentMethod;
    }

    if (query.startDate || query.endDate) {
      where.expenseDate = {};
      if (query.startDate) {
        where.expenseDate.gte = new Date(query.startDate);
      }
      if (query.endDate) {
        where.expenseDate.lte = new Date(query.endDate);
      }
    }

    if (query.search) {
      where.OR = [
        { description: { contains: query.search, mode: 'insensitive' } },
        { merchant: { contains: query.search, mode: 'insensitive' } },
        { notes: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const sortBy = query.sortBy || 'expenseDate';
    const sortOrder = query.sortOrder || 'desc';

    const [totalCount, expenses, totalSum] = await Promise.all([
      this.prisma.expense.count({ where }),
      this.prisma.expense.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          category: {
            select: {
              id: true,
              name: true,
              icon: true,
              color: true,
            },
          },
          budget: {
            select: {
              id: true,
              month: true,
              year: true,
            },
          },
        },
      }),
      this.prisma.expense.aggregate({
        where,
        _sum: { amount: true },
      }),
    ]);

    const totalAmount = FinancialCalc.format(totalSum._sum.amount);

    return {
      data: expenses.map((e) => ({
        id: e.id,
        budgetId: e.budgetId,
        budgetMonth: e.budget.month,
        budgetYear: e.budget.year,
        budgetCategoryId: e.budgetCategoryId,
        category: e.category,
        amount: FinancialCalc.format(e.amount),
        description: e.description,
        expenseDate: e.expenseDate,
        paymentMethod: e.paymentMethod,
        merchant: e.merchant,
        notes: e.notes,
        createdAt: e.createdAt,
      })),
      meta: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        totalAmount,
      },
    };
  }

  async getDailyCalendar(
    userId: string,
    budgetId: string,
    categoryId?: string,
  ) {
    const budget = await this.prisma.budget.findFirst({
      where: { id: budgetId, userId },
      include: {
        categories: true,
      },
    });

    if (!budget) {
      throw new NotFoundException('Budget not found');
    }

    const where: any = { userId, budgetId };
    if (categoryId) {
      where.budgetCategoryId = categoryId;
    }

    const expenses = await this.prisma.expense.findMany({
      where,
      orderBy: { expenseDate: 'asc' },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            icon: true,
            color: true,
          },
        },
      },
    });

    const dailyMap: Record<
      string,
      { total: number; count: number; expenses: any[] }
    > = {};

    expenses.forEach((e) => {
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
        category: e.category,
        createdAt: e.createdAt,
      });
    });

    const totalSpent = FinancialCalc.sum(expenses.map((e) => e.amount));

    return {
      budgetId: budget.id,
      month: budget.month,
      year: budget.year,
      categoryId: categoryId || null,
      totalSpent,
      dailyExpenses: dailyMap,
    };
  }

  async findOne(userId: string, id: string) {
    const expense = await this.prisma.expense.findFirst({
      where: { id, userId },
      include: {
        category: true,
        budget: true,
      },
    });

    if (!expense) {
      throw new NotFoundException('Expense not found');
    }

    return {
      ...expense,
      amount: FinancialCalc.format(expense.amount),
      category: {
        ...expense.category,
        allocatedAmount: FinancialCalc.format(expense.category.allocatedAmount),
      },
    };
  }

  async update(userId: string, id: string, dto: UpdateExpenseDto) {
    const expense = await this.prisma.expense.findFirst({
      where: { id, userId },
    });

    if (!expense) {
      throw new NotFoundException('Expense not found');
    }

    if (dto.budgetCategoryId) {
      const category = await this.prisma.budgetCategory.findFirst({
        where: { id: dto.budgetCategoryId, budgetId: expense.budgetId },
      });
      if (!category) {
        throw new BadRequestException(
          'Target category does not belong to the expense budget',
        );
      }
    }

    const updated = await this.prisma.expense.update({
      where: { id },
      data: {
        ...(dto.budgetCategoryId && {
          budgetCategoryId: dto.budgetCategoryId,
        }),
        ...(dto.amount !== undefined && {
          amount: new Decimal(dto.amount),
        }),
        ...(dto.description !== undefined && {
          description: dto.description.trim(),
        }),
        ...(dto.expenseDate !== undefined && {
          expenseDate: new Date(dto.expenseDate),
        }),
        ...(dto.paymentMethod !== undefined && {
          paymentMethod: dto.paymentMethod,
        }),
        ...(dto.merchant !== undefined && {
          merchant: dto.merchant ? dto.merchant.trim() : null,
        }),
        ...(dto.notes !== undefined && {
          notes: dto.notes ? dto.notes.trim() : null,
        }),
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            icon: true,
            color: true,
            allocatedAmount: true,
          },
        },
      },
    });

    return {
      ...updated,
      amount: FinancialCalc.format(updated.amount),
      category: {
        ...updated.category,
        allocatedAmount: FinancialCalc.format(updated.category.allocatedAmount),
      },
    };
  }

  async delete(userId: string, id: string) {
    const expense = await this.prisma.expense.findFirst({
      where: { id, userId },
    });

    if (!expense) {
      throw new NotFoundException('Expense not found');
    }

    await this.prisma.expense.delete({ where: { id } });
    return { message: 'Expense deleted successfully' };
  }
}
