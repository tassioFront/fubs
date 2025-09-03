'use server';

import { getPlans } from '@/app/service/stitch';
import { PlanCompleted } from '@fubs/shared/src/lib/types/plan';

export async function getPlansWithPrices(): Promise<PlanCompleted[]> {
  try {
    const plans = await getPlans();
    return plans;
  } catch (error) {
    console.error(error);
    throw new Error();
  }
}

export async function choosePlanAction(plan: PlanCompleted) {
  // it should receive the userId and the priceId only
  try {
    console.log('🚀 ~ choosePlanAction ~ plan:', plan);
  } catch (error) {
    console.error('Error choosing plan:', error);
    throw new Error('Failed to process plan selection');
  }
}
