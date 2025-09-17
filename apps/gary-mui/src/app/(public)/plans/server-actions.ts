'use server';

import { PlanCompleted } from '@fubs/shared/src/lib/types/plan';
import { getPlans } from '../../service/stitch';

export async function getPlansWithPrices(): Promise<PlanCompleted[]> {
  try {
    const plans = await getPlans();
    return plans;
  } catch (error) {
    console.error(error);
    throw new Error('Failed to load plans');
  }
}
