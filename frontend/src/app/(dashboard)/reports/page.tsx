'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Chip,
  Skeleton,
  useTheme,
} from '@mui/material';
import {
  AccountBalanceWallet,
  TrendingDown,
  CheckCircleOutline,
  Savings as SavingsIcon,
} from '@mui/icons-material';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import { useBudgetStore } from '../../../stores/budgetStore';
import { apiClient } from '../../../lib/api-client';
import { MonthlyReport } from '../../../types';
import { formatNaira, getMonthName } from '../../../lib/formatters';
import { getCategoryIcon } from '../../../lib/icons';
import { StatCard } from '../../../components/ui/StatCard';
import { format } from 'date-fns';

export default function ReportsPage() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { selectedMonth, selectedYear, refreshTrigger } = useBudgetStore();

  const [report, setReport] = useState<MonthlyReport | null>(null);
  const [historicalTrends, setHistoricalTrends] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    Promise.all([
      apiClient.get(`/reports/monthly?month=${selectedMonth}&year=${selectedYear}`),
      apiClient.get('/reports/historical'),
    ])
      .then(([repRes, histRes]: any[]) => {
        setReport(repRes.data);
        setHistoricalTrends(histRes.data || []);
      })
      .catch((err) => console.error('Failed to load reports', err))
      .finally(() => setIsLoading(false));
  }, [selectedMonth, selectedYear, refreshTrigger]);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Skeleton variant="rectangular" height={40} width={240} sx={{ borderRadius: 2 }} />
        <Grid container spacing={3}>
          {[1, 2, 3, 4].map((i) => (
            <Grid item xs={12} sm={6} md={3} key={i}>
              <Skeleton variant="rectangular" height={130} sx={{ borderRadius: 4 }} />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Title */}
      <Box>
        <Typography variant="h4" fontWeight={800} sx={{ letterSpacing: '-0.02em' }}>
          Financial Reports & Trends
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Deep-dive analysis of your spending patterns for {getMonthName(selectedMonth)} {selectedYear}
        </Typography>
      </Box>

      {/* Summary KPI Cards */}
      <Grid container spacing={2.5}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Monthly Income"
            value={formatNaira(report?.totalIncome || 0)}
            subtitle="Salary & inflows"
            icon={<AccountBalanceWallet />}
            color="#10B981"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Spent"
            value={formatNaira(report?.totalSpent || 0)}
            subtitle={`${(report?.utilization || 0).toFixed(1)}% utilized`}
            icon={<TrendingDown />}
            color="#EF4444"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Net Remaining"
            value={formatNaira(report?.remaining || 0)}
            subtitle="Unspent earnings"
            icon={<CheckCircleOutline />}
            color="#14B8A6"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Savings Rate"
            value={`${(report?.savingsRate || 0).toFixed(1)}%`}
            subtitle={`Allocated: ${formatNaira(report?.savings || 0)}`}
            icon={<SavingsIcon />}
            color="#8B5CF6"
          />
        </Grid>
      </Grid>

      {/* Historical Multi-Month Trend Area Chart */}
      <Card>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ mb: 2 }}>
            <Typography variant="h6" fontWeight={700}>
              Historical Income vs Spending Trends
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Month-over-month view of your earnings, expenditures, and wealth accumulation
            </Typography>
          </Box>

          <Box sx={{ width: '100%', height: 320 }}>
            {historicalTrends.length === 0 ? (
              <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  No historical multi-month records yet.
                </Typography>
              </Box>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={historicalTrends} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)'} vertical={false} />
                  <XAxis dataKey="label" stroke={isDark ? '#9CA3AF' : '#64748B'} fontSize={12} tickLine={false} />
                  <YAxis
                    stroke={isDark ? '#9CA3AF' : '#64748B'}
                    fontSize={11}
                    tickLine={false}
                    tickFormatter={(val) => `₦${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
                  />
                  <Tooltip formatter={(value: any) => formatNaira(value)} />
                  <Legend />
                  <Area type="monotone" name="Monthly Income" dataKey="income" stroke="#10B981" strokeWidth={2.5} fill="#10B981" fillOpacity={0.15} />
                  <Area type="monotone" name="Total Spent" dataKey="spent" stroke="#EF4444" strokeWidth={2.5} fill="#EF4444" fillOpacity={0.15} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Grid: Category Breakdown Table & Top Expenses + Highest Days */}
      <Grid container spacing={3}>
        {/* Category Breakdown Table */}
        <Grid item xs={12} lg={7}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={700} gutterBottom>
                Category Performance & Variances
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                Planned allocations vs actual expenditures
              </Typography>

              <Table size="medium">
                <TableHead>
                  <TableRow>
                    <TableCell>Category</TableCell>
                    <TableCell align="right">Budgeted</TableCell>
                    <TableCell align="right">Actual</TableCell>
                    <TableCell align="right">Variance</TableCell>
                    <TableCell align="center">Usage</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {report?.categoryBreakdown?.map((cat) => (
                    <TableRow key={cat.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box sx={{ color: cat.color }}>{getCategoryIcon(cat.icon, 'small')}</Box>
                          <Typography variant="body2" fontWeight={600}>
                            {cat.name}
                          </Typography>
                          {cat.isSavings && <Chip label="Savings" size="small" color="success" sx={{ height: 18, fontSize: '0.65rem' }} />}
                        </Box>
                      </TableCell>
                      <TableCell align="right">{formatNaira(cat.allocated)}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700, color: cat.isOverBudget ? 'error.main' : 'text.primary' }}>
                        {formatNaira(cat.spent)}
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700, color: cat.variance < 0 ? 'error.main' : 'success.main' }}>
                        {formatNaira(cat.variance)}
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={`${cat.usagePercentage.toFixed(0)}%`}
                          size="small"
                          color={cat.isOverBudget ? 'error' : cat.usagePercentage >= 90 ? 'error' : cat.usagePercentage >= 70 ? 'warning' : 'success'}
                          variant={cat.isOverBudget ? 'filled' : 'outlined'}
                          sx={{ fontWeight: 700 }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </Grid>

        {/* Side Column: Highest Spending Days & Largest Expenses */}
        <Grid item xs={12} lg={5}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Highest Spending Days */}
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={700} gutterBottom>
                  Highest Spending Days
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mt: 2 }}>
                  {report?.highestSpendingDays?.slice(0, 4).map((d) => (
                    <Box
                      key={d.date}
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <Box>
                        <Typography variant="body2" fontWeight={700}>
                          {format(new Date(d.date), 'EEEE, MMMM d')}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {d.count} transaction{d.count > 1 ? 's' : ''}
                        </Typography>
                      </Box>
                      <Typography variant="subtitle2" fontWeight={800} color="error.main">
                        -{formatNaira(d.amount)}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>

            {/* Top 5 Largest Expenses */}
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={700} gutterBottom>
                  Top 5 Largest Expenses
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mt: 2 }}>
                  {report?.topExpenses?.map((e) => (
                    <Box
                      key={e.id}
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box sx={{ color: e.category?.color || 'primary.main' }}>
                          {getCategoryIcon(e.category?.icon, 'small')}
                        </Box>
                        <Box>
                          <Typography variant="body2" fontWeight={700} noWrap sx={{ maxWidth: 140 }}>
                            {e.description}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {format(new Date(e.expenseDate), 'MMM d')} • {e.category?.name}
                          </Typography>
                        </Box>
                      </Box>
                      <Typography variant="subtitle2" fontWeight={800} color="error.main">
                        -{formatNaira(e.amount)}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}
