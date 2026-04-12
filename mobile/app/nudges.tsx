import { FlatList, View, Text, StyleSheet, ActivityIndicator, RefreshControl } from "react-native";
import { useCallback, useState } from "react";
import { Stack } from "expo-router";
import { Bell, AlertTriangle, PartyPopper, Info } from "lucide-react-native";
import { useNudges } from "@/hooks/use-api";
import { useTheme } from "@/lib/theme-context";
import { spacing, fontSize } from "@/constants/theme";
import { Card, Badge, EmptyState } from "@/components/ui";
import type { Nudge } from "@/lib/shared/types";

const severityIcon = {
  info: Info,
  warning: AlertTriangle,
  critical: AlertTriangle,
  celebration: PartyPopper,
};

const severityVariant = {
  info: "default" as const,
  warning: "warning" as const,
  critical: "destructive" as const,
  celebration: "success" as const,
};

export default function NudgesScreen() {
  const { colors } = useTheme();
  const { data, isLoading, refetch } = useNudges();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const nudges = (data as Nudge[] | undefined) ?? [];

  if (isLoading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: true, title: "Insights", headerStyle: { backgroundColor: colors.card }, headerTintColor: colors.foreground }} />
      <FlatList
        data={nudges}
        keyExtractor={(item) => item.key}
        style={{ flex: 1, backgroundColor: colors.background }}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        ListEmptyComponent={
          <EmptyState
            icon={<Bell size={40} color={colors.mutedForeground} />}
            title="No insights right now"
            description="You're on top of everything!"
          />
        }
        renderItem={({ item }) => {
          const Icon = severityIcon[item.severity] ?? Info;
          return (
            <Card style={{ gap: spacing.sm }}>
              <View style={styles.header}>
                <Icon size={18} color={colors.foreground} />
                <Text style={[styles.title, { color: colors.foreground }]}>{item.title}</Text>
                <Badge label={item.severity} variant={severityVariant[item.severity]} />
              </View>
              <Text style={{ color: colors.mutedForeground, fontSize: fontSize.sm }}>{item.message}</Text>
            </Card>
          );
        }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  content: { padding: spacing.md, gap: spacing.md, paddingBottom: spacing.xl },
  header: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  title: { flex: 1, fontSize: fontSize.base, fontWeight: "600" },
});
