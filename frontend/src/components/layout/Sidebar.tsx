'use client';

import React from 'react';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  AccountBalance as BudgetsIcon,
  ReceiptLong as ExpensesIcon,
  Insights as ReportsIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { usePathname, useRouter } from 'next/navigation';

import Link from 'next/link';

export const SIDEBAR_WIDTH = 240;

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: <DashboardIcon /> },
  { label: 'Monthly Budgets', href: '/budgets', icon: <BudgetsIcon /> },
  { label: 'Expenses Log', href: '/expenses', icon: <ExpensesIcon /> },
  { label: 'Reports & Trends', href: '/reports', icon: <ReportsIcon /> },
  { label: 'Settings', href: '/settings', icon: <SettingsIcon /> },
];

export const Sidebar: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const pathname = usePathname();

  if (isMobile) {
    return null;
  }

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: SIDEBAR_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: SIDEBAR_WIDTH,
          boxSizing: 'border-box',
          borderRight: `1px solid ${theme.palette.divider}`,
          backgroundColor:
            theme.palette.mode === 'dark' ? '#0B0F19' : '#FFFFFF',
          pt: 3,
        },
      }}
    >
      <Box sx={{ px: 3, mb: 3 }}>
        <Typography variant="overline" color="text.secondary" fontWeight={700}>
          FINANCIAL MANAGEMENT
        </Typography>
      </Box>

      <List sx={{ px: 2 }}>
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== '/dashboard' && pathname.startsWith(item.href));

          return (
            <ListItem key={item.href} disablePadding sx={{ mb: 1 }}>
              <ListItemButton
                component={Link}
                href={item.href}
                sx={{
                  borderRadius: 2.5,
                  py: 1.25,
                  px: 2,
                  backgroundColor: isActive
                    ? theme.palette.mode === 'dark'
                      ? 'rgba(16, 185, 129, 0.15)'
                      : 'rgba(16, 185, 129, 0.1)'
                    : 'transparent',
                  color: isActive ? 'primary.main' : 'text.secondary',
                  transition: 'all 0.15s ease',
                  '&:hover': {
                    backgroundColor:
                      theme.palette.mode === 'dark'
                        ? 'rgba(255, 255, 255, 0.04)'
                        : 'rgba(0, 0, 0, 0.04)',
                    color: 'text.primary',
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    color: isActive ? 'primary.main' : 'inherit',
                    minWidth: 38,
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontWeight: isActive ? 700 : 500,
                    fontSize: '0.875rem',
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </Drawer>
  );
};
