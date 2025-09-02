import Link from 'next/link';
import { AnchorHTMLAttributes, forwardRef } from 'react';

type LinkBtnVariant =
  | 'primary'
  | 'secondary'
  | 'accent'
  | 'success'
  | 'warning'
  | 'danger';

interface LinkBtnProps
  extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
  href: string;
  variant?: LinkBtnVariant;
  fullWidth?: boolean;
  external?: boolean;
}

const variantClasses: Record<LinkBtnVariant, string> = {
  primary:
    'bg-gary-primary text-gary-primary-foreground hover:bg-gary-primary/90',
  secondary:
    'bg-gary-secondary text-gary-secondary-foreground hover:bg-gary-secondary/90',
  accent: 'bg-gary-accent text-gary-accent-foreground hover:bg-gary-accent/90',
  success: 'bg-gary-success text-white hover:bg-gary-success/90',
  warning: 'bg-gary-warning text-white hover:bg-gary-warning/90',
  danger: 'bg-gary-danger text-white hover:bg-gary-danger/90',
};

export const LinkBtn = forwardRef<HTMLAnchorElement, LinkBtnProps>(
  (
    {
      href,
      variant = 'primary',
      fullWidth = false,
      external = false,
      className = '',
      children,
      ...props
    },
    ref
  ) => {
    const linkClasses = `inline-flex items-center justify-center font-sans font-medium rounded-md px-md py-xs text-body-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gary-primary/70 focus-visible:ring-offset-2 disabled:opacity-60 disabled:pointer-events-none px-10 py-3 ${
      variantClasses[variant]
    }${fullWidth ? ' w-full' : ''} ${className}`;

    if (external) {
      return (
        <a
          ref={ref}
          href={href}
          className={linkClasses}
          target="_blank"
          rel="noopener noreferrer"
          {...props}
        >
          <span className="flex items-center justify-center gap-2 min-w-[1.5em] min-h-[1.5em]">
            {children}
          </span>
        </a>
      );
    }

    return (
      <Link ref={ref} href={href} className={linkClasses} {...props}>
        <span className="flex items-center justify-center gap-2 min-w-[1.5em] min-h-[1.5em]">
          {children}
        </span>
      </Link>
    );
  }
);

LinkBtn.displayName = 'LinkBtn';
