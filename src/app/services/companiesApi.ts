const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "/api";

export type CompanyStatus = "active" | "pending" | "inactive";

export interface ApiCompany {
  id: number;
  name: string;
  document: string | null;
  cnpj?: string | null;
  description?: string | null;
  email: string | null;
  phone: string | null;
  whatsapp?: string | null;
  status: CompanyStatus;
  segment: string | null;
  plan: string | null;
  revenue: string | number | null;
  clients_count: number;
  contracts_count: number;
  growth: string | number;
  cep?: string | null;
  street?: string | null;
  number?: string | null;
  complement?: string | null;
  district?: string | null;
  city: string | null;
  state: string | null;
  contact_name?: string | null;
  contact_role?: string | null;
  address?: {
    id?: number;
    company_id?: number;
    postal_code?: string | null;
    street?: string | null;
    number?: string | null;
    complement?: string | null;
    district?: string | null;
    city?: string | null;
    state?: string | null;
  } | null;
  site: string | null;
  customer_since: string | null;
  modules?: unknown[];
  users?: Array<{
    id: number;
    company_id?: number | null;
    name: string;
    email: string;
    role?: string | null;
  }>;
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page?: number;
  per_page: number;
  total?: number;
  next_page_url?: string | null;
  prev_page_url?: string | null;
}

export interface CompanyListParams {
  page?: number;
  per_page?: number;
  search?: string;
  segment?: string;
  plan?: string;
  status?: string;
}

export interface CompanyMetrics {
  total_companies: number;
  active_companies: number;
  total_revenue: number;
  pending_companies: number;
}

export type CompanyPayload = Partial<Omit<ApiCompany, "id" | "modules" | "users">> & {
  cnpj?: string;
  contactName?: string | null;
  contactRole?: string | null;
  modules?: number[];
  admin?: {
    name: string;
    email: string;
    password?: string;
  };
};

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
    const firstError = data?.errors ? Object.values(data.errors).flat()[0] : null;
    const message = data?.message ?? firstError ?? `Erro ${response.status} ao chamar a API`;
    throw new Error(message || `Erro ${response.status} ao chamar a API`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

function toQuery(params: CompanyListParams): string {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      query.set(key, String(value));
    }
  });

  const value = query.toString();
  return value ? `?${value}` : "";
}

export const companiesApi = {
  list(params: CompanyListParams = {}) {
    return request<PaginatedResponse<ApiCompany>>(`/companies${toQuery(params)}`);
  },

  metrics(params: Omit<CompanyListParams, "page" | "per_page"> = {}) {
    return request<CompanyMetrics>(`/companies/metrics${toQuery(params)}`);
  },

  show(id: number) {
    return request<ApiCompany>(`/companies/${id}`);
  },

  create(payload: CompanyPayload) {
    return request<ApiCompany>("/companies", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  update(id: number, payload: CompanyPayload) {
    return request<ApiCompany>(`/companies/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },

  remove(id: number) {
    return request<void>(`/companies/${id}`, {
      method: "DELETE",
    });
  },

  syncModules(id: number, modules: number[]) {
    return request<ApiCompany>(`/companies/${id}/modules`, {
      method: "PUT",
      body: JSON.stringify({ modules }),
    });
  },

  saveAdmin(id: number, payload: { name: string; email: string; password?: string }) {
    return request(`/companies/${id}/admin`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },
};
