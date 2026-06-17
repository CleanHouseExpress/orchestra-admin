import { useEffect, useState } from "react";
import {
  Boxes,
  Building2,
  CheckCircle2,
  ExternalLink,
  Filter,
  Loader2,
  Search,
  ShieldCheck,
  Star,
  X,
} from "lucide-react";
import { useNavigate } from "react-router";
import { ApiCompanyModule, ApiCompanyModuleCompany, CompanyModuleMetrics, companyModulesApi } from "../services/companyModulesApi";
import { useTheme } from "./ThemeContext";

type DefaultFilter = "all" | "yes" | "no";

export function ModulosCatalogo() {
  const { colors, theme } = useTheme();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [defaultFilter, setDefaultFilter] = useState<DefaultFilter>("all");
  const [modules, setModules] = useState<ApiCompanyModule[]>([]);
  const [metrics, setMetrics] = useState<CompanyModuleMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [savingStatusId, setSavingStatusId] = useState<number | null>(null);
  const [savingDefaultId, setSavingDefaultId] = useState<number | null>(null);
  const [drawerModule, setDrawerModule] = useState<ApiCompanyModule | null>(null);
  const [drawerCompanies, setDrawerCompanies] = useState<ApiCompanyModuleCompany[]>([]);
  const [drawerLoading, setDrawerLoading] = useState(false);
  const [drawerError, setDrawerError] = useState("");

  useEffect(() => {
    let active = true;

    setLoading(true);
    setLoadError("");

    Promise.all([
      companyModulesApi.list({ search, default: defaultFilter, per_page: 100 }),
      companyModulesApi.metrics({ search, default: defaultFilter }),
    ])
      .then(([list, nextMetrics]) => {
        if (!active) return;
        setModules(list.data);
        setMetrics(nextMetrics);
      })
      .catch((error) => {
        if (!active) return;
        setModules([]);
        setMetrics(null);
        setLoadError(error instanceof Error ? error.message : "Não foi possível carregar os módulos.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [defaultFilter, search]);

  const visibleTotal = metrics?.total_modules ?? modules.length;
  const defaultTotal = metrics?.default_modules ?? modules.filter((module) => module.enabled_by_default).length;
  const optionalTotal = metrics?.optional_modules ?? modules.filter((module) => !module.enabled_by_default).length;
  const activeTotal = metrics?.active_modules ?? modules.filter((module) => module.is_active).length;

  async function refreshModules() {
    const [list, nextMetrics] = await Promise.all([
      companyModulesApi.list({ search, default: defaultFilter, per_page: 100 }),
      companyModulesApi.metrics({ search, default: defaultFilter }),
    ]);

    setModules(list.data);
    setMetrics(nextMetrics);
  }

  async function handleStatusChange(module: ApiCompanyModule, nextStatus: boolean) {
    setSavingStatusId(module.id);
    setLoadError("");

    try {
      await companyModulesApi.updateStatus(module.id, nextStatus);
      await refreshModules();
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : "Não foi possível atualizar o status do módulo.");
    } finally {
      setSavingStatusId(null);
    }
  }

  async function handleDefaultChange(module: ApiCompanyModule, nextDefault: boolean) {
    setSavingDefaultId(module.id);
    setLoadError("");

    try {
      await companyModulesApi.updateDefault(module.id, nextDefault);
      await refreshModules();
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : "Não foi possível atualizar o padrão do módulo.");
    } finally {
      setSavingDefaultId(null);
    }
  }

  async function openCompaniesDrawer(module: ApiCompanyModule) {
    setDrawerModule(module);
    setDrawerCompanies([]);
    setDrawerError("");
    setDrawerLoading(true);

    try {
      const response = await companyModulesApi.companiesUsingModule(module.id);
      setDrawerModule(response.module);
      setDrawerCompanies(response.companies);
    } catch (error) {
      setDrawerError(error instanceof Error ? error.message : "Não foi possível carregar as empresas vinculadas.");
    } finally {
      setDrawerLoading(false);
    }
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="px-6 py-6 space-y-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="rounded-lg flex items-center justify-center" style={{ width: 34, height: 34, background: colors.blueFaint }}>
                <Boxes size={17} style={{ color: colors.blue }} />
              </div>
              <p style={{ fontSize: 12, color: colors.textMuted, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                Catálogo
              </p>
            </div>
            <h1 style={{ fontFamily: "'Playfair Display', serif", color: colors.textPrimary, fontSize: 28, fontWeight: 600 }}>
              Módulos
            </h1>
            <p style={{ color: colors.textMuted, fontSize: 14, marginTop: 4 }}>
              Defina quais módulos entram automaticamente na criação de novas empresas.
            </p>
            {loadError && (
              <p style={{ color: colors.red, fontSize: 12, marginTop: 6 }}>
                {loadError}
              </p>
            )}
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-4">
          {loading && modules.length === 0 ? (
            <>
              <MetricSkeleton />
              <MetricSkeleton />
              <MetricSkeleton />
              <MetricSkeleton />
            </>
          ) : (
            <>
              <Metric icon={Boxes} label="Módulos" value={visibleTotal} color={colors.blue} />
              <Metric icon={Star} label="Padrão" value={defaultTotal} color={colors.green} />
              <Metric icon={ShieldCheck} label="Opcionais" value={optionalTotal} color={colors.yellow} />
              <Metric icon={CheckCircle2} label="Ativos" value={activeTotal} color="#0891B2" />
            </>
          )}
        </div>

        <div className="rounded-lg p-4" style={{ background: colors.card, border: `1px solid ${colors.border}` }}>
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex items-center gap-2 rounded-lg px-3 h-10 flex-1 max-w-[520px]" style={{ background: colors.inputBg, border: `1px solid ${colors.border}` }}>
              <Search size={15} style={{ color: colors.textMuted }} />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar por módulo, slug ou descrição"
                className="bg-transparent outline-none flex-1 min-w-0"
                style={{ color: colors.textPrimary, fontSize: 13 }}
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Filter size={15} style={{ color: colors.textMuted }} />
              {([
                ["all", "Todos"],
                ["yes", "Padrão"],
                ["no", "Não padrão"],
              ] as const).map(([value, label]) => {
                const active = defaultFilter === value;
                return (
                  <button
                    key={value}
                    onClick={() => setDefaultFilter(value)}
                    className="h-9 rounded-lg px-3 transition-all"
                    style={{
                      background: active ? colors.blueFaint : colors.inputBg,
                      color: active ? colors.blue : colors.textMuted,
                      border: `1px solid ${active ? "rgba(99,102,241,0.25)" : colors.border}`,
                      fontSize: 12,
                      fontWeight: active ? 700 : 500,
                    }}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {loading && modules.length === 0 ? (
          <div className="grid gap-3 xl:grid-cols-2 2xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => <ModuleSkeleton key={index} />)}
          </div>
        ) : modules.length === 0 ? (
          <div className="rounded-lg p-8 text-center" style={{ background: colors.card, border: `1px solid ${colors.border}` }}>
            <p style={{ color: colors.textPrimary, fontSize: 15, fontWeight: 700 }}>Nenhum módulo encontrado</p>
            <p style={{ color: colors.textMuted, fontSize: 13, marginTop: 4 }}>
              Ajuste a busca ou o filtro para visualizar outros módulos.
            </p>
          </div>
        ) : (
          <div className="grid gap-3 xl:grid-cols-2 2xl:grid-cols-3">
            {modules.map((module) => (
              <div
                key={module.id}
                className="rounded-lg p-4"
                style={{
                  background: colors.card,
                  border: `1px solid ${colors.border}`,
                  boxShadow: theme === "light" ? "0 2px 12px rgba(15,23,42,0.05)" : "none",
                }}
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex items-start gap-2.5 min-w-0">
                    <div className="rounded-lg flex items-center justify-center shrink-0" style={{ width: 34, height: 34, background: colors.blueFaint }}>
                      <Boxes size={16} style={{ color: colors.blue }} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 style={{ color: colors.textPrimary, fontSize: 14, fontWeight: 700 }}>
                          {module.name}
                        </h2>
                        {module.enabled_by_default && (
                          <span className="rounded-full px-2 py-0.5" style={{ color: colors.green, background: "rgba(16,185,129,0.12)", fontSize: 10, fontWeight: 700 }}>
                            Padrão
                          </span>
                        )}
                        <ModuleStatusBadge active={module.is_active} />
                      </div>
                      <p
                        style={{
                          color: colors.textMuted,
                          display: "-webkit-box",
                          fontSize: 12,
                          lineHeight: 1.45,
                          marginTop: 4,
                          overflow: "hidden",
                          WebkitBoxOrient: "vertical",
                          WebkitLineClamp: 2,
                        }}
                      >
                        {module.description || "Sem descrição cadastrada."}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 shrink-0 sm:items-end">
                    <StatusSwitch
                      active={module.is_active}
                      saving={savingStatusId === module.id}
                      activeLabel="Ativo"
                      inactiveLabel="Inativo"
                      tone="status"
                      onChange={() => handleStatusChange(module, !module.is_active)}
                    />
                    <StatusSwitch
                      active={module.enabled_by_default}
                      saving={savingDefaultId === module.id}
                      activeLabel="Padrão"
                      inactiveLabel="Opcional"
                      tone="default"
                      onChange={() => handleDefaultChange(module, !module.enabled_by_default)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 mt-3">
                  <ModuleFact label="Slug" value={module.slug} />
                  <ModuleFact label="Status" value={module.is_active ? "Ativo" : "Inativo"} tone={module.is_active ? "success" : "muted"} />
                  <button
                    type="button"
                    onClick={() => openCompaniesDrawer(module)}
                    className="rounded-lg px-2.5 py-2 text-left transition-all"
                    style={{ background: colors.inputBg, border: `1px solid ${colors.border}` }}
                  >
                    <p style={{ color: colors.textMuted, fontSize: 10 }}>Empresas</p>
                    <p className="truncate flex items-center gap-1.5" style={{ color: colors.teal, fontSize: 12, fontWeight: 800, marginTop: 2 }}>
                      {module.linked_companies_count ?? 0}
                      <ExternalLink size={11} />
                    </p>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {drawerModule && (
        <div
          className="fixed inset-0 z-50 flex justify-end"
          style={{ background: "rgba(2,6,23,0.56)", backdropFilter: "blur(6px)" }}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setDrawerModule(null);
          }}
        >
          <div className="h-full w-full max-w-[520px] flex flex-col" style={{ background: colors.card, borderLeft: `1px solid ${colors.border}` }}>
            <div className="px-5 py-4 flex items-start justify-between gap-4" style={{ borderBottom: `1px solid ${colors.border}` }}>
              <div className="min-w-0">
                <p style={{ color: colors.textMuted, fontSize: 11, fontWeight: 800, letterSpacing: "0.07em", textTransform: "uppercase" }}>
                  Empresas utilizando módulo
                </p>
                <h2 className="truncate" style={{ color: colors.textPrimary, fontSize: 20, fontWeight: 750, marginTop: 4 }}>
                  {drawerModule.name}
                </h2>
                <p className="truncate" style={{ color: colors.textMuted, fontSize: 12, marginTop: 3 }}>
                  {drawerModule.slug} · {drawerCompanies.length} empresa{drawerCompanies.length !== 1 ? "s" : ""}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setDrawerModule(null)}
                className="h-9 w-9 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: colors.inputBg, color: colors.textMuted, border: `1px solid ${colors.border}` }}
                aria-label="Fechar"
              >
                <X size={15} />
              </button>
            </div>

            <div className="p-5 grid grid-cols-3 gap-2" style={{ borderBottom: `1px solid ${colors.border}` }}>
              <ModuleFact label="Vinculadas" value={String(drawerCompanies.length)} tone="success" />
              <ModuleFact label="Status" value={drawerModule.is_active ? "Ativo" : "Inativo"} tone={drawerModule.is_active ? "success" : "muted"} />
              <ModuleFact label="Padrão" value={drawerModule.enabled_by_default ? "Sim" : "Não"} tone={drawerModule.enabled_by_default ? "success" : "muted"} />
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              {drawerLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <div key={index} className="rounded-lg p-4 animate-pulse" style={{ background: colors.inputBg, border: `1px solid ${colors.border}` }}>
                      <div className="h-4 w-44 rounded" style={{ background: colors.hoverBg }} />
                      <div className="h-3 w-64 rounded mt-3" style={{ background: colors.hoverBg }} />
                    </div>
                  ))}
                </div>
              ) : drawerError ? (
                <div className="rounded-lg p-4" style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.25)" }}>
                  <p style={{ color: colors.textSecondary, fontSize: 13 }}>{drawerError}</p>
                </div>
              ) : drawerCompanies.length === 0 ? (
                <div className="rounded-lg p-8 text-center" style={{ background: colors.inputBg, border: `1px solid ${colors.border}` }}>
                  <Building2 size={24} style={{ color: colors.textMuted, margin: "0 auto 10px" }} />
                  <p style={{ color: colors.textPrimary, fontSize: 14, fontWeight: 700 }}>Nenhuma empresa vinculada</p>
                  <p style={{ color: colors.textMuted, fontSize: 12, marginTop: 4 }}>
                    Este módulo ainda não aparece em tenants de empresas.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {drawerCompanies.map((company) => (
                    <button
                      type="button"
                      key={company.id}
                      onClick={() => navigate(`/empresas/${company.id}`)}
                      className="w-full rounded-lg p-4 text-left transition-all"
                      style={{ background: colors.inputBg, border: `1px solid ${colors.border}` }}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate" style={{ color: colors.textPrimary, fontSize: 14, fontWeight: 750 }}>{company.name}</p>
                          <p className="truncate" style={{ color: colors.textMuted, fontSize: 12, marginTop: 3 }}>
                            {company.subdomain ?? "-"} · {company.plan ?? "Sem plano"}
                          </p>
                        </div>
                        <ExternalLink size={14} style={{ color: colors.textMuted, marginTop: 2 }} className="shrink-0" />
                      </div>
                      <div className="flex flex-wrap gap-2 mt-3">
                        <CompanyMiniBadge label={company.status ?? "status indefinido"} tone={company.status === "active" ? "success" : "muted"} />
                        <CompanyMiniBadge label={company.segment ?? "segmento indefinido"} tone="muted" />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

function Metric({ icon: Icon, label, value, color }: { icon: any; label: string; value: number; color: string }) {
  const { colors } = useTheme();

  return (
    <div className="rounded-lg p-4 flex items-center gap-3" style={{ background: colors.card, border: `1px solid ${colors.border}` }}>
      <div className="rounded-lg flex items-center justify-center" style={{ width: 38, height: 38, background: colors.inputBg }}>
        <Icon size={18} style={{ color }} />
      </div>
      <div>
        <p style={{ color: colors.textMuted, fontSize: 12 }}>{label}</p>
        <p style={{ color: colors.textPrimary, fontSize: 22, fontWeight: 750, lineHeight: 1.1 }}>{value}</p>
      </div>
    </div>
  );
}

function ModuleStatusBadge({ active }: { active: boolean }) {
  const { colors, theme } = useTheme();

  return (
    <span
      className="rounded-full px-2 py-0.5 inline-flex items-center gap-1.5"
      style={{
        color: active ? colors.green : colors.red,
        background: active
          ? "rgba(16,185,129,0.12)"
          : theme === "dark" ? "rgba(239,68,68,0.14)" : "rgba(220,38,38,0.1)",
        fontSize: 10,
        fontWeight: 700,
      }}
    >
      <span className="rounded-full" style={{ width: 5, height: 5, background: active ? colors.green : colors.red }} />
      {active ? "Ativo" : "Inativo"}
    </span>
  );
}

function StatusSwitch({
  active,
  saving,
  activeLabel,
  inactiveLabel,
  tone,
  onChange,
}: {
  active: boolean;
  saving: boolean;
  activeLabel: string;
  inactiveLabel: string;
  tone: "status" | "default";
  onChange: () => void;
}) {
  const { colors, theme } = useTheme();
  const activeColor = tone === "default" ? colors.yellow : colors.teal;
  const activeBg = tone === "default" ? "rgba(245,158,11,0.13)" : colors.tealFaint;
  const activeBorder = tone === "default" ? "rgba(245,158,11,0.35)" : "rgba(139,92,246,0.35)";

  return (
    <button
      type="button"
      onClick={onChange}
      disabled={saving}
      className="h-9 min-w-[124px] rounded-lg px-3 flex items-center justify-between gap-2 transition-all"
      style={{
        background: active ? activeBg : colors.inputBg,
        border: `1px solid ${active ? activeBorder : colors.border}`,
        color: active ? activeColor : colors.textMuted,
        cursor: saving ? "wait" : "pointer",
        opacity: saving ? 0.72 : 1,
        fontSize: 12,
        fontWeight: 800,
      }}
      title={active ? `Desativar ${activeLabel.toLowerCase()}` : `Ativar ${activeLabel.toLowerCase()}`}
    >
      <span>{active ? activeLabel : inactiveLabel}</span>
      <span
        className="rounded-full transition-all relative"
        style={{
          width: 34,
          height: 18,
          background: active ? activeColor : theme === "dark" ? "rgba(255,255,255,0.12)" : "rgba(15,23,42,0.16)",
        }}
      >
        {saving ? (
          <Loader2 size={12} className="absolute animate-spin" style={{ left: 11, top: 3, color: active ? "#FFFFFF" : colors.textMuted }} />
        ) : (
          <span
            className="absolute rounded-full bg-white transition-all"
            style={{
              width: 14,
              height: 14,
              left: active ? 18 : 2,
              top: 2,
              boxShadow: "0 1px 4px rgba(0,0,0,0.22)",
            }}
          />
        )}
      </span>
    </button>
  );
}

function ModuleFact({ label, value, tone = "default" }: { label: string; value: string; tone?: "default" | "success" | "muted" }) {
  const { colors } = useTheme();
  const valueColor = tone === "success" ? colors.green : tone === "muted" ? colors.textMuted : colors.textPrimary;

  return (
    <div className="rounded-lg px-2.5 py-2" style={{ background: colors.inputBg, border: `1px solid ${colors.border}` }}>
      <p style={{ color: colors.textMuted, fontSize: 10 }}>{label}</p>
      <p className="truncate" style={{ color: valueColor, fontSize: 12, fontWeight: 700, marginTop: 2 }}>{value}</p>
    </div>
  );
}

function CompanyMiniBadge({ label, tone }: { label: string; tone: "success" | "muted" }) {
  const { colors } = useTheme();

  return (
    <span
      className="rounded-full px-2 py-0.5"
      style={{
        background: tone === "success" ? "rgba(16,185,129,0.12)" : colors.hoverBg,
        color: tone === "success" ? colors.green : colors.textMuted,
        fontSize: 10,
        fontWeight: 800,
      }}
    >
      {label}
    </span>
  );
}

function MetricSkeleton() {
  const { colors } = useTheme();

  return (
    <div className="rounded-lg p-4 animate-pulse" style={{ background: colors.card, border: `1px solid ${colors.border}` }}>
      <div className="h-4 w-20 rounded" style={{ background: colors.hoverBg }} />
      <div className="h-7 w-14 rounded mt-3" style={{ background: colors.hoverBg }} />
    </div>
  );
}

function ModuleSkeleton() {
  const { colors } = useTheme();

  return (
    <div className="rounded-lg p-4 animate-pulse" style={{ background: colors.card, border: `1px solid ${colors.border}` }}>
      <div className="flex items-start gap-2.5">
        <div className="rounded-lg" style={{ width: 34, height: 34, background: colors.hoverBg }} />
        <div className="flex-1">
          <div className="h-4 w-36 rounded" style={{ background: colors.hoverBg }} />
          <div className="h-3 w-full rounded mt-2" style={{ background: colors.hoverBg }} />
          <div className="h-3 w-2/3 rounded mt-2" style={{ background: colors.hoverBg }} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 mt-3">
        <div className="h-11 rounded-lg" style={{ background: colors.hoverBg }} />
        <div className="h-11 rounded-lg" style={{ background: colors.hoverBg }} />
      </div>
    </div>
  );
}
