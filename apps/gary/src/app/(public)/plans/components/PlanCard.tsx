'use server';

import { PlanCompleted, PlanType } from '@fubs/shared/src/lib/types/plan';
import { PlanCTA } from './PlanCTA';

interface PlanCardProps {
  plan: PlanCompleted;
}

export async function PlanCard({ plan }: PlanCardProps) {
  const formatPrice = (
    priceCents: number,
    currency = 'USD',
    interval: string
  ) => {
    if (priceCents === 0) return 'Free';

    const priceInDollars = priceCents / 100;
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
      minimumFractionDigits: 0,
    });

    return `${formatter.format(priceInDollars)}/${interval}`;
  };

  const isSoloPlan = plan.type === PlanType.SOLO;

  const effectivePrice = plan.priceCents;
  const effectiveCurrency = 'USD';
  const effectiveInterval = plan.billingPeriod;

  return (
    <div
      className={`relative rounded-lg border p-xl bg-background transition-all hover:shadow-lg ${
        isSoloPlan
          ? 'border-gary-primary shadow-md ring-2 ring-gary-primary/20'
          : 'border-muted hover:border-gary-primary/50'
      }`}
    >
      {isSoloPlan && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="bg-gary-primary text-gary-primary-foreground px-md py-xs rounded-full text-small font-medium">
            Most Popular
          </span>
        </div>
      )}

      <div className="text-center">
        <h3 className="text-heading-2 font-semibold text-foreground mb-xs">
          {plan.name}
        </h3>

        <p className="text-muted-foreground text-body mb-lg">
          {plan.description}
        </p>

        <div className="mb-2xl">
          <span className="text-display-lg font-bold text-foreground">
            {formatPrice(effectivePrice, effectiveCurrency, effectiveInterval)}
          </span>
          {effectivePrice && (
            <div className="text-small text-muted-foreground mt-xs">
              Live pricing from payment provider
            </div>
          )}
        </div>

        <PlanCTA plan={plan} />

        <div className="text-left">
          <h4 className="text-heading-3 font-medium text-foreground mb-md">
            Features included:
          </h4>
          <ul className="space-y-sm">
            {plan.features.map((feature: string, index: number) => (
              <li key={index} className="flex items-start gap-xs">
                <svg
                  className="w-5 h-5 text-gary-success mt-xxs flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-body text-foreground">{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
