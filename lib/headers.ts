import { headers } from 'next/headers';

export async function getHeaders() {
  return await headers();
}

export async function getHeader(key: string) {
  const headers = await getHeaders();
  return headers.get(key);
}