'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
  Button,
  IconButton,
  TextField,
  MenuItem,
  Alert,
} from '@mui/material';
import { Close } from '@mui/icons-material';
import { format } from 'date-fns';
import { apiClient } from '../../lib/api-client';
import { BudgetCategory } from '../../types';
import { getCategoryIcon } from '../../lib/icons';

interface AddExpenseDialogProps {
  open: boolean;
  budgetId?: string;
  categories: BudgetCategory[];
  onClose: () => void;
  onSuccess: () => void;
}

export const AddExpenseDialog: React.FC<AddExpenseDialogProps> = ({
  open,
  budgetId,
  categories = [],
  onClose,
  onSuccess,
}) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [expenseDate, setExpenseDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [categoryId, setCategoryId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('DEBIT_CARD');
  const [merchant, setMerchant] = useState('');
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (categories.length > 0 && !categoryId) {
      setCategoryId(categories[0].id);
    }
  }, [categories, categoryId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!budgetId) {
      setErrorMessage('No active budget available. Please create a budget first.');
      return;
    }
    if (!categoryId) {
      setErrorMessage('Please select a category.');
      return;
    }
    if (!description.trim() || !amount || Number(amount) <= 0) {
      setErrorMessage('Please provide a valid description and positive amount.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      await apiClient.post('/expenses', {
        budgetId,
        budgetCategoryId: categoryId,
        amount: Number(amount),
        description: description.trim(),
        expenseDate,
        paymentMethod,
        merchant: merchant.trim() || null,
        notes: notes.trim() || null,
      });

      // Clear form
      setDescription('');
      setAmount('');
      setMerchant('');
      setNotes('');
      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to record expense');
    } finally {
      setIsLoading(false);
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
            Record New Expense
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Quickly log your daily spend against your active budget
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small">
          <Close fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        {errorMessage && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errorMessage}
          </Alert>
        )}

        <Box component="form" id="add-expense-form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2.25, pt: 0.5 }}>
          <Box>
            <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ display: 'block', mb: 0.75 }}>
              Description
            </Typography>
            <TextField
              placeholder="e.g. Lunch, Fuel, Groceries, Internet"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              fullWidth
              required
              autoFocus
            />
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
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
                Date
              </Typography>
              <TextField
                type="date"
                value={expenseDate}
                onChange={(e) => setExpenseDate(e.target.value)}
                fullWidth
                required
              />
            </Box>
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
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
          </Box>

          <Box>
            <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ display: 'block', mb: 0.75 }}>
              Merchant / Payee (Optional)
            </Typography>
            <TextField
              placeholder="e.g. Mega Chicken, Uber, MTN, Spar"
              value={merchant}
              onChange={(e) => setMerchant(e.target.value)}
              fullWidth
            />
          </Box>

          <Box>
            <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ display: 'block', mb: 0.75 }}>
              Notes (Optional)
            </Typography>
            <TextField
              placeholder="Additional details..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              fullWidth
              multiline
              rows={2}
            />
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button
          type="submit"
          form="add-expense-form"
          variant="contained"
          color="primary"
          disabled={isLoading}
          sx={{ fontWeight: 700, px: 3 }}
        >
          {isLoading ? 'Saving...' : 'Add Expense'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
