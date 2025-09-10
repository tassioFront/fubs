import { getInternalApiHeader } from '@fubs/shared/src/lib/utils/getToken';
import {
  CreateCheckoutSessionDto,
  PlanCompleted,
  CheckoutSession,
} from '@fubs/shared/src/lib/types/plan';
import { request, requestWithBody } from './request';
import {
  SaveCustomerParams,
  SaveCustomerResponse,
} from '@fubs/shared/src/lib/types/payment';

const STITCH_SERVICE_URL = process.env.STITCH_SERVICE_URL;

export async function saveCustomer(
  params: SaveCustomerParams
): Promise<SaveCustomerResponse> {
  const headers = getInternalApiHeader({
    serviceName: process.env.GARY_SERVICE_NAME as string,
  });

  const response = await requestWithBody<SaveCustomerParams>({
    url: `${STITCH_SERVICE_URL}/customers`,
    options: {
      method: 'POST',
      cache: 'no-store',
      headers,
    },
    body: params,
  });

  if (!response.ok) {
    throw new Error(`Failed to save customer: ${response.status}`);
  }

  return response.json();
}

export async function getPlans(): Promise<PlanCompleted[]> {
  const headers = getInternalApiHeader({
    serviceName: process.env.GARY_SERVICE_NAME as string,
  });

  const response = await request({
    url: `${STITCH_SERVICE_URL}/plans`,
    options: {
      headers,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch plans: ${response.status}`);
  }

  return response.json();
}

export async function createCheckoutSession(
  params: Omit<CreateCheckoutSessionDto, 'customerId'>
): Promise<CheckoutSession> {
  const headers = getInternalApiHeader({
    serviceName: process.env.GARY_SERVICE_NAME as string,
  });

  const response = await fetch(`${STITCH_SERVICE_URL}/plans/checkout-session`, {
    method: 'POST',
    headers,
    body: JSON.stringify(params),
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Failed to create checkout session: ${response.status}`);
  }

  return response.json();
}
