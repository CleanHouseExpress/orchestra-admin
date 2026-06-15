import { apiRequest } from "./apiClient";
import { PaginatedResponse } from "./companiesApi";

export interface ReportsSummary {
  revenue_total: number;
  receita_total: number;
  active_companies: number;
  empresas_ativas: number;
  contracts_total: number;
  contratos_total: number;
  active_contracts: number;
  contratos_ativos: number;
  users_total: number;
  usuarios_total: number;
  sent_emails: number;
  emails_enviados: number;
  retention_rate: number;
  taxa_retencao: number;
}

export interface ReportsGrowth {
  companies: Array<{ month: string; mes: string; total: number }>;
  users: Array<{ month: string; mes: string; total: number }>;
  contracts: Array<{ month: string; mes: string; total: number }>;
}

export interface ReportsRevenue {
  by_plan: Array<{ plan: string; plano: string; revenue: number; companies_count: number }>;
  mrr: number;
  monthly: Array<{ month: string; mes: string; total: number }>;
}

export interface ReportsEmails {
  total: number;
  sent: number;
  failed: number;
  monthly: Array<{ month: string; total: number; sent: number }>;
}

export interface SavedReport {
  id: number;
  name: string;
  type: string;
  generated_at?: string | null;
  size_bytes: number;
  file_path?: string | null;
}

export const reportsApi = {
  summary() {
    return apiRequest<ReportsSummary>("/reports/summary", { auth: true });
  },

  growth() {
    return apiRequest<ReportsGrowth>("/reports/growth", { auth: true });
  },

  revenue() {
    return apiRequest<ReportsRevenue>("/reports/revenue", { auth: true });
  },

  emails() {
    return apiRequest<ReportsEmails>("/reports/emails", { auth: true });
  },

  saved(params: { search?: string; page?: number; per_page?: number } = {}) {
    const query = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        query.set(key, String(value));
      }
    });

    const suffix = query.toString() ? `?${query.toString()}` : "";
    return apiRequest<PaginatedResponse<SavedReport>>(`/reports/saved${suffix}`, { auth: true });
  },
};
