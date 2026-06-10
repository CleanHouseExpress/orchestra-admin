import { useState } from "react";
import { Sidebar } from "./components/Sidebar";
import { Navbar } from "./components/Navbar";
import { Dashboard } from "./components/Dashboard";
import { Login } from "./components/Login";
import { ThemeProvider, useTheme } from "./components/ThemeContext";
import { ThemeToggle } from "./components/ThemeToggle";
import "../styles/fonts.css";

const pageLabels: Record<string, string> = {
  dashboard: "Dashboard",
  companies: "Empresas",
  clients: "Clientes",
  financial: "Financeiro",
  contracts: "Contratos",
  plans: "Planos",
  reports: "Relatórios",
  users: "Usuários",
  settings: "Configurações",
};

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
          style={{ background: "linear-gradient(135deg, #3B82F6, #2563EB)", color: "#fff", fontFamily: "'Inter', sans-serif", fontSize: "14px", fontWeight: 500 }}
        >
          Solicitar acesso antecipado
        </button>
      </div>
    </div>
  );
}

function AppShell() {
  const [activePage, setActivePage] = useState("dashboard");
  const [authenticated, setAuthenticated] = useState(false);
  const { colors } = useTheme();

  if (!authenticated) {
    return <Login onLogin={() => setAuthenticated(true)} />;
  }

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ background: colors.bg, fontFamily: "'Inter', sans-serif", transition: "background 0.3s" }}
    >
      <Sidebar activeItem={activePage} onNavigate={setActivePage} />
      <div className="flex flex-col flex-1 min-w-0">
        <Navbar />
        <main className="flex-1 overflow-hidden flex flex-col" style={{ background: colors.bg }}>
          {activePage === "dashboard" ? (
            <Dashboard />
          ) : (
            <EmptyPage title={pageLabels[activePage] ?? activePage} />
          )}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <ThemeToggle />
      <AppShell />
    </ThemeProvider>
  );
}
