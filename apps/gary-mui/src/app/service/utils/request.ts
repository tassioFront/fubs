export async function requestWithBody<T>(params: {
  url: string;
  options: RequestInit;
  body: T;
}) {
  return fetch(params.url, {
    ...params.options,
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
