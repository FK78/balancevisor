import { View, StyleSheet } from "react-native";
import { useTheme } from "@/lib/theme-context";
import { radius } from "@/constants/theme";

interface ProgressBarProps {
  value: number; // 0-1
  color?: string;
  height?: number;
}

export function ProgressBar({ value, color, height = 8 }: ProgressBarProps) {
  const { colors } = useTheme();
  const pct = Math.min(1, Math.max(0, value));
  const fillColor = color ?? colors.primary;
  const isOver = pct >= 1;

  return (
    <View style={[styles.track, { backgroundColor: colors.muted, height }]}>
      <View
        style={[
          styles.fill,
          {
            width: `${pct * 100}%`,
            backgroundColor: isOver ? colors.destructive : fillColor,
            height,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: { borderRadius: radius.full, overflow: "hidden" },
  fill: { borderRadius: radius.full },
});
