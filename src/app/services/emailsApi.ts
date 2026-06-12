import { apiRequest } from "./apiClient";

export interface ApiEmailParty {
  name: string | null;
  email: string | null;
}

export interface ApiEmailCompany {
  id: number;
  name: string;
  email: string | null;
}

export interface ApiEmailTimestamps {
  queued_at: string | null;
  sent_at: string | null;
  delivered_at: string | null;
  opened_at: string | null;
  clicked_at: string | null;
  bounced_at: string | null;
  complained_at: string | null;
  failed_at: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface ApiEmailMessage {
  id: number;
  subject: string;
  preview: string | null;
  status: string;
  tag: string | null;
  template_code: string | null;
  provider: string | null;
  provider_message_id: string | null;
  origin_type: string | null;
  origin_key: string | null;
  from: ApiEmailParty;
  to: ApiEmailParty;
  company: ApiEmailCompany | null;
  related: {
    type: string | null;
    id: number | null;
  };
  timestamps: ApiEmailTimestamps;
  metadata: Record<string, unknown>;
  created_at: string | null;
  updated_at: string | null;
}

export interface ApiEmailMetrics {
  sent: number;
  open_rate: number;
  click_rate: number;
  bounces: number;
  total: number;
  opened: number;
  clicked: number;
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

interface EmailListParams {
  search?: string;
  status?: string;
  tag?: string;
  per_page?: number;
}

function toQuery(params: EmailListParams = {}) {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      query.set(key, String(value));
    }
  });

  const serialized = query.toString();
  return serialized ? `?${serialized}` : "";
}

export const emailsApi = {
  list(params: EmailListParams = {}) {
    return apiRequest<SimplePaginatedResponse<ApiEmailMessage>>(`/emails${toQuery(params)}`, { auth: true });
  },

  metrics(params: EmailListParams = {}) {
    return apiRequest<ApiEmailMetrics>(`/emails/metrics${toQuery(params)}`, { auth: true });
  },
};
