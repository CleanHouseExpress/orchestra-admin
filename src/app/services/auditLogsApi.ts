import { apiRequest } from "./apiClient";

export type AuditStatus = "success" | "failed" | "warning";
export type AuditMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface ApiAuditLog {
  id: number;
  event: string;
  action: string | null;
  module: string;
  user: {
    id: number | null;
    name: string;
    email: string | null;
  };
  company: {
    id: number;
    name: string;
  } | null;
  method: string | null;
  path: string | null;
  status_code: number | null;
  status: AuditStatus;
  ip_address: string | null;
  user_agent: string | null;
  payload: Record<string, unknown>;
  response: Record<string, unknown>;
  metadata: Record<string, unknown> | null;
  created_at: string | null;
  created_at_label: string | null;
}

export interface AuditLogMetrics {
  total: number;
  success: number;
  failed: number;
  warning: number;
}

export interface AuditLogListParams {
  page?: number;
  per_page?: number;
  search?: string;
  status?: "all" | AuditStatus;
  method?: "all" | AuditMethod;
  company?: string;
  user?: string;
  event?: string;
  date_from?: string;
  date_to?: string;
  type?: string;
}

export interface PaginatedAuditLogs {
  data: ApiAuditLog[];
  current_page: number;
  last_page?: number;
  per_page: number;
  total?: number;
  next_page_url?: string | null;
  prev_page_url?: string | null;
}

function toQuery(params: AuditLogListParams): string {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      query.set(key, String(value));
    }
  });

  const value = query.toString();
  return value ? `?${value}` : "";
}

export const auditLogsApi = {
  list(params: AuditLogListParams = {}) {
    return apiRequest<PaginatedAuditLogs>(`/audit-logs${toQuery(params)}`, { auth: true });
  },

  metrics(params: Omit<AuditLogListParams, "page" | "per_page"> = {}) {
    return apiRequest<AuditLogMetrics>(`/audit-logs/metrics${toQuery(params)}`, { auth: true });
  },
};
