import { startTransition, useEffect, useState } from "react";
import { BrowserRouter, Navigate, Route, Routes, useLocation, useNavigate } from "react-router";
import { Sidebar } from "./components/Sidebar";
import { Navbar } from "./components/Navbar";
import { Dashboard } from "./components/Dashboard";
import { Empresas } from "./components/Empresas";
import { EmpresaDetalhe } from "./components/EmpresaDetalhe";
import { EmpresaEditar } from "./components/EmpresaEditar";
import { CaixaEmail } from "./components/CaixaEmail";
import { Usuarios } from "./components/Usuarios";
import { Configuracoes } from "./components/Configuracoes";
import { Planos } from "./components/Planos";
import { Contratos } from "./components/Contratos";
import { Financeiro } from "./components/Financeiro";
import { Relatorios } from "./components/Relatorios";
import { Login } from "./components/Login";
import { Install } from "./components/Install";
import { ThemeProvider, useTheme } from "./components/ThemeContext";
import { useAppSelector } from "./store/hooks";
import { installApi } from "./services/installApi";
import "../styles/fonts.css";

const pageLabels: Record<string, string> = {
  dashboard: "Dashboard",
  companies: "Empresas",
  financial: "Financeiro",
  contracts: "Contratos",
  plans: "Planos",
  reports: "Relatórios",
  emails: "Caixa de E-mail",
  users: "Usuários",
  settings: "Configurações",
};

const pageRoutes: Record<string, string> = {
  dashboard: "/dashboard",
  companies: "/empresas",
  financial: "/financeiro",
  contracts: "/contratos",
  plans: "/planos",
  reports: "/relatorios",
  emails: "/emails",
  users: "/usuarios",
  settings: "/configuracoes",
};

const pathPages: Record<string, string> = Object.fromEntries(
  Object.entries(pageRoutes).map(([page, path]) => [path, page]),
);
const INSTALL_STATUS_KEY = "orchestra-install-installed";

function readCachedInstallStatus() {
  const value = window.localStorage.getItem(INSTALL_STATUS_KEY);

  if (value === "true") return true;
  if (value === "false") return false;

  return null;
}

function EmptyPage({ title }: { title: string }) {
  const { colors } = useTheme();
  return (
    <div className="flex-1 flex flex-col items-center justify-center">
      <div
        className="rounded-2xl px-10 py-12 flex flex-col items-center gap-4"
        style={{ background: colors.card, border: `1px solid ${colors.border}` }}
      >
        <div
          className="rounded-2xl flex items-center justify-center mb-2"
          style={{ width: "56px", height: "56px", background: `${colors.blue}18` }}
        >
          <span style={{ fontSize: "26px" }}>📋</span>
        </div>
        <h2 style={{ fontFamily: "'Playfair Display', serif", color: colors.textPrimary, fontSize: "22px" }}>{title}</h2>
        <p style={{ fontFamily: "'Inter', sans-serif", color: colors.textMuted, fontSize: "14px", textAlign: "center", maxWidth: "280px" }}>
          Este módulo está em desenvolvimento. Em breve disponível.
        </p>
        <button
          className="mt-2 rounded-xl px-5 py-2 transition-all hover:opacity-90"
          style={{ background: "linear-gradient(135deg, #6366F1, #4338CA)", color: "#fff", fontFamily: "'Inter', sans-serif", fontSize: "14px", fontWeight: 500 }}
        >
          Solicitar acesso antecipado
        </button>
      </div>
    </div>
  );
}

function RouteProgress({ active }: { active: boolean }) {
  return (
    <div
      className="absolute left-0 right-0 top-0 z-30 overflow-hidden transition-opacity duration-150"
      style={{ height: "2px", opacity: active ? 1 : 0 }}
    >
      <div
        className="h-full w-1/2"
        style={{
          background: "linear-gradient(90deg, #6366F1, #8B5CF6)",
          animation: active ? "route-progress 0.8s ease-in-out infinite" : "none",
        }}
      />
      <style>{`
        @keyframes route-progress {
          0% { transform: translateX(-120%); }
          100% { transform: translateX(240%); }
        }
      `}</style>
    </div>
  );
}

function AccessPlaceholder({ text }: { text: string }) {
  const { colors } = useTheme();

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: colors.bg }}>
      <p style={{ color: colors.textMuted, fontFamily: "'Inter', sans-serif", fontSize: "14px" }}>
        {text}
      </p>
    </div>
  );
}

function InstallOverlay({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-5" style={{ background: "rgba(3,7,18,0.74)", backdropFilter: "blur(10px)" }}>
      {children}
    </div>
  );
}

function LoginWithOverlay({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen overflow-hidden">
      <Login onLogin={() => navigate("/dashboard", { replace: true })} />
      <InstallOverlay>{children}</InstallOverlay>
    </div>
  );
}

function InstallCheckingModal() {
  const { colors } = useTheme();

  return (
    <div className="rounded-full p-4 shadow-2xl" style={{ background: colors.card, border: `1px solid ${colors.border}` }}>
      <div
        className="rounded-full border-2 animate-spin"
        style={{
          width: 28,
          height: 28,
          borderColor: "rgba(99,102,241,0.22)",
          borderTopColor: colors.blue,
        }}
      />
    </div>
  );
}

function InstallCheckError({ onRetry }: { onRetry: () => void }) {
  const { colors } = useTheme();

  return (
    <div className="w-full max-w-[420px] rounded-xl p-6 space-y-4 shadow-2xl" style={{ background: colors.card, border: `1px solid ${colors.border}` }}>
      <h1 style={{ color: colors.textPrimary, fontFamily: "'Playfair Display', serif", fontSize: "22px" }}>
        Não foi possível verificar a instalação
      </h1>
      <p style={{ color: colors.textMuted, fontFamily: "'Inter', sans-serif", fontSize: "14px", lineHeight: 1.6 }}>
        O sistema precisa confirmar se a instalação foi finalizada antes de liberar o login.
      </p>
      <div className="flex gap-2">
        <button
          onClick={onRetry}
          className="rounded-lg px-4 py-2"
          style={{ background: colors.blue, color: "#fff", fontFamily: "'Inter', sans-serif", fontSize: "13px", fontWeight: 600 }}
        >
          Tentar novamente
        </button>
        <a
          href="/install"
          className="rounded-lg px-4 py-2"
          style={{ background: colors.surface, color: colors.textSecondary, border: `1px solid ${colors.border}`, fontFamily: "'Inter', sans-serif", fontSize: "13px", fontWeight: 600 }}
        >
          Abrir instalação
        </a>
      </div>
    </div>
  );
}

function LoginRoute({ authenticated }: { authenticated: boolean }) {
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ?? "/dashboard";

  if (authenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Login onLogin={() => navigate(from, { replace: true })} />;
}

function AppShell({ authenticated }: { authenticated: boolean }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { colors, modules, modulesLoaded } = useTheme();
  const [routeLoading, setRouteLoading] = useState(false);
  const activePage = location.pathname.startsWith("/empresas")
    ? "companies"
    : pathPages[location.pathname] ?? "dashboard";
  const activeModule = modules.find((module) => module.id === activePage);
  const firstEnabledPage = Object.keys(pageRoutes).find((page) =>
    modules.some((module) => module.id === page && module.enabled)
  );
  const currentModuleAllowed = Boolean(activeModule?.enabled);

  useEffect(() => {
    setRouteLoading(true);
    const timeout = window.setTimeout(() => setRouteLoading(false), 180);

    return () => window.clearTimeout(timeout);
  }, [location.pathname]);

  useEffect(() => {
    if (!authenticated || !modulesLoaded || currentModuleAllowed) return;

    const fallbackPath = firstEnabledPage ? pageRoutes[firstEnabledPage] : null;

    if (fallbackPath && fallbackPath !== location.pathname) {
      startTransition(() => navigate(fallbackPath, { replace: true }));
    }
  }, [authenticated, currentModuleAllowed, firstEnabledPage, location.pathname, modulesLoaded, navigate]);

  if (!authenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ background: colors.bg, fontFamily: "'Inter', sans-serif", transition: "background 0.3s" }}
    >
      <Sidebar
        activeItem={activePage}
        onNavigate={(page) => {
          const nextPath = pageRoutes[page] ?? "/dashboard";

          if (nextPath !== location.pathname) {
            startTransition(() => navigate(nextPath));
          }
        }}
      />
      <div className="flex flex-col flex-1 min-w-0">
        <Navbar />
        <main className="relative flex-1 overflow-hidden flex flex-col" style={{ background: colors.bg }}>
          <RouteProgress active={routeLoading} />
          {!modulesLoaded ? (
            <AccessPlaceholder text="Carregando módulos..." />
          ) : !currentModuleAllowed ? (
            <AccessPlaceholder text={firstEnabledPage ? "Redirecionando..." : "Nenhum módulo disponível para este usuário."} />
          ) : (
            <Routes>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/empresas" element={<Empresas />} />
              <Route path="/empresas/:id" element={<EmpresaDetalhe />} />
              <Route path="/empresas/:id/editar" element={<EmpresaEditar />} />
              <Route path="/financeiro" element={<Financeiro />} />
              <Route path="/contratos" element={<Contratos />} />
              <Route path="/planos" element={<Planos />} />
              <Route path="/relatorios" element={<Relatorios />} />
              <Route path="/emails" element={<CaixaEmail />} />
              <Route path="/usuarios" element={<Usuarios />} />
              <Route path="/configuracoes" element={<Configuracoes />} />
              <Route path="*" element={<Navigate to={firstEnabledPage ? pageRoutes[firstEnabledPage] : "/dashboard"} replace />} />
            </Routes>
          )}
        </main>
      </div>
    </div>
  );
}

function AppRoutes() {
  const authenticated = useAppSelector((state) => Boolean(state.auth.token));
  const location = useLocation();
  const [cachedInstallStatus] = useState<boolean | null>(() => readCachedInstallStatus());
  const [installChecked, setInstallChecked] = useState(() => cachedInstallStatus !== null);
  const [installRequired, setInstallRequired] = useState(() => cachedInstallStatus === false);
  const [installCheckAttempt, setInstallCheckAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    const fallback = window.setTimeout(() => {
      if (!active) return;
      if (cachedInstallStatus === null) {
        setInstallRequired(true);
      }
      setInstallChecked(true);
    }, 2500);

    if (cachedInstallStatus === null) {
      setInstallChecked(false);
    }

    installApi.status()
      .then((status) => {
        if (!active) return;
        window.clearTimeout(fallback);
        const installed = status.installed !== false;
        window.localStorage.setItem(INSTALL_STATUS_KEY, String(installed));
        setInstallRequired(!installed);
      })
      .catch(() => {
        if (!active) return;
        window.clearTimeout(fallback);
        if (cachedInstallStatus === null) {
          setInstallRequired(true);
        }
      })
      .finally(() => {
        window.clearTimeout(fallback);
        if (active) setInstallChecked(true);
      });

    return () => {
      active = false;
      window.clearTimeout(fallback);
    };
  }, [cachedInstallStatus, installCheckAttempt]);

  if (!installChecked && !authenticated && location.pathname !== "/install") {
    return (
      <LoginWithOverlay>
        <InstallCheckingModal />
      </LoginWithOverlay>
    );
  }

  if (installRequired && !authenticated && location.pathname !== "/install") {
    return (
      <LoginWithOverlay>
        <Install modal />
      </LoginWithOverlay>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Navigate to={authenticated ? "/dashboard" : "/login"} replace />} />
      <Route path="/install" element={<LoginWithOverlay><Install modal /></LoginWithOverlay>} />
      <Route path="/login" element={<LoginRoute authenticated={authenticated} />} />
      <Route path="/*" element={<AppShell authenticated={authenticated} />} />
    </Routes>
  );
}

export default function App() {
  const authToken = useAppSelector((state) => state.auth.token);

  return (
    <ThemeProvider authToken={authToken}>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </ThemeProvider>
  );
}
