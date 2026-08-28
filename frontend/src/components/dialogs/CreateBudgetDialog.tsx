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
  FormControlLabel,
  Checkbox,
  Alert,
  Divider,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Chip,
} from '@mui/material';
import { Close, Add, DeleteOutline } from '@mui/icons-material';
import { apiClient } from '../../lib/api-client';
import { formatNaira, MONTH_NAMES } from '../../lib/formatters';
import { CATEGORY_ICONS, getCategoryIcon } from '../../lib/icons';

interface CategoryRow {
  id: string;
  name: string;
  allocatedAmount: number;
  icon: string;
  color: string;
  trackingType: 'GENERAL' | 'DAILY';
  isSavings: boolean;
}

const DEFAULT_CATEGORIES: CategoryRow[] = [
  {
    id: '1',
    name: 'Savings',
    allocatedAmount: 50000,
    icon: 'Savings',
    color: '#10B981',
    trackingType: 'GENERAL',
    isSavings: true,
  },
  {
    id: '2',
    name: 'Car',
    allocatedAmount: 20000,
    icon: 'DirectionsCar',
    color: '#3B82F6',
    trackingType: 'DAILY',
    isSavings: false,
  },
  {
    id: '3',
    name: 'Daily Expenses',
    allocatedAmount: 30000,
    icon: 'Receipt',
    color: '#F59E0B',
    trackingType: 'DAILY',
    isSavings: false,
  },
];

interface CreateBudgetDialogProps {
  open: boolean;
  initialMonth?: number;
  initialYear?: number;
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateBudgetDialog: React.FC<CreateBudgetDialogProps> = ({
  open,
  initialMonth = 8,
  initialYear = 2026,
  onClose,
  onSuccess,
}) => {
  const [month, setMonth] = useState(initialMonth);
  const [year, setYear] = useState(initialYear);
  const [totalIncome, setTotalIncome] = useState('100000');
  const [notes, setNotes] = useState('');
  const [allowOverAllocation, setAllowOverAllocation] = useState(false);
  const [categories, setCategories] = useState<CategoryRow[]>(DEFAULT_CATEGORIES);

  // New category row input
  const [newCatName, setNewCatName] = useState('');
  const [newCatAmount, setNewCatAmount] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('Receipt');
  const [newCatColor, setNewCatColor] = useState('#10B981');
  const [newCatTracking, setNewCatTracking] = useState<'GENERAL' | 'DAILY'>('DAILY');
  const [newCatIsSavings, setNewCatIsSavings] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const incomeNum = Number(totalIncome) || 0;
  const totalAllocated = categories.reduce(
    (sum, c) => sum + (Number(c.allocatedAmount) || 0),
    0,
  );
  const unallocatedAmount = incomeNum - totalAllocated;
  const isOverAllocated = totalAllocated > incomeNum;

  const handleAddCategory = () => {
    if (!newCatName.trim() || !newCatAmount || Number(newCatAmount) < 0) {
      return;
    }
    setCategories((prev) => [
      ...prev,
      {
        id: Math.random().toString(),
        name: newCatName.trim(),
        allocatedAmount: Number(newCatAmount),
        icon: newCatIcon,
        color: newCatColor,
        trackingType: newCatTracking,
        isSavings: newCatIsSavings,
      },
    ]);
    setNewCatName('');
    setNewCatAmount('');
    setNewCatIsSavings(false);
  };

  const handleRemoveCategory = (id: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
  };

  const handleAmountChange = (id: string, amount: number) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, allocatedAmount: amount } : c)),
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (incomeNum <= 0) {
      setErrorMessage('Please enter a valid positive salary/income.');
      return;
    }
    if (isOverAllocated && !allowOverAllocation) {
      setErrorMessage(
        `You have allocated ${formatNaira(totalAllocated)} from an income of ${formatNaira(incomeNum)}. Please adjust allocations or check "Allow over-allocation".`,
      );
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      await apiClient.post('/budgets', {
        month,
        year,
        totalIncome: incomeNum,
        notes: notes.trim() || null,
        allowOverAllocation,
        categories: categories.map((c) => ({
          name: c.name,
          allocatedAmount: c.allocatedAmount,
          icon: c.icon,
          color: c.color,
          trackingType: c.trackingType,
          isSavings: c.isSavings,
        })),
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to create budget');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
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
            Create Monthly Salary Budget
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Define your income and allocate it across categories before daily spending begins
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small">
          <Close fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3, pt: 2.5 }}>
        {errorMessage && (
          <Alert severity="error" sx={{ mb: 2.5 }}>
            {errorMessage}
          </Alert>
        )}

        <Box component="form" id="create-budget-form" onSubmit={handleSubmit} sx={{ pt: 1 }}>
          {/* Month & Year & Income */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1.5fr' }, gap: 2.5, mb: 3 }}>
            <Box>
              <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ display: 'block', mb: 0.75 }}>
                Month
              </Typography>
              <TextField
                select
                value={month}
                onChange={(e) => setMonth(Number(e.target.value))}
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
                Year
              </Typography>
              <TextField
                select
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
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
                Monthly Income / Salary (₦)
              </Typography>
              <TextField
                placeholder="e.g. 100000"
                type="number"
                value={totalIncome}
                onChange={(e) => setTotalIncome(e.target.value)}
                fullWidth
                required
                inputProps={{ min: 1 }}
              />
            </Box>
          </Box>

          {/* Allocation Health Bar */}
          <Paper
            variant="outlined"
            sx={{
              p: 2,
              mb: 3,
              borderRadius: 3,
              bgcolor: isOverAllocated ? 'error.light' : 'background.paper',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="subtitle2" fontWeight={700}>
                Budget Allocation Summary
              </Typography>
              <Typography variant="subtitle2" fontWeight={700} color={isOverAllocated ? 'error.main' : 'primary.main'}>
                Allocated: {formatNaira(totalAllocated)} / {formatNaira(incomeNum)}
              </Typography>
            </Box>

            {isOverAllocated ? (
              <Typography variant="body2" color="error.dark" fontWeight={600}>
                You have allocated {formatNaira(totalAllocated)} from an income of {formatNaira(incomeNum)} (Over-allocated by {formatNaira(totalAllocated - incomeNum)})
              </Typography>
            ) : (
              <Typography variant="body2" color="text.secondary">
                {unallocatedAmount > 0
                  ? `You have ${formatNaira(unallocatedAmount)} unallocated remaining.`
                  : '100% of income perfectly allocated.'}
              </Typography>
            )}
          </Paper>

          {/* Categories Allocation Table */}
          <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5 }}>
            Category Allocations
          </Typography>

          <Table size="small" sx={{ mb: 2 }}>
            <TableHead>
              <TableRow>
                <TableCell>Category</TableCell>
                <TableCell>Tracking</TableCell>
                <TableCell align="right">Allocation (₦)</TableCell>
                <TableCell align="center" width={60}>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {categories.map((cat) => (
                <TableRow key={cat.id}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ color: cat.color }}>{getCategoryIcon(cat.icon, 'small')}</Box>
                      <Typography variant="body2" fontWeight={600}>
                        {cat.name}
                      </Typography>
                      {cat.isSavings && <Chip label="Savings" size="small" color="success" sx={{ height: 20, fontSize: '0.7rem' }} />}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={cat.trackingType === 'DAILY' ? 'Daily Calendar' : 'General'}
                      size="small"
                      variant="outlined"
                      sx={{ height: 22, fontSize: '0.75rem' }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <TextField
                      type="number"
                      size="small"
                      value={cat.allocatedAmount}
                      onChange={(e) => handleAmountChange(cat.id, Number(e.target.value))}
                      sx={{ width: 140 }}
                      inputProps={{ min: 0 }}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <IconButton size="small" color="error" onClick={() => handleRemoveCategory(cat.id)}>
                      <DeleteOutline fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Add Category Row */}
          <Paper variant="outlined" sx={{ p: 2, mb: 2, borderRadius: 2.5 }}>
            <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ display: 'block', mb: 1 }}>
              + ADD NEW CATEGORY
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '2fr 1.5fr 1fr 1fr auto' }, gap: 1.5, alignItems: 'center' }}>
              <TextField
                placeholder="Category Name"
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                size="small"
              />
              <TextField
                placeholder="Amount (₦)"
                type="number"
                value={newCatAmount}
                onChange={(e) => setNewCatAmount(e.target.value)}
                size="small"
              />
              <TextField
                select
                value={newCatIcon}
                onChange={(e) => setNewCatIcon(e.target.value)}
                size="small"
              >
                {Object.keys(CATEGORY_ICONS).map((iconKey) => (
                  <MenuItem key={iconKey} value={iconKey}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {getCategoryIcon(iconKey, 'small')}
                      <Typography variant="caption">{iconKey}</Typography>
                    </Box>
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                value={newCatTracking}
                onChange={(e) => setNewCatTracking(e.target.value as any)}
                size="small"
              >
                <MenuItem value="DAILY">Daily Calendar</MenuItem>
                <MenuItem value="GENERAL">General</MenuItem>
              </TextField>
              <Button variant="outlined" onClick={handleAddCategory} startIcon={<Add />} size="small">
                Add
              </Button>
            </Box>
          </Paper>

          {/* Optional over-allocation checkbox */}
          {isOverAllocated && (
            <FormControlLabel
              control={
                <Checkbox
                  checked={allowOverAllocation}
                  onChange={(e) => setAllowOverAllocation(e.target.checked)}
                  color="warning"
                />
              }
              label="Allow over-allocation (I intentionally want to budget more than my income)"
            />
          )}

          <TextField
            label="Notes (Optional)"
            placeholder="e.g. August budget including bonus or vacation allowance"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            fullWidth
            multiline
            rows={2}
            sx={{ mt: 2 }}
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button
          type="submit"
          form="create-budget-form"
          variant="contained"
          color="primary"
          disabled={isLoading || (isOverAllocated && !allowOverAllocation)}
          sx={{ fontWeight: 700, px: 3 }}
        >
          {isLoading ? 'Creating...' : 'Create Budget'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
