/**
 * BalanceVisor design tokens — ported from the web app's globals.css.
 * Provides light and dark palettes that mirror the existing brand identity.
 */

export const palette = {
  light: {
    background: "#f5f0e6",
    foreground: "#1c251f",
    card: "#fffdf8",
    cardForeground: "#1c251f",
    primary: "#24342b",
    primaryForeground: "#faf5ec",
    secondary: "#ece3d4",
    secondaryForeground: "#29352d",
    muted: "#eee6d8",
    mutedForeground: "#687268",
    accent: "#f2eadc",
    accentForeground: "#1c251f",
    destructive: "#c9674a",
    border: "rgba(36, 52, 43, 0.12)",
    input: "#ebe1d3",
    ring: "#c79a2b",
    chart1: "#24342b",
    chart2: "#4f6e84",
    chart3: "#c79a2b",
    chart4: "#c9674a",
    chart5: "#758c68",
    success: "#758c68",
    warning: "#c79a2b",
  },
  dark: {
    background: "#101611",
    foreground: "#f7f2e8",
    card: "#161f18",
    cardForeground: "#f7f2e8",
    primary: "#d0ac58",
    primaryForeground: "#182019",
    secondary: "#1d2820",
    secondaryForeground: "#f7f2e8",
    muted: "#1d2820",
    mutedForeground: "#98a297",
    accent: "#1b251e",
    accentForeground: "#f7f2e8",
    destructive: "#d97a59",
    border: "rgba(255, 255, 255, 0.1)",
    input: "rgba(255, 255, 255, 0.12)",
    ring: "#d0ac58",
    chart1: "#d0ac58",
    chart2: "#87a4bd",
    chart3: "#8fa67f",
    chart4: "#d97a59",
    chart5: "#f1d59d",
    success: "#8fa67f",
    warning: "#d0ac58",
  },
} as const;

export type ThemeColors = { [K in keyof typeof palette.light]: string };
export type ColorScheme = "light" | "dark";

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  "2xl": 48,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
} as const;

export const fontSize = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  "2xl": 24,
  "3xl": 30,
  "4xl": 36,
} as const;
