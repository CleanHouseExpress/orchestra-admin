import { useEffect, useMemo, useState } from "react";
import {
  DollarSign, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight,
  ChevronDown, Search, X, Eye, Download, Filter,
  CheckCircle2, Clock, XCircle, AlertCircle, CreditCard,
  Building2, Calendar, ChevronLeft, ChevronRight, Wallet
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell
} from "recharts";
import { useTheme } from "./ThemeContext";
import { DefaultButton } from "./ui/default-button";
import { ApiFinancialTransaction, financialApi, FinancialMetrics } from "../services/financialApi";

// ── Types ───────────────────────────────────────────────────────────────
type TransacaoStatus = "pago" | "pendente" | "vencido" | "cancelado";
type TransacaoTipo   = "receita" | "despesa";

interface Transacao {
  id: number;
  descricao: string;
  empresa: string;
  tipo: TransacaoTipo;
  valor: number;
  status: TransacaoStatus;
  data: string;
  vencimento: string;
  categoria: string;
  metodo: string;
}

const statusConfig: Record<TransacaoStatus, { label: string; color: string; bg: string; icon: any }> = {
  pago:      { label: "Pago",      color: "#10B981", bg: "rgba(16,185,129,0.12)",  icon: CheckCircle2 },
  pendente:  { label: "Pendente",  color: "#F59E0B", bg: "rgba(245,158,11,0.12)",  icon: Clock        },
  vencido:   { label: "Vencido",   color: "#EF4444", bg: "rgba(239,68,68,0.12)",   icon: AlertCircle  },
  cancelado: { label: "Cancelado", color: "#94A3B8", bg: "rgba(148,163,184,0.12)", icon: XCircle      },
};

const ITEMS = 8;

function fmt(v: number) { return `R$ ${v.toLocaleString("pt-BR")}` }

function toNumber(value: number | string | null | undefined) {
  return Number(value ?? 0);
}

function formatDate(value: string | null | undefined) {
  if (!value) return "-";
  const [year, month, day] = value.split("T")[0].split("-");

  if (!year || !month || !day) return value;
  return `${day}/${month}/${year}`;
}

function mapTransaction(transaction: ApiFinancialTransaction): Transacao {
  return {
    id: transaction.id,
    descricao: transaction.descricao ?? transaction.description,
    empresa: transaction.empresa ?? transaction.company_name ?? "ORQUESTRA",
    tipo: transaction.tipo ?? transaction.type,
    valor: toNumber(transaction.valor ?? transaction.amount),
    status: transaction.status,
    data: formatDate(transaction.data ?? transaction.issued_at),
    vencimento: formatDate(transaction.vencimento ?? transaction.due_date),
    categoria: transaction.categoria ?? transaction.category ?? "-",
    metodo: transaction.metodo ?? transaction.method ?? "-",
  };
}

function monthLabel(value: string) {
  const [year, month] = value.split("-");
  const date = month ? new Date(Number(year), Number(month) - 1, 1) : null;

  return date ? date.toLocaleDateString("pt-BR", { month: "short" }).replace(".", "") : value;
}

function Tooltip2({ active, payload, label }: any) {
  const { colors } = useTheme();
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl px-4 py-3" style={{ background: colors.card, border: `1px solid ${colors.borderStrong}`, boxShadow: "0 8px 24px rgba(0,0,0,0.15)" }}>
      <p style={{ fontSize: "12px", color: colors.textMuted, marginBottom: "4px", fontFamily: "'Inter',sans-serif" }}>{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} style={{ fontSize: "13px", color: p.color, fontFamily: "'Inter',sans-serif" }}>
          {p.name}: {p.value > 999 ? fmt(p.value) : p.value}
        </p>
      ))}
    </div>
  );
}

export function Financeiro() {
  const { colors, theme } = useTheme();
  const [search, setSearch]     = useState("");
  const [tipoFilter, setTipoFilter]     = useState<TransacaoTipo | "todos">("todos");
  const [statusFilter, setStatusFilter] = useState<TransacaoStatus | "todos">("todos");
  const [period, setPeriod]     = useState("junho-2026");
  const [page, setPage]         = useState(1);
  const [apiTransactions, setApiTransactions] = useState<Transacao[]>([]);
  const [metrics, setMetrics] = useState<FinancialMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    Promise.all([
      financialApi.list({ per_page: 100 }),
      financialApi.metrics(),
    ])
      .then(([transactionsResponse, metricsResponse]) => {
        if (!mounted) return;
        setApiTransactions(transactionsResponse.data.map(mapTransaction));
        setMetrics(metricsResponse);
        setError(null);
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : "Não foi possível carregar os dados financeiros.");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const sourceTransactions = apiTransactions;

  const filtered = sourceTransactions.filter(t => {
    const q = search.toLowerCase();
    const matchSearch = t.descricao.toLowerCase().includes(q) || t.empresa.toLowerCase().includes(q);
    const matchTipo   = tipoFilter   === "todos" || t.tipo   === tipoFilter;
    const matchStatus = statusFilter === "todos" || t.status === statusFilter;
    return matchSearch && matchTipo && matchStatus;
  });

  const totalPages = Math.ceil(filtered.length / ITEMS);
  const paginated  = filtered.slice((page - 1) * ITEMS, page * ITEMS);

  const receitas  = metrics?.receita ?? sourceTransactions.filter(t => t.tipo === "receita" && t.status === "pago").reduce((a, t) => a + t.valor, 0);
  const despesas  = metrics?.despesas ?? sourceTransactions.filter(t => t.tipo === "despesa" && t.status === "pago").reduce((a, t) => a + t.valor, 0);
  const pendentes = metrics?.pendentes ?? sourceTransactions.filter(t => t.status === "pendente").reduce((a, t) => a + t.valor, 0);
  const vencidos  = metrics?.vencidos ?? sourceTransactions.filter(t => t.status === "vencido").reduce((a, t) => a + t.valor, 0);
  const lucro     = receitas - despesas;
  const margem    = receitas > 0 ? Math.round((lucro / receitas) * 100) : 0;
  const categoryTotal = metrics?.by_category?.reduce((sum, item) => sum + Number(item.total), 0) ?? 0;
  const chartMonthlyData = useMemo(() => {
    if (!apiTransactions.length) return [];

    const grouped = new Map<string, { mes: string; receita: number; despesa: number }>();

    apiTransactions.forEach((transaction) => {
      const [, , month, year] = transaction.data.match(/^(\d{2})\/(\d{2})\/(\d{4})$/) ?? [];
      const key = year && month ? `${year}-${month}` : transaction.data;
      const current = grouped.get(key) ?? { mes: monthLabel(key), receita: 0, despesa: 0 };

      if (transaction.tipo === "receita") current.receita += transaction.valor;
      if (transaction.tipo === "despesa") current.despesa += transaction.valor;
      grouped.set(key, current);
    });

    return Array.from(grouped.entries()).sort(([a], [b]) => a.localeCompare(b)).map(([, item]) => item);
  }, [apiTransactions]);
  const chartCategoriaData = metrics?.by_category?.length
    ? metrics.by_category.slice(0, 5).map((item, index) => ({
        name: item.categoria ?? "Outros",
        value: categoryTotal ? Math.round(Number(item.total) / categoryTotal * 100) : 0,
        color: ["#3B82F6", "#14B8A6", "#8B5CF6", "#F59E0B", "#94A3B8"][index] ?? "#94A3B8",
      }))
    : [];
  const chartFluxoCaixa = metrics?.cash_flow?.length
    ? metrics.cash_flow.map((item) => ({ dia: item.data.slice(-2), saldo: Number(item.saldo) }))
    : [];
  const saldoAtual = chartFluxoCaixa.at(-1)?.saldo ?? 0;

  const kpis = [
    { label: "Receita do Mês",  value: fmt(receitas),  change: "Atual", positive: true,  color: "#10B981", icon: TrendingUp,   sub: "período atual" },
    { label: "Despesas",        value: fmt(despesas),  change: "Atual", positive: false, color: "#EF4444", icon: TrendingDown, sub: "período atual" },
    { label: "Lucro Líquido",   value: fmt(lucro),     change: "Atual", positive: lucro >= 0,  color: "#3B82F6", icon: DollarSign,   sub: "margem " + margem + "%" },
    { label: "A Receber",       value: fmt(pendentes + vencidos), change: vencidos > 0 ? `R$ ${vencidos.toLocaleString("pt-BR")} vencido` : "Em dia", positive: vencidos === 0, color: "#F59E0B", icon: Clock, sub: `${sourceTransactions.filter(t => t.status === "pendente" || t.status === "vencido").length} lançamentos` },
  ];

  const cardStyle = {
    background: colors.card,
    border: `1px solid ${colors.border}`,
    boxShadow: theme === "light" ? "0 2px 12px rgba(0,0,0,0.05)" : "0 4px 20px rgba(0,0,0,0.15)",
  };

  return (
    <div className="p-6 space-y-6 overflow-y-auto h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 style={{ fontFamily: "'Playfair Display',serif", color: colors.textPrimary, fontSize: "26px", fontWeight: 600 }}>Financeiro</h1>
          <p style={{ fontFamily: "'Inter',sans-serif", color: colors.textMuted, fontSize: "14px", marginTop: "4px" }}>
            {loading ? "Carregando dados financeiros..." : "Visão consolidada das finanças da plataforma"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <select value={period} onChange={e => setPeriod(e.target.value)}
              className="appearance-none rounded-xl px-4 py-2 pr-9 outline-none cursor-pointer"
              style={{ height: "36px", background: colors.card, border: `1px solid ${colors.border}`, color: colors.textSecondary, fontSize: "13px", fontFamily: "'Inter',sans-serif" }}
            >
              <option value="junho-2026">Junho 2026</option>
              <option value="maio-2026">Maio 2026</option>
              <option value="q2-2026">Q2 2026</option>
              <option value="2026">Ano 2026</option>
            </select>
            <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: colors.textMuted }} />
          </div>
          <DefaultButton>
            <Download size={14} /> Exportar
          </DefaultButton>
        </div>
      </div>

      {error && (
        <div className="rounded-xl px-4 py-3" style={{ background: `${colors.yellow}12`, border: `1px solid ${colors.yellow}40`, color: colors.textSecondary, fontSize: "13px", fontFamily: "'Inter',sans-serif" }}>
          {error}
        </div>
      )}
      {loading && (
        <div className="sr-only">Carregando lançamentos, métricas e gráficos financeiros...</div>
      )}
      {/* KPIs */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="rounded-2xl p-5" style={cardStyle}>
              <div className="flex items-start justify-between mb-3">
                <div className="rounded-xl" style={{ width: "40px", height: "40px", background: colors.hoverBg }} />
                <div className="rounded-full border-2 animate-spin" style={{ width: "18px", height: "18px", borderColor: "rgba(99,102,241,0.18)", borderTopColor: "#6366F1" }} />
              </div>
              <div className="rounded-full mb-3" style={{ width: "86px", height: "24px", background: colors.hoverBg }} />
              <div className="rounded-full mb-2" style={{ width: "120px", height: "13px", background: colors.hoverBg }} />
              <div className="rounded-full" style={{ width: "92px", height: "11px", background: colors.hoverBg }} />
            </div>
          ))
        ) : error ? (
          <div className="col-span-2 xl:col-span-4 rounded-2xl p-5 flex items-center gap-3" style={cardStyle}>
            <XCircle size={18} style={{ color: "#EF4444" }} />
            <p style={{ fontSize: "13px", color: colors.textMuted, fontFamily: "'Inter',sans-serif" }}>{error}</p>
          </div>
        ) : kpis.map(k => (
          <div key={k.label} className="rounded-2xl p-5 transition-all hover:translate-y-[-2px]" style={cardStyle}>
            <div className="flex items-start justify-between mb-3">
              <div className="rounded-xl flex items-center justify-center" style={{ width: "40px", height: "40px", background: `${k.color}15` }}>
                <k.icon size={18} style={{ color: k.color }} />
              </div>
              <span className="flex items-center gap-0.5 rounded-full px-2 py-0.5"
                style={{ fontSize: "11px", color: k.positive ? "#10B981" : "#EF4444", background: k.positive ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)", fontFamily: "'Inter',sans-serif", fontWeight: 500 }}
              >
                {k.positive ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />} {k.change}
              </span>
            </div>
            <p style={{ fontSize: "24px", color: colors.textPrimary, fontFamily: "'Inter',sans-serif", fontWeight: 700, lineHeight: 1 }}>{k.value}</p>
            <p style={{ fontSize: "13px", color: colors.textSecondary, fontFamily: "'Inter',sans-serif", marginTop: "5px" }}>{k.label}</p>
            <p style={{ fontSize: "11px", color: colors.textMuted, fontFamily: "'Inter',sans-serif", marginTop: "1px" }}>{k.sub}</p>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Receita vs Despesa */}
        <div className="xl:col-span-2 rounded-2xl p-6" style={cardStyle}>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 style={{ fontFamily: "'Playfair Display',serif", color: colors.textPrimary, fontSize: "16px" }}>Receita vs Despesa</h3>
              <p style={{ fontSize: "12px", color: colors.textMuted, fontFamily: "'Inter',sans-serif", marginTop: "2px" }}>Últimos 6 meses</p>
            </div>
            <div className="flex items-center gap-4">
              {[{ label: "Receita", color: "#10B981" }, { label: "Despesa", color: "#EF4444" }].map(l => (
                <span key={l.label} className="flex items-center gap-1.5" style={{ fontSize: "12px", color: colors.textSecondary, fontFamily: "'Inter',sans-serif" }}>
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: l.color }} />{l.label}
                </span>
              ))}
            </div>
          </div>
          {loading ? (
            <div className="flex items-center justify-center" style={{ height: "200px", border: `1px dashed ${colors.border}`, borderRadius: "12px" }}>
              <span className="rounded-full border-2 animate-spin" style={{ width: "24px", height: "24px", borderColor: "rgba(99,102,241,0.18)", borderTopColor: "#6366F1" }} />
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={chartMonthlyData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="fin_recGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#10B981" stopOpacity={theme === "dark" ? 0.2 : 0.12} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="fin_despGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#EF4444" stopOpacity={theme === "dark" ? 0.15 : 0.08} />
                  <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={colors.border} />
              <XAxis dataKey="mes" tick={{ fill: colors.textMuted, fontSize: 11, fontFamily: "'Inter',sans-serif" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: colors.textMuted, fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `${v/1000}k`} />
              <Tooltip content={<Tooltip2 />} />
              <Area type="monotone" dataKey="receita" name="Receita" stroke="#10B981" strokeWidth={2} fill="url(#fin_recGrad)" />
              <Area type="monotone" dataKey="despesa" name="Despesa" stroke="#EF4444" strokeWidth={2} fill="url(#fin_despGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Receita por categoria */}
        <div className="rounded-2xl p-6" style={cardStyle}>
          <h3 style={{ fontFamily: "'Playfair Display',serif", color: colors.textPrimary, fontSize: "16px", marginBottom: "4px" }}>Por Categoria</h3>
          <p style={{ fontSize: "12px", color: colors.textMuted, fontFamily: "'Inter',sans-serif", marginBottom: "20px" }}>Receita por categoria</p>
          {loading ? (
            <div className="flex flex-col items-center justify-center gap-4" style={{ height: "224px" }}>
              <span className="rounded-full border-2 animate-spin" style={{ width: "24px", height: "24px", borderColor: "rgba(99,102,241,0.18)", borderTopColor: "#6366F1" }} />
              <div className="space-y-2 w-full">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="rounded-full" style={{ width: `${80 - index * 10}%`, height: "12px", background: colors.hoverBg }} />
                ))}
              </div>
            </div>
          ) : (
          <>
            <div className="flex justify-center mb-4">
            <ResponsiveContainer width={160} height={160}>
              <PieChart>
                <Pie data={chartCategoriaData} cx="50%" cy="50%" innerRadius={48} outerRadius={72} paddingAngle={3} dataKey="value">
                  {chartCategoriaData.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip content={({ active, payload }) =>
                  active && payload?.length ? (
                    <div className="rounded-xl px-3 py-2" style={{ background: colors.card, border: `1px solid ${colors.borderStrong}` }}>
                      <p style={{ fontSize: "12px", color: payload[0].payload.color, fontFamily: "'Inter',sans-serif" }}>
                        {payload[0].name}: {payload[0].value}%
                      </p>
                    </div>
                  ) : null}
                />
              </PieChart>
            </ResponsiveContainer>
            </div>
            <div className="space-y-2">
            {chartCategoriaData.map(c => (
              <div key={c.name} className="flex items-center justify-between">
                <span className="flex items-center gap-2" style={{ fontSize: "12px", color: colors.textSecondary, fontFamily: "'Inter',sans-serif" }}>
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ background: c.color }} />{c.name}
                </span>
                <span style={{ fontSize: "12px", color: colors.textPrimary, fontFamily: "'Inter',sans-serif", fontWeight: 600 }}>{c.value}%</span>
              </div>
            ))}
            </div>
          </>
          )}
        </div>
      </div>

      {/* Fluxo de caixa */}
      <div className="rounded-2xl p-6" style={cardStyle}>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 style={{ fontFamily: "'Playfair Display',serif", color: colors.textPrimary, fontSize: "16px" }}>Fluxo de Caixa — Junho</h3>
            <p style={{ fontSize: "12px", color: colors.textMuted, fontFamily: "'Inter',sans-serif", marginTop: "2px" }}>Saldo projetado por dia</p>
          </div>
          <span className="rounded-full px-3 py-1" style={{ fontSize: "12px", color: "#10B981", background: "rgba(16,185,129,0.1)", fontFamily: "'Inter',sans-serif" }}>
            Saldo atual: {fmt(saldoAtual)}
          </span>
        </div>
        {loading ? (
          <div className="flex items-center justify-center" style={{ height: "140px", border: `1px dashed ${colors.border}`, borderRadius: "12px" }}>
            <span className="rounded-full border-2 animate-spin" style={{ width: "24px", height: "24px", borderColor: "rgba(99,102,241,0.18)", borderTopColor: "#6366F1" }} />
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={140}>
            <LineChart data={chartFluxoCaixa} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={colors.border} />
            <XAxis dataKey="dia" tick={{ fill: colors.textMuted, fontSize: 11, fontFamily: "'Inter',sans-serif" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: colors.textMuted, fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `${v/1000}k`} />
            <Tooltip content={<Tooltip2 />} />
            <Line type="monotone" dataKey="saldo" name="Saldo" stroke="#3B82F6" strokeWidth={2.5} dot={{ fill: "#3B82F6", r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Transações */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 style={{ fontFamily: "'Playfair Display',serif", color: colors.textPrimary, fontSize: "18px", fontWeight: 600 }}>Lançamentos</h3>
        </div>

        {/* Filters */}
        <div className="rounded-2xl p-4" style={cardStyle}>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 rounded-xl px-3 py-2 flex-1 min-w-[200px]" style={{ background: colors.surface, border: `1px solid ${colors.border}` }}>
              <Search size={14} style={{ color: colors.textMuted }} />
              <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Buscar lançamento ou empresa..."
                className="flex-1 bg-transparent outline-none"
                style={{ fontSize: "13px", color: colors.textPrimary, fontFamily: "'Inter',sans-serif" }}
              />
              {search && <button onClick={() => setSearch("")} style={{ color: colors.textMuted }}><X size={13} /></button>}
            </div>
            {/* Tipo */}
            <div className="flex rounded-xl overflow-hidden" style={{ border: `1px solid ${colors.border}` }}>
              {[{ v: "todos", l: "Todos" }, { v: "receita", l: "Receitas" }, { v: "despesa", l: "Despesas" }].map(({ v, l }) => (
                <button key={v} onClick={() => { setTipoFilter(v as any); setPage(1); }}
                  className="px-3 py-2 transition-all"
                  style={{ fontSize: "12px", fontFamily: "'Inter',sans-serif", background: tipoFilter === v ? "linear-gradient(135deg, #6366F1, #4338CA)" : colors.surface, color: tipoFilter === v ? "#fff" : colors.textMuted }}
                >
                  {l}
                </button>
              ))}
            </div>
            {/* Status */}
            <div className="relative">
              <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value as any); setPage(1); }}
                className="appearance-none rounded-xl px-3 py-2 pr-8 outline-none cursor-pointer"
                style={{ background: colors.surface, border: `1px solid ${statusFilter !== "todos" ? "#6366F1" : colors.border}`, color: statusFilter !== "todos" ? "#6366F1" : colors.textSecondary, fontSize: "13px", fontFamily: "'Inter',sans-serif" }}
              >
                <option value="todos">Status</option>
                {Object.entries(statusConfig).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
              <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: colors.textMuted }} />
            </div>
            <span style={{ fontSize: "13px", color: colors.textMuted, fontFamily: "'Inter',sans-serif", marginLeft: "auto" }}>{filtered.length} registros</span>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-2xl overflow-hidden" style={cardStyle}>
          <div className="grid px-5 py-3"
            style={{ gridTemplateColumns: "2fr 1.4fr 1fr 1fr 1fr 1fr 1fr", borderBottom: `1px solid ${colors.border}`, background: theme === "light" ? colors.surface : "rgba(255,255,255,0.02)" }}
          >
            {["Descrição","Empresa","Tipo","Categoria","Status","Valor","Data"].map(h => (
              <span key={h} style={{ fontSize: "11px", color: colors.textMuted, fontFamily: "'Inter',sans-serif", textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</span>
            ))}
          </div>
          {loading ? (
            Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="grid items-center px-5 py-3.5 gap-4" style={{ gridTemplateColumns: "2fr 1.4fr 1fr 1fr 1fr 1fr 1fr", borderBottom: index < 5 ? `1px solid ${colors.border}` : "none" }}>
                {Array.from({ length: 7 }).map((__, cellIndex) => (
                  <div key={cellIndex} className="rounded-full" style={{ width: cellIndex === 0 ? "78%" : cellIndex === 4 ? "74px" : "62%", height: "12px", background: colors.hoverBg }} />
                ))}
              </div>
            ))
          ) : paginated.map((t, i) => {
            const st = statusConfig[t.status];
            const isLast = i === paginated.length - 1;
            return (
              <div key={t.id} className="grid items-center px-5 py-3.5 transition-all cursor-pointer"
                style={{ gridTemplateColumns: "2fr 1.4fr 1fr 1fr 1fr 1fr 1fr", borderBottom: isLast ? "none" : `1px solid ${colors.border}` }}
                onMouseEnter={e => (e.currentTarget.style.background = colors.hoverBg)}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
              >
                <p style={{ fontSize: "13px", color: colors.textPrimary, fontFamily: "'Inter',sans-serif", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", paddingRight: "12px" }}>{t.descricao}</p>
                <p style={{ fontSize: "12px", color: colors.textSecondary, fontFamily: "'Inter',sans-serif", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.empresa}</p>
                <span className="rounded-full px-2.5 py-1 w-fit" style={{ fontSize: "11px", color: t.tipo === "receita" ? "#10B981" : "#EF4444", background: t.tipo === "receita" ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)", fontFamily: "'Inter',sans-serif", fontWeight: 500 }}>
                  {t.tipo === "receita" ? "Receita" : "Despesa"}
                </span>
                <span style={{ fontSize: "12px", color: colors.textSecondary, fontFamily: "'Inter',sans-serif" }}>{t.categoria}</span>
                <span className="flex items-center gap-1 rounded-full px-2.5 py-1 w-fit" style={{ fontSize: "11px", color: st.color, background: st.bg, fontFamily: "'Inter',sans-serif", fontWeight: 500 }}>
                  <st.icon size={10} /> {st.label}
                </span>
                <span style={{ fontSize: "13px", color: t.tipo === "receita" ? "#10B981" : "#EF4444", fontFamily: "'Inter',sans-serif", fontWeight: 600 }}>
                  {t.tipo === "receita" ? "+" : "-"}{fmt(t.valor)}
                </span>
                <span style={{ fontSize: "12px", color: colors.textMuted, fontFamily: "'Inter',sans-serif" }}>{t.data}</span>
              </div>
            );
          })}
          {!loading && paginated.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <Wallet size={28} style={{ color: colors.textMuted }} />
              <p style={{ fontSize: "13px", color: colors.textMuted, fontFamily: "'Inter',sans-serif" }}>Nenhum lançamento encontrado</p>
            </div>
          )}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-5 py-4" style={{ borderTop: `1px solid ${colors.border}` }}>
              <span style={{ fontSize: "13px", color: colors.textMuted, fontFamily: "'Inter',sans-serif" }}>Página {page} de {totalPages}</span>
              <div className="flex items-center gap-1">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  className="rounded-lg p-1.5 disabled:opacity-30" style={{ color: colors.textSecondary, background: colors.surface, border: `1px solid ${colors.border}` }}>
                  <ChevronLeft size={15} />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                  <button key={n} onClick={() => setPage(n)} className="rounded-lg transition-all"
                    style={{ width: "32px", height: "32px", fontSize: "13px", fontFamily: "'Inter',sans-serif", background: n === page ? "linear-gradient(135deg, #6366F1, #4338CA)" : colors.surface, color: n === page ? "#fff" : colors.textSecondary, border: `1px solid ${n === page ? "#6366F1" : colors.border}` }}
                  >{n}</button>
                ))}
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  className="rounded-lg p-1.5 disabled:opacity-30" style={{ color: colors.textSecondary, background: colors.surface, border: `1px solid ${colors.border}` }}>
                  <ChevronRight size={15} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
