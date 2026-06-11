import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import {
  ArrowLeft, ArrowUpRight, Briefcase, Building2, Calendar, CheckCircle2,
  Clock, DollarSign, FileText, Globe, Hash, Mail, MapPin, Pencil, Phone,
  TrendingDown, TrendingUp, Users, XCircle,
} from "lucide-react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ApiCompanyUser, companiesApi, getCompanyUserRoleLabel, isCompanyAdminUser } from "../services/companiesApi";
import { CompanyView, mapCompany } from "./companyView";
import { useTheme } from "./ThemeContext";

const statusConfig = {
  ativo: { label: "Ativo", color: "#10B981", bg: "rgba(16,185,129,0.12)", icon: CheckCircle2 },
  pendente: { label: "Pendente", color: "#F59E0B", bg: "rgba(245,158,11,0.12)", icon: Clock },
  inativo: { label: "Inativo", color: "#EF4444", bg: "rgba(239,68,68,0.12)", icon: XCircle },
};

const planConfig: Record<string, { color: string; bg: string }> = {
  Enterprise: { color: "#3B82F6", bg: "rgba(59,130,246,0.12)" },
  Pro: { color: "#14B8A6", bg: "rgba(20,184,166,0.12)" },
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
      <p style={{ fontSize: 13, color: "#3B82F6" }}>Receita: R$ {Number(payload[0].value).toLocaleString("pt-BR")}</p>
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
        </div>

        <div className="p-6 space-y-5">
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
            {[
              { label: "Receita", value: company.revenue, icon: DollarSign, color: "#3B82F6" },
              { label: "Clientes", value: company.clients, icon: Users, color: "#14B8A6" },
              { label: "Contratos", value: company.contracts, icon: FileText, color: "#8B5CF6" },
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

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
            <div className="xl:col-span-2 rounded-2xl p-6" style={cardStyle}>
              <h3 style={{ fontFamily: "'Playfair Display',serif", color: colors.textPrimary, fontSize: 16, marginBottom: 4 }}>Receita Mensal</h3>
              <ResponsiveContainer width="100%" height={210}>
                <AreaChart data={monthlyRevenue} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="companyRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.22} />
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={colors.border} />
                  <XAxis dataKey="month" tick={{ fill: colors.textMuted, fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: colors.textMuted, fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${Number(v) / 1000}k`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="value" stroke="#3B82F6" strokeWidth={2} fill="url(#companyRevenue)" />
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
                  <span className="rounded-full px-2.5 py-1" style={{ fontSize: 11, color: isAdmin ? "#3B82F6" : colors.textSecondary, background: isAdmin ? "rgba(59,130,246,0.1)" : colors.surface }}>
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
        </div>
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

  return <EmpresaDetalheView company={company} users={users} usersLoading={usersLoading} usersError={usersError} />;
}
