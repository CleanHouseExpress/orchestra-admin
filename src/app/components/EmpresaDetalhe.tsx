import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import {
  AlertCircle,
  ArrowLeft, ArrowUpRight, Briefcase, Building2, Calendar, CheckCircle2,
  Clock, Database, DollarSign, FileText, Filter, Globe, Hash, Layers, Mail, MapPin, Pencil, Phone,
  Loader2, Plus, Search, ShieldCheck, Sliders, Trash2, TrendingDown, TrendingUp, UserCog, Users, X, XCircle,
} from "lucide-react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ApiCompanyUser, companiesApi, getCompanyUserRoleLabel, isCompanyAdminUser } from "../services/companiesApi";
import { ApiCompanyModule, companyModulesApi } from "../services/companyModulesApi";
import { CompanyView, mapCompany } from "./companyView";
import { useTheme } from "./ThemeContext";
import { EmpresaEmails } from "./EmpresaEmails";

const statusConfig = {
  ativo: { label: "Ativo", color: "#10B981", bg: "rgba(16,185,129,0.12)", icon: CheckCircle2 },
  pendente: { label: "Pendente", color: "#F59E0B", bg: "rgba(245,158,11,0.12)", icon: Clock },
  inativo: { label: "Inativo", color: "#EF4444", bg: "rgba(239,68,68,0.12)", icon: XCircle },
};

const planConfig: Record<string, { color: string; bg: string }> = {
  Enterprise: { color: "#6366F1", bg: "rgba(99,102,241,0.12)" },
  Pro: { color: "#8B5CF6", bg: "rgba(139,92,246,0.12)" },
  Basic: { color: "#94A3B8", bg: "rgba(148,163,184,0.12)" },
};

const monthlyRevenue = [
  { month: "Jan", value: 6200 }, { month: "Fev", value: 7100 }, { month: "Mar", value: 6800 },
  { month: "Abr", value: 8400 }, { month: "Mai", value: 9200 }, { month: "Jun", value: 8700 },
  { month: "Jul", value: 10400 }, { month: "Ago", value: 11800 }, { month: "Set", value: 10200 },
  { month: "Out", value: 13400 }, { month: "Nov", value: 15100 }, { month: "Dez", value: 16200 },
];

function PageLoading() {
  const { colors } = useTheme();

  return (
    <div className="p-6 space-y-5 h-full overflow-hidden">
      <div className="rounded-2xl p-5" style={{ background: colors.card, border: `1px solid ${colors.border}` }}>
        <div className="rounded-full mb-4" style={{ width: 180, height: 18, background: colors.hoverBg }} />
        <div className="rounded-full" style={{ width: "60%", height: 34, background: colors.hoverBg }} />
      </div>
      <div className="grid grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="rounded-2xl p-5" style={{ background: colors.card, border: `1px solid ${colors.border}` }}>
            <div className="rounded-full mb-3" style={{ width: 36, height: 36, background: colors.hoverBg }} />
            <div className="rounded-full mb-2" style={{ width: "50%", height: 22, background: colors.hoverBg }} />
            <div className="rounded-full" style={{ width: "70%", height: 12, background: colors.hoverBg }} />
          </div>
        ))}
      </div>
    </div>
  );
}

function CustomTooltip({ active, payload, label }: any) {
  const { colors } = useTheme();
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-xl px-4 py-3" style={{ background: colors.card, border: `1px solid ${colors.borderStrong}` }}>
      <p style={{ fontSize: 12, color: colors.textMuted, marginBottom: 4 }}>{label}</p>
      <p style={{ fontSize: 13, color: "#6366F1" }}>Receita: R$ {Number(payload[0].value).toLocaleString("pt-BR")}</p>
    </div>
  );
}

function EmpresaDetalheView({ company, users, usersLoading, usersError }: {
  company: CompanyView;
  users: ApiCompanyUser[];
  usersLoading: boolean;
  usersError: string | null;
}) {
  const { colors, theme } = useTheme();
  const navigate = useNavigate();
  const st = statusConfig[company.status];
  const pl = planConfig[company.plan] ?? planConfig.Basic;
  const [activeTab, setActiveTab] = useState("Visão Geral");
  const tabs = ["Visão Geral", "Módulos", "E-mails"];
  const primaryAdmin = company.primaryAdmin ?? (() => {
    const admin = users.find(isCompanyAdminUser);

    return admin ? { name: admin.name, email: admin.email } : null;
  })();
  const healthItems = [
    {
      label: "Tenant",
      value: company.tenantStatus,
      healthy: company.tenantStatus !== "-" && company.tenantStatus.toLowerCase() !== "missing",
    },
    {
      label: "Onboarding",
      value: company.onboardingStatus,
      healthy: !["-", "undefined", "pending"].includes(company.onboardingStatus.toLowerCase()),
    },
    {
      label: "Acesso",
      value: company.lastAccess,
      healthy: company.lastAccess !== "-",
    },
    {
      label: "Admin",
      value: primaryAdmin?.name ?? "-",
      healthy: Boolean(primaryAdmin),
    },
  ];
  const cardStyle = {
    background: colors.card,
    border: `1px solid ${colors.border}`,
    boxShadow: theme === "light" ? "0 2px 12px rgba(0,0,0,0.05)" : "0 4px 20px rgba(0,0,0,0.18)",
  };

  return (
    <div className="flex flex-col h-full overflow-hidden" style={{ background: colors.bg }}>
      <div className="flex items-center justify-between px-6 shrink-0" style={{ height: 64, borderBottom: `1px solid ${colors.border}`, background: colors.navBg }}>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/empresas")} className="flex items-center gap-2 rounded-xl px-3 py-2 transition-all" style={{ color: colors.textSecondary, background: colors.surface, border: `1px solid ${colors.border}`, fontSize: 13 }}>
            <ArrowLeft size={14} /> Empresas
          </button>
          <span style={{ color: colors.textMuted }}>/</span>
          <span style={{ fontSize: 14, color: colors.textPrimary, fontWeight: 500 }}>{company.name}</span>
        </div>
        <button onClick={() => navigate(`/empresas/${company.id}/editar`)} className="flex items-center gap-2 rounded-xl px-4 py-2 transition-all" style={{ color: colors.textSecondary, background: colors.surface, border: `1px solid ${colors.border}`, fontSize: 13 }}>
          <Pencil size={14} /> Editar
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="px-6 pt-8 pb-5" style={{ background: theme === "dark" ? "linear-gradient(180deg, rgba(27,37,51,0.6) 0%, transparent 100%)" : "linear-gradient(180deg, rgba(239,246,255,0.8) 0%, transparent 100%)" }}>
          <div className="flex flex-col md:flex-row md:items-end gap-5 pb-6" style={{ borderBottom: `1px solid ${colors.border}` }}>
            <div className="rounded-2xl flex items-center justify-center shrink-0" style={{ width: 72, height: 72, background: `hsl(${company.id * 37 + 200}, 55%, ${theme === "light" ? "42%" : "28%"})`, fontSize: 26, color: "#fff", fontWeight: 700 }}>
              {company.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 style={{ fontFamily: "'Playfair Display',serif", color: colors.textPrimary, fontSize: 26, fontWeight: 600 }}>{company.name}</h1>
                <span className="flex items-center gap-1.5 rounded-full px-2.5 py-1" style={{ fontSize: 12, color: st.color, background: st.bg, fontWeight: 500 }}>
                  <st.icon size={11} /> {st.label}
                </span>
                <span className="rounded-full px-2.5 py-1" style={{ fontSize: 12, color: pl.color, background: pl.bg, fontWeight: 500 }}>{company.plan}</span>
              </div>
              <div className="flex flex-wrap items-center gap-4 mt-1">
                <span className="flex items-center gap-1.5" style={{ fontSize: 13, color: colors.textMuted }}><Hash size={13} /> {company.cnpj}</span>
                <span className="flex items-center gap-1.5" style={{ fontSize: 13, color: colors.textMuted }}><Briefcase size={13} /> {company.segment}</span>
                <span className="flex items-center gap-1.5" style={{ fontSize: 13, color: colors.textMuted }}><MapPin size={13} /> {company.city}, {company.state}</span>
                <span className="flex items-center gap-1.5" style={{ fontSize: 13, color: colors.textMuted }}><Calendar size={13} /> Cliente desde {company.since}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-0 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="px-5 py-3.5 transition-all shrink-0"
                style={{
                  fontSize: 13,
                  fontWeight: activeTab === tab ? 600 : 400,
                  color: activeTab === tab ? "#6366F1" : colors.textMuted,
                  borderBottom: activeTab === tab ? "2px solid #6366F1" : "2px solid transparent",
                  background: "transparent",
                }}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6 space-y-5">
          {activeTab === "Visão Geral" ? (
            <>
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
            {[
              { label: "Receita", value: company.revenue, icon: DollarSign, color: "#6366F1" },
              { label: "Clientes", value: company.clients, icon: Users, color: "#8B5CF6" },
              { label: "Contratos", value: company.contracts, icon: FileText, color: "#6366F1" },
              { label: "Crescimento", value: `${company.growth > 0 ? "+" : ""}${company.growth}%`, icon: company.growth >= 0 ? TrendingUp : TrendingDown, color: company.growth >= 0 ? "#10B981" : "#EF4444" },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl p-5" style={cardStyle}>
                <div className="rounded-xl flex items-center justify-center mb-3" style={{ width: 38, height: 38, background: `${item.color}18` }}>
                  <item.icon size={17} style={{ color: item.color }} />
                </div>
                <p style={{ fontSize: 24, color: colors.textPrimary, fontWeight: 700 }}>{item.value}</p>
                <p style={{ fontSize: 12, color: colors.textMuted }}>{item.label}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-4 gap-5">
            <div className="rounded-2xl p-5 space-y-4" style={cardStyle}>
              <div className="flex items-center justify-between gap-3">
                <h3 style={{ fontFamily: "'Playfair Display',serif", color: colors.textPrimary, fontSize: 16 }}>Tenant</h3>
                <div className="rounded-xl flex items-center justify-center" style={{ width: 34, height: 34, background: "rgba(99,102,241,0.12)" }}>
                  <Database size={16} style={{ color: "#6366F1" }} />
                </div>
              </div>
              {[
                { label: "Schema", value: company.schema },
                { label: "Subdomínio", value: company.subdomain },
                { label: "Status", value: company.tenantStatus },
                { label: "Último acesso", value: company.lastAccess },
              ].map((item) => (
                <div key={item.label}>
                  <p style={{ fontSize: 10, color: colors.textMuted, textTransform: "uppercase", letterSpacing: "0.06em" }}>{item.label}</p>
                  <p style={{ fontSize: 13, color: colors.textPrimary, marginTop: 3, overflowWrap: "anywhere" }}>{item.value}</p>
                </div>
              ))}
            </div>

            <div className="rounded-2xl p-5" style={cardStyle}>
              <div className="flex items-center justify-between gap-3 mb-4">
                <h3 style={{ fontFamily: "'Playfair Display',serif", color: colors.textPrimary, fontSize: 16 }}>Módulos Contratados</h3>
                <div className="rounded-xl flex items-center justify-center" style={{ width: 34, height: 34, background: "rgba(139,92,246,0.12)" }}>
                  <Layers size={16} style={{ color: "#8B5CF6" }} />
                </div>
              </div>
              {company.modules.length ? (
                <div className="flex flex-wrap gap-2">
                  {company.modules.map((module) => (
                    <span key={module} className="rounded-full px-2.5 py-1" style={{ fontSize: 11, color: "#6366F1", background: "rgba(99,102,241,0.1)", fontWeight: 600 }}>
                      {module}
                    </span>
                  ))}
                </div>
              ) : (
                <p style={{ fontSize: 13, color: colors.textMuted }}>Nenhum módulo contratado retornado pela API.</p>
              )}
            </div>

            <div className="rounded-2xl p-5" style={cardStyle}>
              <div className="flex items-center justify-between gap-3 mb-4">
                <h3 style={{ fontFamily: "'Playfair Display',serif", color: colors.textPrimary, fontSize: 16 }}>Administrador Principal</h3>
                <div className="rounded-xl flex items-center justify-center" style={{ width: 34, height: 34, background: "rgba(16,185,129,0.12)" }}>
                  <UserCog size={16} style={{ color: "#10B981" }} />
                </div>
              </div>
              {primaryAdmin ? (
                <div className="space-y-3">
                  <div>
                    <p style={{ fontSize: 10, color: colors.textMuted, textTransform: "uppercase", letterSpacing: "0.06em" }}>Nome</p>
                    <p style={{ fontSize: 14, color: colors.textPrimary, fontWeight: 600, marginTop: 3 }}>{primaryAdmin.name}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: 10, color: colors.textMuted, textTransform: "uppercase", letterSpacing: "0.06em" }}>E-mail</p>
                    <p style={{ fontSize: 13, color: colors.textPrimary, marginTop: 3, overflowWrap: "anywhere" }}>{primaryAdmin.email}</p>
                  </div>
                </div>
              ) : (
                <p style={{ fontSize: 13, color: colors.textMuted }}>Nenhum administrador principal identificado.</p>
              )}
            </div>

            <div className="rounded-2xl p-5" style={cardStyle}>
              <div className="flex items-center justify-between gap-3 mb-4">
                <h3 style={{ fontFamily: "'Playfair Display',serif", color: colors.textPrimary, fontSize: 16 }}>Saúde</h3>
                <div className="rounded-xl flex items-center justify-center" style={{ width: 34, height: 34, background: "rgba(20,184,166,0.12)" }}>
                  <ShieldCheck size={16} style={{ color: "#14B8A6" }} />
                </div>
              </div>
              <div className="space-y-2.5">
                {healthItems.map((item) => (
                  <div key={item.label} className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p style={{ fontSize: 12, color: colors.textPrimary, fontWeight: 600 }}>{item.label}</p>
                      <p style={{ fontSize: 11, color: colors.textMuted, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.value}</p>
                    </div>
                    <span className="rounded-full px-2.5 py-1 shrink-0" style={{ fontSize: 10, color: item.healthy ? "#10B981" : "#F59E0B", background: item.healthy ? "rgba(16,185,129,0.12)" : "rgba(245,158,11,0.12)", fontWeight: 700 }}>
                      {item.healthy ? "OK" : "Atenção"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
            <div className="xl:col-span-2 rounded-2xl p-6" style={cardStyle}>
              <h3 style={{ fontFamily: "'Playfair Display',serif", color: colors.textPrimary, fontSize: 16, marginBottom: 4 }}>Receita Mensal</h3>
              <ResponsiveContainer width="100%" height={210}>
                <AreaChart data={monthlyRevenue} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="companyRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366F1" stopOpacity={0.22} />
                      <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={colors.border} />
                  <XAxis dataKey="month" tick={{ fill: colors.textMuted, fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: colors.textMuted, fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${Number(v) / 1000}k`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="value" stroke="#6366F1" strokeWidth={2} fill="url(#companyRevenue)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="rounded-2xl p-6 space-y-4" style={cardStyle}>
              <h3 style={{ fontFamily: "'Playfair Display',serif", color: colors.textPrimary, fontSize: 16 }}>Informações</h3>
              {[
                { icon: Mail, label: "E-mail", value: company.email },
                { icon: Phone, label: "Telefone", value: company.phone },
                { icon: Globe, label: "Site", value: company.site },
                { icon: MapPin, label: "Endereço", value: `${company.city}, ${company.state}` },
              ].map((info) => (
                <div key={info.label} className="flex items-start gap-3">
                  <div className="rounded-lg flex items-center justify-center shrink-0 mt-0.5" style={{ width: 28, height: 28, background: colors.surface }}>
                    <info.icon size={13} style={{ color: colors.textMuted }} />
                  </div>
                  <div className="min-w-0">
                    <p style={{ fontSize: 11, color: colors.textMuted, textTransform: "uppercase" }}>{info.label}</p>
                    <p style={{ fontSize: 13, color: colors.textPrimary, overflowWrap: "anywhere" }}>{info.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl overflow-hidden" style={cardStyle}>
            <div className="px-5 py-4" style={{ borderBottom: `1px solid ${colors.border}` }}>
              <h3 style={{ fontFamily: "'Playfair Display',serif", color: colors.textPrimary, fontSize: 16 }}>Usuários da Empresa</h3>
            </div>
            {usersLoading ? (
              <div className="px-5 py-5 space-y-3">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="space-y-2">
                      <div className="rounded-full" style={{ width: 140, height: 14, background: colors.hoverBg }} />
                      <div className="rounded-full" style={{ width: 210, height: 11, background: colors.hoverBg }} />
                    </div>
                    <div className="rounded-full" style={{ width: 88, height: 24, background: colors.hoverBg }} />
                  </div>
                ))}
              </div>
            ) : usersError ? (
              <div className="flex items-center gap-3 px-5 py-8">
                <XCircle size={18} style={{ color: "#EF4444" }} />
                <p style={{ fontSize: 13, color: colors.textMuted }}>{usersError}</p>
              </div>
            ) : users.length ? users.map((user, index) => {
              const isAdmin = isCompanyAdminUser(user);

              return (
                <div key={user.id} className="flex items-center justify-between px-5 py-4" style={{ borderBottom: index < users.length - 1 ? `1px solid ${colors.border}` : "none" }}>
                  <div>
                    <p style={{ fontSize: 14, color: colors.textPrimary, fontWeight: 500 }}>{user.name}</p>
                    <p style={{ fontSize: 12, color: colors.textMuted }}>{user.email}</p>
                  </div>
                  <span className="rounded-full px-2.5 py-1" style={{ fontSize: 11, color: isAdmin ? "#6366F1" : colors.textSecondary, background: isAdmin ? "rgba(99,102,241,0.1)" : colors.surface }}>
                    {getCompanyUserRoleLabel(user)}
                  </span>
                </div>
              );
            }) : (
              <div className="flex items-center gap-3 px-5 py-8">
                <Building2 size={18} style={{ color: colors.textMuted }} />
                <p style={{ fontSize: 13, color: colors.textMuted }}>Nenhum usuário vinculado a esta empresa.</p>
              </div>
            )}
          </div>
            </>
          ) : activeTab === "Módulos" ? (
            <CompanyModulesEditor company={company} />
          ) : (
            <EmpresaEmails />
          )}
        </div>
      </div>
    </div>
  );
}

function moduleName(module: Pick<ApiCompanyModule, "name" | "slug">) {
  return module.name ?? module.slug ?? "Módulo";
}

function CompanyModulesEditor({ company }: {
  company: CompanyView;
}) {
  const { colors, theme } = useTheme();
  const [modules, setModules] = useState<ApiCompanyModule[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [search, setSearch] = useState("");
  const [availableSearch, setAvailableSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [availableModules, setAvailableModules] = useState<ApiCompanyModule[]>([]);
  const [availableLoading, setAvailableLoading] = useState(false);
  const [addingModuleId, setAddingModuleId] = useState<number | null>(null);
  const [savingModuleId, setSavingModuleId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let active = true;

    setLoading(true);
    setError(null);

    companyModulesApi.tenantModules(company.id)
      .then((response) => {
        if (!active) return;
        setModules(response);
        setSelected(response.filter((module) => module.is_active).map((module) => module.id));
      })
      .catch((err: Error) => {
        if (!active) return;
        setModules([]);
        setError(err.message || "Não foi possível carregar os módulos.");
      })
      .finally(() => active && setLoading(false));

    return () => {
      active = false;
    };
  }, []);

  const linkedCount = selected.length;
  const filteredAvailableModules = availableModules.filter((module) => {
    const term = availableSearch.trim().toLowerCase();

    return term === "" || [moduleName(module), module.slug, module.description]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(term));
  });
  const filteredModules = modules.filter((module) => {
    const checked = selected.includes(module.id);
    const term = search.trim().toLowerCase();
    const matchesSearch = term === "" || [moduleName(module), module.slug, module.description]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(term));
    const matchesStatus = statusFilter === "all" || (statusFilter === "active" ? checked : !checked);

    return matchesSearch && matchesStatus;
  });

  async function toggleModule(moduleId: number) {
    const nextSelected = selected.includes(moduleId)
      ? selected.filter((id) => id !== moduleId)
      : [...selected, moduleId];

    setSavingModuleId(moduleId);
    setError(null);
    setSaved(false);
    setSelected(nextSelected);

    try {
      const updated = await companyModulesApi.updateTenantModules(company.id, nextSelected);
      setModules(updated);
      setSelected(updated.filter((module) => module.is_active).map((module) => module.id));
      setSaved(true);
    } catch (err) {
      setSelected(selected);
      setError(err instanceof Error ? err.message : "Não foi possível salvar os módulos.");
    } finally {
      setSavingModuleId(null);
    }
  }

  async function openAddModules() {
    setAddOpen(true);
    setAvailableLoading(true);
    setError(null);
    setAvailableSearch("");

    try {
      const response = await companyModulesApi.availableTenantModules(company.id);
      setAvailableModules(response);
    } catch (err) {
      setAvailableModules([]);
      setError(err instanceof Error ? err.message : "Não foi possível carregar módulos globais.");
    } finally {
      setAvailableLoading(false);
    }
  }

  async function addModule(moduleId: number) {
    setAddingModuleId(moduleId);
    setError(null);
    setSaved(false);

    try {
      const updated = await companyModulesApi.addTenantModule(company.id, moduleId);
      setModules(updated);
      setSelected(updated.filter((module) => module.is_active).map((module) => module.id));
      setAvailableModules((current) => current.filter((module) => module.id !== moduleId));
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível adicionar o módulo.");
    } finally {
      setAddingModuleId(null);
    }
  }

  async function deleteModule(moduleId: number) {
    const module = modules.find((item) => item.id === moduleId);

    if (!window.confirm(`Excluir ${module ? moduleName(module) : "este módulo"} desta empresa?`)) {
      return;
    }

    const previousModules = modules;
    const previousSelected = selected;

    setSavingModuleId(moduleId);
    setError(null);
    setSaved(false);
    setModules((current) => current.filter((item) => item.id !== moduleId));
    setSelected((current) => current.filter((id) => id !== moduleId));

    try {
      const updated = await companyModulesApi.deleteTenantModule(company.id, moduleId);
      setModules(updated);
      setSelected(updated.filter((module) => module.is_active).map((module) => module.id));
      setSaved(true);
    } catch (err) {
      setModules(previousModules);
      setSelected(previousSelected);
      setError(err instanceof Error ? err.message : "Não foi possível excluir o módulo.");
    } finally {
      setSavingModuleId(null);
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 style={{ fontFamily: "'Playfair Display',serif", color: colors.textPrimary, fontSize: 20, fontWeight: 600 }}>
            Módulos da Empresa
          </h2>
          <p style={{ fontSize: 13, color: colors.textMuted, fontFamily: "'Inter',sans-serif", marginTop: 3 }}>
            Ative ou desative os módulos disponíveis para {company.name}
          </p>
        </div>
        <button
          type="button"
          onClick={openAddModules}
          className="h-10 rounded-lg px-4 flex items-center justify-center gap-2 transition-all shrink-0"
          style={{
            background: "linear-gradient(135deg, #6366F1, #4338CA)",
            color: "#FFFFFF",
            border: 0,
            fontSize: 13,
            fontWeight: 700,
          }}
        >
          <Plus size={15} />
          Adicionar módulo
        </button>
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        {loading ? Array.from({ length: 4 }).map((_, index) => (
          <MetricSkeleton key={index} />
        )) : [
          { label: "Módulos", value: modules.length, color: colors.blue },
          { label: "Ativos", value: linkedCount, color: "#10B981" },
          { label: "Inativos", value: Math.max(modules.length - linkedCount, 0), color: "#F59E0B" },
          { label: "Exibindo", value: filteredModules.length, color: "#0891B2" },
        ].map((item) => (
          <MetricCard key={item.label} label={item.label} value={item.value} color={item.color} />
        ))}
      </div>

      <div className="rounded-lg p-4" style={{ background: colors.card, border: `1px solid ${colors.border}` }}>
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-center gap-2 rounded-lg px-3 h-10 flex-1 max-w-[520px]" style={{ background: colors.inputBg, border: `1px solid ${colors.border}` }}>
            <Search size={15} style={{ color: colors.textMuted }} />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por módulo, slug ou descrição"
              className="bg-transparent outline-none flex-1 min-w-0"
              style={{ color: colors.textPrimary, fontSize: 13 }}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Filter size={15} style={{ color: colors.textMuted }} />
            {([
              ["all", "Todos"],
              ["active", "Ativos"],
              ["inactive", "Inativos"],
            ] as const).map(([value, label]) => {
              const active = statusFilter === value;
              return (
                <button
                  key={value}
                  onClick={() => setStatusFilter(value)}
                  className="h-9 rounded-lg px-3 transition-all"
                  style={{
                    background: active ? colors.blueFaint : colors.inputBg,
                    color: active ? colors.blue : colors.textMuted,
                    border: `1px solid ${active ? "rgba(99,102,241,0.25)" : colors.border}`,
                    fontSize: 12,
                    fontWeight: active ? 700 : 500,
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {(error || saved) && (
        <div className="flex items-start gap-2 rounded-xl px-4 py-3" style={{ background: error ? "rgba(245,158,11,0.1)" : "rgba(16,185,129,0.1)", border: error ? "1px solid rgba(245,158,11,0.25)" : "1px solid rgba(16,185,129,0.25)" }}>
          <AlertCircle size={15} style={{ color: error ? "#F59E0B" : "#10B981", marginTop: 1 }} className="shrink-0" />
          <p style={{ fontSize: 13, color: colors.textSecondary, fontFamily: "'Inter',sans-serif", lineHeight: 1.5 }}>
            {error || "Módulos atualizados com sucesso."}
          </p>
        </div>
      )}

      {loading ? (
        <div className="grid gap-3 xl:grid-cols-2 2xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => <ModuleSkeleton key={index} />)}
        </div>
      ) : filteredModules.length ? (
        <div className="grid gap-3 xl:grid-cols-2 2xl:grid-cols-3">
            {filteredModules.map((module) => {
              const checked = selected.includes(module.id);
              const saving = savingModuleId === module.id;

              return (
              <div
                key={module.id}
                className="rounded-lg p-4"
                style={{
                  background: colors.card,
                  border: `1px solid ${checked ? "rgba(99,102,241,0.35)" : colors.border}`,
                  boxShadow: checked && theme === "light" ? "0 2px 12px rgba(15,23,42,0.05)" : "none",
                }}
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex items-start gap-2.5 min-w-0">
                    <div
                      className="rounded-lg flex items-center justify-center shrink-0"
                      style={{
                        width: 34,
                        height: 34,
                        background: checked ? colors.blueFaint : colors.inputBg,
                        color: checked ? colors.blue : colors.textMuted,
                      }}
                    >
                      <Sliders size={16} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 style={{ color: colors.textPrimary, fontSize: 14, fontWeight: 700 }}>
                          {moduleName(module)}
                        </h2>
                        <span className="rounded-full px-2 py-0.5" style={{ color: checked ? colors.green : colors.red, background: checked ? "rgba(16,185,129,0.12)" : "rgba(239,68,68,0.12)", fontSize: 10, fontWeight: 700 }}>
                          {checked ? "Ativo" : "Inativo"}
                        </span>
                      </div>
                      <p
                        style={{
                          color: colors.textMuted,
                          display: "-webkit-box",
                          fontSize: 12,
                          lineHeight: 1.45,
                          marginTop: 4,
                          overflow: "hidden",
                          WebkitBoxOrient: "vertical",
                          WebkitLineClamp: 2,
                        }}
                      >
                        {module.description || "Sem descrição cadastrada."}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <TenantModuleSwitch
                      active={checked}
                      saving={saving}
                      disabled={savingModuleId !== null && !saving}
                      onChange={() => toggleModule(module.id)}
                    />
                    <button
                      type="button"
                      title="Excluir módulo"
                      aria-label="Excluir módulo"
                      onClick={() => deleteModule(module.id)}
                      disabled={savingModuleId !== null}
                      className="h-9 w-9 rounded-lg flex items-center justify-center transition-all shrink-0"
                      style={{
                        background: colors.inputBg,
                        color: colors.red,
                        border: "1px solid rgba(239,68,68,0.28)",
                        opacity: savingModuleId !== null && !saving ? 0.58 : 1,
                      }}
                    >
                      {saving ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={15} />}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-3">
                  <ModuleFact label="Slug" value={module.slug} />
                  <ModuleFact label="Ordem" value={String(module.sort_order)} />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-lg p-8 text-center" style={{ background: colors.card, border: `1px solid ${colors.border}` }}>
          <p style={{ color: colors.textPrimary, fontSize: 15, fontWeight: 700 }}>Nenhum módulo encontrado</p>
          <p style={{ color: colors.textMuted, fontSize: 13, marginTop: 4 }}>
            Ajuste a busca ou o filtro para visualizar outros módulos.
          </p>
        </div>
      )}

      {addOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6"
          style={{ background: "rgba(2,6,23,0.62)", backdropFilter: "blur(8px)" }}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && addingModuleId === null) {
              setAddOpen(false);
            }
          }}
        >
          <div
            className="w-full max-w-[760px] max-h-[82vh] rounded-xl shadow-2xl flex flex-col overflow-hidden"
            style={{ background: colors.card, border: `1px solid ${colors.border}` }}
          >
            <div className="flex items-start justify-between gap-4 px-5 py-4" style={{ borderBottom: `1px solid ${colors.border}` }}>
              <div className="min-w-0">
                <h3 style={{ color: colors.textPrimary, fontSize: 17, fontWeight: 700 }}>Adicionar módulo</h3>
                <p style={{ color: colors.textMuted, fontSize: 12, marginTop: 3 }}>
                  Selecione um módulo global ativo para incluir em {company.name}.
                </p>
              </div>
              <button
                type="button"
                title="Fechar"
                aria-label="Fechar"
                onClick={() => setAddOpen(false)}
                disabled={addingModuleId !== null}
                className="h-9 w-9 rounded-lg flex items-center justify-center transition-all shrink-0"
                style={{ background: colors.inputBg, color: colors.textMuted, border: `1px solid ${colors.border}` }}
              >
                <X size={15} />
              </button>
            </div>

            <div className="px-5 py-4" style={{ borderBottom: `1px solid ${colors.border}` }}>
              <div className="flex items-center gap-2 rounded-lg px-3 h-10" style={{ background: colors.inputBg, border: `1px solid ${colors.border}` }}>
                <Search size={15} style={{ color: colors.textMuted }} />
                <input
                  value={availableSearch}
                  onChange={(event) => setAvailableSearch(event.target.value)}
                  placeholder="Buscar módulo global"
                  className="bg-transparent outline-none flex-1 min-w-0"
                  autoFocus
                  style={{ color: colors.textPrimary, fontSize: 13 }}
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4">
              {availableLoading ? (
                <div className="grid gap-3 md:grid-cols-2">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <div key={index} className="rounded-lg p-4" style={{ background: colors.inputBg }}>
                      <div className="rounded-full mb-2" style={{ width: "45%", height: 13, background: colors.hoverBg }} />
                      <div className="rounded-full mb-3" style={{ width: "75%", height: 10, background: colors.hoverBg }} />
                      <div className="rounded-full" style={{ width: "32%", height: 30, background: colors.hoverBg }} />
                    </div>
                  ))}
                </div>
              ) : filteredAvailableModules.length ? (
                <div className="grid gap-3 xl:grid-cols-2">
                  {filteredAvailableModules.map((module) => {
                    const adding = addingModuleId === module.id;

                    return (
                      <div
                        key={module.id}
                        className="rounded-lg p-4"
                        style={{
                          background: colors.card,
                          border: `1px solid ${colors.border}`,
                          boxShadow: theme === "light" ? "0 2px 12px rgba(15,23,42,0.05)" : "none",
                        }}
                      >
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div className="flex items-start gap-2.5 min-w-0">
                            <div
                              className="rounded-lg flex items-center justify-center shrink-0"
                              style={{
                                width: 34,
                                height: 34,
                                background: colors.inputBg,
                                color: colors.textMuted,
                              }}
                            >
                              <Sliders size={16} />
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h2 style={{ color: colors.textPrimary, fontSize: 14, fontWeight: 700 }}>
                                  {moduleName(module)}
                                </h2>
                                <span className="rounded-full px-2 py-0.5" style={{ color: colors.green, background: "rgba(16,185,129,0.12)", fontSize: 10, fontWeight: 700 }}>
                                  Global ativo
                                </span>
                              </div>
                              <p
                                style={{
                                  color: colors.textMuted,
                                  display: "-webkit-box",
                                  fontSize: 12,
                                  lineHeight: 1.45,
                                  marginTop: 4,
                                  overflow: "hidden",
                                  WebkitBoxOrient: "vertical",
                                  WebkitLineClamp: 2,
                                }}
                              >
                                {module.description || "Sem descrição cadastrada."}
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => addModule(module.id)}
                            disabled={addingModuleId !== null}
                            className="h-9 min-w-[112px] rounded-lg px-3 flex items-center justify-center gap-2 transition-all shrink-0 overflow-hidden"
                            style={{
                              background: colors.inputBg,
                              color: colors.blue,
                              border: "1px solid rgba(99,102,241,0.32)",
                              fontSize: 12,
                              fontWeight: 700,
                              opacity: addingModuleId !== null && !adding ? 0.58 : 1,
                            }}
                          >
                            {adding ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />}
                            Adicionar
                          </button>
                        </div>

                        <div className="grid grid-cols-2 gap-2 mt-3">
                          <ModuleFact label="Slug" value={module.slug} />
                          <ModuleFact label="Ordem" value={String(module.sort_order)} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-lg p-8 text-center" style={{ background: colors.inputBg, border: `1px solid ${colors.border}` }}>
                  <p style={{ color: colors.textPrimary, fontSize: 14, fontWeight: 700 }}>Nenhum módulo global disponível</p>
                  <p style={{ color: colors.textMuted, fontSize: 12, marginTop: 4 }}>
                    Todos os módulos ativos já estão nesta empresa ou não há resultado para a busca.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MetricCard({ label, value, color }: { label: string; value: number; color: string }) {
  const { colors } = useTheme();

  return (
    <div className="rounded-lg p-4 flex items-center gap-3" style={{ background: colors.card, border: `1px solid ${colors.border}` }}>
      <div className="w-1 h-9 rounded-full" style={{ background: color }} />
      <div>
        <p style={{ color: colors.textMuted, fontSize: 12 }}>{label}</p>
        <p style={{ color: colors.textPrimary, fontSize: 22, fontWeight: 750, lineHeight: 1.1 }}>{value}</p>
      </div>
    </div>
  );
}

function MetricSkeleton() {
  const { colors } = useTheme();

  return (
    <div className="rounded-lg p-4 animate-pulse" style={{ background: colors.card, border: `1px solid ${colors.border}` }}>
      <div className="h-4 w-20 rounded" style={{ background: colors.hoverBg }} />
      <div className="h-7 w-14 rounded mt-3" style={{ background: colors.hoverBg }} />
    </div>
  );
}

function TenantModuleSwitch({
  active,
  saving,
  disabled,
  onChange,
}: {
  active: boolean;
  saving: boolean;
  disabled: boolean;
  onChange: () => void;
}) {
  const { colors, theme } = useTheme();

  return (
    <button
      type="button"
      onClick={onChange}
      disabled={disabled || saving}
      className="h-9 min-w-[124px] rounded-lg px-3 flex items-center justify-between gap-2 transition-all shrink-0"
      style={{
        background: active ? colors.tealFaint : colors.inputBg,
        border: `1px solid ${active ? "rgba(139,92,246,0.35)" : colors.border}`,
        color: active ? colors.teal : colors.textMuted,
        cursor: disabled || saving ? "wait" : "pointer",
        opacity: disabled ? 0.58 : saving ? 0.72 : 1,
        fontSize: 12,
        fontWeight: 800,
      }}
      title={active ? "Desativar módulo" : "Ativar módulo"}
    >
      <span>{active ? "Ativo" : "Inativo"}</span>
      <span
        className="rounded-full transition-all relative"
        style={{
          width: 34,
          height: 18,
          background: active ? colors.teal : theme === "dark" ? "rgba(255,255,255,0.12)" : "rgba(15,23,42,0.16)",
        }}
      >
        {saving ? (
          <Loader2 size={12} className="absolute animate-spin" style={{ left: 11, top: 3, color: active ? "#FFFFFF" : colors.textMuted }} />
        ) : (
          <span
            className="absolute rounded-full bg-white transition-all"
            style={{
              width: 14,
              height: 14,
              left: active ? 18 : 2,
              top: 2,
              boxShadow: "0 1px 4px rgba(0,0,0,0.22)",
            }}
          />
        )}
      </span>
    </button>
  );
}

function ModuleFact({ label, value }: { label: string; value: string }) {
  const { colors } = useTheme();

  return (
    <div className="rounded-lg px-2.5 py-2" style={{ background: colors.inputBg, border: `1px solid ${colors.border}` }}>
      <p style={{ color: colors.textMuted, fontSize: 10 }}>{label}</p>
      <p className="truncate" style={{ color: colors.textPrimary, fontSize: 12, fontWeight: 700, marginTop: 2 }}>{value}</p>
    </div>
  );
}

function ModuleSkeleton() {
  const { colors } = useTheme();

  return (
    <div className="rounded-lg p-4 animate-pulse" style={{ background: colors.card, border: `1px solid ${colors.border}` }}>
      <div className="flex items-start gap-2.5">
        <div className="rounded-lg" style={{ width: 34, height: 34, background: colors.hoverBg }} />
        <div className="flex-1">
          <div className="h-4 w-36 rounded" style={{ background: colors.hoverBg }} />
          <div className="h-3 w-full rounded mt-2" style={{ background: colors.hoverBg }} />
          <div className="h-3 w-2/3 rounded mt-2" style={{ background: colors.hoverBg }} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 mt-3">
        <div className="h-11 rounded-lg" style={{ background: colors.hoverBg }} />
        <div className="h-11 rounded-lg" style={{ background: colors.hoverBg }} />
      </div>
    </div>
  );
}

export function EmpresaDetalhe() {
  const { id } = useParams();
  const { colors } = useTheme();
  const [company, setCompany] = useState<CompanyView | null>(null);
  const [users, setUsers] = useState<ApiCompanyUser[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const companyId = Number(id);
    let active = true;

    setCompany(null);
    setUsers([]);
    setError(null);
    setUsersError(null);

    if (!companyId) {
      setError("Empresa inválida.");
      return;
    }

    companiesApi.show(companyId)
      .then((data) => active && setCompany(mapCompany(data)))
      .catch((err: Error) => active && setError(err.message || "Não foi possível carregar a empresa."));

    setUsersLoading(true);
    companiesApi.users(companyId)
      .then((data) => {
        if (!active) return;
        setUsers(data);
        setUsersError(null);
      })
      .catch((err: Error) => {
        if (!active) return;
        setUsers([]);
        setUsersError(err.message || "Não foi possível carregar os usuários.");
      })
      .finally(() => active && setUsersLoading(false));

    return () => {
      active = false;
    };
  }, [id]);

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="rounded-2xl p-6 max-w-[520px] text-center" style={{ background: colors.card, border: `1px solid ${colors.border}` }}>
          <XCircle size={32} style={{ color: "#EF4444", margin: "0 auto 12px" }} />
          <p style={{ color: colors.textPrimary, fontSize: 15 }}>{error}</p>
        </div>
      </div>
    );
  }

  if (!company) {
    return <PageLoading />;
  }

  return (
    <EmpresaDetalheView
      company={company}
      users={users}
      usersLoading={usersLoading}
      usersError={usersError}
    />
  );
}
