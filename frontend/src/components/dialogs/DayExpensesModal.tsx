'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
  Button,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Chip,
  Divider,
  TextField,
  MenuItem,
  useTheme,
} from '@mui/material';
import {
  Close,
  Add,
  DeleteOutline,
  CreditCard,
  AccountBalance,
  Money,
  Payment,
  Edit,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { formatNaira } from '../../lib/formatters';
import { getCategoryIcon } from '../../lib/icons';
import { Expense, BudgetCategory } from '../../types';
import { apiClient } from '../../lib/api-client';

interface DayExpensesModalProps {
  open: boolean;
  date: Date | null;
  dayExpenses: Expense[];
  categories: BudgetCategory[];
  budgetId: string;
  defaultCategoryId?: string;
  onClose: () => void;
  onExpenseMutated: () => void;
}

export const DayExpensesModal: React.FC<DayExpensesModalProps> = ({
  open,
  date,
  dayExpenses = [],
  categories = [],
  budgetId,
  defaultCategoryId,
  onClose,
  onExpenseMutated,
}) => {
  const theme = useTheme();
  const [isAdding, setIsAdding] = useState(false);
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);

  // Form State
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState(defaultCategoryId || (categories[0]?.id || ''));
  const [paymentMethod, setPaymentMethod] = useState('DEBIT_CARD');
  const [merchant, setMerchant] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!date) return null;

  const totalSpentThatDay = dayExpenses.reduce(
    (sum, exp) => sum + Number(exp.amount),
    0,
  );

  const resetForm = () => {
    setDescription('');
    setAmount('');
    setCategoryId(defaultCategoryId || (categories[0]?.id || ''));
    setPaymentMethod('DEBIT_CARD');
    setMerchant('');
    setNotes('');
    setIsAdding(false);
    setEditingExpenseId(null);
    setErrorMessage('');
  };

  const handleStartEdit = (exp: Expense) => {
    setEditingExpenseId(exp.id);
    setDescription(exp.description);
    setAmount(exp.amount.toString());
    setCategoryId(exp.budgetCategoryId);
    setPaymentMethod(exp.paymentMethod || 'DEBIT_CARD');
    setMerchant(exp.merchant || '');
    setNotes(exp.notes || '');
    setIsAdding(true);
  };

  const handleSaveExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || !amount || Number(amount) <= 0) {
      setErrorMessage('Please provide a valid description and positive amount.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      if (editingExpenseId) {
        await apiClient.patch(`/expenses/${editingExpenseId}`, {
          budgetCategoryId: categoryId,
          amount: Number(amount),
          description: description.trim(),
          paymentMethod,
          merchant: merchant.trim() || null,
          notes: notes.trim() || null,
        });
      } else {
        await apiClient.post('/expenses', {
          budgetId,
          budgetCategoryId: categoryId,
          amount: Number(amount),
          description: description.trim(),
          expenseDate: format(date, 'yyyy-MM-dd'),
          paymentMethod,
          merchant: merchant.trim() || null,
          notes: notes.trim() || null,
        });
      }

      resetForm();
      onExpenseMutated();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to save expense');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await apiClient.delete(`/expenses/${id}`);
      onExpenseMutated();
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
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          m: { xs: 1.5, sm: 3 },
          width: { xs: 'calc(100% - 24px)', sm: 'auto' },
          borderRadius: { xs: 3, sm: 4 },
          maxHeight: { xs: '94vh', sm: '90vh' },
        },
      }}
    >
      <DialogTitle sx={{ m: 0, p: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h6" fontWeight={700}>
            {format(date, 'EEEE, MMMM d, yyyy')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Total Spent: <strong style={{ color: theme.palette.primary.main }}>{formatNaira(totalSpentThatDay)}</strong>
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small">
          <Close fontSize="small" />
        </IconButton>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ p: 3 }}>
        {/* Error notification */}
        {errorMessage && (
          <Box sx={{ mb: 2, p: 1.5, borderRadius: 2, bgcolor: 'error.light', color: 'error.dark' }}>
            <Typography variant="body2">{errorMessage}</Typography>
          </Box>
        )}

        {/* Existing expenses list */}
        {!isAdding && (
          <>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
              <Typography variant="subtitle2" fontWeight={700} color="text.secondary">
                RECORDED EXPENSES ({dayExpenses.length})
              </Typography>
              <Button
                variant="outlined"
                size="small"
                startIcon={<Add />}
                onClick={() => {
                  resetForm();
                  setIsAdding(true);
                }}
              >
                Add Expense
              </Button>
            </Box>

            {dayExpenses.length === 0 ? (
              <Box sx={{ py: 5, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  No expenses recorded for this day yet.
                </Typography>
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<Add />}
                  onClick={() => setIsAdding(true)}
                  sx={{ mt: 1 }}
                >
                  Record Expense
                </Button>
              </Box>
            ) : (
              <List sx={{ p: 0 }}>
                {dayExpenses.map((exp) => (
                  <ListItem
                    key={exp.id}
                    sx={{
                      mb: 1,
                      p: 1.5,
                      borderRadius: 2.5,
                      border: `1px solid ${theme.palette.divider}`,
                      backgroundColor:
                        theme.palette.mode === 'dark'
                          ? 'rgba(255, 255, 255, 0.02)'
                          : 'rgba(0, 0, 0, 0.02)',
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 44 }}>
                      <Box
                        sx={{
                          width: 36,
                          height: 36,
                          borderRadius: 2,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: `${exp.category?.color || '#10B981'}20`,
                          color: exp.category?.color || '#10B981',
                        }}
                      >
                        {getCategoryIcon(exp.category?.icon, 'small')}
                      </Box>
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="subtitle2" fontWeight={700}>
                            {exp.description}
                          </Typography>
                          {exp.merchant && (
                            <Chip label={exp.merchant} size="small" sx={{ height: 20, fontSize: '0.7rem' }} />
                          )}
                        </Box>
                      }
                      secondary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                          <Typography variant="caption" color="text.secondary">
                            {exp.category?.name || 'General'}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25, color: 'text.secondary' }}>
                            {getPaymentIcon(exp.paymentMethod)}
                            <Typography variant="caption">{exp.paymentMethod.replace('_', ' ')}</Typography>
                          </Box>
                        </Box>
                      }
                    />
                    <Box sx={{ textAlign: 'right', mr: 2 }}>
                      <Typography variant="subtitle2" fontWeight={700} color="error.main">
                        -{formatNaira(exp.amount)}
                      </Typography>
                    </Box>
                    <ListItemSecondaryAction>
                      <IconButton size="small" onClick={() => handleStartEdit(exp)} sx={{ mr: 0.5 }}>
                        <Edit fontSize="small" />
                      </IconButton>
                      <IconButton size="small" color="error" onClick={() => handleDelete(exp.id)}>
                        <DeleteOutline fontSize="small" />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            )}
          </>
        )}

        {/* Add / Edit Expense Form */}
        {isAdding && (
          <Box component="form" onSubmit={handleSaveExpense} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="subtitle2" fontWeight={700}>
              {editingExpenseId ? 'Edit Expense' : 'Record New Expense'}
            </Typography>

            <Box>
              <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ display: 'block', mb: 0.75 }}>
                Description
              </Typography>
              <TextField
                placeholder="e.g. Lunch, Transport, Airtime"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                fullWidth
                required
                autoFocus
              />
            </Box>

            <Box>
              <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ display: 'block', mb: 0.75 }}>
                Amount (₦)
              </Typography>
              <TextField
                placeholder="e.g. 2500"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                fullWidth
                required
                inputProps={{ min: 1, step: 'any' }}
              />
            </Box>

            <Box>
              <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ display: 'block', mb: 0.75 }}>
                Budget Category
              </Typography>
              <TextField
                select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                fullWidth
                required
              >
                {categories.map((cat) => (
                  <MenuItem key={cat.id} value={cat.id}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ color: cat.color }}>{getCategoryIcon(cat.icon, 'small')}</Box>
                      <span>{cat.name}</span>
                    </Box>
                  </MenuItem>
                ))}
              </TextField>
            </Box>

            <Box>
              <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ display: 'block', mb: 0.75 }}>
                Payment Method
              </Typography>
              <TextField
                select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                fullWidth
              >
                <MenuItem value="DEBIT_CARD">Debit Card</MenuItem>
                <MenuItem value="BANK_TRANSFER">Bank Transfer</MenuItem>
                <MenuItem value="CASH">Cash</MenuItem>
                <MenuItem value="CREDIT_CARD">Credit Card</MenuItem>
                <MenuItem value="OTHER">Other</MenuItem>
              </TextField>
            </Box>

            <Box>
              <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ display: 'block', mb: 0.75 }}>
                Merchant / Vendor (Optional)
              </Typography>
              <TextField
                value={merchant}
                onChange={(e) => setMerchant(e.target.value)}
                placeholder="e.g. Mega Chicken, Uber, MTN"
                fullWidth
              />
            </Box>

            <Box>
              <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ display: 'block', mb: 0.75 }}>
                Notes (Optional)
              </Typography>
              <TextField
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Optional notes..."
                fullWidth
                multiline
                rows={2}
              />
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5, mt: 1 }}>
              <Button onClick={resetForm} color="inherit">
                Cancel
              </Button>
              <Button type="submit" variant="contained" color="primary" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : editingExpenseId ? 'Update Expense' : 'Save Expense'}
              </Button>
            </Box>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={onClose} variant="outlined" color="inherit">
          Done
        </Button>
      </DialogActions>
    </Dialog>
  );
};
