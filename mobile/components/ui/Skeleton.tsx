import { useEffect, useMemo } from "react";
import { Animated, StyleSheet, type ViewProps } from "react-native";
import { useTheme } from "@/lib/theme-context";
import { radius } from "@/constants/theme";

interface SkeletonProps extends ViewProps {
  width?: number | string;
  height?: number;
  circle?: boolean;
}

export function Skeleton({ width = "100%", height = 16, circle = false, style, ...props }: SkeletonProps) {
  const { colors } = useTheme();
  const opacity = useMemo(() => new Animated.Value(0.3), []);

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.7, duration: 800, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 800, useNativeDriver: true }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        {
          width: width as number,
          height,
          backgroundColor: colors.muted,
          borderRadius: circle ? height / 2 : radius.md,
          opacity,
        },
        style,
      ]}
      {...props}
    />
  );
}

export function CardSkeleton() {
  return (
    <Animated.View style={styles.card}>
      <Skeleton width="40%" height={14} />
      <Skeleton width="60%" height={28} style={{ marginTop: 8 }} />
    </Animated.View>
  );
}

export function ListItemSkeleton() {
  return (
    <Animated.View style={styles.listItem}>
      <Skeleton circle width={40} height={40} />
      <Animated.View style={{ flex: 1, gap: 6 }}>
        <Skeleton width="70%" height={14} />
        <Skeleton width="50%" height={12} />
      </Animated.View>
      <Skeleton width={60} height={16} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: { padding: 16, borderRadius: radius.lg, gap: 4 },
  listItem: { flexDirection: "row", alignItems: "center", gap: 12, padding: 12 },
});
