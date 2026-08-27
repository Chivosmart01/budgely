import React from 'react';
import { Box, Typography } from '@mui/material';

interface ProgressBarProps {
  value: number; // 0 to 100+
  height?: number;
  showLabel?: boolean;
  color?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  height = 8,
  showLabel = false,
  color,
}) => {
  const percentage = Math.min(Math.max(value, 0), 100);

  // Determine dynamic status color if none provided
  const getBarColor = () => {
    if (color) return color;
    if (value > 100) return '#EF4444'; // Red (Over Budget)
    if (value >= 90) return '#F43F5E';  // Rose / Critical
    if (value >= 70) return '#F59E0B';  // Amber / Warning
    return '#10B981';                   // Emerald / Healthy
  };

  const barColor = getBarColor();

  return (
    <Box sx={{ width: '100%' }}>
      {showLabel && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
          <Typography variant="caption" color="text.secondary" fontWeight={500}>
            Progress
          </Typography>
          <Typography
            variant="caption"
            fontWeight={700}
            sx={{ color: value > 100 ? 'error.main' : 'text.primary' }}
          >
            {value.toFixed(1)}% {value > 100 ? '(Over budget)' : ''}
          </Typography>
        </Box>
      )}
      <Box
        sx={{
          height,
          width: '100%',
          backgroundColor: (theme) =>
            theme.palette.mode === 'dark'
              ? 'rgba(255, 255, 255, 0.08)'
              : 'rgba(0, 0, 0, 0.06)',
          borderRadius: height / 2,
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <Box
          sx={{
            height: '100%',
            width: `${percentage}%`,
            backgroundColor: barColor,
            borderRadius: height / 2,
            transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        />
      </Box>
    </Box>
  );
};
