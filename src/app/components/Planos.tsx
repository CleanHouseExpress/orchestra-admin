import { useState } from "react";
import {
  CreditCard, Plus, Pencil, Trash2, X, CheckCircle2,
  Search, ChevronDown, AlertCircle, CheckCheck, Zap, Star,
  Rocket, Crown, Users, Building2, ArrowUpRight, ArrowDownRight,
  ToggleLeft, DollarSign, Package, Eye, Copy, MoreHorizontal
} from "lucide-react";
import { useTheme } from "./ThemeContext";

// ── Types ──────────────────────────────────────────────────────────────
type BillingCycle = "mensal" | "anual" | "customizado";
type PlanStatus   = "ativo" | "inativo" | "rascunho";

interface PlanFeature {
  label: string;
  included: boolean;
  limit?: string;
}

interface Plan {
  id: number;
  name: string;
  description: string;
  price: number;
  annualPrice?: number;
  billing: BillingCycle;
  status: PlanStatus;
  color: string;
  icon: string;
  highlight: boolean;
  badge?: string;
  companies: number;
  users: number;
  features: PlanFeature[];
  limits: {
    usuarios: string;
    contratos: string;
    armazenamento: string;
    api: boolean;
    suporte: string;
  };
  createdAt: string;
  revenue: string;
}

// ── Initial data ────────────────────────────────────────────────────────
const initialPlans: Plan[] = [
  {
    id: 1, name: "Basic", description: "Ideal para pequenas empresas que estão começando sua jornada digital.",
    price: 299, annualPrice: 249, billing: "mensal", status: "ativo",
    color: "#94A3B8", icon: "zap", highlight: false,
    companies: 48, users: 312, createdAt: "Jan 2023", revenue: "R$ 14.352",
    limits: { usuarios: "20", contratos: "5", armazenamento: "5 GB", api: false, suporte: "E-mail" },
    features: [
      { label: "Dashboard básico",         included: true  },
      { label: "Gestão de contratos",       included: true,  limit: "até 5"    },
      { label: "Usuários",                  included: true,  limit: "até 20"   },
      { label: "Relatórios básicos",        included: true  },
      { label: "Suporte por e-mail",        included: true  },
      { label: "Integrações via API",       included: false },
      { label: "Dashboard personalizado",   included: false },
      { label: "Gerente dedicado",          included: false },
      { label: "SLA garantido",             included: false },
    ],
  },
  {
    id: 2, name: "Pro", description: "Para empresas em crescimento que precisam de mais controle e automação.",
    price: 799, annualPrice: 649, billing: "mensal", status: "ativo",
    color: "#14B8A6", icon: "star", highlight: true, badge: "Mais popular",
    companies: 87, users: 1240, createdAt: "Jan 2023", revenue: "R$ 69.513",
    limits: { usuarios: "100", contratos: "Ilimitados", armazenamento: "50 GB", api: true, suporte: "Prioritário" },
    features: [
      { label: "Dashboard avançado",        included: true  },
      { label: "Gestão de contratos",       included: true,  limit: "ilimitados" },
      { label: "Usuários",                  included: true,  limit: "até 100"   },
      { label: "Relatórios avançados",      included: true  },
      { label: "Suporte prioritário",       included: true  },
      { label: "Integrações via API",       included: true  },
      { label: "Dashboard personalizado",   included: false },
      { label: "Gerente dedicado",          included: false },
      { label: "SLA garantido",             included: false },
    ],
  },
  {
    id: 3, name: "Enterprise", description: "Solução completa para grandes operações corporativas com suporte premium.",
    price: 0, billing: "customizado", status: "ativo",
    color: "#3B82F6", icon: "rocket", highlight: false, badge: "Sob consulta",
    companies: 23, users: 892, createdAt: "Mar 2023", revenue: "R$ 86.700",
    limits: { usuarios: "Ilimitados", contratos: "Ilimitados", armazenamento: "500 GB", api: true, suporte: "Gerente 24/7" },
    features: [
      { label: "Dashboard personalizado",   included: true  },
      { label: "Gestão de contratos",       included: true,  limit: "ilimitados" },
      { label: "Usuários",                  included: true,  limit: "ilimitados" },
      { label: "Relatórios personalizados", included: true  },
      { label: "Suporte 24/7 dedicado",     included: true  },
      { label: "Integrações via API",       included: true  },
      { label: "Dashboard personalizado",   included: true  },
      { label: "Gerente dedicado",          included: true  },
      { label: "SLA garantido",             included: true  },
    ],
  },
  {
    id: 4, name: "Starter", description: "Plano de entrada para testar a plataforma sem compromisso.",
    price: 99, billing: "mensal", status: "rascunho",
    color: "#F59E0B", icon: "zap", highlight: false,
    companies: 0, users: 0, createdAt: "Jun 2026", revenue: "R$ 0",
    limits: { usuarios: "5", contratos: "2", armazenamento: "1 GB", api: false, suporte: "FAQ" },
    features: [
      { label: "Dashboard básico",          included: true  },
      { label: "Gestão de contratos",       included: true,  limit: "até 2" },
      { label: "Usuários",                  included: true,  limit: "até 5" },
      { label: "Relatórios básicos",        included: false },
      { label: "Suporte",                   included: true,  limit: "FAQ apenas" },
      { label: "Integrações via API",       included: false },
      { label: "Dashboard personalizado",   included: false },
      { label: "Gerente dedicado",          included: false },
      { label: "SLA garantido",             included: false },
    ],
  },
];

// ── Configs ────────────────────────────────────────────────────────────
const statusConfig: Record<PlanStatus, { label: string; color: string; bg: string }> = {
  ativo:    { label: "Ativo",     color: "#10B981", bg: "rgba(16,185,129,0.12)"  },
  inativo:  { label: "Inativo",   color: "#EF4444", bg: "rgba(239,68,68,0.12)"   },
  rascunho: { label: "Rascunho",  color: "#F59E0B", bg: "rgba(245,158,11,0.12)"  },
};

const iconMap: Record<string, any> = { zap: Zap, star: Star, rocket: Rocket, crown: Crown };
const iconOptions = [
  { value: "zap",    label: "Raio",    Icon: Zap    },
  { value: "star",   label: "Estrela", Icon: Star   },
  { value: "rocket", label: "Foguete", Icon: Rocket },
  { value: "crown",  label: "Coroa",   Icon: Crown  },
];

const colorOptions = ["#94A3B8","#3B82F6","#14B8A6","#8B5CF6","#F59E0B","#10B981","#EF4444","#EC4899","#F97316","#06B6D4"];
const billingOptions: { value: BillingCycle; label: string }[] = [
  { value: "mensal",      label: "Mensal"      },
  { value: "anual",       label: "Anual"       },
  { value: "customizado", label: "Customizado" },
];

// ── Helpers ────────────────────────────────────────────────────────────
function priceDisplay(plan: Plan) {
  if (plan.billing === "customizado") return "Sob consulta";
  return `R$ ${plan.price.toLocaleString("pt-BR")}`;
}

// ── Feature editor ─────────────────────────────────────────────────────
function FeatureEditor({ features, onChange }: { features: PlanFeature[]; onChange: (f: PlanFeature[]) => void }) {
  const { colors } = useTheme();
  const toggle = (i: number) => { const f = [...features]; f[i] = { ...f[i], included: !f[i].included }; onChange(f); };
  const setLimit = (i: number, v: string) => { const f = [...features]; f[i] = { ...f[i], limit: v }; onChange(f); };

  return (
    <div className="space-y-2">
      {features.map((feat, i) => (
        <div key={feat.label} className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all"
          style={{ background: feat.included ? `rgba(16,185,129,0.06)` : colors.surface, border: `1px solid ${feat.included ? "rgba(16,185,129,0.2)" : colors.border}` }}
        >
          <button onClick={() => toggle(i)} className="rounded-full transition-all duration-200 shrink-0"
            style={{ width: "38px", height: "22px", background: feat.included ? "#10B981" : colors.border, position: "relative" }}
          >
            <div className="absolute top-1 rounded-full bg-white transition-all duration-200"
              style={{ width: "14px", height: "14px", left: feat.included ? "20px" : "4px" }}
            />
          </button>
          <span style={{ fontSize: "13px", color: feat.included ? colors.textPrimary : colors.textMuted, fontFamily: "'Inter',sans-serif", flex: 1 }}>
            {feat.label}
          </span>
          {feat.included && (
            <input value={feat.limit ?? ""} onChange={e => setLimit(i, e.target.value)}
              placeholder="limite..."
              className="bg-transparent outline-none rounded-lg px-2 py-1"
              style={{ fontSize: "11px", color: "#10B981", fontFamily: "'Inter',sans-serif", border: "1px solid rgba(16,185,129,0.3)", width: "90px" }}
            />
          )}
        </div>
      ))}
    </div>
  );
}

// ── Plan form modal ────────────────────────────────────────────────────
function PlanFormModal({ plan, onClose, onSave }: { plan?: Plan | null; onClose: () => void; onSave: (data: any) => void }) {
  const { colors, theme } = useTheme();
  const isEdit = !!plan;
  const defaultFeatures: PlanFeature[] = [
    { label: "Dashboard",            included: true  },
    { label: "Gestão de contratos",  included: true  },
    { label: "Usuários",             included: true  },
    { label: "Relatórios",           included: false },
    { label: "Suporte",              included: true  },
    { label: "Integrações via API",  included: false },
    { label: "Dashboard personalizado", included: false },
    { label: "Gerente dedicado",     included: false },
    { label: "SLA garantido",        included: false },
  ];

  const [form, setForm] = useState({
    name:        plan?.name        ?? "",
    description: plan?.description ?? "",
    price:       plan?.price       ?? 0,
    annualPrice: plan?.annualPrice ?? 0,
    billing:     plan?.billing     ?? "mensal" as BillingCycle,
    status:      plan?.status      ?? "rascunho" as PlanStatus,
    color:       plan?.color       ?? "#3B82F6",
    icon:        plan?.icon        ?? "zap",
    highlight:   plan?.highlight   ?? false,
    badge:       plan?.badge       ?? "",
    limits: plan?.limits ?? { usuarios: "", contratos: "", armazenamento: "", api: false, suporte: "" },
    features:    plan?.features    ?? defaultFeatures,
  });

  const [tab, setTab]       = useState<"geral" | "recursos" | "limites">("geral");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved]   = useState(false);

  const set = (k: string) => (v: any) => setForm(f => ({ ...f, [k]: v }));
  const setLimit = (k: string) => (v: any) => setForm(f => ({ ...f, limits: { ...f.limits, [k]: v } }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name) e.name = "Nome obrigatório";
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSave = () => {
    if (!validate()) return;
    setSaving(true);
    setTimeout(() => { setSaving(false); setSaved(true); setTimeout(() => onSave(form), 900); }, 1300);
  };

  const PlanIcon = iconMap[form.icon] ?? Zap;

  const inputStyle = (focused = false) => ({
    background: colors.inputBg,
    border: `1px solid ${focused ? "rgba(59,130,246,0.55)" : colors.border}`,
    borderRadius: "12px",
    height: "44px",
    padding: "0 14px",
    fontSize: "14px",
    color: colors.textPrimary,
    fontFamily: "'Inter',sans-serif",
    width: "100%",
    outline: "none",
  });

  const tabStyle = (t: string) => ({
    fontSize: "13px",
    fontFamily: "'Inter',sans-serif",
    fontWeight: tab === t ? 600 : 400,
    color: tab === t ? "#3B82F6" : colors.textMuted,
    borderBottom: `2px solid ${tab === t ? "#3B82F6" : "transparent"}`,
    padding: "10px 16px",
    background: "transparent",
    cursor: "pointer",
    transition: "all 0.15s",
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(8px)" }}
      onClick={onClose}
    >
      <div className="w-full max-w-[620px] rounded-2xl overflow-hidden flex flex-col"
        style={{ background: colors.card, border: `1px solid ${colors.borderStrong}`, boxShadow: "0 32px 80px rgba(0,0,0,0.4)", maxHeight: "92vh" }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 shrink-0" style={{ borderBottom: `1px solid ${colors.border}` }}>
          <div className="flex items-center gap-3">
            <div className="rounded-xl flex items-center justify-center" style={{ width: "36px", height: "36px", background: form.color + "25" }}>
              <PlanIcon size={18} style={{ color: form.color }} />
            </div>
            <h2 style={{ fontFamily: "'Playfair Display',serif", color: colors.textPrimary, fontSize: "18px", fontWeight: 600 }}>
              {isEdit ? `Editar — ${plan.name}` : "Novo Plano"}
            </h2>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5" style={{ color: colors.textMuted }}
            onMouseEnter={e => (e.currentTarget.style.color = colors.textPrimary)}
            onMouseLeave={e => (e.currentTarget.style.color = colors.textMuted)}
          >
            <X size={16} />
          </button>
        </div>

        {saved ? (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <div className="rounded-full flex items-center justify-center" style={{ width: "60px", height: "60px", background: "rgba(16,185,129,0.12)" }}>
              <CheckCircle2 size={28} style={{ color: "#10B981" }} />
            </div>
            <p style={{ fontFamily: "'Playfair Display',serif", color: colors.textPrimary, fontSize: "18px", fontWeight: 600 }}>
              {isEdit ? "Plano atualizado!" : "Plano criado!"}
            </p>
          </div>
        ) : (
          <>
            {/* Tabs */}
            <div className="flex shrink-0" style={{ borderBottom: `1px solid ${colors.border}` }}>
              {[["geral","Geral"],["recursos","Recursos"],["limites","Limites"]].map(([id, label]) => (
                <button key={id} onClick={() => setTab(id as any)} style={tabStyle(id)}>{label}</button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5">
              {/* ── Tab Geral ── */}
              {tab === "geral" && (
                <div className="space-y-4">
                  {/* Preview card */}
                  <div className="rounded-2xl p-4 flex items-center gap-4"
                    style={{ background: form.color + "10", border: `1px solid ${form.color}30` }}
                  >
                    <div className="rounded-xl flex items-center justify-center shrink-0" style={{ width: "46px", height: "46px", background: form.color + "20" }}>
                      <PlanIcon size={22} style={{ color: form.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p style={{ fontFamily: "'Playfair Display',serif", color: colors.textPrimary, fontSize: "17px", fontWeight: 600 }}>
                          {form.name || "Nome do plano"}
                        </p>
                        {form.badge && (
                          <span className="rounded-full px-2 py-0.5" style={{ fontSize: "10px", color: form.color, background: form.color + "25", fontFamily: "'Inter',sans-serif", fontWeight: 600 }}>
                            {form.badge}
                          </span>
                        )}
                        {form.highlight && <Star size={12} style={{ color: "#F59E0B", fill: "#F59E0B" }} />}
                      </div>
                      <p style={{ fontSize: "12px", color: colors.textMuted, fontFamily: "'Inter',sans-serif", marginTop: "2px" }}>
                        {form.billing === "customizado" ? "Sob consulta" : `R$ ${form.price.toLocaleString("pt-BR")}/mês`}
                      </p>
                    </div>
                    <span className="rounded-full px-2.5 py-1 shrink-0" style={{ fontSize: "11px", color: statusConfig[form.status].color, background: statusConfig[form.status].bg, fontFamily: "'Inter',sans-serif", fontWeight: 500 }}>
                      {statusConfig[form.status].label}
                    </span>
                  </div>

                  <div>
                    <label style={{ fontSize: "13px", color: colors.textSecondary, display: "block", marginBottom: "7px", fontFamily: "'Inter',sans-serif", fontWeight: 500 }}>
                      Nome <span style={{ color: "#EF4444" }}>*</span>
                    </label>
                    <input value={form.name} onChange={e => set("name")(e.target.value)} placeholder="Ex: Pro, Enterprise..." style={inputStyle()} />
                    {errors.name && <p style={{ fontSize: "11px", color: "#EF4444", marginTop: "4px", fontFamily: "'Inter',sans-serif" }}>{errors.name}</p>}
                  </div>

                  <div>
                    <label style={{ fontSize: "13px", color: colors.textSecondary, display: "block", marginBottom: "7px", fontFamily: "'Inter',sans-serif", fontWeight: 500 }}>Descrição</label>
                    <textarea value={form.description} onChange={e => set("description")(e.target.value)}
                      placeholder="Descreva este plano brevemente..." rows={3}
                      className="w-full rounded-xl px-4 py-3 outline-none resize-none"
                      style={{ background: colors.inputBg, border: `1px solid ${colors.border}`, color: colors.textPrimary, fontSize: "14px", fontFamily: "'Inter',sans-serif", lineHeight: 1.6 }}
                      onFocus={e => (e.target.style.border = "1px solid rgba(59,130,246,0.55)")}
                      onBlur={e => (e.target.style.border = `1px solid ${colors.border}`)}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Billing */}
                    <div>
                      <label style={{ fontSize: "13px", color: colors.textSecondary, display: "block", marginBottom: "7px", fontFamily: "'Inter',sans-serif", fontWeight: 500 }}>Cobrança</label>
                      <div className="relative">
                        <select value={form.billing} onChange={e => set("billing")(e.target.value as BillingCycle)}
                          className="appearance-none w-full rounded-xl px-3.5 outline-none cursor-pointer"
                          style={{ ...inputStyle(), paddingRight: "32px" }}
                        >
                          {billingOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                        <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: colors.textMuted }} />
                      </div>
                    </div>

                    {/* Status */}
                    <div>
                      <label style={{ fontSize: "13px", color: colors.textSecondary, display: "block", marginBottom: "7px", fontFamily: "'Inter',sans-serif", fontWeight: 500 }}>Status</label>
                      <div className="relative">
                        <select value={form.status} onChange={e => set("status")(e.target.value as PlanStatus)}
                          className="appearance-none w-full rounded-xl px-3.5 outline-none cursor-pointer"
                          style={{ ...inputStyle(), paddingRight: "32px" }}
                        >
                          {(["ativo","inativo","rascunho"] as PlanStatus[]).map(s => <option key={s} value={s}>{statusConfig[s].label}</option>)}
                        </select>
                        <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: colors.textMuted }} />
                      </div>
                    </div>
                  </div>

                  {form.billing !== "customizado" && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label style={{ fontSize: "13px", color: colors.textSecondary, display: "block", marginBottom: "7px", fontFamily: "'Inter',sans-serif", fontWeight: 500 }}>Preço mensal (R$)</label>
                        <input type="number" value={form.price} onChange={e => set("price")(Number(e.target.value))} placeholder="299" style={inputStyle()} />
                      </div>
                      <div>
                        <label style={{ fontSize: "13px", color: colors.textSecondary, display: "block", marginBottom: "7px", fontFamily: "'Inter',sans-serif", fontWeight: 500 }}>Preço anual (R$)</label>
                        <input type="number" value={form.annualPrice} onChange={e => set("annualPrice")(Number(e.target.value))} placeholder="249" style={inputStyle()} />
                      </div>
                    </div>
                  )}

                  <div>
                    <label style={{ fontSize: "13px", color: colors.textSecondary, display: "block", marginBottom: "7px", fontFamily: "'Inter',sans-serif", fontWeight: 500 }}>Badge</label>
                    <input value={form.badge ?? ""} onChange={e => set("badge")(e.target.value)} placeholder='Ex: "Mais popular", "Recomendado"...' style={inputStyle()} />
                  </div>

                  {/* Color */}
                  <div>
                    <label style={{ fontSize: "13px", color: colors.textSecondary, display: "block", marginBottom: "10px", fontFamily: "'Inter',sans-serif", fontWeight: 500 }}>Cor de destaque</label>
                    <div className="flex flex-wrap gap-2">
                      {colorOptions.map(c => (
                        <button key={c} onClick={() => set("color")(c)}
                          className="rounded-full transition-all hover:scale-110"
                          style={{ width: "26px", height: "26px", background: c, outline: form.color === c ? `3px solid ${c}` : "3px solid transparent", outlineOffset: "2px" }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Icon */}
                  <div>
                    <label style={{ fontSize: "13px", color: colors.textSecondary, display: "block", marginBottom: "10px", fontFamily: "'Inter',sans-serif", fontWeight: 500 }}>Ícone</label>
                    <div className="flex gap-2">
                      {iconOptions.map(({ value, label, Icon }) => (
                        <button key={value} onClick={() => set("icon")(value)}
                          className="flex items-center gap-2 rounded-xl px-3 py-2 transition-all"
                          style={{
                            background: form.icon === value ? form.color + "20" : colors.surface,
                            border: `1px solid ${form.icon === value ? form.color + "60" : colors.border}`,
                            fontSize: "12px", color: form.icon === value ? form.color : colors.textSecondary, fontFamily: "'Inter',sans-serif",
                          }}
                        >
                          <Icon size={14} /> {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Highlight */}
                  <div className="flex items-center justify-between p-3 rounded-xl" style={{ background: colors.surface, border: `1px solid ${colors.border}` }}>
                    <div>
                      <p style={{ fontSize: "13px", color: colors.textPrimary, fontFamily: "'Inter',sans-serif", fontWeight: 500 }}>Destacar na listagem pública</p>
                      <p style={{ fontSize: "11px", color: colors.textMuted, fontFamily: "'Inter',sans-serif" }}>Exibe este plano com destaque visual para novos clientes</p>
                    </div>
                    <button onClick={() => set("highlight")(!form.highlight)}
                      className="rounded-full transition-all duration-300 shrink-0"
                      style={{ width: "44px", height: "24px", background: form.highlight ? "#3B82F6" : "#64748B", position: "relative" }}
                    >
                      <div className="absolute top-1 rounded-full bg-white transition-all duration-300"
                        style={{ width: "16px", height: "16px", left: form.highlight ? "24px" : "4px" }}
                      />
                    </button>
                  </div>
                </div>
              )}

              {/* ── Tab Recursos ── */}
              {tab === "recursos" && (
                <div className="space-y-4">
                  <p style={{ fontSize: "13px", color: colors.textMuted, fontFamily: "'Inter',sans-serif" }}>
                    Ative os recursos incluídos neste plano. Você pode adicionar um limite (ex: "até 20") para cada recurso.
                  </p>
                  <FeatureEditor features={form.features} onChange={set("features")} />
                </div>
              )}

              {/* ── Tab Limites ── */}
              {tab === "limites" && (
                <div className="space-y-4">
                  <p style={{ fontSize: "13px", color: colors.textMuted, fontFamily: "'Inter',sans-serif" }}>
                    Defina os limites quantitativos deste plano.
                  </p>
                  {[
                    { key: "usuarios",       label: "Usuários",       placeholder: "Ex: 20, 100, Ilimitados" },
                    { key: "contratos",      label: "Contratos",      placeholder: "Ex: 5, Ilimitados"       },
                    { key: "armazenamento",  label: "Armazenamento",  placeholder: "Ex: 5 GB, 50 GB"         },
                    { key: "suporte",        label: "Tipo de suporte",placeholder: "Ex: E-mail, Prioritário" },
                  ].map(f => (
                    <div key={f.key}>
                      <label style={{ fontSize: "13px", color: colors.textSecondary, display: "block", marginBottom: "7px", fontFamily: "'Inter',sans-serif", fontWeight: 500 }}>{f.label}</label>
                      <input
                        value={(form.limits as any)[f.key] ?? ""}
                        onChange={e => setLimit(f.key)(e.target.value)}
                        placeholder={f.placeholder}
                        style={inputStyle()}
                      />
                    </div>
                  ))}
                  <div className="flex items-center justify-between p-4 rounded-xl" style={{ background: colors.surface, border: `1px solid ${colors.border}` }}>
                    <div>
                      <p style={{ fontSize: "13px", color: colors.textPrimary, fontFamily: "'Inter',sans-serif", fontWeight: 500 }}>Acesso à API</p>
                      <p style={{ fontSize: "11px", color: colors.textMuted, fontFamily: "'Inter',sans-serif" }}>Permite integrações via API REST</p>
                    </div>
                    <button onClick={() => setLimit("api")(!form.limits.api)}
                      className="rounded-full transition-all duration-300 shrink-0"
                      style={{ width: "44px", height: "24px", background: form.limits.api ? "#3B82F6" : "#64748B", position: "relative" }}
                    >
                      <div className="absolute top-1 rounded-full bg-white transition-all duration-300"
                        style={{ width: "16px", height: "16px", left: form.limits.api ? "24px" : "4px" }}
                      />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-6 py-4 shrink-0" style={{ borderTop: `1px solid ${colors.border}` }}>
              <div className="flex gap-1">
                {["geral","recursos","limites"].map((t, i) => (
                  <div key={t} className="rounded-full transition-all" style={{ width: tab === t ? "18px" : "6px", height: "6px", background: tab === t ? "#3B82F6" : colors.border }} />
                ))}
              </div>
              <div className="flex items-center gap-2">
                <button onClick={onClose} className="rounded-xl px-4 py-2 transition-all" style={{ fontSize: "13px", color: colors.textSecondary, background: colors.surface, border: `1px solid ${colors.border}`, fontFamily: "'Inter',sans-serif" }}
                  onMouseEnter={e => (e.currentTarget.style.background = colors.hoverBg)}
                  onMouseLeave={e => (e.currentTarget.style.background = colors.surface)}
                >
                  Cancelar
                </button>
                <button onClick={handleSave} disabled={saving}
                  className="flex items-center gap-2 rounded-xl px-5 py-2 transition-all hover:opacity-90 disabled:opacity-60"
                  style={{ background: "linear-gradient(135deg, #3B82F6, #2563EB)", color: "#fff", fontSize: "13px", fontFamily: "'Inter',sans-serif", fontWeight: 500, boxShadow: "0 4px 14px rgba(59,130,246,0.3)" }}
                >
                  {saving
                    ? <><span className="rounded-full border-2 animate-spin" style={{ width: "12px", height: "12px", borderColor: "rgba(255,255,255,0.3)", borderTopColor: "#fff" }} />Salvando...</>
                    : <><CheckCheck size={14} />{isEdit ? "Salvar alterações" : "Criar plano"}</>
                  }
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── Plan detail modal ──────────────────────────────────────────────────
function PlanDetailModal({ plan, onClose, onEdit }: { plan: Plan; onClose: () => void; onEdit: () => void }) {
  const { colors, theme } = useTheme();
  const st = statusConfig[plan.status];
  const PlanIcon = iconMap[plan.icon] ?? Zap;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(8px)" }}
      onClick={onClose}
    >
      <div className="w-full max-w-[560px] rounded-2xl overflow-hidden flex flex-col"
        style={{ background: colors.card, border: `1px solid ${colors.borderStrong}`, boxShadow: "0 32px 80px rgba(0,0,0,0.4)", maxHeight: "88vh" }}
        onClick={e => e.stopPropagation()}
      >
        {/* Plan hero */}
        <div className="px-6 pt-6 pb-5 shrink-0" style={{ background: plan.color + "0D", borderBottom: `1px solid ${colors.border}` }}>
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl flex items-center justify-center" style={{ width: "48px", height: "48px", background: plan.color + "20" }}>
                <PlanIcon size={22} style={{ color: plan.color }} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 style={{ fontFamily: "'Playfair Display',serif", color: colors.textPrimary, fontSize: "20px", fontWeight: 600 }}>{plan.name}</h2>
                  {plan.badge && <span className="rounded-full px-2.5 py-0.5" style={{ fontSize: "10px", color: plan.color, background: plan.color + "25", fontFamily: "'Inter',sans-serif", fontWeight: 600 }}>{plan.badge}</span>}
                  {plan.highlight && <Star size={13} style={{ color: "#F59E0B", fill: "#F59E0B" }} />}
                </div>
                <p style={{ fontSize: "13px", color: colors.textMuted, fontFamily: "'Inter',sans-serif", marginTop: "2px" }}>{plan.description}</p>
              </div>
            </div>
            <button onClick={onClose} className="rounded-lg p-1.5 shrink-0" style={{ color: colors.textMuted }}>
              <X size={15} />
            </button>
          </div>

          {/* Price + status */}
          <div className="flex items-center gap-4">
            <div>
              <p style={{ fontSize: "28px", color: colors.textPrimary, fontFamily: "'Inter',sans-serif", fontWeight: 800, lineHeight: 1 }}>
                {priceDisplay(plan)}
              </p>
              {plan.billing !== "customizado" && <p style={{ fontSize: "12px", color: colors.textMuted, fontFamily: "'Inter',sans-serif" }}>por mês</p>}
            </div>
            <div style={{ marginLeft: "auto" }}>
              <span className="rounded-full px-3 py-1.5" style={{ fontSize: "12px", color: st.color, background: st.bg, fontFamily: "'Inter',sans-serif", fontWeight: 500 }}>
                {st.label}
              </span>
            </div>
          </div>

          {/* Stats */}
          <div className="flex gap-6 mt-4">
            {[
              { icon: Building2, label: "Empresas", value: plan.companies },
              { icon: Users,     label: "Usuários",  value: plan.users    },
              { icon: DollarSign,label: "Receita",   value: plan.revenue  },
            ].map(s => (
              <div key={s.label} className="flex items-center gap-2">
                <s.icon size={13} style={{ color: colors.textMuted }} />
                <span style={{ fontSize: "13px", color: colors.textPrimary, fontFamily: "'Inter',sans-serif", fontWeight: 600 }}>{s.value}</span>
                <span style={{ fontSize: "11px", color: colors.textMuted, fontFamily: "'Inter',sans-serif" }}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* Limites */}
          <div>
            <p style={{ fontSize: "11px", color: colors.textMuted, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "10px", fontFamily: "'Inter',sans-serif" }}>Limites</p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Usuários",       value: plan.limits.usuarios      },
                { label: "Contratos",      value: plan.limits.contratos     },
                { label: "Armazenamento",  value: plan.limits.armazenamento },
                { label: "Suporte",        value: plan.limits.suporte       },
                { label: "API",            value: plan.limits.api ? "Incluso" : "—" },
              ].map(l => (
                <div key={l.label} className="rounded-xl p-3" style={{ background: colors.surface, border: `1px solid ${colors.border}` }}>
                  <p style={{ fontSize: "10px", color: colors.textMuted, fontFamily: "'Inter',sans-serif", textTransform: "uppercase", letterSpacing: "0.06em" }}>{l.label}</p>
                  <p style={{ fontSize: "14px", color: colors.textPrimary, fontFamily: "'Inter',sans-serif", fontWeight: 600, marginTop: "2px" }}>{l.value || "—"}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Features */}
          <div>
            <p style={{ fontSize: "11px", color: colors.textMuted, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "10px", fontFamily: "'Inter',sans-serif" }}>Recursos incluídos</p>
            <div className="space-y-2">
              {plan.features.map((f, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="rounded-full flex items-center justify-center shrink-0" style={{ width: "18px", height: "18px", background: f.included ? "rgba(16,185,129,0.15)" : "rgba(148,163,184,0.1)" }}>
                    {f.included
                      ? <CheckCircle2 size={11} style={{ color: "#10B981" }} />
                      : <X size={9} style={{ color: colors.textMuted }} />
                    }
                  </div>
                  <span style={{ fontSize: "13px", color: f.included ? colors.textPrimary : colors.textMuted, fontFamily: "'Inter',sans-serif" }}>{f.label}</span>
                  {f.included && f.limit && <span className="rounded-full px-2 py-0.5 ml-auto" style={{ fontSize: "10px", color: plan.color, background: plan.color + "15", fontFamily: "'Inter',sans-serif" }}>{f.limit}</span>}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between px-6 py-4 shrink-0" style={{ borderTop: `1px solid ${colors.border}` }}>
          <p style={{ fontSize: "12px", color: colors.textMuted, fontFamily: "'Inter',sans-serif" }}>Criado em {plan.createdAt}</p>
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="rounded-xl px-4 py-2 transition-all" style={{ fontSize: "13px", color: colors.textSecondary, background: colors.surface, border: `1px solid ${colors.border}`, fontFamily: "'Inter',sans-serif" }}>
              Fechar
            </button>
            <button onClick={onEdit} className="flex items-center gap-2 rounded-xl px-4 py-2 transition-all hover:opacity-90"
              style={{ background: "linear-gradient(135deg, #3B82F6, #2563EB)", color: "#fff", fontSize: "13px", fontFamily: "'Inter',sans-serif", fontWeight: 500 }}
            >
              <Pencil size={13} /> Editar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Delete modal ───────────────────────────────────────────────────────
function DeletePlanModal({ plan, onClose, onConfirm }: { plan: Plan; onClose: () => void; onConfirm: () => void }) {
  const { colors } = useTheme();
  const [deleting, setDeleting] = useState(false);
  const PlanIcon = iconMap[plan.icon] ?? Zap;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(8px)" }}
      onClick={onClose}
    >
      <div className="w-full max-w-[420px] rounded-2xl p-6"
        style={{ background: colors.card, border: `1px solid ${colors.borderStrong}`, boxShadow: "0 32px 80px rgba(0,0,0,0.4)" }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center gap-4 mb-5">
          <div className="rounded-2xl flex items-center justify-center shrink-0" style={{ width: "46px", height: "46px", background: "rgba(239,68,68,0.1)" }}>
            <Trash2 size={20} style={{ color: "#EF4444" }} />
          </div>
          <div>
            <h3 style={{ fontFamily: "'Playfair Display',serif", color: colors.textPrimary, fontSize: "17px", fontWeight: 600 }}>Remover plano</h3>
            <p style={{ fontSize: "12px", color: colors.textMuted, fontFamily: "'Inter',sans-serif" }}>Esta ação não pode ser desfeita.</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-4 rounded-xl mb-4" style={{ background: colors.surface, border: `1px solid ${colors.border}` }}>
          <div className="rounded-xl flex items-center justify-center shrink-0" style={{ width: "36px", height: "36px", background: plan.color + "20" }}>
            <PlanIcon size={16} style={{ color: plan.color }} />
          </div>
          <div>
            <p style={{ fontSize: "14px", color: colors.textPrimary, fontFamily: "'Inter',sans-serif", fontWeight: 500 }}>{plan.name}</p>
            <p style={{ fontSize: "12px", color: colors.textMuted, fontFamily: "'Inter',sans-serif" }}>{plan.companies} empresa{plan.companies !== 1 ? "s" : ""} · {plan.users} usuário{plan.users !== 1 ? "s" : ""}</p>
          </div>
        </div>

        {plan.companies > 0 && (
          <div className="flex items-start gap-2 p-3 rounded-xl mb-4" style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)" }}>
            <AlertCircle size={14} style={{ color: "#EF4444", marginTop: "1px" }} className="shrink-0" />
            <p style={{ fontSize: "12px", color: colors.textSecondary, fontFamily: "'Inter',sans-serif", lineHeight: 1.5 }}>
              Este plano possui <strong style={{ color: colors.textPrimary }}>{plan.companies} empresa{plan.companies !== 1 ? "s" : ""}</strong> ativas. Elas precisarão ser migradas antes da remoção.
            </p>
          </div>
        )}

        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 rounded-xl py-2.5 transition-all" style={{ fontSize: "13px", color: colors.textSecondary, background: colors.surface, border: `1px solid ${colors.border}`, fontFamily: "'Inter',sans-serif" }}>
            Cancelar
          </button>
          <button
            onClick={() => { setDeleting(true); setTimeout(() => { setDeleting(false); onConfirm(); }, 900); }}
            disabled={deleting || plan.companies > 0}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 transition-all hover:opacity-90 disabled:opacity-40"
            style={{ background: "#EF4444", color: "#fff", fontSize: "13px", fontFamily: "'Inter',sans-serif", fontWeight: 500 }}
          >
            {deleting
              ? <span className="rounded-full border-2 animate-spin" style={{ width: "13px", height: "13px", borderColor: "rgba(255,255,255,0.3)", borderTopColor: "#fff" }} />
              : <><Trash2 size={13} /> Remover</>
            }
          </button>
        </div>
        {plan.companies > 0 && (
          <p style={{ fontSize: "11px", color: colors.textMuted, fontFamily: "'Inter',sans-serif", textAlign: "center", marginTop: "8px" }}>
            Migre todas as empresas antes de remover este plano.
          </p>
        )}
      </div>
    </div>
  );
}

// ── Main ───────────────────────────────────────────────────────────────
export function Planos() {
  const { colors, theme } = useTheme();
  const [plans, setPlans]         = useState<Plan[]>(initialPlans);
  const [search, setSearch]       = useState("");
  const [statusFilter, setStatusFilter] = useState<PlanStatus | "todos">("todos");
  const [viewMode, setViewMode]   = useState<"cards" | "table">("cards");
  const [viewPlan, setViewPlan]   = useState<Plan | null>(null);
  const [editPlan, setEditPlan]   = useState<Plan | null | "new">(null);
  const [deletePlan, setDeletePlan] = useState<Plan | null>(null);

  const filtered = plans.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "todos" || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleSave = (data: any) => {
    if (editPlan === "new") {
      setPlans(prev => [...prev, { id: prev.length + 1, companies: 0, users: 0, createdAt: "Jun 2026", revenue: "R$ 0", ...data }]);
    } else if (editPlan) {
      setPlans(prev => prev.map(p => p.id === editPlan.id ? { ...p, ...data } : p));
    }
    setEditPlan(null);
    setViewPlan(null);
  };

  const kpis = [
    { label: "Planos ativos",    value: plans.filter(p => p.status === "ativo").length,  color: "#3B82F6", icon: Package,     sub: `de ${plans.length} criados` },
    { label: "Empresas totais",  value: plans.reduce((a, p) => a + p.companies, 0),        color: "#14B8A6", icon: Building2,   sub: "em todos os planos"         },
    { label: "Usuários totais",  value: plans.reduce((a, p) => a + p.users, 0).toLocaleString("pt-BR"), color: "#8B5CF6", icon: Users, sub: "em todos os planos" },
    { label: "Receita estimada", value: "R$ 170k",                                          color: "#10B981", icon: DollarSign, sub: "mensal recorrente"            },
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
          <h1 style={{ fontFamily: "'Playfair Display',serif", color: colors.textPrimary, fontSize: "26px", fontWeight: 600 }}>Planos</h1>
          <p style={{ fontFamily: "'Inter',sans-serif", color: colors.textMuted, fontSize: "14px", marginTop: "4px" }}>
            Gerencie os planos de assinatura da plataforma
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex items-center rounded-xl overflow-hidden" style={{ border: `1px solid ${colors.border}` }}>
            {(["cards","table"] as const).map(v => (
              <button key={v} onClick={() => setViewMode(v)}
                className="px-3 py-2 transition-all"
                style={{ fontSize: "12px", fontFamily: "'Inter',sans-serif", background: viewMode === v ? "#3B82F6" : colors.surface, color: viewMode === v ? "#fff" : colors.textMuted }}
              >
                {v === "cards" ? "Cards" : "Tabela"}
              </button>
            ))}
          </div>
          <button onClick={() => setEditPlan("new")}
            className="flex items-center gap-2 rounded-xl px-4 py-2.5 transition-all hover:opacity-90"
            style={{ background: "linear-gradient(135deg, #3B82F6, #2563EB)", color: "#fff", fontSize: "14px", fontFamily: "'Inter',sans-serif", fontWeight: 500, boxShadow: "0 4px 16px rgba(59,130,246,0.3)" }}
          >
            <Plus size={16} /> Novo Plano
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {kpis.map(k => (
          <div key={k.label} className="rounded-2xl p-5 flex items-center gap-3 transition-all hover:translate-y-[-2px]" style={cardStyle}>
            <div className="rounded-xl flex items-center justify-center shrink-0" style={{ width: "40px", height: "40px", background: `${k.color}15` }}>
              <k.icon size={17} style={{ color: k.color }} />
            </div>
            <div>
              <p style={{ fontSize: "22px", color: colors.textPrimary, fontFamily: "'Inter',sans-serif", fontWeight: 700, lineHeight: 1 }}>{k.value}</p>
              <p style={{ fontSize: "12px", color: colors.textSecondary, fontFamily: "'Inter',sans-serif", marginTop: "3px" }}>{k.label}</p>
              <p style={{ fontSize: "10px", color: colors.textMuted, fontFamily: "'Inter',sans-serif" }}>{k.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 rounded-xl px-3 py-2 flex-1 min-w-[200px]" style={{ background: colors.card, border: `1px solid ${colors.border}` }}>
          <Search size={14} style={{ color: colors.textMuted }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar plano..."
            className="flex-1 bg-transparent outline-none"
            style={{ fontSize: "13px", color: colors.textPrimary, fontFamily: "'Inter',sans-serif" }}
          />
          {search && <button onClick={() => setSearch("")} style={{ color: colors.textMuted }}><X size={13} /></button>}
        </div>
        <div className="flex gap-1">
          {[{ v: "todos", l: "Todos" }, { v: "ativo", l: "Ativos" }, { v: "inativo", l: "Inativos" }, { v: "rascunho", l: "Rascunho" }].map(({ v, l }) => (
            <button key={v} onClick={() => setStatusFilter(v as any)}
              className="rounded-xl px-3 py-2 transition-all"
              style={{ fontSize: "12px", fontFamily: "'Inter',sans-serif", fontWeight: statusFilter === v ? 500 : 400, background: statusFilter === v ? "#3B82F6" : colors.card, color: statusFilter === v ? "#fff" : colors.textMuted, border: `1px solid ${statusFilter === v ? "#3B82F6" : colors.border}` }}
            >
              {l}
            </button>
          ))}
        </div>
        <span style={{ fontSize: "13px", color: colors.textMuted, fontFamily: "'Inter',sans-serif" }}>{filtered.length} plano{filtered.length !== 1 ? "s" : ""}</span>
      </div>

      {/* ── Cards view ── */}
      {viewMode === "cards" && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map(plan => {
            const st = statusConfig[plan.status];
            const PlanIcon = iconMap[plan.icon] ?? Zap;
            return (
              <div key={plan.id}
                className="rounded-2xl overflow-hidden transition-all duration-300 hover:translate-y-[-3px] flex flex-col cursor-pointer group"
                style={{ ...cardStyle, outline: plan.highlight ? `2px solid ${plan.color}50` : "none", outlineOffset: "2px" }}
                onClick={() => setViewPlan(plan)}
              >
                {/* Card header */}
                <div className="p-5" style={{ background: plan.color + "0E", borderBottom: `1px solid ${plan.color}20` }}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="rounded-xl flex items-center justify-center" style={{ width: "44px", height: "44px", background: plan.color + "20" }}>
                      <PlanIcon size={20} style={{ color: plan.color }} />
                    </div>
                    <div className="flex items-center gap-1.5">
                      {plan.badge && <span className="rounded-full px-2.5 py-1" style={{ fontSize: "10px", color: plan.color, background: plan.color + "25", fontFamily: "'Inter',sans-serif", fontWeight: 600 }}>{plan.badge}</span>}
                      {plan.highlight && <Star size={13} style={{ color: "#F59E0B", fill: "#F59E0B" }} />}
                      <span className="rounded-full px-2 py-0.5" style={{ fontSize: "10px", color: st.color, background: st.bg, fontFamily: "'Inter',sans-serif", fontWeight: 500 }}>{st.label}</span>
                    </div>
                  </div>
                  <h3 style={{ fontFamily: "'Playfair Display',serif", color: colors.textPrimary, fontSize: "18px", fontWeight: 600 }}>{plan.name}</h3>
                  <p style={{ fontSize: "12px", color: colors.textMuted, fontFamily: "'Inter',sans-serif", marginTop: "4px", lineHeight: 1.5 }}>{plan.description}</p>
                  <div className="mt-4">
                    <span style={{ fontSize: "26px", color: colors.textPrimary, fontFamily: "'Inter',sans-serif", fontWeight: 800 }}>{priceDisplay(plan)}</span>
                    {plan.billing !== "customizado" && <span style={{ fontSize: "12px", color: colors.textMuted, fontFamily: "'Inter',sans-serif" }}>/mês</span>}
                  </div>
                </div>

                {/* Features preview */}
                <div className="px-5 py-4 flex-1">
                  <div className="space-y-1.5">
                    {plan.features.slice(0, 5).map((f, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className="rounded-full shrink-0" style={{ width: "14px", height: "14px", background: f.included ? "rgba(16,185,129,0.15)" : "rgba(148,163,184,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          {f.included
                            ? <CheckCircle2 size={9} style={{ color: "#10B981" }} />
                            : <X size={7} style={{ color: colors.textMuted }} />
                          }
                        </div>
                        <span style={{ fontSize: "12px", color: f.included ? colors.textSecondary : colors.textMuted, fontFamily: "'Inter',sans-serif" }}>{f.label}{f.limit ? ` (${f.limit})` : ""}</span>
                      </div>
                    ))}
                    {plan.features.length > 5 && <p style={{ fontSize: "11px", color: colors.textMuted, fontFamily: "'Inter',sans-serif", paddingLeft: "20px" }}>+{plan.features.length - 5} recursos...</p>}
                  </div>
                </div>

                {/* Stats + actions */}
                <div className="px-5 py-4 flex items-center justify-between" style={{ borderTop: `1px solid ${colors.border}` }}>
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1" style={{ fontSize: "12px", color: colors.textMuted, fontFamily: "'Inter',sans-serif" }}>
                      <Building2 size={12} /> {plan.companies}
                    </span>
                    <span className="flex items-center gap-1" style={{ fontSize: "12px", color: colors.textMuted, fontFamily: "'Inter',sans-serif" }}>
                      <Users size={12} /> {plan.users}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all" onClick={e => e.stopPropagation()}>
                    <button onClick={() => setViewPlan(plan)} className="rounded-lg p-1.5 transition-all" style={{ color: colors.textMuted }}
                      onMouseEnter={e => (e.currentTarget.style.color = "#3B82F6")} onMouseLeave={e => (e.currentTarget.style.color = colors.textMuted)}
                    ><Eye size={14} /></button>
                    <button onClick={() => setEditPlan(plan)} className="rounded-lg p-1.5 transition-all" style={{ color: colors.textMuted }}
                      onMouseEnter={e => (e.currentTarget.style.color = "#F59E0B")} onMouseLeave={e => (e.currentTarget.style.color = colors.textMuted)}
                    ><Pencil size={14} /></button>
                    <button onClick={() => setDeletePlan(plan)} className="rounded-lg p-1.5 transition-all" style={{ color: colors.textMuted }}
                      onMouseEnter={e => (e.currentTarget.style.color = "#EF4444")} onMouseLeave={e => (e.currentTarget.style.color = colors.textMuted)}
                    ><Trash2 size={14} /></button>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Add card */}
          <button onClick={() => setEditPlan("new")}
            className="rounded-2xl flex flex-col items-center justify-center gap-3 transition-all hover:translate-y-[-3px] min-h-[280px]"
            style={{ border: `2px dashed ${colors.border}`, background: "transparent" }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = "#3B82F6")}
            onMouseLeave={e => (e.currentTarget.style.borderColor = colors.border)}
          >
            <div className="rounded-xl flex items-center justify-center" style={{ width: "44px", height: "44px", background: "rgba(59,130,246,0.1)" }}>
              <Plus size={20} style={{ color: "#3B82F6" }} />
            </div>
            <p style={{ fontSize: "13px", color: colors.textMuted, fontFamily: "'Inter',sans-serif" }}>Novo Plano</p>
          </button>
        </div>
      )}

      {/* ── Table view ── */}
      {viewMode === "table" && (
        <div className="rounded-2xl overflow-hidden" style={cardStyle}>
          <div className="grid px-5 py-3"
            style={{ gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 1fr 100px", borderBottom: `1px solid ${colors.border}`, background: theme === "light" ? colors.surface : "rgba(255,255,255,0.02)" }}
          >
            {["Plano","Preço","Cobrança","Status","Empresas","Usuários","Ações"].map(h => (
              <span key={h} style={{ fontSize: "11px", color: colors.textMuted, fontFamily: "'Inter',sans-serif", textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</span>
            ))}
          </div>
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <Package size={28} style={{ color: colors.textMuted }} />
              <p style={{ fontSize: "13px", color: colors.textMuted, fontFamily: "'Inter',sans-serif" }}>Nenhum plano encontrado</p>
            </div>
          ) : filtered.map((plan, i) => {
            const st = statusConfig[plan.status];
            const PlanIcon = iconMap[plan.icon] ?? Zap;
            return (
              <div key={plan.id}
                className="grid items-center px-5 py-4 transition-all cursor-pointer group"
                style={{ gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 1fr 100px", borderBottom: i < filtered.length - 1 ? `1px solid ${colors.border}` : "none" }}
                onMouseEnter={e => (e.currentTarget.style.background = colors.hoverBg)}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                onClick={() => setViewPlan(plan)}
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-xl flex items-center justify-center shrink-0" style={{ width: "32px", height: "32px", background: plan.color + "20" }}>
                    <PlanIcon size={14} style={{ color: plan.color }} />
                  </div>
                  <div>
                    <p style={{ fontSize: "13px", color: colors.textPrimary, fontFamily: "'Inter',sans-serif", fontWeight: 500 }}>{plan.name}</p>
                    {plan.badge && <span style={{ fontSize: "10px", color: plan.color, fontFamily: "'Inter',sans-serif" }}>{plan.badge}</span>}
                  </div>
                </div>
                <span style={{ fontSize: "13px", color: colors.textPrimary, fontFamily: "'Inter',sans-serif", fontWeight: 500 }}>{priceDisplay(plan)}</span>
                <span style={{ fontSize: "12px", color: colors.textSecondary, fontFamily: "'Inter',sans-serif", textTransform: "capitalize" }}>{plan.billing}</span>
                <span className="flex items-center gap-1 rounded-full px-2.5 py-1 w-fit" style={{ fontSize: "11px", color: st.color, background: st.bg, fontFamily: "'Inter',sans-serif", fontWeight: 500 }}>
                  {st.label}
                </span>
                <span style={{ fontSize: "13px", color: colors.textPrimary, fontFamily: "'Inter',sans-serif", fontWeight: 500 }}>{plan.companies}</span>
                <span style={{ fontSize: "13px", color: colors.textPrimary, fontFamily: "'Inter',sans-serif", fontWeight: 500 }}>{plan.users.toLocaleString("pt-BR")}</span>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all" onClick={e => e.stopPropagation()}>
                  <button onClick={() => setViewPlan(plan)} className="rounded-lg p-1.5 transition-all" style={{ color: colors.textMuted }} onMouseEnter={e => (e.currentTarget.style.color = "#3B82F6")} onMouseLeave={e => (e.currentTarget.style.color = colors.textMuted)}><Eye size={13} /></button>
                  <button onClick={() => setEditPlan(plan)} className="rounded-lg p-1.5 transition-all" style={{ color: colors.textMuted }} onMouseEnter={e => (e.currentTarget.style.color = "#F59E0B")} onMouseLeave={e => (e.currentTarget.style.color = colors.textMuted)}><Pencil size={13} /></button>
                  <button onClick={() => setDeletePlan(plan)} className="rounded-lg p-1.5 transition-all" style={{ color: colors.textMuted }} onMouseEnter={e => (e.currentTarget.style.color = "#EF4444")} onMouseLeave={e => (e.currentTarget.style.color = colors.textMuted)}><Trash2 size={13} /></button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      {viewPlan && !editPlan && (
        <PlanDetailModal plan={viewPlan} onClose={() => setViewPlan(null)} onEdit={() => { setEditPlan(viewPlan); setViewPlan(null); }} />
      )}
      {editPlan !== null && (
        <PlanFormModal plan={editPlan === "new" ? null : editPlan} onClose={() => setEditPlan(null)} onSave={handleSave} />
      )}
      {deletePlan && (
        <DeletePlanModal plan={deletePlan} onClose={() => setDeletePlan(null)} onConfirm={() => { setPlans(p => p.filter(pl => pl.id !== deletePlan.id)); setDeletePlan(null); }} />
      )}
    </div>
  );
}
