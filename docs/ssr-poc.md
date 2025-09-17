## SSR POC: Tailwind vs Material UI

### Goals

- Compare TailwindCSS and Material UI (MUI) impact on SSR-first Next.js apps.
- Establish patterns for scalable SSR apps in this monorepo (Nx + Next 15).

### Hypotheses

| Factor             | TailwindCSS (SSR)              | MUI (SSR)                         |
| ------------------ | ------------------------------ | --------------------------------- |
| Runtime Overhead   | **Low**                        | **High** (Emotion)                |
| SSR Speed          | **Fast**                       | Slower (style generation)         |
| Client Bundle Size | **Smaller**                    | Larger                            |
| Hydration Cost     | **Minimal**                    | Noticeable                        |
| DX (Dev Speed)     | Moderate (manual components)   | **High** (prebuilt components)    |
| Accessibility      | Manual effort                  | **Baked-in**                      |
| Theming            | Limited                        | **Powerful & flexible**           |
| Best For           | Perf-sensitive, SSR-heavy apps | Feature-rich UIs, enterprise apps |

### Control project

The Gary project is the control project. It is a Next.js app that uses TailwindCSS for styling. It will be used to compare the performance of MUI and TailwindCSS. So, it should create a new app using Gary as base but using MUI for styling.

#### Gary's main stack

- Next.js 15
- TailwindCSS
- Jest
- next-auth
- zod
- App Router

#### Gary's main features to be recreated using MUI

- Auth using next-auth
- CSS tokens using apps/gary/tailwind.config.js file as base
- Gary's home (apps/gary/src/app/page.tsx)
- Gary's apps/gary/src/app/(public)/plans view
- Gary's apps/gary/src/app/(public)/register view

### Plan

The new app will be called `gary-mui` and it should use the Gary's main stack and features to be recreated using MUI. It should use SSR first methodology, avoiding client-side components and using the App Router.

#### step 1

Create the app using Nx generator

1. Generate a new Next.js app (Material UI) using Nx

```bash
yarn nx g @nx/next:app gary-mui --style=css --ssr --unitTestRunner=jest --e2eTestRunner=none
```

2. Add dependencies at workspace root

```bash
yarn add -W @mui/material @mui/icons-material @mui/lab @emotion/react @emotion/styled @mui/material-nextjs @next/bundle-analyzer
```

#### step 2

Add design tokens CSS and global CSS for parity

Create `apps/gary-mui/src/app/global.css`:

```css
/* Fubs design tokens */
:root {
  /* Brand palette */
  --color-primary: #2563eb; /* Fubs Blue */
  --color-primary-foreground: #ffffff;
  --color-secondary: #9333ea; /* Purple accent */
  --color-secondary-foreground: #ffffff;
  --color-accent: #06b6d4; /* Cyan accent */
  --color-accent-foreground: #0b1220;
  --color-success: #16a34a; /* Green */
  --color-warning: #f59e0b; /* Amber */
  --color-danger: #dc2626; /* Red */

  /* Surfaces (dark default) */
  --color-background: #0b1220; /* Rich dark navy */
  --color-foreground: #e5e7eb; /* Light text */
  --color-muted: #0f172a; /* Muted surface */
  --color-muted-foreground: #94a3b8; /* Muted text */
}

/* Light theme override: apply .light on <html> or <body> */
.light {
  --color-background: #ffffff;
  --color-foreground: #0f172a;
  --color-muted: #f1f5f9;
  --color-muted-foreground: #475569;
}

html,
body {
  margin: 0;
  background: var(--color-background);
  color: var(--color-foreground);
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica Neue, Arial, Noto Sans, sans-serif;
}
```

Import `global.css` in the root layout

Add at the top of `apps/gary-mui/src/app/layout.tsx`:

```tsx
import './global.css';
```

Create the theme config file mapping Gary's CSS tokens

Create `apps/gary-mui/src/theme.ts`:

```ts
import { createTheme } from '@mui/material/styles';

const v = (name: string) => `var(${name})`;

export const theme = createTheme({
  palette: {
    mode: 'dark',
    background: { default: v('--color-background'), paper: v('--color-muted') },
    text: { primary: v('--color-foreground'), secondary: v('--color-muted-foreground') },
    primary: { main: v('--color-primary'), contrastText: v('--color-primary-foreground') },
    secondary: { main: v('--color-secondary'), contrastText: v('--color-secondary-foreground') },
    success: { main: v('--color-success') },
    warning: { main: v('--color-warning') },
    error: { main: v('--color-danger') },
    info: { main: v('--color-accent'), contrastText: v('--color-accent-foreground') },
  },
  typography: {
    fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica Neue, Arial, Noto Sans, sans-serif',
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
```

Theme provider

Create `apps/gary-mui/src/app/ThemeRegistry.tsx`:

```tsx
'use client';

import { PropsWithChildren } from 'react';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { theme } from '../theme';

export default function ThemeRegistry({ children }: PropsWithChildren) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
```

Wire SSR cache provider (Emotion) in root layout

Edit `apps/gary-mui/src/app/layout.tsx`:

```tsx
import type { Metadata } from 'next';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import ThemeRegistry from './ThemeRegistry';
import { Roboto } from 'next/font/google';

export const metadata: Metadata = {
  title: 'Gary MUI',
  description: 'Next + MUI SSR baseline',
};

const roboto = Roboto({
  subsets: ['latin'],
  weight: ['300', '400', '500', '700'],
  display: 'swap',
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={roboto.className}>
        <AppRouterCacheProvider options={{ enableCssLayer: true }}>
          <ThemeRegistry>{children}</ThemeRegistry>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
```

#### step 3

Replicate the Gary's auth system using next-auth on the new app

#### step 4

Replicate the Gary's home view

#### step 5

Replicate the Gary's register view

#### step 6

Replicate the Gary's plans view

### Enable bundle analyzer

Create/replace `apps/gary-mui/next.config.js`:

```js
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: { instrumentationHook: false },
};

module.exports = withBundleAnalyzer(nextConfig);
```

#### How to run and validate

```bash
yarn nx serve gary-mui
```

- Verify SSR: View page source and confirm Emotion CSS is inlined.
- Check hydration: Navigate between routes and ensure no style flicker.

Analyze bundle sizes:

```bash
ANALYZE=true yarn nx build gary-mui
```
