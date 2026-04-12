import { FlatList, View, Text, StyleSheet, ActivityIndicator, RefreshControl } from "react-native";
import { useCallback, useState } from "react";
import { useTransactions } from "@/hooks/use-api";
import { useTheme } from "@/lib/theme-context";
import { spacing, fontSize } from "@/constants/theme";

interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: string;
  date: string;
  categoryName?: string;
}

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
        <View style={styles.center}>
          <Text style={{ color: colors.mutedForeground, fontSize: fontSize.base }}>No transactions yet</Text>
        </View>
      }
      renderItem={({ item }) => {
        const isIncome = item.type === "income";
        return (
          <View style={[styles.row, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.rowLeft}>
              <Text style={[styles.description, { color: colors.foreground }]} numberOfLines={1}>
                {item.description}
              </Text>
              <Text style={[styles.meta, { color: colors.mutedForeground }]}>
                {item.categoryName ?? "Uncategorised"} · {item.date}
              </Text>
            </View>
            <Text style={[styles.amount, { color: isIncome ? colors.success : colors.destructive }]}>
              {isIncome ? "+" : "-"}£{Math.abs(item.amount).toLocaleString("en-GB", { minimumFractionDigits: 2 })}
            </Text>
          </View>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: spacing.xl },
  content: { padding: spacing.md, gap: spacing.sm },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 1,
  },
  rowLeft: { flex: 1, marginRight: spacing.md },
  description: { fontSize: fontSize.base, fontWeight: "500" },
  meta: { fontSize: fontSize.xs, marginTop: 2 },
  amount: { fontSize: fontSize.base, fontWeight: "600" },
});
