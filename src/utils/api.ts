/**
 * API Utility helper for constructing backend API URLs safely.
 * Respects VITE_API_URL for separate frontend/backend deployments (Vercel -> Render)
 * while falling back to relative paths for local monorepo development.
 */

export function getApiUrl(endpoint: string): string {
  const env = (import.meta as unknown as { env?: { VITE_API_URL?: string } }).env;
  const baseUrl = env?.VITE_API_URL || '';
  const cleanBase = baseUrl.trim().replace(/\/+$/, '');
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return cleanBase ? `${cleanBase}${cleanEndpoint}` : cleanEndpoint;
}

export async function apiFetch(endpoint: string, options?: RequestInit): Promise<Response> {
  const url = getApiUrl(endpoint);
  return fetch(url, options);
}
