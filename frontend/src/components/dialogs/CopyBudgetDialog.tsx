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
  TextField,
  MenuItem,
  Alert,
} from '@mui/material';
import { Close } from '@mui/icons-material';
import { apiClient } from '../../lib/api-client';
import { MONTH_NAMES } from '../../lib/formatters';

interface CopyBudgetDialogProps {
  open: boolean;
  sourceBudgetId: string;
  sourceMonthName: string;
  sourceYear: number;
  onClose: () => void;
  onSuccess: () => void;
}

export const CopyBudgetDialog: React.FC<CopyBudgetDialogProps> = ({
  open,
  sourceBudgetId,
  sourceMonthName,
  sourceYear,
  onClose,
  onSuccess,
}) => {
  const [targetMonth, setTargetMonth] = useState(9);
  const [targetYear, setTargetYear] = useState(2026);
  const [newTotalIncome, setNewTotalIncome] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');

    try {
      await apiClient.post(`/budgets/${sourceBudgetId}/copy`, {
        targetMonth,
        targetYear,
        ...(newTotalIncome && { newTotalIncome: Number(newTotalIncome) }),
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to copy budget');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ m: 0, p: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h6" fontWeight={700}>
            Copy Budget Template
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Copy {sourceMonthName} {sourceYear} category structure & amounts
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small">
          <Close fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3, pt: 2 }}>
        {errorMessage && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errorMessage}
          </Alert>
        )}

        <Box component="form" id="copy-budget-form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2.25, pt: 0.5 }}>
          <Box>
            <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ display: 'block', mb: 0.75 }}>
              Target Month
            </Typography>
            <TextField
              select
              value={targetMonth}
              onChange={(e) => setTargetMonth(Number(e.target.value))}
              fullWidth
            >
              {MONTH_NAMES.map((name, idx) => (
                <MenuItem key={name} value={idx + 1}>
                  {name}
                </MenuItem>
              ))}
            </TextField>
          </Box>

          <Box>
            <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ display: 'block', mb: 0.75 }}>
              Target Year
            </Typography>
            <TextField
              select
              value={targetYear}
              onChange={(e) => setTargetYear(Number(e.target.value))}
              fullWidth
            >
              {[2025, 2026, 2027, 2028].map((y) => (
                <MenuItem key={y} value={y}>
                  {y}
                </MenuItem>
              ))}
            </TextField>
          </Box>

          <Box>
            <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ display: 'block', mb: 0.75 }}>
              Target Month Salary (Optional)
            </Typography>
            <TextField
              placeholder="Leave empty to keep same income"
              type="number"
              value={newTotalIncome}
              onChange={(e) => setNewTotalIncome(e.target.value)}
              fullWidth
            />
          </Box>

          <Typography variant="caption" color="text.secondary">
            Note: This copies all category allocations. Previous expenses from {sourceMonthName} will NOT be copied.
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button
          type="submit"
          form="copy-budget-form"
          variant="contained"
          color="primary"
          disabled={isLoading}
          sx={{ fontWeight: 700 }}
        >
          {isLoading ? 'Copying...' : 'Copy to Target Month'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
