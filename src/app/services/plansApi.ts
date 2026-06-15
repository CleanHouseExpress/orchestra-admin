import { apiRequest } from "./apiClient";
import { PaginatedResponse } from "./companiesApi";

export type ApiBillingCycle = "mensal" | "anual" | "customizado";
export type ApiPlanStatus = "ativo" | "inativo" | "rascunho";

export interface ApiPlanFeature {
  label: string;
  included: boolean;
  limit?: string;
}

export interface ApiPlan {
  id: number;
  name: string;
  description: string | null;
  price: number | string;
  annual_price?: number | string | null;
  billing: ApiBillingCycle;
  status: ApiPlanStatus;
  color: string;
  icon: string;
  highlight: boolean;
  badge?: string | null;
  companies_count?: number;
  users_count?: number;
  features?: ApiPlanFeature[] | null;
  limits?: {
    usuarios?: string;
    contratos?: string;
    armazenamento?: string;
    api?: boolean;
    suporte?: string;
  } | null;
  revenue?: string | null;
  created_at?: string | null;
}

export interface PlanPayload {
  name: string;
  description: string;
  price: number;
  annualPrice?: number;
  billing: ApiBillingCycle;
  status: ApiPlanStatus;
  color: string;
  icon: string;
  highlight: boolean;
  badge?: string;
  features: ApiPlanFeature[];
  limits: {
    usuarios: string;
    contratos: string;
    armazenamento: string;
    api: boolean;
    suporte: string;
  };
  revenue?: string;
}

function toApiPayload(payload: PlanPayload) {
  return {
    name: payload.name,
    description: payload.description,
    price: payload.price,
    annual_price: payload.annualPrice || null,
    billing: payload.billing,
    status: payload.status,
    color: payload.color,
    icon: payload.icon,
    highlight: payload.highlight,
    badge: payload.badge || null,
    features: payload.features,
    limits: payload.limits,
    revenue: payload.revenue ?? null,
  };
}

export const plansApi = {
  list(params: { page?: number; per_page?: number; search?: string; status?: string } = {}) {
    const query = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        query.set(key, String(value));
      }
    });

    const suffix = query.toString() ? `?${query.toString()}` : "";
    return apiRequest<PaginatedResponse<ApiPlan>>(`/plans${suffix}`, { auth: true });
  },

  create(payload: PlanPayload) {
    return apiRequest<ApiPlan>("/plans", {
      auth: true,
      method: "POST",
      body: JSON.stringify(toApiPayload(payload)),
    });
  },

  update(id: number, payload: PlanPayload) {
    return apiRequest<ApiPlan>(`/plans/${id}`, {
      auth: true,
      method: "PATCH",
      body: JSON.stringify(toApiPayload(payload)),
    });
  },

  remove(id: number) {
    return apiRequest<void>(`/plans/${id}`, {
      auth: true,
      method: "DELETE",
    });
  },
};
