export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "/api";

export const AUTH_TOKEN_KEY = "orchestra_token";
export const AUTH_USER_KEY = "orchestra_user";

interface ApiRequestInit extends RequestInit {
  auth?: boolean;
  token?: string | null;
}

export function getStoredAuthToken(): string | null {
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

export function setStoredAuth(token: string, user: unknown): void {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
}

export function clearStoredAuth(): void {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
}

export async function apiRequest<T>(path: string, init: ApiRequestInit = {}): Promise<T> {
  const { auth = false, token, headers, body, ...requestInit } = init;
  const authToken = token ?? (auth ? getStoredAuthToken() : null);
  const requestHeaders = new Headers(headers);

  requestHeaders.set("Accept", "application/json");

  if (body !== undefined && !(body instanceof FormData) && !requestHeaders.has("Content-Type")) {
    requestHeaders.set("Content-Type", "application/json");
  }

  if (authToken) {
    requestHeaders.set("Authorization", `Bearer ${authToken}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...requestInit,
    body,
    headers: requestHeaders,
  });

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    const firstError = data?.errors ? Object.values(data.errors).flat()[0] : null;
    const message = data?.message ?? firstError ?? `Erro ${response.status} ao chamar a API`;

    throw new Error(String(message || `Erro ${response.status} ao chamar a API`));
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}
