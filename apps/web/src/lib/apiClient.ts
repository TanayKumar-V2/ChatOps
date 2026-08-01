import { getToken } from "../stores/auth.store";

const configuredApiUrl = import.meta.env.VITE_API_URL ?? "http://localhost:3000";
const apiUrl = configuredApiUrl.endsWith("/api") ? configuredApiUrl : `${configuredApiUrl}/api`;

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");
  const token = getToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);
  const response = await fetch(`${apiUrl}${path}`, { ...options, headers });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error ?? "Request failed");
  return body as T;
}
