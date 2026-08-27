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
} from '@mui/icons-material';
import { useColorMode } from '../../theme/ThemeProvider';
import { useAuthStore } from '../../stores/authStore';
import { useBudgetStore } from '../../stores/budgetStore';
import { getMonthName } from '../../lib/formatters';
import { useRouter } from 'next/navigation';

interface AppHeaderProps {
  onOpenAddExpense: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({ onOpenAddExpense }) => {
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
            ? 'rgba(11, 15, 25, 0.85)'
            : 'rgba(255, 255, 255, 0.85)',
        backdropFilter: 'blur(12px)',
        zIndex: (theme) => theme.zIndex.drawer + 1,
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 2, md: 3 } }}>
        {/* Left: Brand Logo & Title */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 38,
              height: 38,
              borderRadius: '10px',
              backgroundColor: '#10B981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              fontWeight: 800,
              fontSize: '1.2rem',
              boxShadow: '0 2px 10px rgba(16, 185, 129, 0.3)',
            }}
          >
            ₦
          </Box>
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
            p: 0.5,
            border: (theme) => `1px solid ${theme.palette.divider}`,
          }}
        >
          <IconButton size="small" onClick={prevMonth} sx={{ p: 0.75 }}>
            <ChevronLeft fontSize="small" />
          </IconButton>

          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              px: { xs: 1.5, sm: 2 },
            }}
          >
            <CalendarMonth fontSize="small" color="primary" />
            <Typography variant="body2" fontWeight={700} noWrap>
              {getMonthName(selectedMonth)} {selectedYear}
            </Typography>
          </Box>

          <IconButton size="small" onClick={nextMonth} sx={{ p: 0.75 }}>
            <ChevronRight fontSize="small" />
          </IconButton>
        </Box>

        {/* Right: Quick Action + Theme Mode + User Avatar */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<Add />}
            onClick={onOpenAddExpense}
            size="small"
            sx={{ display: { xs: 'none', sm: 'flex' }, fontWeight: 700 }}
          >
            Add Expense
          </Button>

          <IconButton
            onClick={toggleColorMode}
            color="inherit"
            size="small"
            sx={{
              backgroundColor: (theme) =>
                theme.palette.mode === 'dark'
                  ? 'rgba(255, 255, 255, 0.05)'
                  : 'rgba(0, 0, 0, 0.04)',
            }}
          >
            {mode === 'dark' ? <Brightness7 fontSize="small" /> : <Brightness4 fontSize="small" />}
          </IconButton>

          <IconButton onClick={handleMenuOpen} size="small" sx={{ p: 0 }}>
            <Avatar
              sx={{
                width: 36,
                height: 36,
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
