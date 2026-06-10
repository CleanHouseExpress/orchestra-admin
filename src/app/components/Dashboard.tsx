import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell
} from "recharts";
import {
  TrendingUp, TrendingDown, DollarSign, Users,
  Building2, FileText, ArrowUpRight, ArrowDownRight,
  CheckCircle2, Clock, AlertCircle
} from "lucide-react";
import { useTheme } from "./ThemeContext";

const revenueData = [
  { month: "Jan", receita: 84000, despesa: 42000 },
  { month: "Fev", receita: 93000, despesa: 48000 },
  { month: "Mar", receita: 88000, despesa: 45000 },
  { month: "Abr", receita: 112000, despesa: 52000 },
  { month: "Mai", receita: 134000, despesa: 58000 },
  { month: "Jun", receita: 128000, despesa: 55000 },
  { month: "Jul", receita: 152000, despesa: 61000 },
  { month: "Ago", receita: 168000, despesa: 66000 },
  { month: "Set", receita: 143000, despesa: 59000 },
  { month: "Out", receita: 187000, despesa: 72000 },
  { month: "Nov", receita: 204000, despesa: 78000 },
  { month: "Dez", receita: 221000, despesa: 84000 },
];

const contractsData = [
  { name: "Ativo", value: 68, color: "#3B82F6" },
  { name: "Pendente", value: 18, color: "#F59E0B" },
  { name: "Encerrado", value: 14, color: "#94A3B8" },
];

const weeklyActivity = [
  { day: "Seg", value: 24 },
  { day: "Ter", value: 38 },
  { day: "Qua", value: 29 },
  { day: "Qui", value: 47 },
  { day: "Sex", value: 43 },
  { day: "Sáb", value: 18 },
  { day: "Dom", value: 12 },
];

const recentActivities = [
  { id: 1, text: "Contrato #2847 assinado", sub: "Empresa Alpha Ltda", time: "5min", status: "success" },
  { id: 2, text: "Pagamento recebido", sub: "R$ 28.400 — Plano Enterprise", time: "18min", status: "success" },
  { id: 3, text: "Novo cliente cadastrado", sub: "Beta Solutions S.A.", time: "1h", status: "info" },
  { id: 4, text: "Contrato próximo ao vencimento", sub: "Contrato #2791 — 3 dias", time: "2h", status: "warning" },
  { id: 5, text: "Cobrança automática gerada", sub: "R$ 4.200 — Plano Pro", time: "3h", status: "info" },
];

const topClients = [
  { name: "Alpha Tecnologia", revenue: "R$ 84.200", growth: 12.4, plan: "Enterprise" },
  { name: "Beta Solutions", revenue: "R$ 62.800", growth: 8.1, plan: "Pro" },
  { name: "Gamma Corp", revenue: "R$ 48.500", growth: -2.3, plan: "Pro" },
  { name: "Delta Systems", revenue: "R$ 41.200", growth: 18.7, plan: "Enterprise" },
  { name: "Epsilon Group", revenue: "R$ 38.900", growth: 5.2, plan: "Basic" },
];

const kpis = [
  { label: "Receita Total", value: "R$ 1,84M", change: "+18,4%", positive: true, icon: DollarSign, colorKey: "blue" as const, sub: "vs. ano anterior" },
  { label: "Clientes Ativos", value: "2.847", change: "+124", positive: true, icon: Users, colorKey: "teal" as const, sub: "este mês" },
  { label: "Empresas", value: "418", change: "+12", positive: true, icon: Building2, colorKey: "purple" as const, sub: "este mês" },
  { label: "Contratos Ativos", value: "1.203", change: "-8", positive: false, icon: FileText, colorKey: "yellow" as const, sub: "vs. mês anterior" },
];

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

export function Dashboard() {
  const { colors, theme } = useTheme();

  const iconColors: Record<string, string> = {
    blue: "#3B82F6",
    teal: colors.teal,
    purple: "#8B5CF6",
    yellow: colors.yellow,
  };

  const statusIcon = {
    success: <CheckCircle2 size={14} style={{ color: colors.green }} />,
    warning: <AlertCircle size={14} style={{ color: colors.yellow }} />,
    info: <Clock size={14} style={{ color: colors.blue }} />,
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
            Visão geral operacional — Junho 2026
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="flex items-center gap-2 rounded-xl px-4 py-2"
            style={{ background: colors.surface, border: `1px solid ${colors.border}` }}
          >
            <span style={{ fontSize: "13px", color: colors.textSecondary, fontFamily: "'Inter', sans-serif" }}>Últimos 12 meses</span>
          </div>
          <button
            className="rounded-xl px-4 py-2 transition-all duration-200 hover:opacity-90"
            style={{ background: "linear-gradient(135deg, #3B82F6, #2563EB)", fontSize: "13px", color: "#fff", fontFamily: "'Inter', sans-serif", fontWeight: 500 }}
          >
            Exportar Relatório
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {kpis.map((kpi) => {
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
              {[{ label: "Receita", color: "#3B82F6" }, { label: "Despesa", color: colors.textMuted }].map((l) => (
                <span key={l.label} className="flex items-center gap-1.5" style={{ fontSize: "12px", color: colors.textSecondary, fontFamily: "'Inter', sans-serif" }}>
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: l.color }} />{l.label}
                </span>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={revenueData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="receitaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={theme === "dark" ? 0.25 : 0.15} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
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
              <Area type="monotone" dataKey="receita" name="Receita" stroke="#3B82F6" strokeWidth={2} fill="url(#receitaGrad)" />
              <Area type="monotone" dataKey="despesa" name="Despesa" stroke={colors.textMuted} strokeWidth={2} fill="url(#despesaGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Contracts donut */}
        <div className="rounded-2xl p-6" style={cardStyle}>
          <h3 style={{ fontFamily: "'Playfair Display', serif", color: colors.textPrimary, fontSize: "17px", marginBottom: "4px" }}>
            Contratos
          </h3>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "12px", color: colors.textMuted, marginBottom: "24px" }}>
            Distribuição por status
          </p>
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
            <button style={{ fontSize: "12px", color: "#3B82F6", fontFamily: "'Inter', sans-serif" }}>Ver todas</button>
          </div>
          <div className="space-y-4">
            {recentActivities.map((a) => (
              <div key={a.id} className="flex items-start gap-3">
                <div
                  className="mt-0.5 rounded-full flex items-center justify-center shrink-0"
                  style={{ width: "28px", height: "28px", background: colors.surface, border: `1px solid ${colors.border}` }}
                >
                  {statusIcon[a.status as keyof typeof statusIcon]}
                </div>
                <div className="flex-1 min-w-0">
                  <p style={{ fontSize: "13px", color: colors.textPrimary, fontFamily: "'Inter', sans-serif", fontWeight: 500 }}>{a.text}</p>
                  <p style={{ fontSize: "12px", color: colors.textMuted, fontFamily: "'Inter', sans-serif", marginTop: "1px" }}>{a.sub}</p>
                </div>
                <span style={{ fontSize: "11px", color: colors.textMuted, fontFamily: "'Inter', sans-serif" }}>{a.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top clients */}
        <div className="xl:col-span-2 rounded-2xl p-6" style={cardStyle}>
          <div className="flex items-center justify-between mb-5">
            <h3 style={{ fontFamily: "'Playfair Display', serif", color: colors.textPrimary, fontSize: "17px" }}>
              Top Clientes
            </h3>
            <button
              className="rounded-xl px-3 py-1.5"
              style={{ fontSize: "12px", color: colors.textSecondary, fontFamily: "'Inter', sans-serif", background: colors.surface, border: `1px solid ${colors.border}` }}
            >
              Ver relatório completo
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
            {topClients.map((client, i) => (
              <div
                key={client.name}
                className="grid grid-cols-4 items-center py-3 rounded-xl px-1 transition-colors cursor-pointer"
                style={{ borderBottom: i < topClients.length - 1 ? `1px solid ${colors.border}` : "none" }}
                onMouseEnter={e => (e.currentTarget.style.background = colors.hoverBg)}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
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
                <span style={{ fontSize: "13px", color: colors.textPrimary, fontFamily: "'Inter', sans-serif" }}>{client.revenue}</span>
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
          <span
            className="rounded-full px-2 py-1"
            style={{ fontSize: "12px", color: colors.green, fontFamily: "'Inter', sans-serif", background: `${colors.green}18` }}
          >
            +14% vs semana anterior
          </span>
        </div>
        <ResponsiveContainer width="100%" height={140}>
          <BarChart data={weeklyActivity} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={colors.border} vertical={false} />
            <XAxis dataKey="day" tick={{ fill: colors.textMuted, fontSize: 12, fontFamily: "'Inter', sans-serif" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: colors.textMuted, fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="value" name="Operações" fill="#3B82F6" radius={[6, 6, 0, 0]} opacity={theme === "dark" ? 0.85 : 0.9} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
