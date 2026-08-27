'use client';

import React, { useEffect, useState } from 'react';
import { Box, CircularProgress, Container } from '@mui/material';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../stores/authStore';
import { useBudgetStore } from '../../stores/budgetStore';
import { AppHeader } from '../../components/layout/AppHeader';
import { Sidebar, SIDEBAR_WIDTH } from '../../components/layout/Sidebar';
import { MobileNav } from '../../components/layout/MobileNav';
import { AddExpenseDialog } from '../../components/dialogs/AddExpenseDialog';
import { apiClient } from '../../lib/api-client';
import { BudgetCategory } from '../../types';

import { PageTransition } from '../../components/layout/PageTransition';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading, initAuth } = useAuthStore();
  const { selectedMonth, selectedYear, refreshTrigger, triggerRefresh } = useBudgetStore();
  const router = useRouter();

  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [activeBudgetId, setActiveBudgetId] = useState<string | undefined>(undefined);
  const [categories, setCategories] = useState<BudgetCategory[]>([]);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  // Fetch active budget categories for global quick-add expense dialog
  useEffect(() => {
    if (!isAuthenticated) return;
    apiClient
      .get(`/budgets/by-date?month=${selectedMonth}&year=${selectedYear}`)
      .then((res: any) => {
        if (res?.data) {
          setActiveBudgetId(res.data.id);
          setCategories(res.data.categories || []);
        } else {
          setActiveBudgetId(undefined);
          setCategories([]);
        }
      })
      .catch(() => {
        setActiveBudgetId(undefined);
        setCategories([]);
      });
  }, [isAuthenticated, selectedMonth, selectedYear, refreshTrigger]);

  if (isLoading) {
    return (
      <Box
        sx={{
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'background.default',
        }}
      >
        <CircularProgress color="primary" />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <Sidebar />

      <Box
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          pb: { xs: 8, md: 4 }, // padding for mobile bottom nav
        }}
      >
        <AppHeader onOpenAddExpense={() => setIsAddExpenseOpen(true)} />

        <Container maxWidth="xl" sx={{ mt: 3, mb: 4, px: { xs: 2, sm: 3 }, flexGrow: 1 }}>
          <PageTransition>{children}</PageTransition>
        </Container>
      </Box>

      <MobileNav />

      {/* Global Add Expense Modal */}
      <AddExpenseDialog
        open={isAddExpenseOpen}
        budgetId={activeBudgetId}
        categories={categories}
        onClose={() => setIsAddExpenseOpen(false)}
        onSuccess={() => {
          triggerRefresh();
        }}
      />
    </Box>
  );
}
