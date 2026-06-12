import { useState } from "react";
import {
  FileText, Plus, Search, X, Pencil, Trash2, Eye,
  ChevronDown, CheckCircle2, Clock, XCircle, AlertCircle,
  CheckCheck, Building2, DollarSign, Calendar, ArrowUpRight,
  ArrowDownRight, ChevronLeft, ChevronRight, Download,
  RefreshCw, Tag, User, Hash, Paperclip, MoreHorizontal
} from "lucide-react";
import { useTheme } from "./ThemeContext";

// ── Types ──────────────────────────────────────────────────────────────
type ContratoStatus = "ativo" | "pendente" | "encerrado" | "vencendo" | "renovado";
type ContratoTipo   = "servico" | "licenca" | "manutencao" | "consultoria" | "suporte" | "outro";

interface Contrato {
  id: number;
  numero: string;
  titulo: string;
  empresa: string;
  responsavel: string;
  tipo: ContratoTipo;
  status: ContratoStatus;
  valor: number;
  recorrencia: "mensal" | "anual" | "unico";
  inicio: string;
  vencimento: string;
  descricao: string;
  renovacaoAuto: boolean;
  diasRestantes?: number;
  tags: string[];
}

// ── Mock ───────────────────────────────────────────────────────────────
const initialContratos: Contrato[] = [
  { id: 1,  numero: "#2847", titulo: "Suporte Premium Anual",      empresa: "Alpha Tecnologia", responsavel: "Mariana Santos",  tipo: "suporte",      status: "ativo",     valor: 42000, recorrencia: "anual",  inicio: "01/03/2026", vencimento: "28/02/2027", descricao: "Contrato de suporte técnico premium com SLA de 4 horas.",          renovacaoAuto: true,  diasRestantes: 263, tags: ["SLA","Premium"]       },
  { id: 2,  numero: "#2801", titulo: "Licença de Software",        empresa: "Alpha Tecnologia", responsavel: "Ricardo Alves",   tipo: "licenca",      status: "encerrado", valor: 18600, recorrencia: "anual",  inicio: "01/05/2025", vencimento: "30/04/2026", descricao: "Licença de uso do sistema ORQUESTRA para 20 usuários.",           renovacaoAuto: false, tags: ["Licença"]             },
  { id: 3,  numero: "#2756", titulo: "Consultoria Estratégica",    empresa: "Alpha Tecnologia", responsavel: "Mariana Santos",  tipo: "consultoria",  status: "ativo",     valor: 12000, recorrencia: "mensal", inicio: "01/01/2026", vencimento: "31/12/2026", descricao: "Serviços mensais de consultoria estratégica e gestão.",            renovacaoAuto: true,  diasRestantes: 202, tags: ["Consultoria"]         },
  { id: 4,  numero: "#2712", titulo: "Manutenção de Sistemas",     empresa: "Alpha Tecnologia", responsavel: "Carlos Lima",     tipo: "manutencao",   status: "vencendo",  valor: 8400,  recorrencia: "mensal", inicio: "01/06/2025", vencimento: "15/06/2026", descricao: "Manutenção preventiva e corretiva de sistemas.",                  renovacaoAuto: false, diasRestantes: 3,   tags: ["Manutenção","Urgente"] },
  { id: 5,  numero: "#2698", titulo: "Serviço de Integração API",  empresa: "Beta Solutions",   responsavel: "Pedro Costa",     tipo: "servico",      status: "ativo",     valor: 24000, recorrencia: "anual",  inicio: "01/04/2026", vencimento: "31/03/2027", descricao: "Desenvolvimento e manutenção de integrações via API REST.",        renovacaoAuto: true,  diasRestantes: 293, tags: ["API","Integração"]    },
  { id: 6,  numero: "#2654", titulo: "Suporte Básico",             empresa: "Beta Solutions",   responsavel: "Ana Ferreira",    tipo: "suporte",      status: "pendente",  valor: 9600,  recorrencia: "anual",  inicio: "15/06/2026", vencimento: "14/06/2027", descricao: "Contrato aguardando assinatura do cliente.",                       renovacaoAuto: false, tags: ["Pendente"]            },
  { id: 7,  numero: "#2612", titulo: "Licença Enterprise",         empresa: "Delta Systems",    responsavel: "Fernanda Rocha",  tipo: "licenca",      status: "ativo",     valor: 60000, recorrencia: "anual",  inicio: "01/01/2026", vencimento: "31/12/2026", descricao: "Licença Enterprise com usuários ilimitados e todos os módulos.",   renovacaoAuto: true,  diasRestantes: 202, tags: ["Enterprise","Licença"] },
  { id: 8,  numero: "#2589", titulo: "Consultoria Mensal",         empresa: "Gamma Corp",       responsavel: "Lucas Mendes",    tipo: "consultoria",  status: "vencendo",  valor: 5500,  recorrencia: "mensal", inicio: "01/02/2026", vencimento: "20/06/2026", descricao: "Horas de consultoria técnica e operacional mensais.",              renovacaoAuto: false, diasRestantes: 8,   tags: ["Consultoria"]         },
  { id: 9,  numero: "#2543", titulo: "Contrato de Treinamento",    empresa: "Theta Digital",    responsavel: "Camila Torres",   tipo: "servico",      status: "renovado",  valor: 7200,  recorrencia: "unico",  inicio: "01/03/2026", vencimento: "30/06/2026", descricao: "Programa de treinamento e capacitação da equipe.",                 renovacaoAuto: false, tags: ["Treinamento"]         },
  { id: 10, numero: "#2501", titulo: "Suporte Técnico Pro",        empresa: "Iota Saúde",       responsavel: "Bruno Oliveira",  tipo: "suporte",      status: "ativo",     valor: 32400, recorrencia: "anual",  inicio: "01/09/2025", vencimento: "31/08/2026", descricao: "Suporte técnico prioritário com gerente dedicado.",                renovacaoAuto: true,  diasRestantes: 81,  tags: ["Saúde","Prioritário"]  },
];

// ── Configs ────────────────────────────────────────────────────────────
const statusConfig: Record<ContratoStatus, { label: string; color: string; bg: string; icon: any }> = {
  ativo:     { label: "Ativo",     color: "#10B981", bg: "rgba(16,185,129,0.12)",  icon: CheckCircle2 },
  pendente:  { label: "Pendente",  color: "#F59E0B", bg: "rgba(245,158,11,0.12)",  icon: Clock        },
  encerrado: { label: "Encerrado", color: "#94A3B8", bg: "rgba(148,163,184,0.12)", icon: XCircle      },
  vencendo:  { label: "Vencendo",  color: "#EF4444", bg: "rgba(239,68,68,0.12)",   icon: AlertCircle  },
  renovado:  { label: "Renovado",  color: "#3B82F6", bg: "rgba(59,130,246,0.12)",  icon: RefreshCw    },
};

const tipoConfig: Record<ContratoTipo, { label: string; color: string }> = {
  servico:     { label: "Serviço",      color: "#3B82F6" },
  licenca:     { label: "Licença",      color: "#8B5CF6" },
  manutencao:  { label: "Manutenção",   color: "#F59E0B" },
  consultoria: { label: "Consultoria",  color: "#14B8A6" },
  suporte:     { label: "Suporte",      color: "#10B981" },
  outro:       { label: "Outro",        color: "#94A3B8" },
};

const tipoOptions  = Object.entries(tipoConfig).map(([v, c]) => ({ value: v, label: c.label }));
const statusOptions = Object.entries(statusConfig).map(([v, c]) => ({ value: v, label: c.label }));
const recorrencias = [{ value: "mensal", label: "Mensal" }, { value: "anual", label: "Anual" }, { value: "unico", label: "Único" }];
const empresas     = ["Alpha Tecnologia","Beta Solutions","Gamma Corp","Delta Systems","Epsilon Group","Theta Digital","Iota Saúde","Kappa Logística"];

const ITEMS_PER_PAGE = 8;

function fmt(valor: number) {
  return `R$ ${valor.toLocaleString("pt-BR")}`;
}

// ── Field helpers ──────────────────────────────────────────────────────
function Field({ label, value, onChange, placeholder, type = "text", icon: Icon, required }: any) {
  const { colors } = useTheme();
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <label style={{ fontSize: "13px", color: colors.textSecondary, display: "block", marginBottom: "7px", fontFamily: "'Inter',sans-serif", fontWeight: 500 }}>
        {label}{required && <span style={{ color: "#EF4444", marginLeft: "3px" }}>*</span>}
      </label>
      <div className="flex items-center gap-2.5 rounded-xl px-3.5 transition-all duration-200"
        style={{ background: colors.inputBg, border: `1px solid ${focused ? "rgba(59,130,246,0.55)" : colors.border}`, boxShadow: focused ? "0 0 0 3px rgba(59,130,246,0.1)" : "none", height: "44px" }}
      >
        {Icon && <Icon size={15} style={{ color: focused ? "#3B82F6" : colors.textMuted }} className="shrink-0" />}
        <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} type={type}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          className="flex-1 bg-transparent outline-none"
          style={{ fontSize: "14px", color: colors.textPrimary, fontFamily: "'Inter',sans-serif" }}
        />
      </div>
    </div>
  );
}

function Select({ label, value, onChange, options, required }: any) {
  const { colors } = useTheme();
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <label style={{ fontSize: "13px", color: colors.textSecondary, display: "block", marginBottom: "7px", fontFamily: "'Inter',sans-serif", fontWeight: 500 }}>
        {label}{required && <span style={{ color: "#EF4444", marginLeft: "3px" }}>*</span>}
      </label>
      <div className="relative flex items-center rounded-xl transition-all duration-200"
        style={{ background: colors.inputBg, border: `1px solid ${focused ? "rgba(59,130,246,0.55)" : colors.border}`, boxShadow: focused ? "0 0 0 3px rgba(59,130,246,0.1)" : "none", height: "44px" }}
      >
        <select value={value} onChange={e => onChange(e.target.value)}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          className="flex-1 bg-transparent outline-none appearance-none cursor-pointer px-3.5"
          style={{ fontSize: "14px", color: value ? colors.textPrimary : colors.textMuted, fontFamily: "'Inter',sans-serif" }}
        >
          <option value="">Selecionar...</option>
          {options.map((o: any) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <ChevronDown size={13} className="absolute right-3 pointer-events-none" style={{ color: colors.textMuted }} />
      </div>
    </div>
  );
}

// ── View modal ─────────────────────────────────────────────────────────
function ContratoViewModal({ contrato, onClose, onEdit }: { contrato: Contrato; onClose: () => void; onEdit: () => void }) {
  const { colors, theme } = useTheme();
  const st = statusConfig[contrato.status];
  const tp = tipoConfig[contrato.tipo];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(8px)" }}
      onClick={onClose}
    >
      <div className="w-full max-w-[580px] rounded-2xl overflow-hidden flex flex-col"
        style={{ background: colors.card, border: `1px solid ${colors.borderStrong}`, boxShadow: "0 32px 80px rgba(0,0,0,0.4)", maxHeight: "88vh" }}
        onClick={e => e.stopPropagation()}
      >
        {/* Hero */}
        <div className="px-6 pt-6 pb-5 shrink-0" style={{ background: `${st.color}08`, borderBottom: `1px solid ${colors.border}` }}>
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="rounded-xl flex items-center justify-center shrink-0" style={{ width: "44px", height: "44px", background: `${st.color}18` }}>
                <FileText size={20} style={{ color: st.color }} />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span style={{ fontSize: "13px", color: colors.textMuted, fontFamily: "'Inter',sans-serif" }}>{contrato.numero}</span>
                  <span className="flex items-center gap-1 rounded-full px-2.5 py-0.5" style={{ fontSize: "11px", color: st.color, background: st.bg, fontFamily: "'Inter',sans-serif", fontWeight: 500 }}>
                    <st.icon size={10} /> {st.label}
                  </span>
                  <span className="rounded-full px-2.5 py-0.5" style={{ fontSize: "11px", color: tp.color, background: `${tp.color}15`, fontFamily: "'Inter',sans-serif" }}>
                    {tp.label}
                  </span>
                </div>
                <h2 style={{ fontFamily: "'Playfair Display',serif", color: colors.textPrimary, fontSize: "19px", fontWeight: 600, marginTop: "4px" }}>
                  {contrato.titulo}
                </h2>
              </div>
            </div>
            <button onClick={onClose} className="rounded-lg p-1.5 shrink-0" style={{ color: colors.textMuted }}>
              <X size={15} />
            </button>
          </div>

          {/* Value + dates */}
          <div className="flex items-end gap-6">
            <div>
              <p style={{ fontSize: "11px", color: colors.textMuted, fontFamily: "'Inter',sans-serif", textTransform: "uppercase", letterSpacing: "0.06em" }}>Valor</p>
              <p style={{ fontSize: "26px", color: colors.textPrimary, fontFamily: "'Inter',sans-serif", fontWeight: 800, lineHeight: 1.1 }}>
                {fmt(contrato.valor)}
              </p>
              <p style={{ fontSize: "11px", color: colors.textMuted, fontFamily: "'Inter',sans-serif" }}>
                {contrato.recorrencia === "unico" ? "pagamento único" : `por ${contrato.recorrencia === "mensal" ? "mês" : "ano"}`}
              </p>
            </div>
            {contrato.status === "vencendo" && contrato.diasRestantes !== undefined && (
              <div className="rounded-xl px-3 py-2" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)" }}>
                <p style={{ fontSize: "20px", color: "#EF4444", fontFamily: "'Inter',sans-serif", fontWeight: 700, lineHeight: 1 }}>{contrato.diasRestantes}</p>
                <p style={{ fontSize: "11px", color: "#EF4444", fontFamily: "'Inter',sans-serif" }}>dias restantes</p>
              </div>
            )}
          </div>
        </div>

        {/* Details */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* Info grid */}
          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: Building2, label: "Empresa",      value: contrato.empresa      },
              { icon: User,      label: "Responsável",  value: contrato.responsavel  },
              { icon: Calendar,  label: "Início",       value: contrato.inicio        },
              { icon: Calendar,  label: "Vencimento",   value: contrato.vencimento   },
              { icon: RefreshCw, label: "Recorrência",  value: recorrencias.find(r => r.value === contrato.recorrencia)?.label ?? contrato.recorrencia },
              { icon: RefreshCw, label: "Renovação auto", value: contrato.renovacaoAuto ? "Ativada" : "Desativada" },
            ].map(info => (
              <div key={info.label} className="flex items-start gap-3">
                <div className="rounded-lg flex items-center justify-center shrink-0 mt-0.5" style={{ width: "28px", height: "28px", background: colors.surface }}>
                  <info.icon size={13} style={{ color: colors.textMuted }} />
                </div>
                <div>
                  <p style={{ fontSize: "11px", color: colors.textMuted, fontFamily: "'Inter',sans-serif", textTransform: "uppercase", letterSpacing: "0.06em" }}>{info.label}</p>
                  <p style={{ fontSize: "13px", color: colors.textPrimary, fontFamily: "'Inter',sans-serif", marginTop: "1px", fontWeight: 500 }}>{info.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Tags */}
          {contrato.tags.length > 0 && (
            <div>
              <p style={{ fontSize: "11px", color: colors.textMuted, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "8px", fontFamily: "'Inter',sans-serif" }}>Tags</p>
              <div className="flex flex-wrap gap-2">
                {contrato.tags.map(t => (
                  <span key={t} className="rounded-full px-3 py-1" style={{ fontSize: "12px", color: "#3B82F6", background: "rgba(59,130,246,0.1)", fontFamily: "'Inter',sans-serif" }}>
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          {contrato.descricao && (
            <div>
              <p style={{ fontSize: "11px", color: colors.textMuted, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "8px", fontFamily: "'Inter',sans-serif" }}>Descrição</p>
              <div className="rounded-xl p-4" style={{ background: colors.surface, border: `1px solid ${colors.border}` }}>
                <p style={{ fontSize: "14px", color: colors.textSecondary, fontFamily: "'Inter',sans-serif", lineHeight: 1.65 }}>{contrato.descricao}</p>
              </div>
            </div>
          )}

          {/* Alert vencendo */}
          {contrato.status === "vencendo" && (
            <div className="flex items-start gap-3 rounded-xl p-4" style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)" }}>
              <AlertCircle size={15} style={{ color: "#EF4444", marginTop: "1px" }} className="shrink-0" />
              <div>
                <p style={{ fontSize: "13px", color: "#EF4444", fontFamily: "'Inter',sans-serif", fontWeight: 500 }}>Contrato próximo do vencimento</p>
                <p style={{ fontSize: "12px", color: colors.textSecondary, fontFamily: "'Inter',sans-serif", marginTop: "2px" }}>
                  Vence em {contrato.diasRestantes} dia{contrato.diasRestantes !== 1 ? "s" : ""}. Renove ou encerre para evitar interrupções.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 shrink-0" style={{ borderTop: `1px solid ${colors.border}` }}>
          <button className="flex items-center gap-2 rounded-xl px-3 py-2 transition-all" style={{ fontSize: "12px", color: "#14B8A6", background: "rgba(20,184,166,0.1)", fontFamily: "'Inter',sans-serif" }}>
            <Download size={13} /> Baixar PDF
          </button>
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="rounded-xl px-4 py-2 transition-all" style={{ fontSize: "13px", color: colors.textSecondary, background: colors.surface, border: `1px solid ${colors.border}`, fontFamily: "'Inter',sans-serif" }}>
              Fechar
            </button>
            <button onClick={onEdit} className="flex items-center gap-2 rounded-xl px-4 py-2 hover:opacity-90 transition-all"
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

// ── Form modal ─────────────────────────────────────────────────────────
function ContratoFormModal({ contrato, onClose, onSave }: { contrato?: Contrato | null; onClose: () => void; onSave: (d: any) => void }) {
  const { colors, theme } = useTheme();
  const isEdit = !!contrato;

  const [form, setForm] = useState({
    titulo:       contrato?.titulo        ?? "",
    empresa:      contrato?.empresa       ?? "",
    responsavel:  contrato?.responsavel   ?? "",
    tipo:         contrato?.tipo          ?? "" as ContratoTipo | "",
    status:       contrato?.status        ?? "pendente" as ContratoStatus,
    valor:        contrato?.valor         ?? 0,
    recorrencia:  contrato?.recorrencia   ?? "anual" as "mensal" | "anual" | "unico",
    inicio:       contrato?.inicio        ?? "",
    vencimento:   contrato?.vencimento    ?? "",
    descricao:    contrato?.descricao     ?? "",
    renovacaoAuto: contrato?.renovacaoAuto ?? false,
    tags:         contrato?.tags.join(", ") ?? "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved]   = useState(false);
  const set = (k: string) => (v: any) => setForm(f => ({ ...f, [k]: v }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.titulo)     e.titulo    = "Título obrigatório";
    if (!form.empresa)    e.empresa   = "Empresa obrigatória";
    if (!form.tipo)       e.tipo      = "Tipo obrigatório";
    if (!form.vencimento) e.vencimento = "Vencimento obrigatório";
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSave = () => {
    if (!validate()) return;
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setSaved(true);
      const data = { ...form, valor: Number(form.valor), tags: form.tags.split(",").map(t => t.trim()).filter(Boolean) };
      setTimeout(() => onSave(data), 900);
    }, 1300);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(8px)" }}
      onClick={onClose}
    >
      <div className="w-full max-w-[600px] rounded-2xl overflow-hidden flex flex-col"
        style={{ background: colors.card, border: `1px solid ${colors.borderStrong}`, boxShadow: "0 32px 80px rgba(0,0,0,0.4)", maxHeight: "92vh" }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 shrink-0" style={{ borderBottom: `1px solid ${colors.border}` }}>
          <div className="flex items-center gap-3">
            <div className="rounded-xl flex items-center justify-center" style={{ width: "34px", height: "34px", background: "linear-gradient(135deg, #3B82F6, #14B8A6)" }}>
              <FileText size={16} color="#fff" />
            </div>
            <h2 style={{ fontFamily: "'Playfair Display',serif", color: colors.textPrimary, fontSize: "18px", fontWeight: 600 }}>
              {isEdit ? "Editar Contrato" : "Novo Contrato"}
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
              {isEdit ? "Contrato atualizado!" : "Contrato criado!"}
            </p>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
              <Field label="Título do contrato" placeholder="Ex: Suporte Premium Anual" value={form.titulo} onChange={set("titulo")} icon={FileText} required />
              {errors.titulo && <p style={{ fontSize: "11px", color: "#EF4444", marginTop: "-8px", fontFamily: "'Inter',sans-serif" }}>{errors.titulo}</p>}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Select label="Empresa" value={form.empresa} onChange={set("empresa")} required
                    options={empresas.map(e => ({ value: e, label: e }))}
                  />
                  {errors.empresa && <p style={{ fontSize: "11px", color: "#EF4444", marginTop: "4px", fontFamily: "'Inter',sans-serif" }}>{errors.empresa}</p>}
                </div>
                <Field label="Responsável" placeholder="Nome do contato" value={form.responsavel} onChange={set("responsavel")} icon={User} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Select label="Tipo" value={form.tipo} onChange={set("tipo")} required options={tipoOptions} />
                  {errors.tipo && <p style={{ fontSize: "11px", color: "#EF4444", marginTop: "4px", fontFamily: "'Inter',sans-serif" }}>{errors.tipo}</p>}
                </div>
                <Select label="Status" value={form.status} onChange={set("status")} options={statusOptions} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Valor (R$)" placeholder="0" value={form.valor} onChange={set("valor")} type="number" icon={DollarSign} />
                <Select label="Recorrência" value={form.recorrencia} onChange={set("recorrencia")} options={recorrencias} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Data de início" placeholder="DD/MM/AAAA" value={form.inicio} onChange={set("inicio")} icon={Calendar} />
                <div>
                  <Field label="Vencimento" placeholder="DD/MM/AAAA" value={form.vencimento} onChange={set("vencimento")} icon={Calendar} required />
                  {errors.vencimento && <p style={{ fontSize: "11px", color: "#EF4444", marginTop: "4px", fontFamily: "'Inter',sans-serif" }}>{errors.vencimento}</p>}
                </div>
              </div>

              <Field label="Tags (separadas por vírgula)" placeholder="SLA, Premium, Urgente..." value={form.tags} onChange={set("tags")} icon={Tag} />

              <div>
                <label style={{ fontSize: "13px", color: colors.textSecondary, display: "block", marginBottom: "7px", fontFamily: "'Inter',sans-serif", fontWeight: 500 }}>Descrição</label>
                <textarea value={form.descricao} onChange={e => set("descricao")(e.target.value)}
                  placeholder="Descreva o objeto do contrato..." rows={3}
                  className="w-full rounded-xl px-4 py-3 outline-none resize-none transition-all"
                  style={{ background: colors.inputBg, border: `1px solid ${colors.border}`, color: colors.textPrimary, fontSize: "14px", fontFamily: "'Inter',sans-serif", lineHeight: 1.6 }}
                  onFocus={e => (e.target.style.border = "1px solid rgba(59,130,246,0.55)")}
                  onBlur={e => (e.target.style.border = `1px solid ${colors.border}`)}
                />
              </div>

              {/* Renovação auto toggle */}
              <div className="flex items-center justify-between p-4 rounded-xl" style={{ background: colors.surface, border: `1px solid ${colors.border}` }}>
                <div>
                  <p style={{ fontSize: "13px", color: colors.textPrimary, fontFamily: "'Inter',sans-serif", fontWeight: 500 }}>Renovação automática</p>
                  <p style={{ fontSize: "11px", color: colors.textMuted, fontFamily: "'Inter',sans-serif" }}>Renovar contrato automaticamente ao vencer</p>
                </div>
                <button onClick={() => set("renovacaoAuto")(!form.renovacaoAuto)}
                  className="rounded-full transition-all duration-300 shrink-0"
                  style={{ width: "44px", height: "24px", background: form.renovacaoAuto ? "#3B82F6" : "#64748B", position: "relative" }}
                >
                  <div className="absolute top-1 rounded-full bg-white transition-all duration-300"
                    style={{ width: "16px", height: "16px", left: form.renovacaoAuto ? "24px" : "4px" }}
                  />
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-2 px-6 py-4 shrink-0" style={{ borderTop: `1px solid ${colors.border}` }}>
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
                  : <><CheckCheck size={14} />{isEdit ? "Salvar alterações" : "Criar contrato"}</>
                }
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── Delete modal ───────────────────────────────────────────────────────
function DeleteModal({ contrato, onClose, onConfirm }: { contrato: Contrato; onClose: () => void; onConfirm: () => void }) {
  const { colors } = useTheme();
  const [deleting, setDeleting] = useState(false);
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
            <h3 style={{ fontFamily: "'Playfair Display',serif", color: colors.textPrimary, fontSize: "17px", fontWeight: 600 }}>Remover contrato</h3>
            <p style={{ fontSize: "12px", color: colors.textMuted, fontFamily: "'Inter',sans-serif" }}>Esta ação não pode ser desfeita.</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-4 rounded-xl mb-5" style={{ background: colors.surface, border: `1px solid ${colors.border}` }}>
          <div className="rounded-lg flex items-center justify-center shrink-0" style={{ width: "34px", height: "34px", background: `${statusConfig[contrato.status].color}15` }}>
            <FileText size={15} style={{ color: statusConfig[contrato.status].color }} />
          </div>
          <div>
            <p style={{ fontSize: "14px", color: colors.textPrimary, fontFamily: "'Inter',sans-serif", fontWeight: 500 }}>{contrato.titulo}</p>
            <p style={{ fontSize: "12px", color: colors.textMuted, fontFamily: "'Inter',sans-serif" }}>{contrato.numero} · {contrato.empresa}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 rounded-xl py-2.5 transition-all" style={{ fontSize: "13px", color: colors.textSecondary, background: colors.surface, border: `1px solid ${colors.border}`, fontFamily: "'Inter',sans-serif" }}>
            Cancelar
          </button>
          <button onClick={() => { setDeleting(true); setTimeout(() => { setDeleting(false); onConfirm(); }, 900); }} disabled={deleting}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 hover:opacity-90 disabled:opacity-60 transition-all"
            style={{ background: "#EF4444", color: "#fff", fontSize: "13px", fontFamily: "'Inter',sans-serif", fontWeight: 500 }}
          >
            {deleting
              ? <span className="rounded-full border-2 animate-spin" style={{ width: "13px", height: "13px", borderColor: "rgba(255,255,255,0.3)", borderTopColor: "#fff" }} />
              : <><Trash2 size={13} /> Remover</>
            }
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main ───────────────────────────────────────────────────────────────
export function Contratos() {
  const { colors, theme } = useTheme();
  const [contratos, setContratos] = useState<Contrato[]>(initialContratos);
  const [search, setSearch]       = useState("");
  const [statusFilter, setStatusFilter] = useState<ContratoStatus | "todos">("todos");
  const [tipoFilter, setTipoFilter]     = useState<ContratoTipo | "todos">("todos");
  const [page, setPage]           = useState(1);
  const [viewContrato, setViewContrato] = useState<Contrato | null>(null);
  const [editContrato, setEditContrato] = useState<Contrato | null | "new">(null);
  const [deleteContrato, setDeleteContrato] = useState<Contrato | null>(null);

  const filtered = contratos.filter(c => {
    const q = search.toLowerCase();
    const matchSearch = c.titulo.toLowerCase().includes(q) || c.empresa.toLowerCase().includes(q) || c.numero.toLowerCase().includes(q);
    const matchStatus = statusFilter === "todos" || c.status === statusFilter;
    const matchTipo   = tipoFilter   === "todos" || c.tipo   === tipoFilter;
    return matchSearch && matchStatus && matchTipo;
  });

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated  = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const handleSave = (data: any) => {
    if (editContrato === "new") {
      const num = `#${3000 + contratos.length + 1}`;
      setContratos(prev => [{ id: prev.length + 1, numero: num, diasRestantes: undefined, ...data }, ...prev]);
    } else if (editContrato) {
      setContratos(prev => prev.map(c => c.id === editContrato.id ? { ...c, ...data } : c));
    }
    setEditContrato(null);
    setViewContrato(null);
  };

  const kpis = [
    { label: "Total de Contratos", value: contratos.length,                                               color: "#3B82F6", icon: FileText,    sub: `${contratos.filter(c => c.status === "ativo").length} ativos` },
    { label: "Receita Recorrente",  value: fmt(contratos.filter(c => c.status === "ativo" && c.recorrencia === "mensal").reduce((a, c) => a + c.valor, 0)), color: "#10B981", icon: DollarSign, sub: "mensal (ativos)" },
    { label: "Vencendo em breve",   value: contratos.filter(c => c.status === "vencendo").length,          color: "#EF4444", icon: AlertCircle, sub: "requerem atenção" },
    { label: "Renovação automática",value: contratos.filter(c => c.renovacaoAuto).length,                  color: "#8B5CF6", icon: RefreshCw,   sub: "configurados" },
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
          <h1 style={{ fontFamily: "'Playfair Display',serif", color: colors.textPrimary, fontSize: "26px", fontWeight: 600 }}>Contratos</h1>
          <p style={{ fontFamily: "'Inter',sans-serif", color: colors.textMuted, fontSize: "14px", marginTop: "4px" }}>
            Gerencie todos os contratos ativos e vigentes
          </p>
        </div>
        <button onClick={() => setEditContrato("new")}
          className="flex items-center gap-2 rounded-xl px-4 py-2.5 transition-all hover:opacity-90"
          style={{ background: "linear-gradient(135deg, #3B82F6, #2563EB)", color: "#fff", fontSize: "14px", fontFamily: "'Inter',sans-serif", fontWeight: 500, boxShadow: "0 4px 16px rgba(59,130,246,0.3)" }}
        >
          <Plus size={16} /> Novo Contrato
        </button>
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

      {/* Status pills */}
      <div className="flex flex-wrap gap-2">
        {[{ v: "todos", l: "Todos", color: "#3B82F6" }, ...Object.entries(statusConfig).map(([v, c]) => ({ v, l: c.label, color: c.color }))].map(({ v, l, color }) => {
          const count = v === "todos" ? contratos.length : contratos.filter(c => c.status === v).length;
          const isActive = statusFilter === v;
          return (
            <button key={v} onClick={() => { setStatusFilter(v as any); setPage(1); }}
              className="flex items-center gap-2 rounded-xl px-3 py-2 transition-all"
              style={{ background: isActive ? `${color}18` : colors.card, border: `1px solid ${isActive ? color + "50" : colors.border}`, fontSize: "12px", color: isActive ? color : colors.textSecondary, fontFamily: "'Inter',sans-serif", fontWeight: isActive ? 500 : 400 }}
            >
              {l}
              <span className="rounded-full px-1.5 py-0.5" style={{ fontSize: "10px", background: isActive ? `${color}25` : colors.surface, color: isActive ? color : colors.textMuted, fontFamily: "'Inter',sans-serif" }}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Filters */}
      <div className="rounded-2xl p-4" style={cardStyle}>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 rounded-xl px-3 py-2 flex-1 min-w-[220px]" style={{ background: colors.surface, border: `1px solid ${colors.border}` }}>
            <Search size={14} style={{ color: colors.textMuted }} />
            <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Buscar por título, empresa ou número..."
              className="flex-1 bg-transparent outline-none"
              style={{ fontSize: "13px", color: colors.textPrimary, fontFamily: "'Inter',sans-serif" }}
            />
            {search && <button onClick={() => setSearch("")} style={{ color: colors.textMuted }}><X size={13} /></button>}
          </div>
          <div className="relative">
            <select value={tipoFilter} onChange={e => { setTipoFilter(e.target.value as any); setPage(1); }}
              className="appearance-none rounded-xl px-3 py-2 pr-8 outline-none cursor-pointer"
              style={{ background: colors.surface, border: `1px solid ${tipoFilter !== "todos" ? "#3B82F6" : colors.border}`, color: tipoFilter !== "todos" ? "#3B82F6" : colors.textSecondary, fontSize: "13px", fontFamily: "'Inter',sans-serif" }}
            >
              <option value="todos">Tipo</option>
              {tipoOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: colors.textMuted }} />
          </div>
          <span style={{ marginLeft: "auto", fontSize: "13px", color: colors.textMuted, fontFamily: "'Inter',sans-serif" }}>
            {filtered.length} contrato{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl overflow-hidden" style={cardStyle}>
        <div className="grid px-5 py-3"
          style={{ gridTemplateColumns: "80px 2.2fr 1.4fr 1fr 1fr 1fr 1fr 100px", borderBottom: `1px solid ${colors.border}`, background: theme === "light" ? colors.surface : "rgba(255,255,255,0.02)" }}
        >
          {["Nº","Título","Empresa","Tipo","Status","Valor","Vencimento","Ações"].map(h => (
            <span key={h} style={{ fontSize: "11px", color: colors.textMuted, fontFamily: "'Inter',sans-serif", textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</span>
          ))}
        </div>

        {paginated.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <FileText size={32} style={{ color: colors.textMuted }} />
            <p style={{ fontSize: "14px", color: colors.textMuted, fontFamily: "'Inter',sans-serif" }}>Nenhum contrato encontrado</p>
          </div>
        ) : paginated.map((c, i) => {
          const st = statusConfig[c.status];
          const tp = tipoConfig[c.tipo];
          const isLast = i === paginated.length - 1;
          return (
            <div key={c.id}
              className="grid items-center px-5 py-4 transition-all cursor-pointer group"
              style={{ gridTemplateColumns: "80px 2.2fr 1.4fr 1fr 1fr 1fr 1fr 100px", borderBottom: isLast ? "none" : `1px solid ${colors.border}` }}
              onMouseEnter={e => (e.currentTarget.style.background = colors.hoverBg)}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
              onClick={() => setViewContrato(c)}
            >
              {/* Número */}
              <span style={{ fontSize: "12px", color: colors.textMuted, fontFamily: "'Inter',sans-serif" }}>{c.numero}</span>

              {/* Título */}
              <div className="min-w-0 pr-3">
                <p style={{ fontSize: "13px", color: colors.textPrimary, fontFamily: "'Inter',sans-serif", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {c.titulo}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  {c.renovacaoAuto && <span style={{ fontSize: "10px", color: "#14B8A6", fontFamily: "'Inter',sans-serif" }}>↻ auto</span>}
                  {c.tags.slice(0, 2).map(t => (
                    <span key={t} style={{ fontSize: "10px", color: colors.textMuted, fontFamily: "'Inter',sans-serif" }}>· {t}</span>
                  ))}
                </div>
              </div>

              {/* Empresa */}
              <span style={{ fontSize: "12px", color: colors.textSecondary, fontFamily: "'Inter',sans-serif", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {c.empresa}
              </span>

              {/* Tipo */}
              <span className="rounded-full px-2.5 py-1 w-fit" style={{ fontSize: "11px", color: tp.color, background: `${tp.color}15`, fontFamily: "'Inter',sans-serif" }}>
                {tp.label}
              </span>

              {/* Status */}
              <span className="flex items-center gap-1 rounded-full px-2.5 py-1 w-fit" style={{ fontSize: "11px", color: st.color, background: st.bg, fontFamily: "'Inter',sans-serif", fontWeight: 500 }}>
                <st.icon size={10} /> {st.label}
              </span>

              {/* Valor */}
              <span style={{ fontSize: "13px", color: colors.textPrimary, fontFamily: "'Inter',sans-serif", fontWeight: 500 }}>
                {fmt(c.valor)}
              </span>

              {/* Vencimento */}
              <div>
                <p style={{ fontSize: "12px", color: c.status === "vencendo" ? "#EF4444" : colors.textSecondary, fontFamily: "'Inter',sans-serif", fontWeight: c.status === "vencendo" ? 600 : 400 }}>
                  {c.vencimento}
                </p>
                {c.status === "vencendo" && c.diasRestantes !== undefined && (
                  <p style={{ fontSize: "10px", color: "#EF4444", fontFamily: "'Inter',sans-serif" }}>{c.diasRestantes}d restantes</p>
                )}
              </div>

              {/* Ações */}
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all" onClick={e => e.stopPropagation()}>
                <button onClick={() => setViewContrato(c)} className="rounded-lg p-1.5 transition-all" style={{ color: colors.textMuted }} title="Ver"
                  onMouseEnter={e => (e.currentTarget.style.color = "#3B82F6")} onMouseLeave={e => (e.currentTarget.style.color = colors.textMuted)}>
                  <Eye size={14} />
                </button>
                <button onClick={() => setEditContrato(c)} className="rounded-lg p-1.5 transition-all" style={{ color: colors.textMuted }} title="Editar"
                  onMouseEnter={e => (e.currentTarget.style.color = "#F59E0B")} onMouseLeave={e => (e.currentTarget.style.color = colors.textMuted)}>
                  <Pencil size={14} />
                </button>
                <button onClick={() => setDeleteContrato(c)} className="rounded-lg p-1.5 transition-all" style={{ color: colors.textMuted }} title="Remover"
                  onMouseEnter={e => (e.currentTarget.style.color = "#EF4444")} onMouseLeave={e => (e.currentTarget.style.color = colors.textMuted)}>
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          );
        })}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-4" style={{ borderTop: `1px solid ${colors.border}` }}>
            <span style={{ fontSize: "13px", color: colors.textMuted, fontFamily: "'Inter',sans-serif" }}>
              Página {page} de {totalPages} — {filtered.length} resultados
            </span>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="rounded-lg p-1.5 disabled:opacity-30 transition-all"
                style={{ color: colors.textSecondary, background: colors.surface, border: `1px solid ${colors.border}` }}
              >
                <ChevronLeft size={15} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                <button key={n} onClick={() => setPage(n)}
                  className="rounded-lg transition-all"
                  style={{ width: "32px", height: "32px", fontSize: "13px", fontFamily: "'Inter',sans-serif", background: n === page ? "#3B82F6" : colors.surface, color: n === page ? "#fff" : colors.textSecondary, border: `1px solid ${n === page ? "#3B82F6" : colors.border}`, fontWeight: n === page ? 600 : 400 }}
                >
                  {n}
                </button>
              ))}
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="rounded-lg p-1.5 disabled:opacity-30 transition-all"
                style={{ color: colors.textSecondary, background: colors.surface, border: `1px solid ${colors.border}` }}
              >
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {viewContrato && !editContrato && (
        <ContratoViewModal
          contrato={viewContrato}
          onClose={() => setViewContrato(null)}
          onEdit={() => { setEditContrato(viewContrato); setViewContrato(null); }}
        />
      )}
      {editContrato !== null && (
        <ContratoFormModal
          contrato={editContrato === "new" ? null : editContrato}
          onClose={() => setEditContrato(null)}
          onSave={handleSave}
        />
      )}
      {deleteContrato && (
        <DeleteModal
          contrato={deleteContrato}
          onClose={() => setDeleteContrato(null)}
          onConfirm={() => { setContratos(p => p.filter(c => c.id !== deleteContrato.id)); setDeleteContrato(null); }}
        />
      )}
    </div>
  );
}
