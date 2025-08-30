import { getAuthHeader } from '@fubs/shared/src/lib/utils/getToken';
import { requestWithBody } from './request';

const USERS_SERVICE_URL = process.env.USERS_SERVICE_URL;

export const mapErrorFromUsers = (errors: Record<string, string[]>) => {
  // example of errors: { password: [ 'Ensure this field has at least 8 characters.' ] }
  const errorList: Record<string, string> = {};
  for (const key in errors) {
    errorList[key] = errors[key][0];
  }
  return errorList;
};

interface UserRegisterParams {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  password_confirm: string;
}

export async function registerUser(body: UserRegisterParams) {
  const headers = getAuthHeader({
    serviceName: process.env.GARY_SERVICE_NAME as string,
  });

  return await requestWithBody({
    url: `${USERS_SERVICE_URL}/api/users/internal/register/`,
    options: {
      method: 'POST',
      headers,
      cache: 'no-store',
    },
    body,
  });
}

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
    body: {
      email,
      password,
    },
  });
}

export async function validateToken(authToken: string) {
  return await fetch(`${USERS_SERVICE_URL}/api/users/validate-token/`, {
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
    cache: 'no-store',
  });
}
