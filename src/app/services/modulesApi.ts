import { apiRequest } from "./apiClient";
import { PaginatedResponse } from "./companiesApi";

export interface ApiModule {
  id: number;
  name?: string;
  module?: string;
  slug?: string;
  key?: string;
  description?: string | null;
  is_active?: boolean;
  companies_count?: number;
  ver?: boolean;
  criar?: boolean;
  editar?: boolean;
  excluir?: boolean;
}

export interface ModulePayload {
  name: string;
  slug: string;
  description?: string | null;
  is_active: boolean;
}

type ModulesResponse = PaginatedResponse<ApiModule> | ApiModule[] | { data: ApiModule[] };

function unwrapModules(response: ModulesResponse): ApiModule[] {
  return Array.isArray(response) ? response : response.data;
}

export const modulesApi = {
  list() {
    return apiRequest<PaginatedResponse<ApiModule>>("/modules?per_page=100", { auth: true });
  },

  async myList() {
    return unwrapModules(await apiRequest<ModulesResponse>("/my/modules", { auth: true }));
  },

  update(id: number, payload: ModulePayload) {
    return apiRequest<ApiModule>(`/modules/${id}`, {
      auth: true,
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },
};
