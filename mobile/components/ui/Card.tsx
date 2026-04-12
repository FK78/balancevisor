import { View, StyleSheet, type ViewProps } from "react-native";
import { useTheme } from "@/lib/theme-context";
import { radius } from "@/constants/theme";

interface CardProps extends ViewProps {
  variant?: "default" | "outline";
}

export function Card({ style, variant = "default", ...props }: CardProps) {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.base,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          borderWidth: variant === "outline" ? 1 : 0,
        },
        style,
      ]}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.lg,
    padding: 16,
    borderWidth: 1,
  },
});
