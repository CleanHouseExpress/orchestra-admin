import { apiRequest } from "./apiClient";
import { PaginatedResponse } from "./companiesApi";

export type ApiContractStatus = "ativo" | "pendente" | "encerrado" | "vencendo" | "renovado";
export type ApiContractType = "servico" | "licenca" | "manutencao" | "consultoria" | "suporte" | "outro";
export type ApiContractRecurrence = "mensal" | "anual" | "unico";

export interface ApiContract {
  id: number;
  number?: string | null;
  numero?: string | null;
  title: string;
  titulo?: string;
  company_id?: number | null;
  company_name?: string | null;
  empresa?: string | null;
  responsible_name?: string | null;
  responsavel?: string | null;
  type: ApiContractType;
  tipo?: ApiContractType;
  status: ApiContractStatus;
  value: number | string;
  valor?: number | string;
  recurrence: ApiContractRecurrence;
  recorrencia?: ApiContractRecurrence;
  start_date?: string | null;
  inicio?: string | null;
  due_date?: string | null;
  vencimento?: string | null;
  description?: string | null;
  descricao?: string | null;
  auto_renew?: boolean;
  renovacaoAuto?: boolean;
  tags?: string[] | null;
}

export interface ContractPayload {
  numero?: string;
  titulo: string;
  empresa?: string;
  responsavel?: string;
  tipo: ApiContractType;
  status: ApiContractStatus;
  valor: number;
  recorrencia: ApiContractRecurrence;
  inicio?: string;
  vencimento?: string;
  descricao?: string;
  renovacaoAuto: boolean;
  tags: string[];
}

export interface ContractListParams {
  page?: number;
  per_page?: number;
  search?: string;
  status?: string;
  type?: string;
  recurrence?: string;
}

function toQuery(params: ContractListParams = {}) {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      query.set(key, String(value));
    }
  });

  const value = query.toString();
  return value ? `?${value}` : "";
}

function toApiPayload(payload: ContractPayload) {
  return {
    number: payload.numero || null,
    title: payload.titulo,
    company_name: payload.empresa || null,
    responsible_name: payload.responsavel || null,
    type: payload.tipo,
    status: payload.status,
    value: payload.valor,
    recurrence: payload.recorrencia,
    start_date: payload.inicio || null,
    due_date: payload.vencimento || null,
    description: payload.descricao || null,
    auto_renew: payload.renovacaoAuto,
    tags: payload.tags,
  };
}

export const contractsApi = {
  list(params: ContractListParams = {}) {
    return apiRequest<PaginatedResponse<ApiContract>>(`/contracts${toQuery(params)}`, { auth: true });
  },

  create(payload: ContractPayload) {
    return apiRequest<ApiContract>("/contracts", {
      auth: true,
      method: "POST",
      body: JSON.stringify(toApiPayload(payload)),
    });
  },

  update(id: number, payload: ContractPayload) {
    return apiRequest<ApiContract>(`/contracts/${id}`, {
      auth: true,
      method: "PATCH",
      body: JSON.stringify(toApiPayload(payload)),
    });
  },

  remove(id: number) {
    return apiRequest<void>(`/contracts/${id}`, {
      auth: true,
      method: "DELETE",
    });
  },
};
