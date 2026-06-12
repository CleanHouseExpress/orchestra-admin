import { apiRequest } from "./apiClient";

export interface ApiDepartment {
  id: number;
  name: string;
  description?: string | null;
  manager?: string | null;
  color?: string | null;
  user_count?: number | null;
  users_count?: number | null;
  users?: unknown[];
  created_at?: string | null;
  updated_at?: string | null;
}

export type DepartmentPayload = {
  name: string;
  description?: string | null;
  manager?: string | null;
  color?: string | null;
};

type DepartmentListResponse = ApiDepartment[] | { data: ApiDepartment[] };
type DepartmentResponse = ApiDepartment | { data: ApiDepartment };

function unwrapDepartments(response: DepartmentListResponse): ApiDepartment[] {
  return Array.isArray(response) ? response : response.data;
}

function unwrapDepartment(response: DepartmentResponse): ApiDepartment {
  return "data" in response ? response.data : response;
}

export const departmentsApi = {
  async list() {
    return unwrapDepartments(await apiRequest<DepartmentListResponse>("/departments", { auth: true }));
  },

  async show(id: number) {
    return unwrapDepartment(await apiRequest<DepartmentResponse>(`/departments/${id}`, { auth: true }));
  },

  async create(payload: DepartmentPayload) {
    return unwrapDepartment(await apiRequest<DepartmentResponse>("/departments", {
      auth: true,
      method: "POST",
      body: JSON.stringify(payload),
    }));
  },

  async update(id: number, payload: DepartmentPayload) {
    return unwrapDepartment(await apiRequest<DepartmentResponse>(`/departments/${id}`, {
      auth: true,
      method: "PUT",
      body: JSON.stringify(payload),
    }));
  },

  async patch(id: number, payload: Partial<DepartmentPayload>) {
    return unwrapDepartment(await apiRequest<DepartmentResponse>(`/departments/${id}`, {
      auth: true,
      method: "PATCH",
      body: JSON.stringify(payload),
    }));
  },

  remove(id: number) {
    return apiRequest<void>(`/departments/${id}`, {
      auth: true,
      method: "DELETE",
    });
  },
};
