import { Plan } from '@fubs/shared';

export interface CreateProductDto {
  name: string;
  description?: string;
  metadata: {
    planType: Plan['type'];
    workspaceLimit: Plan['workspaceLimit'];
    billingPeriod: Plan['billingPeriod'];
    features: Plan['features'];
    planName: Plan['name'];
  };
}

export interface CreateCustomerDto {
  email: string;
  name: string;
  metadata: {
    ownerId: string;
  };
}

export interface CreatePriceDto {
  product: string;
  unitAmount: number;
  currency: string;
  recurring: {
    interval: 'day' | 'week' | 'month' | 'year';
  };
}

export interface CreateSubscriptionDto {
  stripeCustomerId: string;
  priceId: string;
}

export interface CreateCheckoutSessionDto {
  stripeCustomerId: string;
  priceId: string;
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, string>;
}

export interface UpdateSubscriptionDto {
  priceId?: string;
  trialPeriodDays?: number;
  metadata?: Record<string, string>;
  pauseCollection?: boolean;
}
