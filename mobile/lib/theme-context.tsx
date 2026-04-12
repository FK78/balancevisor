import { createContext, useContext, type ReactNode } from "react";
import { useColorScheme as useSystemColorScheme } from "react-native";
import { palette, type ThemeColors, type ColorScheme } from "@/constants/theme";

interface ThemeContextValue {
  colorScheme: ColorScheme;
  colors: ThemeColors;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextValue>({
  colorScheme: "light",
  colors: palette.light,
  isDark: false,
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme = useSystemColorScheme();
  const colorScheme: ColorScheme = systemScheme === "dark" ? "dark" : "light";
  const colors = palette[colorScheme];

  return (
    <ThemeContext.Provider value={{ colorScheme, colors, isDark: colorScheme === "dark" }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext);
}
