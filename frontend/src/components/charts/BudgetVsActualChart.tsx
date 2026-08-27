'use client';

import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  useTheme,
} from '@mui/material';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import { BudgetVsActualPoint } from '../../types';
import { formatNaira } from '../../lib/formatters';

interface BudgetVsActualChartProps {
  data: BudgetVsActualPoint[];
}

export const BudgetVsActualChart: React.FC<BudgetVsActualChartProps> = ({
  data = [],
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const budgetVal = payload.find((p: any) => p.dataKey === 'budget')?.value || 0;
      const actualVal = payload.find((p: any) => p.dataKey === 'actual')?.value || 0;
      const variance = budgetVal - actualVal;
      const isOver = actualVal > budgetVal;

      return (
        <Box
          sx={{
            backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
            p: 2,
            borderRadius: 2,
            border: `1px solid ${theme.palette.divider}`,
            boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
          }}
        >
          <Typography variant="subtitle2" fontWeight={700} gutterBottom>
            {label}
          </Typography>
          <Typography variant="body2" color="info.main" fontWeight={600}>
            Budgeted: {formatNaira(budgetVal)}
          </Typography>
          <Typography variant="body2" color={isOver ? 'error.main' : 'primary.main'} fontWeight={600}>
            Actual Spent: {formatNaira(actualVal)}
          </Typography>
          <Typography variant="caption" sx={{ color: isOver ? 'error.main' : 'success.main', fontWeight: 700, mt: 0.5, display: 'block' }}>
            {isOver ? `Over budget by ${formatNaira(Math.abs(variance))}` : `Remaining: ${formatNaira(variance)}`}
          </Typography>
        </Box>
      );
    }
    return null;
  };

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" fontWeight={700}>
            Budget vs Actual Spending
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Instantly identify categories where spending is exceeding planned limits
          </Typography>
        </Box>

        <Box sx={{ width: '100%', height: 300 }}>
          {data.length === 0 ? (
            <Box
              sx={{
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Typography variant="body2" color="text.secondary">
                No budget category data available.
              </Typography>
            </Box>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.05)'}
                  vertical={false}
                />
                <XAxis
                  dataKey="category"
                  stroke={isDark ? '#9CA3AF' : '#64748B'}
                  fontSize={12}
                  tickLine={false}
                  axisLine={{ stroke: theme.palette.divider }}
                />
                <YAxis
                  stroke={isDark ? '#9CA3AF' : '#64748B'}
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: theme.palette.divider }}
                  tickFormatter={(val) => `₦${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' }} />
                <Legend />
                <Bar name="Budgeted Allocation" dataKey="budget" fill="#6366F1" radius={[4, 4, 0, 0]} maxBarSize={28} />
                <Bar name="Actual Spent" dataKey="actual" fill="#10B981" radius={[4, 4, 0, 0]} maxBarSize={28} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};
