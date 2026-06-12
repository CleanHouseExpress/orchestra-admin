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
import { Login } from "./components/Login";
import { ThemeProvider, useTheme } from "./components/ThemeContext";
import { ThemeToggle } from "./components/ThemeToggle";
import { useAppSelector } from "./store/hooks";
import "../styles/fonts.css";

const pageLabels: Record<string, string> = {
  dashboard: "Dashboard",
  companies: "Empresas",
  clients: "Clientes",
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
  clients: "/clientes",
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
  const { colors } = useTheme();
  const [routeLoading, setRouteLoading] = useState(false);
  const activePage = location.pathname.startsWith("/empresas")
    ? "companies"
    : pathPages[location.pathname] ?? "dashboard";

  useEffect(() => {
    setRouteLoading(true);
    const timeout = window.setTimeout(() => setRouteLoading(false), 180);

    return () => window.clearTimeout(timeout);
  }, [location.pathname]);

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
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/empresas" element={<Empresas />} />
            <Route path="/empresas/:id" element={<EmpresaDetalhe />} />
            <Route path="/empresas/:id/editar" element={<EmpresaEditar />} />
            <Route path="/clientes" element={<EmptyPage title={pageLabels.clients} />} />
            <Route path="/financeiro" element={<EmptyPage title={pageLabels.financial} />} />
            <Route path="/contratos" element={<EmptyPage title={pageLabels.contracts} />} />
            <Route path="/planos" element={<EmptyPage title={pageLabels.plans} />} />
            <Route path="/relatorios" element={<EmptyPage title={pageLabels.reports} />} />
            <Route path="/emails" element={<CaixaEmail />} />
            <Route path="/usuarios" element={<Usuarios />} />
            <Route path="/configuracoes" element={<Configuracoes />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

function AppRoutes() {
  const authenticated = useAppSelector((state) => Boolean(state.auth.token));

  return (
    <Routes>
      <Route path="/" element={<Navigate to={authenticated ? "/dashboard" : "/login"} replace />} />
      <Route path="/login" element={<LoginRoute authenticated={authenticated} />} />
      <Route path="/*" element={<AppShell authenticated={authenticated} />} />
    </Routes>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <ThemeToggle />
        <AppRoutes />
      </BrowserRouter>
    </ThemeProvider>
  );
}
