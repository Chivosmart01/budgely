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
  Switch,
  Alert,
} from '@mui/material';
import { Close } from '@mui/icons-material';
import { apiClient } from '../../lib/api-client';
import { CATEGORY_ICONS, getCategoryIcon } from '../../lib/icons';

interface AddCategoryDialogProps {
  open: boolean;
  budgetId: string;
  onClose: () => void;
  onSuccess: () => void;
}

const COLOR_PRESETS = [
  '#10B981', // Emerald
  '#3B82F6', // Blue
  '#F59E0B', // Amber
  '#EC4899', // Pink
  '#8B5CF6', // Purple
  '#EF4444', // Red
  '#14B8A6', // Teal
  '#F97316', // Orange
];

export const AddCategoryDialog: React.FC<AddCategoryDialogProps> = ({
  open,
  budgetId,
  onClose,
  onSuccess,
}) => {
  const [name, setName] = useState('');
  const [allocatedAmount, setAllocatedAmount] = useState('');
  const [icon, setIcon] = useState('Receipt');
  const [color, setColor] = useState('#10B981');
  const [trackingType, setTrackingType] = useState<'GENERAL' | 'DAILY'>('DAILY');
  const [isSavings, setIsSavings] = useState(false);
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !allocatedAmount || Number(allocatedAmount) < 0) {
      setErrorMessage('Please provide a valid category name and allocated amount.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      await apiClient.post(`/budgets/${budgetId}/categories`, {
        name: name.trim(),
        allocatedAmount: Number(allocatedAmount),
        icon,
        color,
        trackingType,
        isSavings,
        description: description.trim() || null,
      });

      setName('');
      setAllocatedAmount('');
      setDescription('');
      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to create category');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ m: 0, p: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h6" fontWeight={700}>
            Add Budget Category
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Create a custom allocation category
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

        <Box component="form" id="add-category-form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2.25, pt: 0.5 }}>
          <Box>
            <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ display: 'block', mb: 0.75 }}>
              Category Name
            </Typography>
            <TextField
              placeholder="e.g. Healthcare, Groceries, Education"
              value={name}
              onChange={(e) => setName(e.target.value)}
              fullWidth
              required
              autoFocus
            />
          </Box>

          <Box>
            <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ display: 'block', mb: 0.75 }}>
              Allocated Amount (₦)
            </Typography>
            <TextField
              placeholder="e.g. 50000"
              type="number"
              value={allocatedAmount}
              onChange={(e) => setAllocatedAmount(e.target.value)}
              fullWidth
              required
              inputProps={{ min: 0 }}
            />
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            <Box>
              <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ display: 'block', mb: 0.75 }}>
                Icon
              </Typography>
              <TextField
                select
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                fullWidth
              >
                {Object.keys(CATEGORY_ICONS).map((iconKey) => (
                  <MenuItem key={iconKey} value={iconKey}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {getCategoryIcon(iconKey, 'small')}
                      <Typography variant="body2">{iconKey}</Typography>
                    </Box>
                  </MenuItem>
                ))}
              </TextField>
            </Box>

            <Box>
              <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ display: 'block', mb: 0.75 }}>
                Tracking Type
              </Typography>
              <TextField
                select
                value={trackingType}
                onChange={(e) => setTrackingType(e.target.value as any)}
                fullWidth
              >
                <MenuItem value="DAILY">Daily Calendar</MenuItem>
                <MenuItem value="GENERAL">General</MenuItem>
              </TextField>
            </Box>
          </Box>

          {/* Color Presets */}
          <Box>
            <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ display: 'block', mb: 1 }}>
              Category Color
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {COLOR_PRESETS.map((c) => (
                <Box
                  key={c}
                  onClick={() => setColor(c)}
                  sx={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    bgcolor: c,
                    cursor: 'pointer',
                    border: color === c ? '3px solid #FFFFFF' : '2px solid transparent',
                    boxShadow: color === c ? '0 0 0 2px #10B981' : 'none',
                    transition: 'transform 0.15s ease',
                    '&:hover': { transform: 'scale(1.15)' },
                  }}
                />
              ))}
            </Box>
          </Box>

          <FormControlLabel
            control={
              <Switch
                checked={isSavings}
                onChange={(e) => setIsSavings(e.target.checked)}
                color="success"
              />
            }
            label="Mark as Savings Allocation"
          />

          <TextField
            label="Description (Optional)"
            placeholder="Notes on what this category covers..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            fullWidth
            multiline
            rows={2}
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button
          type="submit"
          form="add-category-form"
          variant="contained"
          color="primary"
          disabled={isLoading}
          sx={{ fontWeight: 700 }}
        >
          {isLoading ? 'Adding...' : 'Add Category'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
