'use client';

import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  MenuItem,
  TextField,
  useTheme,
} from '@mui/material';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { SpendingChartPoint, BudgetCategory } from '../../types';
import { formatNaira } from '../../lib/formatters';

interface ExpenseBarChartProps {
  data: SpendingChartPoint[];
  categories: BudgetCategory[];
  timeframe: string;
  view: string;
  categoryId: string;
  onTimeframeChange: (tf: string) => void;
  onViewChange: (v: string) => void;
  onCategoryChange: (catId: string) => void;
}

export const ExpenseBarChart: React.FC<ExpenseBarChartProps> = ({
  data = [],
  categories = [],
  timeframe,
  view,
  categoryId,
  onTimeframeChange,
  onViewChange,
  onCategoryChange,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const point = payload[0].payload;
      return (
        <Box
          sx={{
            backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
            p: 1.5,
            borderRadius: 2,
            border: `1px solid ${theme.palette.divider}`,
            boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
          }}
        >
          <Typography variant="caption" color="text.secondary" fontWeight={600}>
            {label}
          </Typography>
          <Typography variant="subtitle2" fontWeight={700} color="primary.main">
            {formatNaira(payload[0].value)}
          </Typography>
          {point.count !== undefined && (
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
              {point.count} transaction{point.count !== 1 ? 's' : ''}
            </Typography>
          )}
        </Box>
      );
    }
    return null;
  };

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent sx={{ p: 3 }}>
        {/* Header & Filter Controls */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', md: 'center' },
            gap: 2,
            mb: 3,
          }}
        >
          <Box>
            <Typography variant="h6" fontWeight={700}>
              Expense Spending Trend
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Track how your daily and period expenses accumulate over time
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
            <TextField
              select
              size="small"
              value={timeframe}
              onChange={(e) => onTimeframeChange(e.target.value)}
              sx={{ minWidth: 130 }}
            >
              <MenuItem value="today">Today</MenuItem>
              <MenuItem value="this_week">This Week</MenuItem>
              <MenuItem value="this_month">This Month</MenuItem>
              <MenuItem value="last_month">Last Month</MenuItem>
              <MenuItem value="last_3_months">Last 3 Months</MenuItem>
              <MenuItem value="last_6_months">Last 6 Months</MenuItem>
              <MenuItem value="this_year">This Year</MenuItem>
            </TextField>

            <TextField
              select
              size="small"
              value={view}
              onChange={(e) => onViewChange(e.target.value)}
              sx={{ minWidth: 110 }}
            >
              <MenuItem value="daily">Daily</MenuItem>
              <MenuItem value="weekly">Weekly</MenuItem>
              <MenuItem value="monthly">Monthly</MenuItem>
            </TextField>

            <TextField
              select
              size="small"
              value={categoryId}
              onChange={(e) => onCategoryChange(e.target.value)}
              sx={{ minWidth: 150 }}
            >
              <MenuItem value="all">All Categories</MenuItem>
              {categories.map((c) => (
                <MenuItem key={c.id} value={c.id}>
                  {c.name}
                </MenuItem>
              ))}
            </TextField>
          </Box>
        </Box>

        {/* Chart Canvas */}
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
                No expense records available for this filter period.
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
                  dataKey="label"
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
                <Bar
                  dataKey="amount"
                  fill="#10B981"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={45}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};
