import { useEffect, useState } from "react";
import {
  Users, Plus, Search, X, Pencil, Trash2, Eye,
  ChevronDown, CheckCircle2, Clock, XCircle, Shield,
  UserCog, User, Mail, Phone, Building2, Lock,
  ArrowUpRight, ArrowDownRight, MoreHorizontal,
  AlertCircle, CheckCheck, Key, RefreshCw, ChevronLeft, ChevronRight
} from "lucide-react";
import { useTheme } from "./ThemeContext";
import { AdminUserMetrics, ApiAdminUser, usersApi } from "../services/usersApi";

// ── Types ──────────────────────────────────────────────────────────────
type UserRole   = string;
type UserStatus = "ativo" | "inativo" | "pendente";

interface UserRecord {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  roleLabel: string;
  roleKey: string;
  status: UserStatus;
  company: string;
  department: string;
  avatar: string;
  since: string;
  lastAccess: string;
  twoFA: boolean;
}

// ── Configs ────────────────────────────────────────────────────────────
const roleConfig: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  central_admin: { label: "Central Admin", color: "#6366F1", bg: "rgba(99,102,241,0.12)", icon: Shield },
  company_admin: { label: "Company Admin", color: "#8B5CF6", bg: "rgba(139,92,246,0.12)", icon: UserCog },
  sem_perfil: { label: "Sem perfil", color: "#94A3B8", bg: "rgba(148,163,184,0.12)", icon: Eye },
  admin:        { label: "Admin",        color: "#6366F1", bg: "rgba(99,102,241,0.12)",  icon: Shield   },
  gerente:      { label: "Gerente",      color: "#8B5CF6", bg: "rgba(139,92,246,0.12)",  icon: UserCog  },
  financeiro:   { label: "Financeiro",   color: "#10B981", bg: "rgba(16,185,129,0.12)",  icon: User     },
  operacional:  { label: "Operacional",  color: "#8B5CF6", bg: "rgba(139,92,246,0.12)",  icon: User     },
  visualizador: { label: "Visualizador", color: "#94A3B8", bg: "rgba(148,163,184,0.12)", icon: Eye      },
};

const statusConfig: Record<UserStatus, { label: string; color: string; bg: string; icon: any }> = {
  ativo:    { label: "Ativo",    color: "#10B981", bg: "rgba(16,185,129,0.12)",  icon: CheckCircle2 },
  inativo:  { label: "Inativo",  color: "#EF4444", bg: "rgba(239,68,68,0.12)",   icon: XCircle      },
  pendente: { label: "Pendente", color: "#F59E0B", bg: "rgba(245,158,11,0.12)",  icon: Clock        },
};

const roleOptions: UserRole[]   = ["admin","gerente","financeiro","operacional","visualizador"];
const statusOptions: UserStatus[] = ["ativo","inativo","pendente"];
const ITEMS_PER_PAGE = 8;

function roleUi(role: string, label?: string) {
  return roleConfig[role] ?? {
    label: label || role.split(/[_-]+/).filter(Boolean).map(part => part.charAt(0).toUpperCase() + part.slice(1)).join(" "),
    color: "#6366F1",
    bg: "rgba(99,102,241,0.12)",
    icon: UserCog,
  };
}

function initialsFor(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0])
    .join("")
    .toUpperCase() || "U";
}

function formatDate(value?: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
}

function mapApiUser(user: ApiAdminUser): UserRecord {
  const roleKey = user.role.slug || user.role.legacy || "sem_perfil";
  const roleLabel = user.role.name || roleUi(roleKey).label;

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: "—",
    role: roleKey,
    roleKey,
    roleLabel,
    status: user.status === "active" ? "ativo" : "pendente",
    company: user.company?.name || "ORQUESTRA",
    department: user.department || "—",
    avatar: initialsFor(user.name),
    since: formatDate(user.created_at),
    lastAccess: user.updated_at ? formatDate(user.updated_at) : "—",
    twoFA: user.two_factor_enabled,
  };
}

function LoadingBlock({ width = "100%", height = 12 }: { width?: string | number; height?: string | number }) {
  const { colors } = useTheme();
  return <div className="rounded-full animate-pulse" style={{ width, height, background: colors.hoverBg }} />;
}

// ── Avatar ─────────────────────────────────────────────────────────────
function Avatar({ user, size = 36 }: { user: UserRecord; size?: number }) {
  const hue = (user.id * 47 + 180) % 360;
  const { theme } = useTheme();
  return (
    <div className="rounded-full flex items-center justify-center shrink-0 font-semibold"
      style={{ width: size, height: size, background: `hsl(${hue},55%,${theme === "light" ? "44%" : "30%"})`, fontSize: size * 0.35, color: "#fff" }}
    >
      {user.avatar}
    </div>
  );
}

// ── Field ──────────────────────────────────────────────────────────────
function Field({ label, placeholder, value, onChange, type = "text", icon: Icon, required }: any) {
  const { colors } = useTheme();
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <label style={{ fontSize: "13px", color: colors.textSecondary, display: "block", marginBottom: "7px", fontFamily: "'Inter',sans-serif", fontWeight: 500 }}>
        {label}{required && <span style={{ color: "#EF4444", marginLeft: "3px" }}>*</span>}
      </label>
      <div className="flex items-center gap-2.5 rounded-xl px-3.5 transition-all duration-200"
        style={{ background: colors.inputBg, border: `1px solid ${focused ? "rgba(99,102,241,0.55)" : colors.border}`, boxShadow: focused ? "0 0 0 3px rgba(99,102,241,0.1)" : "none", height: "44px" }}
      >
        {Icon && <Icon size={15} style={{ color: focused ? "#6366F1" : colors.textMuted }} className="shrink-0" />}
        <input type={type} value={value} onChange={e => onChange(e.target.value)}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          placeholder={placeholder} className="flex-1 bg-transparent outline-none"
          style={{ fontSize: "14px", color: colors.textPrimary, fontFamily: "'Inter',sans-serif" }}
        />
      </div>
    </div>
  );
}

function SelectField({ label, value, onChange, options, required }: any) {
  const { colors } = useTheme();
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <label style={{ fontSize: "13px", color: colors.textSecondary, display: "block", marginBottom: "7px", fontFamily: "'Inter',sans-serif", fontWeight: 500 }}>
        {label}{required && <span style={{ color: "#EF4444", marginLeft: "3px" }}>*</span>}
      </label>
      <div className="flex items-center gap-2.5 rounded-xl px-3.5 transition-all duration-200"
        style={{ background: colors.inputBg, border: `1px solid ${focused ? "rgba(99,102,241,0.55)" : colors.border}`, boxShadow: focused ? "0 0 0 3px rgba(99,102,241,0.1)" : "none", height: "44px" }}
      >
        <select value={value} onChange={e => onChange(e.target.value)}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          className="flex-1 bg-transparent outline-none appearance-none cursor-pointer"
          style={{ fontSize: "14px", color: value ? colors.textPrimary : colors.textMuted, fontFamily: "'Inter',sans-serif" }}
        >
          <option value="">Selecionar...</option>
          {options.map((o: any) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <ChevronDown size={13} style={{ color: colors.textMuted }} className="shrink-0 pointer-events-none" />
      </div>
    </div>
  );
}

// ── User Form Modal (create + edit) ────────────────────────────────────
function UserFormModal({ user, onClose, onSave }: { user?: UserRecord | null; onClose: () => void; onSave: (data: any) => void }) {
  const { colors, theme } = useTheme();
  const isEdit = !!user;

  const [form, setForm] = useState({
    name:       user?.name       ?? "",
    email:      user?.email      ?? "",
    phone:      user?.phone      ?? "",
    role:       user?.role       ?? "" as UserRole | "",
    status:     user?.status     ?? "ativo" as UserStatus,
    company:    user?.company    ?? "",
    department: user?.department ?? "",
    twoFA:      user?.twoFA      ?? false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved]   = useState(false);

  const set = (k: string) => (v: any) => setForm(f => ({ ...f, [k]: v }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name)    e.name    = "Nome obrigatório";
    if (!form.email)   e.email   = "E-mail obrigatório";
    if (!form.role)    e.role    = "Perfil obrigatório";
    if (!form.company) e.company = "Empresa obrigatória";
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSave = () => {
    if (!validate()) return;
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setSaved(true);
      setTimeout(() => onSave(form), 1000);
    }, 1400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(8px)" }}
      onClick={onClose}
    >
      <div className="w-full max-w-[560px] rounded-2xl overflow-hidden flex flex-col"
        style={{ background: colors.card, border: `1px solid ${colors.borderStrong}`, boxShadow: "0 32px 80px rgba(0,0,0,0.4)", maxHeight: "90vh" }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 shrink-0" style={{ borderBottom: `1px solid ${colors.border}` }}>
          <div className="flex items-center gap-3">
            <div className="rounded-xl flex items-center justify-center" style={{ width: "34px", height: "34px", background: "linear-gradient(135deg, #6366F1, #8B5CF6)" }}>
              <Users size={16} color="#fff" />
            </div>
            <h2 style={{ fontFamily: "'Playfair Display',serif", color: colors.textPrimary, fontSize: "18px", fontWeight: 600 }}>
              {isEdit ? "Editar Usuário" : "Novo Usuário"}
            </h2>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 transition-all" style={{ color: colors.textMuted }}
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
              {isEdit ? "Usuário atualizado!" : "Usuário criado!"}
            </p>
            <p style={{ fontSize: "13px", color: colors.textMuted, fontFamily: "'Inter',sans-serif" }}>
              {isEdit ? "As alterações foram salvas com sucesso." : `Convite enviado para ${form.email}`}
            </p>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
              {/* Avatar preview */}
              <div className="flex items-center gap-4 p-4 rounded-xl" style={{ background: colors.surface, border: `1px solid ${colors.border}` }}>
                <div className="rounded-full flex items-center justify-center" style={{ width: "48px", height: "48px", background: "linear-gradient(135deg, #6366F1, #8B5CF6)", fontSize: "17px", color: "#fff", fontWeight: 700 }}>
                  {form.name ? form.name.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase() : "?"}
                </div>
                <div>
                  <p style={{ fontSize: "14px", color: colors.textPrimary, fontFamily: "'Inter',sans-serif", fontWeight: 500 }}>
                    {form.name || "Nome do usuário"}
                  </p>
                  <p style={{ fontSize: "12px", color: colors.textMuted, fontFamily: "'Inter',sans-serif" }}>
                    {form.email || "email@empresa.com"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Field label="Nome completo" placeholder="João da Silva" value={form.name} onChange={set("name")} icon={User} required />
                  {errors.name && <p style={{ fontSize: "11px", color: "#EF4444", marginTop: "4px", fontFamily: "'Inter',sans-serif" }}>{errors.name}</p>}
                </div>
                <div>
                  <Field label="E-mail" placeholder="joao@empresa.com" value={form.email} onChange={set("email")} type="email" icon={Mail} required />
                  {errors.email && <p style={{ fontSize: "11px", color: "#EF4444", marginTop: "4px", fontFamily: "'Inter',sans-serif" }}>{errors.email}</p>}
                </div>
                <Field label="Telefone" placeholder="(11) 9 9999-0000" value={form.phone} onChange={set("phone")} type="tel" icon={Phone} />
                <div>
                  <Field label="Empresa" placeholder="Alpha Tecnologia" value={form.company} onChange={set("company")} icon={Building2} required />
                  {errors.company && <p style={{ fontSize: "11px", color: "#EF4444", marginTop: "4px", fontFamily: "'Inter',sans-serif" }}>{errors.company}</p>}
                </div>
                <Field label="Departamento" placeholder="Financeiro, TI..." value={form.department} onChange={set("department")} />
                <div>
                  <SelectField
                    label="Perfil de acesso"
                    value={form.role}
                    onChange={set("role")}
                    required
                    options={roleOptions.map(r => ({ value: r, label: roleUi(r).label }))}
                  />
                  {errors.role && <p style={{ fontSize: "11px", color: "#EF4444", marginTop: "4px", fontFamily: "'Inter',sans-serif" }}>{errors.role}</p>}
                </div>
                <SelectField
                  label="Status"
                  value={form.status}
                  onChange={set("status")}
                  options={statusOptions.map(s => ({ value: s, label: statusConfig[s].label }))}
                />
              </div>

              {/* 2FA toggle */}
              <div className="flex items-center justify-between p-4 rounded-xl" style={{ background: colors.surface, border: `1px solid ${colors.border}` }}>
                <div className="flex items-center gap-3">
                  <div className="rounded-lg flex items-center justify-center" style={{ width: "32px", height: "32px", background: form.twoFA ? "rgba(99,102,241,0.12)" : colors.card }}>
                    <Lock size={14} style={{ color: form.twoFA ? "#6366F1" : colors.textMuted }} />
                  </div>
                  <div>
                    <p style={{ fontSize: "13px", color: colors.textPrimary, fontFamily: "'Inter',sans-serif", fontWeight: 500 }}>Autenticação em dois fatores</p>
                    <p style={{ fontSize: "11px", color: colors.textMuted, fontFamily: "'Inter',sans-serif" }}>Exigir 2FA para este usuário</p>
                  </div>
                </div>
                <button onClick={() => set("twoFA")(!form.twoFA)}
                  className="rounded-full transition-all duration-300"
                  style={{ width: "44px", height: "24px", background: form.twoFA ? "#6366F1" : colors.border, position: "relative", flexShrink: 0 }}
                >
                  <div className="absolute top-1 rounded-full bg-white transition-all duration-300"
                    style={{ width: "16px", height: "16px", left: form.twoFA ? "24px" : "4px" }}
                  />
                </button>
              </div>

              {!isEdit && (
                <div className="flex items-start gap-3 p-4 rounded-xl" style={{ background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.2)" }}>
                  <AlertCircle size={15} style={{ color: "#6366F1", marginTop: "1px" }} className="shrink-0" />
                  <p style={{ fontSize: "12px", color: colors.textSecondary, fontFamily: "'Inter',sans-serif", lineHeight: 1.5 }}>
                    Um convite com link de acesso será enviado automaticamente para o e-mail informado.
                  </p>
                </div>
              )}
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
                style={{ background: "linear-gradient(135deg, #6366F1, #4338CA)", color: "#fff", fontSize: "13px", fontFamily: "'Inter',sans-serif", fontWeight: 500 }}
              >
                {saving ? (
                  <><span className="rounded-full border-2 animate-spin" style={{ width: "12px", height: "12px", borderColor: "rgba(255,255,255,0.3)", borderTopColor: "#fff" }} /> Salvando...</>
                ) : (
                  <><CheckCheck size={14} /> {isEdit ? "Salvar alterações" : "Criar usuário"}</>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── View modal ─────────────────────────────────────────────────────────
function UserViewModal({ user, onClose, onEdit }: { user: UserRecord; onClose: () => void; onEdit: () => void }) {
  const { colors } = useTheme();
  const role   = roleUi(user.roleKey, user.roleLabel);
  const status = statusConfig[user.status];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(8px)" }}
      onClick={onClose}
    >
      <div className="w-full max-w-[500px] rounded-2xl overflow-hidden"
        style={{ background: colors.card, border: `1px solid ${colors.borderStrong}`, boxShadow: "0 32px 80px rgba(0,0,0,0.4)" }}
        onClick={e => e.stopPropagation()}
      >
        {/* Profile header */}
        <div className="relative px-6 pt-8 pb-6" style={{ background: "linear-gradient(135deg, rgba(99,102,241,0.08), rgba(139,92,246,0.05))", borderBottom: `1px solid ${colors.border}` }}>
          <button onClick={onClose} className="absolute top-4 right-4 rounded-lg p-1.5" style={{ color: colors.textMuted }}>
            <X size={15} />
          </button>
          <div className="flex items-center gap-4">
            <Avatar user={user} size={60} />
            <div>
              <h2 style={{ fontFamily: "'Playfair Display',serif", color: colors.textPrimary, fontSize: "20px", fontWeight: 600 }}>{user.name}</h2>
              <p style={{ fontSize: "13px", color: colors.textMuted, fontFamily: "'Inter',sans-serif", marginTop: "2px" }}>{user.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="flex items-center gap-1 rounded-full px-2.5 py-1" style={{ fontSize: "11px", color: role.color, background: role.bg, fontWeight: 600, fontFamily: "'Inter',sans-serif" }}>
                  <role.icon size={10} /> {role.label}
                </span>
                <span className="flex items-center gap-1 rounded-full px-2.5 py-1" style={{ fontSize: "11px", color: status.color, background: status.bg, fontFamily: "'Inter',sans-serif" }}>
                  <status.icon size={10} /> {status.label}
                </span>
                {user.twoFA && (
                  <span className="flex items-center gap-1 rounded-full px-2.5 py-1" style={{ fontSize: "11px", color: "#10B981", background: "rgba(16,185,129,0.1)", fontFamily: "'Inter',sans-serif" }}>
                    <Lock size={9} /> 2FA
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Info grid */}
        <div className="px-6 py-5 grid grid-cols-2 gap-4">
          {[
            { icon: Phone,     label: "Telefone",     value: user.phone      },
            { icon: Building2, label: "Empresa",      value: user.company    },
            { icon: UserCog,   label: "Departamento", value: user.department },
            { icon: Clock,     label: "Membro desde", value: user.since      },
            { icon: CheckCircle2, label: "Último acesso", value: user.lastAccess },
          ].map(info => (
            <div key={info.label} className="flex items-start gap-3">
              <div className="rounded-lg flex items-center justify-center shrink-0 mt-0.5" style={{ width: "28px", height: "28px", background: colors.surface }}>
                <info.icon size={13} style={{ color: colors.textMuted }} />
              </div>
              <div>
                <p style={{ fontSize: "11px", color: colors.textMuted, fontFamily: "'Inter',sans-serif", textTransform: "uppercase", letterSpacing: "0.06em" }}>{info.label}</p>
                <p style={{ fontSize: "13px", color: colors.textPrimary, fontFamily: "'Inter',sans-serif", marginTop: "1px" }}>{info.value || "—"}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between px-6 py-4" style={{ borderTop: `1px solid ${colors.border}` }}>
          <button className="flex items-center gap-2 rounded-xl px-3 py-2 transition-all" style={{ fontSize: "12px", color: "#F59E0B", background: "rgba(245,158,11,0.1)", fontFamily: "'Inter',sans-serif" }}>
            <Key size={13} /> Redefinir senha
          </button>
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="rounded-xl px-4 py-2 transition-all" style={{ fontSize: "13px", color: colors.textSecondary, background: colors.surface, border: `1px solid ${colors.border}`, fontFamily: "'Inter',sans-serif" }}>
              Fechar
            </button>
            <button onClick={onEdit} className="flex items-center gap-2 rounded-xl px-4 py-2 transition-all hover:opacity-90"
              style={{ background: "linear-gradient(135deg, #6366F1, #4338CA)", color: "#fff", fontSize: "13px", fontFamily: "'Inter',sans-serif", fontWeight: 500 }}
            >
              <Pencil size={13} /> Editar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Delete confirm modal ───────────────────────────────────────────────
function DeleteModal({ user, onClose, onConfirm }: { user: UserRecord; onClose: () => void; onConfirm: () => void }) {
  const { colors } = useTheme();
  const [deleting, setDeleting] = useState(false);

  const handle = () => {
    setDeleting(true);
    setTimeout(() => { setDeleting(false); onConfirm(); }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(8px)" }}
      onClick={onClose}
    >
      <div className="w-full max-w-[420px] rounded-2xl overflow-hidden"
        style={{ background: colors.card, border: `1px solid ${colors.borderStrong}`, boxShadow: "0 32px 80px rgba(0,0,0,0.4)" }}
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-center gap-4 mb-5">
            <div className="rounded-2xl flex items-center justify-center shrink-0" style={{ width: "48px", height: "48px", background: "rgba(239,68,68,0.1)" }}>
              <Trash2 size={22} style={{ color: "#EF4444" }} />
            </div>
            <div>
              <h3 style={{ fontFamily: "'Playfair Display',serif", color: colors.textPrimary, fontSize: "18px", fontWeight: 600 }}>Remover usuário</h3>
              <p style={{ fontSize: "13px", color: colors.textMuted, fontFamily: "'Inter',sans-serif", marginTop: "2px" }}>Esta ação não pode ser desfeita.</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 rounded-xl mb-5" style={{ background: colors.surface, border: `1px solid ${colors.border}` }}>
            <Avatar user={user} size={36} />
            <div>
              <p style={{ fontSize: "14px", color: colors.textPrimary, fontFamily: "'Inter',sans-serif", fontWeight: 500 }}>{user.name}</p>
              <p style={{ fontSize: "12px", color: colors.textMuted, fontFamily: "'Inter',sans-serif" }}>{user.email}</p>
            </div>
          </div>

          <p style={{ fontSize: "13px", color: colors.textSecondary, fontFamily: "'Inter',sans-serif", lineHeight: 1.6, marginBottom: "20px" }}>
            O acesso de <strong style={{ color: colors.textPrimary }}>{user.name}</strong> será revogado imediatamente e todos os dados associados serão removidos.
          </p>

          <div className="flex gap-2">
            <button onClick={onClose} className="flex-1 rounded-xl py-2.5 transition-all" style={{ fontSize: "14px", color: colors.textSecondary, background: colors.surface, border: `1px solid ${colors.border}`, fontFamily: "'Inter',sans-serif" }}>
              Cancelar
            </button>
            <button onClick={handle} disabled={deleting}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 transition-all hover:opacity-90 disabled:opacity-60"
              style={{ background: "#EF4444", color: "#fff", fontSize: "14px", fontFamily: "'Inter',sans-serif", fontWeight: 500 }}
            >
              {deleting ? (
                <span className="rounded-full border-2 animate-spin" style={{ width: "14px", height: "14px", borderColor: "rgba(255,255,255,0.3)", borderTopColor: "#fff" }} />
              ) : (
                <><Trash2 size={14} /> Remover</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main ───────────────────────────────────────────────────────────────
export function Usuarios() {
  const { colors, theme } = useTheme();
  const [users, setUsers]           = useState<UserRecord[]>([]);
  const [metrics, setMetrics]       = useState<AdminUserMetrics | null>(null);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState<string | null>(null);
  const [search, setSearch]         = useState("");
  const [roleFilter, setRoleFilter] = useState<string | "todos">("todos");
  const [statusFilter, setStatusFilter] = useState<UserStatus | "todos">("todos");
  const [page, setPage]             = useState(1);
  const [viewUser, setViewUser]     = useState<UserRecord | null>(null);
  const [editUser, setEditUser]     = useState<UserRecord | null | "new">(null);
  const [deleteUser, setDeleteUser] = useState<UserRecord | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);

    const timeout = window.setTimeout(() => {
      const params = {
        search: search.trim() || undefined,
        status: statusFilter === "todos" ? undefined : statusFilter,
        role: roleFilter === "todos" ? undefined : roleFilter,
        per_page: 100,
      };

      setError(null);

      Promise.all([
        usersApi.list(params),
        usersApi.metrics(params),
      ])
        .then(([listResponse, metricsResponse]) => {
          if (!active) return;
          setUsers(listResponse.data.map(mapApiUser));
          setMetrics(metricsResponse);
        })
        .catch((err: Error) => {
          if (!active) return;
          setUsers([]);
          setMetrics(null);
          setError(err.message || "Não foi possível carregar os usuários.");
        })
        .finally(() => {
          if (active) setLoading(false);
        });
    }, 250);

    return () => {
      active = false;
      window.clearTimeout(timeout);
    };
  }, [search, roleFilter, statusFilter]);

  const filtered = users.filter(u => {
    const q = search.toLowerCase();
    const matchSearch = u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.company.toLowerCase().includes(q);
    const matchRole   = roleFilter   === "todos" || u.roleKey === roleFilter;
    const matchStatus = statusFilter === "todos" || u.status === statusFilter;
    return matchSearch && matchRole && matchStatus;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated  = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const handleSave = (data: any) => {
    void data;
    setError("Criação e edição de usuários ainda não estão disponíveis na API.");
    setEditUser(null);
    setViewUser(null);
  };

  const handleDelete = () => {
    if (!deleteUser) return;
    setError("Remoção de usuários ainda não está disponível na API.");
    setDeleteUser(null);
  };

  const kpis = [
    { label: "Total de Usuários", value: metrics?.total_users ?? users.length, color: "#6366F1", icon: Users, change: "base principal", positive: true },
    { label: "Usuários Ativos", value: metrics?.active_users ?? users.filter(u => u.status === "ativo").length, color: "#10B981", icon: CheckCircle2, change: `${metrics?.active_rate ?? 0}% do total`, positive: true },
    { label: "Pendentes", value: metrics?.pending_users ?? users.filter(u => u.status === "pendente").length, color: "#F59E0B", icon: Clock, change: "aguardando verificação", positive: false },
    { label: "Com 2FA ativo", value: metrics?.two_factor_enabled_users ?? users.filter(u => u.twoFA).length, color: "#8B5CF6", icon: Lock, change: `${metrics?.two_factor_rate ?? 0}% protegidos`, positive: true },
  ];

  const roleBreakdown = metrics?.role_counts?.length
    ? metrics.role_counts
    : roleOptions.map(role => ({ role, name: roleUi(role).label, total: users.filter(user => user.roleKey === role).length }));

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
          <h1 style={{ fontFamily: "'Playfair Display',serif", color: colors.textPrimary, fontSize: "26px", fontWeight: 600 }}>Usuários</h1>
          <p style={{ fontFamily: "'Inter',sans-serif", color: colors.textMuted, fontSize: "14px", marginTop: "4px" }}>
            Gerencie os usuários e seus perfis de acesso
          </p>
        </div>
        <button onClick={() => setEditUser("new")}
          className="flex items-center gap-2 rounded-xl px-4 py-2.5 transition-all hover:opacity-90"
          style={{ background: "linear-gradient(135deg, #6366F1, #4338CA)", color: "#fff", fontSize: "14px", fontFamily: "'Inter',sans-serif", fontWeight: 500 }}
        >
          <Plus size={16} /> Novo Usuário
        </button>
      </div>

      {error && (
        <div className="rounded-xl px-4 py-3" style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.25)", color: "#F59E0B", fontSize: "13px", fontFamily: "'Inter',sans-serif" }}>
          {error}
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {loading && !metrics ? Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="rounded-2xl p-5" style={cardStyle}>
            <div className="flex items-start justify-between mb-3">
              <LoadingBlock width={38} height={38} />
              <LoadingBlock width={42} height={18} />
            </div>
            <div className="space-y-2">
              <LoadingBlock width="35%" height={26} />
              <LoadingBlock width="70%" height={13} />
              <LoadingBlock width="45%" height={11} />
            </div>
          </div>
        )) : kpis.map(k => (
          <div key={k.label} className="rounded-2xl p-5 transition-all hover:translate-y-[-2px]" style={cardStyle}>
            <div className="flex items-start justify-between mb-3">
              <div className="rounded-xl flex items-center justify-center" style={{ width: "38px", height: "38px", background: `${k.color}15` }}>
                <k.icon size={17} style={{ color: k.color }} />
              </div>
              <span className="flex items-center gap-0.5 rounded-full px-2 py-0.5" style={{ fontSize: "10px", color: k.positive ? "#10B981" : "#F59E0B", background: k.positive ? "rgba(16,185,129,0.1)" : "rgba(245,158,11,0.1)", fontFamily: "'Inter',sans-serif" }}>
                {k.positive ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
              </span>
            </div>
            <p style={{ fontSize: "26px", color: colors.textPrimary, fontFamily: "'Inter',sans-serif", fontWeight: 700, lineHeight: 1 }}>{k.value}</p>
            <p style={{ fontSize: "13px", color: colors.textSecondary, fontFamily: "'Inter',sans-serif", marginTop: "5px" }}>{k.label}</p>
            <p style={{ fontSize: "11px", color: colors.textMuted, fontFamily: "'Inter',sans-serif", marginTop: "2px" }}>{k.change}</p>
          </div>
        ))}
      </div>

      {/* Role breakdown pills */}
      <div className="flex flex-wrap gap-2">
        {roleBreakdown.map(({ role: r, name, total }) => {
          const rc = roleUi(r, name);
          const count = total;
          return (
            <button key={r} onClick={() => setRoleFilter(roleFilter === r ? "todos" : r)}
              className="flex items-center gap-2 rounded-xl px-3 py-2 transition-all"
              style={{
                background: roleFilter === r ? rc.bg : colors.card,
                border: `1px solid ${roleFilter === r ? rc.color + "50" : colors.border}`,
                fontSize: "12px", color: roleFilter === r ? rc.color : colors.textSecondary, fontFamily: "'Inter',sans-serif",
              }}
            >
              <rc.icon size={13} /> {rc.label}
              <span className="rounded-full px-1.5 py-0.5 ml-1" style={{ fontSize: "10px", background: roleFilter === r ? rc.color + "30" : colors.surface, color: roleFilter === r ? rc.color : colors.textMuted, fontFamily: "'Inter',sans-serif" }}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Filters + search */}
      <div className="rounded-2xl p-4" style={cardStyle}>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 rounded-xl px-3 py-2 flex-1 min-w-[200px]" style={{ background: colors.surface, border: `1px solid ${colors.border}` }}>
            <Search size={14} style={{ color: colors.textMuted }} />
            <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Buscar por nome, e-mail ou empresa..."
              className="flex-1 bg-transparent outline-none"
              style={{ fontSize: "13px", color: colors.textPrimary, fontFamily: "'Inter',sans-serif" }}
            />
            {search && <button onClick={() => setSearch("")} style={{ color: colors.textMuted }}><X size={13} /></button>}
          </div>

          {/* Status dropdown */}
          <div className="relative">
            <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value as any); setPage(1); }}
              className="appearance-none rounded-xl px-3 py-2 pr-8 outline-none cursor-pointer"
              style={{ background: colors.surface, border: `1px solid ${statusFilter !== "todos" ? "#6366F1" : colors.border}`, color: statusFilter !== "todos" ? "#6366F1" : colors.textSecondary, fontSize: "13px", fontFamily: "'Inter',sans-serif" }}
            >
              <option value="todos">Status</option>
              {statusOptions.map(s => <option key={s} value={s}>{statusConfig[s].label}</option>)}
            </select>
            <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: colors.textMuted }} />
          </div>

          <span style={{ marginLeft: "auto", fontSize: "13px", color: colors.textMuted, fontFamily: "'Inter',sans-serif" }}>
            {filtered.length} usuário{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl overflow-hidden" style={cardStyle}>
        {/* Head */}
        <div className="grid px-5 py-3"
          style={{ gridTemplateColumns: "2fr 1.5fr 1.2fr 1fr 1fr 1fr 100px", borderBottom: `1px solid ${colors.border}`, background: theme === "light" ? colors.surface : "rgba(255,255,255,0.02)" }}
        >
          {["Usuário", "Empresa", "Departamento", "Perfil", "Status", "2FA", "Ações"].map(h => (
            <span key={h} style={{ fontSize: "11px", color: colors.textMuted, fontFamily: "'Inter',sans-serif", textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</span>
          ))}
        </div>

        {loading && users.length === 0 ? (
          <div>
            {Array.from({ length: 8 }).map((_, index) => (
              <div
                key={index}
                className="grid items-center px-5 py-3.5"
                style={{ gridTemplateColumns: "2fr 1.5fr 1.2fr 1fr 1fr 1fr 100px", borderBottom: index < 7 ? `1px solid ${colors.border}` : "none" }}
              >
                <div className="flex items-center gap-3">
                  <LoadingBlock width={34} height={34} />
                  <div className="space-y-2 flex-1">
                    <LoadingBlock width="62%" height={13} />
                    <LoadingBlock width="78%" height={11} />
                  </div>
                </div>
                <LoadingBlock width="70%" height={12} />
                <LoadingBlock width="58%" height={12} />
                <LoadingBlock width={92} height={24} />
                <LoadingBlock width={72} height={24} />
                <LoadingBlock width={48} height={20} />
                <LoadingBlock width={72} height={26} />
              </div>
            ))}
          </div>
        ) : paginated.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Users size={32} style={{ color: colors.textMuted }} />
            <p style={{ fontSize: "14px", color: colors.textMuted, fontFamily: "'Inter',sans-serif" }}>Nenhum usuário encontrado</p>
          </div>
        ) : paginated.map((user, i) => {
          const role   = roleUi(user.roleKey, user.roleLabel);
          const status = statusConfig[user.status];
          const isLast = i === paginated.length - 1;
          return (
            <div key={user.id}
              className="grid items-center px-5 py-3.5 transition-all cursor-pointer group"
              style={{ gridTemplateColumns: "2fr 1.5fr 1.2fr 1fr 1fr 1fr 100px", borderBottom: isLast ? "none" : `1px solid ${colors.border}` }}
              onMouseEnter={e => (e.currentTarget.style.background = colors.hoverBg)}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
              onClick={() => setViewUser(user)}
            >
              {/* User */}
              <div className="flex items-center gap-3 min-w-0">
                <Avatar user={user} size={34} />
                <div className="min-w-0">
                  <p style={{ fontSize: "13px", color: colors.textPrimary, fontFamily: "'Inter',sans-serif", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.name}</p>
                  <p style={{ fontSize: "11px", color: colors.textMuted, fontFamily: "'Inter',sans-serif", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.email}</p>
                </div>
              </div>

              {/* Company */}
              <span style={{ fontSize: "12px", color: colors.textSecondary, fontFamily: "'Inter',sans-serif", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.company}</span>

              {/* Dept */}
              <span style={{ fontSize: "12px", color: colors.textSecondary, fontFamily: "'Inter',sans-serif" }}>{user.department || "—"}</span>

              {/* Role */}
              <span className="flex items-center gap-1 rounded-full px-2.5 py-1 w-fit" style={{ fontSize: "11px", color: role.color, background: role.bg, fontFamily: "'Inter',sans-serif", fontWeight: 500 }}>
                <role.icon size={10} /> {role.label}
              </span>

              {/* Status */}
              <span className="flex items-center gap-1 rounded-full px-2.5 py-1 w-fit" style={{ fontSize: "11px", color: status.color, background: status.bg, fontFamily: "'Inter',sans-serif", fontWeight: 500 }}>
                <status.icon size={10} /> {status.label}
              </span>

              {/* 2FA */}
              <span>
                {user.twoFA
                  ? <span className="flex items-center gap-1 rounded-full px-2 py-0.5 w-fit" style={{ fontSize: "10px", color: "#10B981", background: "rgba(16,185,129,0.1)", fontFamily: "'Inter',sans-serif", fontWeight: 600 }}><Lock size={9} /> Ativo</span>
                  : <span style={{ fontSize: "11px", color: colors.textMuted, fontFamily: "'Inter',sans-serif" }}>—</span>
                }
              </span>

              {/* Actions */}
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all" onClick={e => e.stopPropagation()}>
                <button onClick={() => setViewUser(user)}
                  className="rounded-lg p-1.5 transition-all" style={{ color: colors.textMuted }}
                  title="Ver detalhes"
                  onMouseEnter={e => (e.currentTarget.style.color = "#6366F1")}
                  onMouseLeave={e => (e.currentTarget.style.color = colors.textMuted)}
                >
                  <Eye size={14} />
                </button>
                <button onClick={() => setEditUser(user)}
                  className="rounded-lg p-1.5 transition-all" style={{ color: colors.textMuted }}
                  title="Editar"
                  onMouseEnter={e => (e.currentTarget.style.color = "#F59E0B")}
                  onMouseLeave={e => (e.currentTarget.style.color = colors.textMuted)}
                >
                  <Pencil size={14} />
                </button>
                <button onClick={() => setDeleteUser(user)}
                  className="rounded-lg p-1.5 transition-all" style={{ color: colors.textMuted }}
                  title="Remover"
                  onMouseEnter={e => (e.currentTarget.style.color = "#EF4444")}
                  onMouseLeave={e => (e.currentTarget.style.color = colors.textMuted)}
                >
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
                className="rounded-lg p-1.5 transition-all disabled:opacity-30"
                style={{ color: colors.textSecondary, background: colors.surface, border: `1px solid ${colors.border}` }}
              >
                <ChevronLeft size={15} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                <button key={n} onClick={() => setPage(n)}
                  className="rounded-lg transition-all"
                  style={{ width: "32px", height: "32px", fontSize: "13px", fontFamily: "'Inter',sans-serif", background: n === page ? "#6366F1" : colors.surface, color: n === page ? "#fff" : colors.textSecondary, border: `1px solid ${n === page ? "#6366F1" : colors.border}`, fontWeight: n === page ? 600 : 400 }}
                >
                  {n}
                </button>
              ))}
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="rounded-lg p-1.5 transition-all disabled:opacity-30"
                style={{ color: colors.textSecondary, background: colors.surface, border: `1px solid ${colors.border}` }}
              >
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {viewUser && !editUser && (
        <UserViewModal
          user={viewUser}
          onClose={() => setViewUser(null)}
          onEdit={() => { setEditUser(viewUser); setViewUser(null); }}
        />
      )}
      {editUser !== null && (
        <UserFormModal
          user={editUser === "new" ? null : editUser}
          onClose={() => setEditUser(null)}
          onSave={handleSave}
        />
      )}
      {deleteUser && (
        <DeleteModal
          user={deleteUser}
          onClose={() => setDeleteUser(null)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
}
