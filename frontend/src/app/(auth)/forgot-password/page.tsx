'use client';

import React, { useState } from 'react';
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
} from '@mui/material';
import { LockReset, ArrowBack, CheckCircleOutline } from '@mui/icons-material';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiClient } from '../../../lib/api-client';

export default function ForgotPasswordPage() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successData, setSuccessData] = useState<{ message: string; resetLink?: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');
    setSuccessData(null);

    try {
      const res = await apiClient.post('/auth/forgot-password', {
        email: email.trim(),
      });
      setSuccessData(res.data);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to process password reset request');
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
              Reset Password
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Enter your email address and we&apos;ll generate a secure password reset link
            </Typography>
          </Box>

          {errorMessage && (
            <Alert severity="error" sx={{ mb: 2.5 }}>
              {errorMessage}
            </Alert>
          )}

          {successData ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <Alert
                severity="success"
                icon={<CheckCircleOutline fontSize="inherit" />}
                sx={{ borderRadius: 2 }}
              >
                {successData.message}
              </Alert>

              {successData.resetLink && (
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 2.5,
                    bgcolor: (theme) =>
                      theme.palette.mode === 'dark' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.06)',
                    border: '1px solid rgba(16, 185, 129, 0.25)',
                  }}
                >
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                    Click below to set your new password:
                  </Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    onClick={() => router.push(successData.resetLink!)}
                    sx={{ fontWeight: 700, py: 1 }}
                  >
                    Proceed to Reset Password
                  </Button>
                </Box>
              )}

              <Button
                variant="outlined"
                color="inherit"
                fullWidth
                onClick={() => {
                  setSuccessData(null);
                  setEmail('');
                }}
                sx={{ py: 1 }}
              >
                Send Another Link
              </Button>
            </Box>
          ) : (
            <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <TextField
                label="Registered Email Address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                fullWidth
                required
                autoFocus
              />

              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={isLoading}
                fullWidth
                sx={{ py: 1.25, fontWeight: 700 }}
              >
                {isLoading ? 'Processing...' : 'Send Reset Link'}
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
