// const { createGlobPatternsForDependencies } = require('@nx/next/tailwind');

// The above utility import will not work if you are using Next.js' --turbo.
// Instead you will have to manually add the dependent paths to be included.
// For example
// ../libs/buttons/**/*.{ts,tsx,js,jsx,html}',                 <--- Adding a shared lib
// !../libs/buttons/**/*.{stories,spec}.{ts,tsx,js,jsx,html}', <--- Skip adding spec/stories files from shared lib

// If you are **not** using `--turbo` you can uncomment both lines 1 & 19.
// A discussion of the issue can be found: https://github.com/nrwl/nx/issues/26510

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './{src,pages,components,app,ui}/**/*.{ts,tsx,js,jsx,html}',
    '!./{src,pages,components,app,ui}/**/*.{stories,spec}.{ts,tsx,js,jsx,html}',
    //     ...createGlobPatternsForDependencies(__dirname)
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--color-background)',
        foreground: 'var(--color-foreground)',
        muted: 'var(--color-muted)',
        'muted-foreground': 'var(--color-muted-foreground)',
        gary: {
          primary: 'var(--color-primary)',
          'primary-foreground': 'var(--color-primary-foreground)',
          secondary: 'var(--color-secondary)',
          'secondary-foreground': 'var(--color-secondary-foreground)',
          accent: 'var(--color-accent)',
          'accent-foreground': 'var(--color-accent-foreground)',
          success: 'var(--color-success)',
          warning: 'var(--color-warning)',
          danger: 'var(--color-danger)',
        },
      },
      fontFamily: {
        sans: [
          'Inter',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'Noto Sans',
          'sans-serif',
        ],
        display: [
          'Inter',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'Noto Sans',
          'sans-serif',
        ],
        mono: [
          'ui-monospace',
          'SFMono-Regular',
          'Menlo',
          'Monaco',
          'Consolas',
          'Liberation Mono',
          'Courier New',
          'monospace',
        ],
      },
      fontSize: {
        'display-2xl': [
          '3.75rem',
          { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '700' },
        ],
        'display-xl': [
          '3rem',
          { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '700' },
        ],
        'display-lg': [
          '2.25rem',
          { lineHeight: '1.15', letterSpacing: '-0.01em', fontWeight: '700' },
        ],
        'heading-1': ['2rem', { lineHeight: '2.5rem', fontWeight: '700' }],
        'heading-2': ['1.5rem', { lineHeight: '2rem', fontWeight: '600' }],
        'heading-3': ['1.25rem', { lineHeight: '1.75rem', fontWeight: '600' }],
        'body-lg': ['1.125rem', { lineHeight: '1.75rem' }],
        body: ['1rem', { lineHeight: '1.6' }],
        small: ['0.875rem', { lineHeight: '1.25rem' }],
        caption: ['0.75rem', { lineHeight: '1rem' }],
      },
      spacing: {
        xxs: '0.25rem',
        xs: '0.5rem',
        sm: '0.75rem',
        md: '1rem',
        lg: '1.5rem',
        xl: '2rem',
        '2xl': '3rem',
        '3xl': '4rem',
        gutter: '1.25rem',
      },
    },
  },
  plugins: [],
};
