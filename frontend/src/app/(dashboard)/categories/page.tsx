'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Button,
  IconButton,
  Chip,
  Tooltip,
  TextField,
  InputAdornment,
  MenuItem,
  Grid,
  Skeleton,
} from '@mui/material';
import {
  ArrowForward,
  Add,
  Search,
  AccountBalanceWallet,
  TrendingDown,
  CheckCircleOutline,
  CalendarMonth,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useBudgetStore } from '../../../stores/budgetStore';
import { apiClient } from '../../../lib/api-client';
import { DashboardSummary } from '../../../types';
import { formatNaira, getMonthName } from '../../../lib/formatters';
import { getCategoryIcon } from '../../../lib/icons';
import { ProgressBar } from '../../../components/ui/ProgressBar';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { StatCard } from '../../../components/ui/StatCard';
import { EmptyState } from '../../../components/ui/EmptyState';
import { AddCategoryDialog } from '../../../components/dialogs/AddCategoryDialog';
import { CreateBudgetDialog } from '../../../components/dialogs/CreateBudgetDialog';

export default function CategoriesPage() {
  const router = useRouter();
  const { selectedMonth, selectedYear, refreshTrigger, triggerRefresh } = useBudgetStore();

  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [isCreateBudgetOpen, setIsCreateBudgetOpen] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    apiClient
      .get(`/dashboard/summary?month=${selectedMonth}&year=${selectedYear}`)
      .then((res: any) => {
        setSummary(res.data);
      })
      .catch((err) => {
        console.error('Failed to load category summary', err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [selectedMonth, selectedYear, refreshTrigger]);

  const hasBudget = !!summary?.budgetId;

  // Filter categories
  const filteredCategories = (summary?.categories || []).filter((cat) => {
    const matchesSearch = cat.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType =
      filterType === 'ALL' ||
      (filterType === 'DAILY' && cat.trackingType === 'DAILY') ||
      (filterType === 'GENERAL' && cat.trackingType === 'GENERAL') ||
      (filterType === 'SAVINGS' && cat.isSavings);

    const matchesStatus =
      filterStatus === 'ALL' ||
      (filterStatus === 'OVER_BUDGET' && cat.status === 'OVER_BUDGET') ||
      (filterStatus === 'WARNING' && (cat.status === 'WARNING' || cat.status === 'CRITICAL')) ||
      (filterStatus === 'HEALTHY' && cat.status === 'HEALTHY');

    return matchesSearch && matchesType && matchesStatus;
  });

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Skeleton variant="rectangular" height={40} width={260} sx={{ borderRadius: 2 }} />
        <Grid container spacing={2.5}>
          {[1, 2, 3, 4].map((i) => (
            <Grid item xs={12} sm={6} md={3} key={i}>
              <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 4 }} />
            </Grid>
          ))}
        </Grid>
        <Skeleton variant="rectangular" height={380} sx={{ borderRadius: 4 }} />
      </Box>
    );
  }

  if (!hasBudget) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight={800} sx={{ letterSpacing: '-0.02em' }}>
            Category Allocations
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage allocations and daily expense trackers for {getMonthName(selectedMonth)} {selectedYear}
          </Typography>
        </Box>

        <EmptyState
          icon={<CalendarMonth sx={{ fontSize: 32 }} />}
          title={`No budget found for ${getMonthName(selectedMonth)} ${selectedYear}`}
          description="Create your monthly salary budget first to allocate funds into spending and savings categories."
          actionText={`Create ${getMonthName(selectedMonth)} Budget`}
          onAction={() => setIsCreateBudgetOpen(true)}
        />

        <CreateBudgetDialog
          open={isCreateBudgetOpen}
          onClose={() => setIsCreateBudgetOpen(false)}
          onSuccess={triggerRefresh}
          initialMonth={selectedMonth}
          initialYear={selectedYear}
        />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Page Header */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { sm: 'center' }, gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight={800} sx={{ letterSpacing: '-0.02em' }}>
            Category Allocations
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage spending limits, track progress, and view daily calendars for {getMonthName(selectedMonth)} {selectedYear}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
          <Button
            variant="outlined"
            size="medium"
            onClick={() => router.push('/budgets')}
          >
            Manage Budgets
          </Button>

          <Button
            variant="contained"
            color="primary"
            startIcon={<Add />}
            onClick={() => setIsAddCategoryOpen(true)}
            sx={{ fontWeight: 700 }}
          >
            Add Category
          </Button>
        </Box>
      </Box>

      {/* Summary KPI Cards */}
      <Grid container spacing={2.5}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Allocated"
            value={formatNaira(summary?.totalAllocated || 0)}
            subtitle={`${summary?.categories.length || 0} active categories`}
            icon={<AccountBalanceWallet />}
            color="#10B981"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Spent"
            value={formatNaira(summary?.totalSpent || 0)}
            subtitle={`${(summary?.utilization || 0).toFixed(1)}% of income utilized`}
            icon={<TrendingDown />}
            color="#EF4444"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Remaining Balance"
            value={formatNaira(summary?.remaining || 0)}
            subtitle={summary && summary.remaining < 0 ? 'Over allocated limit' : 'Available across categories'}
            icon={<CheckCircleOutline />}
            color={summary && summary.remaining < 0 ? '#EF4444' : '#14B8A6'}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Savings Target"
            value={formatNaira(summary?.savings || 0)}
            subtitle={`${(summary?.savingsRate || 0).toFixed(1)}% savings rate`}
            icon={<CheckCircleOutline />}
            color="#8B5CF6"
          />
        </Grid>
      </Grid>

      {/* Search & Filters */}
      <Card>
        <CardContent sx={{ p: 2.5 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '2fr 1fr 1fr' }, gap: 2 }}>
            <TextField
              placeholder="Search category name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search fontSize="small" color="action" />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              select
              label="Tracking Type"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <MenuItem value="ALL">All Types</MenuItem>
              <MenuItem value="DAILY">Daily Calendar</MenuItem>
              <MenuItem value="GENERAL">General</MenuItem>
              <MenuItem value="SAVINGS">Savings</MenuItem>
            </TextField>

            <TextField
              select
              label="Status"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <MenuItem value="ALL">All Statuses</MenuItem>
              <MenuItem value="HEALTHY">Healthy (&lt;70%)</MenuItem>
              <MenuItem value="WARNING">Warning (70-99%)</MenuItem>
              <MenuItem value="OVER_BUDGET">Over Budget (≥100%)</MenuItem>
            </TextField>
          </Box>
        </CardContent>
      </Card>

      {/* Categories Content: Responsive Table on Desktop + Mobile Card List on Mobile */}
      <Card>
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
            <Box>
              <Typography variant="h6" fontWeight={700}>
                Category Overview & Allocations
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Showing {filteredCategories.length} categor{filteredCategories.length === 1 ? 'y' : 'ies'}
              </Typography>
            </Box>
          </Box>

          {filteredCategories.length === 0 ? (
            <Box sx={{ py: 6, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                No categories match your filters.
              </Typography>
            </Box>
          ) : (
            <>
              {/* Mobile Card List View (xs and sm) */}
              <Box sx={{ display: { xs: 'flex', md: 'none' }, flexDirection: 'column', gap: 2 }}>
                {filteredCategories.map((cat) => (
                  <Card
                    key={cat.id}
                    variant="outlined"
                    onClick={() => router.push(`/categories/${cat.id}`)}
                    sx={{
                      p: 2,
                      borderRadius: 3,
                      cursor: 'pointer',
                      bgcolor: (theme) =>
                        theme.palette.mode === 'dark'
                          ? 'rgba(255, 255, 255, 0.02)'
                          : 'rgba(0, 0, 0, 0.01)',
                      border: (theme) => `1px solid ${theme.palette.divider}`,
                      transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 6px 20px rgba(0,0,0,0.15)',
                      },
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: '10px',
                            backgroundColor: `${cat.color}20`,
                            color: cat.color,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          {getCategoryIcon(cat.icon, 'small')}
                        </Box>
                        <Box>
                          <Typography variant="subtitle2" fontWeight={800} sx={{ lineHeight: 1.2 }}>
                            {cat.name}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center', mt: 0.5 }}>
                            {cat.isSavings && (
                              <Chip label="Savings" size="small" color="success" sx={{ height: 18, fontSize: '0.65rem' }} />
                            )}
                            <Typography variant="caption" color="text.secondary">
                              {cat.trackingType === 'DAILY' ? 'Daily Calendar' : 'General'}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>

                      <StatusBadge status={cat.status} percentage={cat.usagePercentage} />
                    </Box>

                    {/* 3-column stats */}
                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, my: 1.5, p: 1.25, borderRadius: 2, bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.03)' }}>
                      <Box>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.65rem' }}>
                          Budgeted
                        </Typography>
                        <Typography variant="body2" fontWeight={700} sx={{ fontSize: '0.8rem' }}>
                          {formatNaira(cat.allocatedAmount)}
                        </Typography>
                      </Box>

                      <Box>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.65rem' }}>
                          Spent
                        </Typography>
                        <Typography variant="body2" fontWeight={700} sx={{ fontSize: '0.8rem', color: cat.spent > cat.allocatedAmount ? 'error.main' : 'text.primary' }}>
                          {formatNaira(cat.spent)}
                        </Typography>
                      </Box>

                      <Box>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.65rem' }}>
                          Remaining
                        </Typography>
                        <Typography variant="body2" fontWeight={700} sx={{ fontSize: '0.8rem', color: cat.remaining < 0 ? 'error.main' : 'success.main' }}>
                          {formatNaira(cat.remaining)}
                        </Typography>
                      </Box>
                    </Box>

                    <ProgressBar value={cat.usagePercentage} showLabel />

                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', mt: 1.5, gap: 0.5 }}>
                      <Typography variant="caption" color="primary" fontWeight={700}>
                        View Expense Calendar
                      </Typography>
                      <ArrowForward sx={{ fontSize: 14 }} color="primary" />
                    </Box>
                  </Card>
                ))}
              </Box>

              {/* Desktop Data Table (md and up) */}
              <Box sx={{ display: { xs: 'none', md: 'block' }, overflowX: 'auto' }}>
                <Table size="medium">
                  <TableHead>
                    <TableRow>
                      <TableCell>Category</TableCell>
                      <TableCell align="right">Budgeted</TableCell>
                      <TableCell align="right">Actual Spent</TableCell>
                      <TableCell align="right">Remaining</TableCell>
                      <TableCell sx={{ minWidth: 160 }}>Usage Progress</TableCell>
                      <TableCell align="center">Status</TableCell>
                      <TableCell align="right">Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredCategories.map((cat) => (
                      <TableRow
                        key={cat.id}
                        hover
                        sx={{
                          cursor: 'pointer',
                          '&:hover': {
                            bgcolor: (theme) =>
                              theme.palette.mode === 'dark'
                                ? 'rgba(255, 255, 255, 0.02)'
                                : 'rgba(0, 0, 0, 0.02)',
                          },
                        }}
                        onClick={() => router.push(`/categories/${cat.id}`)}
                      >
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Box
                              sx={{
                                width: 38,
                                height: 38,
                                borderRadius: '10px',
                                backgroundColor: `${cat.color}20`,
                                color: cat.color,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              {getCategoryIcon(cat.icon, 'small')}
                            </Box>
                            <Box>
                              <Typography variant="subtitle2" fontWeight={700}>
                                {cat.name}
                              </Typography>
                              <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
                                {cat.isSavings && (
                                  <Chip label="Savings" size="small" color="success" sx={{ height: 18, fontSize: '0.65rem' }} />
                                )}
                                <Typography variant="caption" color="text.secondary">
                                  {cat.trackingType === 'DAILY' ? 'Daily Calendar' : 'General'}
                                </Typography>
                              </Box>
                            </Box>
                          </Box>
                        </TableCell>

                        <TableCell align="right">
                          <Typography variant="body2" fontWeight={600}>
                            {formatNaira(cat.allocatedAmount)}
                          </Typography>
                        </TableCell>

                        <TableCell align="right">
                          <Typography variant="body2" fontWeight={700} color={cat.spent > cat.allocatedAmount ? 'error.main' : 'text.primary'}>
                            {formatNaira(cat.spent)}
                          </Typography>
                        </TableCell>

                        <TableCell align="right">
                          <Typography
                            variant="body2"
                            fontWeight={700}
                            sx={{ color: cat.remaining < 0 ? 'error.main' : 'success.main' }}
                          >
                            {formatNaira(cat.remaining)}
                          </Typography>
                        </TableCell>

                        <TableCell>
                          <ProgressBar value={cat.usagePercentage} showLabel />
                        </TableCell>

                        <TableCell align="center">
                          <StatusBadge status={cat.status} percentage={cat.usagePercentage} />
                        </TableCell>

                        <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                          <Tooltip title="Open Category & Expense Calendar">
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => router.push(`/categories/${cat.id}`)}
                            >
                              <ArrowForward fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>
            </>
          )}
        </CardContent>
      </Card>

      {/* Add Category Dialog */}
      {summary?.budgetId && (
        <AddCategoryDialog
          open={isAddCategoryOpen}
          onClose={() => setIsAddCategoryOpen(false)}
          onSuccess={triggerRefresh}
          budgetId={summary.budgetId}
        />
      )}
    </Box>
  );
}
