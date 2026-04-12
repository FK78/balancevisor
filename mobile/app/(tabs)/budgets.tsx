import { FlatList, View, Text, StyleSheet, ActivityIndicator, RefreshControl } from "react-native";
import { useCallback, useState } from "react";
import { useBudgets } from "@/hooks/use-api";
import { useTheme } from "@/lib/theme-context";
import { spacing, fontSize, radius } from "@/constants/theme";

interface Budget {
  id: string;
  categoryName: string;
  budgetAmount: number;
  budgetSpent: number;
  color: string;
}

export default function BudgetsScreen() {
  const { colors } = useTheme();
  const { data, isLoading, refetch } = useBudgets();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const budgets = (data as Budget[] | undefined) ?? [];

  if (isLoading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <FlatList
      data={budgets}
      keyExtractor={(item) => item.id}
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      ListEmptyComponent={
        <View style={styles.center}>
          <Text style={{ color: colors.mutedForeground, fontSize: fontSize.base }}>No budgets yet</Text>
        </View>
      }
      renderItem={({ item }) => {
        const pct = item.budgetAmount > 0 ? Math.min(item.budgetSpent / item.budgetAmount, 1) : 0;
        const isOver = pct >= 1;
        return (
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.cardHeader}>
              <View style={[styles.dot, { backgroundColor: item.color }]} />
              <Text style={[styles.cardTitle, { color: colors.foreground }]}>{item.categoryName}</Text>
              <Text style={[styles.cardAmount, { color: isOver ? colors.destructive : colors.foreground }]}>
                £{item.budgetSpent.toFixed(0)} / £{item.budgetAmount.toFixed(0)}
              </Text>
            </View>
            <View style={[styles.progressTrack, { backgroundColor: colors.muted }]}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${pct * 100}%`,
                    backgroundColor: isOver ? colors.destructive : item.color,
                  },
                ]}
              />
            </View>
          </View>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: spacing.xl },
  content: { padding: spacing.md, gap: spacing.md },
  card: { borderRadius: 16, padding: spacing.md, borderWidth: 1 },
  cardHeader: { flexDirection: "row", alignItems: "center", marginBottom: spacing.sm },
  dot: { width: 10, height: 10, borderRadius: radius.full, marginRight: spacing.sm },
  cardTitle: { flex: 1, fontSize: fontSize.base, fontWeight: "500" },
  cardAmount: { fontSize: fontSize.sm, fontWeight: "600" },
  progressTrack: { height: 8, borderRadius: radius.full, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: radius.full },
});
