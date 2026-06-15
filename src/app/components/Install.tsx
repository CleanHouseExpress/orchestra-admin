import { useEffect, useMemo, useState } from "react";
import { AlertCircle, CheckCircle2, ChevronLeft, ChevronRight, Database, KeyRound, ShieldCheck, UserPlus } from "lucide-react";
import { installApi, InstallDatabasePayload, InstallState } from "../services/installApi";
import { useTheme } from "./ThemeContext";
import { DefaultButton } from "./ui/default-button";

type StepId = "database" | "admin" | "finalize";

const stepOrder: StepId[] = ["database", "admin", "finalize"];

const stepMeta: Record<StepId, { index: number; title: string; subtitle: string; icon: typeof Database }> = {
  database: { index: 1, title: "Banco", subtitle: "Conexão, migrações e seeders", icon: Database },
  admin: { index: 2, title: "Administrador", subtitle: "Primeiro acesso", icon: UserPlus },
  finalize: { index: 3, title: "Finalizar", subtitle: "Travar instalador", icon: ShieldCheck },
};

function Field({ label, value, onChange, type = "text", placeholder, disabled }: { label: string; value: string; onChange: (value: string) => void; type?: string; placeholder?: string; disabled?: boolean }) {
  const { colors } = useTheme();

  return (
    <label className="space-y-2">
      <span style={{ color: colors.textSecondary, fontSize: 12, fontWeight: 600 }}>{label}</span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl px-3.5 py-2.5 outline-none transition-all disabled:cursor-not-allowed disabled:opacity-60"
        style={{ background: colors.inputBg, border: `1px solid ${colors.border}`, color: colors.textPrimary, fontSize: 14 }}
      />
    </label>
  );
}

function ToggleRow({ checked, disabled, title, description, onChange }: { checked: boolean; disabled?: boolean; title: string; description: string; onChange: (checked: boolean) => void }) {
  const { colors } = useTheme();

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className="w-full flex items-center justify-between gap-4 rounded-xl px-4 py-3 text-left transition-all disabled:cursor-not-allowed disabled:opacity-60"
      style={{ background: colors.surface, border: `1px solid ${checked ? "rgba(99,102,241,0.45)" : colors.border}` }}
    >
      <span>
        <span style={{ display: "block", color: colors.textPrimary, fontSize: 13, fontWeight: 700 }}>{title}</span>
        <span style={{ display: "block", color: colors.textMuted, fontSize: 12, marginTop: 3 }}>{description}</span>
      </span>
      <span
        className="relative rounded-full shrink-0 transition-all"
        style={{ width: 42, height: 24, background: checked ? colors.blue : colors.hoverBg, border: `1px solid ${colors.border}` }}
      >
        <span
          className="absolute top-[3px] rounded-full bg-white transition-all"
          style={{ width: 16, height: 16, left: checked ? 21 : 3, boxShadow: "0 1px 4px rgba(0,0,0,0.25)" }}
        />
      </span>
    </button>
  );
}

function Stepper({ activeStep, completed, onSelect, canOpenStep }: { activeStep: StepId; completed: Record<StepId, boolean>; onSelect: (step: StepId) => void; canOpenStep: (step: StepId) => boolean }) {
  const { colors, theme } = useTheme();

  return (
    <div className="grid gap-2 md:grid-cols-4">
      {stepOrder.map((step) => {
        const meta = stepMeta[step];
        const Icon = meta.icon;
        const active = activeStep === step;
        const done = completed[step];
        const locked = !canOpenStep(step);

        return (
          <button
            key={step}
            type="button"
            onClick={() => onSelect(step)}
            disabled={locked}
            className="flex items-center gap-3 rounded-xl px-3 py-3 text-left transition-all"
            style={{
              background: active
                ? theme === "dark" ? "rgba(99,102,241,0.18)" : "rgba(99,102,241,0.1)"
                : colors.surface,
              border: `1px solid ${active ? "rgba(99,102,241,0.45)" : colors.border}`,
              opacity: locked ? 0.48 : 1,
              cursor: locked ? "not-allowed" : "pointer",
            }}
          >
            <span
              className="flex items-center justify-center rounded-xl shrink-0"
              style={{
                width: 34,
                height: 34,
                background: done ? "rgba(16,185,129,0.14)" : "rgba(99,102,241,0.12)",
                color: done ? colors.green : colors.blue,
              }}
            >
              {done ? <CheckCircle2 size={17} /> : <Icon size={17} />}
            </span>
            <span className="min-w-0">
              <span style={{ display: "block", color: colors.textPrimary, fontSize: 13, fontWeight: 700 }}>{meta.index}. {meta.title}</span>
              <span style={{ display: "block", color: colors.textMuted, fontSize: 11, marginTop: 2 }}>{meta.subtitle}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}

export function Install({ modal = false }: { modal?: boolean }) {
  const { colors, theme } = useTheme();
  const [status, setStatus] = useState<InstallState | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [activeStep, setActiveStep] = useState<StepId>("database");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [database, setDatabase] = useState<InstallDatabasePayload>({
    run_test_seeders: false,
  });
  const [admin, setAdmin] = useState({
    name: "Admin",
    email: "admin@orchestra.com",
    password: "",
    password_confirmation: "",
  });

  const steps = status?.state?.steps ?? {};
  const installed = Boolean(status?.installed);
  const completed = {
    database: Boolean(steps.database && steps.migrate),
    admin: Boolean(steps.admin),
    finalize: installed,
  };
  const canAdmin = completed.database;
  const canFinalize = completed.admin;
  const activeIndex = stepOrder.indexOf(activeStep);
  const canOpenStep = (step: StepId) => {
    if (step === "database") return true;
    if (step === "admin") return completed.database;
    return completed.database && completed.admin;
  };

  const seedLabel = useMemo(() => (
    database.run_test_seeders
      ? "Inclui dados de demonstração para testes."
      : "Instala somente a base essencial."
  ), [database.run_test_seeders]);

  useEffect(() => {
    installApi.status()
      .then(setStatus)
      .catch((err) => setError(err instanceof Error ? err.message : "Não foi possível consultar a instalação."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!completed.database) setActiveStep("database");
    else if (!completed.admin) setActiveStep("admin");
    else if (!completed.finalize) setActiveStep("finalize");
  }, [completed.admin, completed.database, completed.finalize]);

  const run = async (key: StepId, action: () => Promise<InstallState>, next?: StepId) => {
    setBusy(key);
    setError("");
    setMessage("");

    try {
      const response = await action();
      setStatus((current) => ({ ...current, ...response }));
      setMessage(response.message ?? "Etapa concluída.");
      if (next) setActiveStep(next);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível concluir a etapa.");
      return false;
    } finally {
      setBusy(null);
    }
  };

  const finalizeInstall = async () => {
    const ok = await run("finalize", installApi.finalize);
    if (!ok) return;

    window.localStorage.setItem("orchestra-install-installed", "true");
    window.setTimeout(() => {
      window.location.replace("/login");
    }, 700);
  };

  const shellClass = modal
    ? "w-full max-w-[1080px] max-h-[92vh] overflow-y-auto rounded-2xl p-5 shadow-2xl"
    : "min-h-screen p-6";
  const shellStyle = {
    background: colors.bg,
    color: colors.textPrimary,
    fontFamily: "'Inter', sans-serif",
    border: modal ? `1px solid ${colors.border}` : undefined,
  };
  const panelStyle = {
    background: theme === "dark" ? "rgba(17,24,39,0.82)" : colors.card,
    border: `1px solid ${colors.border}`,
    boxShadow: theme === "light" ? "0 2px 14px rgba(15,23,42,0.06)" : "0 18px 44px rgba(0,0,0,0.22)",
  };

  if (loading) {
    return (
      <div className={shellClass} style={shellStyle}>
        <div className="min-h-[320px] flex items-center justify-center">
          <span className="rounded-full border-2 animate-spin" style={{ width: 28, height: 28, borderColor: "rgba(99,102,241,0.2)", borderTopColor: colors.blue }} />
        </div>
      </div>
    );
  }

  const renderStep = () => {
    if (installed) {
      return (
        <div className="rounded-xl p-5 flex items-start gap-3" style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.22)" }}>
          <CheckCircle2 size={18} style={{ color: colors.green, marginTop: 2 }} />
          <div>
            <h3 style={{ color: colors.textPrimary, fontSize: 15, fontWeight: 700 }}>Sistema instalado</h3>
            <p style={{ color: colors.textMuted, fontSize: 13, marginTop: 4 }}>O instalador está bloqueado para proteger os dados existentes.</p>
          </div>
        </div>
      );
    }

    if (activeStep === "database") {
      return (
        <div className="space-y-5">
          <div className="rounded-xl p-4" style={{ background: colors.surface, border: `1px solid ${colors.border}` }}>
            <h3 style={{ color: colors.textPrimary, fontSize: 14, fontWeight: 700 }}>Banco configurado no servidor</h3>
            <p style={{ color: colors.textMuted, fontSize: 13, marginTop: 6, lineHeight: 1.6 }}>
              O instalador vai usar a conexão já definida na API, validar o acesso ao banco e executar as migrações.
            </p>
          </div>
          <div className="grid gap-3">
            <ToggleRow
              checked={database.run_test_seeders}
              title="Seeders de teste"
              description={seedLabel}
              onChange={(checked) => setDatabase((current) => ({ ...current, run_test_seeders: checked }))}
            />
          </div>
          <DefaultButton onClick={() => run("database", () => installApi.database(database), "admin")} disabled={Boolean(busy)}>
            <KeyRound size={16} /> {busy === "database" ? "Validando..." : "Validar e migrar"}
          </DefaultButton>
        </div>
      );
    }

    if (activeStep === "admin") {
      return (
        <div className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Nome" value={admin.name} onChange={(value) => setAdmin((current) => ({ ...current, name: value }))} />
            <Field label="E-mail" value={admin.email} onChange={(value) => setAdmin((current) => ({ ...current, email: value }))} />
            <Field label="Senha" type="password" value={admin.password} onChange={(value) => setAdmin((current) => ({ ...current, password: value }))} />
            <Field label="Confirmar senha" type="password" value={admin.password_confirmation} onChange={(value) => setAdmin((current) => ({ ...current, password_confirmation: value }))} />
          </div>
          <DefaultButton onClick={() => run("admin", () => installApi.admin(admin), "finalize")} disabled={!canAdmin || Boolean(busy)}>
            <UserPlus size={16} /> {busy === "admin" ? "Criando..." : "Criar administrador"}
          </DefaultButton>
        </div>
      );
    }

    return (
      <div className="space-y-5">
        <DefaultButton onClick={finalizeInstall} disabled={!canFinalize || Boolean(busy)} style={{ background: colors.green }}>
          <ShieldCheck size={16} /> {busy === "finalize" ? "Finalizando..." : "Finalizar instalação"}
        </DefaultButton>
      </div>
    );
  };

  return (
    <div className={shellClass} style={shellStyle}>
      <div className="mx-auto max-w-[1040px] space-y-5">
        <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700 }}>Instalação Orquestra</h1>
          <p style={{ color: colors.textMuted, marginTop: 6, fontSize: 14 }}>Prepare o ambiente em três etapas controladas.</p>
          </div>
          <div className="flex items-center gap-2 rounded-full px-4 py-2" style={{ background: installed ? "rgba(16,185,129,0.12)" : "rgba(99,102,241,0.12)", color: installed ? colors.green : colors.blue }}>
            <ShieldCheck size={16} />
            <span style={{ fontSize: 13, fontWeight: 700 }}>{installed ? "Instalado" : `Etapa ${activeIndex + 1} de 3`}</span>
          </div>
        </header>

        <Stepper activeStep={activeStep} completed={completed} onSelect={setActiveStep} canOpenStep={canOpenStep} />

        {(error || message) && (
          <div className="rounded-xl p-4 flex items-start gap-3" style={{ background: error ? "rgba(239,68,68,0.1)" : "rgba(16,185,129,0.1)", border: `1px solid ${error ? "rgba(239,68,68,0.25)" : "rgba(16,185,129,0.22)"}` }}>
            {error ? <AlertCircle size={16} style={{ color: colors.red, marginTop: 2 }} /> : <CheckCircle2 size={16} style={{ color: colors.green, marginTop: 2 }} />}
            <p style={{ color: error ? colors.red : colors.green, fontSize: 13 }}>{error || message}</p>
          </div>
        )}

        <div className="grid gap-5 lg:grid-cols-[1fr_280px]">
          <section className="rounded-2xl p-5" style={panelStyle}>
            <div className="mb-5 flex items-center gap-3">
              {(() => {
                const Icon = stepMeta[activeStep].icon;
                return (
                  <span className="flex items-center justify-center rounded-xl" style={{ width: 38, height: 38, background: "rgba(99,102,241,0.12)", color: colors.blue }}>
                    <Icon size={18} />
                  </span>
                );
              })()}
              <div>
                <h2 style={{ color: colors.textPrimary, fontSize: 18, fontWeight: 700 }}>{stepMeta[activeStep].title}</h2>
                <p style={{ color: colors.textMuted, fontSize: 12, marginTop: 2 }}>{stepMeta[activeStep].subtitle}</p>
              </div>
            </div>
            {renderStep()}
          </section>

          <aside className="rounded-2xl p-5 space-y-4" style={panelStyle}>
            <h3 style={{ color: colors.textPrimary, fontSize: 14, fontWeight: 700 }}>Resumo</h3>
            {stepOrder.map((step) => (
              <div key={step} className="flex items-center justify-between gap-3">
                <span style={{ color: colors.textSecondary, fontSize: 13 }}>{stepMeta[step].title}</span>
                <span style={{ color: completed[step] ? colors.green : colors.textMuted, fontSize: 12, fontWeight: 700 }}>
                  {completed[step] ? "Concluído" : "Pendente"}
                </span>
              </div>
            ))}
            <div className="pt-4 flex items-center justify-between" style={{ borderTop: `1px solid ${colors.border}` }}>
              <button
                type="button"
                disabled={activeIndex === 0}
                onClick={() => setActiveStep(stepOrder[Math.max(0, activeIndex - 1)])}
                className="inline-flex items-center gap-1 rounded-lg px-3 py-2 disabled:cursor-not-allowed disabled:opacity-50"
                style={{ color: colors.textSecondary, background: colors.surface, border: `1px solid ${colors.border}`, fontSize: 12 }}
              >
                <ChevronLeft size={14} /> Voltar
              </button>
              <button
                type="button"
                disabled={activeIndex === stepOrder.length - 1 || !canOpenStep(stepOrder[Math.min(stepOrder.length - 1, activeIndex + 1)])}
                onClick={() => {
                  const nextStep = stepOrder[Math.min(stepOrder.length - 1, activeIndex + 1)];
                  if (canOpenStep(nextStep)) setActiveStep(nextStep);
                }}
                className="inline-flex items-center gap-1 rounded-lg px-3 py-2 disabled:cursor-not-allowed disabled:opacity-50"
                style={{ color: colors.textSecondary, background: colors.surface, border: `1px solid ${colors.border}`, fontSize: 12 }}
              >
                Próxima <ChevronRight size={14} />
              </button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
