import { useEffect, useState } from "react";
import {
  X, Building2, MapPin, Phone, CreditCard, CheckCircle2,
  ChevronRight, ChevronLeft, AlertCircle, Globe, Mail,
  User, Hash, Briefcase, Zap, Star, Rocket, Search, ChevronDown
} from "lucide-react";
import { useTheme } from "./ThemeContext";

export interface NovaEmpresaForm {
  name: string;
  cnpj: string;
  segment: string;
  site: string;
  description: string;
  cep: string;
  street: string;
  number: string;
  complement: string;
  district: string;
  city: string;
  state: string;
  contactName: string;
  contactRole: string;
  email: string;
  phone: string;
  whatsapp: string;
  plan: string;
}

interface NovaEmpresaModalProps {
  onClose: () => void;
  onSave: (data: NovaEmpresaForm) => Promise<void> | void;
}

const steps = [
  { id: 1, label: "Dados Básicos", icon: Building2, description: "Informações da empresa" },
  { id: 2, label: "Endereço", icon: MapPin, description: "Localização e sede" },
  { id: 3, label: "Contato", icon: Phone, description: "Responsável e canais" },
  { id: 4, label: "Plano", icon: CreditCard, description: "Escolha o plano" },
  { id: 5, label: "Revisão", icon: CheckCircle2, description: "Confirmar dados" },
];

const segmentos = ["Tecnologia", "Consultoria", "Indústria", "Finanças", "Varejo", "Marketing", "Saúde", "Logística", "Educação", "Outros"];
const estados = ["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"];

const plans = [
  {
    id: "Basic",
    icon: Zap,
    name: "Basic",
    price: "R$ 299",
    period: "/mês",
    description: "Ideal para pequenas empresas que estão começando",
    color: "#94A3B8",
    features: ["Até 20 usuários", "5 contratos ativos", "Relatórios básicos", "Suporte por e-mail"],
  },
  {
    id: "Pro",
    icon: Star,
    name: "Pro",
    price: "R$ 799",
    period: "/mês",
    description: "Para empresas em crescimento que precisam de mais controle",
    color: "#14B8A6",
    badge: "Mais popular",
    features: ["Até 100 usuários", "Contratos ilimitados", "Relatórios avançados", "Integrações via API", "Suporte prioritário"],
  },
  {
    id: "Enterprise",
    icon: Rocket,
    name: "Enterprise",
    price: "Sob consulta",
    period: "",
    description: "Solução completa para grandes operações corporativas",
    color: "#3B82F6",
    features: ["Usuários ilimitados", "Contratos ilimitados", "Dashboard personalizado", "SLA garantido", "Gerente dedicado", "Onboarding completo"],
  },
];

function onlyDigits(value: string, maxLength: number) {
  return value.replace(/\D/g, "").slice(0, maxLength);
}

function maskCnpj(value: string) {
  const digits = onlyDigits(value, 14);

  return digits
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2");
}

function maskCep(value: string) {
  return onlyDigits(value, 8).replace(/^(\d{5})(\d)/, "$1-$2");
}

function maskPhone(value: string) {
  const digits = onlyDigits(value, 11);

  if (digits.length <= 10) {
    return digits
      .replace(/^(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{4})(\d)/, "$1-$2");
  }

  return digits
    .replace(/^(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d)/, "$1-$2");
}

interface ViaCepResponse {
  erro?: boolean;
  logradouro?: string;
  bairro?: string;
  localidade?: string;
  uf?: string;
}

function InputField({ label, placeholder, value, onChange, type = "text", icon: Icon, required, hint, disabled }: {
  label: string; placeholder: string; value: string; onChange: (v: string) => void;
  type?: string; icon?: any; required?: boolean; hint?: string; disabled?: boolean;
}) {
  const { colors } = useTheme();
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <label style={{ fontSize: "13px", color: colors.textSecondary, display: "block", marginBottom: "7px", fontFamily: "'Inter', sans-serif", fontWeight: 500 }}>
        {label}{required && <span style={{ color: "#EF4444", marginLeft: "3px" }}>*</span>}
      </label>
      <div
        className="flex items-center gap-2.5 rounded-xl px-3.5 transition-all duration-200"
        style={{
          background: colors.inputBg,
          border: `1px solid ${focused ? "rgba(59,130,246,0.55)" : colors.border}`,
          boxShadow: focused ? "0 0 0 3px rgba(59,130,246,0.1)" : "none",
          opacity: disabled ? 0.72 : 1,
          height: "44px",
        }}
      >
        {Icon && <Icon size={15} style={{ color: focused ? "#3B82F6" : colors.textMuted }} className="shrink-0" />}
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          disabled={disabled}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          className="form-field-input flex-1 bg-transparent outline-none"
          style={{ fontSize: "14px", color: colors.textPrimary, fontFamily: "'Inter', sans-serif" }}
        />
      </div>
      {hint && <p style={{ fontSize: "11px", color: colors.textMuted, marginTop: "4px", fontFamily: "'Inter', sans-serif" }}>{hint}</p>}
    </div>
  );
}

function SelectField({ label, value, onChange, options, icon: Icon, required, disabled }: {
  label: string; value: string; onChange: (v: string) => void; options: string[];
  icon?: any; required?: boolean; disabled?: boolean;
}) {
  const { colors } = useTheme();
  const [focused, setFocused] = useState(false);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const filtered = options.filter(option => option.toLowerCase().includes(query.toLowerCase()));

  const close = () => {
    window.setTimeout(() => {
      setOpen(false);
      setFocused(false);
      setQuery("");
    }, 120);
  };

  return (
    <div className="relative">
      <label style={{ fontSize: "13px", color: colors.textSecondary, display: "block", marginBottom: "7px", fontFamily: "'Inter', sans-serif", fontWeight: 500 }}>
        {label}{required && <span style={{ color: "#EF4444", marginLeft: "3px" }}>*</span>}
      </label>
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          if (disabled) return;
          setOpen(true);
          setFocused(true);
        }}
        className="w-full flex items-center gap-2.5 rounded-xl px-3.5 transition-all duration-200 text-left"
        style={{
          background: colors.inputBg,
          border: `1px solid ${open || focused ? "rgba(59,130,246,0.55)" : colors.border}`,
          boxShadow: focused ? "0 0 0 3px rgba(59,130,246,0.1)" : "none",
          opacity: disabled ? 0.72 : 1,
          height: "44px",
        }}
      >
        {Icon && <Icon size={15} style={{ color: open || focused ? "#3B82F6" : colors.textMuted }} className="shrink-0" />}
        <span className="flex-1 truncate" style={{ fontSize: "14px", color: value ? colors.textPrimary : colors.textMuted, fontFamily: "'Inter', sans-serif" }}>
          {value || "Selecionar..."}
        </span>
        <ChevronDown size={14} style={{ color: colors.textMuted, transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.18s" }} />
      </button>

      {open && (
        <div
          className="absolute left-0 right-0 z-[70] mt-2 rounded-xl overflow-hidden"
          style={{ background: colors.card, border: `1px solid ${colors.borderStrong}`, boxShadow: "0 18px 50px rgba(0,0,0,0.32)" }}
          onMouseDown={e => e.preventDefault()}
        >
          <div className="flex items-center gap-2 px-3" style={{ height: "42px", borderBottom: `1px solid ${colors.border}`, background: colors.surface }}>
            <Search size={14} style={{ color: colors.textMuted }} />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              onBlur={close}
              autoFocus
              placeholder={`Buscar ${label.toLowerCase()}...`}
              className="form-field-input flex-1 bg-transparent outline-none"
              style={{ fontSize: "13px", color: colors.textPrimary, fontFamily: "'Inter', sans-serif" }}
            />
          </div>
          <div className="max-h-[220px] overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <div className="px-3 py-3" style={{ fontSize: "13px", color: colors.textMuted, fontFamily: "'Inter', sans-serif" }}>
                Nenhum resultado
              </div>
            ) : filtered.map(option => {
              const selected = option === value;
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => {
                    onChange(option);
                    setOpen(false);
                    setFocused(false);
                    setQuery("");
                  }}
                  className="w-full flex items-center justify-between px-3 py-2.5 transition-all text-left"
                  style={{
                    background: selected ? "rgba(59,130,246,0.12)" : "transparent",
                    color: selected ? "#3B82F6" : colors.textSecondary,
                    fontSize: "13px",
                    fontFamily: "'Inter', sans-serif",
                  }}
                  onMouseEnter={e => {
                    if (!selected) e.currentTarget.style.background = colors.hoverBg;
                  }}
                  onMouseLeave={e => {
                    if (!selected) e.currentTarget.style.background = "transparent";
                  }}
                >
                  <span>{option}</span>
                  {selected && <CheckCircle2 size={14} style={{ color: "#3B82F6" }} />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

type ViaCepLockedFields = Partial<Record<"street" | "district" | "city" | "state", boolean>>;

function ReviewRow({ label, value }: { label: string; value: string }) {
  const { colors } = useTheme();
  if (!value) return null;
  return (
    <div className="flex items-start justify-between py-2.5" style={{ borderBottom: `1px solid ${colors.border}` }}>
      <span style={{ fontSize: "12px", color: colors.textMuted, fontFamily: "'Inter', sans-serif", minWidth: "140px" }}>{label}</span>
      <span style={{ fontSize: "13px", color: colors.textPrimary, fontFamily: "'Inter', sans-serif", fontWeight: 500, textAlign: "right" }}>{value}</span>
    </div>
  );
}

export function NovaEmpresaModal({ onClose, onSave }: NovaEmpresaModalProps) {
  const { colors, theme } = useTheme();
  const [currentStep, setCurrentStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState("");
  const [cepLoading, setCepLoading] = useState(false);
  const [cepMessage, setCepMessage] = useState("");
  const [viaCepLockedFields, setViaCepLockedFields] = useState<ViaCepLockedFields>({});

  const [form, setForm] = useState<NovaEmpresaForm>({
    // Step 1
    name: "", cnpj: "", segment: "", site: "", description: "",
    // Step 2
    cep: "", street: "", number: "", complement: "", district: "", city: "", state: "",
    // Step 3
    contactName: "", contactRole: "", email: "", phone: "", whatsapp: "",
    // Step 4
    plan: "",
  });

  const set = (key: string) => (v: string) => setForm(f => ({ ...f, [key]: v }));

  useEffect(() => {
    const cep = onlyDigits(form.cep, 8);

    if (cep.length !== 8) {
      setCepLoading(false);
      setCepMessage("");
      setViaCepLockedFields({});
      return;
    }

    const controller = new AbortController();

    setCepLoading(true);
    setCepMessage("");

    fetch(`https://viacep.com.br/ws/${cep}/json/`, { signal: controller.signal })
      .then(response => {
        if (!response.ok) {
          throw new Error("Não foi possível consultar o CEP.");
        }

        return response.json() as Promise<ViaCepResponse>;
      })
      .then(data => {
        if (data.erro) {
          setCepMessage("CEP não encontrado.");
          setViaCepLockedFields({});
          return;
        }

        const nextLockedFields = {
          street: Boolean(data.logradouro),
          district: Boolean(data.bairro),
          city: Boolean(data.localidade),
          state: Boolean(data.uf),
        };

        setForm(current => ({
          ...current,
          street: data.logradouro || current.street,
          district: data.bairro || current.district,
          city: data.localidade || current.city,
          state: data.uf || current.state,
        }));
        setViaCepLockedFields(nextLockedFields);
        setCepMessage("Endereço preenchido pelo ViaCEP.");
      })
      .catch(error => {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }

        setCepMessage("Não foi possível consultar o CEP.");
        setViaCepLockedFields({});
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setCepLoading(false);
        }
      });

    return () => controller.abort();
  }, [form.cep]);

  const validateStep = () => {
    const e: Record<string, string> = {};
    if (currentStep === 1) {
      if (!form.name) e.name = "Nome obrigatório";
      if (!form.cnpj) e.cnpj = "CNPJ obrigatório";
      if (form.cnpj && onlyDigits(form.cnpj, 14).length !== 14) e.cnpj = "CNPJ deve ter 14 dígitos";
      if (!form.segment) e.segment = "Segmento obrigatório";
    }
    if (currentStep === 3) {
      if (!form.contactName) e.contactName = "Nome do responsável obrigatório";
      if (!form.email) e.email = "E-mail obrigatório";
    }
    if (currentStep === 4) {
      if (!form.plan) e.plan = "Selecione um plano";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => {
    if (!validateStep()) return;
    setCurrentStep(s => Math.min(5, s + 1));
  };

  const back = () => setCurrentStep(s => Math.max(1, s - 1));

  const handleSave = async () => {
    setSaving(true);
    setSubmitError("");

    try {
      await onSave(form);
      setSaving(false);
      setSaved(true);
      window.setTimeout(onClose, 900);
    } catch (error) {
      setSaving(false);
      setSubmitError(error instanceof Error ? error.message : "Não foi possível cadastrar a empresa.");
    }
  };

  const selectedPlan = plans.find(p => p.id === form.plan);

  return (
    <div
      className={`form-shell-${theme} fixed inset-0 z-50 flex`}
      style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(8px)" }}
    >
      <div
        className="flex flex-col w-full h-full"
        style={{ background: colors.bg, fontFamily: "'Inter', sans-serif" }}
      >
        {/* Top bar */}
        <div
          className="flex items-center justify-between px-8 shrink-0"
          style={{
            height: "68px",
            background: colors.navBg,
            backdropFilter: "blur(20px)",
            borderBottom: `1px solid ${colors.border}`,
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="flex items-center justify-center rounded-xl"
              style={{ width: "34px", height: "34px", background: "linear-gradient(135deg, #3B82F6, #14B8A6)" }}
            >
              <Building2 size={16} color="#fff" />
            </div>
            <div>
              <h2 style={{ fontFamily: "'Playfair Display', serif", color: colors.textPrimary, fontSize: "17px", fontWeight: 600 }}>
                Cadastrar Nova Empresa
              </h2>
              <p style={{ fontSize: "12px", color: colors.textMuted }}>
                Preencha os dados nos {steps.length} passos abaixo
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex items-center gap-2 rounded-xl px-3 py-2 transition-all"
            style={{ color: colors.textSecondary, background: colors.surface, border: `1px solid ${colors.border}` }}
            onMouseEnter={e => (e.currentTarget.style.background = colors.hoverBg)}
            onMouseLeave={e => (e.currentTarget.style.background = colors.surface)}
          >
            <X size={15} />
            <span style={{ fontSize: "13px" }}>Fechar</span>
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Left steps panel */}
          <div
            className="hidden md:flex flex-col w-[280px] shrink-0 p-6 gap-2"
            style={{ background: colors.sidebarBg, borderRight: `1px solid ${colors.border}` }}
          >
            <p style={{ fontSize: "11px", color: colors.textMuted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "8px" }}>
              Progresso
            </p>

            {/* Progress bar */}
            <div className="rounded-full overflow-hidden mb-4" style={{ height: "4px", background: colors.surface }}>
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`, background: "linear-gradient(90deg, #3B82F6, #14B8A6)" }}
              />
            </div>

            {steps.map((step) => {
              const isActive = currentStep === step.id;
              const isDone = currentStep > step.id;
              return (
                <button
                  key={step.id}
                  onClick={() => isDone && setCurrentStep(step.id)}
                  className="flex items-center gap-3 rounded-xl p-3 text-left transition-all duration-200"
                  style={{
                    background: isActive
                      ? theme === "dark"
                        ? "linear-gradient(135deg, rgba(59,130,246,0.15), rgba(20,184,166,0.08))"
                        : "rgba(59,130,246,0.08)"
                      : "transparent",
                    borderLeft: isActive ? "2px solid #3B82F6" : "2px solid transparent",
                    cursor: isDone ? "pointer" : "default",
                  }}
                >
                  <div
                    className="rounded-xl flex items-center justify-center shrink-0 transition-all duration-200"
                    style={{
                      width: "34px", height: "34px",
                      background: isDone
                        ? "linear-gradient(135deg, #3B82F6, #14B8A6)"
                        : isActive
                          ? "rgba(59,130,246,0.15)"
                          : colors.surface,
                      border: isActive ? "1px solid rgba(59,130,246,0.4)" : `1px solid ${colors.border}`,
                    }}
                  >
                    {isDone
                      ? <CheckCircle2 size={16} color="#fff" />
                      : <step.icon size={15} style={{ color: isActive ? "#3B82F6" : colors.textMuted }} />
                    }
                  </div>
                  <div>
                    <p style={{ fontSize: "13px", color: isActive ? colors.textPrimary : isDone ? colors.textSecondary : colors.textMuted, fontWeight: isActive ? 600 : 400 }}>
                      {step.label}
                    </p>
                    <p style={{ fontSize: "11px", color: colors.textMuted }}>{step.description}</p>
                  </div>
                </button>
              );
            })}

            {/* Tips */}
            <div
              className="mt-auto rounded-xl p-4"
              style={{ background: colors.blueFaint, border: `1px solid rgba(59,130,246,0.15)` }}
            >
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle size={13} style={{ color: "#3B82F6" }} />
                <span style={{ fontSize: "12px", color: "#3B82F6", fontWeight: 600 }}>Dica</span>
              </div>
              <p style={{ fontSize: "12px", color: colors.textSecondary, lineHeight: 1.5 }}>
                {currentStep === 1 && "O CNPJ deve estar no formato 00.000.000/0000-00 e será validado automaticamente."}
                {currentStep === 2 && "Preencha o CEP para buscar o endereço automaticamente."}
                {currentStep === 3 && "O responsável receberá as credenciais de acesso por e-mail após o cadastro."}
                {currentStep === 4 && "Você pode alterar o plano a qualquer momento nas configurações da empresa."}
                {currentStep === 5 && "Revise todos os dados antes de confirmar o cadastro."}
              </p>
            </div>
          </div>

          {/* Main content */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto px-8 py-8">
              <div className="max-w-[680px] mx-auto">
                {/* Step header */}
                <div className="mb-8">
                  <div className="flex items-center gap-2 mb-1">
                    <span style={{ fontSize: "12px", color: "#3B82F6", fontFamily: "'Inter', sans-serif", fontWeight: 500 }}>
                      Passo {currentStep} de {steps.length}
                    </span>
                  </div>
                  <h3 style={{ fontFamily: "'Playfair Display', serif", color: colors.textPrimary, fontSize: "22px", fontWeight: 600 }}>
                    {steps[currentStep - 1].label}
                  </h3>
                  <p style={{ fontSize: "14px", color: colors.textMuted, marginTop: "4px" }}>
                    {steps[currentStep - 1].description}
                  </p>
                </div>

                {/* ── STEP 1: Dados Básicos ── */}
                {currentStep === 1 && (
                  <div className="space-y-5">
                    <InputField label="Razão Social" placeholder="Alpha Tecnologia Ltda." value={form.name} onChange={set("name")} icon={Building2} required />
                    {errors.name && <p style={{ fontSize: "12px", color: "#EF4444", marginTop: "-12px" }}>{errors.name}</p>}

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <InputField label="CNPJ" placeholder="00.000.000/0000-00" value={form.cnpj} onChange={(value) => set("cnpj")(maskCnpj(value))} icon={Hash} required hint="Somente números ou com pontuação" />
                        {errors.cnpj && <p style={{ fontSize: "12px", color: "#EF4444", marginTop: "2px" }}>{errors.cnpj}</p>}
                      </div>
                      <div>
                        <SelectField label="Segmento" value={form.segment} onChange={set("segment")} options={segmentos} icon={Briefcase} required />
                        {errors.segment && <p style={{ fontSize: "12px", color: "#EF4444", marginTop: "2px" }}>{errors.segment}</p>}
                      </div>
                    </div>

                    <InputField label="Site" placeholder="https://empresa.com.br" value={form.site} onChange={set("site")} icon={Globe} />

                    <div>
                      <label style={{ fontSize: "13px", color: colors.textSecondary, display: "block", marginBottom: "7px", fontFamily: "'Inter', sans-serif", fontWeight: 500 }}>
                        Descrição / Observações
                      </label>
                      <textarea
                        value={form.description}
                        onChange={e => set("description")(e.target.value)}
                        placeholder="Descreva brevemente a empresa, seu porte, mercado de atuação..."
                        rows={4}
                        className="form-field-input w-full rounded-xl px-4 py-3 outline-none resize-none transition-all duration-200"
                        style={{
                          background: colors.inputBg,
                          border: `1px solid ${colors.border}`,
                          color: colors.textPrimary,
                          fontSize: "14px",
                          fontFamily: "'Inter', sans-serif",
                          lineHeight: 1.6,
                        }}
                        onFocus={e => (e.target.style.border = "1px solid rgba(59,130,246,0.55)")}
                        onBlur={e => (e.target.style.border = `1px solid ${colors.border}`)}
                      />
                    </div>
                  </div>
                )}

                {/* ── STEP 2: Endereço ── */}
                {currentStep === 2 && (
                  <div className="space-y-5">
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <InputField
                          label="CEP"
                          placeholder="00000-000"
                          value={form.cep}
                          onChange={(value) => set("cep")(maskCep(value))}
                          icon={MapPin}
                          hint={cepLoading ? "Consultando ViaCEP..." : cepMessage}
                        />
                      </div>
                      <div className="col-span-2">
                        <InputField label="Logradouro" placeholder="Rua, Avenida, Travessa..." value={form.street} onChange={set("street")} disabled={viaCepLockedFields.street} />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <InputField label="Número" placeholder="123" value={form.number} onChange={set("number")} />
                      <div className="col-span-2">
                        <InputField label="Complemento" placeholder="Sala 4, Bloco B..." value={form.complement} onChange={set("complement")} />
                      </div>
                    </div>
                    <InputField label="Bairro" placeholder="Centro" value={form.district} onChange={set("district")} disabled={viaCepLockedFields.district} />
                    <div className="grid grid-cols-3 gap-4">
                      <div className="col-span-2">
                        <InputField label="Cidade" placeholder="São Paulo" value={form.city} onChange={set("city")} disabled={viaCepLockedFields.city} />
                      </div>
                      <SelectField label="Estado" value={form.state} onChange={set("state")} options={estados} disabled={viaCepLockedFields.state} />
                    </div>
                  </div>
                )}

                {/* ── STEP 3: Contato ── */}
                {currentStep === 3 && (
                  <div className="space-y-5">
                    <div
                      className="rounded-xl p-4 flex items-start gap-3"
                      style={{ background: colors.blueFaint, border: `1px solid rgba(59,130,246,0.15)` }}
                    >
                      <AlertCircle size={15} style={{ color: "#3B82F6", marginTop: "1px" }} className="shrink-0" />
                      <p style={{ fontSize: "13px", color: colors.textSecondary, lineHeight: 1.5 }}>
                        O responsável cadastrado receberá um convite por e-mail para acessar a plataforma com permissão de Administrador da empresa.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <InputField label="Nome do Responsável" placeholder="João da Silva" value={form.contactName} onChange={set("contactName")} icon={User} required />
                        {errors.contactName && <p style={{ fontSize: "12px", color: "#EF4444", marginTop: "2px" }}>{errors.contactName}</p>}
                      </div>
                      <InputField label="Cargo / Função" placeholder="CEO, Diretor, Gerente..." value={form.contactRole} onChange={set("contactRole")} icon={Briefcase} />
                    </div>

                    <div>
                      <InputField label="E-mail Corporativo" placeholder="joao@empresa.com.br" value={form.email} onChange={set("email")} icon={Mail} type="email" required />
                      {errors.email && <p style={{ fontSize: "12px", color: "#EF4444", marginTop: "2px" }}>{errors.email}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <InputField label="Telefone" placeholder="(11) 3456-7890" value={form.phone} onChange={(value) => set("phone")(maskPhone(value))} icon={Phone} type="tel" />
                      <InputField label="WhatsApp" placeholder="(11) 9 8765-4321" value={form.whatsapp} onChange={(value) => set("whatsapp")(maskPhone(value))} icon={Phone} type="tel" />
                    </div>
                  </div>
                )}

                {/* ── STEP 4: Plano ── */}
                {currentStep === 4 && (
                  <div className="space-y-4">
                    {errors.plan && (
                      <div className="rounded-xl px-4 py-3 flex items-center gap-2" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
                        <AlertCircle size={14} style={{ color: "#EF4444" }} />
                        <span style={{ fontSize: "13px", color: "#EF4444" }}>{errors.plan}</span>
                      </div>
                    )}
                    {plans.map((plan) => {
                      const isSelected = form.plan === plan.id;
                      return (
                        <button
                          key={plan.id}
                          onClick={() => set("plan")(plan.id)}
                          className="w-full text-left rounded-2xl p-5 transition-all duration-200"
                          style={{
                            background: isSelected
                              ? theme === "dark"
                                ? `linear-gradient(135deg, ${plan.color}18, ${plan.color}08)`
                                : `${plan.color}08`
                              : colors.card,
                            border: `2px solid ${isSelected ? plan.color : colors.border}`,
                            boxShadow: isSelected ? `0 0 0 1px ${plan.color}30, 0 4px 20px ${plan.color}15` : "none",
                          }}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <div
                                className="rounded-xl flex items-center justify-center shrink-0"
                                style={{ width: "42px", height: "42px", background: `${plan.color}18` }}
                              >
                                <plan.icon size={20} style={{ color: plan.color }} />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span style={{ fontSize: "16px", color: colors.textPrimary, fontFamily: "'Playfair Display', serif", fontWeight: 600 }}>
                                    {plan.name}
                                  </span>
                                  {plan.badge && (
                                    <span
                                      className="rounded-full px-2 py-0.5"
                                      style={{ fontSize: "10px", color: plan.color, background: `${plan.color}20`, fontFamily: "'Inter', sans-serif", fontWeight: 600 }}
                                    >
                                      {plan.badge}
                                    </span>
                                  )}
                                </div>
                                <p style={{ fontSize: "13px", color: colors.textMuted, marginTop: "2px" }}>{plan.description}</p>
                              </div>
                            </div>
                            <div className="text-right shrink-0 ml-4">
                              <span style={{ fontSize: "22px", color: colors.textPrimary, fontFamily: "'Inter', sans-serif", fontWeight: 700 }}>{plan.price}</span>
                              <span style={{ fontSize: "12px", color: colors.textMuted }}>{plan.period}</span>
                              <div
                                className="mt-2 rounded-full flex items-center justify-center mx-auto"
                                style={{
                                  width: "22px", height: "22px",
                                  background: isSelected ? plan.color : colors.surface,
                                  border: `2px solid ${isSelected ? plan.color : colors.border}`,
                                  transition: "all 0.2s",
                                }}
                              >
                                {isSelected && <div className="rounded-full" style={{ width: "8px", height: "8px", background: "#fff" }} />}
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-4">
                            {plan.features.map(f => (
                              <span key={f} className="flex items-center gap-1.5" style={{ fontSize: "12px", color: isSelected ? colors.textSecondary : colors.textMuted }}>
                                <CheckCircle2 size={11} style={{ color: isSelected ? plan.color : colors.textMuted }} /> {f}
                              </span>
                            ))}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* ── STEP 5: Revisão ── */}
                {currentStep === 5 && !saved && (
                  <div className="space-y-6">
                    {[
                      {
                        title: "Dados Básicos",
                        icon: Building2,
                        rows: [
                          { label: "Razão Social", value: form.name },
                          { label: "CNPJ", value: form.cnpj },
                          { label: "Segmento", value: form.segment },
                          { label: "Site", value: form.site },
                          { label: "Descrição", value: form.description },
                        ],
                      },
                      {
                        title: "Endereço",
                        icon: MapPin,
                        rows: [
                          { label: "Logradouro", value: [form.street, form.number, form.complement].filter(Boolean).join(", ") },
                          { label: "Bairro", value: form.district },
                          { label: "Cidade / Estado", value: [form.city, form.state].filter(Boolean).join(" — ") },
                          { label: "CEP", value: form.cep },
                        ],
                      },
                      {
                        title: "Contato",
                        icon: Phone,
                        rows: [
                          { label: "Responsável", value: form.contactName },
                          { label: "Cargo", value: form.contactRole },
                          { label: "E-mail", value: form.email },
                          { label: "Telefone", value: form.phone },
                          { label: "WhatsApp", value: form.whatsapp },
                        ],
                      },
                    ].map((section) => (
                      <div key={section.title} className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${colors.border}` }}>
                        <div
                          className="flex items-center gap-2 px-5 py-3"
                          style={{ background: theme === "light" ? colors.surface : "rgba(255,255,255,0.02)", borderBottom: `1px solid ${colors.border}` }}
                        >
                          <section.icon size={14} style={{ color: "#3B82F6" }} />
                          <span style={{ fontSize: "12px", color: colors.textPrimary, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                            {section.title}
                          </span>
                        </div>
                        <div className="px-5">
                          {section.rows.map(r => <ReviewRow key={r.label} label={r.label} value={r.value} />)}
                        </div>
                      </div>
                    ))}

                    {/* Plan summary */}
                    {selectedPlan && (
                      <div
                        className="rounded-2xl p-5 flex items-center gap-4"
                        style={{ background: `${selectedPlan.color}10`, border: `1px solid ${selectedPlan.color}30` }}
                      >
                        <div className="rounded-xl flex items-center justify-center shrink-0" style={{ width: "44px", height: "44px", background: `${selectedPlan.color}20` }}>
                          <selectedPlan.icon size={20} style={{ color: selectedPlan.color }} />
                        </div>
                        <div>
                          <p style={{ fontSize: "14px", color: colors.textPrimary, fontWeight: 600 }}>Plano {selectedPlan.name}</p>
                          <p style={{ fontSize: "13px", color: colors.textMuted, marginTop: "2px" }}>
                            {selectedPlan.price}{selectedPlan.period} — {selectedPlan.description}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Success state */}
                {saved && (
                  <div className="flex flex-col items-center justify-center py-12 gap-5">
                    <div
                      className="rounded-full flex items-center justify-center"
                      style={{ width: "72px", height: "72px", background: "rgba(16,185,129,0.12)" }}
                    >
                      <CheckCircle2 size={36} style={{ color: "#10B981" }} />
                    </div>
                    <h3 style={{ fontFamily: "'Playfair Display', serif", color: colors.textPrimary, fontSize: "22px", fontWeight: 600 }}>
                      Empresa cadastrada!
                    </h3>
                    <p style={{ fontSize: "14px", color: colors.textMuted, textAlign: "center", maxWidth: "320px" }}>
                      <strong style={{ color: colors.textPrimary }}>{form.name}</strong> foi cadastrada com sucesso. O responsável receberá um convite por e-mail.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Footer actions */}
            {!saved && (
              <div
                className="flex items-center justify-between px-8 py-5 shrink-0"
                style={{ borderTop: `1px solid ${colors.border}`, background: colors.navBg, backdropFilter: "blur(20px)" }}
              >
                <button
                  onClick={back}
                  disabled={currentStep === 1}
                  className="flex items-center gap-2 rounded-xl px-5 py-2.5 transition-all disabled:opacity-30"
                  style={{ color: colors.textSecondary, background: colors.surface, border: `1px solid ${colors.border}`, fontSize: "14px", fontFamily: "'Inter', sans-serif" }}
                  onMouseEnter={e => !e.currentTarget.disabled && (e.currentTarget.style.background = colors.hoverBg)}
                  onMouseLeave={e => (e.currentTarget.style.background = colors.surface)}
                >
                  <ChevronLeft size={15} /> Voltar
                </button>

                {/* Step dots (mobile) */}
                <div className="flex items-center gap-1.5 md:hidden">
                  {steps.map(s => (
                    <div
                      key={s.id}
                      className="rounded-full transition-all"
                      style={{ width: currentStep === s.id ? "20px" : "6px", height: "6px", background: currentStep >= s.id ? "#3B82F6" : colors.border }}
                    />
                  ))}
                </div>

                <div className="hidden md:flex items-center gap-3">
                  <span style={{ fontSize: "13px", color: submitError ? "#EF4444" : colors.textMuted }}>
                    {submitError || (
                      currentStep < 5 ? `${5 - currentStep} passo${5 - currentStep > 1 ? "s" : ""} restante${5 - currentStep > 1 ? "s" : ""}` : "Pronto para cadastrar"
                    )}
                  </span>
                </div>

                <div className="flex md:hidden items-center gap-3">
                  <span style={{ fontSize: "12px", color: submitError ? "#EF4444" : colors.textMuted }}>
                    {submitError}
                  </span>
                </div>

                {currentStep < 5 ? (
                  <button
                    onClick={next}
                    className="flex items-center gap-2 rounded-xl px-5 py-2.5 transition-all hover:opacity-90"
                    style={{ background: "linear-gradient(135deg, #3B82F6, #2563EB)", color: "#fff", fontSize: "14px", fontFamily: "'Inter', sans-serif", fontWeight: 500, boxShadow: "0 4px 16px rgba(59,130,246,0.3)" }}
                  >
                    Próximo <ChevronRight size={15} />
                  </button>
                ) : (
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 rounded-xl px-6 py-2.5 transition-all hover:opacity-90 disabled:opacity-70"
                    style={{ background: saving ? colors.surface : "linear-gradient(135deg, #10B981, #059669)", color: saving ? colors.textSecondary : "#fff", fontSize: "14px", fontFamily: "'Inter', sans-serif", fontWeight: 500, border: saving ? `1px solid ${colors.border}` : "none", boxShadow: saving ? "none" : "0 4px 16px rgba(16,185,129,0.3)" }}
                  >
                    {saving ? (
                      <>
                        <span className="rounded-full border-2 animate-spin" style={{ width: "14px", height: "14px", borderColor: "rgba(59,130,246,0.2)", borderTopColor: "#3B82F6" }} />
                        Cadastrando...
                      </>
                    ) : (
                      <><CheckCircle2 size={15} /> Cadastrar Empresa</>
                    )}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
