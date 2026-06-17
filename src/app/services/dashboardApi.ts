import { apiRequest } from "./apiClient";

export interface DashboardKpis {
  revenue_total: number;
  receita_total: number;
  expenses_total: number;
  despesas_total: number;
  profit: number;
  lucro: number;
  users_total: number;
  usuarios_total: number;
  companies_total: number;
  empresas_total: number;
  active_companies: number;
  empresas_ativas: number;
  active_contracts: number;
  contratos_ativos: number;
}

export interface DashboardSaasSummary {
  kpis: {
    total_companies: number;
    active_companies: number;
    onboarding_companies: number;
    tenants_with_error: number;
  };
  most_used_modules: Array<{
    name: string;
    slug?: string | null;
    total: number;
  }>;
  latest_logins: Array<{
    user: string;
    email: string;
    company?: string | null;
    last_login_at?: string | null;
  }>;
  companies_by_plan: Array<{
    plan: string;
    total: number;
  }>;
  technical_alerts: Array<{
    company: string;
    type: string;
    severity: "warning" | "danger" | string;
    message: string;
  }>;
  meta?: {
    modules_source?: string;
  };
}

export interface DashboardRevenuePoint {
  month: string;
  mes?: string;
  revenue: number;
  receita: number;
  expenses: number;
  despesa: number;
}

export interface DashboardContractDistribution {
  status: string;
  name: string;
  label: string;
  total: number;
  value: number;
  color: string;
}

export interface DashboardWeeklyActivity {
  day: string;
  date: string;
  value: number;
}

export interface DashboardRecentActivity {
  id: number;
  event: string;
  action: string;
  text: string;
  sub: string;
  time: string;
  date?: string;
  status: "success" | "warning" | "info" | "danger";
  category?: string;
  user?: string | null;
  created_at?: string | null;
}

export interface DashboardTopClient {
  id: number;
  name: string;
  revenue: number;
  revenue_formatted: string;
  growth: number;
  plan: string | null;
  contracts_count: number;
  users_count?: number;
  city?: string | null;
  since?: string | null;
  email?: string | null;
}

export interface DashboardSummary {
  kpis: DashboardKpis;
  revenue_series: DashboardRevenuePoint[];
  contracts_distribution: DashboardContractDistribution[];
  weekly_activity: DashboardWeeklyActivity[];
  recent_activities: DashboardRecentActivity[];
  top_clients: DashboardTopClient[];
  saas?: DashboardSaasSummary;
}

export interface DashboardTopClientsResponse {
  data: DashboardTopClient[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  summary?: {
    revenue_total: number;
    revenue_total_formatted: string;
    contracts_total: number;
    users_total: number;
  };
}

export interface DashboardActivitiesResponse {
  data: DashboardRecentActivity[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export const dashboardApi = {
  summary() {
    return apiRequest<DashboardSummary>("/dashboard", { auth: true });
  },

  activities(params: { search?: string; status?: string; category?: string; per_page?: number } = {}) {
    const query = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        query.set(key, String(value));
      }
    });

    const suffix = query.toString() ? `?${query.toString()}` : "";
    return apiRequest<DashboardActivitiesResponse>(`/dashboard/activities${suffix}`, { auth: true });
  },

  topClients(params: { search?: string; sort_by?: string; per_page?: number } = {}) {
    const query = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        query.set(key, String(value));
      }
    });

    const suffix = query.toString() ? `?${query.toString()}` : "";
    return apiRequest<DashboardTopClientsResponse>(`/dashboard/top-clients${suffix}`, { auth: true });
  },
};
