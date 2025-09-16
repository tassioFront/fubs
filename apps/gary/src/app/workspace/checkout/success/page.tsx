import { redirect } from 'next/navigation';
import { Btn } from '@/ui/Btn';

interface CheckoutSuccessProps {
  searchParams: Promise<{
    session_id?: string;
  }>;
}

const getCheckoutSession = async (sessionId: string) => {
  const response = await fetch(`/api/checkout/sessions/${sessionId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch checkout session');
  }
  return response.json();
};

const getEntitlement = async () => {
  const response = await fetch(`/api/entitlements`);
  if (!response.ok) {
    throw new Error('Failed to fetch entitlement');
  }
  return response.json();
};

export default async function CheckoutSuccessPage({
  searchParams,
}: CheckoutSuccessProps) {
  const params = await searchParams;
  const sessionId = params.session_id;

  if (!sessionId) {
    redirect('/plans');
  }

  let sessionConfirmed = false;
  let entitlementActive = false;
  let error: string | null = null;

  try {
    // Verify the checkout session
    await getCheckoutSession(sessionId);
    sessionConfirmed = true;

    // Check entitlement status
    const entitlement = await getEntitlement();
    entitlementActive = entitlement.status === 'ACTIVE';
  } catch (err) {
    console.error('Error verifying checkout:', err);
    error = 'Failed to verify your purchase. Please contact support.';
  }

  // If everything is active, redirect to app
  if (sessionConfirmed && entitlementActive) {
    redirect('/app');
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="max-w-md mx-auto px-gutter">
        <div className="text-center">
          {error ? (
            <>
              <div className="w-16 h-16 bg-gary-danger/10 rounded-full flex items-center justify-center mx-auto mb-lg">
                <svg
                  className="w-8 h-8 text-gary-danger"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
              <h1 className="text-heading-1 font-bold text-foreground mb-md">
                Payment Verification Failed
              </h1>
              <p className="text-body text-muted-foreground mb-xl">{error}</p>
              <div className="space-y-md">
                <Btn variant="primary" fullWidth>
                  <a href="/plans">Back to Plans</a>
                </Btn>
                <Btn variant="secondary" fullWidth>
                  <a href="mailto:support@yourapp.com">Contact Support</a>
                </Btn>
              </div>
            </>
          ) : sessionConfirmed && !entitlementActive ? (
            <>
              <div className="w-16 h-16 bg-gary-warning/10 rounded-full flex items-center justify-center mx-auto mb-lg">
                <svg
                  className="w-8 h-8 text-gary-warning animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              </div>
              <h1 className="text-heading-1 font-bold text-foreground mb-md">
                Finalizing Your Purchase
              </h1>
              <p className="text-body text-muted-foreground mb-xl">
                Your payment was successful! We&apos;re activating your account
                now. This usually takes just a few moments.
              </p>
              <div className="mb-lg">
                <div className="text-small text-muted-foreground">
                  This page will automatically refresh...
                </div>
              </div>
              <script
                dangerouslySetInnerHTML={{
                  __html: `
                    setTimeout(() => {
                      window.location.reload();
                    }, 3000);
                  `,
                }}
              />
            </>
          ) : (
            <>
              <div className="w-16 h-16 bg-gary-success/10 rounded-full flex items-center justify-center mx-auto mb-lg">
                <svg
                  className="w-8 h-8 text-gary-success"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h1 className="text-heading-1 font-bold text-foreground mb-md">
                Welcome to Your New Plan!
              </h1>
              <p className="text-body text-muted-foreground mb-xl">
                Your payment was successful and your account is now active.
                Let&apos;s get started!
              </p>
              <Btn variant="primary" fullWidth>
                <a href="/app">Go to Dashboard</a>
              </Btn>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
