const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "/api";

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role?: string;
  company_id?: number | null;
}

export interface LoginResponse {
  token: string;
  token_type: "Bearer";
  user: AuthUser;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...init?.headers,
    },
    ...init,
  });

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    const message =
      data?.message ??
      data?.errors?.email?.[0] ??
      data?.errors?.password?.[0] ??
      `Erro ${response.status} ao chamar a API`;

    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export const authApi = {
  login(credentials: { email: string; password: string }) {
    return request<LoginResponse>("/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
  },

  logout(token: string) {
    return request<void>("/logout", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },
};
