import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { FinancialCalc } from '../common/utils/financial-calc';
import {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  subMonths,
  startOfYear,
  endOfYear,
  format,
  eachDayOfInterval,
  eachWeekOfInterval,
  eachMonthOfInterval,
} from 'date-fns';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getSummary(userId: string, month?: number, year?: number) {
    const now = new Date();
    const currentMonth = month ? Number(month) : now.getMonth() + 1;
    const currentYear = year ? Number(year) : now.getFullYear();

    const budget = await this.prisma.budget.findUnique({
      where: {
        userId_month_year: {
          userId,
          month: currentMonth,
          year: currentYear,
        },
      },
      include: {
        categories: {
          include: {
            expenses: {
              select: { amount: true },
            },
          },
          orderBy: { name: 'asc' },
        },
        expenses: {
          orderBy: { expenseDate: 'desc' },
          take: 8,
          include: {
            category: {
              select: { id: true, name: true, icon: true, color: true },
            },
          },
        },
      },
    });

    if (!budget) {
      return {
        hasBudget: false,
        month: currentMonth,
        year: currentYear,
        monthName: this.getMonthName(currentMonth),
        totalIncome: 0,
        totalAllocated: 0,
        totalSpent: 0,
        remaining: 0,
        utilization: 0,
        savings: 0,
        savingsRate: 0,
        categories: [],
        warnings: [],
        insights: [
          `You have not created a budget for ${this.getMonthName(currentMonth)} ${currentYear} yet. Click "Create Budget" to allocate your income.`,
        ],
        recentExpenses: [],
      };
    }

    const totalIncome = FinancialCalc.format(budget.totalIncome);
    const totalAllocated = FinancialCalc.sum(
      budget.categories.map((c) => c.allocatedAmount),
    );
    const totalSpent = FinancialCalc.sum(
      budget.categories.flatMap((c) => c.expenses.map((e) => e.amount)),
    );
    const remaining = FinancialCalc.subtract(totalIncome, totalSpent);
    const utilization = FinancialCalc.percentage(totalSpent, totalIncome);

    // Savings calculation
    const savingsCats = budget.categories.filter((c) => c.isSavings);
    const totalSavings = FinancialCalc.sum(
      savingsCats.map((c) => c.allocatedAmount),
    );
    const savingsRate = FinancialCalc.percentage(totalSavings, totalIncome);

    // Categorized breakdown and warnings
    const warnings: Array<{
      type: 'warning' | 'critical' | 'over_budget';
      category: string;
      message: string;
      usagePercentage: number;
    }> = [];

    const categories = budget.categories.map((cat) => {
      const allocated = FinancialCalc.format(cat.allocatedAmount);
      const spent = FinancialCalc.sum(cat.expenses.map((e) => e.amount));
      const catRemaining = FinancialCalc.subtract(allocated, spent);
      const usagePercentage = FinancialCalc.percentage(spent, allocated);
      const status = FinancialCalc.getStatus(usagePercentage);

      if (status === 'OVER_BUDGET') {
        const overAmount = FinancialCalc.subtract(spent, allocated);
        warnings.push({
          type: 'over_budget',
          category: cat.name,
          message: `${cat.name} is over budget by ₦${overAmount.toLocaleString()} (${usagePercentage}% used)`,
          usagePercentage,
        });
      } else if (status === 'CRITICAL') {
        warnings.push({
          type: 'critical',
          category: cat.name,
          message: `${cat.name} has reached ${usagePercentage}% of allocated budget`,
          usagePercentage,
        });
      } else if (status === 'WARNING') {
        warnings.push({
          type: 'warning',
          category: cat.name,
          message: `${cat.name} is at ${usagePercentage}% of allocated budget`,
          usagePercentage,
        });
      }

      return {
        id: cat.id,
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
      };
    });

    // Dynamic smart insights
    const insights: string[] = [];
    if (savingsRate >= 30) {
      insights.push(`Excellent work! You have allocated ${savingsRate}% of your income to savings.`);
    } else if (savingsRate > 0) {
      insights.push(`You have allocated ₦${totalSavings.toLocaleString()} (${savingsRate}%) to savings this month.`);
    }

    if (utilization <= 50 && totalSpent > 0) {
      insights.push(`Spending is well controlled: only ${utilization}% of monthly income has been spent.`);
    } else if (utilization >= 90) {
      insights.push(`Caution: You have utilized ${utilization}% of your total income for the month.`);
    }

    // Top spending category
    const nonSavings = categories.filter((c) => !c.isSavings && c.spent > 0);
    if (nonSavings.length > 0) {
      const topCat = nonSavings.reduce((prev, current) =>
        prev.spent > current.spent ? prev : current,
      );
      insights.push(`${topCat.name} is your highest spending category at ₦${topCat.spent.toLocaleString()} (${topCat.usagePercentage}% of its limit).`);
    }

    return {
      hasBudget: true,
      budgetId: budget.id,
      month: budget.month,
      year: budget.year,
      monthName: this.getMonthName(budget.month),
      totalIncome,
      totalAllocated,
      totalSpent,
      remaining,
      utilization,
      unallocatedAmount: FinancialCalc.subtract(totalIncome, totalAllocated),
      isOverAllocated: totalAllocated > totalIncome,
      savings: totalSavings,
      savingsRate,
      categories,
      warnings,
      insights,
      recentExpenses: budget.expenses.map((e) => ({
        id: e.id,
        amount: FinancialCalc.format(e.amount),
        description: e.description,
        expenseDate: e.expenseDate,
        paymentMethod: e.paymentMethod,
        merchant: e.merchant,
        notes: e.notes,
        category: e.category,
      })),
    };
  }

  async getSpendingChart(
    userId: string,
    params: {
      timeframe?: string;
      categoryId?: string;
      view?: string;
      month?: number;
      year?: number;
      startDate?: string;
      endDate?: string;
    },
  ) {
    const now = new Date();
    const timeframe = params.timeframe || 'this_month';
    const view = params.view || 'daily';

    let start: Date;
    let end: Date;

    if (params.startDate && params.endDate) {
      start = startOfDay(new Date(params.startDate));
      end = endOfDay(new Date(params.endDate));
    } else {
      switch (timeframe) {
        case 'today':
          start = startOfDay(now);
          end = endOfDay(now);
          break;
        case 'this_week':
          start = startOfWeek(now, { weekStartsOn: 1 });
          end = endOfWeek(now, { weekStartsOn: 1 });
          break;
        case 'this_month': {
          const targetMonth = params.month ? Number(params.month) - 1 : now.getMonth();
          const targetYear = params.year ? Number(params.year) : now.getFullYear();
          const refDate = new Date(targetYear, targetMonth, 1);
          start = startOfMonth(refDate);
          end = endOfMonth(refDate);
          break;
        }
        case 'last_month': {
          const prev = subMonths(now, 1);
          start = startOfMonth(prev);
          end = endOfMonth(prev);
          break;
        }
        case 'last_3_months':
          start = startOfMonth(subMonths(now, 2));
          end = endOfMonth(now);
          break;
        case 'last_6_months':
          start = startOfMonth(subMonths(now, 5));
          end = endOfMonth(now);
          break;
        case 'this_year':
          start = startOfYear(now);
          end = endOfYear(now);
          break;
        default:
          start = startOfMonth(now);
          end = endOfMonth(now);
      }
    }

    const where: any = {
      userId,
      expenseDate: {
        gte: start,
        lte: end,
      },
    };

    if (params.categoryId && params.categoryId !== 'all') {
      where.budgetCategoryId = params.categoryId;
    }

    const expenses = await this.prisma.expense.findMany({
      where,
      orderBy: { expenseDate: 'asc' },
    });

    if (view === 'monthly' || timeframe === 'last_6_months' || timeframe === 'this_year') {
      const months = eachMonthOfInterval({ start, end });
      return months.map((m) => {
        const monthStart = startOfMonth(m);
        const monthEnd = endOfMonth(m);
        const monthExps = expenses.filter((e) => {
          const d = new Date(e.expenseDate);
          return d >= monthStart && d <= monthEnd;
        });
        const total = FinancialCalc.sum(monthExps.map((e) => e.amount));
        return {
          label: format(m, 'MMM yyyy'),
          date: format(m, 'yyyy-MM'),
          amount: total,
          count: monthExps.length,
        };
      });
    }

    if (view === 'weekly') {
      const weeks = eachWeekOfInterval({ start, end }, { weekStartsOn: 1 });
      return weeks.map((w, idx) => {
        const wStart = startOfWeek(w, { weekStartsOn: 1 });
        const wEnd = endOfWeek(w, { weekStartsOn: 1 });
        const weekExps = expenses.filter((e) => {
          const d = new Date(e.expenseDate);
          return d >= wStart && d <= wEnd;
        });
        const total = FinancialCalc.sum(weekExps.map((e) => e.amount));
        return {
          label: `Week ${idx + 1} (${format(wStart, 'MMM d')})`,
          date: format(wStart, 'yyyy-MM-dd'),
          amount: total,
          count: weekExps.length,
        };
      });
    }

    // Default: daily
    const days = eachDayOfInterval({ start, end });
    return days.map((d) => {
      const dKey = format(d, 'yyyy-MM-dd');
      const dayExps = expenses.filter(
        (e) => format(new Date(e.expenseDate), 'yyyy-MM-dd') === dKey,
      );
      const total = FinancialCalc.sum(dayExps.map((e) => e.amount));
      return {
        label: format(d, 'MMM d'),
        date: dKey,
        dayOfWeek: format(d, 'EEE'),
        amount: total,
        count: dayExps.length,
      };
    });
  }

  async getCategoryBreakdown(userId: string, month?: number, year?: number) {
    const now = new Date();
    const currentMonth = month ? Number(month) : now.getMonth() + 1;
    const currentYear = year ? Number(year) : now.getFullYear();

    const budget = await this.prisma.budget.findUnique({
      where: {
        userId_month_year: {
          userId,
          month: currentMonth,
          year: currentYear,
        },
      },
      include: {
        categories: {
          include: {
            expenses: { select: { amount: true } },
          },
        },
      },
    });

    if (!budget) {
      return [];
    }

    const totalSpent = FinancialCalc.sum(
      budget.categories.flatMap((c) => c.expenses.map((e) => e.amount)),
    );

    return budget.categories.map((c) => {
      const spent = FinancialCalc.sum(c.expenses.map((e) => e.amount));
      const percentage = FinancialCalc.percentage(spent, totalSpent);
      return {
        id: c.id,
        name: c.name,
        color: c.color,
        icon: c.icon,
        amount: spent,
        allocatedAmount: FinancialCalc.format(c.allocatedAmount),
        percentage,
        isSavings: c.isSavings,
      };
    });
  }

  async getBudgetVsActual(userId: string, month?: number, year?: number) {
    const now = new Date();
    const currentMonth = month ? Number(month) : now.getMonth() + 1;
    const currentYear = year ? Number(year) : now.getFullYear();

    const budget = await this.prisma.budget.findUnique({
      where: {
        userId_month_year: {
          userId,
          month: currentMonth,
          year: currentYear,
        },
      },
      include: {
        categories: {
          include: {
            expenses: { select: { amount: true } },
          },
          orderBy: { name: 'asc' },
        },
      },
    });

    if (!budget) {
      return [];
    }

    return budget.categories.map((c) => {
      const allocated = FinancialCalc.format(c.allocatedAmount);
      const spent = FinancialCalc.sum(c.expenses.map((e) => e.amount));
      const variance = FinancialCalc.subtract(allocated, spent);
      const isOverBudget = spent > allocated;

      return {
        id: c.id,
        category: c.name,
        color: c.color,
        icon: c.icon,
        budget: allocated,
        actual: spent,
        variance,
        isOverBudget,
        usagePercentage: FinancialCalc.percentage(spent, allocated),
      };
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
