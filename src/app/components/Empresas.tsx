import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import {
  Building2, Search, Plus, Filter, MoreHorizontal,
  ArrowUpRight, ArrowDownRight, TrendingUp, Users,
  DollarSign, FileText, ChevronDown, X, Eye,
  Pencil, Trash2, MapPin, Phone, Mail, Globe,
  CheckCircle2, Clock, XCircle, ChevronLeft, ChevronRight
} from "lucide-react";
import { useTheme } from "./ThemeContext";
import { NovaEmpresaForm, NovaEmpresaModal } from "./NovaEmpresaModal";
import { fetchCompanies, fetchCompanyMetrics, refreshCompanyMetrics, setPage, setPlano, setSearch, setSegmento, setStatus } from "../store/companiesSlice";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { CompanyView, formatCurrency, mapCompany } from "./companyView";
import { CompanySseEvent, companiesApi } from "../services/companiesApi";

const fallbackCompanies: CompanyView[] = [];

const segmentos = ["Todos", "Tecnologia", "Consultoria", "Indústria", "Finanças", "Varejo", "Marketing", "Saúde", "Logística"];
const planos = ["Todos", "Enterprise", "Pro", "Basic"];
const statusOpts = ["Todos", "ativo", "pendente", "inativo"];

const statusConfig = {
  ativo: { label: "Ativo", color: "#10B981", bg: "rgba(16,185,129,0.12)", icon: CheckCircle2 },
  pendente: { label: "Pendente", color: "#F59E0B", bg: "rgba(245,158,11,0.12)", icon: Clock },
  inativo: { label: "Inativo", color: "#EF4444", bg: "rgba(239,68,68,0.12)", icon: XCircle },
};

const planConfig = {
  Enterprise: { color: "#3B82F6", bg: "rgba(59,130,246,0.12)" },
  Pro: { color: "#14B8A6", bg: "rgba(20,184,166,0.12)" },
  Basic: { color: "#94A3B8", bg: "rgba(148,163,184,0.12)" },
};

function DetailModal({ company, onClose, onDetail, onEdit }: { company: CompanyView; onClose: () => void; onDetail: () => void; onEdit: () => void }) {
  const { colors, theme } = useTheme();
  const st = statusConfig[company.status as keyof typeof statusConfig];
  const pl = planConfig[company.plan as keyof typeof planConfig] ?? { color: "#94A3B8", bg: "rgba(148,163,184,0.12)" };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(6px)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-[580px] rounded-2xl overflow-hidden"
        style={{ background: colors.card, border: `1px solid ${colors.borderStrong}`, boxShadow: "0 32px 80px rgba(0,0,0,0.35)" }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-6" style={{ borderBottom: `1px solid ${colors.border}` }}>
          <div className="flex items-center gap-4">
            <div
              className="rounded-2xl flex items-center justify-center shrink-0"
              style={{ width: "52px", height: "52px", background: `hsl(${company.id * 37 + 200}, 60%, ${theme === "light" ? "42%" : "28%"})`, fontSize: "20px", color: "#fff", fontWeight: 700 }}
            >
              {company.name.charAt(0)}
            </div>
            <div>
              <h2 style={{ fontFamily: "'Playfair Display', serif", color: colors.textPrimary, fontSize: "20px", fontWeight: 600 }}>{company.name}</h2>
              <p style={{ fontSize: "13px", color: colors.textMuted, fontFamily: "'Inter', sans-serif", marginTop: "2px" }}>{company.cnpj}</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-xl p-2 transition-colors" style={{ color: colors.textMuted, background: colors.surface }}
            onMouseEnter={e => (e.currentTarget.style.background = colors.hoverBg)}
            onMouseLeave={e => (e.currentTarget.style.background = colors.surface)}
          >
            <X size={16} />
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-0" style={{ borderBottom: `1px solid ${colors.border}` }}>
          {[
            { label: "Receita", value: company.revenue, icon: DollarSign },
            { label: "Clientes", value: company.clients, icon: Users },
            { label: "Contratos", value: company.contracts, icon: FileText },
          ].map((s, i) => (
            <div
              key={s.label}
              className="flex flex-col items-center py-5 gap-1"
              style={{ borderRight: i < 2 ? `1px solid ${colors.border}` : "none" }}
            >
              <s.icon size={15} style={{ color: colors.textMuted }} />
              <p style={{ fontSize: "18px", fontFamily: "'Inter', sans-serif", color: colors.textPrimary, fontWeight: 600 }}>{s.value}</p>
              <p style={{ fontSize: "11px", color: colors.textMuted, fontFamily: "'Inter', sans-serif" }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Info */}
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "Segmento", value: company.segment },
              { label: "Cliente desde", value: company.since },
              { label: "Cidade", value: `${company.city}, ${company.state}`, icon: MapPin },
              { label: "Telefone", value: company.phone, icon: Phone },
              { label: "E-mail", value: company.email, icon: Mail },
              { label: "Site", value: company.site, icon: Globe },
            ].map((info) => (
              <div key={info.label}>
                <p style={{ fontSize: "11px", color: colors.textMuted, fontFamily: "'Inter', sans-serif", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "3px" }}>
                  {info.label}
                </p>
                <p style={{ fontSize: "13px", color: colors.textPrimary, fontFamily: "'Inter', sans-serif" }}>{info.value}</p>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-3 pt-2">
            <span
              className="flex items-center gap-1.5 rounded-full px-3 py-1"
              style={{ fontSize: "12px", color: st.color, background: st.bg, fontWeight: 500, fontFamily: "'Inter', sans-serif" }}
            >
              <st.icon size={12} /> {st.label}
            </span>
            <span
              className="rounded-full px-3 py-1"
              style={{ fontSize: "12px", color: pl.color, background: pl.bg, fontWeight: 500, fontFamily: "'Inter', sans-serif" }}
            >
              {company.plan}
            </span>
            <span
              className="flex items-center gap-1 rounded-full px-3 py-1"
              style={{ fontSize: "12px", color: company.growth >= 0 ? "#10B981" : "#EF4444", background: company.growth >= 0 ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)", fontFamily: "'Inter', sans-serif" }}
            >
              {company.growth >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
              {company.growth > 0 ? "+" : ""}{company.growth}% crescimento
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 px-6 py-4" style={{ borderTop: `1px solid ${colors.border}` }}>
          <button
            onClick={onEdit}
            className="flex items-center gap-2 rounded-xl px-4 py-2 transition-all"
            style={{ fontSize: "13px", color: colors.textSecondary, fontFamily: "'Inter', sans-serif", background: colors.surface, border: `1px solid ${colors.border}` }}
            onMouseEnter={e => (e.currentTarget.style.background = colors.hoverBg)}
            onMouseLeave={e => (e.currentTarget.style.background = colors.surface)}
          >
            <Pencil size={14} /> Editar
          </button>
          <button
            onClick={onDetail}
            className="flex items-center gap-2 rounded-xl px-4 py-2 transition-all"
            style={{ fontSize: "13px", color: "#fff", fontFamily: "'Inter', sans-serif", background: "linear-gradient(135deg, #3B82F6, #2563EB)" }}
          >
            Ver detalhes completos <ArrowUpRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

export function Empresas() {
  const { colors, theme } = useTheme();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const {
    items,
    metrics,
    totalPages,
    page,
    filters,
    tableStatus,
    metricsStatus,
    tableError,
    metricsError,
  } = useAppSelector((state) => state.companies);
  const { search, segmento, plano, status } = filters;
  const companies = useMemo(() => items.map(mapCompany), [items]);
  const metricsLoading = metricsStatus === "idle" || metricsStatus === "loading";
  const tableLoading = tableStatus === "idle" || tableStatus === "loading";
  const [selected, setSelected] = useState<number | null>(null);
  const [showNovaEmpresa, setShowNovaEmpresa] = useState(false);

  useEffect(() => {
    dispatch(fetchCompanyMetrics());
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchCompanies());
  }, [dispatch, page, search, segmento, plano, status]);

  const handleCreateCompany = async (form: NovaEmpresaForm, onProgress: (event: CompanySseEvent) => void) => {
    await companiesApi.createSse({
      name: form.name,
      cnpj: form.cnpj,
      subdomain: form.domain,
      description: form.description || null,
      email: form.email,
      phone: form.phone || form.whatsapp || null,
      whatsapp: form.whatsapp || null,
      contactName: form.contactName || null,
      contactRole: form.contactRole || null,
      status: "active",
      segment: form.segment,
      plan: form.plan,
      cep: form.cep || null,
      street: form.street || null,
      number: form.number || null,
      complement: form.complement || null,
      district: form.district || null,
      city: form.city || null,
      state: form.state || null,
      site: form.site || null,
      revenue: 0,
      clients_count: 0,
      contracts_count: 0,
      growth: 0,
      customer_since: new Date().toISOString().slice(0, 10),
      admin: {
        name: form.contactName,
        email: form.email,
        password: "123456",
      },
    }, onProgress);

    dispatch(refreshCompanyMetrics());

    if (page === 1) {
      dispatch(fetchCompanies());
    } else {
      dispatch(setPage(1));
    }
  };

  const paginated = companies;
  const loadedCompanies = companies.length > 0 ? companies : fallbackCompanies;
  const segmentOptions = useMemo(
    () => Array.from(new Set([...segmentos, ...loadedCompanies.map((company) => company.segment).filter(Boolean)])),
    [loadedCompanies],
  );
  const planOptions = useMemo(
    () => Array.from(new Set([...planos, ...loadedCompanies.map((company) => company.plan).filter(Boolean)])),
    [loadedCompanies],
  );

  const cardStyle = {
    background: colors.card,
    border: `1px solid ${colors.border}`,
    boxShadow: theme === "light" ? "0 2px 16px rgba(0,0,0,0.06)" : "0 4px 24px rgba(0,0,0,0.2)",
  };

  const kpis = [
    { label: "Total de Empresas", value: metrics?.total_companies ?? 0, sub: "cadastradas", positive: true, icon: Building2, color: "#3B82F6" },
    { label: "Empresas Ativas", value: metrics?.active_companies ?? 0, sub: "cadastradas", positive: true, icon: CheckCircle2, color: "#10B981" },
    { label: "Receita Total", value: formatCurrency(metrics?.total_revenue ?? 0), sub: "base filtrada", positive: true, icon: DollarSign, color: "#14B8A6" },
    { label: "Pendentes", value: metrics?.pending_companies ?? 0, sub: "aguardando ativação", positive: false, icon: Clock, color: "#F59E0B" },
  ];

  const detailCompany = selected !== null ? companies.find(c => c.id === selected) : null;

  return (
    <div className="p-6 space-y-6 overflow-y-auto h-full">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", color: colors.textPrimary, fontSize: "26px", fontWeight: 600 }}>
            Empresas
          </h1>
          <p style={{ fontFamily: "'Inter', sans-serif", color: colors.textMuted, fontSize: "14px", marginTop: "4px" }}>
            Gerencie todas as empresas cadastradas na plataforma
          </p>
        </div>
        <button
          onClick={() => setShowNovaEmpresa(true)}
          className="flex items-center gap-2 rounded-xl px-4 py-2.5 transition-all hover:opacity-90"
          style={{ background: "linear-gradient(135deg, #3B82F6, #2563EB)", color: "#fff", fontSize: "14px", fontFamily: "'Inter', sans-serif", fontWeight: 500, boxShadow: "0 4px 16px rgba(59,130,246,0.3)" }}
        >
          <Plus size={16} /> Nova Empresa
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {metricsLoading ? (
          Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="rounded-2xl p-5" style={cardStyle}>
              <div className="flex items-start justify-between mb-3">
                <div className="rounded-xl" style={{ width: "38px", height: "38px", background: colors.hoverBg }} />
                <div
                  className="rounded-full border-2 animate-spin"
                  style={{ width: "18px", height: "18px", borderColor: "rgba(59,130,246,0.18)", borderTopColor: "#3B82F6" }}
                />
              </div>
              <div className="rounded-full mb-3" style={{ width: "72px", height: "22px", background: colors.hoverBg }} />
              <div className="rounded-full mb-2" style={{ width: "130px", height: "13px", background: colors.hoverBg }} />
              <div className="rounded-full" style={{ width: "96px", height: "11px", background: colors.hoverBg }} />
            </div>
          ))
        ) : metricsError ? (
          <div className="col-span-2 xl:col-span-4 rounded-2xl p-5 flex items-center gap-3" style={cardStyle}>
            <XCircle size={18} style={{ color: "#EF4444" }} />
            <p style={{ fontSize: "13px", color: colors.textMuted, fontFamily: "'Inter', sans-serif" }}>{metricsError}</p>
          </div>
        ) : (
          kpis.map((k) => (
            <div key={k.label} className="rounded-2xl p-5 transition-all duration-200 hover:translate-y-[-2px]" style={cardStyle}>
                <div className="flex items-start justify-between mb-3">
                  <div className="rounded-xl flex items-center justify-center" style={{ width: "38px", height: "38px", background: `${k.color}18` }}>
                    <k.icon size={17} style={{ color: k.color }} />
                  </div>
                  <span
                    className="flex items-center gap-1 rounded-full px-2 py-0.5"
                    style={{ fontSize: "11px", color: k.positive ? "#10B981" : "#F59E0B", background: k.positive ? "rgba(16,185,129,0.1)" : "rgba(245,158,11,0.1)", fontFamily: "'Inter', sans-serif" }}
                  >
                    {k.positive ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}
                  </span>
                </div>
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "26px", color: colors.textPrimary, fontWeight: 700, lineHeight: 1 }}>{k.value}</p>
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "13px", color: colors.textSecondary, marginTop: "5px" }}>{k.label}</p>
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "11px", color: colors.textMuted, marginTop: "2px" }}>{k.sub}</p>
              </div>
            )))}
          </div>

          {/* Toolbar */}
          <div className="rounded-2xl p-4" style={cardStyle}>
            <div className="flex flex-wrap items-center gap-3">
              {/* Search */}
              <div
                className="flex items-center gap-2 rounded-xl px-3 py-2 flex-1 min-w-[200px]"
                style={{ background: colors.surface, border: `1px solid ${colors.border}` }}
              >
                <Search size={14} style={{ color: colors.textMuted }} />
                <input
                  value={search}
                  onChange={e => dispatch(setSearch(e.target.value))}
                  placeholder="Buscar empresa, CNPJ..."
                  className="bg-transparent outline-none flex-1"
                  style={{ fontSize: "13px", color: colors.textPrimary, fontFamily: "'Inter', sans-serif" }}
                />
                {search && (
                  <button onClick={() => dispatch(setSearch(""))} style={{ color: colors.textMuted }}>
                    <X size={13} />
                  </button>
                )}
              </div>

          {/* Filters */}
          {[
            { label: "Segmento", value: segmento, options: segmentOptions, onChange: (v: string) => dispatch(setSegmento(v)) },
            { label: "Plano", value: plano, options: planOptions, onChange: (v: string) => dispatch(setPlano(v)) },
            { label: "Status", value: status, options: statusOpts, onChange: (v: string) => dispatch(setStatus(v)) },
          ].map((f) => (
            <div key={f.label} className="relative">
              <select
                value={f.value}
                onChange={e => f.onChange(e.target.value)}
                className="appearance-none rounded-xl px-3 py-2 pr-8 outline-none cursor-pointer transition-all"
                style={{
                  background: colors.surface,
                  border: `1px solid ${f.value !== "Todos" ? "#3B82F6" : colors.border}`,
                  color: f.value !== "Todos" ? "#3B82F6" : colors.textSecondary,
                  fontSize: "13px",
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                {f.options.map(o => <option key={o} value={o}>{o === "Todos" ? f.label : o}</option>)}
              </select>
              <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: colors.textMuted }} />
            </div>
          ))}

          <div style={{ marginLeft: "auto", fontSize: "13px", color: colors.textMuted, fontFamily: "'Inter', sans-serif" }}>
            {metricsLoading ? "Carregando métricas..." : `${metrics?.total_companies ?? 0} empresa${metrics?.total_companies !== 1 ? "s" : ""}`}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl overflow-hidden" style={cardStyle}>
        {/* Table header */}
        <div
          className="grid items-center px-5 py-3"
          style={{
            gridTemplateColumns: "2fr 1.2fr 1fr 1fr 1fr 1fr 56px",
            borderBottom: `1px solid ${colors.border}`,
            background: theme === "light" ? colors.surface : "rgba(255,255,255,0.02)",
          }}
        >
          {["Empresa", "Segmento", "Plano", "Status", "Receita", "Crescimento", ""].map((h) => (
            <span key={h} style={{ fontSize: "11px", color: colors.textMuted, fontFamily: "'Inter', sans-serif", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              {h}
            </span>
          ))}
        </div>

        {tableLoading ? (
          <>
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="grid items-center px-5 py-4 gap-4"
                style={{
                  gridTemplateColumns: "2fr 1.2fr 1fr 1fr 1fr 1fr 56px",
                  borderBottom: index < 5 ? `1px solid ${colors.border}` : "none",
                }}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="rounded-xl shrink-0" style={{ width: "36px", height: "36px", background: colors.hoverBg }} />
                  <div className="min-w-0 flex-1">
                    <div className="rounded-full mb-2" style={{ width: "70%", height: "13px", background: colors.hoverBg }} />
                    <div className="rounded-full" style={{ width: "48%", height: "10px", background: colors.hoverBg }} />
                  </div>
                </div>
                {Array.from({ length: 5 }).map((__, cellIndex) => (
                  <div key={cellIndex} className="rounded-full" style={{ width: cellIndex === 1 || cellIndex === 2 ? "74px" : "58%", height: "12px", background: colors.hoverBg }} />
                ))}
                <div
                  className="rounded-full border-2 animate-spin"
                  style={{ width: "18px", height: "18px", borderColor: "rgba(59,130,246,0.18)", borderTopColor: "#3B82F6" }}
                />
              </div>
            ))}
          </>
        ) : tableError ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <XCircle size={32} style={{ color: "#EF4444" }} />
            <p style={{ fontSize: "14px", color: colors.textMuted, fontFamily: "'Inter', sans-serif", maxWidth: "520px", textAlign: "center" }}>{tableError}</p>
          </div>
        ) : paginated.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Building2 size={32} style={{ color: colors.textMuted }} />
            <p style={{ fontSize: "14px", color: colors.textMuted, fontFamily: "'Inter', sans-serif" }}>Nenhuma empresa encontrada</p>
          </div>
        ) : (
          paginated.map((company, i) => {
            const st = statusConfig[company.status as keyof typeof statusConfig];
            const pl = planConfig[company.plan as keyof typeof planConfig] ?? { color: "#94A3B8", bg: "rgba(148,163,184,0.12)" };
            const isLast = i === paginated.length - 1;
            return (
              <div
                key={company.id}
                className="grid items-center px-5 py-4 transition-all cursor-pointer group"
                style={{
                  gridTemplateColumns: "2fr 1.2fr 1fr 1fr 1fr 1fr 56px",
                  borderBottom: isLast ? "none" : `1px solid ${colors.border}`,
                }}
                onMouseEnter={e => (e.currentTarget.style.background = colors.hoverBg)}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                onClick={() => navigate(`/empresas/${company.id}`)}
              >
                {/* Name */}
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="rounded-xl flex items-center justify-center shrink-0"
                    style={{ width: "36px", height: "36px", background: `hsl(${company.id * 37 + 200}, 55%, ${theme === "light" ? "44%" : "28%"})`, fontSize: "14px", color: "#fff", fontWeight: 600 }}
                  >
                    {company.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p style={{ fontSize: "14px", color: colors.textPrimary, fontFamily: "'Inter', sans-serif", fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {company.name}
                    </p>
                    <p style={{ fontSize: "11px", color: colors.textMuted, fontFamily: "'Inter', sans-serif" }}>{company.cnpj}</p>
                  </div>
                </div>

                {/* Segment */}
                <span style={{ fontSize: "13px", color: colors.textSecondary, fontFamily: "'Inter', sans-serif" }}>{company.segment}</span>

                {/* Plan */}
                <span
                  className="rounded-full px-2.5 py-1 inline-flex w-fit"
                  style={{ fontSize: "12px", color: pl.color, background: pl.bg, fontFamily: "'Inter', sans-serif", fontWeight: 500 }}
                >
                  {company.plan}
                </span>

                {/* Status */}
                <span
                  className="flex items-center gap-1.5 rounded-full px-2.5 py-1 w-fit"
                  style={{ fontSize: "12px", color: st.color, background: st.bg, fontFamily: "'Inter', sans-serif", fontWeight: 500 }}
                >
                  <st.icon size={11} /> {st.label}
                </span>

                {/* Revenue */}
                <span style={{ fontSize: "13px", color: colors.textPrimary, fontFamily: "'Inter', sans-serif", fontWeight: 500 }}>{company.revenue}</span>

                {/* Growth */}
                <span
                  className="flex items-center gap-1"
                  style={{ fontSize: "13px", color: company.growth >= 0 ? "#10B981" : "#EF4444", fontFamily: "'Inter', sans-serif" }}
                >
                  {company.growth >= 0 ? <TrendingUp size={13} /> : <ArrowDownRight size={13} />}
                  {company.growth > 0 ? "+" : ""}{company.growth}%
                </span>

                {/* Actions */}
                <div className="flex items-center justify-end">
                  <button
                    className="rounded-lg p-1.5 transition-all opacity-0 group-hover:opacity-100"
                    style={{ color: colors.textMuted, background: colors.surface }}
                    onClick={e => { e.stopPropagation(); setSelected(company.id); }}
                    onMouseEnter={e => (e.currentTarget.style.color = "#3B82F6")}
                    onMouseLeave={e => (e.currentTarget.style.color = colors.textMuted)}
                  >
                    <Eye size={14} />
                  </button>
                </div>
              </div>
            );
          })
        )}

        {/* Pagination */}
        {!tableLoading && totalPages > 1 && (
          <div
            className="flex items-center justify-between px-5 py-4"
            style={{ borderTop: `1px solid ${colors.border}` }}
          >
            <span style={{ fontSize: "13px", color: colors.textMuted, fontFamily: "'Inter', sans-serif" }}>
              Página {page} de {totalPages} — {metrics?.total_companies ?? 0} resultados
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => dispatch(setPage(Math.max(1, page - 1)))}
                disabled={page === 1}
                className="rounded-lg p-1.5 transition-all disabled:opacity-30"
                style={{ color: colors.textSecondary, background: colors.surface, border: `1px solid ${colors.border}` }}
              >
                <ChevronLeft size={15} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                <button
                  key={n}
                  onClick={() => dispatch(setPage(n))}
                  className="rounded-lg transition-all"
                  style={{
                    width: "32px", height: "32px", fontSize: "13px",
                    fontFamily: "'Inter', sans-serif",
                    background: n === page ? "#3B82F6" : colors.surface,
                    color: n === page ? "#fff" : colors.textSecondary,
                    border: `1px solid ${n === page ? "#3B82F6" : colors.border}`,
                    fontWeight: n === page ? 600 : 400,
                  }}
                >
                  {n}
                </button>
              ))}
              <button
                onClick={() => dispatch(setPage(Math.min(totalPages, page + 1)))}
                disabled={page === totalPages}
                className="rounded-lg p-1.5 transition-all disabled:opacity-30"
                style={{ color: colors.textSecondary, background: colors.surface, border: `1px solid ${colors.border}` }}
              >
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {detailCompany && (
        <DetailModal
          company={detailCompany}
          onClose={() => setSelected(null)}
          onDetail={() => {
            setSelected(null);
            navigate(`/empresas/${detailCompany.id}`);
          }}
          onEdit={() => {
            setSelected(null);
            navigate(`/empresas/${detailCompany.id}/editar`);
          }}
        />
      )}

      {showNovaEmpresa && (
        <NovaEmpresaModal
          onClose={() => setShowNovaEmpresa(false)}
          onSave={handleCreateCompany}
        />
      )}
    </div>
  );
}
