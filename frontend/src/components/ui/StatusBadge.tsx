import React from 'react';
import { Chip } from '@mui/material';
import { CategoryStatus } from '../../types';

interface StatusBadgeProps {
  status: CategoryStatus;
  percentage?: number;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, percentage }) => {
  switch (status) {
    case 'OVER_BUDGET':
      return (
        <Chip
          label={percentage ? `Over Budget (${percentage.toFixed(0)}%)` : 'Over Budget'}
          size="small"
          color="error"
          sx={{ fontWeight: 700 }}
        />
      );
    case 'CRITICAL':
      return (
        <Chip
          label={percentage ? `Critical (${percentage.toFixed(0)}%)` : 'Critical (90%+)'}
          size="small"
          color="error"
          variant="outlined"
          sx={{ fontWeight: 600 }}
        />
      );
    case 'WARNING':
      return (
        <Chip
          label={percentage ? `Warning (${percentage.toFixed(0)}%)` : 'Warning (70%+)'}
          size="small"
          color="warning"
          sx={{ fontWeight: 600 }}
        />
      );
    case 'HEALTHY':
    default:
      return (
        <Chip
          label={percentage !== undefined ? `Healthy (${percentage.toFixed(0)}%)` : 'Healthy'}
          size="small"
          color="success"
          sx={{ fontWeight: 600 }}
        />
      );
  }
};
