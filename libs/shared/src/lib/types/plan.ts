export enum PlanType {
  FREE = 'FREE',
  SOLO = 'SOLO',
  ENTERPRISE = 'ENTERPRISE',
}

export interface Plan {
  type: PlanType;
  name: string;
  description: string;
  priceCents: number; // Price in cents (e.g., 990 = $9.90)
  workspaceLimit: number | null; // null = unlimited
  features: string[];
  billingPeriod: 'month' | 'year';
  stripePriceId?: string; // Only present after Stripe product/price creation
}

export interface PlanCompleted extends Plan {
  stripePriceId: string;
  stripeProductId: string;
  id: string;
  createdAt: Date;
  updatedAt: Date;
}
