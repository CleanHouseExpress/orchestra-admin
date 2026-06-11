import { API_BASE_URL, apiRequest, getStoredAuthToken } from "./apiClient";

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
    role_id?: number | null;
    role_title?: string | null;
    status?: string | null;
    created_at?: string | null;
    updated_at?: string | null;
  }>;
}

export interface ApiCompanyUser {
  id: number;
  company_id?: number | null;
  name: string;
  email: string;
  role?: string | null;
  role_id?: number | null;
  role_title?: string | null;
  status?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export function isCompanyAdminUser(user: Pick<ApiCompanyUser, "role" | "role_id" | "role_title">) {
  return user.role === "company_admin" || user.role_id === 1 || user.role_title?.toLowerCase() === "company admin";
}

export function getCompanyUserRoleLabel(user: Pick<ApiCompanyUser, "role" | "role_id" | "role_title">) {
  if (isCompanyAdminUser(user)) return "Administrador";
  return user.role_title ?? user.role ?? "Usuário";
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
  domain?: string;
  domains?: string[];
  subdomain?: string;
  contactName?: string | null;
  contactRole?: string | null;
  modules?: number[];
  admin?: {
    name: string;
    email: string;
    password?: string;
  };
};

export interface CompanySseEvent {
  event: string;
  data: Record<string, unknown>;
}

export interface CompanyExistsByEmailResponse {
  email: string;
  exists: boolean;
}

export interface CompanyExistsByDomainResponse {
  subdomain: string;
  domain: string;
  exists: boolean;
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
    return apiRequest<PaginatedResponse<ApiCompany>>(`/companies${toQuery(params)}`, { auth: true });
  },

  metrics(params: Omit<CompanyListParams, "page" | "per_page"> = {}) {
    return apiRequest<CompanyMetrics>(`/companies/metrics${toQuery(params)}`, { auth: true });
  },

  show(id: number) {
    return apiRequest<ApiCompany>(`/companies/${id}`, { auth: true });
  },

  users(id: number) {
    return apiRequest<ApiCompanyUser[]>(`/companies/${id}/users`, { auth: true });
  },

  existsByEmail(email: string) {
    const query = new URLSearchParams({ email });
    return apiRequest<CompanyExistsByEmailResponse>(`/companies/exists/email?${query.toString()}`, { auth: true });
  },

  existsByDomain(subdomain: string) {
    const query = new URLSearchParams({ subdomain });
    return apiRequest<CompanyExistsByDomainResponse>(`/companies/exists/domain?${query.toString()}`, { auth: true });
  },

  create(payload: CompanyPayload) {
    return apiRequest<ApiCompany>("/companies", {
      auth: true,
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async createSse(payload: CompanyPayload, onEvent: (event: CompanySseEvent) => void) {
    const token = getStoredAuthToken();
    const response = await fetch(`${API_BASE_URL}/companies/sse`, {
      method: "POST",
      headers: {
        Accept: "text/event-stream",
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => null);
      const firstError = data?.errors ? Object.values(data.errors).flat()[0] : null;
      const message = data?.message ?? firstError ?? `Erro ${response.status} ao chamar a API`;

      throw new Error(String(message || `Erro ${response.status} ao chamar a API`));
    }

    if (!response.body) {
      throw new Error("A API não retornou um stream SSE válido.");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let createdCompany: ApiCompany | null = null;

    const dispatchEventBlock = (block: string) => {
      const lines = block.split(/\r?\n/);
      const event = lines.find(line => line.startsWith("event:"))?.slice(6).trim() || "message";
      const data = lines
        .filter(line => line.startsWith("data:"))
        .map(line => line.slice(5).trim())
        .join("\n");
      const parsedData = data ? JSON.parse(data) as Record<string, unknown> : {};

      onEvent({ event, data: parsedData });

      if (event === "completed" && parsedData.company) {
        createdCompany = parsedData.company as ApiCompany;
      }

      if (event === "failed") {
        throw new Error(String(parsedData.error || parsedData.message || "Falha ao criar empresa."));
      }
    };

    while (true) {
      const { value, done } = await reader.read();
      buffer += decoder.decode(value, { stream: !done });
      const blocks = buffer.split(/\n\n|\r\n\r\n/);
      buffer = blocks.pop() ?? "";

      for (const block of blocks) {
        const trimmedBlock = block.trim();

        if (trimmedBlock) {
          dispatchEventBlock(trimmedBlock);
        }
      }

      if (done) {
        break;
      }
    }

    if (buffer.trim()) {
      dispatchEventBlock(buffer.trim());
    }

    if (!createdCompany) {
      throw new Error("A criação terminou sem retornar a empresa criada.");
    }

    return createdCompany;
  },

  update(id: number, payload: CompanyPayload) {
    return apiRequest<ApiCompany>(`/companies/${id}`, {
      auth: true,
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },

  remove(id: number) {
    return apiRequest<void>(`/companies/${id}`, {
      auth: true,
      method: "DELETE",
    });
  },

  syncModules(id: number, modules: number[]) {
    return apiRequest<ApiCompany>(`/companies/${id}/modules`, {
      auth: true,
      method: "PUT",
      body: JSON.stringify({ modules }),
    });
  },

  saveAdmin(id: number, payload: { name: string; email: string; password?: string }) {
    return apiRequest(`/companies/${id}/admin`, {
      auth: true,
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },
};
