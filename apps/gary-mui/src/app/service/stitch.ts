import { getInternalApiHeader } from '@fubs/shared/src/lib/utils/getToken';
import { PlanCompleted } from '@fubs/shared/src/lib/types/plan';
import { request } from './utils/request';

const STITCH_SERVICE_URL = process.env.STITCH_SERVICE_URL as string;

export async function getPlans(): Promise<PlanCompleted[]> {
  const headers = getInternalApiHeader({
    serviceName: process.env.GARY_SERVICE_NAME as string,
  });

  const response = await request({
    url: `${STITCH_SERVICE_URL}/plans`,
    options: { headers },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch plans: ${response.status}`);
  }

  return response.json();
}
