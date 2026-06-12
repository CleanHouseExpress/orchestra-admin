import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import {
  AlertCircle, ArrowLeft, Briefcase, Building2, CheckCircle2, ChevronDown,
  ChevronLeft, ChevronRight, CreditCard, DollarSign, Globe, Hash, Mail,
  MapPin, Phone, Save, Search, User, X,
} from "lucide-react";
import { CompanyPayload, companiesApi, isCompanyAdminUser } from "../services/companiesApi";
import { mapCompany, statusToApi } from "./companyView";
import { useTheme } from "./ThemeContext";

const steps = [
  { id: 1, label: "Dados Básicos", icon: Building2, description: "Informações da empresa" },
  { id: 2, label: "Endereço", icon: MapPin, description: "Localização e sede" },
  { id: 3, label: "Contato", icon: Phone, description: "Canais de atendimento" },
  { id: 4, label: "Plano", icon: CreditCard, description: "Plano e receita" },
];

const segmentos = ["Tecnologia", "Consultoria", "Indústria", "Finanças", "Varejo", "Marketing", "Saúde", "Logística", "Educação", "Outros"];
const estados = ["AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO"];
const planos = ["Basic", "Pro", "Enterprise"];
const statusOptions = [
  { label: "Ativo", value: "ativo" },
  { label: "Pendente", value: "pendente" },
  { label: "Inativo", value: "inativo" },
];

const onlyDigits = (value: string) => value.replace(/\D/g, "");
const maskCnpj = (value: string) => onlyDigits(value).slice(0, 14).replace(/^(\d{2})(\d)/, "$1.$2").replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3").replace(/\.(\d{3})(\d)/, ".$1/$2").replace(/(\d{4})(\d)/, "$1-$2");
const maskPhone = (value: string) => {
  const digits = onlyDigits(value).slice(0, 11);
  if (digits.length <= 10) return digits.replace(/^(\d{2})(\d)/, "($1) $2").replace(/(\d{4})(\d)/, "$1-$2");
  return digits.replace(/^(\d{2})(\d)/, "($1) $2").replace(/(\d{5})(\d)/, "$1-$2");
};
const maskCep = (value: string) => onlyDigits(value).slice(0, 8).replace(/^(\d{5})(\d)/, "$1-$2");

type FormState = {
  name: string;
  cnpj: string;
  segment: string;
  site: string;
  description: string;
  status: string;
  cep: string;
  street: string;
  number: string;
  complement: string;
  district: string;
  city: string;
  state: string;
  email: string;
  phone: string;
  whatsapp: string;
  adminName: string;
  adminEmail: string;
  contactRole: string;
  plan: string;
  revenue: string;
};

function InputField({ label, value, onChange, icon: Icon, type = "text", required, error, disabled, placeholder }: any) {
  const { colors } = useTheme();
  const [focused, setFocused] = useState(false);

  return (
    <div>
      <label style={{ fontSize: 13, color: colors.textSecondary, display: "block", marginBottom: 7, fontWeight: 500 }}>
        {label}{required && <span style={{ color: "#EF4444", marginLeft: 3 }}>*</span>}
      </label>
      <div className="flex items-center gap-2.5 rounded-xl px-3.5 transition-all duration-200" style={{ background: disabled ? colors.surface : colors.inputBg, border: `1px solid ${focused ? "rgba(99,102,241,0.55)" : error ? "#EF4444" : colors.border}`, boxShadow: focused ? "0 0 0 3px rgba(99,102,241,0.1)" : "none", height: 44 }}>
        {Icon && <Icon size={15} style={{ color: focused ? "#6366F1" : colors.textMuted }} className="shrink-0" />}
        <input type={type} value={value} disabled={disabled} onChange={(e) => onChange(e.target.value)} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} placeholder={placeholder} className="form-field-input flex-1 bg-transparent outline-none disabled:cursor-not-allowed" style={{ fontSize: 14, color: colors.textPrimary }} />
      </div>
      {error && <p style={{ fontSize: 12, color: "#EF4444", marginTop: 5 }}>{error}</p>}
    </div>
  );
}

function SearchableSelect({ label, value, onChange, options, icon: Icon, required }: any) {
  const { colors } = useTheme();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => options.filter((option: string) => option.toLowerCase().includes(query.toLowerCase())), [options, query]);

  return (
    <div className="relative">
      <label style={{ fontSize: 13, color: colors.textSecondary, display: "block", marginBottom: 7, fontWeight: 500 }}>
        {label}{required && <span style={{ color: "#EF4444", marginLeft: 3 }}>*</span>}
      </label>
      <button type="button" onClick={() => setOpen((next) => !next)} className="flex items-center gap-2.5 rounded-xl px-3.5 w-full transition-all duration-200" style={{ background: colors.inputBg, border: `1px solid ${open ? "rgba(99,102,241,0.55)" : colors.border}`, boxShadow: open ? "0 0 0 3px rgba(99,102,241,0.1)" : "none", height: 44 }}>
        {Icon && <Icon size={15} style={{ color: open ? "#6366F1" : colors.textMuted }} className="shrink-0" />}
        <span className="flex-1 text-left" style={{ fontSize: 14, color: value ? colors.textPrimary : colors.textMuted }}>{value || "Selecionar..."}</span>
        <ChevronDown size={15} style={{ color: colors.textMuted }} />
      </button>
      {open && (
        <div className="absolute z-40 mt-2 w-full rounded-xl overflow-hidden" style={{ background: colors.card, border: `1px solid ${colors.borderStrong}`, boxShadow: "0 18px 48px rgba(0,0,0,0.28)" }}>
          <div className="flex items-center gap-2 px-3 py-2" style={{ borderBottom: `1px solid ${colors.border}` }}>
            <Search size={14} style={{ color: colors.textMuted }} />
            <input autoFocus value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Pesquisar..." className="form-field-input flex-1 bg-transparent outline-none" style={{ fontSize: 13, color: colors.textPrimary }} />
          </div>
          <div className="max-h-[190px] overflow-y-auto py-1">
            {filtered.length ? filtered.map((option: string) => (
              <button key={option} type="button" onClick={() => { onChange(option); setOpen(false); setQuery(""); }} className="w-full text-left px-3 py-2 transition-colors" style={{ fontSize: 13, color: option === value ? "#6366F1" : colors.textSecondary, background: option === value ? "rgba(99,102,241,0.1)" : "transparent" }}>
                {option}
              </button>
            )) : <p className="px-3 py-3" style={{ fontSize: 12, color: colors.textMuted }}>Nenhuma opção encontrada.</p>}
          </div>
        </div>
      )}
    </div>
  );
}

export function EmpresaEditar() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { colors, theme } = useTheme();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState<FormState>({
    name: "", cnpj: "", segment: "", site: "", description: "", status: "ativo",
    cep: "", street: "", number: "", complement: "", district: "", city: "", state: "",
    email: "", phone: "", whatsapp: "", adminName: "", adminEmail: "", contactRole: "",
    plan: "", revenue: "",
  });

  const set = (key: keyof FormState) => (value: string) => setForm((current) => ({ ...current, [key]: value }));

  useEffect(() => {
    const companyId = Number(id);
    let active = true;
    setLoading(true);
    setLoadError(null);

    companiesApi.show(companyId)
      .then((data) => {
        if (!active) return;
        const company = mapCompany(data);
        const admin = data.users?.find(isCompanyAdminUser);
        setForm({
          name: data.name ?? "",
          cnpj: data.cnpj ?? data.document ?? "",
          segment: data.segment ?? "",
          site: data.site ?? "",
          description: data.description ?? "",
          status: company.status,
          cep: data.cep ?? data.address?.postal_code ?? "",
          street: data.street ?? data.address?.street ?? "",
          number: data.number ?? data.address?.number ?? "",
          complement: data.complement ?? data.address?.complement ?? "",
          district: data.district ?? data.address?.district ?? "",
          city: data.city ?? "",
          state: data.state ?? "",
          email: data.email ?? "",
          phone: data.phone ?? "",
          whatsapp: data.whatsapp ?? "",
          adminName: admin?.name ?? "",
          adminEmail: admin?.email ?? data.email ?? "",
          contactRole: data.contact_role ?? "",
          plan: data.plan ?? "",
          revenue: data.revenue ? String(data.revenue) : "",
        });
      })
      .catch((err: Error) => active && setLoadError(err.message || "Não foi possível carregar a empresa."))
      .finally(() => active && setLoading(false));

    return () => { active = false; };
  }, [id]);

  const validateStep = () => {
    const nextErrors: Record<string, string> = {};
    if (currentStep === 1) {
      if (!form.name.trim()) nextErrors.name = "Nome obrigatório";
      if (!form.cnpj.trim()) nextErrors.cnpj = "CNPJ obrigatório";
    }
    if (currentStep === 3 && form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      nextErrors.email = "E-mail inválido";
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const next = () => { if (validateStep()) setCurrentStep((step) => Math.min(steps.length, step + 1)); };
  const back = () => setCurrentStep((step) => Math.max(1, step - 1));

  const handleSave = async () => {
    if (!validateStep()) return;
    const companyId = Number(id);
    const payload: CompanyPayload = {
      name: form.name,
      cnpj: form.cnpj,
      document: form.cnpj,
      description: form.description || null,
      email: form.email || null,
      phone: form.phone || null,
      whatsapp: form.whatsapp || null,
      contactName: form.adminName || null,
      contactRole: form.contactRole || null,
      status: statusToApi(form.status),
      segment: form.segment || null,
      plan: form.plan || null,
      cep: form.cep || null,
      street: form.street || null,
      number: form.number || null,
      complement: form.complement || null,
      district: form.district || null,
      city: form.city || null,
      state: form.state || null,
      site: form.site || null,
      revenue: form.revenue ? Number(form.revenue) : 0,
    };

    setSaving(true);
    setErrors({});

    try {
      await companiesApi.update(companyId, payload);
      if (form.adminName.trim() && form.adminEmail.trim()) {
        await companiesApi.saveAdmin(companyId, { name: form.adminName, email: form.adminEmail });
      }
      setSaved(true);
      window.setTimeout(() => navigate(`/empresas/${companyId}`), 900);
    } catch (err) {
      setErrors({ submit: err instanceof Error ? err.message : "Não foi possível salvar as alterações." });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <div className="rounded-2xl p-5" style={{ background: colors.card, border: `1px solid ${colors.border}` }}>
          <div className="rounded-full mb-4" style={{ width: 220, height: 18, background: colors.hoverBg }} />
          <div className="rounded-full" style={{ width: "70%", height: 34, background: colors.hoverBg }} />
        </div>
        <div className="rounded-2xl p-8" style={{ background: colors.card, border: `1px solid ${colors.border}` }}>
          {Array.from({ length: 5 }).map((_, index) => <div key={index} className="rounded-full mb-4" style={{ width: `${85 - index * 8}%`, height: 44, background: colors.hoverBg }} />)}
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="rounded-2xl p-6 max-w-[520px] text-center" style={{ background: colors.card, border: `1px solid ${colors.border}` }}>
          <AlertCircle size={32} style={{ color: "#EF4444", margin: "0 auto 12px" }} />
          <p style={{ color: colors.textPrimary, fontSize: 15 }}>{loadError}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden" style={{ background: colors.bg }}>
      <div className="flex items-center justify-between px-6 shrink-0" style={{ height: 64, borderBottom: `1px solid ${colors.border}`, background: colors.navBg }}>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(`/empresas/${id}`)} className="flex items-center gap-2 rounded-xl px-3 py-2 transition-all" style={{ color: colors.textSecondary, background: colors.surface, border: `1px solid ${colors.border}`, fontSize: 13 }}>
            <ArrowLeft size={14} /> Voltar
          </button>
          <span style={{ color: colors.textMuted }}>/</span>
          <span style={{ fontSize: 14, color: colors.textPrimary, fontWeight: 500 }}>{form.name}</span>
          <span style={{ color: colors.textMuted }}>/</span>
          <span style={{ fontSize: 14, color: "#6366F1", fontWeight: 500 }}>Editar</span>
        </div>
        <span className="hidden sm:flex items-center gap-1.5 rounded-full px-3 py-1" style={{ fontSize: 12, color: saved ? "#10B981" : "#F59E0B", background: saved ? "rgba(16,185,129,0.1)" : "rgba(245,158,11,0.1)" }}>
          {saved ? <CheckCircle2 size={13} /> : <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#F59E0B" }} />}
          {saved ? "Salvo" : "Alterações não salvas"}
        </span>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="hidden md:flex flex-col w-[260px] shrink-0 p-5 gap-2" style={{ background: colors.sidebarBg, borderRight: `1px solid ${colors.border}` }}>
          <p style={{ fontSize: 11, color: colors.textMuted, textTransform: "uppercase", marginBottom: 4 }}>Seções</p>
          <div className="rounded-full overflow-hidden mb-3" style={{ height: 3, background: colors.surface }}>
            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${(currentStep / steps.length) * 100}%`, background: "linear-gradient(90deg, #6366F1, #8B5CF6)" }} />
          </div>
          {steps.map((step) => {
            const isActive = currentStep === step.id;
            const isDone = currentStep > step.id;
            return (
              <button key={step.id} onClick={() => setCurrentStep(step.id)} className="flex items-center gap-3 rounded-xl p-3 text-left transition-all duration-200" style={{ background: isActive ? (theme === "dark" ? "rgba(99,102,241,0.15)" : "rgba(99,102,241,0.08)") : "transparent", borderLeft: isActive ? "2px solid #6366F1" : "2px solid transparent" }}>
                <div className="rounded-xl flex items-center justify-center shrink-0" style={{ width: 32, height: 32, background: isDone ? "linear-gradient(135deg, #6366F1, #8B5CF6)" : isActive ? "rgba(99,102,241,0.15)" : colors.surface, border: `1px solid ${isActive ? "rgba(99,102,241,0.4)" : colors.border}` }}>
                  {isDone ? <CheckCircle2 size={14} color="#fff" /> : <step.icon size={13} style={{ color: isActive ? "#6366F1" : colors.textMuted }} />}
                </div>
                <div>
                  <p style={{ fontSize: 13, color: isActive ? colors.textPrimary : colors.textMuted, fontWeight: isActive ? 600 : 400 }}>{step.label}</p>
                  <p style={{ fontSize: 11, color: colors.textMuted }}>{step.description}</p>
                </div>
              </button>
            );
          })}
        </div>

        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto px-6 md:px-8 py-8">
            <div className="max-w-[680px] mx-auto">
              <div className="mb-8">
                <span style={{ fontSize: 12, color: "#6366F1", fontWeight: 500 }}>Editando · Passo {currentStep} de {steps.length}</span>
                <h3 style={{ fontFamily: "'Playfair Display',serif", color: colors.textPrimary, fontSize: 22, fontWeight: 600, marginTop: 4 }}>{steps[currentStep - 1].label}</h3>
                <p style={{ fontSize: 14, color: colors.textMuted, marginTop: 3 }}>{steps[currentStep - 1].description}</p>
              </div>

              {currentStep === 1 && (
                <div className="space-y-5">
                  <InputField label="Razão Social" value={form.name} onChange={set("name")} icon={Building2} required error={errors.name} />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <InputField label="CNPJ" value={form.cnpj} onChange={(value: string) => set("cnpj")(maskCnpj(value))} icon={Hash} required error={errors.cnpj} />
                    <SearchableSelect label="Segmento" value={form.segment} onChange={set("segment")} options={segmentos} icon={Briefcase} required />
                  </div>
                  <SearchableSelect label="Status" value={statusOptions.find((item) => item.value === form.status)?.label ?? form.status} onChange={(label: string) => set("status")(statusOptions.find((item) => item.label === label)?.value ?? label)} options={statusOptions.map((item) => item.label)} icon={CheckCircle2} />
                  <InputField label="Site" value={form.site} onChange={set("site")} icon={Globe} placeholder="https://empresa.com.br" />
                  <div>
                    <label style={{ fontSize: 13, color: colors.textSecondary, display: "block", marginBottom: 7, fontWeight: 500 }}>Descrição</label>
                    <textarea
                      value={form.description}
                      onChange={(event) => set("description")(event.target.value)}
                      rows={4}
                      className="form-field-input w-full rounded-xl px-4 py-3 outline-none resize-none"
                      style={{ background: colors.inputBg, border: `1px solid ${colors.border}`, color: colors.textPrimary, fontSize: 14 }}
                    />
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <InputField label="CEP" value={form.cep} onChange={(value: string) => set("cep")(maskCep(value))} icon={MapPin} />
                    <div className="sm:col-span-2"><InputField label="Logradouro" value={form.street} onChange={set("street")} /></div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <InputField label="Número" value={form.number} onChange={set("number")} />
                    <div className="sm:col-span-2"><InputField label="Complemento" value={form.complement} onChange={set("complement")} /></div>
                  </div>
                  <InputField label="Bairro" value={form.district} onChange={set("district")} />
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="sm:col-span-2"><InputField label="Cidade" value={form.city} onChange={set("city")} icon={MapPin} /></div>
                    <SearchableSelect label="Estado" value={form.state} onChange={set("state")} options={estados} />
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-5">
                  <InputField label="E-mail Corporativo" value={form.email} onChange={set("email")} icon={Mail} type="email" error={errors.email} />
                  <InputField label="Telefone" value={form.phone} onChange={(value: string) => set("phone")(maskPhone(value))} icon={Phone} />
                  <InputField label="WhatsApp" value={form.whatsapp} onChange={(value: string) => set("whatsapp")(maskPhone(value))} icon={Phone} />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <InputField label="Responsável" value={form.adminName} onChange={set("adminName")} icon={User} />
                    <InputField label="Cargo / Função" value={form.contactRole} onChange={set("contactRole")} icon={Briefcase} />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <InputField label="E-mail do Admin" value={form.adminEmail} onChange={set("adminEmail")} icon={Mail} type="email" />
                  </div>
                </div>
              )}

              {currentStep === 4 && (
                <div className="space-y-5">
                  <SearchableSelect label="Plano" value={form.plan} onChange={set("plan")} options={planos} icon={CreditCard} required />
                  <InputField label="Receita" value={form.revenue} onChange={(value: string) => set("revenue")(onlyDigits(value))} icon={DollarSign} />
                </div>
              )}

              {errors.submit && (
                <div className="flex items-center gap-2 rounded-xl px-4 py-3 mt-6" style={{ background: "rgba(239,68,68,0.1)", color: "#EF4444", fontSize: 13 }}>
                  <AlertCircle size={15} /> {errors.submit}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between px-6 md:px-8 py-4 shrink-0" style={{ borderTop: `1px solid ${colors.border}`, background: colors.navBg }}>
            <button onClick={back} disabled={currentStep === 1} className="flex items-center gap-2 rounded-xl px-4 py-2.5 transition-all disabled:opacity-30" style={{ color: colors.textSecondary, background: colors.surface, border: `1px solid ${colors.border}`, fontSize: 14 }}>
              <ChevronLeft size={15} /> Anterior
            </button>
            <button onClick={currentStep < steps.length ? next : handleSave} disabled={saving} className="flex items-center gap-2 rounded-xl px-5 py-2.5 transition-all hover:opacity-90 disabled:opacity-70" style={{ background: currentStep < steps.length ? "linear-gradient(135deg, #6366F1, #4338CA)" : "#10B981", color: "#fff", fontSize: 14, fontWeight: 500 }}>
              {saving ? (
                <>
                  <span className="rounded-full border-2 animate-spin" style={{ width: 14, height: 14, borderColor: "rgba(255,255,255,0.35)", borderTopColor: "#fff" }} />
                  Salvando...
                </>
              ) : currentStep < steps.length ? (
                <>Próximo <ChevronRight size={15} /></>
              ) : (
                <><Save size={14} /> Salvar Alterações</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
