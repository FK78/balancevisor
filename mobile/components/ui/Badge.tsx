import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "@/lib/theme-context";
import { fontSize, radius } from "@/constants/theme";

interface BadgeProps {
  label: string;
  variant?: "default" | "success" | "warning" | "destructive" | "muted";
}

export function Badge({ label, variant = "default" }: BadgeProps) {
  const { colors } = useTheme();

  const bgMap = {
    default: colors.primary,
    success: colors.success,
    warning: colors.warning,
    destructive: colors.destructive,
    muted: colors.muted,
  };

  const fgMap = {
    default: colors.primaryForeground,
    success: "#fff",
    warning: "#000",
    destructive: "#fff",
    muted: colors.mutedForeground,
  };

  return (
    <View style={[styles.badge, { backgroundColor: bgMap[variant] }]}>
      <Text style={[styles.text, { color: fgMap[variant] }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: radius.full,
    paddingHorizontal: 10,
    paddingVertical: 3,
    alignSelf: "flex-start",
  },
  text: { fontSize: fontSize.xs, fontWeight: "600" },
});
