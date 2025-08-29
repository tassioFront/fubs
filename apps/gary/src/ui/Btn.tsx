import { ButtonHTMLAttributes, forwardRef } from 'react';

type BtnVariant =
  | 'primary'
  | 'secondary'
  | 'accent'
  | 'success'
  | 'warning'
  | 'danger';

interface BtnProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: BtnVariant;
  fullWidth?: boolean;
  loading?: boolean;
}

const variantClasses: Record<BtnVariant, string> = {
  primary:
    'bg-gary-primary text-gary-primary-foreground hover:bg-gary-primary/90',
  secondary:
    'bg-gary-secondary text-gary-secondary-foreground hover:bg-gary-secondary/90',
  accent: 'bg-gary-accent text-gary-accent-foreground hover:bg-gary-accent/90',
  success: 'bg-gary-success text-white hover:bg-gary-success/90',
  warning: 'bg-gary-warning text-white hover:bg-gary-warning/90',
  danger: 'bg-gary-danger text-white hover:bg-gary-danger/90',
};

export const Btn = forwardRef<HTMLButtonElement, BtnProps>(
  (
    {
      variant = 'primary',
      fullWidth = false,
      loading = false,
      disabled,
      className = '',
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        type={props.type || 'button'}
        className={`inline-flex items-center justify-center font-sans font-medium rounded-md px-md py-xs text-body-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gary-primary/70 focus-visible:ring-offset-2 disabled:opacity-60 disabled:pointer-events-none px-10 py-3 ${
          variantClasses[variant]
        }${fullWidth ? ' w-full' : ''} ${className}`}
        disabled={disabled || loading}
        aria-busy={loading}
        {...props}
      >
        <span className="flex items-center justify-center gap-2 min-w-[1.5em] min-h-[1.5em]">
          {loading && (
            <svg
              className="animate-spin h-5 w-5 text-inherit absolute"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <circle
                className="opacity-25"
                cx="8"
                cy="8"
                r="7"
                stroke="currentColor"
                strokeWidth="2"
              />
              <path
                className="opacity-90"
                fill="currentColor"
                d="M15 8a7 7 0 01-7 7V13a5 5 0 005-5h2z"
              />
            </svg>
          )}
          <span className={loading ? 'opacity-0' : 'opacity-100'}>
            {children}
          </span>
        </span>
      </button>
    );
  }
);
Btn.displayName = 'Btn';
