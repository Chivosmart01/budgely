'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Button,
  Card,
  CardContent,
  Chip,
  IconButton,
  Tooltip,
  Skeleton,
} from '@mui/material';
import {
  Add,
  ContentCopy,
  DeleteOutline,
  ArrowForward,
  CalendarMonth,
  AccountBalanceWallet,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { apiClient } from '../../../lib/api-client';
import { formatNaira, getMonthName } from '../../../lib/formatters';
import { ProgressBar } from '../../../components/ui/ProgressBar';
import { EmptyState } from '../../../components/ui/EmptyState';
import { CreateBudgetDialog } from '../../../components/dialogs/CreateBudgetDialog';
import { CopyBudgetDialog } from '../../../components/dialogs/CopyBudgetDialog';
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog';
import { useBudgetStore } from '../../../stores/budgetStore';

export default function BudgetsPage() {
  const router = useRouter();
  const { setMonthYear, triggerRefresh } = useBudgetStore();
  const [budgets, setBudgets] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Dialogs
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [copyTarget, setCopyTarget] = useState<any | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const fetchBudgets = async () => {
    try {
      const res: any = await apiClient.get('/budgets');
      setBudgets(res.data || []);
    } catch (err) {
      console.error('Failed to load budgets', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgets();
  }, []);

  const handleDeleteBudget = async () => {
    if (!deleteTargetId) return;
    try {
      await apiClient.delete(`/budgets/${deleteTargetId}`);
      fetchBudgets();
      triggerRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to delete budget');
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Skeleton variant="rectangular" height={40} width={240} sx={{ borderRadius: 2 }} />
        <Grid container spacing={3}>
          {[1, 2, 3].map((i) => (
            <Grid item xs={12} md={4} key={i}>
              <Skeleton variant="rectangular" height={220} sx={{ borderRadius: 4 }} />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight={800} sx={{ letterSpacing: '-0.02em' }}>
            Monthly Salary Budgets
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage your past, present, and future monthly income allocation plans
          </Typography>
        </Box>

        <Button
          variant="contained"
          color="primary"
          startIcon={<Add />}
          onClick={() => setIsCreateOpen(true)}
          sx={{ fontWeight: 700 }}
        >
          Create New Budget
        </Button>
      </Box>

      {/* Budgets List Grid */}
      {budgets.length === 0 ? (
        <EmptyState
          icon={<CalendarMonth sx={{ fontSize: 32 }} />}
          title="No Budgets Created Yet"
          description="Create your first monthly salary budget to start allocating your earnings into categories."
          actionText="Create Monthly Budget"
          onAction={() => setIsCreateOpen(true)}
        />
      ) : (
        <Grid container spacing={3}>
          {budgets.map((b) => (
            <Grid item xs={12} md={6} lg={4} key={b.id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  '&:hover': { transform: 'translateY(-3px)' },
                }}
              >
                <CardContent sx={{ p: 3, flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: '10px',
                          bgcolor: 'primary.light',
                          color: 'primary.main',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <AccountBalanceWallet fontSize="small" />
                      </Box>
                      <Box>
                        <Typography variant="h6" fontWeight={700}>
                          {b.monthName} {b.year}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {b.categoriesCount} categories • {b.expensesCount} expenses
                        </Typography>
                      </Box>
                    </Box>

                    <Box>
                      <Tooltip title="Copy as template to another month">
                        <IconButton size="small" onClick={() => setCopyTarget(b)}>
                          <ContentCopy fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete budget">
                        <IconButton size="small" color="error" onClick={() => setDeleteTargetId(b.id)}>
                          <DeleteOutline fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>

                  {/* Financial Values Grid */}
                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5, my: 2 }}>
                    <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' }}>
                      <Typography variant="caption" color="text.secondary">
                        Income / Salary
                      </Typography>
                      <Typography variant="subtitle2" fontWeight={700}>
                        {formatNaira(b.totalIncome)}
                      </Typography>
                    </Box>

                    <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' }}>
                      <Typography variant="caption" color="text.secondary">
                        Total Spent
                      </Typography>
                      <Typography variant="subtitle2" fontWeight={700} color={b.totalSpent > b.totalIncome ? 'error.main' : 'text.primary'}>
                        {formatNaira(b.totalSpent)}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ mt: 2, mb: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="caption" color="text.secondary">
                        Remaining: <strong>{formatNaira(b.remaining)}</strong>
                      </Typography>
                      <Typography variant="caption" fontWeight={700}>
                        {b.utilization.toFixed(1)}%
                      </Typography>
                    </Box>
                    <ProgressBar value={b.utilization} height={8} />
                  </Box>
                </CardContent>

                <Box sx={{ p: 2, pt: 0 }}>
                  <Button
                    variant="contained"
                    fullWidth
                    endIcon={<ArrowForward />}
                    onClick={() => {
                      setMonthYear(b.month, b.year);
                      router.push('/dashboard');
                    }}
                    sx={{ fontWeight: 700 }}
                  >
                    Open Month Dashboard
                  </Button>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Create Dialog */}
      <CreateBudgetDialog
        open={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={() => {
          fetchBudgets();
          triggerRefresh();
        }}
      />

      {/* Copy Dialog */}
      {copyTarget && (
        <CopyBudgetDialog
          open={Boolean(copyTarget)}
          sourceBudgetId={copyTarget.id}
          sourceMonthName={copyTarget.monthName}
          sourceYear={copyTarget.year}
          onClose={() => setCopyTarget(null)}
          onSuccess={() => {
            fetchBudgets();
            triggerRefresh();
          }}
        />
      )}

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        open={Boolean(deleteTargetId)}
        title="Delete Budget?"
        message="Are you sure you want to delete this monthly budget? All categories and logged expenses for this month will be permanently removed."
        confirmText="Yes, Delete Budget"
        onConfirm={handleDeleteBudget}
        onClose={() => setDeleteTargetId(null)}
      />
    </Box>
  );
}
