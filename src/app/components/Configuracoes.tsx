import { useEffect, useState } from "react";
import {
  Building2, Shield, Bell, Link2, Palette, Globe, Database,
  ChevronRight, Plus, Pencil, Trash2, X, CheckCircle2,
  Search, Users, Hash, AlignLeft, CheckCheck, AlertCircle,
  Mail, Smartphone, Lock, Eye, EyeOff, ToggleLeft, ToggleRight,
  Webhook, Key, RefreshCw, Download, Upload, Sliders
} from "lucide-react";
import { useTheme } from "./ThemeContext";
import { ApiDepartment, DepartmentPayload, departmentsApi } from "../services/departmentsApi";

// ── Submenu config ─────────────────────────────────────────────────────
const submenu = [
  { id: "departamentos",  label: "Departamentos",    icon: Building2, group: "Organização" },
  { id: "perfis",         label: "Perfis de Acesso", icon: Shield,    group: "Organização" },
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
              <button onClick={handleSave} disabled={saving}
                className="flex items-center gap-2 rounded-xl px-5 py-2 transition-all hover:opacity-90 disabled:opacity-60"
                style={{ background: "linear-gradient(135deg, #3B82F6, #2563EB)", color: "#fff", fontSize: "13px", fontFamily: "'Inter',sans-serif", fontWeight: 500, boxShadow: "0 4px 14px rgba(59,130,246,0.3)" }}
              >
                {saving
                  ? <><span className="rounded-full border-2 animate-spin" style={{ width: "12px", height: "12px", borderColor: "rgba(255,255,255,0.3)", borderTopColor: "#fff" }} /> Salvando...</>
                  : <><CheckCheck size={14} /> {isEdit ? "Salvar" : "Criar"}</>
                }
              </button>
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
        <button onClick={() => setEditDept("new")}
          className="flex items-center gap-2 rounded-xl px-4 py-2.5 transition-all hover:opacity-90 whitespace-nowrap"
          style={{ background: "linear-gradient(135deg, #6366F1, #4338CA)", color: "#fff", fontSize: "14px", fontFamily: "'Inter',sans-serif", fontWeight: 500 }}
          disabled={loading}
        >
          <Plus size={16} /> Novo Departamento
        </button>
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
          <button onClick={toggle} className="flex items-center gap-2 rounded-xl px-4 py-2 transition-all hover:opacity-90"
            style={{ background: "linear-gradient(135deg, #3B82F6, #2563EB)", color: "#fff", fontSize: "13px", fontFamily: "'Inter',sans-serif", fontWeight: 500 }}
          >
            <Palette size={14} /> Alternar tema
          </button>
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

// ── Main Configuracoes ─────────────────────────────────────────────────
export function Configuracoes() {
  const { colors, theme } = useTheme();
  const [active, setActive] = useState("departamentos");

  const renderContent = () => {
    switch (active) {
      case "departamentos": return <Departamentos />;
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
                        ? theme === "dark" ? "rgba(59,130,246,0.15)" : "rgba(59,130,246,0.1)"
                        : "transparent",
                      borderLeft: `2px solid ${isActive ? "#3B82F6" : "transparent"}`,
                      color: isActive ? colors.textPrimary : colors.textSecondary,
                    }}
                  >
                    <item.icon size={15} style={{ color: isActive ? "#3B82F6" : colors.textMuted, flexShrink: 0 }} />
                    <span style={{ fontSize: "13px", fontFamily: "'Inter',sans-serif", fontWeight: isActive ? 500 : 400 }}>
                      {item.label}
                    </span>
                    {isActive && <ChevronRight size={12} style={{ color: "#3B82F6", marginLeft: "auto" }} />}
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
