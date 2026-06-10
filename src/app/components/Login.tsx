import { useState } from "react";
import { Eye, EyeOff, Zap, ArrowRight, Lock, Mail } from "lucide-react";
import { useTheme } from "./ThemeContext";

interface LoginProps {
  onLogin: () => void;
}

export function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const { colors, theme } = useTheme();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Preencha todos os campos.");
      return;
    }
    setError("");
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onLogin();
    }, 1600);
  };

  return (
    <div
      className="min-h-screen flex"
      style={{ background: colors.bg, fontFamily: "'Inter', sans-serif", transition: "background 0.3s" }}
    >
      {/* Left panel */}
      <div
        className="hidden lg:flex flex-col justify-between w-[520px] shrink-0 relative overflow-hidden p-12"
        style={{
          background: theme === "dark"
            ? "linear-gradient(160deg, #0F1620 0%, #0B0F14 60%, #0d1520 100%)"
            : "linear-gradient(160deg, #EFF6FF 0%, #F0FDF4 60%, #F0FDFA 100%)",
          borderRight: `1px solid ${colors.border}`,
        }}
      >
        {/* Ambient glow */}
        <div
          className="absolute pointer-events-none"
          style={{
            top: "-120px", left: "-120px",
            width: "480px", height: "480px",
            background: "radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%)",
            borderRadius: "50%",
          }}
        />
        <div
          className="absolute pointer-events-none"
          style={{
            bottom: "-80px", right: "-80px",
            width: "360px", height: "360px",
            background: "radial-gradient(circle, rgba(20,184,166,0.08) 0%, transparent 70%)",
            borderRadius: "50%",
          }}
        />
        {/* Grid */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(${colors.gridLine} 1px, transparent 1px), linear-gradient(90deg, ${colors.gridLine} 1px, transparent 1px)`,
            backgroundSize: "48px 48px",
          }}
        />

        {/* Logo */}
        <div className="flex items-center gap-3 relative z-10">
          <div
            className="flex items-center justify-center rounded-xl"
            style={{ width: "40px", height: "40px", background: "linear-gradient(135deg, #3B82F6, #14B8A6)", boxShadow: "0 0 24px rgba(59,130,246,0.35)" }}
          >
            <Zap size={20} color="#fff" fill="#fff" />
          </div>
          <span style={{ fontFamily: "'Playfair Display', serif", color: colors.textPrimary, fontSize: "22px", fontWeight: 600, letterSpacing: "0.04em" }}>
            ORQUESTRA
          </span>
        </div>

        {/* Center content */}
        <div className="relative z-10 space-y-8">
          <div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", color: colors.textPrimary, fontSize: "36px", fontWeight: 600, lineHeight: 1.25 }}>
              Controle total.
              <br />
              <span style={{ background: "linear-gradient(90deg, #3B82F6, #14B8A6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                Decisões precisas.
              </span>
            </h2>
            <p style={{ color: colors.textMuted, fontSize: "15px", marginTop: "16px", lineHeight: 1.7, maxWidth: "340px" }}>
              Plataforma executiva para gestão estratégica de empresas, contratos e operações financeiras.
            </p>
          </div>
          <div className="space-y-3">
            {[
              { label: "Dashboard executivo em tempo real", color: "#3B82F6" },
              { label: "Gestão financeira integrada", color: colors.teal },
              { label: "Relatórios estratégicos automatizados", color: "#8B5CF6" },
            ].map((f) => (
              <div key={f.label} className="flex items-center gap-3">
                <div className="rounded-full shrink-0" style={{ width: "6px", height: "6px", background: f.color, boxShadow: `0 0 8px ${f.color}` }} />
                <span style={{ fontSize: "14px", color: colors.textSecondary }}>{f.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="relative z-10 grid grid-cols-3 gap-4">
          {[{ value: "2.8k+", label: "Clientes ativos" }, { value: "418", label: "Empresas" }, { value: "99.9%", label: "Uptime" }].map((s) => (
            <div key={s.label}>
              <p style={{ fontFamily: "'Playfair Display', serif", color: colors.textPrimary, fontSize: "22px", fontWeight: 600 }}>{s.value}</p>
              <p style={{ fontSize: "12px", color: colors.textMuted, marginTop: "2px" }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center px-6 relative">
        <div
          className="absolute pointer-events-none"
          style={{
            top: "50%", left: "50%", transform: "translate(-50%, -50%)",
            width: "500px", height: "500px",
            background: "radial-gradient(circle, rgba(59,130,246,0.05) 0%, transparent 70%)",
            borderRadius: "50%",
          }}
        />

        <div className="w-full max-w-[420px] relative z-10">
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-3 mb-10 justify-center">
            <div className="flex items-center justify-center rounded-xl" style={{ width: "36px", height: "36px", background: "linear-gradient(135deg, #3B82F6, #14B8A6)", boxShadow: "0 0 20px rgba(59,130,246,0.3)" }}>
              <Zap size={18} color="#fff" fill="#fff" />
            </div>
            <span style={{ fontFamily: "'Playfair Display', serif", color: colors.textPrimary, fontSize: "20px", fontWeight: 600, letterSpacing: "0.04em" }}>
              ORQUESTRA
            </span>
          </div>

          <div className="mb-8">
            <h1 style={{ fontFamily: "'Playfair Display', serif", color: colors.textPrimary, fontSize: "28px", fontWeight: 600 }}>
              Bem-vindo de volta
            </h1>
            <p style={{ color: colors.textMuted, fontSize: "14px", marginTop: "6px" }}>
              Acesse sua conta para continuar
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label style={{ fontSize: "13px", color: colors.textSecondary, display: "block", marginBottom: "8px", fontWeight: 500 }}>
                E-mail
              </label>
              <div
                className="flex items-center gap-3 rounded-xl px-4 transition-all duration-200"
                style={{
                  background: colors.inputBg,
                  border: `1px solid ${focusedField === "email" ? "rgba(59,130,246,0.5)" : colors.border}`,
                  boxShadow: focusedField === "email" ? "0 0 0 3px rgba(59,130,246,0.1)" : "none",
                  height: "48px",
                }}
              >
                <Mail size={16} style={{ color: focusedField === "email" ? "#3B82F6" : colors.textMuted }} className="shrink-0" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocusedField("email")}
                  onBlur={() => setFocusedField(null)}
                  placeholder="seu@email.com"
                  className="flex-1 bg-transparent outline-none"
                  style={{ fontSize: "14px", color: colors.textPrimary }}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label style={{ fontSize: "13px", color: colors.textSecondary, fontWeight: 500 }}>Senha</label>
                <button type="button" style={{ fontSize: "12px", color: "#3B82F6" }} className="hover:opacity-80 transition-opacity">
                  Esqueceu a senha?
                </button>
              </div>
              <div
                className="flex items-center gap-3 rounded-xl px-4 transition-all duration-200"
                style={{
                  background: colors.inputBg,
                  border: `1px solid ${focusedField === "password" ? "rgba(59,130,246,0.5)" : colors.border}`,
                  boxShadow: focusedField === "password" ? "0 0 0 3px rgba(59,130,246,0.1)" : "none",
                  height: "48px",
                }}
              >
                <Lock size={16} style={{ color: focusedField === "password" ? "#3B82F6" : colors.textMuted }} className="shrink-0" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusedField("password")}
                  onBlur={() => setFocusedField(null)}
                  placeholder="••••••••"
                  className="flex-1 bg-transparent outline-none"
                  style={{ fontSize: "14px", color: colors.textPrimary }}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="transition-opacity hover:opacity-80" style={{ color: colors.textMuted }}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="rounded-xl px-4 py-3 flex items-center gap-2" style={{ background: `${colors.red}14`, border: `1px solid ${colors.red}33` }}>
                <span style={{ fontSize: "13px", color: colors.red }}>{error}</span>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-xl transition-all duration-200 hover:opacity-90 active:scale-[0.99] disabled:opacity-60"
              style={{
                height: "48px",
                background: loading ? colors.surface : "linear-gradient(135deg, #3B82F6, #2563EB)",
                color: loading ? colors.textSecondary : "#fff",
                fontSize: "15px",
                fontWeight: 500,
                border: loading ? `1px solid ${colors.border}` : "none",
                boxShadow: loading ? "none" : "0 4px 20px rgba(59,130,246,0.3)",
                marginTop: "8px",
              }}
            >
              {loading ? (
                <>
                  <span className="rounded-full border-2 animate-spin" style={{ width: "16px", height: "16px", borderColor: "rgba(59,130,246,0.2)", borderTopColor: "#3B82F6" }} />
                  <span>Autenticando...</span>
                </>
              ) : (
                <>
                  <span>Entrar na plataforma</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1" style={{ height: "1px", background: colors.border }} />
            <span style={{ fontSize: "12px", color: colors.textMuted }}>ou</span>
            <div className="flex-1" style={{ height: "1px", background: colors.border }} />
          </div>

          {/* SSO */}
          <button
            type="button"
            className="w-full flex items-center justify-center gap-2 rounded-xl transition-all duration-200"
            style={{ height: "44px", background: colors.surface, border: `1px solid ${colors.border}`, color: colors.textSecondary, fontSize: "14px" }}
            onMouseEnter={e => (e.currentTarget.style.background = colors.hoverBg)}
            onMouseLeave={e => (e.currentTarget.style.background = colors.surface)}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
              <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
            </svg>
            Continuar com Google SSO
          </button>

          <p className="text-center mt-8" style={{ fontSize: "12px", color: colors.textMuted }}>
            Ao acessar, você concorda com os{" "}
            <span style={{ color: "#3B82F6", cursor: "pointer" }}>Termos de Uso</span>
            {" "}e a{" "}
            <span style={{ color: "#3B82F6", cursor: "pointer" }}>Política de Privacidade</span>.
          </p>
        </div>
      </div>
    </div>
  );
}
