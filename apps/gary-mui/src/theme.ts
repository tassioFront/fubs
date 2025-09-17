import { createTheme } from '@mui/material/styles';

const tokens = {
  primary: '#2563eb',
  primaryForeground: '#ffffff',
  secondary: '#9333ea',
  secondaryForeground: '#ffffff',
  accent: '#06b6d4',
  accentForeground: '#0b1220',
  success: '#16a34a',
  warning: '#f59e0b',
  danger: '#dc2626',
  background: '#0b1220',
  foreground: '#e5e7eb',
  muted: '#0f172a',
  mutedForeground: '#94a3b8',
};

export const theme = createTheme({
  palette: {
    mode: 'dark',
    background: { default: tokens.background, paper: tokens.muted },
    text: {
      primary: tokens.foreground,
      secondary: tokens.mutedForeground,
    },
    primary: {
      main: tokens.primary,
      contrastText: tokens.primaryForeground,
    },
    secondary: {
      main: tokens.secondary,
      contrastText: tokens.secondaryForeground,
    },
    success: { main: tokens.success },
    warning: { main: tokens.warning },
    error: { main: tokens.danger },
    info: {
      main: tokens.accent,
      contrastText: tokens.accentForeground,
    },
  },
  typography: {
    fontFamily:
      'Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica Neue, Arial, Noto Sans, sans-serif',
    h1: { fontSize: '2rem', fontWeight: 700, lineHeight: '2.5rem' },
    h2: { fontSize: '1.5rem', fontWeight: 600, lineHeight: '2rem' },
    h3: { fontSize: '1.25rem', fontWeight: 600, lineHeight: '1.75rem' },
    body1: { fontSize: '1rem', lineHeight: 1.6 },
    body2: { fontSize: '0.875rem', lineHeight: '1.25rem' },
  },
  spacing: (factor: number) => {
    const scale: Record<number, string> = {
      1: '0.25rem',
      2: '0.5rem',
      3: '0.75rem',
      4: '1rem',
      6: '1.5rem',
      8: '2rem',
      12: '3rem',
      16: '4rem',
    };
    return scale[factor] ?? `${0.25 * factor}rem`;
  },
});
