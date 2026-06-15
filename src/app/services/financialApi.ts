import { apiRequest } from "./apiClient";
import { PaginatedResponse } from "./companiesApi";

export type FinancialTransactionType = "receita" | "despesa";
export type FinancialTransactionStatus = "pago" | "pendente" | "vencido" | "cancelado";

export interface ApiFinancialTransaction {
  id: number;
  description: string;
  descricao: string;
  company_id?: number | null;
  company_name?: string | null;
  empresa?: string | null;
  type: FinancialTransactionType;
  tipo: FinancialTransactionType;
  status: FinancialTransactionStatus;
  amount: number | string;
  valor: number | string;
  issued_at?: string | null;
  data?: string | null;
  due_date?: string | null;
  vencimento?: string | null;
  category?: string | null;
  categoria?: string | null;
  method?: string | null;
  metodo?: string | null;
}

export interface FinancialMetrics {
  revenue: number;
  receita: number;
  expenses: number;
  despesas: number;
  profit: number;
  lucro: number;
  pending: number;
  pendentes: number;
  overdue: number;
  vencidos: number;
  total_transactions: number;
  by_category: Array<{
    category: string | null;
    categoria: string | null;
    type: FinancialTransactionType;
    tipo: FinancialTransactionType;
    total: number;
    count: number;
  }>;
  cash_flow: Array<{
    date: string;
    data: string;
    balance: number;
    saldo: number;
  }>;
}

export interface FinancialListParams {
  page?: number;
  per_page?: number;
  search?: string;
  type?: string;
  status?: string;
  category?: string;
}

function toQuery(params: FinancialListParams): string {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      query.set(key, String(value));
    }
  });

  const value = query.toString();
  return value ? `?${value}` : "";
}

export const financialApi = {
  list(params: FinancialListParams = {}) {
    return apiRequest<PaginatedResponse<ApiFinancialTransaction>>(`/financial/transactions${toQuery(params)}`, { auth: true });
  },

  metrics() {
    return apiRequest<FinancialMetrics>("/financial/metrics", { auth: true });
  },
};
