import { View, StyleSheet } from "react-native";
import { useTheme } from "@/lib/theme-context";

export function Separator() {
  const { colors } = useTheme();
  return <View style={[styles.separator, { backgroundColor: colors.border }]} />;
}

const styles = StyleSheet.create({
  separator: { height: 1, width: "100%" },
});
