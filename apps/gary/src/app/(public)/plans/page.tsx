'use server';

import { PlanCompleted } from '@fubs/shared/src/lib/types/plan';
import { getPlansWithPrices } from './actions';
import { PlanCard } from './components/PlanCard';

export default async function PlansPage() {
  let plans: PlanCompleted[] = [];
  let error: string | null = null;

  try {
    plans = await getPlansWithPrices();
  } catch {
    error = 'Failed to load plans. Please try again later.';
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-gutter py-3xl">
        <div className="text-center mb-3xl">
          <h1 className="text-display-xl font-bold text-foreground mb-lg">
            Choose Your Plan
          </h1>
          <p className="text-body-lg text-muted-foreground max-w-2xl mx-auto">
            Select the plan that best fits your needs. You can always upgrade or
            downgrade later as your requirements change.
          </p>
        </div>

        {error ? (
          <div className="bg-gary-danger/10 border border-gary-danger/20 rounded-lg p-xl text-center">
            <div className="text-gary-danger text-body mb-md">⚠️ {error}</div>
            <form action="/plans" method="get">
              <button
                type="submit"
                className="text-gary-primary hover:text-gary-primary/80 underline"
              >
                Try again
              </button>
            </form>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-xl">
            {plans.map((plan) => (
              <PlanCard key={plan.id} plan={plan} />
            ))}
          </div>
        )}

        {plans.length === 0 && !error && (
          <div className="text-center text-muted-foreground">
            <p className="text-body-lg">
              No plans available at the moment. Try later please
            </p>
          </div>
        )}

        <div className="mt-3xl text-center">
          <p className="text-small text-muted-foreground">
            Need help choosing? Contact our support team for personalized
            guidance.
          </p>
        </div>
      </div>
    </div>
  );
}
