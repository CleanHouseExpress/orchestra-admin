import { apiRequest } from "./apiClient";

export interface ApiAdminUser {
  id: number;
  name: string;
  email: string;
  company: {
    id: number;
    name: string | null;
    email: string | null;
  } | null;
  department: string | null;
  role: {
    id: number | null;
    name: string | null;
    slug: string | null;
    scope: string | null;
    legacy: string | null;
  };
  status: "active" | "pending" | string;
  two_factor_enabled: boolean;
  email_verified_at: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface AdminUserMetrics {
  total_users: number;
  active_users: number;
  pending_users: number;
  two_factor_enabled_users: number;
  active_rate: number;
  two_factor_rate: number;
  role_counts: Array<{
    role: string;
    name: string;
    total: number;
  }>;
}

export interface SimplePaginatedResponse<T> {
  data: T[];
  current_page: number;
  per_page: number;
  from: number | null;
  to: number | null;
  next_page_url: string | null;
  prev_page_url: string | null;
}

interface UserListParams {
  search?: string;
  status?: string;
  role?: string;
  per_page?: number;
}

function toQuery(params: UserListParams = {}) {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      query.set(key, String(value));
    }
  });

  const serialized = query.toString();
  return serialized ? `?${serialized}` : "";
}

export const usersApi = {
  list(params: UserListParams = {}) {
    return apiRequest<SimplePaginatedResponse<ApiAdminUser>>(`/users${toQuery(params)}`, { auth: true });
  },

  metrics(params: UserListParams = {}) {
    return apiRequest<AdminUserMetrics>(`/users/metrics${toQuery(params)}`, { auth: true });
  },
};
