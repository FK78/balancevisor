import { FlatList, View, Text, StyleSheet, ActivityIndicator, RefreshControl } from "react-native";
import { useCallback, useState } from "react";
import { useTransactions } from "@/hooks/use-api";
import { useTheme } from "@/lib/theme-context";
import { spacing, fontSize } from "@/constants/theme";
import { ListItem, EmptyState } from "@/components/ui";
import { formatCurrency } from "@/lib/shared/formatCurrency";
import { formatDayLabel } from "@/lib/shared/date";
import type { Transaction } from "@/lib/shared/types";
import { ArrowLeftRight } from "lucide-react-native";

export default function TransactionsScreen() {
  const { colors } = useTheme();
  const { data, isLoading, refetch } = useTransactions();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const transactions = (data as Transaction[] | undefined) ?? [];

  if (isLoading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <FlatList
      data={transactions}
      keyExtractor={(item) => item.id}
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      ListEmptyComponent={
        <EmptyState
          icon={<ArrowLeftRight size={40} color={colors.mutedForeground} />}
          title="No transactions yet"
          description="Your transactions will appear here once synced"
        />
      }
      renderItem={({ item }) => {
        const isIncome = item.type === "income";
        const sign = isIncome ? "+" : "-";
        return (
          <ListItem
            title={item.description || item.merchant || "Transaction"}
            subtitle={`${item.categoryName ?? "Uncategorised"} · ${formatDayLabel(item.date)}`}
            right={
              <Text style={{ color: isIncome ? colors.success : colors.destructive, fontWeight: "600", fontSize: fontSize.base }}>
                {sign}{formatCurrency(Math.abs(item.amount))}
              </Text>
            }
          />
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: spacing.xl },
  content: { padding: spacing.md, gap: spacing.sm, paddingBottom: spacing.xl },
});
