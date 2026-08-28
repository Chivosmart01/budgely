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
  Category as CategoriesIcon,
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
    if (pathname.startsWith('/categories')) return '/categories';
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
          theme.palette.mode === 'dark'
            ? 'rgba(11, 15, 25, 0.92)'
            : 'rgba(255, 255, 255, 0.92)',
        backdropFilter: 'blur(16px)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
      elevation={4}
    >
      <BottomNavigation
        showLabels
        value={getValue()}
        onChange={(_, newValue) => {
          router.push(newValue);
        }}
        sx={{
          bgcolor: 'transparent',
          height: 60,
          '& .MuiBottomNavigationAction-root': {
            minWidth: 'auto',
            padding: '6px 0',
            color: 'text.secondary',
            '&.Mui-selected': {
              color: 'primary.main',
              '& .MuiBottomNavigationAction-label': {
                fontWeight: 700,
                fontSize: '0.7rem',
              },
            },
            '& .MuiBottomNavigationAction-label': {
              fontSize: '0.65rem',
              fontWeight: 500,
              mt: 0.25,
            },
            '& .MuiSvgIcon-root': {
              fontSize: '1.25rem',
            },
          },
        }}
      >
        <BottomNavigationAction
          label="Dashboard"
          value="/dashboard"
          icon={<DashboardIcon />}
        />
        <BottomNavigationAction
          label="Categories"
          value="/categories"
          icon={<CategoriesIcon />}
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
