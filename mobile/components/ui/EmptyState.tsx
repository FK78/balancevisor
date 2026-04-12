import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "@/lib/theme-context";
import { fontSize, spacing } from "@/constants/theme";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      {icon && <View style={styles.iconWrapper}>{icon}</View>}
      <Text style={[styles.title, { color: colors.foreground }]}>{title}</Text>
      {description && (
        <Text style={[styles.description, { color: colors.mutedForeground }]}>{description}</Text>
      )}
      {action && <View style={styles.actionWrapper}>{action}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: "center", justifyContent: "center", padding: spacing.xl, gap: spacing.sm },
  iconWrapper: { marginBottom: spacing.sm },
  title: { fontSize: fontSize.lg, fontWeight: "600", textAlign: "center" },
  description: { fontSize: fontSize.sm, textAlign: "center", maxWidth: 280 },
  actionWrapper: { marginTop: spacing.md },
});
