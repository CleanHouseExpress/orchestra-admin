import { Bell, Search, ChevronDown, Command } from "lucide-react";
import { useState } from "react";
import { useTheme } from "./ThemeContext";


const notifications = [
  { id: 1, text: "Novo contrato assinado — Empresa Alpha", time: "2m atrás", unread: true },
  { id: 2, text: "Pagamento processado — R$ 12.400", time: "18m atrás", unread: true },
  { id: 3, text: "Relatório mensal disponível", time: "1h atrás", unread: false },
];

export function Navbar() {
  const [showNotifs, setShowNotifs] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const { colors, theme } = useTheme();

  const dropdownStyle = {
    background: theme === "dark" ? "rgba(22, 31, 43, 0.98)" : "rgba(255,255,255,0.98)",
    backdropFilter: "blur(20px)",
    border: `1px solid ${colors.borderStrong}`,
    boxShadow: theme === "dark" ? "0 20px 60px rgba(0,0,0,0.5)" : "0 20px 60px rgba(0,0,0,0.12)",
  };

  return (
    <header
      className="flex items-center justify-between px-6 relative z-10"
      style={{
        height: "72px",
        background: colors.navBg,
        backdropFilter: "blur(20px)",
        borderBottom: `1px solid ${colors.border}`,
        boxShadow: theme === "light" ? "0 1px 12px rgba(0,0,0,0.06)" : "none",
      }}
    >
      {/* Search */}
      <div
        className="flex items-center gap-2 rounded-xl px-4 py-2 transition-all duration-200"
        style={{
          background: colors.inputBg,
          border: `1px solid ${colors.border}`,
          minWidth: "280px",
        }}
      >
        <Search size={15} style={{ color: colors.textMuted }} />
        <input
          placeholder="Busca global..."
          className="bg-transparent outline-none flex-1"
          style={{ fontFamily: "'Inter', sans-serif", fontSize: "14px", color: colors.textPrimary }}
        />
        <div
          className="flex items-center gap-1 rounded-md px-2 py-0.5"
          style={{ background: colors.surface, border: `1px solid ${colors.border}` }}
        >
          <Command size={11} style={{ color: colors.textMuted }} />
          <span style={{ fontSize: "11px", color: colors.textMuted, fontFamily: "'Inter', sans-serif" }}>K</span>
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2">
        {/* Workspace badge */}
        <button
          className="flex items-center gap-2 rounded-xl px-3 py-2 transition-all duration-200"
          style={{ border: `1px solid ${colors.border}`, background: "transparent" }}
          onMouseEnter={e => (e.currentTarget.style.background = colors.hoverBg)}
          onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
        >
          <div className="w-2 h-2 rounded-full" style={{ background: colors.green, boxShadow: `0 0 6px ${colors.green}` }} />
          <span style={{ fontSize: "13px", color: colors.textSecondary, fontFamily: "'Inter', sans-serif" }}>Workspace Principal</span>
          <ChevronDown size={13} style={{ color: colors.textMuted }} />
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => { setShowNotifs(!showNotifs); setShowProfile(false); }}
            className="relative flex items-center justify-center rounded-xl transition-all duration-200"
            style={{ width: "40px", height: "40px", border: `1px solid ${colors.border}`, background: "transparent", color: colors.textSecondary }}
            onMouseEnter={e => (e.currentTarget.style.background = colors.hoverBg)}
            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
          >
            <Bell size={17} />
            <span
              className="absolute top-2 right-2 rounded-full"
              style={{ width: "8px", height: "8px", background: "#3B82F6", boxShadow: "0 0 6px rgba(59,130,246,0.6)" }}
            />
          </button>
          {showNotifs && (
            <div className="absolute right-0 top-12 rounded-2xl overflow-hidden" style={{ width: "320px", ...dropdownStyle }}>
              <div className="px-4 py-3" style={{ borderBottom: `1px solid ${colors.border}` }}>
                <span style={{ fontSize: "13px", fontWeight: 600, color: colors.textPrimary, fontFamily: "'Inter', sans-serif" }}>Notificações</span>
              </div>
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className="flex items-start gap-3 px-4 py-3 transition-colors cursor-pointer"
                  style={{ borderBottom: `1px solid ${colors.border}` }}
                  onMouseEnter={e => (e.currentTarget.style.background = colors.hoverBg)}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                >
                  <div
                    className="mt-1 rounded-full shrink-0"
                    style={{ width: "7px", height: "7px", background: n.unread ? "#3B82F6" : "transparent", border: n.unread ? "none" : `1px solid ${colors.textMuted}` }}
                  />
                  <div>
                    <p style={{ fontSize: "13px", color: colors.textPrimary, fontFamily: "'Inter', sans-serif", lineHeight: 1.4 }}>{n.text}</p>
                    <p style={{ fontSize: "11px", color: colors.textMuted, fontFamily: "'Inter', sans-serif", marginTop: "2px" }}>{n.time}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Profile */}
        <div className="relative">
          <button
            onClick={() => { setShowProfile(!showProfile); setShowNotifs(false); }}
            className="flex items-center gap-2 rounded-xl px-3 py-2 transition-all duration-200"
            style={{ border: `1px solid ${colors.border}`, background: "transparent" }}
            onMouseEnter={e => (e.currentTarget.style.background = colors.hoverBg)}
            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
          >
            <div
              className="rounded-full flex items-center justify-center"
              style={{ width: "28px", height: "28px", background: "linear-gradient(135deg, #3B82F6, #14B8A6)", fontSize: "12px", color: "#fff", fontWeight: 600 }}
            >
              JD
            </div>
            <span style={{ fontSize: "13px", color: colors.textPrimary, fontFamily: "'Inter', sans-serif" }}>João Dias</span>
            <ChevronDown size={13} style={{ color: colors.textMuted }} />
          </button>
          {showProfile && (
            <div className="absolute right-0 top-12 rounded-2xl overflow-hidden" style={{ width: "200px", ...dropdownStyle }}>
              {["Perfil", "Preferências", "Sair"].map((item) => (
                <button
                  key={item}
                  className="w-full text-left px-4 py-3 transition-colors"
                  style={{
                    fontSize: "13px",
                    color: item === "Sair" ? colors.red : colors.textSecondary,
                    fontFamily: "'Inter', sans-serif",
                    borderBottom: `1px solid ${colors.border}`,
                    background: "transparent",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = colors.hoverBg)}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                >
                  {item}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
