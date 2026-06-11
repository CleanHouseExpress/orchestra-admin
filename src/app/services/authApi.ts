import { apiRequest } from "./apiClient";

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

export const authApi = {
  login(credentials: { email: string; password: string }) {
    return apiRequest<LoginResponse>("/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
  },

  logout(token: string) {
    return apiRequest<void>("/logout", {
      method: "POST",
      token,
    });
  },
};
