import { useEffect, useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Activity,
  AlertTriangle,
  Building2,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Download,
  Search,
  ShieldCheck,
  User,
  X,
  XCircle,
} from "lucide-react";
import { DateRange } from "react-day-picker";
import { useTheme } from "./ThemeContext";
import { Calendar } from "./ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { ApiAuditLog, AuditMethod, AuditStatus, auditLogsApi } from "../services/auditLogsApi";

interface AuditEntry {
  id: number;
  event: string;
  module: string;
  company: string;
  companyId: number | null;
  user: string;
  userId: number | null;
  email: string;
  method: AuditMethod;
  path: string;
  statusCode: number;
  status: AuditStatus;
  ip: string;
  when: string;
  dateTime: string;
  payload: string;
  raw: ApiAuditLog;
}

interface AuditMetrics {
  total: number;
  success: number;
  failed: number;
  warning: number;
}

const statusConfig = {
  success: { label: "Sucesso", color: "#059669", bg: "rgba(16,185,129,0.12)", icon: CheckCircle2 },
  failed: { label: "Falha", color: "#DC2626", bg: "rgba(239,68,68,0.12)", icon: XCircle },
  warning: { label: "Atenção", color: "#D97706", bg: "rgba(245,158,11,0.14)", icon: AlertTriangle },
};

const methodColors: Record<AuditMethod, string> = {
  GET: "#059669",
  POST: "#6366F1",
  PUT: "#0891B2",
  PATCH: "#7C3AED",
  DELETE: "#DC2626",
};

export function Auditoria() {
  const { colors, theme } = useTheme();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"all" | AuditStatus>("all");
  const [method, setMethod] = useState<"all" | AuditMethod>("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalLogs, setTotalLogs] = useState(0);
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [metrics, setMetrics] = useState<AuditMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [selectedEntry, setSelectedEntry] = useState<AuditEntry | null>(null);

  useEffect(() => {
    let active = true;

    setLoading(true);
    setLoadError("");

    Promise.all([
      auditLogsApi.list({
        page,
        per_page: 50,
        search,
        status,
        method,
        date_from: dateFrom,
        date_to: dateTo,
      }),
      auditLogsApi.metrics({
        search,
        status,
        method,
        date_from: dateFrom,
        date_to: dateTo,
      }),
    ])
      .then(([list, nextMetrics]) => {
        if (!active) return;
        setEntries(list.data.map(mapAuditLog));
        setTotalPages(list.last_page ?? 1);
        setTotalLogs(list.total ?? list.data.length);
        setMetrics(nextMetrics);
      })
      .catch((error) => {
        if (!active) return;
        setLoadError(error instanceof Error ? error.message : "Não foi possível carregar a auditoria.");
        setEntries([]);
        setTotalPages(1);
        setTotalLogs(0);
        setMetrics(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [dateFrom, dateTo, method, page, search, status]);

  const total = metrics?.total ?? entries.length;
  const failures = metrics?.failed ?? entries.filter((entry) => entry.status === "failed").length;
  const successful = metrics?.success ?? entries.filter((entry) => entry.status === "success").length;
  const warning = metrics?.warning ?? entries.filter((entry) => entry.status === "warning").length;
  const hasAdvancedFilters = dateFrom || dateTo;
  const hasMenuFilters = hasAdvancedFilters || status !== "all" || method !== "all";

  function resetPageAnd(callback: () => void) {
    setPage(1);
    callback();
  }

  function clearFilters() {
    setPage(1);
    setSearch("");
    setStatus("all");
    setMethod("all");
    setDateFrom("");
    setDateTo("");
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="px-6 py-6 space-y-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="rounded-lg flex items-center justify-center" style={{ width: 34, height: 34, background: colors.blueFaint }}>
                <ShieldCheck size={17} style={{ color: colors.blue }} />
              </div>
              <p style={{ fontSize: 12, color: colors.textMuted, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                Sistema
              </p>
            </div>
            <h1 style={{ fontFamily: "'Playfair Display', serif", color: colors.textPrimary, fontSize: 28, fontWeight: 600 }}>
              Auditoria
            </h1>
            <p style={{ color: colors.textMuted, fontSize: 14, marginTop: 4 }}>
              Rastreamento das ações administrativas registradas pela plataforma.
            </p>
            {loadError && (
              <p style={{ color: colors.red, fontSize: 12, marginTop: 6 }}>
                Não foi possível carregar os logs de auditoria: {loadError}
              </p>
            )}
          </div>

          <button
            className="h-10 rounded-lg px-4 flex items-center gap-2 transition-all"
            style={{ background: colors.card, color: colors.textSecondary, border: `1px solid ${colors.border}`, fontSize: 13, fontWeight: 600 }}
          >
            <Download size={15} />
            Exportar
          </button>
        </div>

        <div className="grid gap-3 md:grid-cols-4">
          {loading && entries.length === 0 ? (
            <>
              <MetricSkeleton />
              <MetricSkeleton />
              <MetricSkeleton />
              <MetricSkeleton />
            </>
          ) : (
            <>
              <MetricCard icon={Activity} label="Eventos" value={total} color={colors.blue} />
              <MetricCard icon={CheckCircle2} label="Sucessos" value={successful} color={colors.green} />
              <MetricCard icon={XCircle} label="Falhas" value={failures} color={colors.red} />
              <MetricCard icon={AlertTriangle} label="Atenções" value={warning} color={colors.yellow} />
            </>
          )}
        </div>

        <div className="rounded-lg p-4 space-y-3" style={{ background: colors.card, border: `1px solid ${colors.border}` }}>
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-2 rounded-lg px-3 h-10 flex-1" style={{ background: colors.inputBg, border: `1px solid ${colors.border}` }}>
              <Search size={15} style={{ color: colors.textMuted }} />
              <input
                value={search}
                onChange={(event) => resetPageAnd(() => setSearch(event.target.value))}
                placeholder="Buscar por empresa, usuário, evento, rota ou IP"
                className="bg-transparent outline-none flex-1"
                style={{ color: colors.textPrimary, fontSize: 13 }}
              />
            </div>

            <div className="relative">
              <button
                type="button"
                onClick={() => setFiltersOpen((open) => !open)}
                className="h-10 w-10 rounded-lg flex items-center justify-center transition-all"
                aria-label="Abrir filtros"
                style={{
                  background: hasMenuFilters ? colors.blueFaint : colors.inputBg,
                  border: `1px solid ${hasMenuFilters ? colors.blue : colors.border}`,
                  color: hasMenuFilters ? colors.blue : colors.textMuted,
                }}
              >
                <FunnelIcon />
                {hasMenuFilters && (
                  <span
                    className="absolute -right-1 -top-1 rounded-full"
                    style={{ width: 8, height: 8, background: colors.blue, border: `2px solid ${colors.card}` }}
                  />
                )}
              </button>

              {filtersOpen && (
                <div
                  className="absolute right-0 top-12 z-20 w-[min(92vw,420px)] rounded-lg p-3 shadow-xl"
                  style={{ background: colors.card, border: `1px solid ${colors.border}`, boxShadow: "0 18px 44px rgba(15,23,42,0.18)" }}
                >
                  <div className="space-y-3">
                    <div>
                      <p style={{ color: colors.textMuted, fontSize: 10, fontWeight: 700, textTransform: "uppercase", marginBottom: 6 }}>
                        Status
                      </p>
                      <Segmented
                        value={status}
                        onChange={(value) => resetPageAnd(() => setStatus(value as "all" | AuditStatus))}
                        options={[
                          ["all", "Todos"],
                          ["success", "Sucesso"],
                          ["failed", "Falha"],
                          ["warning", "Atenção"],
                        ]}
                      />
                    </div>

                    <div>
                      <p style={{ color: colors.textMuted, fontSize: 10, fontWeight: 700, textTransform: "uppercase", marginBottom: 6 }}>
                        Método
                      </p>
                      <Segmented
                        value={method}
                        onChange={(value) => resetPageAnd(() => setMethod(value as "all" | AuditMethod))}
                        options={[
                          ["all", "Todos"],
                          ["GET", "GET"],
                          ["POST", "POST"],
                          ["PUT", "PUT"],
                          ["PATCH", "PATCH"],
                          ["DELETE", "DELETE"],
                        ]}
                      />
                    </div>

                    <DateRangeFilter
                      from={dateFrom}
                      to={dateTo}
                      onChange={(range) => resetPageAnd(() => {
                        setDateFrom(range.from);
                        setDateTo(range.to);
                      })}
                    />

                    {(hasMenuFilters || search) && (
                      <button
                        type="button"
                        onClick={clearFilters}
                        className="h-8 rounded-lg px-3 transition-all"
                        style={{ background: colors.inputBg, border: `1px solid ${colors.border}`, color: colors.textMuted, fontSize: 12, fontWeight: 700 }}
                      >
                        Limpar filtros
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="rounded-lg overflow-hidden" style={{ background: colors.card, border: `1px solid ${colors.border}` }}>
          <div className="grid grid-cols-[76px_1.25fr_1fr_1fr_120px_92px_150px] gap-3 px-4 py-3" style={{ background: theme === "dark" ? "rgba(255,255,255,0.025)" : "#F8FAFC", borderBottom: `1px solid ${colors.border}` }}>
            {["ID", "Evento", "Empresa", "Usuário", "IP", "Status", "Data/Hora"].map((heading) => (
              <span key={heading} style={{ color: colors.textMuted, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                {heading}
              </span>
            ))}
          </div>

          <div>
            {loading && entries.length === 0 ? (
              <AuditTableSkeleton rows={8} />
            ) : entries.length === 0 ? (
              <div className="px-4 py-10 text-center" style={{ color: colors.textMuted, fontSize: 13 }}>
                Nenhum log de auditoria encontrado.
              </div>
            ) : entries.map((entry) => {
              const currentStatus = statusConfig[entry.status];
              const StatusIcon = currentStatus.icon;

              return (
                <div
                  key={entry.id}
                  onClick={() => setSelectedEntry(entry)}
                  className="grid grid-cols-[76px_1.25fr_1fr_1fr_120px_92px_150px] gap-3 px-4 py-4 items-center cursor-pointer transition-all"
                  style={{ borderBottom: `1px solid ${colors.border}` }}
                  onMouseEnter={(event) => (event.currentTarget.style.background = colors.hoverBg)}
                  onMouseLeave={(event) => (event.currentTarget.style.background = "transparent")}
                >
                  <span style={{ color: colors.textMuted, fontSize: 13, fontVariantNumeric: "tabular-nums" }}>#{entry.id}</span>
                  <div className="min-w-0">
                    <p style={{ color: colors.textPrimary, fontSize: 13, fontWeight: 650, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {entry.event}
                    </p>
                    <p className="flex items-center gap-1.5" style={{ color: colors.textMuted, fontSize: 12, marginTop: 3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      <span className="rounded-md px-1.5 py-0.5" style={{ color: methodColors[entry.method], background: `${methodColors[entry.method]}18`, fontSize: 10, fontWeight: 800 }}>
                        {entry.method}
                      </span>
                      <span className="truncate">{entry.path}</span>
                    </p>
                  </div>
                  <div className="min-w-0 flex items-center gap-2">
                    <div className="rounded-full flex items-center justify-center shrink-0" style={{ width: 28, height: 28, background: colors.tealFaint }}>
                      <Building2 size={13} style={{ color: colors.teal }} />
                    </div>
                    <div className="min-w-0">
                      <p style={{ color: colors.textPrimary, fontSize: 13, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{entry.company}</p>
                      <p style={{ color: colors.textMuted, fontSize: 11 }}>{entry.companyId ? `#${entry.companyId}` : "-"}</p>
                    </div>
                  </div>
                  <div className="min-w-0 flex items-center gap-2">
                    <div className="rounded-full flex items-center justify-center shrink-0" style={{ width: 28, height: 28, background: colors.blueFaint }}>
                      <User size={13} style={{ color: colors.blue }} />
                    </div>
                    <div className="min-w-0">
                      <p style={{ color: colors.textPrimary, fontSize: 13, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{entry.user}</p>
                      <p style={{ color: colors.textMuted, fontSize: 11, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{entry.email}</p>
                    </div>
                  </div>
                  <span style={{ color: colors.textSecondary, fontSize: 12, fontWeight: 650, fontVariantNumeric: "tabular-nums" }}>{entry.ip}</span>
                  <span className="rounded-md px-2 py-1 w-fit flex items-center gap-1.5" style={{ color: currentStatus.color, background: currentStatus.bg, fontSize: 11, fontWeight: 700 }}>
                    <StatusIcon size={12} />
                    {entry.statusCode}
                  </span>
                  <div>
                    <p style={{ color: colors.textSecondary, fontSize: 12, fontWeight: 650 }}>{entry.dateTime}</p>
                    <p style={{ color: colors.textMuted, fontSize: 11, marginTop: 2 }}>{entry.when}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {!loading && totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3" style={{ borderTop: `1px solid ${colors.border}` }}>
              <span style={{ color: colors.textMuted, fontSize: 12 }}>
                Página {page} de {totalPages} · {totalLogs} registro{totalLogs !== 1 ? "s" : ""}
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                  disabled={page === 1}
                  className="h-8 w-8 rounded-lg flex items-center justify-center disabled:opacity-40"
                  style={{ background: colors.inputBg, border: `1px solid ${colors.border}`, color: colors.textSecondary }}
                >
                  <ChevronLeft size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                  disabled={page === totalPages}
                  className="h-8 w-8 rounded-lg flex items-center justify-center disabled:opacity-40"
                  style={{ background: colors.inputBg, border: `1px solid ${colors.border}`, color: colors.textSecondary }}
                >
                  <ChevronRight size={15} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {selectedEntry && (
        <AuditDetailModal entry={selectedEntry} onClose={() => setSelectedEntry(null)} />
      )}
    </div>
  );
}

function SkeletonLine({ width, height = 12 }: { width: string | number; height?: number }) {
  const { colors } = useTheme();

  return (
    <div
      className="rounded-full animate-pulse"
      style={{
        width,
        height,
        background: colors.hoverBg,
      }}
    />
  );
}

function MetricSkeleton() {
  const { colors } = useTheme();

  return (
    <div className="rounded-lg p-4 flex items-center gap-3" style={{ background: colors.card, border: `1px solid ${colors.border}` }}>
      <SkeletonLine width={38} height={38} />
      <div className="space-y-2">
        <SkeletonLine width={72} height={10} />
        <SkeletonLine width={42} height={22} />
      </div>
    </div>
  );
}

function AuditTableSkeleton({ rows }: { rows: number }) {
  const { colors } = useTheme();

  return (
    <>
      {Array.from({ length: rows }).map((_, index) => (
        <div
          key={index}
          className="grid grid-cols-[76px_1.25fr_1fr_1fr_120px_92px_150px] gap-3 px-4 py-4 items-center"
          style={{ borderBottom: `1px solid ${colors.border}` }}
        >
          <SkeletonLine width={52} />
          <div className="space-y-2">
            <SkeletonLine width="62%" />
            <SkeletonLine width="84%" height={10} />
          </div>
          <div className="flex items-center gap-2">
            <SkeletonLine width={28} height={28} />
            <div className="space-y-2 flex-1">
              <SkeletonLine width="58%" />
              <SkeletonLine width="72%" height={10} />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <SkeletonLine width={28} height={28} />
            <div className="space-y-2 flex-1">
              <SkeletonLine width="58%" />
              <SkeletonLine width="36%" height={10} />
            </div>
          </div>
          <SkeletonLine width={86} height={12} />
          <SkeletonLine width={58} height={22} />
          <div className="space-y-2">
            <SkeletonLine width={76} />
            <SkeletonLine width={88} height={10} />
          </div>
        </div>
      ))}
    </>
  );
}

function mapAuditLog(log: ApiAuditLog): AuditEntry {
  const payloadKeys = log.payload && typeof log.payload === "object"
    ? Object.keys(log.payload)
    : [];

  return {
    id: log.id,
    event: log.event,
    module: log.module,
    company: log.company?.name ?? "ORCHESTRA",
    companyId: log.company?.id ?? null,
    user: log.user?.name ?? "Sistema",
    userId: log.user?.id ?? null,
    email: log.user?.email ?? "-",
    method: normalizeMethod(log.method),
    path: log.path ?? "-",
    statusCode: log.status_code ?? 0,
    status: log.status,
    ip: log.ip_address ?? "-",
    when: log.created_at_label ?? "-",
    dateTime: formatDateTime(log.created_at),
    payload: payloadKeys.length > 0 ? payloadKeys.join(", ") : "empty",
    raw: log,
  };
}

function normalizeMethod(method: string | null): AuditMethod {
  if (method === "GET" || method === "POST" || method === "PUT" || method === "PATCH" || method === "DELETE") {
    return method;
  }

  return "GET";
}

function formatDateTime(value: string | null): string {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return format(date, "dd/MM/yyyy HH:mm");
}

function formatJson(value: unknown): string {
  if (value === null || value === undefined) return "{}";

  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

function AuditDetailModal({ entry, onClose }: { entry: AuditEntry; onClose: () => void }) {
  const { colors, theme } = useTheme();
  const currentStatus = statusConfig[entry.status];
  const StatusIcon = currentStatus.icon;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6"
      style={{ background: "rgba(2,6,23,0.62)", backdropFilter: "blur(8px)" }}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        className="w-full max-w-[980px] max-h-[88vh] rounded-xl overflow-hidden flex flex-col"
        style={{ background: colors.card, border: `1px solid ${colors.border}`, boxShadow: "0 28px 90px rgba(2,6,23,0.36)" }}
      >
        <div className="px-5 py-4 flex items-start justify-between gap-4" style={{ borderBottom: `1px solid ${colors.border}` }}>
          <div className="min-w-0">
            <p style={{ color: colors.textMuted, fontSize: 11, fontWeight: 800, letterSpacing: "0.07em", textTransform: "uppercase" }}>
              Log #{entry.id} · {entry.module}
            </p>
            <h2 className="truncate" style={{ color: colors.textPrimary, fontSize: 20, fontWeight: 750, marginTop: 4 }}>
              {entry.event}
            </h2>
            <p className="truncate" style={{ color: colors.textMuted, fontSize: 12, marginTop: 3 }}>
              {entry.raw.action ?? "sem ação"} · {entry.path}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="h-9 w-9 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: colors.inputBg, color: colors.textMuted, border: `1px solid ${colors.border}` }}
            aria-label="Fechar"
          >
            <X size={15} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <DetailCard label="Empresa" value={entry.company} sub={entry.companyId ? `ID ${entry.companyId}` : "Sem vínculo"} icon={Building2} color={colors.teal} />
            <DetailCard label="Usuário" value={entry.user} sub={entry.email} icon={User} color={colors.blue} />
            <DetailCard label="IP" value={entry.ip} sub={entry.raw.user_agent ?? "User agent não informado"} icon={Activity} color={colors.yellow} />
            <DetailCard label="Data/Hora" value={entry.dateTime} sub={entry.when} icon={CalendarDays} color={colors.green} />
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-lg p-4" style={{ background: colors.inputBg, border: `1px solid ${colors.border}` }}>
              <p style={{ color: colors.textMuted, fontSize: 10, fontWeight: 800, textTransform: "uppercase" }}>Status</p>
              <span className="mt-3 rounded-md px-2 py-1 w-fit flex items-center gap-1.5" style={{ color: currentStatus.color, background: currentStatus.bg, fontSize: 12, fontWeight: 800 }}>
                <StatusIcon size={13} />
                {currentStatus.label} · {entry.statusCode}
              </span>
            </div>
            <div className="rounded-lg p-4" style={{ background: colors.inputBg, border: `1px solid ${colors.border}` }}>
              <p style={{ color: colors.textMuted, fontSize: 10, fontWeight: 800, textTransform: "uppercase" }}>Método</p>
              <span className="mt-3 rounded-md px-2 py-1 w-fit block" style={{ color: methodColors[entry.method], background: `${methodColors[entry.method]}18`, fontSize: 12, fontWeight: 800 }}>
                {entry.method}
              </span>
            </div>
            <div className="rounded-lg p-4 min-w-0" style={{ background: colors.inputBg, border: `1px solid ${colors.border}` }}>
              <p style={{ color: colors.textMuted, fontSize: 10, fontWeight: 800, textTransform: "uppercase" }}>Rota</p>
              <p className="truncate" style={{ color: colors.textPrimary, fontSize: 13, fontWeight: 700, marginTop: 10 }}>{entry.path}</p>
            </div>
          </div>

          <div className="grid gap-3 xl:grid-cols-3">
            <JsonPanel title="Metadata" value={entry.raw.metadata} muted={theme === "dark"} />
            <JsonPanel title="Payload" value={entry.raw.payload} muted={theme === "dark"} />
            <JsonPanel title="Response" value={entry.raw.response} muted={theme === "dark"} />
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailCard({ label, value, sub, icon: Icon, color }: { label: string; value: string; sub: string; icon: any; color: string }) {
  const { colors } = useTheme();

  return (
    <div className="rounded-lg p-4 min-w-0" style={{ background: colors.inputBg, border: `1px solid ${colors.border}` }}>
      <div className="flex items-start gap-3">
        <div className="rounded-lg flex items-center justify-center shrink-0" style={{ width: 34, height: 34, background: `${color}18`, color }}>
          <Icon size={16} />
        </div>
        <div className="min-w-0">
          <p style={{ color: colors.textMuted, fontSize: 10, fontWeight: 800, textTransform: "uppercase" }}>{label}</p>
          <p className="truncate" style={{ color: colors.textPrimary, fontSize: 13, fontWeight: 750, marginTop: 5 }}>{value}</p>
          <p className="truncate" style={{ color: colors.textMuted, fontSize: 11, marginTop: 2 }}>{sub}</p>
        </div>
      </div>
    </div>
  );
}

function JsonPanel({ title, value, muted }: { title: string; value: unknown; muted: boolean }) {
  const { colors } = useTheme();

  return (
    <div className="rounded-lg overflow-hidden" style={{ background: colors.inputBg, border: `1px solid ${colors.border}` }}>
      <div className="px-3 py-2" style={{ borderBottom: `1px solid ${colors.border}` }}>
        <p style={{ color: colors.textMuted, fontSize: 10, fontWeight: 800, textTransform: "uppercase" }}>{title}</p>
      </div>
      <pre
        className="p-3 overflow-auto"
        style={{
          minHeight: 190,
          maxHeight: 280,
          color: muted ? "#CBD5E1" : colors.textSecondary,
          fontSize: 11,
          lineHeight: 1.55,
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
        }}
      >
        {formatJson(value)}
      </pre>
    </div>
  );
}

function MetricCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: number; color: string }) {
  const { colors } = useTheme();

  return (
    <div className="rounded-lg p-4 flex items-center gap-3" style={{ background: colors.card, border: `1px solid ${colors.border}` }}>
      <div className="rounded-lg flex items-center justify-center" style={{ width: 38, height: 38, background: `${color}18` }}>
        <Icon size={17} style={{ color }} />
      </div>
      <div>
        <p style={{ color: colors.textMuted, fontSize: 12 }}>{label}</p>
        <p style={{ color: colors.textPrimary, fontSize: 22, fontWeight: 750, lineHeight: 1.1 }}>{value}</p>
      </div>
    </div>
  );
}

function FunnelIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 20a1 1 0 0 0 .553.895l2 1A1 1 0 0 0 14 21v-7a2 2 0 0 1 .517-1.341L21.74 4.67A1 1 0 0 0 21 3H3a1 1 0 0 0-.742 1.67l7.225 7.989A2 2 0 0 1 10 14z" />
    </svg>
  );
}

function Segmented({ value, onChange, options }: { value: string; onChange: (value: string) => void; options: Array<[string, string]> }) {
  const { colors, theme } = useTheme();

  return (
    <div className="flex rounded-lg p-1" style={{ background: colors.inputBg, border: `1px solid ${colors.border}` }}>
      {options.map(([optionValue, label]) => {
        const active = value === optionValue;

        return (
          <button
            key={optionValue}
            onClick={() => onChange(optionValue)}
            className="h-8 rounded-md px-3 transition-all"
            style={{
              color: active ? colors.textPrimary : colors.textMuted,
              background: active ? (theme === "dark" ? "rgba(255,255,255,0.07)" : "#FFFFFF") : "transparent",
              boxShadow: active && theme === "light" ? "0 1px 4px rgba(15,23,42,0.08)" : "none",
              fontSize: 12,
              fontWeight: active ? 700 : 500,
            }}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

function DateRangeFilter({
  from,
  to,
  onChange,
}: {
  from: string;
  to: string;
  onChange: (range: { from: string; to: string }) => void;
}) {
  const { colors, theme } = useTheme();
  const selected: DateRange | undefined = from || to
    ? { from: parseApiDate(from), to: parseApiDate(to) }
    : undefined;
  const label = formatRangeLabel(from, to);

  function handleSelect(range: DateRange | undefined) {
    onChange({
      from: formatApiDate(range?.from),
      to: formatApiDate(range?.to),
    });
  }

  return (
    <div>
      <p style={{ color: colors.textMuted, fontSize: 10, fontWeight: 700, textTransform: "uppercase", marginBottom: 6 }}>
        Periodo
      </p>
      <Popover>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="h-10 w-full rounded-lg px-3 flex items-center justify-between gap-2 transition-all"
            style={{ background: colors.inputBg, border: `1px solid ${colors.border}`, color: from || to ? colors.textPrimary : colors.textMuted, fontSize: 13, fontWeight: 600 }}
          >
            <span className="flex items-center gap-2 min-w-0">
              <CalendarDays size={14} style={{ color: colors.textMuted }} />
              <span className="truncate">{label}</span>
            </span>
            {(from || to) && (
              <span
                className="rounded-md px-2 py-1 shrink-0"
                style={{ background: colors.blueFaint, color: colors.blue, fontSize: 10, fontWeight: 800 }}
              >
                ativo
              </span>
            )}
          </button>
        </PopoverTrigger>
        <PopoverContent
          align="end"
          className="w-auto p-0 overflow-hidden"
          style={{ background: colors.card, border: `1px solid ${colors.border}`, color: colors.textPrimary }}
        >
          <Calendar
            mode="range"
            selected={selected}
            onSelect={handleSelect}
            numberOfMonths={1}
            locale={ptBR}
            className="rounded-lg"
            classNames={{
              caption_label: "text-sm font-semibold",
              cell: "relative h-9 w-9 p-0 text-center text-sm focus-within:relative focus-within:z-20",
              head_cell: "rounded-md w-8 font-semibold text-[0.72rem]",
              day: "h-8 w-8 rounded-md p-0 font-medium text-xs",
              day_today: theme === "dark" ? "bg-white/10" : "bg-slate-100",
              day_selected: "hover:bg-transparent focus:bg-transparent",
              day_range_start: "day-range-start",
              day_range_end: "day-range-end",
              day_range_middle: "bg-transparent",
            }}
            modifiersStyles={{
              selected: {
                backgroundColor: theme === "dark" ? "rgba(139,92,246,0.34)" : "rgba(139,92,246,0.16)",
                color: colors.textPrimary,
              },
              range_start: {
                backgroundColor: colors.teal,
                color: "#FFFFFF",
                boxShadow: `inset 0 0 0 1px ${colors.teal}`,
              },
              range_end: {
                backgroundColor: colors.blue,
                color: "#FFFFFF",
                boxShadow: `inset 0 0 0 1px ${colors.blue}`,
              },
              range_middle: {
                backgroundColor: theme === "dark" ? "rgba(139,92,246,0.28)" : "rgba(139,92,246,0.14)",
                color: colors.textPrimary,
              },
            }}
          />
          {(from || to) && (
            <div className="px-3 pb-3">
              <button
                type="button"
                onClick={() => onChange({ from: "", to: "" })}
                className="h-8 w-full rounded-lg transition-all"
                style={{ background: colors.inputBg, border: `1px solid ${colors.border}`, color: colors.textMuted, fontSize: 12, fontWeight: 700 }}
              >
                Limpar periodo
              </button>
            </div>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
}

function parseApiDate(value: string): Date | undefined {
  if (!value) return undefined;
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return undefined;
  return new Date(year, month - 1, day);
}

function formatApiDate(value?: Date): string {
  return value ? format(value, "yyyy-MM-dd") : "";
}

function formatRangeLabel(from: string, to: string): string {
  const fromDate = parseApiDate(from);
  const toDate = parseApiDate(to);

  if (fromDate && toDate) {
    return `${format(fromDate, "dd/MM/yyyy")} - ${format(toDate, "dd/MM/yyyy")}`;
  }

  if (fromDate) return `A partir de ${format(fromDate, "dd/MM/yyyy")}`;
  if (toDate) return `Ate ${format(toDate, "dd/MM/yyyy")}`;

  return "Selecionar periodo";
}
