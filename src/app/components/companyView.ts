import { ApiCompany } from "../services/companiesApi";

export type CompanyView = {
  id: number;
  name: string;
  cnpj: string;
  segment: string;
  plan: string;
  status: "ativo" | "pendente" | "inativo";
  revenue: string;
  revenueAmount: number;
  clients: number;
  contracts: number;
  growth: number;
  city: string;
  state: string;
  email: string;
  phone: string;
  site: string;
  since: string;
  raw: ApiCompany;
};

export const statusFromApi: Record<string, CompanyView["status"]> = {
  active: "ativo",
  pending: "pendente",
  inactive: "inativo",
  ativo: "ativo",
  pendente: "pendente",
  inativo: "inativo",
};

export function statusToApi(status: CompanyView["status"] | string) {
  return ({
    ativo: "active",
    pendente: "pending",
    inativo: "inactive",
    active: "active",
    pending: "pending",
    inactive: "inactive",
  } as Record<string, "active" | "pending" | "inactive">)[status] ?? "active";
}

export function formatCurrency(value: ApiCompany["revenue"]) {
  const amount = Number(value ?? 0);

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatSince(value: string | null) {
  if (!value) {
    return "-";
  }

  const date = new Date(`${value}T00:00:00`);

  return new Intl.DateTimeFormat("pt-BR", {
    month: "short",
    year: "numeric",
  }).format(date);
}

export function mapCompany(company: ApiCompany): CompanyView {
  const revenueAmount = Number(company.revenue ?? 0);

  return {
    id: company.id,
    name: company.name,
    cnpj: company.cnpj ?? company.document ?? "-",
    segment: company.segment ?? "-",
    plan: company.plan ?? "-",
    status: statusFromApi[company.status] ?? "inativo",
    revenue: formatCurrency(revenueAmount),
    revenueAmount,
    clients: company.clients_count ?? 0,
    contracts: company.contracts_count ?? 0,
    growth: Number(company.growth ?? 0),
    city: company.city ?? "-",
    state: company.state ?? "-",
    email: company.email ?? "-",
    phone: company.phone ?? "-",
    site: company.site ?? "-",
    since: formatSince(company.customer_since),
    raw: company,
  };
}
