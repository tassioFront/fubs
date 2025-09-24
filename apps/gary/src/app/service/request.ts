export async function requestWithBody<T>(params: {
  url: string;
  options: RequestInit;
  body: T;
}) {
  const options = params.options ?? {};
  return fetch(params.url, {
    ...options,
    method: options.method ?? 'POST',
    headers: {
      ...(options.headers ?? {}),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params.body),
  });
}

export async function request(params: { url: string; options?: RequestInit }) {
  const options = params.options ?? {};
  return fetch(params.url, {
    ...options,
    headers: {
      ...options.headers,
      'Content-Type': 'application/json',
    },
  });
}
