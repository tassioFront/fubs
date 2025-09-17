import { requestWithBody } from './utils/request';

const USERS_SERVICE_URL = process.env.USERS_SERVICE_URL as string;

export async function login(email: string, password: string) {
  return await requestWithBody({
    url: `${USERS_SERVICE_URL}/api/users/login/`,
    options: {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    },
    body: { email, password },
  });
}

export async function validateToken(authToken: string) {
  return await fetch(`${USERS_SERVICE_URL}/api/users/validate-token/`, {
    headers: { Authorization: `Bearer ${authToken}` },
    cache: 'no-store',
  });
}
