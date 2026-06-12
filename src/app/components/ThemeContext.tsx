import { createContext, useContext, useState, ReactNode } from "react";

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

interface ThemeCtx {
  theme: Theme;
  colors: ThemeColors;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeCtx>({ theme: "dark", colors: dark, toggle: () => {} });

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("dark");
  const toggle = () => setTheme((t) => (t === "dark" ? "light" : "dark"));
  return (
    <ThemeContext.Provider value={{ theme, colors: themes[theme], toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
