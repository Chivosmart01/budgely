'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  MenuItem,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Chip,
  InputAdornment,
  Skeleton,
  useTheme,
} from '@mui/material';
import {
  Search,
  Add,
  DeleteOutline,
  CreditCard,
  AccountBalance,
  Money,
  Payment,
  FilterList,
} from '@mui/icons-material';
import { apiClient } from '../../../lib/api-client';
import { Expense, BudgetCategory } from '../../../types';
import { formatNaira } from '../../../lib/formatters';
import { getCategoryIcon } from '../../../lib/icons';
import { format } from 'date-fns';
import { AddExpenseDialog } from '../../../components/dialogs/AddExpenseDialog';
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog';
import { useBudgetStore } from '../../../stores/budgetStore';

export default function ExpensesPage() {
  const theme = useTheme();
  const { selectedMonth, selectedYear, refreshTrigger, triggerRefresh } = useBudgetStore();

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<BudgetCategory[]>([]);
  const [activeBudgetId, setActiveBudgetId] = useState<string | undefined>();
  const [totalCount, setTotalCount] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedCatId, setSelectedCatId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(15);

  // Dialogs
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const fetchExpenses = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', (page + 1).toString());
      params.append('limit', limit.toString());
      if (search.trim()) params.append('search', search.trim());
      if (selectedCatId) params.append('budgetCategoryId', selectedCatId);
      if (paymentMethod) params.append('paymentMethod', paymentMethod);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const res: any = await apiClient.get(`/expenses?${params.toString()}`);
      setExpenses(res.data || []);
      setTotalCount(res.meta?.totalCount || 0);
      setTotalAmount(res.meta?.totalAmount || 0);
    } catch (err) {
      console.error('Failed to load expenses', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch categories for filter dropdown
  useEffect(() => {
    apiClient
      .get(`/budgets/by-date?month=${selectedMonth}&year=${selectedYear}`)
      .then((res: any) => {
        if (res?.data) {
          setActiveBudgetId(res.data.id);
          setCategories(res.data.categories || []);
        }
      })
      .catch(() => {});
  }, [selectedMonth, selectedYear]);

  useEffect(() => {
    fetchExpenses();
  }, [page, limit, selectedCatId, paymentMethod, startDate, endDate, refreshTrigger]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
    fetchExpenses();
  };

  const handleDelete = async () => {
    if (!deleteTargetId) return;
    try {
      await apiClient.delete(`/expenses/${deleteTargetId}`);
      fetchExpenses();
      triggerRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to delete expense');
    }
  };

  const getPaymentIcon = (method: string) => {
    switch (method) {
      case 'BANK_TRANSFER':
        return <AccountBalance fontSize="small" />;
      case 'CASH':
        return <Money fontSize="small" />;
      case 'DEBIT_CARD':
      case 'CREDIT_CARD':
        return <CreditCard fontSize="small" />;
      default:
        return <Payment fontSize="small" />;
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight={800} sx={{ letterSpacing: '-0.02em' }}>
            Expenses Log
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Filter, search, and manage your complete transaction history
          </Typography>
        </Box>

        <Button
          variant="contained"
          color="primary"
          startIcon={<Add />}
          onClick={() => setIsAddOpen(true)}
          sx={{ fontWeight: 700 }}
        >
          Add Expense
        </Button>
      </Box>

      {/* Filter Toolbar */}
      <Card>
        <CardContent sx={{ p: 2.5 }}>
          <Box
            component="form"
            onSubmit={handleSearchSubmit}
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: '1fr 1fr',
                md: '2fr 1.2fr 1.2fr 1fr 1fr auto',
              },
              gap: 1.5,
              alignItems: 'center',
            }}
          >
            <TextField
              size="small"
              placeholder="Search description, merchant..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              select
              size="small"
              value={selectedCatId}
              onChange={(e) => {
                setSelectedCatId(e.target.value);
                setPage(0);
              }}
            >
              <MenuItem value="">All Categories</MenuItem>
              {categories.map((c) => (
                <MenuItem key={c.id} value={c.id}>
                  {c.name}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              size="small"
              value={paymentMethod}
              onChange={(e) => {
                setPaymentMethod(e.target.value);
                setPage(0);
              }}
            >
              <MenuItem value="">All Payment Methods</MenuItem>
              <MenuItem value="DEBIT_CARD">Debit Card</MenuItem>
              <MenuItem value="BANK_TRANSFER">Bank Transfer</MenuItem>
              <MenuItem value="CASH">Cash</MenuItem>
              <MenuItem value="CREDIT_CARD">Credit Card</MenuItem>
              <MenuItem value="OTHER">Other</MenuItem>
            </TextField>

            <TextField
              size="small"
              type="date"
              label="From"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setPage(0);
              }}
              InputLabelProps={{ shrink: true }}
            />

            <TextField
              size="small"
              type="date"
              label="To"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setPage(0);
              }}
              InputLabelProps={{ shrink: true }}
            />

            <Button type="submit" variant="outlined" size="medium" sx={{ height: 40 }}>
              Filter
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Results Table */}
      <Card>
        <CardContent sx={{ p: 0 }}>
          {/* Summary Row */}
          <Box sx={{ p: 2, px: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${theme.palette.divider}` }}>
            <Typography variant="body2" color="text.secondary">
              Showing <strong>{expenses.length}</strong> of <strong>{totalCount}</strong> transactions
            </Typography>
            <Typography variant="subtitle2" fontWeight={700}>
              Filtered Total: <span style={{ color: theme.palette.error.main }}>-{formatNaira(totalAmount)}</span>
            </Typography>
          </Box>

          {isLoading ? (
            <Box sx={{ p: 3 }}>
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} height={50} sx={{ my: 0.5 }} />
              ))}
            </Box>
          ) : expenses.length === 0 ? (
            <Box sx={{ py: 6, textAlign: 'center' }}>
              <Typography variant="body1" fontWeight={600} gutterBottom>
                No expenses found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Try adjusting your search query or filters.
              </Typography>
            </Box>
          ) : (
            <Table size="medium">
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Payment</TableCell>
                  <TableCell>Merchant</TableCell>
                  <TableCell align="right">Amount</TableCell>
                  <TableCell align="center" width={70}>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {expenses.map((exp) => (
                  <TableRow key={exp.id} hover>
                    <TableCell sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>
                      {format(new Date(exp.expenseDate), 'MMM d, yyyy')}
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2" fontWeight={700}>
                        {exp.description}
                      </Typography>
                      {exp.notes && (
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                          {exp.notes}
                        </Typography>
                      )}
                    </TableCell>

                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ color: exp.category?.color || 'primary.main' }}>
                          {getCategoryIcon(exp.category?.icon, 'small')}
                        </Box>
                        <Typography variant="body2" fontWeight={600}>
                          {exp.category?.name || '—'}
                        </Typography>
                      </Box>
                    </TableCell>

                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        {getPaymentIcon(exp.paymentMethod)}
                        <Typography variant="caption" fontWeight={600}>
                          {exp.paymentMethod.replace('_', ' ')}
                        </Typography>
                      </Box>
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2">{exp.merchant || '—'}</Typography>
                    </TableCell>

                    <TableCell align="right">
                      <Typography variant="body2" fontWeight={800} color="error.main">
                        -{formatNaira(exp.amount)}
                      </Typography>
                    </TableCell>

                    <TableCell align="center">
                      <IconButton size="small" color="error" onClick={() => setDeleteTargetId(exp.id)}>
                        <DeleteOutline fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          <TablePagination
            component="div"
            count={totalCount}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            rowsPerPage={limit}
            onRowsPerPageChange={(e) => {
              setLimit(parseInt(e.target.value, 10));
              setPage(0);
            }}
            rowsPerPageOptions={[10, 15, 25, 50]}
          />
        </CardContent>
      </Card>

      {/* Add Expense Dialog */}
      <AddExpenseDialog
        open={isAddOpen}
        budgetId={activeBudgetId}
        categories={categories}
        onClose={() => setIsAddOpen(false)}
        onSuccess={() => {
          fetchExpenses();
          triggerRefresh();
        }}
      />

      {/* Confirm Delete */}
      <ConfirmDialog
        open={Boolean(deleteTargetId)}
        title="Delete Expense?"
        message="Are you sure you want to delete this expense record? This will immediately recalculate your category and monthly totals."
        confirmText="Delete Expense"
        onConfirm={handleDelete}
        onClose={() => setDeleteTargetId(null)}
      />
    </Box>
  );
}
