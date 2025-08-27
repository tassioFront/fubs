import { getAuthHeader } from '@fubs/shared/src/lib/utils/getToken';

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
  const USERS_SERVICE_URL = process.env.USERS_SERVICE_URL;

  const headers = getAuthHeader({
    serviceName: process.env.GARY_SERVICE_NAME as string,
  });

  return await fetch(`${USERS_SERVICE_URL}/api/users/internal/register/`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
    cache: 'no-store',
  });
}

export async function login(email: string, password: string) {
  const USERS_SERVICE_URL = process.env.USERS_SERVICE_URL;

  return await fetch(`${USERS_SERVICE_URL}/api/users/login/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      password,
    }),
    cache: 'no-store',
  });
}
