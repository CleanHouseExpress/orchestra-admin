import { useEffect, useState } from "react";
import {
  Send, MailOpen, MousePointer, MailX, CheckCheck, X,
  Search, Star, Paperclip, Tag, Download, User, Calendar,
  Pencil, Bold, Italic, Underline, List, Link, Smile,
  ChevronDown, AlertCircle, CheckCircle2, Trash2, Reply,
  Forward, MoreHorizontal, Plus, Filter, Eye
} from "lucide-react";
import { useTheme } from "./ThemeContext";
import { ApiEmailMessage, ApiEmailMetrics, emailsApi } from "../services/emailsApi";
import { API_BASE_URL } from "../services/apiClient";

// ── Types ──────────────────────────────────────────────────────────────
type EmailStatus = "enviado" | "entregue" | "aberto" | "clicado" | "bounce";

interface EmailRecord {
  id: number;
  subject: string;
  preview: string;
  body: string;
  to: string;
  toName: string;
  company: string;
  from: string;
  fromName: string;
  date: string;
  time: string;
  status: EmailStatus;
  openedAt?: string;
  clickedAt?: string;
  clickedLink?: string;
  tag?: string;
  tagLabel?: string;
  previewUrl?: string;
  starred?: boolean;
  attachments?: string[];
  opens: number;
  clicks: number;
}

// ── Config ─────────────────────────────────────────────────────────────
const statusConfig: Record<EmailStatus, { label: string; color: string; bg: string; icon: any }> = {
  enviado:  { label: "Enviado",  color: "#94A3B8", bg: "rgba(148,163,184,0.12)", icon: Send         },
  entregue: { label: "Entregue", color: "#6366F1", bg: "rgba(99,102,241,0.12)",  icon: CheckCheck   },
  aberto:   { label: "Aberto",   color: "#F59E0B", bg: "rgba(245,158,11,0.12)",  icon: MailOpen     },
  clicado:  { label: "Clicado",  color: "#10B981", bg: "rgba(16,185,129,0.12)",  icon: MousePointer },
  bounce:   { label: "Bounce",   color: "#EF4444", bg: "rgba(239,68,68,0.12)",   icon: MailX        },
};

const tagColors: Record<string, { color: string; bg: string }> = {
  first_access: { color: "#6366F1", bg: "rgba(99,102,241,0.12)" },
  Onboarding: { color: "#8B5CF6", bg: "rgba(139,92,246,0.12)" },
  Financeiro: { color: "#10B981", bg: "rgba(16,185,129,0.12)" },
  Sistema:    { color: "#6366F1", bg: "rgba(99,102,241,0.12)" },
  Evento:     { color: "#F59E0B", bg: "rgba(245,158,11,0.12)" },
  Contrato:   { color: "#8B5CF6", bg: "rgba(139,92,246,0.12)" },
  Segurança:  { color: "#EF4444", bg: "rgba(239,68,68,0.12)"  },
};

const availableTags = Object.keys(tagColors);

const tagAliases: Record<string, string> = {
  first_access: "Primeiro acesso",
  onboarding: "Onboarding",
  finance: "Financeiro",
  financial: "Financeiro",
  billing: "Financeiro",
  system: "Sistema",
  contract: "Contrato",
  security: "Segurança",
};

const defaultTagColor = { color: "#6366F1", bg: "rgba(99,102,241,0.12)" };

function tagLabel(tag?: string) {
  if (!tag) return undefined;
  return tagAliases[tag] ?? tagAliases[tag.toLowerCase()] ?? tag
    .split(/[_-]+/)
    .filter(Boolean)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function tagStyle(tag?: string) {
  if (!tag) return null;
  return tagColors[tag] ?? tagColors[tagLabel(tag) ?? ""] ?? defaultTagColor;
}

const statusFromApi: Record<string, EmailStatus> = {
  queued: "enviado",
  sent: "enviado",
  delivered: "entregue",
  opened: "aberto",
  clicked: "clicado",
  bounced: "bounce",
  complained: "bounce",
  failed: "bounce",
};

const statusToApi: Record<EmailStatus, string> = {
  enviado: "sent",
  entregue: "delivered",
  aberto: "opened",
  clicado: "clicked",
  bounce: "bounced",
};

function formatDateTime(value?: string | null) {
  if (!value) {
    return { date: "—", time: "—" };
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return { date: value, time: "—" };
  }

  return {
    date: date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" }),
    time: date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
  };
}

function stringFromMetadata(metadata: Record<string, unknown>, key: string) {
  const value = metadata[key];
  return typeof value === "string" ? value : null;
}

function templateData(metadata: Record<string, unknown>) {
  const data = metadata.template_data;
  return data && typeof data === "object" && !Array.isArray(data) ? data as Record<string, unknown> : {};
}

function bodyFromEmail(email: ApiEmailMessage) {
  const data = templateData(email.metadata);
  const loginUrl = data.login_url;
  const accessEmail = data.email;

  if (typeof accessEmail === "string" && typeof loginUrl === "string") {
    return `<p>Acesso enviado para <strong>${accessEmail}</strong>.</p><p>Link de acesso: <a href="${loginUrl}" style="color:#6366F1">${loginUrl}</a></p>`;
  }

  return `<p>${email.preview || email.subject || "E-mail registrado pela plataforma."}</p>`;
}

function previewBaseUrl() {
  const explicitPreviewOrigin = import.meta.env.VITE_EMAIL_PREVIEW_BASE_URL;

  if (explicitPreviewOrigin) {
    return String(explicitPreviewOrigin).replace(/\/$/, "");
  }

  if (API_BASE_URL.startsWith("http")) {
    return API_BASE_URL.replace(/\/api\/?$/, "").replace(/\/$/, "");
  }

  return "http://localhost:8000";
}

function firstAccessPreviewUrl(email: ApiEmailMessage) {
  const tag = email.tag || email.template_code;
  if (tag !== "first_access") {
    return undefined;
  }

  const data = templateData(email.metadata);
  const params = new URLSearchParams({
    name: typeof data.name === "string" ? data.name : email.to.name || "Cliente Orquestra",
    email: typeof data.email === "string" ? data.email : email.to.email || "cliente@empresa.com.br",
    password: typeof data.password === "string" ? data.password : "Temp#A7K9P2XQ",
    login_url: typeof data.login_url === "string" ? data.login_url : "#",
  });

  return `${previewBaseUrl()}/email/primeiro-acesso?${params.toString()}`;
}

function mapApiEmail(email: ApiEmailMessage): EmailRecord {
  const timestamps = email.timestamps;
  const sentAt = timestamps.sent_at || timestamps.queued_at || email.created_at;
  const { date, time } = formatDateTime(sentAt);
  const status = statusFromApi[email.status] ?? "enviado";
  const opens = timestamps.opened_at ? 1 : 0;
  const clicks = timestamps.clicked_at ? 1 : 0;
  const tag = email.tag || email.template_code || undefined;
  const label = tagLabel(tag);

  return {
    id: email.id,
    subject: email.subject || "Sem assunto",
    preview: email.preview || stringFromMetadata(email.metadata, "preview") || "E-mail registrado pela plataforma.",
    body: bodyFromEmail(email),
    to: email.to.email || "—",
    toName: email.to.name || email.to.email || "—",
    company: email.company?.name || "—",
    from: email.from.email || "—",
    fromName: email.from.name || email.from.email || "—",
    date,
    time,
    status,
    openedAt: timestamps.opened_at ? `${formatDateTime(timestamps.opened_at).date} · ${formatDateTime(timestamps.opened_at).time}` : undefined,
    clickedAt: timestamps.clicked_at ? `${formatDateTime(timestamps.clicked_at).date} · ${formatDateTime(timestamps.clicked_at).time}` : undefined,
    tag,
    tagLabel: label,
    previewUrl: firstAccessPreviewUrl(email),
    opens,
    clicks,
  };
}

function LoadingBlock({ width = "100%", height = 12 }: { width?: string | number; height?: string | number }) {
  const { colors } = useTheme();
  return (
    <div
      className="rounded-full animate-pulse"
      style={{ width, height, background: colors.hoverBg }}
    />
  );
}

// ── Email modal ────────────────────────────────────────────────────────
function EmailModal({ email, onClose, onReply }: { email: EmailRecord; onClose: () => void; onReply: () => void }) {
  const { colors, theme } = useTheme();
  const st  = statusConfig[email.status];
  const tg  = tagStyle(email.tag);
  const [iframeLoading, setIframeLoading] = useState(true);

  useEffect(() => {
    setIframeLoading(true);
  }, [email.previewUrl, email.id]);

  return (
    <div
      className="fixed inset-0 z-50 flex"
      style={{ background: colors.bg }}
    >
      <section
        className="w-full lg:w-[46%] xl:w-[42%] min-w-0 flex flex-col"
        style={{ background: colors.card, borderRight: `1px solid ${colors.border}` }}
      >
        {/* Modal header */}
        <div className="flex items-center justify-between px-6 py-4 shrink-0" style={{ borderBottom: `1px solid ${colors.border}` }}>
          <div className="flex items-center gap-2">
            <button onClick={onReply} className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition-all" style={{ fontSize: "12px", color: "#6366F1", background: "rgba(99,102,241,0.1)", fontFamily: "'Inter',sans-serif", fontWeight: 500 }}
              onMouseEnter={e => (e.currentTarget.style.background = "rgba(99,102,241,0.18)")}
              onMouseLeave={e => (e.currentTarget.style.background = "rgba(99,102,241,0.1)")}
            >
              <Reply size={12} /> Responder
            </button>
            <button className="rounded-lg p-1.5" style={{ color: colors.textMuted }}><Forward size={14} /></button>
            <button className="rounded-lg p-1.5" style={{ color: colors.textMuted }}><MoreHorizontal size={14} /></button>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 transition-all" style={{ color: colors.textMuted }}
            onMouseEnter={e => (e.currentTarget.style.color = colors.textPrimary)}
            onMouseLeave={e => (e.currentTarget.style.color = colors.textMuted)}
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* Subject + badges */}
          <div>
            <div className="flex items-start gap-2 mb-3">
              <h2 style={{ fontFamily: "'Playfair Display',serif", color: colors.textPrimary, fontSize: "18px", fontWeight: 600, lineHeight: 1.3, flex: 1 }}>
                {email.subject}
              </h2>
              {email.starred && <Star size={14} style={{ color: "#F59E0B", fill: "#F59E0B" }} className="shrink-0 mt-1" />}
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="flex items-center gap-1 rounded-full px-2.5 py-1" style={{ fontSize: "11px", color: st.color, background: st.bg, fontWeight: 600, fontFamily: "'Inter',sans-serif" }}>
                <st.icon size={10} /> {st.label}
              </span>
              {tg && email.tag && (
                <span className="flex items-center gap-1 rounded-full px-2.5 py-1" style={{ fontSize: "11px", color: tg.color, background: tg.bg, fontFamily: "'Inter',sans-serif" }}>
                  <Tag size={9} /> {email.tagLabel ?? email.tag}
                </span>
              )}
            </div>
          </div>

          {/* Meta */}
          <div className="rounded-xl p-4 space-y-2.5" style={{ background: colors.surface, border: `1px solid ${colors.border}` }}>
            {[
              { icon: User,     label: "De",      value: `${email.fromName} <${email.from}>` },
              { icon: User,     label: "Para",    value: `${email.toName} <${email.to}>` },
              { icon: Calendar, label: "Empresa", value: email.company },
              { icon: Calendar, label: "Data",    value: `${email.date} · ${email.time}` },
            ].map((m) => (
              <div key={m.label} className="flex items-center gap-3">
                <span style={{ fontSize: "12px", color: colors.textMuted, fontFamily: "'Inter',sans-serif", minWidth: "52px" }}>{m.label}</span>
                <span style={{ fontSize: "13px", color: colors.textPrimary, fontFamily: "'Inter',sans-serif" }}>{m.value}</span>
              </div>
            ))}
          </div>

          {/* Tracking */}
          <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${colors.border}` }}>
            <div className="px-4 py-2" style={{ background: theme === "dark" ? "rgba(255,255,255,0.02)" : colors.surface, borderBottom: `1px solid ${colors.border}` }}>
              <span style={{ fontSize: "10px", color: colors.textMuted, textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "'Inter',sans-serif" }}>Rastreamento</span>
            </div>
            <div className="grid grid-cols-4 divide-x" style={{ borderColor: colors.border }}>
              {[
                { icon: Send,         label: "Enviado",  value: email.time,                       color: "#94A3B8", done: true },
                { icon: CheckCheck,   label: "Entregue", value: email.status !== "bounce" ? "✓" : "Falhou", color: email.status !== "bounce" ? "#6366F1" : "#EF4444", done: email.status !== "bounce" },
                { icon: MailOpen,     label: "Aberto",   value: email.opens > 0 ? `${email.opens}x` : "—",  color: "#F59E0B", done: !!email.openedAt },
                { icon: MousePointer, label: "Clicado",  value: email.clicks > 0 ? `${email.clicks}x` : "—", color: "#10B981", done: !!email.clickedAt },
              ].map((t) => (
                <div key={t.label} className="flex flex-col items-center py-3 gap-1.5" style={{ borderColor: colors.border }}>
                  <div className="rounded-full flex items-center justify-center" style={{ width: "28px", height: "28px", background: t.done ? `${t.color}18` : colors.surface }}>
                    <t.icon size={12} style={{ color: t.done ? t.color : colors.textMuted }} />
                  </div>
                  <span style={{ fontSize: "11px", color: t.done ? colors.textPrimary : colors.textMuted, fontFamily: "'Inter',sans-serif", fontWeight: t.done ? 600 : 400 }}>{t.label}</span>
                  <span style={{ fontSize: "10px", color: t.done ? t.color : colors.textMuted, fontFamily: "'Inter',sans-serif" }}>{t.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Attachments */}
          {email.attachments?.length ? (
            <div className="space-y-2">
              <p style={{ fontSize: "11px", color: colors.textMuted, textTransform: "uppercase", letterSpacing: "0.07em", fontFamily: "'Inter',sans-serif" }}>Anexos ({email.attachments.length})</p>
              {email.attachments.map(a => (
                <div key={a} className="flex items-center justify-between rounded-xl px-3 py-2.5 cursor-pointer transition-all"
                  style={{ background: colors.surface, border: `1px solid ${colors.border}` }}
                  onMouseEnter={e => (e.currentTarget.style.background = colors.hoverBg)}
                  onMouseLeave={e => (e.currentTarget.style.background = colors.surface)}
                >
                  <div className="flex items-center gap-2">
                    <Paperclip size={12} style={{ color: colors.textMuted }} />
                    <span style={{ fontSize: "12px", color: colors.textPrimary, fontFamily: "'Inter',sans-serif" }}>{a}</span>
                  </div>
                  <Download size={12} style={{ color: colors.textMuted }} />
                </div>
              ))}
            </div>
          ) : null}

          {/* Body */}
          <div>
            <p style={{ fontSize: "11px", color: colors.textMuted, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "8px", fontFamily: "'Inter',sans-serif" }}>Mensagem</p>
            <div
              className="rounded-xl p-5"
              style={{ background: colors.surface, border: `1px solid ${colors.border}`, fontSize: "14px", color: colors.textSecondary, lineHeight: 1.75, fontFamily: "'Inter',sans-serif" }}
              dangerouslySetInnerHTML={{ __html: email.body }}
            />
          </div>
        </div>
      </section>

      <section className="hidden lg:flex flex-1 min-w-0 flex-col" style={{ background: colors.bg }}>
        <div className="flex items-center justify-between px-6 py-4 shrink-0" style={{ borderBottom: `1px solid ${colors.border}`, background: colors.navBg }}>
          <div>
            <p style={{ fontSize: "11px", color: colors.textMuted, textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "'Inter',sans-serif" }}>Visualização</p>
            <p style={{ fontSize: "14px", color: colors.textPrimary, fontFamily: "'Inter',sans-serif", fontWeight: 500 }}>{email.subject}</p>
          </div>
        </div>
        <div className="relative flex-1 min-h-0">
          {iframeLoading && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4" style={{ background: colors.bg }}>
              <div className="rounded-2xl p-5 w-[min(420px,80%)]" style={{ background: colors.card, border: `1px solid ${colors.border}` }}>
                <div className="flex items-center gap-3 mb-5">
                  <span className="rounded-full border-2 animate-spin" style={{ width: 18, height: 18, borderColor: "rgba(99,102,241,0.18)", borderTopColor: "#6366F1" }} />
                  <span style={{ color: colors.textPrimary, fontSize: 13, fontFamily: "'Inter',sans-serif", fontWeight: 500 }}>Carregando preview do e-mail...</span>
                </div>
                <div className="space-y-3">
                  <LoadingBlock width="70%" height={18} />
                  <LoadingBlock width="100%" height={12} />
                  <LoadingBlock width="92%" height={12} />
                  <LoadingBlock width="78%" height={12} />
                </div>
              </div>
            </div>
          )}
          <iframe
            title="Visualização do e-mail"
            className="h-full w-full"
            style={{ border: 0, background: "#fff" }}
            src={email.previewUrl}
            onLoad={() => setIframeLoading(false)}
            srcDoc={email.previewUrl ? undefined : `<!doctype html>
            <html lang="pt-BR">
              <head>
                <meta charset="utf-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <style>
                  body { margin: 0; font-family: Inter, Arial, sans-serif; background: #f8fafc; color: #111827; }
                  .wrap { max-width: 720px; margin: 48px auto; background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; }
                  .head { padding: 28px 32px; background: linear-gradient(135deg, #6366F1, #4338CA); color: #fff; }
                  .head h1 { margin: 0; font-size: 22px; line-height: 1.25; }
                  .body { padding: 32px; font-size: 15px; line-height: 1.7; }
                  .meta { margin-top: 24px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 13px; }
                  a { color: #6366F1; }
                </style>
              </head>
              <body>
                <main class="wrap">
                  <header class="head"><h1>${email.subject}</h1></header>
                  <section class="body">
                    ${email.body}
                    <div class="meta">
                      Para: ${email.toName} &lt;${email.to}&gt;<br />
                      Empresa: ${email.company}
                    </div>
                  </section>
                </main>
              </body>
            </html>`}
          />
        </div>
      </section>
    </div>
  );
}

// ── Compose modal ──────────────────────────────────────────────────────
function ComposeModal({ replyTo, onClose, onSend }: { replyTo?: EmailRecord | null; onClose: () => void; onSend: (draft: Partial<EmailRecord>) => void }) {
  const { colors, theme } = useTheme();
  const [to, setTo]           = useState(replyTo ? `${replyTo.toName} <${replyTo.to}>` : "");
  const [subject, setSubject] = useState(replyTo ? `Re: ${replyTo.subject}` : "");
  const [body, setBody]       = useState("");
  const [tag, setTag]         = useState(replyTo?.tag ?? "");
  const [showTagPicker, setShowTagPicker] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent]       = useState(false);

  const handleSend = () => {
    if (!to || !subject || !body.trim()) return;
    setSending(true);
    setTimeout(() => {
      setSending(false);
      setSent(true);
      const parts = to.match(/^(.*?)\s*<(.+?)>$/) ?? [];
      onSend({
        subject, body: body.replace(/\n/g, "<br>"),
        to: parts[2] ?? to, toName: parts[1]?.trim() || to,
        tag: tag || undefined, status: "enviado", opens: 0, clicks: 0,
      });
      setTimeout(onClose, 1200);
    }, 1500);
  };

  const tgCfg = tagStyle(tag);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4"
      style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(8px)" }}
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-[600px] rounded-t-2xl sm:rounded-2xl overflow-hidden flex flex-col"
        style={{ background: colors.card, border: `1px solid ${colors.borderStrong}`, boxShadow: "0 32px 80px rgba(0,0,0,0.4)", maxHeight: "90vh" }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 shrink-0" style={{ borderBottom: `1px solid ${colors.border}` }}>
          <div className="flex items-center gap-2.5">
            <div className="rounded-lg flex items-center justify-center" style={{ width: "28px", height: "28px", background: "linear-gradient(135deg, #6366F1, #8B5CF6)" }}>
              <Pencil size={13} color="#fff" />
            </div>
            <span style={{ fontFamily: "'Playfair Display',serif", color: colors.textPrimary, fontSize: "16px", fontWeight: 600 }}>
              {replyTo ? "Responder" : "Novo E-mail"}
            </span>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 transition-all" style={{ color: colors.textMuted }}
            onMouseEnter={e => (e.currentTarget.style.color = "#EF4444")}
            onMouseLeave={e => (e.currentTarget.style.color = colors.textMuted)}
          >
            <X size={16} />
          </button>
        </div>

        {sent ? (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <div className="rounded-full flex items-center justify-center" style={{ width: "56px", height: "56px", background: "rgba(16,185,129,0.12)" }}>
              <CheckCircle2 size={26} style={{ color: "#10B981" }} />
            </div>
            <p style={{ fontFamily: "'Playfair Display',serif", color: colors.textPrimary, fontSize: "18px" }}>E-mail enviado!</p>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto">
              {/* Fields */}
              <div style={{ borderBottom: `1px solid ${colors.border}` }}>
                {/* Para */}
                <div className="flex items-center gap-3 px-5 py-3" style={{ borderBottom: `1px solid ${colors.border}` }}>
                  <span style={{ fontSize: "12px", color: colors.textMuted, fontFamily: "'Inter',sans-serif", minWidth: "52px" }}>Para</span>
                  <input value={to} onChange={e => setTo(e.target.value)} placeholder="destinatario@empresa.com"
                    className="flex-1 bg-transparent outline-none"
                    style={{ fontSize: "13px", color: colors.textPrimary, fontFamily: "'Inter',sans-serif" }}
                  />
                </div>
                {/* Assunto */}
                <div className="flex items-center gap-3 px-5 py-3" style={{ borderBottom: `1px solid ${colors.border}` }}>
                  <span style={{ fontSize: "12px", color: colors.textMuted, fontFamily: "'Inter',sans-serif", minWidth: "52px" }}>Assunto</span>
                  <input value={subject} onChange={e => setSubject(e.target.value)} placeholder="Assunto do e-mail..."
                    className="flex-1 bg-transparent outline-none"
                    style={{ fontSize: "13px", color: colors.textPrimary, fontFamily: "'Inter',sans-serif", fontWeight: 500 }}
                  />
                </div>
                {/* Tag */}
                <div className="flex items-center gap-3 px-5 py-3 relative">
                  <span style={{ fontSize: "12px", color: colors.textMuted, fontFamily: "'Inter',sans-serif", minWidth: "52px" }}>Tag</span>
                  <button onClick={() => setShowTagPicker(!showTagPicker)}
                    className="flex items-center gap-1.5 rounded-full px-3 py-1 transition-all"
                    style={{ background: tgCfg ? tgCfg.bg : colors.surface, border: `1px solid ${tgCfg ? tgCfg.color + "40" : colors.border}`, fontSize: "12px", color: tgCfg ? tgCfg.color : colors.textMuted, fontFamily: "'Inter',sans-serif" }}
                  >
                    <Tag size={10} /> {tagLabel(tag) || "Adicionar tag"} <ChevronDown size={10} />
                  </button>
                  {tag && <button onClick={() => setTag("")} style={{ color: colors.textMuted }}><X size={11} /></button>}
                  {showTagPicker && (
                    <div className="absolute top-full left-20 mt-1 rounded-xl overflow-hidden z-10"
                      style={{ background: colors.card, border: `1px solid ${colors.borderStrong}`, boxShadow: "0 12px 32px rgba(0,0,0,0.2)", minWidth: "160px" }}
                    >
                      {availableTags.map(t => {
                        const tc = tagStyle(t) ?? defaultTagColor;
                        return (
                          <button key={t} onClick={() => { setTag(t); setShowTagPicker(false); }}
                            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-left transition-all"
                            style={{ fontSize: "13px", color: tc.color, fontFamily: "'Inter',sans-serif", background: "transparent" }}
                            onMouseEnter={e => (e.currentTarget.style.background = tc.bg)}
                            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                          >
                            <span className="w-2 h-2 rounded-full" style={{ background: tc.color }} />
                            {tagLabel(t) ?? t}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Formatting bar */}
              <div className="flex items-center gap-0.5 px-4 py-2" style={{ borderBottom: `1px solid ${colors.border}`, background: theme === "dark" ? "rgba(255,255,255,0.01)" : colors.surface }}>
                {[Bold, Italic, Underline].map((Icon, i) => (
                  <button key={i} className="rounded-lg p-1.5 transition-all" style={{ color: colors.textMuted }}
                    onMouseEnter={e => (e.currentTarget.style.background = colors.hoverBg)}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                  >
                    <Icon size={14} />
                  </button>
                ))}
                <div className="w-px mx-1 h-4" style={{ background: colors.border }} />
                {[List, Link, Smile].map((Icon, i) => (
                  <button key={i} className="rounded-lg p-1.5 transition-all" style={{ color: colors.textMuted }}
                    onMouseEnter={e => (e.currentTarget.style.background = colors.hoverBg)}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                  >
                    <Icon size={14} />
                  </button>
                ))}
                <button className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 ml-auto transition-all" style={{ fontSize: "11px", color: colors.textMuted, fontFamily: "'Inter',sans-serif" }}
                  onMouseEnter={e => (e.currentTarget.style.background = colors.hoverBg)}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                >
                  <Paperclip size={13} /> Anexar
                </button>
              </div>

              {/* Body */}
              <textarea
                value={body} onChange={e => setBody(e.target.value)}
                placeholder="Escreva sua mensagem..."
                className="w-full resize-none outline-none px-5 py-4"
                rows={8}
                style={{ background: "transparent", fontSize: "14px", color: colors.textPrimary, fontFamily: "'Inter',sans-serif", lineHeight: 1.7, border: "none", display: "block" }}
              />

              {/* Signature */}
              <div className="mx-5 mb-4 rounded-xl px-4 py-3" style={{ background: colors.surface, border: `1px solid ${colors.border}` }}>
                <p style={{ fontSize: "11px", color: colors.textMuted, fontFamily: "'Inter',sans-serif", marginBottom: "3px", textTransform: "uppercase", letterSpacing: "0.06em" }}>Assinatura</p>
                <p style={{ fontSize: "12px", color: colors.textSecondary, fontFamily: "'Inter',sans-serif", lineHeight: 1.5 }}>
                  <strong style={{ color: colors.textPrimary }}>João Dias</strong> · Admin ORQUESTRA<br />
                  <span style={{ color: "#6366F1" }}>admin@orquestra.io</span>
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-5 py-4 shrink-0" style={{ borderTop: `1px solid ${colors.border}`, background: theme === "dark" ? "rgba(255,255,255,0.01)" : colors.surface }}>
              {(!to || !subject || !body.trim()) ? (
                <span className="flex items-center gap-1.5 rounded-full px-2.5 py-1" style={{ fontSize: "11px", color: "#F59E0B", background: "rgba(245,158,11,0.1)", fontFamily: "'Inter',sans-serif" }}>
                  <AlertCircle size={11} /> Preencha os campos obrigatórios
                </span>
              ) : <span />}
              <div className="flex items-center gap-2">
                <button onClick={onClose} className="rounded-xl px-4 py-2 transition-all" style={{ fontSize: "13px", color: colors.textSecondary, background: colors.surface, border: `1px solid ${colors.border}`, fontFamily: "'Inter',sans-serif" }}>
                  Cancelar
                </button>
                <button onClick={handleSend} disabled={sending || !to || !subject || !body.trim()}
                  className="flex items-center gap-2 rounded-xl px-5 py-2 transition-all hover:opacity-90 disabled:opacity-40"
                  style={{ background: "linear-gradient(135deg, #6366F1, #4338CA)", color: "#fff", fontSize: "13px", fontFamily: "'Inter',sans-serif", fontWeight: 500 }}
                >
                  {sending ? (
                    <><span className="rounded-full border-2 animate-spin" style={{ width: "12px", height: "12px", borderColor: "rgba(255,255,255,0.3)", borderTopColor: "#fff" }} /> Enviando...</>
                  ) : (
                    <><Send size={13} /> Enviar</>
                  )}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────
export function CaixaEmail() {
  const { colors, theme } = useTheme();
  const [emails, setEmails]         = useState<EmailRecord[]>([]);
  const [search, setSearch]         = useState("");
  const [statusFilter, setStatusFilter] = useState<EmailStatus | "todos">("todos");
  const [tagFilter, setTagFilter]   = useState("todos");
  const [metrics, setMetrics]       = useState<ApiEmailMetrics | null>(null);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState<string | null>(null);
  const [viewEmail, setViewEmail]   = useState<EmailRecord | null>(null);
  const [compose, setCompose]       = useState(false);
  const [replyTo, setReplyTo]       = useState<EmailRecord | null>(null);

  const openReply = (email: EmailRecord) => { setViewEmail(null); setReplyTo(email); setCompose(true); };

  useEffect(() => {
    let active = true;
    setLoading(true);
    const timeout = window.setTimeout(() => {
      const params = {
        search: search.trim() || undefined,
        status: statusFilter === "todos" ? undefined : statusToApi[statusFilter],
        tag: tagFilter === "todos" ? undefined : tagFilter,
        per_page: 100,
      };

      setError(null);

      Promise.all([
        emailsApi.list(params),
        emailsApi.metrics(params),
      ])
        .then(([listResponse, metricsResponse]) => {
          if (!active) return;
          setEmails(listResponse.data.map(mapApiEmail));
          setMetrics(metricsResponse);
        })
        .catch((err: Error) => {
          if (!active) return;
          setEmails([]);
          setMetrics(null);
          setError(err.message || "Não foi possível carregar os e-mails.");
        })
        .finally(() => {
          if (active) setLoading(false);
        });
    }, 250);

    return () => {
      active = false;
      window.clearTimeout(timeout);
    };
  }, [search, statusFilter, tagFilter]);

  const handleSend = () => {
    setError("Envio de e-mail ainda não está disponível na API.");
  };

  const filtered = emails.filter(e => {
    const matchSearch  = e.subject.toLowerCase().includes(search.toLowerCase())
      || e.toName.toLowerCase().includes(search.toLowerCase())
      || e.company.toLowerCase().includes(search.toLowerCase());
    const matchStatus  = statusFilter === "todos" || e.status === statusFilter;
    const matchTag     = tagFilter === "todos"    || e.tag === tagFilter;
    return matchSearch && matchStatus && matchTag;
  });

  const emailTags = emails.map(email => email.tag).filter((tag): tag is string => Boolean(tag));
  const tagOptions = Array.from(new Set([...availableTags, ...emailTags]));

  const kpis = [
    { label: "Enviados",       value: metrics?.sent ?? emails.length, color: "#6366F1", icon: Send },
    { label: "Taxa de Abertura", value: `${metrics?.open_rate ?? Math.round((emails.filter(e => e.openedAt).length / Math.max(emails.length, 1)) * 100)}%`, color: "#F59E0B", icon: MailOpen },
    { label: "Taxa de Clique", value: `${metrics?.click_rate ?? Math.round((emails.filter(e => e.clickedAt).length / Math.max(emails.length, 1)) * 100)}%`, color: "#10B981", icon: MousePointer },
    { label: "Bounces",        value: metrics?.bounces ?? emails.filter(e => e.status === "bounce").length, color: "#EF4444", icon: MailX },
  ];

  const cardStyle = {
    background: colors.card,
    border: `1px solid ${colors.border}`,
    boxShadow: theme === "light" ? "0 2px 12px rgba(0,0,0,0.05)" : "0 4px 20px rgba(0,0,0,0.15)",
  };

  return (
    <div className="p-6 space-y-6 overflow-y-auto h-full">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 style={{ fontFamily: "'Playfair Display',serif", color: colors.textPrimary, fontSize: "26px", fontWeight: 600 }}>
            Caixa de E-mail
          </h1>
          <p style={{ fontFamily: "'Inter',sans-serif", color: colors.textMuted, fontSize: "14px", marginTop: "4px" }}>
            E-mails enviados pelo admin para clientes e empresas
          </p>
        </div>
        <button
          onClick={() => { setReplyTo(null); setCompose(true); }}
          className="flex items-center gap-2 rounded-xl px-4 py-2.5 transition-all hover:opacity-90"
          style={{ background: "linear-gradient(135deg, #6366F1, #4338CA)", color: "#fff", fontSize: "14px", fontFamily: "'Inter',sans-serif", fontWeight: 500 }}
        >
          <Pencil size={15} /> Novo E-mail
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
          <div key={index} className="rounded-2xl p-5 flex items-center gap-3" style={cardStyle}>
            <LoadingBlock width={40} height={40} />
            <div className="space-y-2 flex-1">
              <LoadingBlock width="45%" height={22} />
              <LoadingBlock width="70%" height={12} />
            </div>
          </div>
        )) : kpis.map((k) => (
          <div key={k.label} className="rounded-2xl p-5 flex items-center gap-3 transition-all hover:translate-y-[-2px]" style={cardStyle}>
            <div className="rounded-xl flex items-center justify-center shrink-0" style={{ width: "40px", height: "40px", background: `${k.color}15` }}>
              <k.icon size={17} style={{ color: k.color }} />
            </div>
            <div>
              <p style={{ fontSize: "24px", color: colors.textPrimary, fontFamily: "'Inter',sans-serif", fontWeight: 700, lineHeight: 1 }}>{k.value}</p>
              <p style={{ fontSize: "12px", color: colors.textSecondary, fontFamily: "'Inter',sans-serif", marginTop: "3px" }}>{k.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="rounded-2xl p-4" style={cardStyle}>
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="flex items-center gap-2 rounded-xl px-3 py-2 flex-1 min-w-[200px]" style={{ background: colors.surface, border: `1px solid ${colors.border}` }}>
            <Search size={14} style={{ color: colors.textMuted }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por assunto, destinatário ou empresa..."
              className="flex-1 bg-transparent outline-none"
              style={{ fontSize: "13px", color: colors.textPrimary, fontFamily: "'Inter',sans-serif" }}
            />
            {search && <button onClick={() => setSearch("")} style={{ color: colors.textMuted }}><X size={13} /></button>}
          </div>

          {/* Status filter */}
          <div className="relative">
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as any)}
              className="appearance-none rounded-xl px-3 py-2 pr-8 outline-none cursor-pointer"
              style={{ background: colors.surface, border: `1px solid ${statusFilter !== "todos" ? "#6366F1" : colors.border}`, color: statusFilter !== "todos" ? "#6366F1" : colors.textSecondary, fontSize: "13px", fontFamily: "'Inter',sans-serif" }}
            >
              <option value="todos">Status</option>
              {Object.entries(statusConfig).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
            <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: colors.textMuted }} />
          </div>

          {/* Tag filter */}
          <div className="relative">
            <select value={tagFilter} onChange={e => setTagFilter(e.target.value)}
              className="appearance-none rounded-xl px-3 py-2 pr-8 outline-none cursor-pointer"
              style={{ background: colors.surface, border: `1px solid ${tagFilter !== "todos" ? "#6366F1" : colors.border}`, color: tagFilter !== "todos" ? "#6366F1" : colors.textSecondary, fontSize: "13px", fontFamily: "'Inter',sans-serif" }}
            >
              <option value="todos">Tag</option>
              {tagOptions.map(t => <option key={t} value={t}>{tagLabel(t) ?? t}</option>)}
            </select>
            <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: colors.textMuted }} />
          </div>

          <span style={{ marginLeft: "auto", fontSize: "13px", color: colors.textMuted, fontFamily: "'Inter',sans-serif" }}>
            {loading ? "Carregando..." : `${filtered.length} e-mail${filtered.length !== 1 ? "s" : ""}`}
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl overflow-hidden" style={cardStyle}>
        {/* Table head */}
        <div
          className="grid px-5 py-3"
          style={{
            gridTemplateColumns: "2.5fr 1.5fr 1.2fr 1fr 1fr 1fr 52px",
            borderBottom: `1px solid ${colors.border}`,
            background: theme === "light" ? colors.surface : "rgba(255,255,255,0.02)",
          }}
        >
          {["Assunto", "Destinatário", "Empresa", "Tag", "Status", "Data", ""].map(h => (
            <span key={h} style={{ fontSize: "11px", color: colors.textMuted, fontFamily: "'Inter',sans-serif", textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</span>
          ))}
        </div>

        {/* Rows */}
        {loading && emails.length === 0 ? (
          <div>
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="grid items-center px-5 py-4"
                style={{ gridTemplateColumns: "2.5fr 1.5fr 1.2fr 1fr 1fr 1fr 52px", borderBottom: index < 5 ? `1px solid ${colors.border}` : "none" }}
              >
                <div className="space-y-2 pr-3">
                  <LoadingBlock width="82%" height={13} />
                  <LoadingBlock width="58%" height={11} />
                </div>
                <div className="space-y-2 pr-2">
                  <LoadingBlock width="72%" height={13} />
                  <LoadingBlock width="86%" height={11} />
                </div>
                <LoadingBlock width="70%" height={12} />
                <LoadingBlock width={72} height={20} />
                <LoadingBlock width={88} height={24} />
                <div className="space-y-2">
                  <LoadingBlock width={72} height={12} />
                  <LoadingBlock width={44} height={11} />
                </div>
                <LoadingBlock width={28} height={28} />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <MailX size={32} style={{ color: colors.textMuted }} />
            <p style={{ fontSize: "14px", color: colors.textMuted, fontFamily: "'Inter',sans-serif" }}>Nenhum e-mail encontrado</p>
          </div>
        ) : filtered.map((email, i) => {
          const st = statusConfig[email.status];
          const tg = tagStyle(email.tag);
          const isLast = i === filtered.length - 1;
          return (
            <div
              key={email.id}
              className="grid items-center px-5 py-4 transition-all cursor-pointer group"
              style={{ gridTemplateColumns: "2.5fr 1.5fr 1.2fr 1fr 1fr 1fr 52px", borderBottom: isLast ? "none" : `1px solid ${colors.border}` }}
              onMouseEnter={e => (e.currentTarget.style.background = colors.hoverBg)}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
              onClick={() => setViewEmail(email)}
            >
              {/* Subject */}
              <div className="flex items-center gap-2 min-w-0 pr-3">
                {email.starred && <Star size={11} style={{ color: "#F59E0B", fill: "#F59E0B", shrink: 0 }} />}
                <div className="min-w-0">
                  <p style={{ fontSize: "13px", color: colors.textPrimary, fontFamily: "'Inter',sans-serif", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {email.subject}
                  </p>
                  <p style={{ fontSize: "11px", color: colors.textMuted, fontFamily: "'Inter',sans-serif", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {email.preview}
                  </p>
                </div>
              </div>

              {/* Destinatário */}
              <div className="min-w-0 pr-2">
                <p style={{ fontSize: "13px", color: colors.textPrimary, fontFamily: "'Inter',sans-serif", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{email.toName}</p>
                <p style={{ fontSize: "11px", color: colors.textMuted, fontFamily: "'Inter',sans-serif", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{email.to}</p>
              </div>

              {/* Empresa */}
              <span style={{ fontSize: "12px", color: colors.textSecondary, fontFamily: "'Inter',sans-serif", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {email.company}
              </span>

              {/* Tag */}
              <span>
                {tg && email.tag ? (
                  <span className="rounded-full px-2 py-0.5 inline-flex" style={{ fontSize: "11px", color: tg.color, background: tg.bg, fontFamily: "'Inter',sans-serif" }}>
                    {email.tagLabel ?? email.tag}
                  </span>
                ) : <span style={{ color: colors.textMuted, fontSize: "12px" }}>—</span>}
              </span>

              {/* Status */}
              <span className="flex items-center gap-1.5 rounded-full px-2.5 py-1 w-fit" style={{ fontSize: "11px", color: st.color, background: st.bg, fontFamily: "'Inter',sans-serif", fontWeight: 500 }}>
                <st.icon size={10} /> {st.label}
              </span>

              {/* Date */}
              <div>
                <p style={{ fontSize: "12px", color: colors.textSecondary, fontFamily: "'Inter',sans-serif" }}>{email.date}</p>
                <p style={{ fontSize: "11px", color: colors.textMuted, fontFamily: "'Inter',sans-serif" }}>{email.time}</p>
              </div>

              {/* Action */}
              <button
                onClick={e => { e.stopPropagation(); setViewEmail(email); }}
                className="rounded-lg p-1.5 opacity-0 group-hover:opacity-100 transition-all"
                style={{ color: colors.textMuted, background: colors.surface }}
                onMouseEnter={e => (e.currentTarget.style.color = "#6366F1")}
                onMouseLeave={e => (e.currentTarget.style.color = colors.textMuted)}
              >
                <Eye size={14} />
              </button>
            </div>
          );
        })}
      </div>

      {/* Modals */}
      {viewEmail && (
        <EmailModal
          email={viewEmail}
          onClose={() => setViewEmail(null)}
          onReply={() => openReply(viewEmail)}
        />
      )}
      {compose && (
        <ComposeModal
          replyTo={replyTo}
          onClose={() => { setCompose(false); setReplyTo(null); }}
          onSend={handleSend}
        />
      )}
    </div>
  );
}
