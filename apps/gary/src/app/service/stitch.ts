import { getAuthHeader } from '@fubs/shared/src/lib/utils/getToken';
import { PlanCompleted } from '@fubs/shared/src/lib/types/plan';
import { request, requestWithBody } from './request';
import {
  SaveCustomerParams,
  SaveCustomerResponse,
} from '@fubs/shared/src/lib/types/payment';

const STITCH_SERVICE_URL = process.env.STITCH_SERVICE_URL;

export async function saveCustomer(
  params: SaveCustomerParams
): Promise<SaveCustomerResponse> {
  const headers = getAuthHeader({
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
  const response = await request({
    url: `${STITCH_SERVICE_URL}/plans`,
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch plans: ${response.status}`);
  }

  return response.json();
}

/// FUTURE - todo

export interface Entitlement {
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING';
  planType: 'FREE' | 'PAID';
  expiresAt?: string;
}
export interface CheckoutSession {
  id: string;
  url: string;
}

export interface CreateCheckoutSessionParams {
  priceId: string;
  successUrl: string;
  cancelUrl: string;
  ownerId: string;
}
export async function createCheckoutSession(
  params: CreateCheckoutSessionParams
): Promise<CheckoutSession> {
  const headers = getAuthHeader({
    serviceName: process.env.GARY_SERVICE_NAME as string,
  });

  const response = await fetch(`${STITCH_SERVICE_URL}/checkout/session`, {
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

export async function getCheckoutSession(sessionId: string) {
  const headers = getAuthHeader({
    serviceName: process.env.GARY_SERVICE_NAME as string,
  });

  const response = await fetch(
    `${STITCH_SERVICE_URL}/checkout/session/${sessionId}`,
    {
      method: 'GET',
      headers,
      cache: 'no-store',
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to get checkout session: ${response.status}`);
  }

  return response.json();
}

export async function getEntitlement(): Promise<Entitlement> {
  const headers = getAuthHeader({
    serviceName: process.env.GARY_SERVICE_NAME as string,
  });

  const response = await fetch(`${STITCH_SERVICE_URL}/entitlements/me`, {
    method: 'GET',
    headers,
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Failed to get entitlement: ${response.status}`);
  }

  return response.json();
}
