import { apiRequest } from "./apiClient";
import { PaginatedResponse } from "./companiesApi";

export interface ApiCompanyModule {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  is_active: boolean;
  enabled_by_default: boolean;
  sort_order: number;
  linked_companies_count?: number;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface ApiCompanyModuleCompany {
  id: number;
  name: string;
  status?: string | null;
  segment?: string | null;
  plan?: string | null;
  subdomain?: string | null;
  domain?: string | null;
}

export interface CompanyModuleMetrics {
  total_modules: number;
  default_modules: number;
  optional_modules: number;
  active_modules: number;
}

export interface CompanyModuleListParams {
  search?: string;
  default?: "all" | "yes" | "no";
  per_page?: number;
}

function toQuery(params: CompanyModuleListParams): string {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      query.set(key, String(value));
    }
  });

  const value = query.toString();
  return value ? `?${value}` : "";
}

export const companyModulesApi = {
  list(params: CompanyModuleListParams = {}) {
    return apiRequest<PaginatedResponse<ApiCompanyModule>>(`/company-modules${toQuery(params)}`, { auth: true });
  },

  metrics(params: Omit<CompanyModuleListParams, "per_page"> = {}) {
    return apiRequest<CompanyModuleMetrics>(`/company-modules/metrics${toQuery(params)}`, { auth: true });
  },

  updateDefault(id: number, enabledByDefault: boolean) {
    return apiRequest<ApiCompanyModule>(`/company-modules/${id}/default`, {
      auth: true,
      method: "PATCH",
      body: JSON.stringify({ enabled_by_default: enabledByDefault }),
    });
  },

  updateStatus(id: number, isActive: boolean) {
    return apiRequest<ApiCompanyModule>(`/company-modules/${id}/status`, {
      auth: true,
      method: "PATCH",
      body: JSON.stringify({ is_active: isActive }),
    });
  },

  companiesUsingModule(id: number) {
    return apiRequest<{ module: ApiCompanyModule; companies: ApiCompanyModuleCompany[] }>(`/company-modules/${id}/companies`, { auth: true });
  },

  tenantModules(companyId: number) {
    return apiRequest<ApiCompanyModule[]>(`/company-modules/companies/${companyId}`, { auth: true });
  },

  availableTenantModules(companyId: number) {
    return apiRequest<ApiCompanyModule[]>(`/company-modules/companies/${companyId}/available`, { auth: true });
  },

  addTenantModule(companyId: number, moduleId: number) {
    return apiRequest<ApiCompanyModule[]>(`/company-modules/companies/${companyId}/modules`, {
      auth: true,
      method: "POST",
      body: JSON.stringify({ module_id: moduleId }),
    });
  },

  updateTenantModules(companyId: number, modules: number[]) {
    return apiRequest<ApiCompanyModule[]>(`/company-modules/companies/${companyId}`, {
      auth: true,
      method: "PUT",
      body: JSON.stringify({ modules }),
    });
  },

  deleteTenantModule(companyId: number, moduleId: number) {
    return apiRequest<ApiCompanyModule[]>(`/company-modules/companies/${companyId}/modules/${moduleId}`, {
      auth: true,
      method: "DELETE",
    });
  },
};
