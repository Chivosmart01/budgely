'use client';

import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  useTheme,
  Chip,
  Tooltip,
} from '@mui/material';
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  format,
} from 'date-fns';
import { formatNaira, getMonthName } from '../../lib/formatters';

interface ExpenseCalendarProps {
  month: number; // 1-12
  year: number;
  dailyExpenses: Record<string, { total: number; count: number; expenses: any[] }>;
  onSelectDate: (date: Date, dayData?: { total: number; count: number; expenses: any[] }) => void;
  categoryName?: string;
  categoryColor?: string;
}

export const ExpenseCalendar: React.FC<ExpenseCalendarProps> = ({
  month,
  year,
  dailyExpenses = {},
  onSelectDate,
  categoryName,
  categoryColor = '#10B981',
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const refDate = new Date(year, month - 1, 1);
  const monthStart = startOfMonth(refDate);
  const monthEnd = endOfMonth(monthStart);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 }); // Start Monday
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const calendarDays = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd,
  });

  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  // Calculate highest daily spending in month for relative heatmap intensity
  const spendingValues = Object.values(dailyExpenses).map((d) => d.total);
  const maxDaySpending = spendingValues.length > 0 ? Math.max(...spendingValues) : 1;

  const getHeatmapColor = (total: number) => {
    if (total === 0) return 'transparent';
    const ratio = Math.min(total / (maxDaySpending || 1), 1);

    if (isDark) {
      if (ratio > 0.75) return 'rgba(239, 68, 68, 0.25)'; // High spend (Red glow)
      if (ratio > 0.4) return 'rgba(245, 158, 11, 0.22)'; // Medium spend (Amber)
      return 'rgba(16, 185, 129, 0.18)'; // Normal (Emerald)
    } else {
      if (ratio > 0.75) return 'rgba(239, 68, 68, 0.12)';
      if (ratio > 0.4) return 'rgba(245, 158, 11, 0.12)';
      return 'rgba(16, 185, 129, 0.12)';
    }
  };

  return (
    <Card sx={{ overflow: 'hidden' }}>
      <CardContent sx={{ p: 3 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: 2.5,
          }}
        >
          <Box>
            <Typography variant="h6" fontWeight={700}>
              {categoryName ? `${categoryName} — Expense Calendar` : 'Daily Expense Calendar'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Click any date to view and record daily itemized expenses
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Box
                sx={{
                  width: 10,
                  height: 10,
                  borderRadius: '3px',
                  bgcolor: isDark ? 'rgba(16, 185, 129, 0.3)' : 'rgba(16, 185, 129, 0.2)',
                }}
              />
              <Typography variant="caption" color="text.secondary">
                Low
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Box
                sx={{
                  width: 10,
                  height: 10,
                  borderRadius: '3px',
                  bgcolor: isDark ? 'rgba(245, 158, 11, 0.4)' : 'rgba(245, 158, 11, 0.2)',
                }}
              />
              <Typography variant="caption" color="text.secondary">
                Medium
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Box
                sx={{
                  width: 10,
                  height: 10,
                  borderRadius: '3px',
                  bgcolor: isDark ? 'rgba(239, 68, 68, 0.4)' : 'rgba(239, 68, 68, 0.2)',
                }}
              />
              <Typography variant="caption" color="text.secondary">
                High
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Days of Week Header */}
        <Grid container spacing={1} sx={{ mb: 1, textAlign: 'center' }}>
          {weekDays.map((day) => (
            <Grid item xs={12 / 7} key={day}>
              <Typography
                variant="caption"
                fontWeight={700}
                color="text.secondary"
                sx={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}
              >
                {day}
              </Typography>
            </Grid>
          ))}
        </Grid>

        {/* Calendar Day Cells */}
        <Grid container spacing={1}>
          {calendarDays.map((day) => {
            const dateKey = format(day, 'yyyy-MM-dd');
            const dayData = dailyExpenses[dateKey];
            const hasSpending = dayData && dayData.total > 0;
            const inCurrentMonth = isSameMonth(day, refDate);
            const today = isToday(day);

            return (
              <Grid item xs={12 / 7} key={dateKey}>
                <Tooltip
                  title={
                    hasSpending
                      ? `${format(day, 'MMM d')}: ${formatNaira(dayData.total)} (${dayData.count} expense${dayData.count > 1 ? 's' : ''})`
                      : `${format(day, 'MMM d')}: No expenses recorded`
                  }
                  arrow
                >
                  <Box
                    className="calendar-cell"
                    onClick={() => onSelectDate(day, dayData)}
                    sx={{
                      height: { xs: 64, sm: 80 },
                      p: 1,
                      borderRadius: 2.5,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      border: today
                        ? `2px solid ${theme.palette.primary.main}`
                        : `1px solid ${
                            hasSpending
                              ? isDark
                                ? 'rgba(255, 255, 255, 0.15)'
                                : 'rgba(0, 0, 0, 0.12)'
                              : theme.palette.divider
                          }`,
                      backgroundColor: hasSpending
                        ? getHeatmapColor(dayData.total)
                        : inCurrentMonth
                        ? isDark
                          ? 'rgba(255, 255, 255, 0.02)'
                          : 'rgba(0, 0, 0, 0.01)'
                        : 'transparent',
                      opacity: inCurrentMonth ? 1 : 0.35,
                      cursor: 'pointer',
                    }}
                  >
                    {/* Top row: day number & indicator */}
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <Typography
                        variant="caption"
                        fontWeight={today ? 800 : inCurrentMonth ? 600 : 400}
                        color={today ? 'primary.main' : 'text.primary'}
                      >
                        {format(day, 'd')}
                      </Typography>

                      {hasSpending && (
                        <Box
                          sx={{
                            width: 6,
                            height: 6,
                            borderRadius: '50%',
                            backgroundColor: categoryColor || 'primary.main',
                          }}
                        />
                      )}
                    </Box>

                    {/* Bottom: total spent on that day */}
                    <Box sx={{ mt: 'auto' }}>
                      {hasSpending ? (
                        <Typography
                          variant="caption"
                          fontWeight={700}
                          sx={{
                            fontSize: { xs: '0.65rem', sm: '0.75rem' },
                            color: isDark ? '#34D399' : '#059669',
                            display: 'block',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {formatNaira(dayData.total)}
                        </Typography>
                      ) : (
                        <Typography
                          variant="caption"
                          color="text.disabled"
                          sx={{ fontSize: '0.65rem' }}
                        >
                          ₦0
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </Tooltip>
              </Grid>
            );
          })}
        </Grid>
      </CardContent>
    </Card>
  );
};
