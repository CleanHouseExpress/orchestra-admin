import { apiRequest } from "./apiClient";

export interface InstallState {
  installed?: boolean;
  state?: {
    database?: {
      connection?: string;
      database?: string;
    };
    run_test_seeders?: boolean;
    admin_email?: string;
    steps?: {
      database?: boolean;
      migrate?: boolean;
      admin?: boolean;
    };
  };
  message?: string;
  output?: string;
}

export interface InstallDatabasePayload {
  run_test_seeders: boolean;
}

export interface InstallAdminPayload {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export const installApi = {
  status() {
    return apiRequest<InstallState>("/install");
  },

  database(payload: InstallDatabasePayload) {
    return apiRequest<InstallState>("/install/database", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  migrate() {
    return apiRequest<InstallState>("/install/migrate", {
      method: "POST",
    });
  },

  admin(payload: InstallAdminPayload) {
    return apiRequest<InstallState>("/install/admin", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  finalize() {
    return apiRequest<InstallState>("/install/finalize", {
      method: "POST",
    });
  },
};
