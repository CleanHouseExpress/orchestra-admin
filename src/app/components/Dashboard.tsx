import { ReactNode, useEffect, useMemo, useState } from "react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell
} from "recharts";
import {
  TrendingUp, TrendingDown, DollarSign, Users,
  Building2, FileText, ArrowUpRight, ArrowDownRight,
  CheckCircle2, Clock, AlertCircle, X, Search,
  Filter, Download, ChevronRight, ExternalLink, Mail, MapPin
} from "lucide-react";
import { useTheme } from "./ThemeContext";
import { DefaultButton } from "./ui/default-button";
import { dashboardApi, DashboardRecentActivity, DashboardSummary, DashboardTopClient, DashboardTopClientsResponse } from "../services/dashboardApi";

type ActivityStatus = "success" | "warning" | "info" | "danger";

const activityCategories = ["Todos", "Contratos", "Financeiro", "Empresas", "Planos", "Usuários", "Relatórios", "Plataforma"];

const statusIconMap = {
  success: CheckCircle2,
  warning: AlertCircle,
  info: Clock,
  danger: AlertCircle,
};

const statusColorMap: Record<ActivityStatus, string> = {
  success: "#10B981",
  warning: "#F59E0B",
  info: "#3B82F6",
  danger: "#EF4444",
};

function formatCurrency(value: number) {
  if (Math.abs(value) >= 1_000_000) {
    return `R$ ${(value / 1_000_000).toLocaleString("pt-BR", { maximumFractionDigits: 2 })}M`;
  }

  if (Math.abs(value) >= 1_000) {
    return `R$ ${(value / 1_000).toLocaleString("pt-BR", { maximumFractionDigits: 0 })}k`;
  }

  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatNumber(value: number) {
  return value.toLocaleString("pt-BR");
}

function formatMonth(value: string) {
  const [year, month] = value.split("-");
  const date = month ? new Date(Number(year), Number(month) - 1, 1) : null;

  return date ? date.toLocaleDateString("pt-BR", { month: "short" }).replace(".", "") : value;
}

function CustomTooltip({ active, payload, label }: any) {
  const { colors } = useTheme();
  if (!active || !payload?.length) return null;
  return (
    <div
      className="rounded-xl px-4 py-3"
      style={{
        background: colors.card,
        border: `1px solid ${colors.borderStrong}`,
        boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
      }}
    >
      <p style={{ fontSize: "12px", color: colors.textMuted, marginBottom: "6px", fontFamily: "'Inter', sans-serif" }}>{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} style={{ fontSize: "13px", color: p.color, fontFamily: "'Inter', sans-serif" }}>
          {p.name}: {typeof p.value === "number" ? (p.value >= 1000 ? `R$ ${(p.value / 1000).toFixed(0)}k` : p.value) : p.value}
        </p>
      ))}
    </div>
  );
}

function Drawer({ title, subtitle, onClose, children }: { title: string; subtitle?: string; onClose: () => void; children: ReactNode }) {
  const { colors } = useTheme();

  return (
    <div className="fixed inset-0 z-50 flex justify-end" style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }} onClick={onClose}>
      <div
        className="flex flex-col h-full overflow-hidden"
        style={{
          width: "min(560px, 96vw)",
          background: colors.bg,
          borderLeft: `1px solid ${colors.border}`,
          boxShadow: "-20px 0 60px rgba(0,0,0,0.25)",
          animation: "slideInRight 0.25s cubic-bezier(0.4,0,0.2,1)",
        }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-5 shrink-0" style={{ borderBottom: `1px solid ${colors.border}`, background: colors.navBg, backdropFilter: "blur(20px)" }}>
          <div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", color: colors.textPrimary, fontSize: "18px", fontWeight: 600 }}>{title}</h2>
            {subtitle && <p style={{ fontSize: "12px", color: colors.textMuted, fontFamily: "'Inter', sans-serif", marginTop: "2px" }}>{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-2 transition-all"
            style={{ color: colors.textMuted, background: colors.surface, border: `1px solid ${colors.border}` }}
            onMouseEnter={e => (e.currentTarget.style.background = colors.hoverBg)}
            onMouseLeave={e => (e.currentTarget.style.background = colors.surface)}
          >
            <X size={16} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
      <style>{`@keyframes slideInRight{from{transform:translateX(100%)}to{transform:translateX(0)}}`}</style>
    </div>
  );
}

function AtividadesDrawer({ onClose, initialActivities }: { onClose: () => void; initialActivities: DashboardRecentActivity[] }) {
  const { colors } = useTheme();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Todos");
  const [statusFilter, setStatusFilter] = useState<ActivityStatus | "todos">("todos");
  const [activities, setActivities] = useState<DashboardRecentActivity[]>(initialActivities);
  const [total, setTotal] = useState(initialActivities.length);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    setLoading(true);
    dashboardApi.activities({
      search,
      category,
      status: statusFilter,
      per_page: 100,
    })
      .then((response) => {
        if (!mounted) return;
        setActivities(response.data);
        setTotal(response.total);
        setError(null);
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : "Não foi possível carregar as atividades.");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [search, category, statusFilter]);

  const grouped = activities.reduce<Record<string, DashboardRecentActivity[]>>((acc, activity) => {
    const date = activity.date ?? "-";
    if (!acc[date]) acc[date] = [];
    acc[date].push(activity);
    return acc;
  }, {});

  const cardStyle = { background: colors.card, border: `1px solid ${colors.border}` };

  return (
    <Drawer title="Todas as Atividades" subtitle={`${total} registro${total !== 1 ? "s" : ""}`} onClose={onClose}>
      <div className="px-5 py-4 space-y-4">
        <div className="flex items-center gap-2 rounded-xl px-3 py-2.5" style={cardStyle}>
          <Search size={14} style={{ color: colors.textMuted }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar atividade..."
            className="flex-1 bg-transparent outline-none"
            style={{ fontSize: "13px", color: colors.textPrimary, fontFamily: "'Inter', sans-serif" }}
          />
          {search && <button onClick={() => setSearch("")} style={{ color: colors.textMuted }}><X size={12} /></button>}
        </div>

        <div className="flex gap-1.5 flex-wrap">
          {([
            { v: "todos", l: "Todos", c: "#3B82F6" },
            { v: "success", l: "Sucesso", c: "#10B981" },
            { v: "info", l: "Info", c: "#3B82F6" },
            { v: "warning", l: "Alerta", c: "#F59E0B" },
            { v: "danger", l: "Crítico", c: "#EF4444" },
          ] as const).map(({ v, l, c }) => (
            <button
              key={v}
              onClick={() => setStatusFilter(v)}
              className="rounded-full px-2.5 py-1 transition-all"
              style={{ fontSize: "11px", fontFamily: "'Inter', sans-serif", fontWeight: statusFilter === v ? 500 : 400, background: statusFilter === v ? c : colors.surface, color: statusFilter === v ? "#fff" : colors.textMuted, border: `1px solid ${statusFilter === v ? "transparent" : colors.border}` }}
            >
              {l}
            </button>
          ))}
        </div>

        <div className="flex gap-1.5 flex-wrap">
          {activityCategories.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className="rounded-full px-2.5 py-1 transition-all"
              style={{ fontSize: "11px", fontFamily: "'Inter', sans-serif", background: category === cat ? "rgba(59,130,246,0.12)" : colors.surface, color: category === cat ? "#3B82F6" : colors.textMuted, border: `1px solid ${category === cat ? "rgba(59,130,246,0.3)" : colors.border}` }}
            >
              {cat}
            </button>
          ))}
        </div>

        {error && (
          <div className="rounded-xl px-4 py-3" style={{ background: `${colors.yellow}12`, border: `1px solid ${colors.yellow}40`, color: colors.textSecondary, fontSize: "13px", fontFamily: "'Inter', sans-serif" }}>
            {error}
          </div>
        )}

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="flex gap-3">
                <div className="rounded-full shrink-0" style={{ width: "30px", height: "30px", background: colors.hoverBg, marginTop: "8px" }} />
                <div className="flex-1 rounded-xl px-4 py-3" style={cardStyle}>
                  <div className="rounded-full mb-2" style={{ width: "70%", height: "13px", background: colors.hoverBg }} />
                  <div className="rounded-full" style={{ width: "48%", height: "12px", background: colors.hoverBg }} />
                </div>
              </div>
            ))}
          </div>
        ) : Object.entries(grouped).length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <Clock size={28} style={{ color: colors.textMuted }} />
            <p style={{ fontSize: "13px", color: colors.textMuted, fontFamily: "'Inter', sans-serif" }}>Nenhuma atividade encontrada</p>
          </div>
        ) : Object.entries(grouped).map(([date, items]) => (
          <div key={date}>
            <div className="flex items-center gap-3 mb-3">
              <span style={{ fontSize: "11px", color: colors.textMuted, fontFamily: "'Inter', sans-serif", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600, whiteSpace: "nowrap" }}>{date}</span>
              <div className="flex-1 h-px" style={{ background: colors.border }} />
            </div>
            <div className="space-y-0 mb-4">
              {items.map((activity, index) => {
                const status = activity.status as ActivityStatus;
                const Icon = statusIconMap[status] ?? Clock;
                const color = statusColorMap[status] ?? "#3B82F6";
                const isLast = index === items.length - 1;

                return (
                  <div key={activity.id} className="flex gap-3 group">
                    <div className="flex flex-col items-center">
                      <div className="rounded-full flex items-center justify-center shrink-0 transition-all" style={{ width: "30px", height: "30px", background: `${color}15`, border: `1px solid ${color}30`, marginTop: "8px" }}>
                        <Icon size={13} style={{ color }} />
                      </div>
                      {!isLast && <div className="w-px flex-1 my-1" style={{ background: colors.border, minHeight: "12px" }} />}
                    </div>
                    <div
                      className="flex-1 rounded-xl px-4 py-3 mb-2 transition-all"
                      style={cardStyle}
                      onMouseEnter={e => (e.currentTarget.style.background = colors.hoverBg)}
                      onMouseLeave={e => (e.currentTarget.style.background = colors.card)}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p style={{ fontSize: "13px", color: colors.textPrimary, fontFamily: "'Inter', sans-serif", fontWeight: 500 }}>{activity.text}</p>
                          <p style={{ fontSize: "12px", color: colors.textMuted, fontFamily: "'Inter', sans-serif", marginTop: "2px" }}>{activity.sub}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="rounded-full px-2 py-0.5" style={{ fontSize: "10px", color, background: `${color}15`, fontFamily: "'Inter', sans-serif", fontWeight: 500 }}>{activity.category ?? "Plataforma"}</span>
                          <span style={{ fontSize: "11px", color: colors.textMuted, fontFamily: "'Inter', sans-serif", whiteSpace: "nowrap" }}>{activity.time}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </Drawer>
  );
}

function TopClientesDrawer({ onClose, initialClients }: { onClose: () => void; initialClients: DashboardTopClient[] }) {
  const { colors, theme } = useTheme();
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"revenue" | "growth" | "contracts" | "users">("revenue");
  const [clients, setClients] = useState<DashboardTopClient[]>(initialClients);
  const [summary, setSummary] = useState<DashboardTopClientsResponse["summary"]>();
  const [selectedClient, setSelectedClient] = useState<DashboardTopClient | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    setLoading(true);
    dashboardApi.topClients({ search, sort_by: sortBy, per_page: 100 })
      .then((response) => {
        if (!mounted) return;
        setClients(response.data);
        setSummary(response.summary);
        setError(null);
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : "Não foi possível carregar o relatório de clientes.");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [search, sortBy]);

  const revenueTotal = summary?.revenue_total ?? clients.reduce((total, client) => total + Number(client.revenue ?? 0), 0);
  const planColor = (plan?: string | null) => plan === "Enterprise" ? "#3B82F6" : plan === "Pro" ? "#14B8A6" : "#94A3B8";

  return (
    <Drawer title="Relatório de Clientes" subtitle={`Top ${clients.length} empresas por receita`} onClose={onClose}>
      <div className="px-5 py-4 space-y-4">
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Receita Total", value: summary?.revenue_total_formatted ?? formatCurrency(revenueTotal), color: "#10B981" },
            { label: "Contratos", value: String(summary?.contracts_total ?? clients.reduce((total, client) => total + Number(client.contracts_count ?? 0), 0)), color: "#3B82F6" },
            { label: "Usuários", value: String(summary?.users_total ?? clients.reduce((total, client) => total + Number(client.users_count ?? 0), 0)), color: "#8B5CF6" },
          ].map(item => (
            <div key={item.label} className="rounded-xl p-3 text-center" style={{ background: colors.card, border: `1px solid ${colors.border}` }}>
              {loading ? (
                <div className="mx-auto rounded-full" style={{ width: "62px", height: "18px", background: colors.hoverBg }} />
              ) : (
                <p style={{ fontSize: "18px", color: item.color, fontFamily: "'Inter', sans-serif", fontWeight: 700, lineHeight: 1 }}>{item.value}</p>
              )}
              <p style={{ fontSize: "11px", color: colors.textMuted, fontFamily: "'Inter', sans-serif", marginTop: "3px" }}>{item.label}</p>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <div className="flex items-center gap-2 rounded-xl px-3 py-2 flex-1" style={{ background: colors.card, border: `1px solid ${colors.border}` }}>
            <Search size={14} style={{ color: colors.textMuted }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar empresa..." className="flex-1 bg-transparent outline-none" style={{ fontSize: "13px", color: colors.textPrimary, fontFamily: "'Inter', sans-serif" }} />
            {search && <button onClick={() => setSearch("")} style={{ color: colors.textMuted }}><X size={12} /></button>}
          </div>
          <div className="relative">
            <select value={sortBy} onChange={e => setSortBy(e.target.value as any)} className="appearance-none rounded-xl px-3 py-2 pr-7 outline-none cursor-pointer" style={{ background: colors.card, border: `1px solid ${colors.border}`, color: colors.textSecondary, fontSize: "12px", fontFamily: "'Inter', sans-serif" }}>
              <option value="revenue">Receita</option>
              <option value="growth">Crescimento</option>
              <option value="contracts">Contratos</option>
              <option value="users">Usuários</option>
            </select>
            <Filter size={11} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: colors.textMuted }} />
          </div>
        </div>

        {error && (
          <div className="rounded-xl px-4 py-3" style={{ background: `${colors.yellow}12`, border: `1px solid ${colors.yellow}40`, color: colors.textSecondary, fontSize: "13px", fontFamily: "'Inter', sans-serif" }}>
            {error}
          </div>
        )}

        <div className="space-y-2">
          {loading ? (
            Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="rounded-2xl p-4" style={{ background: colors.card, border: `1px solid ${colors.border}` }}>
                <div className="flex items-center gap-3">
                  <div className="rounded-lg" style={{ width: "28px", height: "28px", background: colors.hoverBg }} />
                  <div className="rounded-xl" style={{ width: "36px", height: "36px", background: colors.hoverBg }} />
                  <div className="flex-1">
                    <div className="rounded-full mb-2" style={{ width: "64%", height: "13px", background: colors.hoverBg }} />
                    <div className="rounded-full" style={{ width: "42%", height: "12px", background: colors.hoverBg }} />
                  </div>
                </div>
              </div>
            ))
          ) : clients.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <Building2 size={28} style={{ color: colors.textMuted }} />
              <p style={{ fontSize: "13px", color: colors.textMuted, fontFamily: "'Inter', sans-serif" }}>Nenhum cliente encontrado</p>
            </div>
          ) : clients.map((client, index) => {
            const selected = selectedClient?.id === client.id;
            const participation = revenueTotal > 0 ? Math.round(Number(client.revenue ?? 0) / revenueTotal * 100) : 0;

            return (
              <button
                key={client.id}
                onClick={() => setSelectedClient(selected ? null : client)}
                className="w-full text-left rounded-2xl p-4 transition-all"
                style={{
                  background: selected ? (theme === "dark" ? "rgba(59,130,246,0.08)" : "rgba(59,130,246,0.05)") : colors.card,
                  border: `1px solid ${selected ? "rgba(59,130,246,0.3)" : colors.border}`,
                }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="rounded-lg flex items-center justify-center shrink-0 font-bold" style={{ width: "28px", height: "28px", background: index < 3 ? `hsl(${index * 30 + 30}, 80%, 55%)` : colors.surface, fontSize: "12px", color: index < 3 ? "#fff" : colors.textMuted }}>
                    {index + 1}
                  </div>
                  <div className="rounded-xl flex items-center justify-center shrink-0" style={{ width: "36px", height: "36px", background: `hsl(${(index * 47 + 200) % 360}, 55%, ${theme === "light" ? "44%" : "30%"})`, fontSize: "14px", color: "#fff", fontWeight: 700 }}>
                    {client.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p style={{ fontSize: "14px", color: colors.textPrimary, fontFamily: "'Inter', sans-serif", fontWeight: 600 }}>{client.name}</p>
                      <span className="rounded-full px-2 py-0.5" style={{ fontSize: "10px", color: planColor(client.plan), background: `${planColor(client.plan)}18`, fontFamily: "'Inter', sans-serif", fontWeight: 500 }}>
                        {client.plan ?? "Sem plano"}
                      </span>
                    </div>
                    <p style={{ fontSize: "12px", color: colors.textMuted, fontFamily: "'Inter', sans-serif" }}>{client.city ?? "-"}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p style={{ fontSize: "15px", color: colors.textPrimary, fontFamily: "'Inter', sans-serif", fontWeight: 700 }}>{client.revenue_formatted}</p>
                    <span className="flex items-center gap-0.5 justify-end" style={{ fontSize: "12px", color: client.growth >= 0 ? "#10B981" : "#EF4444", fontFamily: "'Inter', sans-serif" }}>
                      {client.growth >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                      {client.growth > 0 ? "+" : ""}{client.growth}%
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {[
                    { icon: FileText, label: "Contratos", value: client.contracts_count },
                    { icon: Users, label: "Usuários", value: client.users_count ?? 0 },
                    { icon: Clock, label: "Desde", value: client.since ?? "-" },
                  ].map(metric => (
                    <div key={metric.label} className="rounded-lg px-2.5 py-2 flex items-center gap-1.5" style={{ background: theme === "dark" ? "rgba(255,255,255,0.03)" : colors.surface }}>
                      <metric.icon size={12} style={{ color: colors.textMuted }} />
                      <div>
                        <p style={{ fontSize: "12px", color: colors.textPrimary, fontFamily: "'Inter', sans-serif", fontWeight: 600 }}>{metric.value}</p>
                        <p style={{ fontSize: "10px", color: colors.textMuted, fontFamily: "'Inter', sans-serif" }}>{metric.label}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {selected && (
                  <div className="mt-3 pt-3 space-y-2" style={{ borderTop: `1px solid ${colors.border}` }}>
                    {client.email && (
                      <div className="flex items-center gap-2" style={{ fontSize: "12px", color: colors.textSecondary, fontFamily: "'Inter', sans-serif" }}>
                        <Mail size={12} style={{ color: colors.textMuted }} />
                        {client.email}
                      </div>
                    )}
                    <div className="flex items-center gap-2" style={{ fontSize: "12px", color: colors.textSecondary, fontFamily: "'Inter', sans-serif" }}>
                      <MapPin size={12} style={{ color: colors.textMuted }} />
                      {client.city ?? "-"}
                    </div>
                    <div className="mt-2">
                      <div className="flex items-center justify-between mb-1">
                        <span style={{ fontSize: "11px", color: colors.textMuted, fontFamily: "'Inter', sans-serif" }}>Participação na receita total</span>
                        <span style={{ fontSize: "11px", color: "#10B981", fontFamily: "'Inter', sans-serif", fontWeight: 600 }}>{participation}%</span>
                      </div>
                      <div className="rounded-full overflow-hidden" style={{ height: "5px", background: colors.surface }}>
                        <div className="h-full rounded-full transition-all" style={{ width: `${participation}%`, background: planColor(client.plan) }} />
                      </div>
                    </div>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        <DefaultButton className="w-full py-3">
          <Download size={14} /> Exportar relatório completo
        </DefaultButton>
      </div>
    </Drawer>
  );
}

export function Dashboard() {
  const { colors, theme } = useTheme();
  const [showAtividades, setShowAtividades] = useState(false);
  const [showTopClientes, setShowTopClientes] = useState(false);
  const [dashboard, setDashboard] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    dashboardApi.summary()
      .then((data) => {
        if (!mounted) return;
        setDashboard(data);
        setError(null);
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : "Não foi possível carregar o dashboard.");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const kpiData = dashboard?.kpis;
  const revenueData = (dashboard?.revenue_series ?? []).map((item) => ({
    ...item,
    month: formatMonth(item.month),
    receita: Number(item.receita ?? 0),
    despesa: Number(item.despesa ?? 0),
  }));
  const contractsData = dashboard?.contracts_distribution ?? [];
  const weeklyActivity = dashboard?.weekly_activity ?? [];
  const recentActivities = dashboard?.recent_activities ?? [];
  const topClients = dashboard?.top_clients ?? [];
  const kpis = useMemo(() => [
    { label: "Receita Total", value: formatCurrency(Number(kpiData?.receita_total ?? 0)), change: "Atual", positive: true, icon: DollarSign, colorKey: "blue" as const, sub: "recebido" },
    { label: "Usuários", value: formatNumber(Number(kpiData?.usuarios_total ?? 0)), change: "Total", positive: true, icon: Users, colorKey: "teal" as const, sub: "cadastrados" },
    { label: "Empresas", value: formatNumber(Number(kpiData?.empresas_total ?? 0)), change: `+${formatNumber(Number(kpiData?.empresas_ativas ?? 0))}`, positive: true, icon: Building2, colorKey: "purple" as const, sub: "ativas" },
    { label: "Contratos Ativos", value: formatNumber(Number(kpiData?.contratos_ativos ?? 0)), change: "Atual", positive: true, icon: FileText, colorKey: "yellow" as const, sub: "vigentes" },
  ], [kpiData]);

  const iconColors: Record<string, string> = {
    blue: "#6366F1",
    teal: colors.teal,
    purple: "#6366F1",
    yellow: colors.yellow,
  };

  const statusIcon = {
    success: <CheckCircle2 size={14} style={{ color: colors.green }} />,
    warning: <AlertCircle size={14} style={{ color: colors.yellow }} />,
    info: <Clock size={14} style={{ color: colors.blue }} />,
    danger: <AlertCircle size={14} style={{ color: colors.red }} />,
  };

  const cardStyle = {
    background: colors.card,
    border: `1px solid ${colors.border}`,
    boxShadow: theme === "light" ? "0 2px 16px rgba(0,0,0,0.06)" : "0 4px 24px rgba(0,0,0,0.2)",
  };

  return (
    <div className="p-6 space-y-6 overflow-y-auto h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", color: colors.textPrimary, fontSize: "26px", fontWeight: 600 }}>
            Dashboard Executivo
          </h1>
          <p style={{ fontFamily: "'Inter', sans-serif", color: colors.textMuted, fontSize: "14px", marginTop: "4px" }}>
            {loading ? "Carregando visão geral operacional..." : "Visão geral operacional"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="flex items-center gap-2 rounded-xl px-4 py-2"
            style={{ background: colors.surface, border: `1px solid ${colors.border}` }}
          >
            <span style={{ fontSize: "13px", color: colors.textSecondary, fontFamily: "'Inter', sans-serif" }}>Últimos 12 meses</span>
          </div>
          <DefaultButton>
            Exportar Relatório
          </DefaultButton>
        </div>
      </div>

      {error && (
        <div
          className="rounded-xl px-4 py-3"
          style={{ background: `${colors.yellow}12`, border: `1px solid ${colors.yellow}40`, color: colors.textSecondary, fontSize: "13px", fontFamily: "'Inter', sans-serif" }}
        >
          {error}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="rounded-2xl p-5" style={cardStyle}>
              <div className="flex items-start justify-between mb-4">
                <div className="rounded-xl" style={{ width: "40px", height: "40px", background: colors.hoverBg }} />
                <div className="rounded-full border-2 animate-spin" style={{ width: "18px", height: "18px", borderColor: "rgba(99,102,241,0.18)", borderTopColor: "#6366F1" }} />
              </div>
              <div className="rounded-full mb-3" style={{ width: "96px", height: "28px", background: colors.hoverBg }} />
              <div className="rounded-full mb-2" style={{ width: "120px", height: "13px", background: colors.hoverBg }} />
              <div className="rounded-full" style={{ width: "88px", height: "11px", background: colors.hoverBg }} />
            </div>
          ))
        ) : error ? (
          <div className="md:col-span-2 xl:col-span-4 rounded-2xl p-5 flex items-center gap-3" style={cardStyle}>
            <AlertCircle size={18} style={{ color: colors.yellow }} />
            <p style={{ fontSize: "13px", color: colors.textMuted, fontFamily: "'Inter', sans-serif" }}>{error}</p>
          </div>
        ) : kpis.map((kpi) => {
          const Icon = kpi.icon;
          const iconColor = iconColors[kpi.colorKey];
          return (
            <div
              key={kpi.label}
              className="rounded-2xl p-5 transition-all duration-300 hover:translate-y-[-2px]"
              style={cardStyle}
            >
              <div className="flex items-start justify-between mb-4">
                <div
                  className="rounded-xl flex items-center justify-center"
                  style={{ width: "40px", height: "40px", background: `${iconColor}18` }}
                >
                  <Icon size={18} style={{ color: iconColor }} />
                </div>
                <span
                  className="flex items-center gap-1 rounded-full px-2 py-1"
                  style={{
                    fontSize: "12px",
                    color: kpi.positive ? colors.green : colors.red,
                    background: kpi.positive ? `${colors.green}18` : `${colors.red}18`,
                    fontFamily: "'Inter', sans-serif",
                    fontWeight: 500,
                  }}
                >
                  {kpi.positive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                  {kpi.change}
                </span>
              </div>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "28px", color: colors.textPrimary, fontWeight: 600, lineHeight: 1 }}>
                {kpi.value}
              </p>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "13px", color: colors.textSecondary, marginTop: "6px" }}>
                {kpi.label}
              </p>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "11px", color: colors.textMuted, marginTop: "2px" }}>
                {kpi.sub}
              </p>
            </div>
          );
        })}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Revenue area chart */}
        <div className="xl:col-span-2 rounded-2xl p-6" style={cardStyle}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 style={{ fontFamily: "'Playfair Display', serif", color: colors.textPrimary, fontSize: "17px" }}>
                Receita vs Despesa
              </h3>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "12px", color: colors.textMuted, marginTop: "2px" }}>
                Evolução anual em R$
              </p>
            </div>
            <div className="flex items-center gap-4">
              {[{ label: "Receita", color: "#6366F1" }, { label: "Despesa", color: colors.textMuted }].map((l) => (
                <span key={l.label} className="flex items-center gap-1.5" style={{ fontSize: "12px", color: colors.textSecondary, fontFamily: "'Inter', sans-serif" }}>
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: l.color }} />{l.label}
                </span>
              ))}
            </div>
          </div>
          {loading ? (
            <div className="flex items-center justify-center" style={{ height: "220px", border: `1px dashed ${colors.border}`, borderRadius: "12px" }}>
              <span className="rounded-full border-2 animate-spin" style={{ width: "24px", height: "24px", borderColor: "rgba(99,102,241,0.18)", borderTopColor: "#6366F1" }} />
            </div>
          ) : (
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={revenueData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="receitaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366F1" stopOpacity={theme === "dark" ? 0.25 : 0.15} />
                  <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="despesaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={colors.textMuted} stopOpacity={0.15} />
                  <stop offset="95%" stopColor={colors.textMuted} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={colors.border} />
              <XAxis dataKey="month" tick={{ fill: colors.textMuted, fontSize: 12, fontFamily: "'Inter', sans-serif" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: colors.textMuted, fontSize: 11, fontFamily: "'Inter', sans-serif" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v / 1000}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="receita" name="Receita" stroke="#6366F1" strokeWidth={2} fill="url(#receitaGrad)" />
              <Area type="monotone" dataKey="despesa" name="Despesa" stroke={colors.textMuted} strokeWidth={2} fill="url(#despesaGrad)" />
            </AreaChart>
          </ResponsiveContainer>
          )}
        </div>

        {/* Contracts donut */}
        <div className="rounded-2xl p-6" style={cardStyle}>
          <h3 style={{ fontFamily: "'Playfair Display', serif", color: colors.textPrimary, fontSize: "17px", marginBottom: "4px" }}>
            Contratos
          </h3>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "12px", color: colors.textMuted, marginBottom: "24px" }}>
            Distribuição por status
          </p>
          {loading ? (
            <div className="flex flex-col items-center justify-center gap-5" style={{ height: "268px" }}>
              <span className="rounded-full border-2 animate-spin" style={{ width: "24px", height: "24px", borderColor: "rgba(99,102,241,0.18)", borderTopColor: "#6366F1" }} />
              <div className="space-y-2 w-full">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="rounded-full" style={{ width: `${80 - index * 12}%`, height: "12px", background: colors.hoverBg }} />
                ))}
              </div>
            </div>
          ) : (
          <>
            <div className="flex justify-center mb-6">
            <ResponsiveContainer width={180} height={180}>
              <PieChart>
                <Pie data={contractsData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                  {contractsData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) =>
                    active && payload?.length ? (
                      <div className="rounded-xl px-3 py-2" style={{ background: colors.card, border: `1px solid ${colors.borderStrong}` }}>
                        <p style={{ fontSize: "12px", color: payload[0].payload.color, fontFamily: "'Inter', sans-serif" }}>
                          {payload[0].name}: {payload[0].value}%
                        </p>
                      </div>
                    ) : null
                  }
                />
              </PieChart>
            </ResponsiveContainer>
            </div>
            <div className="space-y-2">
            {contractsData.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <span className="flex items-center gap-2" style={{ fontSize: "13px", color: colors.textSecondary, fontFamily: "'Inter', sans-serif" }}>
                  <span className="w-2 h-2 rounded-full" style={{ background: item.color }} />
                  {item.name}
                </span>
                <span style={{ fontSize: "13px", color: colors.textPrimary, fontFamily: "'Inter', sans-serif", fontWeight: 500 }}>
                  {item.value}%
                </span>
              </div>
            ))}
            </div>
          </>
          )}
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Activity feed */}
        <div className="rounded-2xl p-6" style={cardStyle}>
          <div className="flex items-center justify-between mb-5">
            <h3 style={{ fontFamily: "'Playfair Display', serif", color: colors.textPrimary, fontSize: "17px" }}>
              Atividades
            </h3>
            <button
              onClick={() => setShowAtividades(true)}
              className="flex items-center gap-1 transition-all hover:gap-1.5"
              style={{ fontSize: "12px", color: "#6366F1", fontFamily: "'Inter', sans-serif" }}
            >
              Ver todas <ChevronRight size={13} />
            </button>
          </div>
          <div className="space-y-4">
            {loading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="rounded-full shrink-0" style={{ width: "28px", height: "28px", background: colors.hoverBg }} />
                  <div className="flex-1 min-w-0">
                    <div className="rounded-full mb-2" style={{ width: "76%", height: "13px", background: colors.hoverBg }} />
                    <div className="rounded-full" style={{ width: "54%", height: "12px", background: colors.hoverBg }} />
                  </div>
                  <span className="rounded-full border-2 animate-spin shrink-0" style={{ width: "16px", height: "16px", borderColor: "rgba(99,102,241,0.18)", borderTopColor: "#6366F1" }} />
                </div>
              ))
            ) : recentActivities.map((a) => (
              <div key={a.id} className="flex items-start gap-3">
                <div
                  className="mt-0.5 rounded-full flex items-center justify-center shrink-0"
                  style={{ width: "28px", height: "28px", background: colors.surface, border: `1px solid ${colors.border}` }}
                >
                  {statusIcon[a.status as keyof typeof statusIcon] ?? statusIcon.info}
                </div>
                <div className="flex-1 min-w-0">
                  <p style={{ fontSize: "13px", color: colors.textPrimary, fontFamily: "'Inter', sans-serif", fontWeight: 500 }}>{a.text}</p>
                  <p style={{ fontSize: "12px", color: colors.textMuted, fontFamily: "'Inter', sans-serif", marginTop: "1px" }}>{a.sub}</p>
                </div>
                <span style={{ fontSize: "11px", color: colors.textMuted, fontFamily: "'Inter', sans-serif" }}>{a.time}</span>
              </div>
            ))}
          </div>
          {!loading && (
            <button
              onClick={() => setShowAtividades(true)}
              className="w-full mt-4 rounded-xl py-2 transition-all"
              style={{ fontSize: "12px", color: colors.textMuted, fontFamily: "'Inter', sans-serif", background: colors.surface, border: `1px solid ${colors.border}` }}
              onMouseEnter={e => (e.currentTarget.style.background = colors.hoverBg)}
              onMouseLeave={e => (e.currentTarget.style.background = colors.surface)}
            >
              Ver todas as {recentActivities.length} atividades
            </button>
          )}
        </div>

        {/* Top clients */}
        <div className="xl:col-span-2 rounded-2xl p-6" style={cardStyle}>
          <div className="flex items-center justify-between mb-5">
            <h3 style={{ fontFamily: "'Playfair Display', serif", color: colors.textPrimary, fontSize: "17px" }}>
              Top Clientes
            </h3>
            <button
              onClick={() => setShowTopClientes(true)}
              className="flex items-center gap-2 rounded-xl px-3 py-1.5 transition-all"
              style={{ fontSize: "12px", color: colors.textSecondary, fontFamily: "'Inter', sans-serif", background: colors.surface, border: `1px solid ${colors.border}` }}
              onMouseEnter={e => (e.currentTarget.style.background = colors.hoverBg)}
              onMouseLeave={e => (e.currentTarget.style.background = colors.surface)}
            >
              Ver relatório completo <ExternalLink size={12} />
            </button>
          </div>
          <div>
            <div className="grid grid-cols-4 pb-2 mb-1" style={{ borderBottom: `1px solid ${colors.border}` }}>
              {["Cliente", "Receita", "Crescimento", "Plano"].map((h) => (
                <span key={h} style={{ fontSize: "11px", color: colors.textMuted, fontFamily: "'Inter', sans-serif", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  {h}
                </span>
              ))}
            </div>
            {loading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="grid grid-cols-4 items-center py-3 px-1" style={{ borderBottom: index < 4 ? `1px solid ${colors.border}` : "none" }}>
                  <div className="flex items-center gap-2">
                    <div className="rounded-lg shrink-0" style={{ width: "28px", height: "28px", background: colors.hoverBg }} />
                    <div className="rounded-full" style={{ width: "70%", height: "13px", background: colors.hoverBg }} />
                  </div>
                  {Array.from({ length: 3 }).map((__, cellIndex) => (
                    <div key={cellIndex} className="rounded-full" style={{ width: cellIndex === 2 ? "64px" : "58%", height: "12px", background: colors.hoverBg }} />
                  ))}
                </div>
              ))
            ) : topClients.map((client, i) => (
              <div
                key={client.id ?? client.name}
                className="grid grid-cols-4 items-center py-3 rounded-xl px-1 transition-colors cursor-pointer"
                style={{ borderBottom: i < topClients.length - 1 ? `1px solid ${colors.border}` : "none" }}
                onMouseEnter={e => (e.currentTarget.style.background = colors.hoverBg)}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                onClick={() => setShowTopClientes(true)}
              >
                <div className="flex items-center gap-2">
                  <div
                    className="rounded-lg flex items-center justify-center shrink-0"
                    style={{ width: "28px", height: "28px", background: `hsl(${i * 50 + 210}, 60%, ${theme === "light" ? "40%" : "30%"})`, fontSize: "11px", color: "#fff", fontWeight: 600 }}
                  >
                    {client.name.charAt(0)}
                  </div>
                  <span style={{ fontSize: "13px", color: colors.textPrimary, fontFamily: "'Inter', sans-serif", fontWeight: 500 }}>
                    {client.name}
                  </span>
                </div>
                <span style={{ fontSize: "13px", color: colors.textPrimary, fontFamily: "'Inter', sans-serif" }}>{client.revenue_formatted}</span>
                <span
                  className="flex items-center gap-1"
                  style={{ fontSize: "13px", color: client.growth >= 0 ? colors.green : colors.red, fontFamily: "'Inter', sans-serif" }}
                >
                  {client.growth >= 0 ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
                  {client.growth > 0 ? "+" : ""}{client.growth}%
                </span>
                <span
                  className="rounded-full px-2 py-0.5 inline-flex w-fit"
                  style={{
                    fontSize: "11px",
                    fontFamily: "'Inter', sans-serif",
                    fontWeight: 500,
                    background: client.plan === "Enterprise" ? `${colors.blue}18` : client.plan === "Pro" ? `${colors.teal}18` : `${colors.textMuted}18`,
                    color: client.plan === "Enterprise" ? colors.blue : client.plan === "Pro" ? colors.teal : colors.textMuted,
                  }}
                >
                  {client.plan}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Weekly bar chart */}
      <div className="rounded-2xl p-6" style={cardStyle}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 style={{ fontFamily: "'Playfair Display', serif", color: colors.textPrimary, fontSize: "17px" }}>
              Atividade Semanal
            </h3>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "12px", color: colors.textMuted, marginTop: "2px" }}>
              Operações por dia desta semana
            </p>
          </div>
          {!loading && (
            <span
              className="rounded-full px-2 py-1"
              style={{ fontSize: "12px", color: colors.green, fontFamily: "'Inter', sans-serif", background: `${colors.green}18` }}
            >
              Atual
            </span>
          )}
        </div>
        {loading ? (
          <div className="flex items-center justify-center" style={{ height: "140px", border: `1px dashed ${colors.border}`, borderRadius: "12px" }}>
            <span className="rounded-full border-2 animate-spin" style={{ width: "24px", height: "24px", borderColor: "rgba(99,102,241,0.18)", borderTopColor: "#6366F1" }} />
          </div>
        ) : (
        <ResponsiveContainer width="100%" height={140}>
          <BarChart data={weeklyActivity} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={colors.border} vertical={false} />
            <XAxis dataKey="day" tick={{ fill: colors.textMuted, fontSize: 12, fontFamily: "'Inter', sans-serif" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: colors.textMuted, fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="value" name="Operações" fill="#6366F1" radius={[6, 6, 0, 0]} opacity={theme === "dark" ? 0.85 : 0.9} />
          </BarChart>
        </ResponsiveContainer>
        )}
      </div>
      {showAtividades && <AtividadesDrawer onClose={() => setShowAtividades(false)} initialActivities={recentActivities} />}
      {showTopClientes && <TopClientesDrawer onClose={() => setShowTopClientes(false)} initialClients={topClients} />}
    </div>
  );
}
