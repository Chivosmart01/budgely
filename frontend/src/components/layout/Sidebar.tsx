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
  IconButton,
  Divider,
  Avatar,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  AccountBalance as BudgetsIcon,
  Category as CategoriesIcon,
  ReceiptLong as ExpensesIcon,
  Insights as ReportsIcon,
  Settings as SettingsIcon,
  Close as CloseIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '../../stores/authStore';

export const SIDEBAR_WIDTH = 260;

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: <DashboardIcon /> },
  { label: 'Category Allocations', href: '/categories', icon: <CategoriesIcon /> },
  { label: 'Monthly Budgets', href: '/budgets', icon: <BudgetsIcon /> },
  { label: 'Expenses Log', href: '/expenses', icon: <ExpensesIcon /> },
  { label: 'Reports & Trends', href: '/reports', icon: <ReportsIcon /> },
  { label: 'Settings', href: '/settings', icon: <SettingsIcon /> },
];

interface SidebarProps {
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  mobileOpen = false,
  onCloseMobile,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    if (onCloseMobile) onCloseMobile();
    await logout();
    router.push('/login');
  };

  const sidebarContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Brand / Header in Mobile Sliding Drawer */}
      {isMobile ? (
        <Box
          sx={{
            p: 2.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: '10px',
                backgroundColor: '#10B981',
                color: '#FFFFFF',
                fontSize: '1.15rem',
                fontWeight: 900,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              ₦
            </Box>
            <Box>
              <Typography variant="subtitle1" fontWeight={800} sx={{ letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                Budgely
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Finance & Budgeting
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={onCloseMobile} size="small">
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      ) : (
        <Box sx={{ px: 3, pt: 3, pb: 2 }}>
          <Typography variant="overline" color="text.secondary" fontWeight={700} sx={{ letterSpacing: '0.08em' }}>
            FINANCIAL MANAGEMENT
          </Typography>
        </Box>
      )}

      {/* User Card on Mobile */}
      {isMobile && user && (
        <Box
          sx={{
            mx: 2,
            mt: 2,
            p: 1.5,
            borderRadius: 2.5,
            bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            border: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Avatar sx={{ width: 36, height: 36, bgcolor: '#10B981', fontWeight: 700, fontSize: '0.875rem' }}>
            {user.name ? user.name[0].toUpperCase() : 'U'}
          </Avatar>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="body2" fontWeight={700} noWrap>
              {user.name}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>
              {user.email}
            </Typography>
          </Box>
        </Box>
      )}

      {/* Navigation List */}
      <List sx={{ px: 2, py: 2, flexGrow: 1 }}>
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== '/dashboard' && pathname.startsWith(item.href));

          return (
            <ListItem key={item.href} disablePadding sx={{ mb: 0.75 }}>
              <ListItemButton
                component={Link}
                href={item.href}
                onClick={isMobile ? onCloseMobile : undefined}
                sx={{
                  borderRadius: 2.5,
                  py: 1.2,
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
                    minWidth: 36,
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

      {/* Logout in sliding mobile drawer */}
      {isMobile && (
        <Box sx={{ p: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
          <ListItemButton
            onClick={handleLogout}
            sx={{
              borderRadius: 2.5,
              py: 1.2,
              px: 2,
              color: 'error.main',
              '&:hover': {
                bgcolor: 'rgba(239, 68, 68, 0.08)',
              },
            }}
          >
            <ListItemIcon sx={{ color: 'error.main', minWidth: 36 }}>
              <LogoutIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText
              primary="Sign Out"
              primaryTypographyProps={{ fontWeight: 700, fontSize: '0.875rem' }}
            />
          </ListItemButton>
        </Box>
      )}
    </Box>
  );

  // Mobile: Smooth Sliding Temporary Drawer
  if (isMobile) {
    return (
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onCloseMobile}
        ModalProps={{
          keepMounted: true, // Better mobile opening performance
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: SIDEBAR_WIDTH,
            backgroundColor: theme.palette.mode === 'dark' ? '#0B0F19' : '#FFFFFF',
            backgroundImage: 'none',
            boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
          },
        }}
      >
        {sidebarContent}
      </Drawer>
    );
  }

  // Desktop: Permanent Fixed Drawer
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
          backgroundColor: theme.palette.mode === 'dark' ? '#0B0F19' : '#FFFFFF',
        },
      }}
    >
      {sidebarContent}
    </Drawer>
  );
};
