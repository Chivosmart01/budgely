import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { FinancialCalc } from '../common/utils/financial-calc';
import { format } from 'date-fns';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async getMonthlyReport(userId: string, month: number, year: number) {
    const currentMonth = Number(month);
    const currentYear = Number(year);

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
              orderBy: { amount: 'desc' },
            },
          },
        },
        expenses: {
          orderBy: { amount: 'desc' },
          include: {
            category: { select: { id: true, name: true, icon: true, color: true } },
          },
        },
      },
    });

    if (!budget) {
      return {
        hasBudget: false,
        month: currentMonth,
        monthName: this.getMonthName(currentMonth),
        year: currentYear,
        message: 'No budget data available for this month',
      };
    }

    const totalIncome = FinancialCalc.format(budget.totalIncome);
    const totalAllocated = FinancialCalc.sum(
      budget.categories.map((c) => c.allocatedAmount),
    );
    const totalSpent = FinancialCalc.sum(budget.expenses.map((e) => e.amount));
    const remaining = FinancialCalc.subtract(totalIncome, totalSpent);
    const utilization = FinancialCalc.percentage(totalSpent, totalIncome);

    // Savings
    const savingsCats = budget.categories.filter((c) => c.isSavings);
    const totalSavings = FinancialCalc.sum(
      savingsCats.map((c) => c.allocatedAmount),
    );
    const savingsRate = FinancialCalc.percentage(totalSavings, totalIncome);

    // Category breakdown
    const categoryBreakdown = budget.categories.map((c) => {
      const allocated = FinancialCalc.format(c.allocatedAmount);
      const spent = FinancialCalc.sum(c.expenses.map((e) => e.amount));
      const variance = FinancialCalc.subtract(allocated, spent);
      const usagePercentage = FinancialCalc.percentage(spent, allocated);

      return {
        id: c.id,
        name: c.name,
        color: c.color,
        icon: c.icon,
        allocated,
        spent,
        variance,
        usagePercentage,
        isOverBudget: spent > allocated,
        isSavings: c.isSavings,
        expensesCount: c.expenses.length,
      };
    });

    // Top 5 largest expenses
    const topExpenses = budget.expenses.slice(0, 5).map((e) => ({
      id: e.id,
      amount: FinancialCalc.format(e.amount),
      description: e.description,
      expenseDate: e.expenseDate,
      paymentMethod: e.paymentMethod,
      merchant: e.merchant,
      category: e.category,
    }));

    // Daily spending aggregation & Highest spending days
    const dailyMap: Record<string, { date: string; amount: number; count: number }> = {};
    budget.expenses.forEach((e) => {
      const dateKey = format(new Date(e.expenseDate), 'yyyy-MM-dd');
      if (!dailyMap[dateKey]) {
        dailyMap[dateKey] = { date: dateKey, amount: 0, count: 0 };
      }
      dailyMap[dateKey].amount = FinancialCalc.sum([
        dailyMap[dateKey].amount,
        e.amount,
      ]);
      dailyMap[dateKey].count += 1;
    });

    const dailySpending = Object.values(dailyMap).sort((a, b) =>
      a.date.localeCompare(b.date),
    );

    const highestSpendingDays = [...dailySpending]
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);

    // Payment method breakdown
    const paymentMethodMap: Record<string, number> = {};
    budget.expenses.forEach((e) => {
      paymentMethodMap[e.paymentMethod] = FinancialCalc.sum([
        paymentMethodMap[e.paymentMethod] || 0,
        e.amount,
      ]);
    });

    const paymentMethods = Object.entries(paymentMethodMap).map(([method, amount]) => ({
      method,
      amount,
      percentage: FinancialCalc.percentage(amount, totalSpent),
    }));

    return {
      hasBudget: true,
      budgetId: budget.id,
      month: budget.month,
      monthName: this.getMonthName(budget.month),
      year: budget.year,
      totalIncome,
      totalAllocated,
      totalSpent,
      remaining,
      utilization,
      savings: totalSavings,
      savingsRate,
      categoryBreakdown,
      topExpenses,
      highestSpendingDays,
      dailySpending,
      paymentMethods,
    };
  }

  async getHistoricalTrends(userId: string) {
    const budgets = await this.prisma.budget.findMany({
      where: { userId },
      orderBy: [{ year: 'asc' }, { month: 'asc' }],
      include: {
        categories: {
          select: { allocatedAmount: true, isSavings: true },
        },
        expenses: {
          select: { amount: true },
        },
      },
      take: 12,
    });

    return budgets.map((b) => {
      const totalIncome = FinancialCalc.format(b.totalIncome);
      const totalSpent = FinancialCalc.sum(b.expenses.map((e) => e.amount));
      const savingsCats = b.categories.filter((c) => c.isSavings);
      const totalSavings = FinancialCalc.sum(
        savingsCats.map((c) => c.allocatedAmount),
      );

      return {
        month: b.month,
        year: b.year,
        label: `${this.getMonthName(b.month).substring(0, 3)} ${b.year}`,
        income: totalIncome,
        spent: totalSpent,
        savings: totalSavings,
        remaining: FinancialCalc.subtract(totalIncome, totalSpent),
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
