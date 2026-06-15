import { apiRequest } from "./apiClient";

export type PermissionAction = "ver" | "criar" | "editar" | "excluir";

export interface AccessProfilePermission {
  module: string;
  key?: string;
  icon: string;
  ver: boolean;
  criar: boolean;
  editar: boolean;
  excluir: boolean;
}

export interface AccessProfile {
  id: number;
  name: string;
  slug: string;
  scope: string;
  description?: string | null;
  color: string;
  system: boolean;
  is_system: boolean;
  userCount: number;
  user_count: number;
  permissions: AccessProfilePermission[];
}

export type AccessProfilePayload = {
  name: string;
  slug?: string;
  scope?: string;
  description?: string | null;
  color: string;
  permissions: AccessProfilePermission[];
};

type AccessProfilesListResponse = {
  data: AccessProfile[];
  meta?: {
    modules: Array<{ key: string; module: string; icon: string }>;
    actions: PermissionAction[];
  };
};

export const accessProfilesApi = {
  list(params: { search?: string } = {}) {
    const query = new URLSearchParams();

    if (params.search) query.set("search", params.search);

    const suffix = query.toString() ? `?${query.toString()}` : "";
    return apiRequest<AccessProfilesListResponse>(`/access-profiles${suffix}`, { auth: true });
  },

  create(payload: AccessProfilePayload) {
    return apiRequest<AccessProfile>("/access-profiles", {
      auth: true,
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  update(id: number, payload: AccessProfilePayload) {
    return apiRequest<AccessProfile>(`/access-profiles/${id}`, {
      auth: true,
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  remove(id: number) {
    return apiRequest<void>(`/access-profiles/${id}`, {
      auth: true,
      method: "DELETE",
    });
  },
};
