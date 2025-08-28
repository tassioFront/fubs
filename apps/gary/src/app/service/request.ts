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
