import { createTheme, ThemeOptions } from '@mui/material/styles';

export const getThemeOptions = (mode: 'light' | 'dark'): ThemeOptions => {
  const isDark = mode === 'dark';

  return {
    palette: {
      mode,
      primary: {
        main: '#10B981', // Emerald 500
        light: '#34D399',
        dark: '#059669',
        contrastText: '#FFFFFF',
      },
      secondary: {
        main: '#6366F1', // Indigo 500
        light: '#818CF8',
        dark: '#4F46E5',
        contrastText: '#FFFFFF',
      },
      success: {
        main: '#10B981',
        light: '#D1FAE5',
        dark: '#047857',
      },
      warning: {
        main: '#F59E0B',
        light: '#FEF3C7',
        dark: '#D97706',
      },
      error: {
        main: '#EF4444',
        light: '#FEE2E2',
        dark: '#B91C1C',
      },
      info: {
        main: '#3B82F6',
        light: '#DBEAFE',
        dark: '#1D4ED8',
      },
      background: {
        default: isDark ? '#0B0F19' : '#F8FAFC',
        paper: isDark ? '#111827' : '#FFFFFF',
      },
      text: {
        primary: isDark ? '#F9FAFB' : '#0F172A',
        secondary: isDark ? '#9CA3AF' : '#64748B',
      },
      divider: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)',
    },
    typography: {
      fontFamily: [
        'Inter',
        '-apple-system',
        'BlinkMacSystemFont',
        '"Segoe UI"',
        'Roboto',
        '"Helvetica Neue"',
        'Arial',
        'sans-serif',
      ].join(','),
      h1: { fontSize: '2.25rem', fontWeight: 700, letterSpacing: '-0.025em' },
      h2: { fontSize: '1.875rem', fontWeight: 700, letterSpacing: '-0.02em' },
      h3: { fontSize: '1.5rem', fontWeight: 600, letterSpacing: '-0.02em' },
      h4: { fontSize: '1.25rem', fontWeight: 600, letterSpacing: '-0.01em' },
      h5: { fontSize: '1.125rem', fontWeight: 600 },
      h6: { fontSize: '1rem', fontWeight: 600 },
      subtitle1: { fontSize: '1rem', fontWeight: 500 },
      subtitle2: { fontSize: '0.875rem', fontWeight: 500 },
      body1: { fontSize: '0.9375rem', lineHeight: 1.5 },
      body2: { fontSize: '0.8125rem', lineHeight: 1.5 },
      button: { textTransform: 'none', fontWeight: 600 },
    },
    shape: {
      borderRadius: 14,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 10,
            padding: '8px 18px',
            boxShadow: 'none',
            '&:hover': {
              boxShadow: 'none',
            },
          },
          containedPrimary: {
            backgroundColor: '#10B981',
            color: '#FFFFFF',
            '&:hover': {
              backgroundColor: '#059669',
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 16,
            backgroundImage: 'none',
            border: isDark
              ? '1px solid rgba(255, 255, 255, 0.08)'
              : '1px solid rgba(0, 0, 0, 0.06)',
            boxShadow: isDark
              ? '0 4px 20px 0 rgba(0, 0, 0, 0.35)'
              : '0 4px 20px 0 rgba(0, 0, 0, 0.04)',
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            fontWeight: 600,
            borderRadius: 8,
          },
        },
      },
      MuiTextField: {
        defaultProps: {
          variant: 'outlined',
          size: 'small',
        },
      },
      MuiInputLabel: {
        styleOverrides: {
          root: {
            fontSize: '0.875rem',
          },
          outlined: {
            '&.MuiInputLabel-shrink': {
              transform: 'translate(14px, -9px) scale(0.75)',
            },
          },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: 10,
          },
          notchedOutline: {
            legend: {
              fontSize: '0.75em',
            },
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            borderRadius: 20,
            backgroundImage: 'none',
          },
        },
      },
    },
  };
};
