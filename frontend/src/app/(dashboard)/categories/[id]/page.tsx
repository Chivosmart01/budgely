'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Button,
  Card,
  CardContent,
  IconButton,
  Skeleton,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  useTheme,
} from '@mui/material';
import {
  ArrowBack,
  Add,
  DeleteOutline,
  Edit,
  AccountBalanceWallet,
  TrendingDown,
  CheckCircleOutline,
  Percent,
} from '@mui/icons-material';
import { useParams, useRouter } from 'next/navigation';
import { apiClient } from '../../../../lib/api-client';
import { BudgetCategory, Expense } from '../../../../types';
import { formatNaira, getMonthName } from '../../../../lib/formatters';
import { getCategoryIcon } from '../../../../lib/icons';
import { StatCard } from '../../../../components/ui/StatCard';
import { ProgressBar } from '../../../../components/ui/ProgressBar';
import { StatusBadge } from '../../../../components/ui/StatusBadge';
import { ExpenseCalendar } from '../../../../components/calendar/ExpenseCalendar';
import { DayExpensesModal } from '../../../../components/dialogs/DayExpensesModal';
import { format } from 'date-fns';

interface CategoryDetails extends BudgetCategory {
  budgetMonth: number;
  budgetYear: number;
  dailyExpenses: Record<string, { total: number; count: number; expenses: any[] }>;
  expenses: Expense[];
}

export default function CategoryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const categoryId = params.id as string;

  const [category, setCategory] = useState<CategoryDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Selected date modal for day expense viewing/entry
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isDayModalOpen, setIsDayModalOpen] = useState(false);

  const fetchCategory = async () => {
    try {
      const res: any = await apiClient.get(`/budget-categories/${categoryId}`);
      setCategory(res.data);
    } catch (err) {
      console.error('Failed to load category', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategory();
  }, [categoryId]);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Skeleton variant="rectangular" height={40} width={200} sx={{ borderRadius: 2 }} />
        <Skeleton variant="rectangular" height={140} sx={{ borderRadius: 4 }} />
        <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 4 }} />
      </Box>
    );
  }

  if (!category) {
    return (
      <Box sx={{ py: 6, textAlign: 'center' }}>
        <Typography variant="h6">Category not found</Typography>
        <Button startIcon={<ArrowBack />} onClick={() => router.push('/dashboard')} sx={{ mt: 2 }}>
          Back to Dashboard
        </Button>
      </Box>
    );
  }

  const selectedDateKey = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '';
  const selectedDayExpenses =
    (selectedDateKey && category.dailyExpenses?.[selectedDateKey]?.expenses) || [];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton onClick={() => router.back()} sx={{ border: (theme) => `1px solid ${theme.palette.divider}` }}>
            <ArrowBack fontSize="small" />
          </IconButton>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: '12px',
              backgroundColor: `${category.color}20`,
              color: category.color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {getCategoryIcon(category.icon, 'medium')}
          </Box>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="h4" fontWeight={800} sx={{ letterSpacing: '-0.02em' }}>
                {category.name}
              </Typography>
              <StatusBadge status={category.status} percentage={category.usagePercentage} />
              {category.isSavings && <Chip label="Savings" size="small" color="success" sx={{ fontWeight: 700 }} />}
            </Box>
            <Typography variant="body2" color="text.secondary">
              {getMonthName(category.budgetMonth)} {category.budgetYear} Budget • {category.trackingType === 'DAILY' ? 'Daily Calendar Tracking' : 'General Tracking'}
            </Typography>
          </Box>
        </Box>

        <Button
          variant="contained"
          color="primary"
          startIcon={<Add />}
          onClick={() => {
            setSelectedDate(new Date(category.budgetYear, category.budgetMonth - 1, 1));
            setIsDayModalOpen(true);
          }}
          sx={{ fontWeight: 700 }}
        >
          Add Expense
        </Button>
      </Box>

      {/* Category Metric Cards */}
      <Grid container spacing={2.5}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Allocated Budget"
            value={formatNaira(category.allocatedAmount)}
            subtitle="Category limit"
            icon={<AccountBalanceWallet />}
            color={category.color}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Spent"
            value={formatNaira(category.spent)}
            subtitle={`${category.expensesCount} expenses logged`}
            icon={<TrendingDown />}
            color="#EF4444"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Remaining Budget"
            value={formatNaira(category.remaining)}
            subtitle={category.remaining < 0 ? 'Over allocated limit' : 'Available balance'}
            icon={<CheckCircleOutline />}
            color={category.remaining < 0 ? '#EF4444' : '#10B981'}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Budget Utilization"
            value={`${category.usagePercentage.toFixed(1)}%`}
            subtitle="Spent vs allocated"
            icon={<Percent />}
            color="#6366F1"
            badgeText={category.status}
            badgeColor={category.status === 'OVER_BUDGET' ? 'error' : category.status === 'CRITICAL' ? 'warning' : 'success'}
          />
        </Grid>
      </Grid>

      {/* Progress Bar Card */}
      <Card>
        <CardContent sx={{ p: 2.5 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" fontWeight={600}>
              Category Spending Cap
            </Typography>
            <Typography variant="body2" fontWeight={700} color={category.remaining < 0 ? 'error.main' : 'primary.main'}>
              {formatNaira(category.spent)} / {formatNaira(category.allocatedAmount)}
            </Typography>
          </Box>
          <ProgressBar value={category.usagePercentage} height={10} showLabel />
        </CardContent>
      </Card>

      {/* DAILY EXPENSE CALENDAR */}
      <ExpenseCalendar
        month={category.budgetMonth}
        year={category.budgetYear}
        categoryName={category.name}
        categoryColor={category.color}
        dailyExpenses={category.dailyExpenses || {}}
        onSelectDate={(day) => {
          setSelectedDate(day);
          setIsDayModalOpen(true);
        }}
      />

      {/* All Category Expenses List */}
      <Card>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" fontWeight={700} gutterBottom>
            Itemized Expense History
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
            All transactions recorded under {category.name}
          </Typography>

          {category.expenses.length === 0 ? (
            <Box sx={{ py: 4, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                No expenses logged in this category yet. Click any day on the calendar or "+ Add Expense" to record spending.
              </Typography>
            </Box>
          ) : (
            <Table size="medium">
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Merchant / Vendor</TableCell>
                  <TableCell>Payment Method</TableCell>
                  <TableCell align="right">Amount</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {category.expenses.map((exp) => (
                  <TableRow key={exp.id} hover>
                    <TableCell sx={{ fontWeight: 600 }}>
                      {format(new Date(exp.expenseDate), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {exp.description}
                      </Typography>
                      {exp.notes && (
                        <Typography variant="caption" color="text.secondary">
                          {exp.notes}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>{exp.merchant || '—'}</TableCell>
                    <TableCell>
                      <Chip
                        label={exp.paymentMethod.replace('_', ' ')}
                        size="small"
                        variant="outlined"
                        sx={{ fontSize: '0.75rem' }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" fontWeight={700} color="error.main">
                        -{formatNaira(exp.amount)}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Day Details Modal */}
      <DayExpensesModal
        open={isDayModalOpen}
        date={selectedDate}
        dayExpenses={selectedDayExpenses}
        categories={[category]}
        budgetId={category.budgetId}
        defaultCategoryId={category.id}
        onClose={() => setIsDayModalOpen(false)}
        onExpenseMutated={() => {
          fetchCategory();
        }}
      />
    </Box>
  );
}
