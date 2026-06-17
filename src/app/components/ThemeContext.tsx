import { createContext, useCallback, useContext, useEffect, useState, ReactNode } from "react";
import { modulesApi } from "../services/modulesApi";

export type Theme = "dark" | "light";

export interface ThemeColors {
  bg: string;
  bgSecondary: string;
  surface: string;
  card: string;
  border: string;
  borderStrong: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  inputBg: string;
  navBg: string;
  sidebarBg: string;
  hoverBg: string;
  blue: string;
  teal: string;
  blueHover: string;
  green: string;
  yellow: string;
  red: string;
  blueFaint: string;
  tealFaint: string;
  gridLine: string;
}

const dark: ThemeColors = {
  bg: "#0B0F14",
  bgSecondary: "#111827",
  surface: "#161F2B",
  card: "#1B2533",
  border: "rgba(255,255,255,0.06)",
  borderStrong: "rgba(255,255,255,0.1)",
  textPrimary: "#F8FAFC",
  textSecondary: "#94A3B8",
  textMuted: "#64748B",
  inputBg: "#161F2B",
  navBg: "rgba(11,15,20,0.85)",
  sidebarBg: "rgba(17,24,39,0.95)",
  hoverBg: "rgba(255,255,255,0.05)",
  blue: "#6366F1",
  teal: "#8B5CF6",
  blueHover: "#4338CA",
  green: "#10B981",
  yellow: "#F59E0B",
  red: "#EF4444",
  blueFaint: "rgba(99,102,241,0.12)",
  tealFaint: "rgba(139,92,246,0.12)",
  gridLine: "rgba(255,255,255,0.015)",
};

const light: ThemeColors = {
  bg: "#F1F5F9",
  bgSecondary: "#E2E8F0",
  surface: "#FFFFFF",
  card: "#FFFFFF",
  border: "rgba(0,0,0,0.07)",
  borderStrong: "rgba(0,0,0,0.12)",
  textPrimary: "#0F172A",
  textSecondary: "#475569",
  textMuted: "#94A3B8",
  inputBg: "#F8FAFC",
  navBg: "rgba(255,255,255,0.9)",
  sidebarBg: "rgba(255,255,255,0.97)",
  hoverBg: "rgba(0,0,0,0.03)",
  blue: "#6366F1",
  teal: "#8B5CF6",
  blueHover: "#4338CA",
  green: "#059669",
  yellow: "#D97706",
  red: "#DC2626",
  blueFaint: "rgba(99,102,241,0.08)",
  tealFaint: "rgba(139,92,246,0.08)",
  gridLine: "rgba(0,0,0,0.04)",
};

export const themes = { dark, light };
const THEME_STORAGE_KEY = "orchestra-admin-theme";
const MODULES_STORAGE_KEY = "orchestra-admin-modules";

export interface ModuleConfig {
  id: string;
  apiId?: number;
  apiSlug: string;
  label: string;
  description: string;
  icon: string;
  locked: boolean;
  enabled: boolean;
}

export const defaultModules: ModuleConfig[] = [
  { id: "dashboard",  apiSlug: "dashboard",      label: "Dashboard",       description: "Visão geral executiva com KPIs, gráficos e atividades recentes", icon: "📊", locked: true,  enabled: true },
  { id: "companies",  apiSlug: "empresas",       label: "Empresas",         description: "Cadastro e gestão de empresas clientes da plataforma",          icon: "🏢", locked: false, enabled: true },
  { id: "contracts",  apiSlug: "contratos",      label: "Contratos",        description: "Gestão de contratos ativos, vencimentos e renovações",          icon: "📄", locked: false, enabled: true },
  { id: "financial",  apiSlug: "financeiro",     label: "Financeiro",       description: "Lançamentos financeiros, receitas, despesas e fluxo de caixa", icon: "💰", locked: false, enabled: true },
  { id: "plans",      apiSlug: "planos",         label: "Planos",           description: "Gerenciamento de planos de assinatura e seus recursos",         icon: "💳", locked: false, enabled: true },
  { id: "reports",    apiSlug: "relatorios",     label: "Relatórios",       description: "Relatórios estratégicos, gráficos e indicadores de negócio",   icon: "📈", locked: false, enabled: true },
  { id: "emails",     apiSlug: "emails",         label: "Caixa de E-mail",  description: "Caixa de saída de e-mails enviados pelo admin para clientes",  icon: "✉️", locked: false, enabled: true },
  { id: "users",      apiSlug: "usuarios",       label: "Usuários",         description: "Gestão de usuários, perfis de acesso e permissões",            icon: "👤", locked: false, enabled: true },
  { id: "settings",   apiSlug: "configuracoes",  label: "Configurações",    description: "Configurações do sistema, aparência e integrações",            icon: "⚙️", locked: true,  enabled: true },
];

export interface ThemeApiModule {
  id: number;
  name?: string;
  module?: string;
  slug?: string;
  key?: string;
  description?: string | null;
  is_active?: boolean;
  ver?: boolean;
  criar?: boolean;
  editar?: boolean;
  excluir?: boolean;
}

interface SyncModulesOptions {
  defaultEnabled?: boolean;
  disableMissing?: boolean;
  preserveLocked?: boolean;
}

function getInitialModules() {
  const stored = window.localStorage.getItem(MODULES_STORAGE_KEY);
  if (!stored) return defaultModules;

  try {
    const parsed = JSON.parse(stored) as Array<Partial<ModuleConfig> & { id: string }>;
    return defaultModules.map((module) => {
      const storedModule = parsed.find((item) => item.id === module.id);
      return storedModule ? {
        ...module,
        apiId: storedModule.apiId ?? module.apiId,
        label: storedModule.label ?? module.label,
        description: storedModule.description ?? module.description,
        enabled: module.locked ? true : storedModule.enabled ?? module.enabled,
      } : module;
    });
  } catch {
    return defaultModules;
  }
}

function modulesSignature(modules: ModuleConfig[]) {
  return JSON.stringify(
    modules.map(({ id, apiId, label, description, enabled }) => ({
      id,
      apiId,
      label,
      description,
      enabled,
    })),
  );
}

function saveModules(modules: ModuleConfig[]) {
  window.localStorage.setItem(
    MODULES_STORAGE_KEY,
    JSON.stringify(
      modules.map(({ id, apiId, apiSlug, label, description, icon, locked, enabled }) => ({
        id,
        apiId,
        apiSlug,
        label,
        description,
        icon,
        locked,
        enabled,
      })),
    ),
  );
}

function mergeApiModules(current: ModuleConfig[], apiModules: ThemeApiModule[], options: SyncModulesOptions = {}) {
  const { defaultEnabled = false, disableMissing = false, preserveLocked = true } = options;

  return current.map((module) => {
    const apiModule = apiModules.find((item) => (item.slug ?? item.key) === module.apiSlug);
    if (!apiModule) {
      return disableMissing ? { ...module, enabled: false } : module;
    }

    const hasAnyPermission = Boolean(apiModule.ver ?? apiModule.criar ?? apiModule.editar ?? apiModule.excluir);

    return {
      ...module,
      apiId: apiModule.id,
      description: apiModule.description ?? module.description,
      label: apiModule.name ?? apiModule.module ?? module.label,
      enabled: preserveLocked && module.locked ? true : apiModule.is_active ?? (hasAnyPermission || defaultEnabled),
    };
  });
}

interface ThemeCtx {
  theme: Theme;
  colors: ThemeColors;
  toggle: () => void;
  modules: ModuleConfig[];
  modulesLoaded: boolean;
  setModuleEnabled: (id: string, enabled: boolean) => void;
  syncModulesFromApi: (apiModules: ThemeApiModule[], options?: SyncModulesOptions) => void;
}

const ThemeContext = createContext<ThemeCtx>({
  theme: "light",
  colors: light,
  toggle: () => {},
  modules: defaultModules,
  modulesLoaded: true,
  setModuleEnabled: () => {},
  syncModulesFromApi: () => {},
});

export function ThemeProvider({ children, authToken }: { children: ReactNode; authToken?: string | null }) {
  const [theme, setTheme] = useState<Theme>(() => {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    return stored === "dark" || stored === "light" ? stored : "light";
  });
  const [modules, setModules] = useState<ModuleConfig[]>(getInitialModules);
  const [modulesLoaded, setModulesLoaded] = useState(true);

  useEffect(() => {
    const root = document.documentElement;
    const nextColors = themes[theme];

    root.classList.toggle('dark', theme === 'dark');
    root.style.setProperty('--scrollbar-track', theme === 'dark' ? 'rgba(255,255,255,0.035)' : 'rgba(15,23,42,0.04)');
    root.style.setProperty('--scrollbar-thumb', `linear-gradient(180deg, ${nextColors.teal}, ${nextColors.blue})`);
    root.style.setProperty('--scrollbar-thumb-color', nextColors.teal);
    root.style.setProperty('--scrollbar-thumb-hover', theme === 'dark' ? 'linear-gradient(180deg, #A78BFA, #818CF8)' : 'linear-gradient(180deg, #7C3AED, #4F46E5)');
    root.style.setProperty('--scrollbar-border', theme === 'dark' ? nextColors.bgSecondary : nextColors.inputBg);
  }, [theme]);

  const toggle = () => setTheme((current) => {
    const next = current === "dark" ? "light" : "dark";
    window.localStorage.setItem(THEME_STORAGE_KEY, next);
    return next;
  });

  const setModuleEnabled = useCallback((id: string, enabled: boolean) => {
    setModules((current) => {
      const next = current.map((module) => module.id === id && !module.locked ? { ...module, enabled } : module);
      saveModules(next);
      return next;
    });
  }, []);

  const syncModulesFromApi = useCallback((apiModules: ThemeApiModule[], options: SyncModulesOptions = {}) => {
    setModules((current) => {
      const next = mergeApiModules(current, apiModules, options);
      saveModules(next);
      return next;
    });
  }, []);

  useEffect(() => {
    if (!authToken) {
      setModulesLoaded(true);
      return;
    }

    let active = true;
    const hadStoredModules = window.localStorage.getItem(MODULES_STORAGE_KEY) !== null;

    modulesApi.myList()
      .then((apiModules) => {
        if (active) {
          setModules((current) => {
            const next = mergeApiModules(current, apiModules, {
              defaultEnabled: true,
              disableMissing: true,
              preserveLocked: false,
            });
            const changed = modulesSignature(current) !== modulesSignature(next);

            saveModules(next);

            if (changed && hadStoredModules) {
              window.setTimeout(() => window.location.reload(), 0);
            }

            return next;
          });
        }
      })
      .catch(() => undefined)
      .finally(() => {
        if (active) setModulesLoaded(true);
      });

    return () => {
      active = false;
    };
  }, [authToken, syncModulesFromApi]);

  return (
    <ThemeContext.Provider value={{ theme, colors: themes[theme], toggle, modules, modulesLoaded, setModuleEnabled, syncModulesFromApi }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
