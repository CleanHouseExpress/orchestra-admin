import { useEffect, useState } from "react";
import {
  Building2, Shield, Bell, Link2, Palette, Globe, Database,
  ChevronRight, Plus, Pencil, Trash2, X, CheckCircle2,
  Search, Users, Hash, AlignLeft, CheckCheck, AlertCircle,
  Mail, Smartphone, Lock, Eye, EyeOff, ToggleLeft, ToggleRight,
  Webhook, Key, RefreshCw, Download, Upload, Sliders
} from "lucide-react";
import { useTheme } from "./ThemeContext";
import { DefaultButton } from "./ui/default-button";
import { AccessProfile, AccessProfilePayload, AccessProfilePermission, PermissionAction, accessProfilesApi } from "../services/accessProfilesApi";
import { ApiDepartment, DepartmentPayload, departmentsApi } from "../services/departmentsApi";
import { ApiModule, modulesApi } from "../services/modulesApi";

// ── Submenu config ─────────────────────────────────────────────────────
const submenu = [
  { id: "departamentos",  label: "Departamentos",    icon: Building2, group: "Organização" },
  { id: "perfis",         label: "Perfis de Acesso", icon: Shield,    group: "Organização" },
  { id: "modulos",        label: "Módulos",          icon: Sliders,   group: "Organização" },
  { id: "notificacoes",   label: "Notificações",     icon: Bell,      group: "Sistema"     },
  { id: "seguranca",      label: "Segurança",        icon: Lock,      group: "Sistema"     },
  { id: "integracoes",    label: "Integrações",      icon: Link2,     group: "Sistema"     },
  { id: "aparencia",      label: "Aparência",        icon: Palette,   group: "Preferências"},
  { id: "regional",       label: "Regional",         icon: Globe,     group: "Preferências"},
  { id: "dados",          label: "Dados & Backup",   icon: Database,  group: "Avançado"    },
];

const groups = ["Organização", "Sistema", "Preferências", "Avançado"];

// ── Types ──────────────────────────────────────────────────────────────
interface Departamento {
  id: number;
  name: string;
  description: string;
  manager: string;
  userCount: number;
  color: string;
}

const colorOptions = [
  "#3B82F6","#14B8A6","#8B5CF6","#F59E0B","#10B981","#EF4444","#EC4899","#F97316","#06B6D4","#84CC16",
];

function mapDepartment(dept: ApiDepartment): Departamento {
  return {
    id: dept.id,
    name: dept.name,
    description: dept.description ?? "",
    manager: dept.manager ?? "",
    userCount: dept.user_count ?? dept.users_count ?? dept.users?.length ?? 0,
    color: dept.color ?? "#3B82F6",
  };
}

// ── Field ──────────────────────────────────────────────────────────────
function Field({ label, placeholder, value, onChange, icon: Icon, required, hint }: any) {
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
        <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          className="flex-1 bg-transparent outline-none"
          style={{ fontSize: "14px", color: colors.textPrimary, fontFamily: "'Inter',sans-serif" }}
        />
      </div>
      {hint && <p style={{ fontSize: "11px", color: colors.textMuted, marginTop: "4px", fontFamily: "'Inter',sans-serif" }}>{hint}</p>}
    </div>
  );
}

// ── Dept modal ─────────────────────────────────────────────────────────
function DeptModal({ dept, onClose, onSave }: { dept?: Departamento | null; onClose: () => void; onSave: (d: DepartmentPayload) => Promise<void> }) {
  const { colors, theme } = useTheme();
  const isEdit = !!dept;
  const [form, setForm] = useState({
    name:        dept?.name        ?? "",
    description: dept?.description ?? "",
    manager:     dept?.manager     ?? "",
    color:       dept?.color       ?? "#3B82F6",
  });
  const [errors, setErrors]   = useState<Record<string, string>>({});
  const [saving, setSaving]   = useState(false);
  const [saved, setSaved]     = useState(false);
  const [saveError, setSaveError] = useState("");

  const set = (k: string) => (v: string) => setForm(f => ({ ...f, [k]: v }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name) e.name = "Nome obrigatório";
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    setSaveError("");

    try {
      await onSave(form);
      setSaved(true);
      window.setTimeout(onClose, 700);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Não foi possível salvar o departamento.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(8px)" }}
      onClick={onClose}
    >
      <div className="w-full max-w-[480px] rounded-2xl overflow-hidden flex flex-col"
        style={{ background: colors.card, border: `1px solid ${colors.borderStrong}`, boxShadow: "0 32px 80px rgba(0,0,0,0.4)" }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 shrink-0" style={{ borderBottom: `1px solid ${colors.border}` }}>
          <div className="flex items-center gap-3">
            <div className="rounded-xl flex items-center justify-center" style={{ width: "34px", height: "34px", background: form.color + "25" }}>
              <Building2 size={16} style={{ color: form.color }} />
            </div>
            <h2 style={{ fontFamily: "'Playfair Display',serif", color: colors.textPrimary, fontSize: "17px", fontWeight: 600 }}>
              {isEdit ? "Editar Departamento" : "Novo Departamento"}
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
          <div className="flex flex-col items-center justify-center py-14 gap-4">
            <div className="rounded-full flex items-center justify-center" style={{ width: "56px", height: "56px", background: "rgba(16,185,129,0.12)" }}>
              <CheckCircle2 size={26} style={{ color: "#10B981" }} />
            </div>
            <p style={{ fontFamily: "'Playfair Display',serif", color: colors.textPrimary, fontSize: "17px" }}>
              {isEdit ? "Departamento atualizado!" : "Departamento criado!"}
            </p>
          </div>
        ) : (
          <>
            <div className="px-6 py-5 space-y-4">
              <Field label="Nome do departamento" placeholder="Ex: Tecnologia, Financeiro..." value={form.name} onChange={set("name")} icon={Hash} required />
              {errors.name && <p style={{ fontSize: "11px", color: "#EF4444", marginTop: "-8px", fontFamily: "'Inter',sans-serif" }}>{errors.name}</p>}

              <div>
                <label style={{ fontSize: "13px", color: colors.textSecondary, display: "block", marginBottom: "7px", fontFamily: "'Inter',sans-serif", fontWeight: 500 }}>
                  Descrição
                </label>
                <textarea value={form.description} onChange={e => set("description")(e.target.value)}
                  placeholder="Descreva brevemente as responsabilidades..." rows={3}
                  className="w-full rounded-xl px-4 py-3 outline-none resize-none transition-all"
                  style={{ background: colors.inputBg, border: `1px solid ${colors.border}`, color: colors.textPrimary, fontSize: "14px", fontFamily: "'Inter',sans-serif", lineHeight: 1.6 }}
                  onFocus={e => (e.target.style.border = "1px solid rgba(59,130,246,0.55)")}
                  onBlur={e => (e.target.style.border = `1px solid ${colors.border}`)}
                />
              </div>

              <Field label="Responsável" placeholder="Nome do gestor..." value={form.manager} onChange={set("manager")} icon={Users} />
              {saveError && (
                <div className="flex items-start gap-2 rounded-xl px-3 py-2" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.18)" }}>
                  <AlertCircle size={14} style={{ color: "#EF4444", marginTop: "1px" }} className="shrink-0" />
                  <p style={{ fontSize: "12px", color: colors.textSecondary, fontFamily: "'Inter',sans-serif", lineHeight: 1.5 }}>{saveError}</p>
                </div>
              )}

              {/* Color picker */}
              <div>
                <label style={{ fontSize: "13px", color: colors.textSecondary, display: "block", marginBottom: "10px", fontFamily: "'Inter',sans-serif", fontWeight: 500 }}>
                  Cor de identificação
                </label>
                <div className="flex flex-wrap gap-2">
                  {colorOptions.map(c => (
                    <button key={c} onClick={() => set("color")(c)}
                      className="rounded-full transition-all hover:scale-110"
                      style={{ width: "28px", height: "28px", background: c, outline: form.color === c ? `3px solid ${c}` : "3px solid transparent", outlineOffset: "2px" }}
                    />
                  ))}
                </div>
                {/* Preview */}
                <div className="mt-3 flex items-center gap-2">
                  <span style={{ fontSize: "11px", color: colors.textMuted, fontFamily: "'Inter',sans-serif" }}>Preview:</span>
                  <span className="rounded-full px-3 py-1" style={{ fontSize: "12px", color: form.color, background: form.color + "20", fontFamily: "'Inter',sans-serif", fontWeight: 500 }}>
                    {form.name || "Departamento"}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 px-6 py-4" style={{ borderTop: `1px solid ${colors.border}` }}>
              <button onClick={onClose} className="rounded-xl px-4 py-2 transition-all" style={{ fontSize: "13px", color: colors.textSecondary, background: colors.surface, border: `1px solid ${colors.border}`, fontFamily: "'Inter',sans-serif" }}
                onMouseEnter={e => (e.currentTarget.style.background = colors.hoverBg)}
                onMouseLeave={e => (e.currentTarget.style.background = colors.surface)}
              >
                Cancelar
              </button>
              <DefaultButton onClick={handleSave} disabled={saving} className="px-5">
                {saving
                  ? <><span className="rounded-full border-2 animate-spin" style={{ width: "12px", height: "12px", borderColor: "rgba(255,255,255,0.3)", borderTopColor: "#fff" }} /> Salvando...</>
                  : <><CheckCheck size={14} /> {isEdit ? "Salvar" : "Criar"}</>
                }
              </DefaultButton>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── Delete confirm ─────────────────────────────────────────────────────
function DeleteDeptModal({ dept, onClose, onConfirm }: { dept: Departamento; onClose: () => void; onConfirm: () => Promise<void> }) {
  const { colors } = useTheme();
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const handle = async () => {
    setDeleting(true);
    setDeleteError("");

    try {
      await onConfirm();
    } catch (error) {
      setDeleteError(error instanceof Error ? error.message : "Não foi possível remover o departamento.");
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(8px)" }}
      onClick={onClose}
    >
      <div className="w-full max-w-[400px] rounded-2xl p-6"
        style={{ background: colors.card, border: `1px solid ${colors.borderStrong}`, boxShadow: "0 32px 80px rgba(0,0,0,0.4)" }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center gap-4 mb-5">
          <div className="rounded-2xl flex items-center justify-center shrink-0" style={{ width: "46px", height: "46px", background: "rgba(239,68,68,0.1)" }}>
            <Trash2 size={20} style={{ color: "#EF4444" }} />
          </div>
          <div>
            <h3 style={{ fontFamily: "'Playfair Display',serif", color: colors.textPrimary, fontSize: "17px", fontWeight: 600 }}>Remover departamento</h3>
            <p style={{ fontSize: "12px", color: colors.textMuted, fontFamily: "'Inter',sans-serif" }}>Esta ação não pode ser desfeita.</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-3 rounded-xl mb-5" style={{ background: colors.surface, border: `1px solid ${colors.border}` }}>
          <div className="rounded-full w-3 h-3 shrink-0" style={{ background: dept.color }} />
          <div>
            <p style={{ fontSize: "14px", color: colors.textPrimary, fontFamily: "'Inter',sans-serif", fontWeight: 500 }}>{dept.name}</p>
            <p style={{ fontSize: "12px", color: colors.textMuted, fontFamily: "'Inter',sans-serif" }}>{dept.userCount} usuário{dept.userCount !== 1 ? "s" : ""} associado{dept.userCount !== 1 ? "s" : ""}</p>
          </div>
        </div>
        {dept.userCount > 0 && (
          <div className="flex items-start gap-2 p-3 rounded-xl mb-4" style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)" }}>
            <AlertCircle size={14} style={{ color: "#F59E0B", marginTop: "1px" }} className="shrink-0" />
            <p style={{ fontSize: "12px", color: colors.textSecondary, fontFamily: "'Inter',sans-serif", lineHeight: 1.5 }}>
              Os {dept.userCount} usuários associados ficarão sem departamento.
            </p>
          </div>
        )}
        {deleteError && (
          <div className="flex items-start gap-2 p-3 rounded-xl mb-4" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.18)" }}>
            <AlertCircle size={14} style={{ color: "#EF4444", marginTop: "1px" }} className="shrink-0" />
            <p style={{ fontSize: "12px", color: colors.textSecondary, fontFamily: "'Inter',sans-serif", lineHeight: 1.5 }}>{deleteError}</p>
          </div>
        )}
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 rounded-xl py-2.5 transition-all" style={{ fontSize: "13px", color: colors.textSecondary, background: colors.surface, border: `1px solid ${colors.border}`, fontFamily: "'Inter',sans-serif" }}>
            Cancelar
          </button>
          <button onClick={handle} disabled={deleting}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 transition-all hover:opacity-90"
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

// ── Departamentos page ─────────────────────────────────────────────────
function Departamentos() {
  const { colors, theme } = useTheme();
  const [depts, setDepts]       = useState<Departamento[]>([]);
  const [search, setSearch]     = useState("");
  const [editDept, setEditDept] = useState<Departamento | null | "new">(null);
  const [delDept, setDelDept]   = useState<Departamento | null>(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");

  const loadDepartments = async () => {
    setLoading(true);
    setError("");

    try {
      const departments = await departmentsApi.list();
      setDepts(departments.map(mapDepartment));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível carregar os departamentos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadDepartments();
  }, []);

  const filtered = depts.filter(d =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.manager.toLowerCase().includes(search.toLowerCase())
  );

  const handleSave = async (data: DepartmentPayload) => {
    if (editDept === "new") {
      const created = await departmentsApi.create(data);
      setDepts(prev => [...prev, mapDepartment(created)]);
    } else if (editDept) {
      const updated = await departmentsApi.update(editDept.id, data);
      setDepts(prev => prev.map(d => d.id === editDept.id ? mapDepartment(updated) : d));
    }
    setEditDept(null);
  };

  const handleDelete = async () => {
    if (!delDept) return;

    await departmentsApi.remove(delDept.id);
    setDepts(prev => prev.filter(dept => dept.id !== delDept.id));
    setDelDept(null);
  };

  const cardStyle = {
    background: colors.card,
    border: `1px solid ${colors.border}`,
    boxShadow: theme === "light" ? "0 2px 12px rgba(0,0,0,0.05)" : "0 4px 20px rgba(0,0,0,0.15)",
  };

  return (
    <div className="space-y-5">
      {/* Section header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 style={{ fontFamily: "'Playfair Display',serif", color: colors.textPrimary, fontSize: "20px", fontWeight: 600 }}>Departamentos</h2>
          <p style={{ fontSize: "13px", color: colors.textMuted, fontFamily: "'Inter',sans-serif", marginTop: "3px" }}>
            Organize sua estrutura interna por departamentos
          </p>
        </div>
        <DefaultButton onClick={() => setEditDept("new")} className="whitespace-nowrap" disabled={loading}>
          <Plus size={16} /> Novo Departamento
        </DefaultButton>
      </div>

      {error && (
        <div className="flex items-center justify-between gap-3 rounded-2xl px-4 py-3" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.18)" }}>
          <div className="flex items-start gap-2">
            <AlertCircle size={15} style={{ color: "#EF4444", marginTop: "1px" }} className="shrink-0" />
            <p style={{ fontSize: "13px", color: colors.textSecondary, fontFamily: "'Inter',sans-serif", lineHeight: 1.5 }}>{error}</p>
          </div>
          <button onClick={loadDepartments} className="rounded-xl px-3 py-1.5 transition-all" style={{ fontSize: "12px", color: "#EF4444", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.18)", fontFamily: "'Inter',sans-serif", fontWeight: 500 }}>
            Tentar novamente
          </button>
        </div>
      )}

      {/* Stats strip */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Departamentos",  value: depts.length,                          color: "#3B82F6" },
          { label: "Total usuários", value: depts.reduce((a, d) => a + d.userCount, 0), color: "#14B8A6" },
          { label: "Com responsável",value: depts.filter(d => d.manager).length,   color: "#10B981" },
        ].map(s => (
          <div key={s.label} className="rounded-2xl p-4 flex items-center gap-3" style={cardStyle}>
            <div className="w-1 h-8 rounded-full" style={{ background: s.color }} />
            <div>
              <p style={{ fontSize: "22px", color: colors.textPrimary, fontFamily: "'Inter',sans-serif", fontWeight: 700, lineHeight: 1 }}>{s.value}</p>
              <p style={{ fontSize: "12px", color: colors.textMuted, fontFamily: "'Inter',sans-serif", marginTop: "3px" }}>{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 rounded-xl px-3 py-2" style={{ background: colors.card, border: `1px solid ${colors.border}` }}>
        <Search size={14} style={{ color: colors.textMuted }} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar departamento ou responsável..."
          className="flex-1 bg-transparent outline-none"
          style={{ fontSize: "13px", color: colors.textPrimary, fontFamily: "'Inter',sans-serif" }}
        />
        {search && <button onClick={() => setSearch("")} style={{ color: colors.textMuted }}><X size={13} /></button>}
      </div>

      {/* Table */}
      <div className="rounded-2xl overflow-hidden" style={cardStyle}>
        {/* Head */}
        <div className="grid px-5 py-3"
          style={{ gridTemplateColumns: "2fr 2.5fr 1.5fr 80px 120px", borderBottom: `1px solid ${colors.border}`, background: theme === "light" ? colors.surface : "rgba(255,255,255,0.02)" }}
        >
          {["Departamento", "Descrição", "Responsável", "Usuários", "Ações"].map(h => (
            <span key={h} style={{ fontSize: "11px", color: colors.textMuted, fontFamily: "'Inter',sans-serif", textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</span>
          ))}
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <span className="rounded-full border-2 animate-spin" style={{ width: "24px", height: "24px", borderColor: `${colors.borderStrong}`, borderTopColor: "#3B82F6" }} />
            <p style={{ fontSize: "13px", color: colors.textMuted, fontFamily: "'Inter',sans-serif" }}>Carregando departamentos...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <Building2 size={28} style={{ color: colors.textMuted }} />
            <p style={{ fontSize: "13px", color: colors.textMuted, fontFamily: "'Inter',sans-serif" }}>Nenhum departamento encontrado</p>
          </div>
        ) : filtered.map((dept, i) => (
          <div key={dept.id}
            className="grid items-center px-5 py-4 transition-all group"
            style={{ gridTemplateColumns: "2fr 2.5fr 1.5fr 80px 120px", borderBottom: i < filtered.length - 1 ? `1px solid ${colors.border}` : "none" }}
            onMouseEnter={e => (e.currentTarget.style.background = colors.hoverBg)}
            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
          >
            {/* Name + color */}
            <div className="flex items-center gap-3 min-w-0">
              <div className="rounded-lg flex items-center justify-center shrink-0" style={{ width: "34px", height: "34px", background: dept.color + "20" }}>
                <Building2 size={15} style={{ color: dept.color }} />
              </div>
              <span className="rounded-full px-2.5 py-1" style={{ fontSize: "12px", color: dept.color, background: dept.color + "18", fontFamily: "'Inter',sans-serif", fontWeight: 500 }}>
                {dept.name}
              </span>
            </div>

            {/* Description */}
            <p style={{ fontSize: "12px", color: colors.textSecondary, fontFamily: "'Inter',sans-serif", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", paddingRight: "16px" }}>
              {dept.description || "—"}
            </p>

            {/* Manager */}
            <p style={{ fontSize: "13px", color: colors.textPrimary, fontFamily: "'Inter',sans-serif" }}>
              {dept.manager || <span style={{ color: colors.textMuted }}>—</span>}
            </p>

            {/* User count */}
            <div className="flex items-center gap-1.5">
              <Users size={12} style={{ color: colors.textMuted }} />
              <span style={{ fontSize: "13px", color: colors.textPrimary, fontFamily: "'Inter',sans-serif", fontWeight: 500 }}>{dept.userCount}</span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
              <button onClick={() => setEditDept(dept)}
                className="rounded-lg p-1.5 transition-all" style={{ color: colors.textMuted }}
                title="Editar"
                onMouseEnter={e => (e.currentTarget.style.color = "#3B82F6")}
                onMouseLeave={e => (e.currentTarget.style.color = colors.textMuted)}
              >
                <Pencil size={14} />
              </button>
              <button onClick={() => setDelDept(dept)}
                className="rounded-lg p-1.5 transition-all" style={{ color: colors.textMuted }}
                title="Remover"
                onMouseEnter={e => (e.currentTarget.style.color = "#EF4444")}
                onMouseLeave={e => (e.currentTarget.style.color = colors.textMuted)}
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modals */}
      {editDept !== null && (
        <DeptModal dept={editDept === "new" ? null : editDept} onClose={() => setEditDept(null)} onSave={handleSave} />
      )}
      {delDept && (
        <DeleteDeptModal dept={delDept} onClose={() => setDelDept(null)} onConfirm={handleDelete} />
      )}
    </div>
  );
}

// ── Placeholder sections ───────────────────────────────────────────────
function ToggleRow({ label, description, value, onChange }: { label: string; description: string; value: boolean; onChange: (v: boolean) => void }) {
  const { colors } = useTheme();
  return (
    <div className="flex items-center justify-between py-4" style={{ borderBottom: `1px solid ${colors.border}` }}>
      <div className="flex-1 pr-8">
        <p style={{ fontSize: "14px", color: colors.textPrimary, fontFamily: "'Inter',sans-serif", fontWeight: 500 }}>{label}</p>
        <p style={{ fontSize: "12px", color: colors.textMuted, fontFamily: "'Inter',sans-serif", marginTop: "2px" }}>{description}</p>
      </div>
      <button onClick={() => onChange(!value)} className="rounded-full transition-all duration-300 shrink-0"
        style={{ width: "44px", height: "24px", background: value ? "#3B82F6" : "#64748B", position: "relative" }}
      >
        <div className="absolute top-1 rounded-full bg-white transition-all duration-300"
          style={{ width: "16px", height: "16px", left: value ? "24px" : "4px" }}
        />
      </button>
    </div>
  );
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  const { colors, theme } = useTheme();
  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: colors.card, border: `1px solid ${colors.border}`, boxShadow: theme === "light" ? "0 2px 12px rgba(0,0,0,0.05)" : "0 4px 20px rgba(0,0,0,0.15)" }}>
      <div className="px-6 py-4" style={{ borderBottom: `1px solid ${colors.border}`, background: theme === "light" ? colors.surface : "rgba(255,255,255,0.02)" }}>
        <h3 style={{ fontFamily: "'Playfair Display',serif", color: colors.textPrimary, fontSize: "15px", fontWeight: 600 }}>{title}</h3>
      </div>
      <div className="px-6 py-2">{children}</div>
    </div>
  );
}

function Notificacoes() {
  const [state, setState] = useState({ email: true, sms: false, push: true, contrato: true, financeiro: true, sistema: false, seguranca: true });
  const set = (k: string) => (v: boolean) => setState(s => ({ ...s, [k]: v }));
  const { colors } = useTheme();
  return (
    <div className="space-y-5">
      <div>
        <h2 style={{ fontFamily: "'Playfair Display',serif", color: colors.textPrimary, fontSize: "20px", fontWeight: 600 }}>Notificações</h2>
        <p style={{ fontSize: "13px", color: colors.textMuted, fontFamily: "'Inter',sans-serif", marginTop: "3px" }}>Configure como e quando deseja receber alertas</p>
      </div>
      <SectionCard title="Canais">
        <ToggleRow label="E-mail" description="Receber notificações por e-mail" value={state.email} onChange={set("email")} />
        <ToggleRow label="SMS" description="Receber alertas via SMS" value={state.sms} onChange={set("sms")} />
        <ToggleRow label="Push" description="Notificações no navegador" value={state.push} onChange={set("push")} />
      </SectionCard>
      <SectionCard title="Eventos">
        <ToggleRow label="Contratos" description="Vencimentos e renovações de contratos" value={state.contrato} onChange={set("contrato")} />
        <ToggleRow label="Financeiro" description="Pagamentos, faturas e cobranças" value={state.financeiro} onChange={set("financeiro")} />
        <ToggleRow label="Sistema" description="Manutenções e atualizações" value={state.sistema} onChange={set("sistema")} />
        <ToggleRow label="Segurança" description="Novos acessos e alertas de segurança" value={state.seguranca} onChange={set("seguranca")} />
      </SectionCard>
    </div>
  );
}

function Seguranca() {
  const [state, setState] = useState({ twoFA: true, sessionTimeout: true, ipWhitelist: false, auditLog: true });
  const set = (k: string) => (v: boolean) => setState(s => ({ ...s, [k]: v }));
  const { colors } = useTheme();
  return (
    <div className="space-y-5">
      <div>
        <h2 style={{ fontFamily: "'Playfair Display',serif", color: colors.textPrimary, fontSize: "20px", fontWeight: 600 }}>Segurança</h2>
        <p style={{ fontSize: "13px", color: colors.textMuted, fontFamily: "'Inter',sans-serif", marginTop: "3px" }}>Políticas de acesso e proteção da plataforma</p>
      </div>
      <SectionCard title="Autenticação">
        <ToggleRow label="2FA obrigatório" description="Exigir autenticação em dois fatores para todos os usuários" value={state.twoFA} onChange={set("twoFA")} />
        <ToggleRow label="Timeout de sessão" description="Encerrar sessão após 30 minutos de inatividade" value={state.sessionTimeout} onChange={set("sessionTimeout")} />
        <ToggleRow label="Whitelist de IPs" description="Permitir acesso apenas de IPs autorizados" value={state.ipWhitelist} onChange={set("ipWhitelist")} />
      </SectionCard>
      <SectionCard title="Auditoria">
        <ToggleRow label="Log de auditoria" description="Registrar todas as ações dos usuários" value={state.auditLog} onChange={set("auditLog")} />
      </SectionCard>
      <div className="rounded-2xl p-4 flex items-center justify-between" style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.15)" }}>
        <div>
          <p style={{ fontSize: "14px", color: colors.textPrimary, fontFamily: "'Inter',sans-serif", fontWeight: 500 }}>Revogar todas as sessões ativas</p>
          <p style={{ fontSize: "12px", color: colors.textMuted, fontFamily: "'Inter',sans-serif", marginTop: "2px" }}>Todos os usuários serão desconectados imediatamente</p>
        </div>
        <button className="flex items-center gap-2 rounded-xl px-4 py-2 transition-all" style={{ fontSize: "13px", color: "#EF4444", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", fontFamily: "'Inter',sans-serif", fontWeight: 500 }}>
          <RefreshCw size={13} /> Revogar
        </button>
      </div>
    </div>
  );
}

function Integracoes() {
  const { colors } = useTheme();
  const integrations = [
    { name: "Slack",     desc: "Envio de alertas e notificações",         status: true,  icon: "💬" },
    { name: "Webhook",   desc: "Receber eventos em endpoint externo",      status: false, icon: "🔗" },
    { name: "Zapier",    desc: "Automações com +5000 apps",               status: false, icon: "⚡" },
    { name: "Stripe",    desc: "Processamento de pagamentos",             status: true,  icon: "💳" },
    { name: "SendGrid",  desc: "Envio de e-mails transacionais",          status: true,  icon: "📧" },
  ];
  return (
    <div className="space-y-5">
      <div>
        <h2 style={{ fontFamily: "'Playfair Display',serif", color: colors.textPrimary, fontSize: "20px", fontWeight: 600 }}>Integrações</h2>
        <p style={{ fontSize: "13px", color: colors.textMuted, fontFamily: "'Inter',sans-serif", marginTop: "3px" }}>Conecte o ORQUESTRA com ferramentas externas</p>
      </div>
      <div className="space-y-3">
        {integrations.map(int => (
          <div key={int.name} className="flex items-center justify-between rounded-2xl p-4" style={{ background: colors.card, border: `1px solid ${colors.border}` }}>
            <div className="flex items-center gap-4">
              <div className="rounded-xl flex items-center justify-center shrink-0" style={{ width: "42px", height: "42px", background: colors.surface, fontSize: "20px" }}>
                {int.icon}
              </div>
              <div>
                <p style={{ fontSize: "14px", color: colors.textPrimary, fontFamily: "'Inter',sans-serif", fontWeight: 500 }}>{int.name}</p>
                <p style={{ fontSize: "12px", color: colors.textMuted, fontFamily: "'Inter',sans-serif" }}>{int.desc}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="rounded-full px-2.5 py-1" style={{ fontSize: "11px", color: int.status ? "#10B981" : colors.textMuted, background: int.status ? "rgba(16,185,129,0.1)" : colors.surface, fontFamily: "'Inter',sans-serif", fontWeight: 500 }}>
                {int.status ? "Conectado" : "Desconectado"}
              </span>
              <button className="rounded-xl px-3 py-1.5 transition-all" style={{ fontSize: "12px", color: int.status ? "#EF4444" : "#3B82F6", background: int.status ? "rgba(239,68,68,0.08)" : "rgba(59,130,246,0.1)", fontFamily: "'Inter',sans-serif", fontWeight: 500 }}>
                {int.status ? "Desconectar" : "Conectar"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Aparencia() {
  const { colors, theme, toggle } = useTheme();
  return (
    <div className="space-y-5">
      <div>
        <h2 style={{ fontFamily: "'Playfair Display',serif", color: colors.textPrimary, fontSize: "20px", fontWeight: 600 }}>Aparência</h2>
        <p style={{ fontSize: "13px", color: colors.textMuted, fontFamily: "'Inter',sans-serif", marginTop: "3px" }}>Personalize a interface da plataforma</p>
      </div>
      <SectionCard title="Tema">
        <div className="flex items-center justify-between py-4">
          <div>
            <p style={{ fontSize: "14px", color: colors.textPrimary, fontFamily: "'Inter',sans-serif", fontWeight: 500 }}>Tema atual: <strong>{theme === "dark" ? "Escuro" : "Claro"}</strong></p>
            <p style={{ fontSize: "12px", color: colors.textMuted, fontFamily: "'Inter',sans-serif", marginTop: "2px" }}>Alterne também pelo botão no canto superior direito</p>
          </div>
          <DefaultButton onClick={toggle}>
            <Palette size={14} /> Alternar tema
          </DefaultButton>
        </div>
      </SectionCard>
      <div className="grid grid-cols-2 gap-4">
        {[
          { label: "Dark Premium", bg: "#0B0F14", accent: "#3B82F6", active: theme === "dark" },
          { label: "Light Clean",  bg: "#F1F5F9", accent: "#3B82F6", active: theme === "light" },
        ].map(t => (
          <button key={t.label} onClick={toggle}
            className="rounded-2xl p-4 transition-all text-left"
            style={{ background: t.bg, border: `2px solid ${t.active ? t.accent : colors.border}`, boxShadow: t.active ? `0 0 0 1px ${t.accent}30, 0 4px 20px ${t.accent}15` : "none" }}
          >
            <div className="flex gap-1.5 mb-3">
              {["#EF4444","#F59E0B","#10B981"].map(c => <div key={c} className="rounded-full" style={{ width: "8px", height: "8px", background: c }} />)}
            </div>
            <div className="space-y-1.5">
              <div className="rounded" style={{ height: "8px", background: t.accent + "40", width: "60%" }} />
              <div className="rounded" style={{ height: "6px", background: t.active ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.1)", width: "80%" }} />
              <div className="rounded" style={{ height: "6px", background: t.active ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.07)", width: "50%" }} />
            </div>
            <p style={{ fontSize: "12px", color: t.active ? t.accent : "#64748B", fontFamily: "'Inter',sans-serif", fontWeight: t.active ? 600 : 400, marginTop: "10px" }}>
              {t.label} {t.active && "✓"}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}

const perfilColors = ["#3B82F6", "#14B8A6", "#8B5CF6", "#F59E0B", "#10B981", "#EF4444", "#EC4899", "#94A3B8"];
const DEFAULT_BUTTON_GRADIENT = "linear-gradient(135deg, #6366F1, #4338CA)";
const perfilActions: { key: PermissionAction; label: string; color: string }[] = [
  { key: "ver", label: "Ver", color: "#3B82F6" },
  { key: "criar", label: "Criar", color: "#10B981" },
  { key: "editar", label: "Editar", color: "#F59E0B" },
  { key: "excluir", label: "Excluir", color: "#EF4444" },
];

function PerfilModal({ perfil, templatePermissions, onClose, onSave }: { perfil?: AccessProfile | null; templatePermissions: AccessProfilePermission[]; onClose: () => void; onSave: (payload: AccessProfilePayload) => Promise<void> }) {
  const { colors, theme } = useTheme();
  const isEdit = !!perfil;
  const [tab, setTab] = useState<"geral" | "permissoes">("geral");
  const [form, setForm] = useState<AccessProfilePayload>({
    name: perfil?.name ?? "",
    description: perfil?.description ?? "",
    color: perfil?.color ?? "#3B82F6",
    scope: perfil?.scope ?? "platform",
    permissions: perfil?.permissions ?? templatePermissions.map(permission => ({ ...permission })),
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const permissionsReady = form.permissions.length > 0;

  const set = (key: keyof AccessProfilePayload) => (value: any) => setForm(current => ({ ...current, [key]: value }));

  const validate = () => {
    const nextErrors: Record<string, string> = {};
    if (!form.name.trim()) nextErrors.name = "Nome obrigatório";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const togglePermission = (index: number, action: PermissionAction) => {
    setForm(current => ({
      ...current,
      permissions: current.permissions.map((permission, permissionIndex) => (
        permissionIndex === index ? { ...permission, [action]: !permission[action] } : permission
      )),
    }));
  };

  const toggleColumn = (action: PermissionAction) => {
    const checked = form.permissions.every(permission => permission[action]);

    setForm(current => ({
      ...current,
      permissions: current.permissions.map(permission => ({ ...permission, [action]: !checked })),
    }));
  };

  const handleSave = async () => {
    if (!validate()) return;
    if (!permissionsReady) {
      setSaveError("Aguarde o carregamento das permissões antes de salvar o perfil.");
      return;
    }

    setSaving(true);
    setSaveError("");

    try {
      await onSave(form);
      onClose();
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Não foi possível salvar o perfil.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(8px)" }} onClick={onClose}>
      <div className="w-full max-w-[760px] rounded-2xl overflow-hidden flex flex-col" style={{ background: colors.card, border: `1px solid ${colors.borderStrong}`, boxShadow: "0 32px 80px rgba(0,0,0,0.4)", maxHeight: "90vh" }} onClick={event => event.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 shrink-0" style={{ borderBottom: `1px solid ${colors.border}` }}>
          <div className="flex items-center gap-3">
            <div className="rounded-xl flex items-center justify-center" style={{ width: "34px", height: "34px", background: `${form.color}25` }}>
              <Shield size={16} style={{ color: form.color }} />
            </div>
            <h2 style={{ fontFamily: "'Playfair Display',serif", color: colors.textPrimary, fontSize: "18px", fontWeight: 600 }}>
              {isEdit ? `Editar - ${perfil.name}` : "Novo Perfil de Acesso"}
            </h2>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 transition-all" style={{ color: colors.textMuted }}>
            <X size={16} />
          </button>
        </div>

        <div className="flex gap-1 px-6 pt-4">
          {[
            { id: "geral", label: "Geral" },
            { id: "permissoes", label: "Permissões" },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setTab(item.id as "geral" | "permissoes")}
              className="rounded-xl px-4 py-2 transition-all"
              style={{ fontSize: "13px", fontFamily: "'Inter',sans-serif", background: tab === item.id ? DEFAULT_BUTTON_GRADIENT : colors.surface, color: tab === item.id ? "#fff" : colors.textMuted, border: `1px solid ${tab === item.id ? "transparent" : colors.border}` }}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {tab === "geral" ? (
            <div className="grid grid-cols-[1fr_220px] gap-5">
              <div className="space-y-4">
                <Field label="Nome do perfil" placeholder="Ex: Suporte, Financeiro..." value={form.name} onChange={set("name")} icon={Shield} required />
                {errors.name && <p style={{ fontSize: "11px", color: "#EF4444", marginTop: "-10px", fontFamily: "'Inter',sans-serif" }}>{errors.name}</p>}

                <div>
                  <label style={{ fontSize: "13px", color: colors.textSecondary, display: "block", marginBottom: "7px", fontFamily: "'Inter',sans-serif", fontWeight: 500 }}>
                    Descrição
                  </label>
                  <textarea
                    value={form.description ?? ""}
                    onChange={event => set("description")(event.target.value)}
                    placeholder="Descreva as responsabilidades deste perfil..."
                    rows={4}
                    className="w-full rounded-xl px-4 py-3 outline-none resize-none transition-all"
                    style={{ background: colors.inputBg, border: `1px solid ${colors.border}`, color: colors.textPrimary, fontSize: "14px", fontFamily: "'Inter',sans-serif", lineHeight: 1.6 }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: "13px", color: colors.textSecondary, display: "block", marginBottom: "10px", fontFamily: "'Inter',sans-serif", fontWeight: 500 }}>
                    Cor de identificação
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {perfilColors.map(color => (
                      <button key={color} onClick={() => set("color")(color)} className="rounded-full transition-all hover:scale-110" style={{ width: "28px", height: "28px", background: color, outline: form.color === color ? `3px solid ${color}` : "3px solid transparent", outlineOffset: "2px" }} />
                    ))}
                  </div>
                </div>
              </div>

              <div className="rounded-2xl p-4 h-fit" style={{ background: colors.surface, border: `1px solid ${colors.border}` }}>
                <div className="rounded-xl flex items-center justify-center mb-3" style={{ width: "42px", height: "42px", background: `${form.color}20` }}>
                  <Shield size={20} style={{ color: form.color }} />
                </div>
                <p style={{ fontFamily: "'Playfair Display',serif", fontSize: "17px", color: colors.textPrimary, fontWeight: 600 }}>{form.name || "Nome do perfil"}</p>
                <p style={{ fontSize: "12px", color: colors.textMuted, fontFamily: "'Inter',sans-serif", marginTop: "4px", lineHeight: 1.5 }}>
                  {form.description || "Descrição do perfil de acesso."}
                </p>
                <div className="grid grid-cols-2 gap-2 mt-4">
                  {perfilActions.map(action => (
                    <div key={action.key} className="rounded-xl px-3 py-2" style={{ background: theme === "dark" ? "rgba(255,255,255,0.03)" : colors.card }}>
                      <p style={{ fontSize: "16px", color: action.color, fontFamily: "'Inter',sans-serif", fontWeight: 700 }}>{form.permissions.filter(permission => permission[action.key]).length}</p>
                      <p style={{ fontSize: "10px", color: colors.textMuted, fontFamily: "'Inter',sans-serif" }}>{action.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            permissionsReady ? (
              <div className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${colors.border}` }}>
                <div className="grid px-5 py-3" style={{ gridTemplateColumns: "1.8fr 1fr 1fr 1fr 1fr", background: colors.surface, borderBottom: `1px solid ${colors.border}` }}>
                  <span style={{ fontSize: "11px", color: colors.textMuted, fontFamily: "'Inter',sans-serif", textTransform: "uppercase", letterSpacing: "0.06em" }}>Módulo</span>
                  {perfilActions.map(action => (
                    <button key={action.key} onClick={() => toggleColumn(action.key)} className="text-center" style={{ fontSize: "11px", color: action.color, fontFamily: "'Inter',sans-serif", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600 }}>
                      {action.label}
                    </button>
                  ))}
                </div>

                {form.permissions.map((permission, index) => (
                  <div key={permission.module} className="grid items-center px-5 py-3" style={{ gridTemplateColumns: "1.8fr 1fr 1fr 1fr 1fr", borderBottom: index < form.permissions.length - 1 ? `1px solid ${colors.border}` : "none" }}>
                    <div className="flex items-center gap-2">
                      <span style={{ fontSize: "15px" }}>{permission.icon}</span>
                      <span style={{ fontSize: "13px", color: colors.textSecondary, fontFamily: "'Inter',sans-serif" }}>{permission.module}</span>
                    </div>
                    {perfilActions.map(action => (
                      <div key={action.key} className="flex justify-center">
                        <button
                          onClick={() => togglePermission(index, action.key)}
                          className="rounded-full flex items-center justify-center transition-all"
                          style={{ width: "28px", height: "28px", background: permission[action.key] ? `${action.color}18` : colors.surface, border: `1px solid ${permission[action.key] ? `${action.color}40` : colors.border}` }}
                        >
                          {permission[action.key] ? <CheckCircle2 size={15} style={{ color: action.color }} /> : <X size={13} style={{ color: colors.textMuted }} />}
                        </button>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-2xl py-12 gap-3" style={{ border: `1px solid ${colors.border}`, background: colors.surface }}>
                <AlertCircle size={24} style={{ color: "#F59E0B" }} />
                <p style={{ fontSize: "13px", color: colors.textSecondary, fontFamily: "'Inter',sans-serif" }}>
                  Permissões ainda não carregadas.
                </p>
              </div>
            )
          )}

          {saveError && (
            <div className="flex items-start gap-2 rounded-xl px-3 py-2 mt-4" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.18)" }}>
              <AlertCircle size={14} style={{ color: "#EF4444", marginTop: "1px" }} className="shrink-0" />
              <p style={{ fontSize: "12px", color: colors.textSecondary, fontFamily: "'Inter',sans-serif", lineHeight: 1.5 }}>{saveError}</p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 px-6 py-4" style={{ borderTop: `1px solid ${colors.border}` }}>
          <button onClick={onClose} className="rounded-xl px-4 py-2 transition-all" style={{ fontSize: "13px", color: colors.textSecondary, background: colors.surface, border: `1px solid ${colors.border}`, fontFamily: "'Inter',sans-serif" }}>
            Cancelar
          </button>
          <DefaultButton onClick={handleSave} disabled={saving || !permissionsReady} className="px-5">
            {saving ? <><span className="rounded-full border-2 animate-spin" style={{ width: "12px", height: "12px", borderColor: "rgba(255,255,255,0.3)", borderTopColor: "#fff" }} /> Salvando...</> : <><CheckCheck size={14} />{isEdit ? "Salvar alterações" : "Criar perfil"}</>}
          </DefaultButton>
        </div>
      </div>
    </div>
  );
}

function DeletePerfilModal({ perfil, onClose, onConfirm }: { perfil: AccessProfile; onClose: () => void; onConfirm: () => Promise<void> }) {
  const { colors } = useTheme();
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const handleDelete = async () => {
    setDeleting(true);
    setDeleteError("");

    try {
      await onConfirm();
    } catch (error) {
      setDeleteError(error instanceof Error ? error.message : "Não foi possível remover o perfil.");
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(8px)" }} onClick={onClose}>
      <div className="w-full max-w-[420px] rounded-2xl p-6" style={{ background: colors.card, border: `1px solid ${colors.borderStrong}`, boxShadow: "0 32px 80px rgba(0,0,0,0.4)" }} onClick={event => event.stopPropagation()}>
        <div className="flex items-center gap-4 mb-5">
          <div className="rounded-2xl flex items-center justify-center shrink-0" style={{ width: "46px", height: "46px", background: "rgba(239,68,68,0.1)" }}>
            <Trash2 size={20} style={{ color: "#EF4444" }} />
          </div>
          <div>
            <h3 style={{ fontFamily: "'Playfair Display',serif", color: colors.textPrimary, fontSize: "17px", fontWeight: 600 }}>Remover perfil</h3>
            <p style={{ fontSize: "12px", color: colors.textMuted, fontFamily: "'Inter',sans-serif" }}>Esta ação não pode ser desfeita.</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-4 rounded-xl mb-4" style={{ background: colors.surface, border: `1px solid ${colors.border}` }}>
          <div className="rounded-xl flex items-center justify-center shrink-0" style={{ width: "34px", height: "34px", background: `${perfil.color}20` }}>
            <Shield size={15} style={{ color: perfil.color }} />
          </div>
          <div>
            <p style={{ fontSize: "14px", color: colors.textPrimary, fontFamily: "'Inter',sans-serif", fontWeight: 500 }}>{perfil.name}</p>
            <p style={{ fontSize: "12px", color: colors.textMuted, fontFamily: "'Inter',sans-serif" }}>{perfil.userCount} usuário{perfil.userCount !== 1 ? "s" : ""} com este perfil</p>
          </div>
        </div>
        {perfil.system && (
          <p style={{ fontSize: "12px", color: colors.textMuted, fontFamily: "'Inter',sans-serif", marginBottom: "12px" }}>
            Perfis do sistema não podem ser removidos.
          </p>
        )}
        {deleteError && (
          <div className="rounded-xl px-3 py-2 mb-3" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.18)", color: colors.textSecondary, fontSize: "12px", fontFamily: "'Inter',sans-serif" }}>
            {deleteError}
          </div>
        )}
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 rounded-xl py-2.5 transition-all" style={{ fontSize: "13px", color: colors.textSecondary, background: colors.surface, border: `1px solid ${colors.border}`, fontFamily: "'Inter',sans-serif" }}>
            Cancelar
          </button>
          <button onClick={handleDelete} disabled={deleting || perfil.system} className="flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 hover:opacity-90 disabled:opacity-40 transition-all" style={{ background: "#EF4444", color: "#fff", fontSize: "13px", fontFamily: "'Inter',sans-serif", fontWeight: 500 }}>
            {deleting ? <span className="rounded-full border-2 animate-spin" style={{ width: "13px", height: "13px", borderColor: "rgba(255,255,255,0.3)", borderTopColor: "#fff" }} /> : <><Trash2 size={13} /> Remover</>}
          </button>
        </div>
      </div>
    </div>
  );
}

function PerfisAcesso() {
  const { colors, theme } = useTheme();
  const [perfis, setPerfis] = useState<AccessProfile[]>([]);
  const [templatePermissions, setTemplatePermissions] = useState<AccessProfilePermission[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editPerfil, setEditPerfil] = useState<AccessProfile | null | "new">(null);
  const [delPerfil, setDelPerfil] = useState<AccessProfile | null>(null);
  const [expanded, setExpanded] = useState<number | null>(null);
  const permissionsReady = templatePermissions.length > 0;
  const canCreatePerfil = !loading && permissionsReady;

  const loadPerfis = async (query = search) => {
    setLoading(true);
    setError("");

    try {
      const response = await accessProfilesApi.list({ search: query });
      setPerfis(response.data);
      setTemplatePermissions(response.meta?.modules.map(module => ({
        module: module.module,
        key: module.key,
        icon: module.icon,
        ver: false,
        criar: false,
        editar: false,
        excluir: false,
      })) ?? response.data[0]?.permissions.map(permission => ({ ...permission, ver: false, criar: false, editar: false, excluir: false })) ?? []);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Não foi possível carregar os perfis.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPerfis("");
  }, []);

  const handleSearch = (value: string) => {
    setSearch(value);
    window.clearTimeout((handleSearch as any).timer);
    (handleSearch as any).timer = window.setTimeout(() => loadPerfis(value), 250);
  };

  const handleSave = async (payload: AccessProfilePayload) => {
    if (editPerfil === "new") {
      await accessProfilesApi.create(payload);
    } else if (editPerfil) {
      await accessProfilesApi.update(editPerfil.id, payload);
    }

    await loadPerfis();
  };

  const handleDelete = async () => {
    if (!delPerfil) return;
    await accessProfilesApi.remove(delPerfil.id);
    setDelPerfil(null);
    await loadPerfis();
  };

  const cardStyle = {
    background: colors.card,
    border: `1px solid ${colors.border}`,
    boxShadow: theme === "light" ? "0 2px 12px rgba(0,0,0,0.05)" : "0 4px 20px rgba(0,0,0,0.15)",
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 style={{ fontFamily: "'Playfair Display',serif", color: colors.textPrimary, fontSize: "20px", fontWeight: 600 }}>Perfis de Acesso</h2>
          <p style={{ fontSize: "13px", color: colors.textMuted, fontFamily: "'Inter',sans-serif", marginTop: "3px" }}>
            Defina o que cada perfil pode visualizar e executar no sistema
          </p>
        </div>
        <DefaultButton
          onClick={() => {
            if (canCreatePerfil) setEditPerfil("new");
          }}
          disabled={!canCreatePerfil}
          title={!canCreatePerfil ? "Aguarde as permissões carregarem" : undefined}
        >
          {loading ? <span className="rounded-full border-2 animate-spin" style={{ width: "12px", height: "12px", borderColor: "rgba(255,255,255,0.3)", borderTopColor: "#fff" }} /> : <Plus size={15} />}
          Novo Perfil
        </DefaultButton>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Perfis ativos", value: perfis.length, color: "#3B82F6" },
          { label: "Usuários cobertos", value: perfis.reduce((total, perfil) => total + perfil.userCount, 0), color: "#14B8A6" },
          { label: "Perfis do sistema", value: perfis.filter(perfil => perfil.system).length, color: "#8B5CF6" },
        ].map(item => (
          <div key={item.label} className="rounded-2xl p-4 flex items-center gap-3" style={cardStyle}>
            <div className="w-1 h-8 rounded-full" style={{ background: item.color }} />
            <div>
              {loading ? <div className="rounded-full" style={{ width: "48px", height: "22px", background: colors.hoverBg }} /> : <p style={{ fontSize: "22px", color: colors.textPrimary, fontFamily: "'Inter',sans-serif", fontWeight: 700, lineHeight: 1 }}>{item.value}</p>}
              <p style={{ fontSize: "12px", color: colors.textMuted, fontFamily: "'Inter',sans-serif", marginTop: "3px" }}>{item.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 rounded-xl px-3 py-2" style={{ background: colors.card, border: `1px solid ${colors.border}` }}>
        <Search size={14} style={{ color: colors.textMuted }} />
        <input value={search} onChange={event => handleSearch(event.target.value)} placeholder="Buscar perfil..." className="flex-1 bg-transparent outline-none" style={{ fontSize: "13px", color: colors.textPrimary, fontFamily: "'Inter',sans-serif" }} />
        {search && <button onClick={() => handleSearch("")} style={{ color: colors.textMuted }}><X size={13} /></button>}
      </div>

      {error && (
        <div className="rounded-xl px-4 py-3" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.18)", color: colors.textSecondary, fontSize: "13px", fontFamily: "'Inter',sans-serif" }}>
          {error}
        </div>
      )}

      {!loading && !error && !permissionsReady && (
        <div className="flex items-start gap-2 rounded-xl px-4 py-3" style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.25)" }}>
          <AlertCircle size={15} style={{ color: "#F59E0B", marginTop: "1px" }} className="shrink-0" />
          <p style={{ fontSize: "13px", color: colors.textSecondary, fontFamily: "'Inter',sans-serif", lineHeight: 1.5 }}>
            As permissões de módulos ainda não foram carregadas. Recarregue a tela antes de criar um perfil.
          </p>
        </div>
      )}

      <div className="space-y-3">
        {loading ? (
          Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="rounded-2xl p-5 flex items-center gap-4" style={cardStyle}>
              <div className="rounded-xl" style={{ width: "40px", height: "40px", background: colors.hoverBg }} />
              <div className="flex-1">
                <div className="rounded-full mb-2" style={{ width: "32%", height: "15px", background: colors.hoverBg }} />
                <div className="rounded-full" style={{ width: "58%", height: "12px", background: colors.hoverBg }} />
              </div>
              <span className="rounded-full border-2 animate-spin" style={{ width: "18px", height: "18px", borderColor: "rgba(59,130,246,0.18)", borderTopColor: "#3B82F6" }} />
            </div>
          ))
        ) : perfis.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <Shield size={28} style={{ color: colors.textMuted }} />
            <p style={{ fontSize: "13px", color: colors.textMuted, fontFamily: "'Inter',sans-serif" }}>Nenhum perfil encontrado</p>
          </div>
        ) : perfis.map(perfil => {
          const isExpanded = expanded === perfil.id;

          return (
            <div key={perfil.id} className="rounded-2xl overflow-hidden transition-all" style={cardStyle}>
              <div className="flex items-center justify-between px-5 py-4 cursor-pointer transition-all" onClick={() => setExpanded(isExpanded ? null : perfil.id)} onMouseEnter={event => (event.currentTarget.style.background = colors.hoverBg)} onMouseLeave={event => (event.currentTarget.style.background = "transparent")}>
                <div className="flex items-center gap-4">
                  <div className="rounded-xl flex items-center justify-center shrink-0" style={{ width: "40px", height: "40px", background: `${perfil.color}20` }}>
                    <Shield size={18} style={{ color: perfil.color }} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p style={{ fontSize: "15px", color: colors.textPrimary, fontFamily: "'Playfair Display',serif", fontWeight: 600 }}>{perfil.name}</p>
                      {perfil.system && <span className="rounded-full px-2 py-0.5" style={{ fontSize: "10px", color: "#8B5CF6", background: "rgba(139,92,246,0.12)", fontFamily: "'Inter',sans-serif", fontWeight: 600 }}>Sistema</span>}
                    </div>
                    <p style={{ fontSize: "12px", color: colors.textMuted, fontFamily: "'Inter',sans-serif", marginTop: "2px" }}>{perfil.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="hidden md:flex items-center gap-1.5">
                    {perfilActions.map(action => {
                      const count = perfil.permissions.filter(permission => permission[action.key]).length;
                      return count > 0 ? <span key={action.key} className="rounded-full px-2 py-0.5" style={{ fontSize: "10px", color: action.color, background: `${action.color}18`, fontFamily: "'Inter',sans-serif", fontWeight: 600 }}>{action.label} {count}</span> : null;
                    })}
                  </div>

                  <div className="flex items-center gap-1 rounded-full px-2.5 py-1" style={{ background: colors.surface, border: `1px solid ${colors.border}` }}>
                    <Users size={11} style={{ color: colors.textMuted }} />
                    <span style={{ fontSize: "12px", color: colors.textPrimary, fontFamily: "'Inter',sans-serif", fontWeight: 500 }}>{perfil.userCount}</span>
                  </div>

                  <div className="flex items-center gap-1" onClick={event => event.stopPropagation()}>
                    <button onClick={() => setEditPerfil(perfil)} className="rounded-lg p-1.5 transition-all" style={{ color: colors.textMuted }} onMouseEnter={event => (event.currentTarget.style.color = "#3B82F6")} onMouseLeave={event => (event.currentTarget.style.color = colors.textMuted)}>
                      <Pencil size={14} />
                    </button>
                    {!perfil.system && (
                      <button onClick={() => setDelPerfil(perfil)} className="rounded-lg p-1.5 transition-all" style={{ color: colors.textMuted }} onMouseEnter={event => (event.currentTarget.style.color = "#EF4444")} onMouseLeave={event => (event.currentTarget.style.color = colors.textMuted)}>
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>

                  <ChevronRight size={15} style={{ color: colors.textMuted, transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.2s" }} />
                </div>
              </div>

              {isExpanded && (
                <div style={{ borderTop: `1px solid ${colors.border}` }}>
                  <div className="grid px-5 py-2.5" style={{ gridTemplateColumns: "1.8fr 1fr 1fr 1fr 1fr", background: theme === "dark" ? "rgba(255,255,255,0.02)" : colors.surface, borderBottom: `1px solid ${colors.border}` }}>
                    <span style={{ fontSize: "11px", color: colors.textMuted, fontFamily: "'Inter',sans-serif", textTransform: "uppercase", letterSpacing: "0.06em" }}>Módulo</span>
                    {perfilActions.map(action => <span key={action.key} className="text-center" style={{ fontSize: "11px", color: action.color, fontFamily: "'Inter',sans-serif", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600 }}>{action.label}</span>)}
                  </div>
                  {perfil.permissions.map((permission, index) => (
                    <div key={permission.module} className="grid items-center px-5 py-3 transition-all" style={{ gridTemplateColumns: "1.8fr 1fr 1fr 1fr 1fr", borderBottom: index < perfil.permissions.length - 1 ? `1px solid ${colors.border}` : "none" }}>
                      <div className="flex items-center gap-2">
                        <span style={{ fontSize: "14px" }}>{permission.icon}</span>
                        <span style={{ fontSize: "13px", color: colors.textSecondary, fontFamily: "'Inter',sans-serif" }}>{permission.module}</span>
                      </div>
                      {perfilActions.map(action => (
                        <div key={action.key} className="flex justify-center">
                          <div className="rounded-full flex items-center justify-center" style={{ width: "24px", height: "24px", background: permission[action.key] ? `${action.color}15` : "transparent" }}>
                            {permission[action.key] ? <CheckCircle2 size={14} style={{ color: action.color }} /> : <div className="rounded-full" style={{ width: "5px", height: "5px", background: colors.border }} />}
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {editPerfil !== null && (
        <PerfilModal perfil={editPerfil === "new" ? null : editPerfil} templatePermissions={templatePermissions} onClose={() => setEditPerfil(null)} onSave={handleSave} />
      )}
      {delPerfil && (
        <DeletePerfilModal perfil={delPerfil} onClose={() => setDelPerfil(null)} onConfirm={handleDelete} />
      )}
    </div>
  );
}

function PlaHolderSection({ id }: { id: string }) {
  const { colors } = useTheme();
  const item = submenu.find(s => s.id === id);
  if (!item) return null;
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <div className="rounded-2xl flex items-center justify-center" style={{ width: "60px", height: "60px", background: "rgba(59,130,246,0.1)" }}>
        <item.icon size={28} style={{ color: "#3B82F6" }} />
      </div>
      <h2 style={{ fontFamily: "'Playfair Display',serif", color: colors.textPrimary, fontSize: "20px", fontWeight: 600 }}>{item.label}</h2>
      <p style={{ fontSize: "14px", color: colors.textMuted, fontFamily: "'Inter',sans-serif", textAlign: "center", maxWidth: "300px" }}>
        Esta seção está em desenvolvimento e estará disponível em breve.
      </p>
    </div>
  );
}

// ── Módulos ────────────────────────────────────────────────────────────
function LoadingBlock({ width = "100%", height = 12, className = "" }: { width?: string | number; height?: string | number; className?: string }) {
  const { colors } = useTheme();
  return <div className={`rounded-full animate-pulse ${className}`} style={{ width, height, background: colors.hoverBg }} />;
}

function Modulos() {
  const { colors, theme, modules, setModuleEnabled, syncModulesFromApi } = useTheme();
  const [apiModules, setApiModules] = useState<ApiModule[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);

  const displayModules = apiModules.length > 0
    ? apiModules.map((apiModule) => {
        const localModule = modules.find((module) => module.apiSlug === apiModule.slug);

        return {
          id: localModule?.id ?? apiModule.slug,
          apiId: apiModule.id,
          apiSlug: apiModule.slug,
          label: apiModule.name,
          description: apiModule.description ?? localModule?.description ?? "",
          icon: localModule?.icon ?? "🔧",
          locked: localModule?.locked ?? false,
          enabled: localModule?.locked ? true : apiModule.is_active,
          known: Boolean(localModule),
        };
      })
    : modules.map((module) => ({ ...module, known: true }));

  const activeCount = displayModules.filter(m => m.enabled).length;
  const lockedCount = displayModules.filter(m => m.locked).length;

  const cardStyle = {
    background: colors.card,
    border: `1px solid ${colors.border}`,
    boxShadow: theme === "light" ? "0 2px 12px rgba(0,0,0,0.05)" : "0 4px 20px rgba(0,0,0,0.15)",
  };

  useEffect(() => {
    let active = true;

    modulesApi.list()
      .then((response) => {
        if (!active) return;
        setApiModules(response.data);
        syncModulesFromApi(response.data);
        setApiError(null);
      })
      .catch((error) => {
        if (!active) return;
        setApiError(error instanceof Error ? error.message : "Não foi possível carregar os módulos da API.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [syncModulesFromApi]);

  const handleToggle = async (moduleId: string, enabled: boolean) => {
    const module = displayModules.find((item) => item.id === moduleId);
    if (!module || module.locked) return;

    if (module.known) {
      setModuleEnabled(moduleId, enabled);
    }

    const apiModule = apiModules.find((item) => item.id === module.apiId || item.slug === module.apiSlug);
    if (!apiModule) return;

    try {
      const updated = await modulesApi.update(apiModule.id, {
        name: apiModule.name || module.label,
        slug: apiModule.slug || module.apiSlug,
        description: apiModule.description ?? module.description,
        is_active: enabled,
      });

      const nextApiModules = apiModules.map((item) => item.id === updated.id ? updated : item);
      setApiModules(nextApiModules);
      syncModulesFromApi(nextApiModules);
      setApiError(null);
    } catch (error) {
      if (module.known) {
        setModuleEnabled(moduleId, !enabled);
      }
      setApiError(error instanceof Error ? error.message : "Não foi possível atualizar o módulo.");
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 style={{ fontFamily: "'Playfair Display',serif", color: colors.textPrimary, fontSize: "20px", fontWeight: 600 }}>
          Módulos do Sistema
        </h2>
        <p style={{ fontSize: "13px", color: colors.textMuted, fontFamily: "'Inter',sans-serif", marginTop: "3px" }}>
          Ative ou desative os módulos do menu principal para todos os usuários
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {loading ? Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="rounded-2xl p-4 flex items-center gap-3" style={cardStyle}>
            <LoadingBlock width={4} height={32} className="rounded-full" />
            <div className="flex-1 space-y-2">
              <LoadingBlock width="34%" height={22} />
              <LoadingBlock width="68%" height={12} />
            </div>
          </div>
        )) : [
          { label: "Módulos ativos", value: activeCount, color: "#10B981" },
          { label: "Módulos totais", value: displayModules.length, color: "#6366F1" },
          { label: "Sempre ativos", value: lockedCount, color: "#8B5CF6" },
        ].map(s => (
          <div key={s.label} className="rounded-2xl p-4 flex items-center gap-3" style={cardStyle}>
            <div className="w-1 h-8 rounded-full" style={{ background: s.color }} />
            <div>
              <p style={{ fontSize: "22px", color: colors.textPrimary, fontFamily: "'Inter',sans-serif", fontWeight: 700, lineHeight: 1 }}>{s.value}</p>
              <p style={{ fontSize: "12px", color: colors.textMuted, fontFamily: "'Inter',sans-serif", marginTop: "3px" }}>{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-start gap-3 rounded-xl px-4 py-3" style={{ background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.2)" }}>
        <AlertCircle size={15} style={{ color: "#6366F1", marginTop: "1px" }} className="shrink-0" />
        <p style={{ fontSize: "13px", color: colors.textSecondary, fontFamily: "'Inter',sans-serif", lineHeight: 1.5 }}>
          {loading ? "Carregando módulos da API..." : "Módulos desativados ficam ocultos do menu lateral imediatamente para todos os usuários."}{" "}
          Módulos marcados como <strong style={{ color: colors.textPrimary }}>Fixo</strong> não podem ser desativados.
        </p>
      </div>

      {apiError && (
        <div className="flex items-start gap-2 rounded-xl px-4 py-3" style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.25)" }}>
          <AlertCircle size={15} style={{ color: "#F59E0B", marginTop: "1px" }} className="shrink-0" />
          <p style={{ fontSize: "13px", color: colors.textSecondary, fontFamily: "'Inter',sans-serif", lineHeight: 1.5 }}>
            Usando estado local: {apiError}
          </p>
        </div>
      )}

      <div className="rounded-2xl overflow-hidden" style={cardStyle}>
        <div className="grid px-5 py-3"
          style={{ gridTemplateColumns: "48px 1.8fr 2fr 100px 80px", borderBottom: `1px solid ${colors.border}`, background: theme === "light" ? colors.surface : "rgba(255,255,255,0.02)" }}
        >
          {["", "Módulo", "Descrição", "Status", "Ativo"].map((h, i) => (
            <span key={i} style={{ fontSize: "11px", color: colors.textMuted, fontFamily: "'Inter',sans-serif", textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</span>
          ))}
        </div>

        {loading ? (
          <div>
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="grid items-center px-5 py-4"
                style={{ gridTemplateColumns: "48px 1.8fr 2fr 100px 80px", borderBottom: index === 5 ? "none" : `1px solid ${colors.border}` }}
              >
                <LoadingBlock width={36} height={36} className="rounded-xl" />
                <div className="space-y-2">
                  <LoadingBlock width="48%" />
                  <LoadingBlock width={44} height={10} />
                </div>
                <LoadingBlock width="78%" />
                <LoadingBlock width={70} height={22} />
                <div className="flex justify-center">
                  <LoadingBlock width={44} height={24} />
                </div>
              </div>
            ))}
          </div>
        ) : displayModules.map((mod, idx) => {
          const isLast = idx === displayModules.length - 1;
          return (
            <div
              key={mod.id}
              className="grid items-center px-5 py-4 transition-all"
              style={{
                gridTemplateColumns: "48px 1.8fr 2fr 100px 80px",
                borderBottom: isLast ? "none" : `1px solid ${colors.border}`,
                opacity: mod.locked ? 1 : mod.enabled ? 1 : 0.55,
              }}
              onMouseEnter={e => !mod.locked && (e.currentTarget.style.background = colors.hoverBg)}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
            >
              <div
                className="rounded-xl flex items-center justify-center shrink-0"
                style={{
                  width: "36px",
                  height: "36px",
                  background: mod.enabled
                    ? "rgba(99,102,241,0.12)"
                    : theme === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
                  fontSize: "16px",
                  filter: mod.enabled ? "none" : "grayscale(1)",
                  transition: "all 0.3s",
                }}
              >
                {mod.icon}
              </div>

              <div>
                <p style={{ fontSize: "14px", color: colors.textPrimary, fontFamily: "'Inter',sans-serif", fontWeight: 500 }}>
                  {mod.label}
                </p>
                {mod.locked && (
                  <span style={{ fontSize: "10px", color: "#8B5CF6", fontFamily: "'Inter',sans-serif", fontWeight: 600, background: "rgba(139,92,246,0.12)", padding: "1px 6px", borderRadius: "999px" }}>
                    Fixo
                  </span>
                )}
              </div>

              <p style={{ fontSize: "12px", color: colors.textMuted, fontFamily: "'Inter',sans-serif", paddingRight: "16px" }}>
                {mod.description}
              </p>

              <span
                className="rounded-full px-2.5 py-1 inline-flex w-fit items-center gap-1.5"
                style={{
                  fontSize: "11px",
                  fontFamily: "'Inter',sans-serif",
                  fontWeight: 500,
                  color: mod.enabled ? "#10B981" : colors.textMuted,
                  background: mod.enabled ? "rgba(16,185,129,0.12)" : theme === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.06)",
                  transition: "all 0.3s",
                }}
              >
                <span className="rounded-full" style={{ width: "6px", height: "6px", background: mod.enabled ? "#10B981" : colors.textMuted, transition: "background 0.3s" }} />
                {mod.enabled ? "Ativo" : "Inativo"}
              </span>

              <div className="flex justify-center">
                <button
                  onClick={() => handleToggle(mod.id, !mod.enabled)}
                  disabled={mod.locked || loading}
                  className="rounded-full transition-all duration-300"
                  style={{
                    width: "44px",
                    height: "24px",
                    background: mod.enabled ? "#6366F1" : theme === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.15)",
                    position: "relative",
                    cursor: mod.locked || loading ? "not-allowed" : "pointer",
                    opacity: mod.locked || loading ? 0.5 : 1,
                  }}
                  title={mod.locked ? "Este módulo não pode ser desativado" : mod.enabled ? "Desativar módulo" : "Ativar módulo"}
                >
                  <div
                    className="absolute top-1 rounded-full bg-white transition-all duration-300"
                    style={{ width: "16px", height: "16px", left: mod.enabled ? "24px" : "4px", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }}
                  />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="rounded-2xl p-5 space-y-3" style={cardStyle}>
        <div className="flex items-center justify-between">
          <h3 style={{ fontFamily: "'Playfair Display',serif", color: colors.textPrimary, fontSize: "15px", fontWeight: 600 }}>
            Preview do Menu
          </h3>
          <span style={{ fontSize: "12px", color: colors.textMuted, fontFamily: "'Inter',sans-serif" }}>
            {loading ? "Carregando..." : `${activeCount} ite${activeCount !== 1 ? "ns" : "m"} visível${activeCount !== 1 ? "s" : ""}`}
          </span>
        </div>
        <p style={{ fontSize: "12px", color: colors.textMuted, fontFamily: "'Inter',sans-serif" }}>
          Como ficará o menu lateral após as alterações:
        </p>
        <div
          className="rounded-xl p-3 space-y-1"
          style={{ background: theme === "dark" ? "rgba(17,24,39,0.8)" : colors.surface, border: `1px solid ${colors.border}` }}
        >
          {loading ? Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="flex items-center gap-2.5 rounded-lg px-3 py-2">
              <LoadingBlock width={18} height={18} />
              <LoadingBlock width={`${48 + index * 6}%`} />
            </div>
          )) : displayModules.filter(m => m.enabled).map(mod => (
            <div key={mod.id} className="flex items-center gap-2.5 rounded-lg px-3 py-2"
              style={{ background: "rgba(99,102,241,0.06)", border: "1px solid rgba(99,102,241,0.1)" }}
            >
              <span style={{ fontSize: "13px" }}>{mod.icon}</span>
              <span style={{ fontSize: "12px", color: colors.textSecondary, fontFamily: "'Inter',sans-serif" }}>{mod.label}</span>
            </div>
          ))}
          {!loading && activeCount === 0 && (
            <p style={{ fontSize: "12px", color: colors.textMuted, fontFamily: "'Inter',sans-serif", textAlign: "center", padding: "8px" }}>
              Nenhum módulo ativo
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main Configuracoes ─────────────────────────────────────────────────
export function Configuracoes() {
  const { colors, theme } = useTheme();
  const [active, setActive] = useState("departamentos");

  const renderContent = () => {
    switch (active) {
      case "departamentos": return <Departamentos />;
      case "perfis":        return <PerfisAcesso />;
      case "modulos":       return <Modulos />;
      case "notificacoes":  return <Notificacoes />;
      case "seguranca":     return <Seguranca />;
      case "integracoes":   return <Integracoes />;
      case "aparencia":     return <Aparencia />;
      default:              return <PlaHolderSection id={active} />;
    }
  };

  return (
    <div className="flex h-full overflow-hidden">
      {/* ── Left submenu ── */}
      <aside
        className="hidden md:flex flex-col shrink-0 overflow-y-auto"
        style={{
          width: "220px",
          background: theme === "dark" ? "rgba(17,24,39,0.6)" : colors.surface,
          borderRight: `1px solid ${colors.border}`,
          padding: "20px 12px",
        }}
      >
        <p style={{ fontSize: "11px", color: colors.textMuted, fontFamily: "'Inter',sans-serif", paddingLeft: "12px", marginBottom: "8px", letterSpacing: "0.06em" }}>
          CONFIGURAÇÕES
        </p>

        {groups.map(group => {
          const items = submenu.filter(s => s.group === group);
          return (
            <div key={group} className="mb-4">
              <p style={{ fontSize: "10px", color: colors.textMuted, fontFamily: "'Inter',sans-serif", paddingLeft: "12px", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.08em", opacity: 0.6 }}>
                {group}
              </p>
              {items.map(item => {
                const isActive = active === item.id;
                return (
                  <button key={item.id} onClick={() => setActive(item.id)}
                    className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2.5 transition-all duration-200 mb-0.5 text-left"
                    style={{
                      background: isActive
                        ? theme === "dark" ? "rgba(99,102,241,0.15)" : "rgba(99,102,241,0.1)"
                        : "transparent",
                      borderLeft: `2px solid ${isActive ? "#6366F1" : "transparent"}`,
                      color: isActive ? colors.textPrimary : colors.textSecondary,
                    }}
                  >
                    <item.icon size={15} style={{ color: isActive ? "#6366F1" : colors.textMuted, flexShrink: 0 }} />
                    <span style={{ fontSize: "13px", fontFamily: "'Inter',sans-serif", fontWeight: isActive ? 500 : 400 }}>
                      {item.label}
                    </span>
                    {isActive && <ChevronRight size={12} style={{ color: "#6366F1", marginLeft: "auto" }} />}
                  </button>
                );
              })}
            </div>
          );
        })}
      </aside>

      {/* ── Content area ── */}
      <main className="flex-1 overflow-y-auto p-6" style={{ background: colors.bg }}>
        <div className="max-w-[820px]">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}
