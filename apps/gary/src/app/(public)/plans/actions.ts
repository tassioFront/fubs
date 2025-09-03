'use server';

import { getPlans, createCheckoutSession } from '@/app/service/stitch';
import { PlanCompleted } from '@fubs/shared/src/lib/types/plan';
import { redirect } from 'next/navigation';

export async function getPlansWithPrices(): Promise<PlanCompleted[]> {
  try {
    const plans = await getPlans();
    return plans;
  } catch (error) {
    console.error(error);
    throw new Error();
  }
}

interface ChoosePlanActionParams {
  planId: string;
  ownerId: string;
}

export async function choosePlanAction({
  planId,
  ownerId,
}: ChoosePlanActionParams) {
  let url = '';
  try {
    const session = await createCheckoutSession({
      planId,
      ownerId,
      successUrl: process.env.APP_URL + '/workspace',
      cancelUrl: process.env.APP_URL + '/cancel',
    });

    url = session.url as string;
  } catch (error) {
    console.error('Error choosing plan:', error);
    throw new Error('Failed to process plan selection');
  }

  redirect(url);
}
