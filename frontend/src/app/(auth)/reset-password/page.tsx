'use client';

import React, { useState, useEffect, Suspense } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Alert,
  Divider,
  Link as MuiLink,
  CircularProgress,
} from '@mui/material';
import { LockReset, ArrowBack, CheckCircleOutline } from '@mui/icons-material';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { apiClient } from '../../../lib/api-client';

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const queryToken = searchParams.get('token');
    if (queryToken) {
      setToken(queryToken);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!token.trim()) {
      setErrorMessage('Reset token is required.');
      return;
    }

    if (newPassword.length < 6) {
      setErrorMessage('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setIsLoading(true);

    try {
      await apiClient.post('/auth/reset-password', {
        token: token.trim(),
        newPassword,
      });
      setIsSuccess(true);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to reset password. The link may have expired.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
        bgcolor: 'background.default',
      }}
    >
      <Card sx={{ maxWidth: 440, width: '100%', borderRadius: 4, p: { xs: 1, sm: 2 } }}>
        <CardContent sx={{ p: 3 }}>
          {/* Logo & Header */}
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Box
              sx={{
                width: 52,
                height: 52,
                borderRadius: '16px',
                backgroundColor: '#10B981',
                color: '#FFFFFF',
                fontSize: '1.75rem',
                fontWeight: 900,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 1.5,
                boxShadow: '0 4px 20px rgba(16, 185, 129, 0.4)',
              }}
            >
              <LockReset sx={{ fontSize: 30 }} />
            </Box>
            <Typography variant="h5" fontWeight={800} gutterBottom>
              Set New Password
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Create a strong, new password for your Budgely account
            </Typography>
          </Box>

          {errorMessage && (
            <Alert severity="error" sx={{ mb: 2.5 }}>
              {errorMessage}
            </Alert>
          )}

          {isSuccess ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <Alert
                severity="success"
                icon={<CheckCircleOutline fontSize="inherit" />}
                sx={{ borderRadius: 2 }}
              >
                Your password has been reset successfully! You can now log in with your new credentials.
              </Alert>

              <Button
                variant="contained"
                color="primary"
                fullWidth
                onClick={() => router.push('/login')}
                sx={{ py: 1.25, fontWeight: 700 }}
              >
                Sign In Now
              </Button>
            </Box>
          ) : (
            <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {!searchParams.get('token') && (
                <TextField
                  label="Reset Token"
                  type="text"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="Paste reset token from email"
                  fullWidth
                  required
                />
              )}

              <TextField
                label="New Password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 6 characters"
                fullWidth
                required
                autoFocus
              />

              <TextField
                label="Confirm New Password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat new password"
                fullWidth
                required
              />

              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={isLoading}
                fullWidth
                sx={{ py: 1.25, fontWeight: 700, mt: 1 }}
              >
                {isLoading ? 'Resetting Password...' : 'Reset Password'}
              </Button>
            </Box>
          )}

          <Divider sx={{ my: 3 }} />

          <Box sx={{ textAlign: 'center' }}>
            <MuiLink
              component={Link}
              href="/login"
              variant="body2"
              color="text.secondary"
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.75,
                fontWeight: 600,
                textDecoration: 'none',
                '&:hover': { color: 'primary.main', textDecoration: 'underline' },
              }}
            >
              <ArrowBack fontSize="small" /> Back to Sign In
            </MuiLink>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <Box sx={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CircularProgress color="primary" />
        </Box>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
