'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Button,
  Card,
  CardContent,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Tooltip,
  Skeleton,
  useTheme,
} from '@mui/material';
import {
  AccountBalanceWallet,
  PieChart as PieChartIcon,
  TrendingDown,
  Savings as SavingsIcon,
  Percent,
  Add,
  ArrowForward,
  WarningAmber,
  CheckCircleOutline,
  AutoAwesome,
  CalendarMonth,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useBudgetStore } from '../../../stores/budgetStore';
import { apiClient } from '../../../lib/api-client';
import {
  DashboardSummary,
  SpendingChartPoint,
  CategoryBreakdownPoint,
  BudgetVsActualPoint,
} from '../../../types';
import { formatNaira, getMonthName } from '../../../lib/formatters';
import { getCategoryIcon } from '../../../lib/icons';
import { StatCard } from '../../../components/ui/StatCard';
import { ProgressBar } from '../../../components/ui/ProgressBar';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { EmptyState } from '../../../components/ui/EmptyState';
import { ExpenseBarChart } from '../../../components/charts/ExpenseBarChart';
import { CategoryDonutChart } from '../../../components/charts/CategoryDonutChart';
import { BudgetVsActualChart } from '../../../components/charts/BudgetVsActualChart';
import { CreateBudgetDialog } from '../../../components/dialogs/CreateBudgetDialog';

export default function DashboardPage() {
  const theme = useTheme();
  const router = useRouter();
  const { selectedMonth, selectedYear, refreshTrigger, triggerRefresh } = useBudgetStore();

  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [spendingChartData, setSpendingChartData] = useState<SpendingChartPoint[]>([]);
  const [categoryBreakdown, setCategoryBreakdown] = useState<CategoryBreakdownPoint[]>([]);
  const [budgetVsActual, setBudgetVsActual] = useState<BudgetVsActualPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Chart filter states
  const [timeframe, setTimeframe] = useState('this_month');
  const [view, setView] = useState('daily');
  const [categoryId, setCategoryId] = useState('all');

  // Dialogs
  const [isCreateBudgetOpen, setIsCreateBudgetOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    const fetchData = async () => {
      try {
        const [sumRes, chartRes, catRes, bvaRes]: any[] = await Promise.all([
          apiClient.get(`/dashboard/summary?month=${selectedMonth}&year=${selectedYear}`),
          apiClient.get(
            `/dashboard/spending-chart?timeframe=${timeframe}&view=${view}&categoryId=${categoryId}&month=${selectedMonth}&year=${selectedYear}`,
          ),
          apiClient.get(`/dashboard/category-breakdown?month=${selectedMonth}&year=${selectedYear}`),
          apiClient.get(`/dashboard/budget-vs-actual?month=${selectedMonth}&year=${selectedYear}`),
        ]);

        if (isMounted) {
          setSummary(sumRes.data);
          setSpendingChartData(chartRes.data || []);
          setCategoryBreakdown(catRes.data || []);
          setBudgetVsActual(bvaRes.data || []);
        }
      } catch (err) {
        console.error('Failed to load dashboard data', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchData();
    return () => {
      isMounted = false;
    };
  }, [selectedMonth, selectedYear, timeframe, view, categoryId, refreshTrigger]);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Skeleton variant="rectangular" height={40} width={240} sx={{ borderRadius: 2 }} />
        <Grid container spacing={2.5}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Grid item xs={12} sm={6} md={4} lg={2} key={i}>
              <Skeleton variant="rectangular" height={130} sx={{ borderRadius: 4 }} />
            </Grid>
          ))}
        </Grid>
        <Skeleton variant="rectangular" height={320} sx={{ borderRadius: 4 }} />
      </Box>
    );
  }

  const hasBudget = summary?.hasBudget;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Page Title & Status Banner */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight={800} sx={{ letterSpacing: '-0.02em' }}>
            {getMonthName(selectedMonth)} {selectedYear} Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Overview of your monthly salary allocations, daily expenses, and savings targets
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
          {hasBudget && (
            <Button
              variant="outlined"
              size="medium"
              endIcon={<ArrowForward />}
              onClick={() => router.push('/categories')}
            >
              Category Allocations
            </Button>
          )}

          {!hasBudget && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<Add />}
              onClick={() => setIsCreateBudgetOpen(true)}
              sx={{ fontWeight: 700 }}
            >
              Create {getMonthName(selectedMonth)} Budget
            </Button>
          )}
        </Box>
      </Box>

      {/* Top Warnings Banners */}
      {summary?.warnings && summary.warnings.length > 0 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {summary.warnings.map((w, idx) => (
            <Alert
              key={idx}
              severity={w.type === 'over_budget' ? 'error' : w.type === 'critical' ? 'error' : 'warning'}
              icon={<WarningAmber />}
              sx={{ borderRadius: 3, fontWeight: 600 }}
            >
              {w.message}
            </Alert>
          ))}
        </Box>
      )}


      {/* 6 Top Summary Cards */}
      <Grid container spacing={2.5}>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <StatCard
            title="Monthly Income"
            value={formatNaira(summary?.totalIncome || 0)}
            subtitle="Salary & earnings"
            icon={<AccountBalanceWallet />}
            color="#10B981"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={4} lg={2}>
          <StatCard
            title="Total Allocated"
            value={formatNaira(summary?.totalAllocated || 0)}
            subtitle={
              summary?.isOverAllocated
                ? 'Over-allocated'
                : `${summary?.unallocatedAmount ? formatNaira(summary.unallocatedAmount) : '₦0'} unallocated`
            }
            icon={<PieChartIcon />}
            color="#6366F1"
            badgeText={summary?.isOverAllocated ? 'Warning' : undefined}
            badgeColor="error"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={4} lg={2}>
          <StatCard
            title="Total Spent"
            value={formatNaira(summary?.totalSpent || 0)}
            subtitle={`${(summary?.utilization || 0).toFixed(1)}% of income`}
            icon={<TrendingDown />}
            color="#EF4444"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={4} lg={2}>
          <StatCard
            title="Remaining Budget"
            value={formatNaira(summary?.remaining || 0)}
            subtitle="Unspent balance"
            icon={<CheckCircleOutline />}
            color="#14B8A6"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={4} lg={2}>
          <StatCard
            title="Savings Target"
            value={formatNaira(summary?.savings || 0)}
            subtitle="Allocated to wealth"
            icon={<SavingsIcon />}
            color="#F59E0B"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={4} lg={2}>
          <StatCard
            title="Savings Rate"
            value={`${(summary?.savingsRate || 0).toFixed(1)}%`}
            subtitle="Of monthly income"
            icon={<Percent />}
            color="#8B5CF6"
            badgeText={summary?.savingsRate && summary.savingsRate >= 30 ? 'High' : undefined}
            badgeColor="success"
          />
        </Grid>
      </Grid>

      {/* No Budget State */}
      {!hasBudget ? (
        <EmptyState
          icon={<CalendarMonth sx={{ fontSize: 32 }} />}
          title={`No budget created for ${getMonthName(selectedMonth)} ${selectedYear}`}
          description="Start by defining your salary and allocating it into budget categories (Savings, Car, Daily Expenses, Bills, etc.)."
          actionText={`Create ${getMonthName(selectedMonth)} Budget`}
          onAction={() => setIsCreateBudgetOpen(true)}
        />
      ) : (
        <>
          {/* Interactive Spending Bar Chart */}
          <ExpenseBarChart
            data={spendingChartData}
            categories={summary?.categories || []}
            timeframe={timeframe}
            view={view}
            categoryId={categoryId}
            onTimeframeChange={setTimeframe}
            onViewChange={setView}
            onCategoryChange={setCategoryId}
          />

          {/* Side-by-side: Donut Chart & Budget vs Actual Chart */}
          <Grid container spacing={3}>
            <Grid item xs={12} lg={5}>
              <CategoryDonutChart data={categoryBreakdown} />
            </Grid>
            <Grid item xs={12} lg={7}>
              <BudgetVsActualChart data={budgetVsActual} />
            </Grid>
          </Grid>

          {/* Recent Expenses List */}
          {summary?.recentExpenses && summary.recentExpenses.length > 0 && (
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Box>
                    <Typography variant="h6" fontWeight={700}>
                      Recent Daily Expenses
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Last transactions recorded for this month
                    </Typography>
                  </Box>

                  <Button
                    variant="outlined"
                    size="small"
                    endIcon={<ArrowForward />}
                    onClick={() => router.push('/expenses')}
                  >
                    View All Expenses
                  </Button>
                </Box>

                <Grid container spacing={1.5}>
                  {summary.recentExpenses.slice(0, 6).map((exp) => (
                    <Grid item xs={12} sm={6} md={4} key={exp.id}>
                      <Card
                        variant="outlined"
                        sx={{
                          p: 2,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          borderRadius: 3,
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Box
                            sx={{
                              width: 36,
                              height: 36,
                              borderRadius: 2,
                              backgroundColor: `${exp.category?.color || '#10B981'}20`,
                              color: exp.category?.color || '#10B981',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            {getCategoryIcon(exp.category?.icon, 'small')}
                          </Box>
                          <Box>
                            <Typography variant="subtitle2" fontWeight={700} noWrap sx={{ maxWidth: 140 }}>
                              {exp.description}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {new Date(exp.expenseDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} • {exp.category?.name}
                            </Typography>
                          </Box>
                        </Box>
                        <Typography variant="subtitle2" fontWeight={700} color="error.main">
                          -{formatNaira(exp.amount)}
                        </Typography>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Create Budget Modal */}
      <CreateBudgetDialog
        open={isCreateBudgetOpen}
        initialMonth={selectedMonth}
        initialYear={selectedYear}
        onClose={() => setIsCreateBudgetOpen(false)}
        onSuccess={() => {
          triggerRefresh();
        }}
      />
    </Box>
  );
}
