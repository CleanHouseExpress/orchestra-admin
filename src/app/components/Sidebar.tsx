import { useState } from "react";
import {
  LayoutDashboard, Building2, Users, Wallet, FileText,
  CreditCard, BarChart3, UserCog, Settings, ChevronLeft,
  ChevronRight, Zap, LogOut
} from "lucide-react";
import { useTheme } from "./ThemeContext";
import { logout } from "../store/authSlice";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { getCompanyUserRoleLabel } from "../services/companiesApi";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", id: "dashboard" },
  { icon: Building2, label: "Empresas", id: "companies" },
  { icon: Users, label: "Clientes", id: "clients" },
  { icon: Wallet, label: "Financeiro", id: "financial" },
  { icon: FileText, label: "Contratos", id: "contracts" },
  { icon: CreditCard, label: "Planos", id: "plans" },
  { icon: BarChart3, label: "Relatórios", id: "reports" },
  { icon: UserCog, label: "Usuários", id: "users" },
  { icon: Settings, label: "Configurações", id: "settings" },
];

interface SidebarProps {
  activeItem: string;
  onNavigate: (id: string) => void;
}

export function Sidebar({ activeItem, onNavigate }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const { colors, theme } = useTheme();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const userRoleLabel = user ? getCompanyUserRoleLabel(user) : "Admin";
  const initials = (user?.name ?? "Admin")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return (
    <aside
      style={{
        width: collapsed ? "72px" : "240px",
        background: colors.sidebarBg,
        backdropFilter: "blur(20px)",
        borderRight: `1px solid ${colors.border}`,
        transition: "width 0.3s cubic-bezier(0.4,0,0.2,1)",
        boxShadow: theme === "light" ? "2px 0 16px rgba(0,0,0,0.06)" : "none",
      }}
      className="h-screen flex flex-col shrink-0 relative z-20"
    >
      {/* Logo */}
      <div
        className="flex items-center gap-3 px-5 py-5"
        style={{ borderBottom: `1px solid ${colors.border}`, minHeight: "72px" }}
      >
        <div
          className="shrink-0 flex items-center justify-center rounded-xl"
          style={{
            width: "36px", height: "36px",
            background: "linear-gradient(135deg, #3B82F6 0%, #14B8A6 100%)",
            boxShadow: "0 0 20px rgba(59,130,246,0.3)",
          }}
        >
          <Zap size={18} color="#fff" fill="#fff" />
        </div>
        {!collapsed && (
          <span style={{ fontFamily: "'Playfair Display', serif", color: colors.textPrimary, letterSpacing: "0.04em", fontSize: "18px", fontWeight: 600 }}>
            ORQUESTRA
          </span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 overflow-y-auto">
        {navItems.map(({ icon: Icon, label, id }) => {
          const isActive = activeItem === id;
          return (
            <button
              key={id}
              onClick={() => onNavigate(id)}
              className="w-full flex items-center gap-3 px-4 py-3 mx-2 rounded-xl transition-all duration-200"
              style={{
                width: "calc(100% - 16px)",
                background: isActive
                  ? theme === "dark"
                    ? "linear-gradient(135deg, rgba(59,130,246,0.15) 0%, rgba(20,184,166,0.08) 100%)"
                    : "linear-gradient(135deg, rgba(59,130,246,0.1) 0%, rgba(20,184,166,0.05) 100%)"
                  : "transparent",
                borderLeft: isActive ? `2px solid #3B82F6` : "2px solid transparent",
                color: isActive ? colors.textPrimary : colors.textSecondary,
              }}
              title={collapsed ? label : undefined}
            >
              <Icon size={18} style={{ color: isActive ? "#3B82F6" : colors.textMuted }} className="shrink-0" />
              {!collapsed && (
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "14px", fontWeight: isActive ? 500 : 400 }}>
                  {label}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-1/2 -translate-y-1/2 flex items-center justify-center rounded-full transition-all duration-200 hover:scale-110"
        style={{
          width: "24px", height: "24px",
          background: colors.card,
          border: `1px solid ${colors.borderStrong}`,
          color: colors.textMuted,
          zIndex: 30,
          boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
        }}
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>

      {/* Footer */}
      <div className="px-4 py-4" style={{ borderTop: `1px solid ${colors.border}` }}>
        <div className="flex items-center gap-3">
          <div
            className="shrink-0 rounded-full flex items-center justify-center"
            style={{ width: "32px", height: "32px", background: "linear-gradient(135deg, #3B82F6, #14B8A6)", fontSize: "13px", color: "#fff", fontWeight: 600 }}
          >
            {initials}
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "13px", color: colors.textPrimary, fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user?.name ?? "Admin"}</p>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "11px", color: colors.textMuted, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{userRoleLabel}</p>
            </div>
          )}
          <button
            onClick={() => dispatch(logout())}
            className="shrink-0 rounded-lg p-2 transition-all"
            style={{ color: colors.textMuted, background: "transparent" }}
            title="Sair"
            onMouseEnter={e => {
              e.currentTarget.style.background = colors.hoverBg;
              e.currentTarget.style.color = "#EF4444";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = colors.textMuted;
            }}
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </aside>
  );
}
