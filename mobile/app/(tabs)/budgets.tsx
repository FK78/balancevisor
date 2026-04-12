import { FlatList, View, Text, StyleSheet, ActivityIndicator, RefreshControl, Pressable } from "react-native";
import { useCallback, useState } from "react";
import { useRouter } from "expo-router";
import { useBudgets } from "@/hooks/use-api";
import { useTheme } from "@/lib/theme-context";
import { spacing, fontSize } from "@/constants/theme";
import { Card, ProgressBar, EmptyState } from "@/components/ui";
import { formatCurrency } from "@/lib/shared/formatCurrency";
import type { Budget } from "@/lib/shared/types";
import { PiggyBank, Plus } from "lucide-react-native";

export default function BudgetsScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { data, isLoading, refetch } = useBudgets();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const budgets = (data as Budget[] | undefined) ?? [];
  const totalBudget = budgets.reduce((s, b) => s + b.budgetAmount, 0);
  const totalSpent = budgets.reduce((s, b) => s + b.budgetSpent, 0);

  if (isLoading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
    <FlatList
      data={budgets}
      keyExtractor={(item) => item.id}
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      ListHeaderComponent={
        budgets.length > 0 ? (
          <Card style={{ marginBottom: spacing.sm }}>
            <Text style={[styles.headerLabel, { color: colors.mutedForeground }]}>Total Spent</Text>
            <Text style={[styles.headerValue, { color: totalSpent > totalBudget ? colors.destructive : colors.foreground }]}>
              {formatCurrency(totalSpent)} / {formatCurrency(totalBudget)}
            </Text>
            <ProgressBar value={totalBudget > 0 ? totalSpent / totalBudget : 0} />
          </Card>
        ) : null
      }
      ListEmptyComponent={
        <EmptyState
          icon={<PiggyBank size={40} color={colors.mutedForeground} />}
          title="No budgets yet"
          description="Create budgets from the web app to track your spending"
        />
      }
      renderItem={({ item }) => {
        const pct = item.budgetAmount > 0 ? item.budgetSpent / item.budgetAmount : 0;
        return (
          <Card style={{ gap: 8 }}>
            <View style={styles.budgetHeader}>
              <View style={[styles.dot, { backgroundColor: item.color }]} />
              <Text style={[styles.budgetName, { color: colors.foreground }]} numberOfLines={1}>
                {item.categoryName}
              </Text>
              <Text style={[styles.budgetAmount, { color: pct >= 1 ? colors.destructive : colors.foreground }]}>
                {formatCurrency(item.budgetSpent)} / {formatCurrency(item.budgetAmount)}
              </Text>
            </View>
            <ProgressBar value={pct} color={item.color} />
            <Text style={{ color: colors.mutedForeground, fontSize: fontSize.xs }}>
              {formatCurrency(Math.max(0, item.budgetAmount - item.budgetSpent))} remaining
            </Text>
          </Card>
        );
      }}
    />

      {/* FAB */}
      <Pressable
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={() => router.push("/add-budget" as never)}
      >
        <Plus size={24} color={colors.primaryForeground} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: spacing.xl },
  content: { padding: spacing.md, gap: spacing.md, paddingBottom: spacing.xl },
  headerLabel: { fontSize: fontSize.sm, marginBottom: 4 },
  headerValue: { fontSize: fontSize["2xl"], fontWeight: "700", marginBottom: spacing.sm },
  budgetHeader: { flexDirection: "row", alignItems: "center" },
  dot: { width: 10, height: 10, borderRadius: 999, marginRight: spacing.sm },
  budgetName: { flex: 1, fontSize: fontSize.base, fontWeight: "500" },
  budgetAmount: { fontSize: fontSize.sm, fontWeight: "600" },
  fab: {
    position: "absolute",
    right: spacing.md,
    bottom: spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
});
