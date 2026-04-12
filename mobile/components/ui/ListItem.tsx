import { Pressable, View, Text, StyleSheet, type PressableProps } from "react-native";
import { ChevronRight } from "lucide-react-native";
import { useTheme } from "@/lib/theme-context";
import { fontSize, spacing, radius } from "@/constants/theme";

interface ListItemProps extends Omit<PressableProps, "style"> {
  title: string;
  subtitle?: string;
  left?: React.ReactNode;
  right?: React.ReactNode;
  showChevron?: boolean;
  bordered?: boolean;
}

export function ListItem({
  title,
  subtitle,
  left,
  right,
  showChevron = false,
  bordered = true,
  ...props
}: ListItemProps) {
  const { colors } = useTheme();

  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        bordered && { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1 },
        pressed && { opacity: 0.7 },
      ]}
      {...props}
    >
      {left && <View style={styles.left}>{left}</View>}
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.foreground }]} numberOfLines={1}>
          {title}
        </Text>
        {subtitle && (
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]} numberOfLines={1}>
            {subtitle}
          </Text>
        )}
      </View>
      {right && <View style={styles.right}>{right}</View>}
      {showChevron && <ChevronRight size={18} color={colors.mutedForeground} />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.md,
  },
  left: { flexShrink: 0 },
  content: { flex: 1 },
  title: { fontSize: fontSize.base, fontWeight: "500" },
  subtitle: { fontSize: fontSize.xs, marginTop: 2 },
  right: { flexShrink: 0 },
});
