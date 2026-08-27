'use client';

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Grid,
  Alert,
  MenuItem,
  Divider,
} from '@mui/material';
import { useAuthStore } from '../../../stores/authStore';
import { apiClient } from '../../../lib/api-client';

export default function SettingsPage() {
  const { user, setUser } = useAuthStore();

  // Profile Form
  const [name, setName] = useState(user?.name || '');
  const [currency, setCurrency] = useState(user?.currency || 'NGN');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');

  // Password Form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    setProfileSuccess('');
    setProfileError('');

    try {
      const res: any = await apiClient.patch('/users/profile', {
        name: name.trim(),
        currency,
      });
      setUser(res.data);
      setProfileSuccess('Profile updated successfully!');
    } catch (err: any) {
      setProfileError(err.message || 'Failed to update profile');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirmation do not match.');
      return;
    }

    setIsChangingPassword(true);
    setPasswordSuccess('');
    setPasswordError('');

    try {
      await apiClient.patch('/auth/change-password', {
        currentPassword,
        newPassword,
      });
      setPasswordSuccess('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPasswordError(err.message || 'Failed to change password');
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Title */}
      <Box>
        <Typography variant="h4" fontWeight={800} sx={{ letterSpacing: '-0.02em' }}>
          Account Settings
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Manage your personal profile, currency defaults, and security credentials
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Profile Settings */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={700} gutterBottom>
                Profile & Currency
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                Update your display name and default currency configuration
              </Typography>

              {profileSuccess && <Alert severity="success" sx={{ mb: 2 }}>{profileSuccess}</Alert>}
              {profileError && <Alert severity="error" sx={{ mb: 2 }}>{profileError}</Alert>}

              <Box component="form" onSubmit={handleUpdateProfile} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  label="Email Address"
                  value={user?.email || ''}
                  disabled
                  fullWidth
                  helperText="Email cannot be changed"
                />

                <TextField
                  label="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  fullWidth
                  required
                />

                <TextField
                  select
                  label="Primary Currency"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  fullWidth
                >
                  <MenuItem value="NGN">Nigerian Naira (₦ / NGN)</MenuItem>
                  <MenuItem value="USD">US Dollar ($ / USD)</MenuItem>
                  <MenuItem value="GBP">British Pound (£ / GBP)</MenuItem>
                  <MenuItem value="EUR">Euro (€ / EUR)</MenuItem>
                </TextField>

                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={isUpdatingProfile}
                  sx={{ mt: 1, alignSelf: 'flex-start', fontWeight: 700 }}
                >
                  {isUpdatingProfile ? 'Saving...' : 'Save Profile'}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Security / Password Change */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={700} gutterBottom>
                Security & Password
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                Keep your financial account secure with a strong password
              </Typography>

              {passwordSuccess && <Alert severity="success" sx={{ mb: 2 }}>{passwordSuccess}</Alert>}
              {passwordError && <Alert severity="error" sx={{ mb: 2 }}>{passwordError}</Alert>}

              <Box component="form" onSubmit={handleChangePassword} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  label="Current Password"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  fullWidth
                  required
                />

                <TextField
                  label="New Password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  fullWidth
                  required
                />

                <TextField
                  label="Confirm New Password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  fullWidth
                  required
                />

                <Button
                  type="submit"
                  variant="outlined"
                  color="primary"
                  disabled={isChangingPassword}
                  sx={{ mt: 1, alignSelf: 'flex-start', fontWeight: 700 }}
                >
                  {isChangingPassword ? 'Updating...' : 'Change Password'}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
