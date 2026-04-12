import { View, StyleSheet, type ViewProps } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/lib/theme-context";

interface ScreenWrapperProps extends ViewProps {
  safeArea?: boolean;
}

export function ScreenWrapper({ safeArea = false, style, children, ...props }: ScreenWrapperProps) {
  const { colors } = useTheme();
  const Wrapper = safeArea ? SafeAreaView : View;

  return (
    <Wrapper style={[styles.base, { backgroundColor: colors.background }, style]} {...props}>
      {children}
    </Wrapper>
  );
}

const styles = StyleSheet.create({
  base: { flex: 1 },
});
