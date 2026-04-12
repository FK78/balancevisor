import { FlatList, View, Text, StyleSheet, ActivityIndicator, RefreshControl } from "react-native";
import { useCallback, useState } from "react";
import { Stack } from "expo-router";
import { Target } from "lucide-react-native";
import { useGoals } from "@/hooks/use-api";
import { useTheme } from "@/lib/theme-context";
import { spacing, fontSize } from "@/constants/theme";
import { Card, ProgressBar, EmptyState } from "@/components/ui";
import { formatCurrency } from "@/lib/shared/formatCurrency";
import type { Goal } from "@/lib/shared/types";

export default function GoalsScreen() {
  const { colors } = useTheme();
  const { data, isLoading, refetch } = useGoals();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const goals = (data as Goal[] | undefined) ?? [];

  if (isLoading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: true, title: "Goals", headerStyle: { backgroundColor: colors.card }, headerTintColor: colors.foreground }} />
      <FlatList
        data={goals}
        keyExtractor={(item) => item.id}
        style={{ flex: 1, backgroundColor: colors.background }}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        ListEmptyComponent={
          <EmptyState
            icon={<Target size={40} color={colors.mutedForeground} />}
            title="No goals yet"
            description="Set savings goals from the web app"
          />
        }
        renderItem={({ item }) => {
          const pct = item.target_amount > 0 ? item.saved_amount / item.target_amount : 0;
          return (
            <Card style={{ gap: spacing.sm }}>
              <View style={styles.header}>
                <Text style={[styles.name, { color: colors.foreground }]}>{item.name}</Text>
                <Text style={{ color: colors.mutedForeground, fontSize: fontSize.sm }}>
                  {Math.round(pct * 100)}%
                </Text>
              </View>
              <ProgressBar value={pct} color={item.color} />
              <View style={styles.header}>
                <Text style={{ color: colors.mutedForeground, fontSize: fontSize.xs }}>
                  {formatCurrency(item.saved_amount)} saved
                </Text>
                <Text style={{ color: colors.foreground, fontSize: fontSize.xs, fontWeight: "600" }}>
                  {formatCurrency(item.target_amount)} target
                </Text>
              </View>
              {item.target_date && (
                <Text style={{ color: colors.mutedForeground, fontSize: fontSize.xs }}>
                  Target: {item.target_date}
                </Text>
              )}
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
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  name: { fontSize: fontSize.base, fontWeight: "600" },
});
