import { Pressable, Text, StyleSheet, ActivityIndicator, type PressableProps } from "react-native";
import { useTheme } from "@/lib/theme-context";
import { radius, fontSize, spacing } from "@/constants/theme";

interface ButtonProps extends Omit<PressableProps, "style"> {
  title: string;
  variant?: "primary" | "secondary" | "destructive" | "ghost";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

export function Button({ title, variant = "primary", size = "md", loading, disabled, ...props }: ButtonProps) {
  const { colors } = useTheme();

  const bg = {
    primary: colors.primary,
    secondary: colors.secondary,
    destructive: colors.destructive,
    ghost: "transparent",
  }[variant];

  const fg = {
    primary: colors.primaryForeground,
    secondary: colors.secondaryForeground,
    destructive: "#fff",
    ghost: colors.foreground,
  }[variant];

  const paddingVertical = { sm: 8, md: 12, lg: 16 }[size];
  const textSize = { sm: fontSize.sm, md: fontSize.base, lg: fontSize.lg }[size];

  return (
    <Pressable
      style={({ pressed }) => [
        styles.base,
        { backgroundColor: bg, paddingVertical, opacity: pressed || disabled ? 0.7 : 1 },
      ]}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={fg} size="small" />
      ) : (
        <Text style={[styles.text, { color: fg, fontSize: textSize }]}>{title}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: spacing.sm,
  },
  text: { fontWeight: "600" },
});
