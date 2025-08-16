import { Plan, PlanType } from '@fubs/shared';

export const PLANS: Plan[] = [
  {
    type: PlanType.FREE,
    name: 'Free',
    description: 'Basic plan with limited features',
    priceCents: 0,
    workspaceLimit: 1,
    features: ['1 workspace', 'Basic support'],
    billingPeriod: 'month',
  },
  {
    type: PlanType.SOLO,
    name: 'Solo',
    description: 'Up to 3 workspaces',
    priceCents: 990, // $9.90
    workspaceLimit: 3,
    features: ['3 workspaces', 'Priority support', 'Advanced features'],
    billingPeriod: 'month',
  },
  {
    type: PlanType.ENTERPRISE,
    name: 'Enterprise',
    description: 'Unlimited workspaces and premium features',
    priceCents: 2990, // $29.90
    workspaceLimit: null, // unlimited
    features: [
      'Unlimited workspaces',
      '24/7 support',
      'Premium features',
      'Custom integrations',
    ],
    billingPeriod: 'month',
  },
];
