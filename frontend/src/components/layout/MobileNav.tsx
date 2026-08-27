'use client';

import React from 'react';
import {
  BottomNavigation,
  BottomNavigationAction,
  Paper,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  AccountBalance as BudgetsIcon,
  ReceiptLong as ExpensesIcon,
  Insights as ReportsIcon,
} from '@mui/icons-material';
import { usePathname, useRouter } from 'next/navigation';

export const MobileNav: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const pathname = usePathname();
  const router = useRouter();

  if (!isMobile) {
    return null;
  }

  const getValue = () => {
    if (pathname.startsWith('/budgets')) return '/budgets';
    if (pathname.startsWith('/expenses')) return '/expenses';
    if (pathname.startsWith('/reports')) return '/reports';
    return '/dashboard';
  };

  return (
    <Paper
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: (theme) => theme.zIndex.drawer + 2,
        borderTop: `1px solid ${theme.palette.divider}`,
        backgroundColor:
          theme.palette.mode === 'dark' ? '#0B0F19' : '#FFFFFF',
      }}
      elevation={3}
    >
      <BottomNavigation
        showLabels
        value={getValue()}
        onChange={(_, newValue) => {
          router.push(newValue);
        }}
      >
        <BottomNavigationAction
          label="Dashboard"
          value="/dashboard"
          icon={<DashboardIcon />}
        />
        <BottomNavigationAction
          label="Budgets"
          value="/budgets"
          icon={<BudgetsIcon />}
        />
        <BottomNavigationAction
          label="Expenses"
          value="/expenses"
          icon={<ExpensesIcon />}
        />
        <BottomNavigationAction
          label="Reports"
          value="/reports"
          icon={<ReportsIcon />}
        />
      </BottomNavigation>
    </Paper>
  );
};
