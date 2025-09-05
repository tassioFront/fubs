'use server';
import FubsLogo from '@/ui/FubsLogo';
import { SignOutBtn } from '@/ui/SignOutBtn';
import { type ReactNode } from 'react';

interface OnboardingLayoutProps {
  children: ReactNode;
}

export default async function OnboardingLayout({
  children,
}: OnboardingLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-muted">
        <div className="max-w-7xl mx-auto px-gutter py-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <FubsLogo />
              <div className="mx-md text-muted-foreground">|</div>

              <h2 className="text-heading-2 font-bold text-foreground">
                Your Space
              </h2>
            </div>
            <SignOutBtn />
          </div>
        </div>
      </header>

      <main>{children}</main>

      <footer className="border-t border-muted mt-auto">
        <div className="max-w-7xl mx-auto px-gutter py-lg">
          <div className="text-center text-small text-muted-foreground">
            © 2025 Your App. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
