import { useEffect, useMemo, useState } from "react";
import {
  BarChart3, Download, Eye, ChevronDown, Calendar,
  TrendingUp, Users, Building2, FileText, DollarSign,
  Star, RefreshCw, ArrowUpRight, ArrowDownRight, Filter,
  Mail, Clock, CheckCircle2, Package, Search, X
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, Cell
} from "recharts";
import { useTheme } from "./ThemeContext";
import { DefaultButton } from "./ui/default-button";
import { reportsApi, ReportsEmails, ReportsGrowth, ReportsRevenue, ReportsSummary, SavedReport } from "../services/reportsApi";

function Tooltip2({ active, payload, label }: any) {
  const { colors } = useTheme();
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl px-4 py-3" style={{ background: colors.card, border: `1px solid ${colors.borderStrong}`, boxShadow: "0 8px 24px rgba(0,0,0,0.15)" }}>
      <p style={{ fontSize: "12px", color: colors.textMuted, marginBottom: "4px", fontFamily: "'Inter',sans-serif" }}>{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} style={{ fontSize: "13px", color: p.color, fontFamily: "'Inter',sans-serif" }}>
          {p.name}: {p.value > 999 ? `R$ ${p.value.toLocaleString("pt-BR")}` : p.value}{typeof p.value === "number" && p.dataKey === "taxa" ? "%" : ""}
        </p>
      ))}
    </div>
  );
}

const sections = [
  { id: "visao",      label: "Visão Geral"    },
  { id: "crescimento",label: "Crescimento"    },
  { id: "financeiro", label: "Receita"        },
  { id: "emails",     label: "E-mails"        },
  { id: "salvos",     label: "Relatórios Salvos" },
];

function formatCurrency(value: number) {
  if (Math.abs(value) >= 1_000_000) return `R$ ${(value / 1_000_000).toLocaleString("pt-BR", { maximumFractionDigits: 2 })}M`;
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
}

function monthLabel(value: string) {
  const [year, month] = value.split("-");
  const date = month ? new Date(Number(year), Number(month) - 1, 1) : null;

  return date ? date.toLocaleDateString("pt-BR", { month: "short" }).replace(".", "") : value;
}

function formatBytes(value: number) {
  if (value >= 1024 * 1024) return `${(value / 1024 / 1024).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} MB`;
  if (value >= 1024) return `${(value / 1024).toLocaleString("pt-BR", { maximumFractionDigits: 0 })} KB`;
  return `${value} B`;
}

function reportPresentation(type: string) {
  const normalized = type.toLowerCase();
  if (normalized.includes("finance")) return { icon: DollarSign, color: "#10B981" };
  if (normalized.includes("crescimento")) return { icon: Building2, color: "#3B82F6" };
  if (normalized.includes("marketing")) return { icon: Mail, color: "#8B5CF6" };
  if (normalized.includes("plano")) return { icon: Package, color: "#F59E0B" };
  if (normalized.includes("contrato")) return { icon: FileText, color: "#EF4444" };
  return { icon: Star, color: "#14B8A6" };
}

function mapSavedReport(report: SavedReport) {
  const presentation = reportPresentation(report.type);

  return {
    id: report.id,
    name: report.name,
    type: report.type,
    date: report.generated_at ? new Date(report.generated_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" }) : "-",
    size: formatBytes(report.size_bytes),
    icon: presentation.icon,
    color: presentation.color,
  };
}

export function Relatorios() {
  const { colors, theme } = useTheme();
  const [activeSection, setActiveSection] = useState("visao");
  const [period, setPeriod] = useState("2026");
  const [search, setSearch] = useState("");
  const [summary, setSummary] = useState<ReportsSummary | null>(null);
  const [growth, setGrowth] = useState<ReportsGrowth | null>(null);
  const [revenue, setRevenue] = useState<ReportsRevenue | null>(null);
  const [emails, setEmails] = useState<ReportsEmails | null>(null);
  const [apiSavedReports, setApiSavedReports] = useState<ReturnType<typeof mapSavedReport>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    Promise.all([
      reportsApi.summary(),
      reportsApi.growth(),
      reportsApi.revenue(),
      reportsApi.emails(),
      reportsApi.saved({ per_page: 100 }),
    ])
      .then(([summaryResponse, growthResponse, revenueResponse, emailsResponse, savedResponse]) => {
        if (!mounted) return;
        setSummary(summaryResponse);
        setGrowth(growthResponse);
        setRevenue(revenueResponse);
        setEmails(emailsResponse);
        setApiSavedReports(savedResponse.data.map(mapSavedReport));
        setError(null);
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : "Não foi possível carregar os relatórios.");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const cardStyle = {
    background: colors.card,
    border: `1px solid ${colors.border}`,
    boxShadow: theme === "light" ? "0 2px 12px rgba(0,0,0,0.05)" : "0 4px 20px rgba(0,0,0,0.15)",
  };

  const summaryKpis = [
    { label: "Receita Total",      value: formatCurrency(summary?.receita_total ?? 0),  change: "Atual",  positive: true,  color: "#10B981", icon: DollarSign  },
    { label: "Empresas Ativas",    value: String(summary?.empresas_ativas ?? 0),        change: "Ativas",     positive: true,  color: "#3B82F6", icon: Building2   },
    { label: "Taxa de Retenção",   value: `${summary?.taxa_retencao ?? 0}%`,        change: "Atual",   positive: true,  color: "#8B5CF6", icon: RefreshCw   },
    { label: "E-mails Enviados",          value: String(summary?.emails_enviados ?? 0),         change: "Total",   positive: true,  color: "#F59E0B", icon: Mail        },
    { label: "Contratos Ativos",   value: String(summary?.contratos_ativos ?? 0),      change: "Vigentes",      positive: true, color: "#14B8A6", icon: FileText    },
    { label: "Usuários na Plataforma", value: String(summary?.usuarios_total ?? 0),  change: "Total",    positive: true,  color: "#EC4899", icon: Users       },
  ];

  const growthData = useMemo(() => {
    if (!growth) return [];
    const months = new Set([
      ...growth.companies.map((item) => item.month),
      ...growth.users.map((item) => item.month),
      ...growth.contracts.map((item) => item.month),
    ]);

    return Array.from(months).sort().map((month) => ({
      mes: monthLabel(month),
      empresas: growth.companies.find((item) => item.month === month)?.total ?? 0,
      usuarios: growth.users.find((item) => item.month === month)?.total ?? 0,
      contratos: growth.contracts.find((item) => item.month === month)?.total ?? 0,
    }));
  }, [growth]);
  const latestGrowth = growthData[growthData.length - 1] ?? { empresas: 0, usuarios: 0, contratos: 0 };
  const revenueByPlan = revenue?.by_plan?.length
    ? revenue.by_plan.map((item) => ({ plano: item.plano, valor: Number(item.revenue) }))
    : [];
  const monthlyMrr = revenue?.monthly?.length
    ? revenue.monthly.map((item) => ({ mes: monthLabel(item.month), mrr: Math.round(Number(item.total) / 1000) }))
    : [];
  const emailStats = emails?.monthly?.length
    ? emails.monthly.map((item) => ({ mes: monthLabel(item.month), enviados: Number(item.total), abertos: Number(item.sent), clicados: 0 }))
    : [];
  const savedReports = apiSavedReports;
  const retencaoData = summary ? [{ mes: "Atual", taxa: Number(summary.taxa_retencao ?? 0) }] : [];
  const radarData = summary ? [
    { subject: "Receita", A: Math.min(100, Math.round(Number(summary.receita_total ?? 0) / 10000)) },
    { subject: "Retenção", A: Number(summary.taxa_retencao ?? 0) },
    { subject: "Empresas", A: Math.min(100, Number(summary.empresas_ativas ?? 0)) },
    { subject: "Contratos", A: Math.min(100, Number(summary.contratos_ativos ?? 0)) },
    { subject: "Usuários", A: Math.min(100, Number(summary.usuarios_total ?? 0)) },
    { subject: "E-mails", A: Math.min(100, Number(summary.emails_enviados ?? 0)) },
  ] : [];

  const filteredReports = savedReports.filter(r =>
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    r.type.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6 overflow-y-auto h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 style={{ fontFamily: "'Playfair Display',serif", color: colors.textPrimary, fontSize: "26px", fontWeight: 600 }}>Relatórios</h1>
          <p style={{ fontFamily: "'Inter',sans-serif", color: colors.textMuted, fontSize: "14px", marginTop: "4px" }}>
            {loading ? "Carregando análises e indicadores..." : "Análises e indicadores estratégicos da plataforma"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <select value={period} onChange={e => setPeriod(e.target.value)}
              className="appearance-none rounded-xl px-4 py-2 pr-9 outline-none cursor-pointer"
              style={{ height: "36px", background: colors.card, border: `1px solid ${colors.border}`, color: colors.textSecondary, fontSize: "13px", fontFamily: "'Inter',sans-serif" }}
            >
              <option value="junho-2026">Junho 2026</option>
              <option value="q2-2026">Q2 2026</option>
              <option value="2026">Ano 2026</option>
            </select>
            <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: colors.textMuted }} />
          </div>
          <DefaultButton>
            <Download size={14} /> Exportar tudo
          </DefaultButton>
        </div>
      </div>

      {error && (
        <div className="rounded-xl px-4 py-3" style={{ background: `${colors.yellow}12`, border: `1px solid ${colors.yellow}40`, color: colors.textSecondary, fontSize: "13px", fontFamily: "'Inter',sans-serif" }}>
          {error}
        </div>
      )}
      {loading && (
        <div className="sr-only">Carregando indicadores, gráficos e relatórios salvos...</div>
      )}
      {/* Section tabs */}
      <div className="flex gap-1 rounded-2xl p-1" style={{ background: colors.card, border: `1px solid ${colors.border}`, width: "fit-content" }}>
        {sections.map(s => (
          <button key={s.id} onClick={() => setActiveSection(s.id)}
            className="rounded-xl px-4 py-2 transition-all"
            style={{
              fontSize: "13px", fontFamily: "'Inter',sans-serif",
              fontWeight: activeSection === s.id ? 600 : 400,
              background: activeSection === s.id ? "linear-gradient(135deg, #6366F1, #4338CA)" : "transparent",
              color: activeSection === s.id ? "#fff" : colors.textMuted,
            }}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* ── Visão Geral ── */}
      {activeSection === "visao" && (
        <div className="space-y-5">
          {/* 6 KPIs */}
          <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
            {loading ? (
              Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="rounded-2xl p-5 flex items-center gap-4" style={cardStyle}>
                  <div className="rounded-2xl shrink-0" style={{ width: "46px", height: "46px", background: colors.hoverBg }} />
                  <div className="flex-1 min-w-0">
                    <div className="rounded-full mb-3" style={{ width: "88px", height: "22px", background: colors.hoverBg }} />
                    <div className="rounded-full" style={{ width: "72%", height: "12px", background: colors.hoverBg }} />
                  </div>
                  <span className="rounded-full border-2 animate-spin shrink-0" style={{ width: "18px", height: "18px", borderColor: "rgba(99,102,241,0.18)", borderTopColor: "#6366F1" }} />
                </div>
              ))
            ) : error ? (
              <div className="col-span-2 xl:col-span-3 rounded-2xl p-5 flex items-center gap-3" style={cardStyle}>
                <X size={18} style={{ color: "#EF4444" }} />
                <p style={{ fontSize: "13px", color: colors.textMuted, fontFamily: "'Inter',sans-serif" }}>{error}</p>
              </div>
            ) : summaryKpis.map(k => (
              <div key={k.label} className="rounded-2xl p-5 flex items-center gap-4 transition-all hover:translate-y-[-2px]" style={cardStyle}>
                <div className="rounded-2xl flex items-center justify-center shrink-0" style={{ width: "46px", height: "46px", background: `${k.color}15` }}>
                  <k.icon size={20} style={{ color: k.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p style={{ fontSize: "22px", color: colors.textPrimary, fontFamily: "'Inter',sans-serif", fontWeight: 700, lineHeight: 1 }}>{k.value}</p>
                  <p style={{ fontSize: "12px", color: colors.textSecondary, fontFamily: "'Inter',sans-serif", marginTop: "3px" }}>{k.label}</p>
                </div>
                <span className="flex items-center gap-0.5 rounded-full px-2 py-1 shrink-0"
                  style={{ fontSize: "11px", color: k.positive ? "#10B981" : "#EF4444", background: k.positive ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)", fontFamily: "'Inter',sans-serif", fontWeight: 500 }}
                >
                  {k.positive ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />} {k.change}
                </span>
              </div>
            ))}
          </div>

          {/* Radar + retenção */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
            <div className="rounded-2xl p-6" style={cardStyle}>
              <h3 style={{ fontFamily: "'Playfair Display',serif", color: colors.textPrimary, fontSize: "16px", marginBottom: "4px" }}>Score Operacional</h3>
              <p style={{ fontSize: "12px", color: colors.textMuted, fontFamily: "'Inter',sans-serif", marginBottom: "20px" }}>Índices de saúde da plataforma — 2026</p>
              {loading ? (
                <div className="flex items-center justify-center" style={{ height: "220px", border: `1px dashed ${colors.border}`, borderRadius: "12px" }}>
                  <span className="rounded-full border-2 animate-spin" style={{ width: "24px", height: "24px", borderColor: "rgba(99,102,241,0.18)", borderTopColor: "#6366F1" }} />
                </div>
              ) : (
              <ResponsiveContainer width="100%" height={220}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke={colors.border} />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: colors.textMuted, fontSize: 11, fontFamily: "'Inter',sans-serif" }} />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar name="Score" dataKey="A" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.18} strokeWidth={2} />
                  <Tooltip content={<Tooltip2 />} />
                </RadarChart>
              </ResponsiveContainer>
              )}
            </div>

            <div className="rounded-2xl p-6" style={cardStyle}>
              <h3 style={{ fontFamily: "'Playfair Display',serif", color: colors.textPrimary, fontSize: "16px", marginBottom: "4px" }}>Taxa de Retenção</h3>
              <p style={{ fontSize: "12px", color: colors.textMuted, fontFamily: "'Inter',sans-serif", marginBottom: "20px" }}>Percentual de clientes retidos por mês</p>
              {loading ? (
                <div className="flex items-center justify-center" style={{ height: "220px", border: `1px dashed ${colors.border}`, borderRadius: "12px" }}>
                  <span className="rounded-full border-2 animate-spin" style={{ width: "24px", height: "24px", borderColor: "rgba(99,102,241,0.18)", borderTopColor: "#6366F1" }} />
                </div>
              ) : (
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={retencaoData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="rel_retGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#8B5CF6" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={colors.border} />
                  <XAxis dataKey="mes" tick={{ fill: colors.textMuted, fontSize: 11, fontFamily: "'Inter',sans-serif" }} axisLine={false} tickLine={false} />
                  <YAxis domain={[88, 100]} tick={{ fill: colors.textMuted, fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
                  <Tooltip content={<Tooltip2 />} />
                  <Area type="monotone" dataKey="taxa" name="Retenção" stroke="#8B5CF6" strokeWidth={2.5} fill="url(#rel_retGrad)" />
                </AreaChart>
              </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Crescimento ── */}
      {activeSection === "crescimento" && (
        <div className="space-y-5">
          <div className="grid grid-cols-3 gap-4">
            {(loading ? [
              { label: "Novas Empresas", value: "", sub: "", color: "#3B82F6" },
              { label: "Novos Usuários", value: "", sub: "", color: "#14B8A6" },
              { label: "Novos Contratos", value: "", sub: "", color: "#8B5CF6" },
            ] : [
              { label: "Novas Empresas", value: `+${latestGrowth.empresas}`,  sub: "no ano",       color: "#3B82F6" },
              { label: "Novos Usuários", value: `+${latestGrowth.usuarios}`, sub: "no ano",       color: "#14B8A6" },
              { label: "Novos Contratos",value: `+${latestGrowth.contratos}`,  sub: "no ano",       color: "#8B5CF6" },
            ]).map(s => (
              <div key={s.label} className="rounded-2xl p-5" style={cardStyle}>
                <div className="w-1 h-8 rounded-full mb-3" style={{ background: s.color }} />
                {loading ? (
                  <>
                    <div className="rounded-full mb-3" style={{ width: "72px", height: "28px", background: colors.hoverBg }} />
                    <div className="rounded-full mb-2" style={{ width: "120px", height: "13px", background: colors.hoverBg }} />
                    <span className="rounded-full border-2 animate-spin block" style={{ width: "18px", height: "18px", borderColor: "rgba(99,102,241,0.18)", borderTopColor: "#6366F1" }} />
                  </>
                ) : (
                  <>
                    <p style={{ fontSize: "28px", color: s.color, fontFamily: "'Inter',sans-serif", fontWeight: 800, lineHeight: 1 }}>{s.value}</p>
                    <p style={{ fontSize: "13px", color: colors.textSecondary, fontFamily: "'Inter',sans-serif", marginTop: "4px" }}>{s.label}</p>
                    <p style={{ fontSize: "11px", color: colors.textMuted, fontFamily: "'Inter',sans-serif" }}>{s.sub}</p>
                  </>
                )}
              </div>
            ))}
          </div>

          <div className="rounded-2xl p-6" style={cardStyle}>
            <h3 style={{ fontFamily: "'Playfair Display',serif", color: colors.textPrimary, fontSize: "16px", marginBottom: "4px" }}>Crescimento Acumulado</h3>
            <p style={{ fontSize: "12px", color: colors.textMuted, fontFamily: "'Inter',sans-serif", marginBottom: "20px" }}>Empresas, usuários e contratos — Jan a Jun 2026</p>
            <div className="flex items-center gap-4 mb-4 flex-wrap">
              {[{ label: "Empresas", color: "#3B82F6" }, { label: "Usuários", color: "#14B8A6" }, { label: "Contratos", color: "#8B5CF6" }].map(l => (
                <span key={l.label} className="flex items-center gap-1.5" style={{ fontSize: "12px", color: colors.textSecondary, fontFamily: "'Inter',sans-serif" }}>
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: l.color }} />{l.label}
                </span>
              ))}
            </div>
            {loading ? (
              <div className="flex items-center justify-center" style={{ height: "220px", border: `1px dashed ${colors.border}`, borderRadius: "12px" }}>
                <span className="rounded-full border-2 animate-spin" style={{ width: "24px", height: "24px", borderColor: "rgba(99,102,241,0.18)", borderTopColor: "#6366F1" }} />
              </div>
            ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={growthData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={colors.border} vertical={false} />
                <XAxis dataKey="mes" tick={{ fill: colors.textMuted, fontSize: 11, fontFamily: "'Inter',sans-serif" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: colors.textMuted, fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<Tooltip2 />} />
                <Bar dataKey="empresas"  name="Empresas"  fill="#3B82F6" radius={[4,4,0,0]} />
                <Bar dataKey="contratos" name="Contratos" fill="#8B5CF6" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
            )}
          </div>

          <div className="rounded-2xl p-6" style={cardStyle}>
            <h3 style={{ fontFamily: "'Playfair Display',serif", color: colors.textPrimary, fontSize: "16px", marginBottom: "4px" }}>Usuários Cadastrados</h3>
            <p style={{ fontSize: "12px", color: colors.textMuted, fontFamily: "'Inter',sans-serif", marginBottom: "20px" }}>Evolução mensal acumulada</p>
            {loading ? (
              <div className="flex items-center justify-center" style={{ height: "180px", border: `1px dashed ${colors.border}`, borderRadius: "12px" }}>
                <span className="rounded-full border-2 animate-spin" style={{ width: "24px", height: "24px", borderColor: "rgba(99,102,241,0.18)", borderTopColor: "#6366F1" }} />
              </div>
            ) : (
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={growthData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="rel_usrGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#14B8A6" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#14B8A6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={colors.border} />
                <XAxis dataKey="mes" tick={{ fill: colors.textMuted, fontSize: 11, fontFamily: "'Inter',sans-serif" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: colors.textMuted, fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<Tooltip2 />} />
                <Area type="monotone" dataKey="usuarios" name="Usuários" stroke="#14B8A6" strokeWidth={2.5} fill="url(#rel_usrGrad)" />
              </AreaChart>
            </ResponsiveContainer>
            )}
          </div>
        </div>
      )}

      {/* ── Receita ── */}
      {activeSection === "financeiro" && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
            <div className="rounded-2xl p-6" style={cardStyle}>
              <h3 style={{ fontFamily: "'Playfair Display',serif", color: colors.textPrimary, fontSize: "16px", marginBottom: "4px" }}>Receita por Plano</h3>
              <p style={{ fontSize: "12px", color: colors.textMuted, fontFamily: "'Inter',sans-serif", marginBottom: "20px" }}>Distribuição de receita — Junho 2026</p>
              {loading ? (
                <div className="flex items-center justify-center" style={{ height: "200px", border: `1px dashed ${colors.border}`, borderRadius: "12px" }}>
                  <span className="rounded-full border-2 animate-spin" style={{ width: "24px", height: "24px", borderColor: "rgba(99,102,241,0.18)", borderTopColor: "#6366F1" }} />
                </div>
              ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={revenueByPlan} margin={{ top: 0, right: 0, left: -10, bottom: 0 }} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke={colors.border} horizontal={false} />
                  <XAxis type="number" tick={{ fill: colors.textMuted, fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `R$ ${(v/1000).toFixed(0)}k`} />
                  <YAxis dataKey="plano" type="category" tick={{ fill: colors.textSecondary, fontSize: 13, fontFamily: "'Inter',sans-serif" }} axisLine={false} tickLine={false} width={80} />
                  <Tooltip content={<Tooltip2 />} />
                  <Bar dataKey="valor" name="Receita" radius={[0,6,6,0]}
                  >
                    {revenueByPlan.map((e, i) => {
                      const colors2 = ["#94A3B8","#14B8A6","#3B82F6"];
                      return <Cell key={i} fill={colors2[i]} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              )}
              <div className="mt-4 space-y-2">
                {revenueByPlan.map((r, i) => {
                  const total = revenueByPlan.reduce((a, x) => a + x.valor, 0) || 1;
                  const pct   = Math.round(r.valor / total * 100);
                  const c     = ["#94A3B8","#14B8A6","#3B82F6"][i];
                  return (
                    <div key={r.plano}>
                      <div className="flex items-center justify-between mb-1">
                        <span style={{ fontSize: "12px", color: colors.textSecondary, fontFamily: "'Inter',sans-serif" }}>{r.plano}</span>
                        <span style={{ fontSize: "12px", color: colors.textPrimary, fontFamily: "'Inter',sans-serif", fontWeight: 600 }}>R$ {r.valor.toLocaleString("pt-BR")}</span>
                      </div>
                      <div className="rounded-full overflow-hidden" style={{ height: "5px", background: colors.surface }}>
                        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: c }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rounded-2xl p-6" style={cardStyle}>
              <h3 style={{ fontFamily: "'Playfair Display',serif", color: colors.textPrimary, fontSize: "16px", marginBottom: "4px" }}>MRR — Receita Recorrente Mensal</h3>
              <p style={{ fontSize: "12px", color: colors.textMuted, fontFamily: "'Inter',sans-serif", marginBottom: "8px" }}>Evolução do MRR no ano</p>
              <div className="flex items-end gap-2 mb-5">
                {loading ? (
                  <div className="rounded-full" style={{ width: "150px", height: "32px", background: colors.hoverBg }} />
                ) : (
                <>
                <p style={{ fontSize: "32px", color: "#10B981", fontFamily: "'Inter',sans-serif", fontWeight: 800, lineHeight: 1 }}>{formatCurrency(revenue?.mrr ?? 0)}</p>
                <span className="flex items-center gap-1 mb-1 rounded-full px-2 py-0.5" style={{ fontSize: "12px", color: "#10B981", background: "rgba(16,185,129,0.1)", fontFamily: "'Inter',sans-serif" }}>
                  <ArrowUpRight size={12} /> Atual
                </span>
                </>
                )}
              </div>
              {loading ? (
                <div className="flex items-center justify-center" style={{ height: "160px", border: `1px dashed ${colors.border}`, borderRadius: "12px" }}>
                  <span className="rounded-full border-2 animate-spin" style={{ width: "24px", height: "24px", borderColor: "rgba(99,102,241,0.18)", borderTopColor: "#6366F1" }} />
                </div>
              ) : (
              <ResponsiveContainer width="100%" height={160}>
                <AreaChart data={monthlyMrr} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="rel_mrrGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#10B981" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={colors.border} />
                  <XAxis dataKey="mes" tick={{ fill: colors.textMuted, fontSize: 11, fontFamily: "'Inter',sans-serif" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: colors.textMuted, fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `R$${v}k`} />
                  <Tooltip content={<Tooltip2 />} />
                  <Area type="monotone" dataKey="mrr" name="MRR" stroke="#10B981" strokeWidth={2.5} fill="url(#rel_mrrGrad)" />
                </AreaChart>
              </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── E-mails ── */}
      {activeSection === "emails" && (
        <div className="space-y-5">
          <div className="grid grid-cols-3 gap-4">
            {(loading ? [
              { label: "Total Enviados", value: "", color: "#3B82F6", change: "" },
              { label: "Falhas", value: "", color: "#F59E0B", change: "" },
              { label: "Taxa de Envio", value: "", color: "#10B981", change: "" },
            ] : [
              { label: "Total Enviados",   value: String(emails?.total ?? 0), color: "#3B82F6", change: `${emails?.sent ?? 0} enviados` },
              { label: "Falhas", value: String(emails?.failed ?? 0), color: "#F59E0B", change: "no período" },
              { label: "Taxa de Envio",   value: emails?.total ? `${Math.round((emails.sent / emails.total) * 100)}%` : "0%", color: "#10B981", change: "sucesso" },
            ]).map(k => (
              <div key={k.label} className="rounded-2xl p-5 flex items-center gap-4" style={cardStyle}>
                <div className="w-1.5 h-10 rounded-full" style={{ background: k.color }} />
                <div>
                  {loading ? (
                    <>
                      <div className="rounded-full mb-3" style={{ width: "76px", height: "26px", background: colors.hoverBg }} />
                      <div className="rounded-full" style={{ width: "120px", height: "12px", background: colors.hoverBg }} />
                    </>
                  ) : (
                    <>
                      <p style={{ fontSize: "26px", color: colors.textPrimary, fontFamily: "'Inter',sans-serif", fontWeight: 700, lineHeight: 1 }}>{k.value}</p>
                      <p style={{ fontSize: "12px", color: colors.textSecondary, fontFamily: "'Inter',sans-serif", marginTop: "3px" }}>{k.label}</p>
                      <span style={{ fontSize: "11px", color: k.color, fontFamily: "'Inter',sans-serif" }}>{k.change}</span>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="rounded-2xl p-6" style={cardStyle}>
            <h3 style={{ fontFamily: "'Playfair Display',serif", color: colors.textPrimary, fontSize: "16px", marginBottom: "4px" }}>Engajamento de E-mails</h3>
            <p style={{ fontSize: "12px", color: colors.textMuted, fontFamily: "'Inter',sans-serif", marginBottom: "16px" }}>Enviados, abertos e cliques — Jan a Jun 2026</p>
            <div className="flex items-center gap-4 mb-4 flex-wrap">
              {[{ label: "Enviados", color: "#3B82F6" }, { label: "Abertos", color: "#F59E0B" }, { label: "Clicados", color: "#10B981" }].map(l => (
                <span key={l.label} className="flex items-center gap-1.5" style={{ fontSize: "12px", color: colors.textSecondary, fontFamily: "'Inter',sans-serif" }}>
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: l.color }} />{l.label}
                </span>
              ))}
            </div>
            {loading ? (
              <div className="flex items-center justify-center" style={{ height: "220px", border: `1px dashed ${colors.border}`, borderRadius: "12px" }}>
                <span className="rounded-full border-2 animate-spin" style={{ width: "24px", height: "24px", borderColor: "rgba(99,102,241,0.18)", borderTopColor: "#6366F1" }} />
              </div>
            ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={emailStats} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={colors.border} vertical={false} />
                <XAxis dataKey="mes" tick={{ fill: colors.textMuted, fontSize: 11, fontFamily: "'Inter',sans-serif" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: colors.textMuted, fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<Tooltip2 />} />
                <Bar dataKey="enviados" name="Enviados" fill="#3B82F6" radius={[3,3,0,0]} opacity={0.85} />
                <Bar dataKey="abertos"  name="Abertos"  fill="#F59E0B" radius={[3,3,0,0]} opacity={0.85} />
                <Bar dataKey="clicados" name="Clicados" fill="#10B981" radius={[3,3,0,0]} opacity={0.85} />
              </BarChart>
            </ResponsiveContainer>
            )}
          </div>
        </div>
      )}

      {/* ── Relatórios Salvos ── */}
      {activeSection === "salvos" && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-xl px-3 py-2 flex-1 max-w-sm" style={{ background: colors.card, border: `1px solid ${colors.border}` }}>
              <Search size={14} style={{ color: colors.textMuted }} />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar relatório..."
                className="flex-1 bg-transparent outline-none"
                style={{ fontSize: "13px", color: colors.textPrimary, fontFamily: "'Inter',sans-serif" }}
              />
              {search && <button onClick={() => setSearch("")} style={{ color: colors.textMuted }}><X size={13} /></button>}
            </div>
          </div>

          <div className="rounded-2xl overflow-hidden" style={cardStyle}>
            <div className="grid px-5 py-3"
              style={{ gridTemplateColumns: "3fr 1.2fr 1fr 1fr 120px", borderBottom: `1px solid ${colors.border}`, background: theme === "light" ? colors.surface : "rgba(255,255,255,0.02)" }}
            >
              {["Relatório","Tipo","Data","Tamanho","Ações"].map(h => (
                <span key={h} style={{ fontSize: "11px", color: colors.textMuted, fontFamily: "'Inter',sans-serif", textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</span>
              ))}
            </div>
            {loading ? (
              Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="grid items-center px-5 py-4 gap-4" style={{ gridTemplateColumns: "3fr 1.2fr 1fr 1fr 120px", borderBottom: index < 5 ? `1px solid ${colors.border}` : "none" }}>
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="rounded-xl shrink-0" style={{ width: "34px", height: "34px", background: colors.hoverBg }} />
                    <div className="rounded-full" style={{ width: "70%", height: "13px", background: colors.hoverBg }} />
                  </div>
                  {Array.from({ length: 4 }).map((__, cellIndex) => (
                    <div key={cellIndex} className="rounded-full" style={{ width: cellIndex === 3 ? "64px" : "62%", height: "12px", background: colors.hoverBg }} />
                  ))}
                </div>
              ))
            ) : filteredReports.map((r, i) => (
              <div key={r.id} className="grid items-center px-5 py-4 transition-all cursor-pointer group"
                style={{ gridTemplateColumns: "3fr 1.2fr 1fr 1fr 120px", borderBottom: i < filteredReports.length - 1 ? `1px solid ${colors.border}` : "none" }}
                onMouseEnter={e => (e.currentTarget.style.background = colors.hoverBg)}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="rounded-xl flex items-center justify-center shrink-0" style={{ width: "34px", height: "34px", background: `${r.color}18` }}>
                    <r.icon size={15} style={{ color: r.color }} />
                  </div>
                  <p style={{ fontSize: "13px", color: colors.textPrimary, fontFamily: "'Inter',sans-serif", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {r.name}
                  </p>
                </div>
                <span className="rounded-full px-2.5 py-1 w-fit" style={{ fontSize: "11px", color: r.color, background: `${r.color}18`, fontFamily: "'Inter',sans-serif" }}>
                  {r.type}
                </span>
                <span style={{ fontSize: "12px", color: colors.textSecondary, fontFamily: "'Inter',sans-serif" }}>{r.date}</span>
                <span style={{ fontSize: "12px", color: colors.textMuted, fontFamily: "'Inter',sans-serif" }}>{r.size}</span>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                  <button className="rounded-lg p-1.5 transition-all" style={{ color: colors.textMuted }}
                    onMouseEnter={e => (e.currentTarget.style.color = "#3B82F6")} onMouseLeave={e => (e.currentTarget.style.color = colors.textMuted)}>
                    <Eye size={14} />
                  </button>
                  <button className="flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 transition-all"
                    style={{ fontSize: "11px", color: "#10B981", background: "rgba(16,185,129,0.1)", fontFamily: "'Inter',sans-serif", fontWeight: 500 }}
                    onMouseEnter={e => (e.currentTarget.style.background = "rgba(16,185,129,0.18)")}
                    onMouseLeave={e => (e.currentTarget.style.background = "rgba(16,185,129,0.1)")}
                  >
                    <Download size={12} /> Baixar
                  </button>
                </div>
              </div>
            ))}
            {!loading && filteredReports.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 gap-3">
                <BarChart3 size={28} style={{ color: colors.textMuted }} />
                <p style={{ fontSize: "13px", color: colors.textMuted, fontFamily: "'Inter',sans-serif" }}>Nenhum relatório encontrado</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
