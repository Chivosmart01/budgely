'use client';

import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  useTheme,
  Grid,
} from '@mui/material';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { CategoryBreakdownPoint } from '../../types';
import { formatNaira } from '../../lib/formatters';

interface CategoryDonutChartProps {
  data: CategoryBreakdownPoint[];
}

export const CategoryDonutChart: React.FC<CategoryDonutChartProps> = ({
  data = [],
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const validData = data.filter((d) => d.amount > 0);
  const totalSpent = validData.reduce((sum, d) => sum + d.amount, 0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
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
          <Typography variant="subtitle2" fontWeight={700} sx={{ color: item.color }}>
            {item.name}
          </Typography>
          <Typography variant="body2" fontWeight={600}>
            {formatNaira(item.amount)}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {item.percentage.toFixed(1)}% of total spending
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
            Spending by Category
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Percentage distribution of actual expenditures
          </Typography>
        </Box>

        {validData.length === 0 ? (
          <Box
            sx={{
              height: 260,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Typography variant="body2" color="text.secondary">
              No expenditures recorded yet this month.
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6}>
              <Box sx={{ width: '100%', height: 220, position: 'relative' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Tooltip content={<CustomTooltip />} />
                    <Pie
                      data={validData}
                      dataKey="amount"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={85}
                      paddingAngle={3}
                    >
                      {validData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color || '#10B981'} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                {/* Center text in donut */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    textAlign: 'center',
                    pointerEvents: 'none',
                  }}
                >
                  <Typography variant="caption" color="text.secondary">
                    Total
                  </Typography>
                  <Typography variant="subtitle2" fontWeight={800} noWrap>
                    {formatNaira(totalSpent)}
                  </Typography>
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25, maxHeight: 220, overflowY: 'auto', pr: 1 }}>
                {validData.map((cat) => (
                  <Box
                    key={cat.id}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box
                        sx={{
                          width: 10,
                          height: 10,
                          borderRadius: '50%',
                          backgroundColor: cat.color,
                        }}
                      />
                      <Typography variant="body2" fontWeight={600} noWrap sx={{ maxWidth: 120 }}>
                        {cat.name}
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="body2" fontWeight={700}>
                        {formatNaira(cat.amount)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {cat.percentage.toFixed(0)}%
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            </Grid>
          </Grid>
        )}
      </CardContent>
    </Card>
  );
};
