import { useState, useRef } from "react";
import {
  Mail, Send, Eye, MousePointer, MailOpen, MailX, CheckCheck,
  X, Search, Inbox, Star, Paperclip, Reply, Forward,
  MoreHorizontal, Tag, Download, User, Calendar, Pencil,
  Bold, Italic, Underline, List, Link, Image, Smile,
  ChevronDown, Plus, AlertCircle, CheckCircle2, Trash2,
  Clock, ArrowUpRight
} from "lucide-react";
import { useTheme } from "./ThemeContext";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from "recharts";

// ── Types ──────────────────────────────────────────────────────────────
type EmailStatus = "enviado" | "entregue" | "aberto" | "clicado" | "bounce" | "cancelado";
type PanelMode = "detail" | "compose" | "empty";

interface EmailRecord {
  id: number;
  subject: string;
  preview: string;
  body: string;
  to: string;
  toName: string;
  from: string;
  fromName: string;
  date: string;
  time: string;
  status: EmailStatus;
  openedAt?: string;
  clickedAt?: string;
  clickedLink?: string;
  tag?: string;
  starred?: boolean;
  attachments?: string[];
  opens: number;
  clicks: number;
}

// ── Mock emails ────────────────────────────────────────────────────────
const initialEmails: EmailRecord[] = [
  {
    id: 1,
    subject: "Boas-vindas à plataforma ORQUESTRA",
    preview: "Olá Mariana, seja bem-vinda! Seu acesso foi configurado...",
    body: `<p>Olá <strong>Mariana</strong>,</p><p>Seja muito bem-vinda à plataforma <strong>ORQUESTRA</strong>! Estamos muito felizes em ter a <strong>Alpha Tecnologia</strong> como parceira.</p><p>Seu ambiente de trabalho já está configurado e você pode acessar todos os módulos disponíveis no seu plano Enterprise.</p><p>Para começar, acesse o <a href="#" style="color:#6366F1">Dashboard Executivo</a> e explore as funcionalidades disponíveis.</p><p>Em caso de dúvidas, nossa equipe de suporte está disponível 24/7.</p><p>Atenciosamente,<br><strong>Equipe ORQUESTRA</strong></p>`,
    to: "m.santos@alpha.com.br", toName: "Mariana Santos",
    from: "admin@orquestra.io", fromName: "João Dias (Admin)",
    date: "10 Jun 2026", time: "09:14", status: "clicado",
    openedAt: "10 Jun 2026 · 09:42", clickedAt: "10 Jun 2026 · 09:44",
    clickedLink: "Dashboard Executivo", tag: "Onboarding", starred: true,
    opens: 3, clicks: 2,
  },
  {
    id: 2,
    subject: "Sua fatura de Junho está disponível",
    preview: "A fatura referente ao mês de Junho no valor de R$ 7.100...",
    body: `<p>Olá <strong>Ricardo</strong>,</p><p>Sua fatura referente ao mês de Junho está disponível para pagamento.</p><p><strong>Valor:</strong> R$ 7.100,00<br><strong>Vencimento:</strong> 15 de Junho de 2026<br><strong>Plano:</strong> Enterprise</p><p>Acesse o portal para visualizar e baixar o boleto ou NFe.</p>`,
    to: "r.alves@alpha.com.br", toName: "Ricardo Alves",
    from: "admin@orquestra.io", fromName: "João Dias (Admin)",
    date: "01 Jun 2026", time: "08:00", status: "aberto",
    openedAt: "01 Jun 2026 · 11:23", tag: "Financeiro",
    attachments: ["fatura-junho-2026.pdf", "nfe-2847.xml"],
    opens: 5, clicks: 0,
  },
  {
    id: 3,
    subject: "Atualização de sistema — versão 3.4.0",
    preview: "Informamos que o sistema passará por manutenção programada...",
    body: `<p>Prezados,</p><p>Informamos que na próxima <strong>segunda-feira, 15 de Junho</strong>, realizaremos uma manutenção programada das <strong>02h às 04h</strong>.</p><p>Durante esse período o sistema ficará indisponível.</p><p>Novidades: melhorias de performance, novo módulo de relatórios e correções de segurança.</p>`,
    to: "m.santos@alpha.com.br", toName: "Mariana Santos",
    from: "admin@orquestra.io", fromName: "João Dias (Admin)",
    date: "08 Jun 2026", time: "14:30", status: "entregue",
    tag: "Sistema", opens: 0, clicks: 0,
  },
  {
    id: 4,
    subject: "Convite: Webinar exclusivo Enterprise — 20/06",
    preview: "Como cliente Enterprise, você tem acesso exclusivo ao nosso webinar...",
    body: `<p>Olá <strong>Mariana</strong>,</p><p>Como cliente do plano Enterprise, você tem acesso exclusivo ao nosso webinar <strong>"Estratégias de Crescimento com ORQUESTRA"</strong>.</p><p>📅 <strong>Data:</strong> 20 de Junho de 2026<br>⏰ <strong>Horário:</strong> 15h00<br>🔗 <strong>Link:</strong> <a href="#" style="color:#6366F1">Confirmar presença</a></p>`,
    to: "m.santos@alpha.com.br", toName: "Mariana Santos",
    from: "admin@orquestra.io", fromName: "João Dias (Admin)",
    date: "05 Jun 2026", time: "10:00", status: "clicado",
    openedAt: "05 Jun 2026 · 10:47", clickedAt: "05 Jun 2026 · 10:49",
    clickedLink: "Confirmar presença", tag: "Evento", starred: true,
    opens: 4, clicks: 1,
  },
  {
    id: 5,
    subject: "Lembrete: Contrato #2791 vence em 3 dias",
    preview: "O contrato de Manutenção de Sistemas vencerá em 3 dias...",
    body: `<p>Olá <strong>Ricardo</strong>,</p><p>Este é um lembrete automático: o contrato <strong>#2791 — Manutenção de Sistemas</strong> vencerá em <strong>3 dias</strong>.</p><p>Para renovar, acesse o portal ou entre em contato com seu gerente de conta.</p>`,
    to: "r.alves@alpha.com.br", toName: "Ricardo Alves",
    from: "admin@orquestra.io", fromName: "João Dias (Admin)",
    date: "03 Jun 2026", time: "08:00", status: "aberto",
    openedAt: "03 Jun 2026 · 09:12", tag: "Contrato",
    opens: 2, clicks: 0,
  },
  {
    id: 6,
    subject: "Relatório de uso — Maio 2026",
    preview: "Confira o resumo de utilização da plataforma no mês de Maio...",
    body: `<p>Olá <strong>Mariana</strong>,</p><p>Segue o relatório de uso da plataforma em <strong>Maio 2026</strong>:</p><ul><li>Acessos: 1.284</li><li>Relatórios gerados: 47</li><li>Contratos criados: 2</li><li>Usuários ativos: 4 de 4</li></ul>`,
    to: "m.santos@alpha.com.br", toName: "Mariana Santos",
    from: "admin@orquestra.io", fromName: "João Dias (Admin)",
    date: "01 Jun 2026", time: "07:00", status: "enviado",
    attachments: ["relatorio-uso-maio-2026.pdf"],
    opens: 0, clicks: 0,
  },
  {
    id: 7,
    subject: "Verificação de segurança — novo acesso detectado",
    preview: "Um novo acesso foi detectado na sua conta a partir de SP...",
    body: `<p>Olá <strong>Carlos</strong>,</p><p>Detectamos um novo acesso à sua conta:</p><p>📍 <strong>Local:</strong> São Paulo, SP<br>💻 <strong>Dispositivo:</strong> Chrome · Windows<br>🕐 <strong>Horário:</strong> 22 Mai 2026 · 14:32</p>`,
    to: "c.lima@alpha.com.br", toName: "Carlos Lima",
    from: "admin@orquestra.io", fromName: "João Dias (Admin)",
    date: "22 Mai 2026", time: "14:33", status: "bounce",
    tag: "Segurança", opens: 0, clicks: 0,
  },
];

// ── Status/tag configs ─────────────────────────────────────────────────
const statusConfig: Record<EmailStatus, { label: string; color: string; bg: string; icon: any; desc: string }> = {
  enviado:   { label: "Enviado",   color: "#94A3B8", bg: "rgba(148,163,184,0.12)", icon: Send,         desc: "Aguardando entrega" },
  entregue:  { label: "Entregue",  color: "#6366F1", bg: "rgba(99,102,241,0.12)",  icon: CheckCheck,   desc: "Entregue na caixa de entrada" },
  aberto:    { label: "Aberto",    color: "#F59E0B", bg: "rgba(245,158,11,0.12)",  icon: MailOpen,     desc: "Destinatário abriu" },
  clicado:   { label: "Clicado",   color: "#10B981", bg: "rgba(16,185,129,0.12)",  icon: MousePointer, desc: "Link clicado" },
  bounce:    { label: "Bounce",    color: "#EF4444", bg: "rgba(239,68,68,0.12)",   icon: MailX,        desc: "Não pôde ser entregue" },
  cancelado: { label: "Cancelado", color: "#64748B", bg: "rgba(100,116,139,0.12)", icon: X,            desc: "Envio cancelado" },
};

const tagColors: Record<string, { color: string; bg: string }> = {
  Onboarding: { color: "#8B5CF6", bg: "rgba(139,92,246,0.12)" },
  Financeiro: { color: "#10B981", bg: "rgba(16,185,129,0.12)" },
  Sistema:    { color: "#6366F1", bg: "rgba(99,102,241,0.12)" },
  Evento:     { color: "#F59E0B", bg: "rgba(245,158,11,0.12)" },
  Contrato:   { color: "#8B5CF6", bg: "rgba(139,92,246,0.12)" },
  Segurança:  { color: "#EF4444", bg: "rgba(239,68,68,0.12)" },
};

const availableTags = Object.keys(tagColors);
const weeklyData = [
  { week: "Sem 1", enviados: 2, abertos: 2, clicados: 1 },
  { week: "Sem 2", enviados: 3, abertos: 1, clicados: 0 },
  { week: "Sem 3", enviados: 2, abertos: 1, clicados: 1 },
  { week: "Sem 4", enviados: 0, abertos: 0, clicados: 0 },
];

// ── Tooltip ────────────────────────────────────────────────────────────
function CustomTooltip({ active, payload, label }: any) {
  const { colors } = useTheme();
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl px-4 py-3" style={{ background: colors.card, border: `1px solid ${colors.borderStrong}`, boxShadow: "0 8px 24px rgba(0,0,0,0.15)" }}>
      <p style={{ fontSize: "12px", color: colors.textMuted, marginBottom: "4px", fontFamily: "'Inter',sans-serif" }}>{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} style={{ fontSize: "13px", color: p.color, fontFamily: "'Inter',sans-serif" }}>{p.name}: {p.value}</p>
      ))}
    </div>
  );
}

// ── Email detail panel ─────────────────────────────────────────────────
function EmailDetail({ email, onClose, onReply }: { email: EmailRecord; onClose: () => void; onReply: (email: EmailRecord) => void }) {
  const { colors } = useTheme();
  const st  = statusConfig[email.status];
  const tag = email.tag ? tagColors[email.tag] : null;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-5 py-3 shrink-0" style={{ borderBottom: `1px solid ${colors.border}` }}>
        <div className="flex items-center gap-1.5">
          <button onClick={() => onReply(email)} className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 transition-all text-xs" style={{ color: "#6366F1", background: "rgba(99,102,241,0.1)", fontFamily: "'Inter',sans-serif", fontWeight: 500 }}
            onMouseEnter={e => (e.currentTarget.style.background = "rgba(99,102,241,0.18)")}
            onMouseLeave={e => (e.currentTarget.style.background = "rgba(99,102,241,0.1)")}
          >
            <Reply size={12} /> Responder
          </button>
          <button className="rounded-lg p-1.5 transition-all" style={{ color: colors.textMuted }}>
            <Forward size={14} />
          </button>
          <button className="rounded-lg p-1.5 transition-all" style={{ color: colors.textMuted }}>
            <MoreHorizontal size={14} />
          </button>
        </div>
        <button onClick={onClose} className="rounded-lg p-1.5 transition-all" style={{ color: colors.textMuted }}
          onMouseEnter={e => (e.currentTarget.style.color = colors.textPrimary)}
          onMouseLeave={e => (e.currentTarget.style.color = colors.textMuted)}
        >
          <X size={15} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
        {/* Subject */}
        <div>
          <div className="flex items-start gap-2 mb-2">
            <h3 style={{ fontFamily: "'Playfair Display',serif", color: colors.textPrimary, fontSize: "16px", fontWeight: 600, lineHeight: 1.3, flex: 1 }}>{email.subject}</h3>
            {email.starred && <Star size={13} style={{ color: "#F59E0B", fill: "#F59E0B" }} className="shrink-0 mt-0.5" />}
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="flex items-center gap-1 rounded-full px-2.5 py-1" style={{ fontSize: "11px", color: st.color, background: st.bg, fontWeight: 600, fontFamily: "'Inter',sans-serif" }}>
              <st.icon size={10} /> {st.label}
            </span>
            {tag && email.tag && (
              <span className="flex items-center gap-1 rounded-full px-2.5 py-1" style={{ fontSize: "11px", color: tag.color, background: tag.bg, fontFamily: "'Inter',sans-serif" }}>
                <Tag size={9} /> {email.tag}
              </span>
            )}
          </div>
        </div>

        {/* Meta */}
        <div className="rounded-xl p-4 space-y-2.5" style={{ background: colors.surface, border: `1px solid ${colors.border}` }}>
          {[
            { icon: User,     label: "De",   value: `${email.fromName} <${email.from}>` },
            { icon: Mail,     label: "Para", value: `${email.toName} <${email.to}>` },
            { icon: Calendar, label: "Data", value: `${email.date} · ${email.time}` },
          ].map((m) => (
            <div key={m.label} className="flex items-center gap-3">
              <div className="rounded-md flex items-center justify-center shrink-0" style={{ width: "24px", height: "24px", background: colors.card }}>
                <m.icon size={11} style={{ color: colors.textMuted }} />
              </div>
              <span style={{ fontSize: "11px", color: colors.textMuted, fontFamily: "'Inter',sans-serif", minWidth: "28px" }}>{m.label}</span>
              <span style={{ fontSize: "12px", color: colors.textPrimary, fontFamily: "'Inter',sans-serif", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.value}</span>
            </div>
          ))}
        </div>

        {/* Tracking timeline */}
        <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${colors.border}` }}>
          <div className="px-4 py-2" style={{ background: colors.surface, borderBottom: `1px solid ${colors.border}` }}>
            <span style={{ fontSize: "10px", color: colors.textMuted, textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "'Inter',sans-serif" }}>Rastreamento</span>
          </div>
          {[
            { icon: Send,         label: "Enviado",  value: `${email.date} · ${email.time}`,                  color: "#94A3B8", done: true },
            { icon: CheckCheck,   label: "Entregue", value: email.status !== "bounce" ? email.date : "Falhou", color: email.status !== "bounce" ? "#6366F1" : "#EF4444", done: email.status !== "bounce" },
            { icon: MailOpen,     label: "Aberto",   value: email.openedAt  ?? "Não aberto",                  color: email.openedAt  ? "#F59E0B" : colors.textMuted, done: !!email.openedAt  },
            { icon: MousePointer, label: "Clicado",  value: email.clickedAt ? `${email.clickedAt}` : "—",     color: email.clickedAt ? "#10B981" : colors.textMuted, done: !!email.clickedAt },
          ].map((t, i, arr) => (
            <div key={t.label} className="flex items-center gap-3 px-4 py-3" style={{ borderBottom: i < arr.length - 1 ? `1px solid ${colors.border}` : "none" }}>
              <div className="rounded-full flex items-center justify-center shrink-0" style={{ width: "26px", height: "26px", background: t.done ? `${t.color}18` : colors.surface }}>
                <t.icon size={11} style={{ color: t.done ? t.color : colors.textMuted }} />
              </div>
              <div className="flex-1 min-w-0">
                <p style={{ fontSize: "12px", color: t.done ? colors.textPrimary : colors.textMuted, fontFamily: "'Inter',sans-serif", fontWeight: t.done ? 500 : 400 }}>{t.label}</p>
                <p style={{ fontSize: "11px", color: colors.textMuted, fontFamily: "'Inter',sans-serif", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.value}</p>
              </div>
              {t.done && <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: t.color }} />}
            </div>
          ))}
        </div>

        {/* Engajamento pills */}
        <div className="flex gap-3">
          <div className="flex items-center gap-2 rounded-xl px-3 py-2 flex-1" style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)" }}>
            <Eye size={13} style={{ color: "#F59E0B" }} />
            <div>
              <p style={{ fontSize: "16px", color: "#F59E0B", fontFamily: "'Inter',sans-serif", fontWeight: 700, lineHeight: 1 }}>{email.opens}</p>
              <p style={{ fontSize: "10px", color: "#F59E0B", fontFamily: "'Inter',sans-serif", opacity: 0.8 }}>abertura{email.opens !== 1 ? "s" : ""}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-xl px-3 py-2 flex-1" style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)" }}>
            <MousePointer size={13} style={{ color: "#10B981" }} />
            <div>
              <p style={{ fontSize: "16px", color: "#10B981", fontFamily: "'Inter',sans-serif", fontWeight: 700, lineHeight: 1 }}>{email.clicks}</p>
              <p style={{ fontSize: "10px", color: "#10B981", fontFamily: "'Inter',sans-serif", opacity: 0.8 }}>clique{email.clicks !== 1 ? "s" : ""}</p>
            </div>
          </div>
        </div>

        {/* Attachments */}
        {email.attachments?.length ? (
          <div className="space-y-2">
            <p style={{ fontSize: "11px", color: colors.textMuted, textTransform: "uppercase", letterSpacing: "0.07em", fontFamily: "'Inter',sans-serif" }}>Anexos</p>
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
            className="rounded-xl p-4"
            style={{ background: colors.surface, border: `1px solid ${colors.border}`, fontSize: "13px", color: colors.textSecondary, lineHeight: 1.7, fontFamily: "'Inter',sans-serif" }}
            dangerouslySetInnerHTML={{ __html: email.body }}
          />
        </div>
      </div>
    </div>
  );
}

// ── Compose panel ──────────────────────────────────────────────────────
function ComposePanel({ replyTo, onSend, onDiscard }: {
  replyTo?: EmailRecord | null;
  onSend: (email: Partial<EmailRecord>) => void;
  onDiscard: () => void;
}) {
  const { colors, theme } = useTheme();
  const [to, setTo]           = useState(replyTo ? `${replyTo.toName} <${replyTo.to}>` : "");
  const [subject, setSubject] = useState(replyTo ? `Re: ${replyTo.subject}` : "");
  const [body, setBody]       = useState(replyTo ? `\n\n---\nEm ${replyTo.date}, você escreveu:\n> ${replyTo.preview}` : "");
  const [tag, setTag]         = useState(replyTo?.tag ?? "");
  const [showTagPicker, setShowTagPicker] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent]       = useState(false);
  const bodyRef = useRef<HTMLTextAreaElement>(null);

  const wrapSelection = (before: string, after: string) => {
    const el = bodyRef.current;
    if (!el) return;
    const start = el.selectionStart, end = el.selectionEnd;
    const selected = body.slice(start, end);
    const newBody = body.slice(0, start) + before + selected + after + body.slice(end);
    setBody(newBody);
    setTimeout(() => { el.focus(); el.setSelectionRange(start + before.length, end + before.length); }, 0);
  };

  const handleSend = () => {
    if (!to || !subject || !body) return;
    setSending(true);
    setTimeout(() => {
      setSending(false);
      setSent(true);
      const parts = to.match(/^(.*?)\s*<(.+?)>$/) ?? [];
      onSend({
        subject, body: body.replace(/\n/g, "<br>"),
        to: parts[2] ?? to, toName: parts[1]?.trim() || to,
        from: "admin@orquestra.io", fromName: "João Dias (Admin)",
        tag: tag || undefined,
        status: "enviado", opens: 0, clicks: 0,
      });
    }, 1600);
  };

  const tagCfg = tag ? tagColors[tag] : null;

  if (sent) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <div className="rounded-full flex items-center justify-center" style={{ width: "60px", height: "60px", background: "rgba(16,185,129,0.12)" }}>
          <CheckCircle2 size={28} style={{ color: "#10B981" }} />
        </div>
        <p style={{ fontFamily: "'Playfair Display',serif", color: colors.textPrimary, fontSize: "18px", fontWeight: 600 }}>E-mail enviado!</p>
        <p style={{ fontSize: "13px", color: colors.textMuted, fontFamily: "'Inter',sans-serif", textAlign: "center" }}>Sua mensagem foi entregue para <strong style={{ color: colors.textPrimary }}>{to}</strong></p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Compose header */}
      <div className="flex items-center justify-between px-5 py-3 shrink-0" style={{ borderBottom: `1px solid ${colors.border}` }}>
        <div className="flex items-center gap-2">
          <div className="rounded-lg flex items-center justify-center" style={{ width: "28px", height: "28px", background: "linear-gradient(135deg, #6366F1, #8B5CF6)" }}>
            <Pencil size={13} color="#fff" />
          </div>
          <span style={{ fontSize: "14px", color: colors.textPrimary, fontFamily: "'Playfair Display',serif", fontWeight: 600 }}>
            {replyTo ? "Responder" : "Novo E-mail"}
          </span>
        </div>
        <button onClick={onDiscard} className="rounded-lg p-1.5 transition-all" style={{ color: colors.textMuted }}
          onMouseEnter={e => (e.currentTarget.style.color = "#EF4444")}
          onMouseLeave={e => (e.currentTarget.style.color = colors.textMuted)}
        >
          <Trash2 size={14} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto flex flex-col">
        {/* Fields */}
        <div style={{ borderBottom: `1px solid ${colors.border}` }}>
          {/* To */}
          <div className="flex items-center gap-3 px-5 py-3" style={{ borderBottom: `1px solid ${colors.border}` }}>
            <span style={{ fontSize: "12px", color: colors.textMuted, fontFamily: "'Inter',sans-serif", minWidth: "44px" }}>Para</span>
            <input
              value={to} onChange={e => setTo(e.target.value)}
              placeholder="destinatario@empresa.com.br"
              className="flex-1 bg-transparent outline-none"
              style={{ fontSize: "13px", color: colors.textPrimary, fontFamily: "'Inter',sans-serif" }}
            />
          </div>

          {/* Subject */}
          <div className="flex items-center gap-3 px-5 py-3" style={{ borderBottom: `1px solid ${colors.border}` }}>
            <span style={{ fontSize: "12px", color: colors.textMuted, fontFamily: "'Inter',sans-serif", minWidth: "44px" }}>Assunto</span>
            <input
              value={subject} onChange={e => setSubject(e.target.value)}
              placeholder="Assunto do e-mail..."
              className="flex-1 bg-transparent outline-none"
              style={{ fontSize: "13px", color: colors.textPrimary, fontFamily: "'Inter',sans-serif", fontWeight: 500 }}
            />
          </div>

          {/* Tag */}
          <div className="flex items-center gap-3 px-5 py-3 relative">
            <span style={{ fontSize: "12px", color: colors.textMuted, fontFamily: "'Inter',sans-serif", minWidth: "44px" }}>Tag</span>
            <button
              onClick={() => setShowTagPicker(!showTagPicker)}
              className="flex items-center gap-2 rounded-full px-3 py-1 transition-all"
              style={{
                background: tagCfg ? tagCfg.bg : colors.surface,
                border: `1px solid ${tagCfg ? tagCfg.color + "40" : colors.border}`,
                fontSize: "12px", color: tagCfg ? tagCfg.color : colors.textMuted, fontFamily: "'Inter',sans-serif",
              }}
            >
              <Tag size={10} />
              {tag || "Adicionar tag"}
              <ChevronDown size={10} />
            </button>
            {tag && (
              <button onClick={() => setTag("")} className="rounded-full p-0.5" style={{ color: colors.textMuted }}>
                <X size={11} />
              </button>
            )}
            {showTagPicker && (
              <div
                className="absolute top-full left-16 mt-1 rounded-xl overflow-hidden z-10"
                style={{ background: colors.card, border: `1px solid ${colors.borderStrong}`, boxShadow: "0 12px 32px rgba(0,0,0,0.2)", minWidth: "160px" }}
              >
                {availableTags.map(t => {
                  const tc = tagColors[t];
                  return (
                    <button key={t} onClick={() => { setTag(t); setShowTagPicker(false); }}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 transition-all text-left"
                      style={{ fontSize: "13px", color: tc.color, fontFamily: "'Inter',sans-serif", background: "transparent" }}
                      onMouseEnter={e => (e.currentTarget.style.background = tc.bg)}
                      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                    >
                      <span className="w-2 h-2 rounded-full" style={{ background: tc.color }} />
                      {t}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Formatting toolbar */}
        <div className="flex items-center gap-0.5 px-4 py-2 shrink-0" style={{ borderBottom: `1px solid ${colors.border}`, background: theme === "dark" ? "rgba(255,255,255,0.01)" : colors.surface }}>
          {[
            { icon: Bold,      action: () => wrapSelection("**", "**"),     title: "Negrito" },
            { icon: Italic,    action: () => wrapSelection("_", "_"),       title: "Itálico" },
            { icon: Underline, action: () => wrapSelection("<u>", "</u>"),  title: "Sublinhado" },
          ].map(({ icon: Icon, action, title }) => (
            <button key={title} onClick={action} title={title}
              className="rounded-lg p-1.5 transition-all"
              style={{ color: colors.textMuted }}
              onMouseEnter={e => (e.currentTarget.style.background = colors.hoverBg)}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
            >
              <Icon size={14} />
            </button>
          ))}
          <div className="w-px mx-1 h-4" style={{ background: colors.border }} />
          {[
            { icon: List,  title: "Lista" },
            { icon: Link,  title: "Link" },
            { icon: Smile, title: "Emoji" },
          ].map(({ icon: Icon, title }) => (
            <button key={title} title={title}
              className="rounded-lg p-1.5 transition-all"
              style={{ color: colors.textMuted }}
              onMouseEnter={e => (e.currentTarget.style.background = colors.hoverBg)}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
            >
              <Icon size={14} />
            </button>
          ))}
          <div className="w-px mx-1 h-4" style={{ background: colors.border }} />
          <button title="Anexar arquivo"
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 transition-all ml-auto"
            style={{ fontSize: "11px", color: colors.textMuted, fontFamily: "'Inter',sans-serif" }}
            onMouseEnter={e => (e.currentTarget.style.background = colors.hoverBg)}
            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
          >
            <Paperclip size={13} /> Anexar
          </button>
        </div>

        {/* Body textarea */}
        <textarea
          ref={bodyRef}
          value={body}
          onChange={e => setBody(e.target.value)}
          placeholder={`Escreva sua mensagem aqui...\n\nDica: selecione texto e use a barra de formatação acima.`}
          className="flex-1 resize-none outline-none px-5 py-4 min-h-[200px]"
          style={{
            background: "transparent",
            fontSize: "14px",
            color: colors.textPrimary,
            fontFamily: "'Inter',sans-serif",
            lineHeight: 1.7,
            border: "none",
          }}
        />

        {/* Signature preview */}
        <div className="px-5 py-3 mx-5 mb-4 rounded-xl shrink-0" style={{ background: colors.surface, border: `1px solid ${colors.border}` }}>
          <p style={{ fontSize: "11px", color: colors.textMuted, fontFamily: "'Inter',sans-serif", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.06em" }}>Assinatura</p>
          <p style={{ fontSize: "12px", color: colors.textSecondary, fontFamily: "'Inter',sans-serif", lineHeight: 1.5 }}>
            <strong style={{ color: colors.textPrimary }}>João Dias</strong><br />
            Administrador · ORQUESTRA<br />
            <span style={{ color: "#6366F1" }}>admin@orquestra.io</span>
          </p>
        </div>
      </div>

      {/* Send footer */}
      <div
        className="flex items-center justify-between px-5 py-4 shrink-0"
        style={{ borderTop: `1px solid ${colors.border}`, background: theme === "dark" ? "rgba(255,255,255,0.01)" : colors.surface }}
      >
        <div className="flex items-center gap-2">
          {/* Validation hint */}
          {(!to || !subject || !body.trim()) && (
            <span className="flex items-center gap-1.5 rounded-full px-2.5 py-1" style={{ fontSize: "11px", color: "#F59E0B", background: "rgba(245,158,11,0.1)", fontFamily: "'Inter',sans-serif" }}>
              <AlertCircle size={11} /> Preencha Para, Assunto e Mensagem
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onDiscard} className="rounded-xl px-4 py-2 transition-all text-sm" style={{ color: colors.textSecondary, background: colors.surface, border: `1px solid ${colors.border}`, fontFamily: "'Inter',sans-serif" }}
            onMouseEnter={e => (e.currentTarget.style.background = colors.hoverBg)}
            onMouseLeave={e => (e.currentTarget.style.background = colors.surface)}
          >
            Descartar
          </button>
          <button
            onClick={handleSend}
            disabled={sending || !to || !subject || !body.trim()}
            className="flex items-center gap-2 rounded-xl px-5 py-2 transition-all hover:opacity-90 disabled:opacity-40"
            style={{ background: sending ? colors.surface : colors.blue, color: sending ? colors.textSecondary : "#fff", fontSize: "14px", fontFamily: "'Inter',sans-serif", fontWeight: 500, border: sending ? `1px solid ${colors.border}` : "none" }}
          >
            {sending ? (
              <>
                <span className="rounded-full border-2 animate-spin" style={{ width: "13px", height: "13px", borderColor: "rgba(99,102,241,0.2)", borderTopColor: "#6366F1" }} />
                Enviando...
              </>
            ) : (
              <><Send size={14} /> Enviar</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main ───────────────────────────────────────────────────────────────
export function EmpresaEmails() {
  const { colors, theme } = useTheme();
  const [emailList, setEmailList]     = useState<EmailRecord[]>(initialEmails);
  const [search, setSearch]           = useState("");
  const [statusFilter, setStatusFilter] = useState<EmailStatus | "todos">("todos");
  const [selected, setSelected]       = useState<EmailRecord | null>(emailList[0]);
  const [panelMode, setPanelMode]     = useState<PanelMode>("detail");
  const [replyTarget, setReplyTarget] = useState<EmailRecord | null>(null);

  const openCompose = () => { setReplyTarget(null); setPanelMode("compose"); };
  const openReply   = (email: EmailRecord) => { setReplyTarget(email); setPanelMode("compose"); };

  const handleSend = (draft: Partial<EmailRecord>) => {
    const now = new Date();
    const dateStr = now.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
    const timeStr = now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    const newEmail: EmailRecord = {
      id: emailList.length + 1,
      preview: (draft.body?.replace(/<[^>]+>/g, "").slice(0, 80) ?? "") + "...",
      date: dateStr, time: timeStr,
      opens: 0, clicks: 0,
      ...draft,
    } as EmailRecord;
    setEmailList(prev => [newEmail, ...prev]);
    setSelected(newEmail);
    setTimeout(() => setPanelMode("detail"), 1400);
  };

  const filtered = emailList.filter(e => {
    const matchSearch = e.subject.toLowerCase().includes(search.toLowerCase()) || e.toName.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "todos" || e.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalSent    = emailList.length;
  const openRate     = Math.round((emailList.filter(e => e.openedAt).length / totalSent) * 100);
  const clickRate    = Math.round((emailList.filter(e => e.clickedAt).length / totalSent) * 100);
  const bounceCount  = emailList.filter(e => e.status === "bounce").length;

  const kpis = [
    { label: "E-mails Enviados", value: totalSent,          color: "#6366F1", icon: Send         },
    { label: "Taxa de Abertura", value: `${openRate}%`,     color: "#F59E0B", icon: MailOpen      },
    { label: "Taxa de Clique",   value: `${clickRate}%`,    color: "#10B981", icon: MousePointer  },
    { label: "Bounces",          value: bounceCount,        color: "#EF4444", icon: MailX         },
  ];

  const cardStyle = {
    background: colors.card,
    border: `1px solid ${colors.border}`,
    boxShadow: theme === "light" ? "0 2px 12px rgba(0,0,0,0.05)" : "0 4px 20px rgba(0,0,0,0.15)",
  };

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* KPIs */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 shrink-0">
        {kpis.map((k) => (
          <div key={k.label} className="rounded-2xl p-4 flex items-center gap-3" style={cardStyle}>
            <div className="rounded-xl flex items-center justify-center shrink-0" style={{ width: "38px", height: "38px", background: `${k.color}15` }}>
              <k.icon size={16} style={{ color: k.color }} />
            </div>
            <div>
              <p style={{ fontSize: "20px", color: colors.textPrimary, fontFamily: "'Inter',sans-serif", fontWeight: 700, lineHeight: 1 }}>{k.value}</p>
              <p style={{ fontSize: "11px", color: colors.textSecondary, fontFamily: "'Inter',sans-serif", marginTop: "3px" }}>{k.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 flex-1 min-h-0">

        {/* ── Lista lateral ── */}
        <div className="xl:col-span-1 flex flex-col rounded-2xl overflow-hidden min-h-0" style={cardStyle}>
          {/* Toolbar */}
          <div className="p-3 space-y-2 shrink-0" style={{ borderBottom: `1px solid ${colors.border}` }}>
            {/* Novo e-mail button */}
            <button
              onClick={openCompose}
              className="w-full flex items-center justify-center gap-2 rounded-xl py-2.5 transition-all hover:opacity-90"
              style={{ background: panelMode === "compose" && !replyTarget ? "linear-gradient(135deg, #6366F1, #4338CA)" : colors.surface, color: panelMode === "compose" && !replyTarget ? "#fff" : colors.blue, border: `1px solid ${panelMode === "compose" && !replyTarget ? "transparent" : "rgba(99,102,241,0.4)"}`, fontSize: "13px", fontFamily: "'Inter',sans-serif", fontWeight: 600 }}
            >
              <Pencil size={14} />
              Novo E-mail
            </button>

            {/* Search */}
            <div className="flex items-center gap-2 rounded-xl px-3 py-2" style={{ background: colors.surface, border: `1px solid ${colors.border}` }}>
              <Search size={13} style={{ color: colors.textMuted }} />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar..."
                className="flex-1 bg-transparent outline-none"
                style={{ fontSize: "12px", color: colors.textPrimary, fontFamily: "'Inter',sans-serif" }}
              />
              {search && <button onClick={() => setSearch("")} style={{ color: colors.textMuted }}><X size={11} /></button>}
            </div>

            {/* Status pills */}
            <div className="flex gap-1 flex-wrap">
              {[
                { key: "todos", label: "Todos", color: "#6366F1" },
                ...Object.entries(statusConfig).map(([k, v]) => ({ key: k, label: v.label, color: v.color })),
              ].map(({ key, label, color }) => (
                <button key={key} onClick={() => setStatusFilter(key as any)}
                  className="rounded-full px-2 py-0.5 transition-all"
                  style={{
                    fontSize: "10px", fontFamily: "'Inter',sans-serif", fontWeight: statusFilter === key ? 600 : 400,
                    background: statusFilter === key ? color : colors.surface,
                    color: statusFilter === key ? "#fff" : colors.textMuted,
                    border: `1px solid ${statusFilter === key ? "transparent" : colors.border}`,
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 gap-2">
                <Inbox size={24} style={{ color: colors.textMuted }} />
                <p style={{ fontSize: "12px", color: colors.textMuted, fontFamily: "'Inter',sans-serif" }}>Nenhum e-mail</p>
              </div>
            ) : filtered.map((email) => {
              const st = statusConfig[email.status];
              const tg = email.tag ? tagColors[email.tag] : null;
              const isSelected = selected?.id === email.id && panelMode === "detail";
              return (
                <button key={email.id} onClick={() => { setSelected(email); setPanelMode("detail"); }}
                  className="w-full text-left px-4 py-3 transition-all"
                  style={{
                    background: isSelected ? theme === "dark" ? "rgba(99,102,241,0.08)" : "rgba(99,102,241,0.05)" : "transparent",
                    borderLeft: `2px solid ${isSelected ? "#6366F1" : "transparent"}`,
                    borderBottom: `1px solid ${colors.border}`,
                  }}
                >
                  <div className="flex items-start justify-between gap-2 mb-0.5">
                    <p style={{ fontSize: "12px", color: colors.textPrimary, fontFamily: "'Inter',sans-serif", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>
                      {email.subject}
                    </p>
                    {email.starred && <Star size={10} style={{ color: "#F59E0B", fill: "#F59E0B" }} className="shrink-0 mt-0.5" />}
                  </div>
                  <p style={{ fontSize: "11px", color: colors.textMuted, fontFamily: "'Inter',sans-serif", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginBottom: "6px" }}>
                    → {email.toName}
                  </p>
                  <div className="flex items-center justify-between gap-1">
                    <div className="flex items-center gap-1">
                      <span className="flex items-center gap-0.5 rounded-full px-1.5 py-0.5" style={{ fontSize: "10px", color: st.color, background: st.bg, fontWeight: 600, fontFamily: "'Inter',sans-serif" }}>
                        <st.icon size={8} /> {st.label}
                      </span>
                      {tg && email.tag && (
                        <span className="rounded-full px-1.5 py-0.5" style={{ fontSize: "10px", color: tg.color, background: tg.bg, fontFamily: "'Inter',sans-serif" }}>
                          {email.tag}
                        </span>
                      )}
                    </div>
                    <span style={{ fontSize: "10px", color: colors.textMuted, fontFamily: "'Inter',sans-serif", whiteSpace: "nowrap" }}>{email.date}</span>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="px-4 py-2 shrink-0" style={{ borderTop: `1px solid ${colors.border}` }}>
            <p style={{ fontSize: "10px", color: colors.textMuted, fontFamily: "'Inter',sans-serif" }}>
              {filtered.length} de {emailList.length} e-mail{emailList.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        {/* ── Painel direito ── */}
        <div className="xl:col-span-2 flex flex-col gap-4 min-h-0">
          {/* Main panel */}
          <div className="rounded-2xl overflow-hidden flex-1 min-h-0" style={cardStyle}>
            {panelMode === "compose" ? (
              <ComposePanel
                replyTo={replyTarget}
                onSend={handleSend}
                onDiscard={() => setPanelMode(selected ? "detail" : "empty")}
              />
            ) : panelMode === "detail" && selected ? (
              <EmailDetail
                email={selected}
                onClose={() => setPanelMode("empty")}
                onReply={openReply}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full gap-4">
                <div className="rounded-2xl flex items-center justify-center" style={{ width: "56px", height: "56px", background: colors.surface }}>
                  <Mail size={24} style={{ color: colors.textMuted }} />
                </div>
                <p style={{ fontSize: "14px", color: colors.textMuted, fontFamily: "'Inter',sans-serif" }}>Selecione um e-mail ou escreva um novo</p>
                <button onClick={openCompose}
                  className="flex items-center gap-2 rounded-xl px-4 py-2 transition-all hover:opacity-90"
                  style={{ background: "linear-gradient(135deg, #6366F1, #4338CA)", color: "#fff", fontSize: "13px", fontFamily: "'Inter',sans-serif", fontWeight: 500 }}
                >
                  <Pencil size={13} /> Novo E-mail
                </button>
              </div>
            )}
          </div>

          {/* Analytics bottom strip */}
          <div className="grid grid-cols-2 gap-4 shrink-0">
            {/* Funnel */}
            <div className="rounded-2xl p-4" style={cardStyle}>
              <p style={{ fontFamily: "'Playfair Display',serif", color: colors.textPrimary, fontSize: "13px", marginBottom: "12px" }}>Funil de Engajamento</p>
              <div className="space-y-2.5">
                {[
                  { label: "Enviados",  value: emailList.length,                                  color: "#6366F1" },
                  { label: "Entregues", value: emailList.filter(e => e.status !== "bounce").length, color: "#94A3B8" },
                  { label: "Abertos",  value: emailList.filter(e => e.openedAt).length,           color: "#F59E0B" },
                  { label: "Clicados", value: emailList.filter(e => e.clickedAt).length,          color: "#10B981" },
                ].map((d) => (
                  <div key={d.label}>
                    <div className="flex items-center justify-between mb-1">
                      <span style={{ fontSize: "11px", color: colors.textSecondary, fontFamily: "'Inter',sans-serif" }}>{d.label}</span>
                      <span style={{ fontSize: "11px", color: d.color, fontFamily: "'Inter',sans-serif", fontWeight: 600 }}>{d.value}</span>
                    </div>
                    <div className="rounded-full overflow-hidden" style={{ height: "5px", background: colors.surface }}>
                      <div className="h-full rounded-full" style={{ width: `${(d.value / emailList.length) * 100}%`, background: d.color }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Weekly chart */}
            <div className="rounded-2xl p-4" style={cardStyle}>
              <p style={{ fontFamily: "'Playfair Display',serif", color: colors.textPrimary, fontSize: "13px", marginBottom: "12px" }}>Envios por Semana</p>
              <ResponsiveContainer width="100%" height={90}>
                <BarChart data={weeklyData} margin={{ top: 0, right: 0, left: -28, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={colors.border} vertical={false} />
                  <XAxis dataKey="week" tick={{ fill: colors.textMuted, fontSize: 9, fontFamily: "'Inter',sans-serif" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: colors.textMuted, fontSize: 9 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="enviados" name="Enviados" fill="#6366F1" radius={[3,3,0,0]} />
                  <Bar dataKey="abertos"  name="Abertos"  fill="#F59E0B" radius={[3,3,0,0]} />
                  <Bar dataKey="clicados" name="Clicados" fill="#10B981" radius={[3,3,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
