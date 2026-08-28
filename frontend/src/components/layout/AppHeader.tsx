'use client';

import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Button,
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  useTheme,
} from '@mui/material';
import {
  ChevronLeft,
  ChevronRight,
  Brightness4,
  Brightness7,
  Add,
  Logout,
  Settings,
  Person,
  CalendarMonth,
  Menu as MenuIcon,
} from '@mui/icons-material';
import { useColorMode } from '../../theme/ThemeProvider';
import { useAuthStore } from '../../stores/authStore';
import { useBudgetStore } from '../../stores/budgetStore';
import { getMonthName } from '../../lib/formatters';
import { useRouter } from 'next/navigation';

interface AppHeaderProps {
  onOpenAddExpense: () => void;
  onOpenMobileSidebar?: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  onOpenAddExpense,
  onOpenMobileSidebar,
}) => {
  const theme = useTheme();
  const { mode, toggleColorMode } = useColorMode();
  const { user, logout } = useAuthStore();
  const { selectedMonth, selectedYear, nextMonth, prevMonth } = useBudgetStore();
  const router = useRouter();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const isMenuOpen = Boolean(anchorEl);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    handleMenuClose();
    await logout();
    router.push('/login');
  };

  return (
    <AppBar
      position="sticky"
      color="inherit"
      elevation={0}
      sx={{
        borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
        backgroundColor: (theme) =>
          theme.palette.mode === 'dark'
            ? 'rgba(11, 15, 25, 0.92)'
            : 'rgba(255, 255, 255, 0.92)',
        backdropFilter: 'blur(12px)',
        zIndex: (theme) => theme.zIndex.drawer + 1,
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 1.5, sm: 2.5, md: 3 }, minHeight: { xs: 58, sm: 64 } }}>
        {/* Left: Mobile Hamburger Menu & Brand Logo */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 1.5 } }}>
          {/* Sliding Sidebar Trigger for Mobile */}
          <IconButton
            onClick={onOpenMobileSidebar}
            size="medium"
            edge="start"
            color="inherit"
            aria-label="open drawer"
            sx={{
              display: { xs: 'flex', md: 'none' },
              p: 1,
              borderRadius: 2,
              backgroundColor: (theme) =>
                theme.palette.mode === 'dark'
                  ? 'rgba(255, 255, 255, 0.05)'
                  : 'rgba(0, 0, 0, 0.04)',
            }}
          >
            <MenuIcon fontSize="small" />
          </IconButton>

          <Typography
            variant="h6"
            fontWeight={800}
            sx={{
              color: 'text.primary',
              letterSpacing: '-0.02em',
              display: { xs: 'none', sm: 'block' },
            }}
          >
            Budgely
          </Typography>
        </Box>

        {/* Center: Month / Year Navigator */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: (theme) =>
              theme.palette.mode === 'dark'
                ? 'rgba(255, 255, 255, 0.05)'
                : 'rgba(0, 0, 0, 0.04)',
            borderRadius: '12px',
            p: 0.35,
            border: (theme) => `1px solid ${theme.palette.divider}`,
          }}
        >
          <IconButton size="small" onClick={prevMonth} sx={{ p: { xs: 0.5, sm: 0.75 } }}>
            <ChevronLeft fontSize="small" />
          </IconButton>

          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: { xs: 0.5, sm: 0.75 },
              px: { xs: 1, sm: 1.75 },
            }}
          >
            <CalendarMonth sx={{ fontSize: { xs: 16, sm: 18 } }} color="primary" />
            <Typography variant="body2" fontWeight={700} noWrap sx={{ fontSize: { xs: '0.78rem', sm: '0.875rem' } }}>
              {getMonthName(selectedMonth)} {selectedYear}
            </Typography>
          </Box>

          <IconButton size="small" onClick={nextMonth} sx={{ p: { xs: 0.5, sm: 0.75 } }}>
            <ChevronRight fontSize="small" />
          </IconButton>
        </Box>

        {/* Right: Quick Add Expense + Theme Mode + User Avatar */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 1.5 } }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<Add />}
            onClick={onOpenAddExpense}
            size="small"
            sx={{
              display: { xs: 'none', sm: 'flex' },
              fontWeight: 700,
              borderRadius: 2,
              px: 1.75,
            }}
          >
            Add Expense
          </Button>

          {/* Quick Add icon button on mobile */}
          <IconButton
            onClick={onOpenAddExpense}
            color="primary"
            size="small"
            sx={{
              display: { xs: 'flex', sm: 'none' },
              backgroundColor: 'rgba(16, 185, 129, 0.12)',
              p: 0.75,
            }}
          >
            <Add fontSize="small" />
          </IconButton>

          <IconButton
            onClick={toggleColorMode}
            color="inherit"
            size="small"
            sx={{
              backgroundColor: (theme) =>
                theme.palette.mode === 'dark'
                  ? 'rgba(255, 255, 255, 0.05)'
                  : 'rgba(0, 0, 0, 0.04)',
              p: { xs: 0.75, sm: 1 },
            }}
          >
            {mode === 'dark' ? <Brightness7 fontSize="small" /> : <Brightness4 fontSize="small" />}
          </IconButton>

          <IconButton onClick={handleMenuOpen} size="small" sx={{ p: 0 }}>
            <Avatar
              sx={{
                width: { xs: 32, sm: 36 },
                height: { xs: 32, sm: 36 },
                bgcolor: 'primary.main',
                fontSize: '0.875rem',
                fontWeight: 700,
              }}
            >
              {user?.name ? user.name[0].toUpperCase() : 'U'}
            </Avatar>
          </IconButton>

          <Menu
            anchorEl={anchorEl}
            open={isMenuOpen}
            onClose={handleMenuClose}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            PaperProps={{
              sx: {
                minWidth: 200,
                mt: 1,
                borderRadius: 3,
                boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
              },
            }}
          >
            <Box sx={{ px: 2, py: 1.5 }}>
              <Typography variant="subtitle2" fontWeight={700}>
                {user?.name || 'User'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {user?.email || 'user@example.com'}
              </Typography>
            </Box>
            <Divider />
            <MenuItem
              onClick={() => {
                handleMenuClose();
                router.push('/settings');
              }}
            >
              <ListItemIcon>
                <Person fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Account Profile" />
            </MenuItem>
            <MenuItem
              onClick={() => {
                handleMenuClose();
                router.push('/settings');
              }}
            >
              <ListItemIcon>
                <Settings fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Settings" />
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
              <ListItemIcon sx={{ color: 'error.main' }}>
                <Logout fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Log Out" />
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};
