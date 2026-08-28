export type TrackingType = 'GENERAL' | 'DAILY';

export type PaymentMethod =
  | 'CASH'
  | 'BANK_TRANSFER'
  | 'DEBIT_CARD'
  | 'CREDIT_CARD'
  | 'OTHER';

export type CategoryStatus = 'HEALTHY' | 'WARNING' | 'CRITICAL' | 'OVER_BUDGET';

export interface User {
  id: string;
  email: string;
  name: string;
  currency: string;
  createdAt: string;
}

export interface BudgetCategory {
  id: string;
  budgetId: string;
  name: string;
  description?: string;
  icon: string;
  color: string;
  allocatedAmount: number;
  trackingType: TrackingType;
  isSavings: boolean;
  spent: number;
  remaining: number;
  usagePercentage: number;
  status: CategoryStatus;
  expensesCount: number;
  createdAt: string;
}

export interface Expense {
  id: string;
  budgetId: string;
  budgetMonth?: number;
  budgetYear?: number;
  budgetCategoryId: string;
  category?: {
    id: string;
    name: string;
    icon: string;
    color: string;
    allocatedAmount?: number;
  };
  amount: number;
  description: string;
  expenseDate: string;
  paymentMethod: PaymentMethod;
  merchant?: string | null;
  notes?: string | null;
  createdAt: string;
}

export interface Budget {
  id: string;
  userId: string;
  month: number;
  monthName: string;
  year: number;
  totalIncome: number;
  totalAllocated: number;
  totalSpent: number;
  remaining: number;
  utilization: number;
  unallocatedAmount: number;
  isOverAllocated: boolean;
  totalSavingsAllocated: number;
  totalSavingsSpent: number;
  savingsRate: number;
  notes?: string | null;
  categories: BudgetCategory[];
  recentExpenses: Expense[];
  createdAt: string;
  updatedAt: string;
}

export interface DashboardSummary {
  hasBudget: boolean;
  budgetId?: string;
  month: number;
  year: number;
  monthName: string;
  totalIncome: number;
  totalAllocated: number;
  totalSpent: number;
  remaining: number;
  utilization: number;
  unallocatedAmount?: number;
  isOverAllocated?: boolean;
  savings: number;
  savingsRate: number;
  categories: BudgetCategory[];
  warnings: Array<{
    type: 'warning' | 'critical' | 'over_budget';
    category: string;
    message: string;
    usagePercentage: number;
  }>;
  insights: string[];
  recentExpenses: Expense[];
}

export interface SpendingChartPoint {
  label: string;
  date: string;
  amount: number;
  dayOfWeek?: string;
  count?: number;
}

export interface CategoryBreakdownPoint {
  id: string;
  name: string;
  color: string;
  icon: string;
  amount: number;
  allocatedAmount: number;
  percentage: number;
  isSavings: boolean;
}

export interface BudgetVsActualPoint {
  id: string;
  category: string;
  color: string;
  icon: string;
  budget: number;
  actual: number;
  variance: number;
  isOverBudget: boolean;
  usagePercentage: number;
}

export interface MonthlyReport {
  hasBudget: boolean;
  budgetId?: string;
  month: number;
  monthName: string;
  year: number;
  totalIncome: number;
  totalAllocated: number;
  totalSpent: number;
  remaining: number;
  utilization: number;
  savings: number;
  savingsRate: number;
  categoryBreakdown: Array<{
    id: string;
    name: string;
    color: string;
    icon: string;
    allocated: number;
    spent: number;
    variance: number;
    usagePercentage: number;
    isOverBudget: boolean;
    isSavings: boolean;
    expensesCount: number;
  }>;
  topExpenses: Array<{
    id: string;
    amount: number;
    description: string;
    expenseDate: string;
    paymentMethod: PaymentMethod;
    merchant?: string;
    category?: { id: string; name: string; icon: string; color: string };
  }>;
  highestSpendingDays: Array<{
    date: string;
    amount: number;
    count: number;
  }>;
  dailySpending: Array<{
    date: string;
    amount: number;
    count: number;
  }>;
  paymentMethods: Array<{
    method: string;
    amount: number;
    percentage: number;
  }>;
  message?: string;
}

export interface DailyExpenseData {
  total: number;
  count: number;
  expenses?: Expense[];
}

