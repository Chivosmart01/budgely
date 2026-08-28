'use client';

import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Tooltip,
  useTheme,
} from '@mui/material';
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isToday,
} from 'date-fns';
import { DailyExpenseData } from '../../types';
import { formatNaira } from '../../lib/formatters';

interface ExpenseCalendarProps {
  month: number;
  year: number;
  dailyExpenses: Record<string, DailyExpenseData>;
  onSelectDate: (date: Date, dayData?: DailyExpenseData) => void;
  categoryName?: string;
  categoryColor?: string;
}

export const ExpenseCalendar: React.FC<ExpenseCalendarProps> = ({
  month,
  year,
  dailyExpenses,
  onSelectDate,
  categoryName,
  categoryColor,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  // Construct target date from month & year (month is 1-indexed)
  const refDate = new Date(year, month - 1, 1);
  const monthStart = startOfMonth(refDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 0 }); // Sunday
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });

  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

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
      <CardContent sx={{ p: { xs: 1.75, sm: 3 } }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { xs: 'flex-start', sm: 'center' },
            justifyContent: 'space-between',
            gap: 1,
            mb: 2.5,
          }}
        >
          <Box>
            <Typography variant="h6" fontWeight={700} sx={{ fontSize: { xs: '1.05rem', sm: '1.25rem' } }}>
              {categoryName ? `${categoryName} — Expense Calendar` : 'Daily Expense Calendar'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Tap any date to log or review daily itemized expenses
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, alignSelf: { xs: 'flex-end', sm: 'auto' } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '3px',
                  bgcolor: isDark ? 'rgba(16, 185, 129, 0.3)' : 'rgba(16, 185, 129, 0.2)',
                }}
              />
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                Low
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '3px',
                  bgcolor: isDark ? 'rgba(245, 158, 11, 0.4)' : 'rgba(245, 158, 11, 0.2)',
                }}
              />
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                Med
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '3px',
                  bgcolor: isDark ? 'rgba(239, 68, 68, 0.4)' : 'rgba(239, 68, 68, 0.2)',
                }}
              />
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                High
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Days of Week Header */}
        <Grid container spacing={{ xs: 0.5, sm: 1 }} sx={{ mb: 1, textAlign: 'center' }}>
          {weekDays.map((day) => (
            <Grid item xs={12 / 7} key={day}>
              <Typography
                variant="caption"
                fontWeight={700}
                color="text.secondary"
                sx={{
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  fontSize: { xs: '0.65rem', sm: '0.75rem' },
                }}
              >
                {day}
              </Typography>
            </Grid>
          ))}
        </Grid>

        {/* Calendar Day Cells */}
        <Grid container spacing={{ xs: 0.5, sm: 1 }}>
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
                      height: { xs: 54, sm: 80 },
                      p: { xs: 0.5, sm: 1 },
                      borderRadius: { xs: 1.75, sm: 2.5 },
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
                      transition: 'transform 0.1s ease, box-shadow 0.1s ease',
                      '&:hover': {
                        transform: 'scale(1.03)',
                        zIndex: 2,
                      },
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
                        sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                      >
                        {format(day, 'd')}
                      </Typography>

                      {hasSpending && (
                        <Box
                          sx={{
                            width: { xs: 5, sm: 6 },
                            height: { xs: 5, sm: 6 },
                            borderRadius: '50%',
                            backgroundColor: categoryColor || 'primary.main',
                          }}
                        />
                      )}
                    </Box>

                    {/* Bottom: total spent on that day */}
                    <Box sx={{ mt: 'auto', textAlign: 'right' }}>
                      {hasSpending ? (
                        <Typography
                          variant="caption"
                          fontWeight={700}
                          noWrap
                          sx={{
                            fontSize: { xs: '0.58rem', sm: '0.75rem' },
                            color: isDark ? '#FCA5A5' : '#DC2626',
                            display: 'block',
                            lineHeight: 1.1,
                          }}
                        >
                          ₦{dayData.total >= 1000 ? `${(dayData.total / 1000).toFixed(0)}k` : dayData.total}
                        </Typography>
                      ) : (
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{
                            fontSize: '0.65rem',
                            display: { xs: 'none', sm: 'block' },
                            opacity: 0.3,
                          }}
                        >
                          —
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
