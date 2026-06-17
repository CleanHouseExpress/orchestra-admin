import { ApiCompany } from "../services/companiesApi";

type CompanyAdminView = {
  name: string;
  email: string;
};

export type CompanyView = {
  id: number;
  name: string;
  cnpj: string;
  subdomain: string;
  schema: string;
  tenantStatus: string;
  onboardingStatus: string;
  lastAccess: string;
  primaryAdmin: CompanyAdminView | null;
  modules: string[];
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

function firstPresent(...values: Array<unknown>) {
  return values.find((value) => value !== undefined && value !== null && String(value).trim() !== "") ?? null;
}

function subdomainValue(company: ApiCompany) {
  if (typeof company.subdomain === "object" && company.subdomain !== null) {
    return company.subdomain.subdomain;
  }

  return company.subdomain;
}

function formatDateTime(value: string | null | undefined) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function formatStatusLabel(value: string | null | undefined) {
  if (!value) {
    return "-";
  }

  return String(value)
    .replace(/[_-]/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function mapPrimaryAdmin(company: ApiCompany): CompanyAdminView | null {
  if (company.admin?.name || company.admin?.email) {
    return {
      name: company.admin.name ?? "-",
      email: company.admin.email ?? "-",
    };
  }

  const admin = company.users?.find((user) => (
    user.role === "company_admin" ||
    user.role_id === 1 ||
    user.role_title?.toLowerCase() === "company admin"
  ));

  if (!admin) {
    return null;
  }

  return {
    name: admin.name,
    email: admin.email,
  };
}

function mapModules(company: ApiCompany) {
  return company.modules
    ?.map((module) => firstPresent(module.name, module.module, module.slug, module.key))
    .filter((module): module is string => typeof module === "string" && module !== "") ?? [];
}

export function mapCompany(company: ApiCompany): CompanyView {
  const revenueAmount = Number(company.revenue ?? 0);

  return {
    id: company.id,
    name: company.name,
    cnpj: company.cnpj ?? company.document ?? "-",
    subdomain: String(firstPresent(company.subdomain_name, subdomainValue(company), company.domain, company.domains?.[0]) ?? "-"),
    schema: String(firstPresent(company.schema, company.schema_name, company.tenant_schema) ?? "-"),
    tenantStatus: formatStatusLabel(company.tenant_status ?? company.status),
    onboardingStatus: company.onboarding_status ? formatStatusLabel(company.onboarding_status) : "undefined",
    lastAccess: formatDateTime(String(firstPresent(company.last_access_at, company.last_access, company.last_login_at) ?? "")),
    primaryAdmin: mapPrimaryAdmin(company),
    modules: mapModules(company),
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
