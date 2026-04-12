import { FlatList, View, Text, TextInput, StyleSheet, ActivityIndicator, RefreshControl, Pressable } from "react-native";
import { useCallback, useMemo, useState } from "react";
import { useTransactions, useDeleteTransaction } from "@/hooks/use-api";
import { useTheme } from "@/lib/theme-context";
import { spacing, fontSize, radius } from "@/constants/theme";
import { ListItem, EmptyState } from "@/components/ui";
import { SwipeableRow } from "@/components/SwipeableRow";
import { AddTransactionSheet } from "@/components/AddTransactionSheet";
import { formatCurrency } from "@/lib/shared/formatCurrency";
import { formatDayLabel } from "@/lib/shared/date";
import type { Transaction } from "@/lib/shared/types";
import { ArrowLeftRight, Plus, Search } from "lucide-react-native";

type FilterType = "all" | "income" | "expense";

function TransactionRow({ item, colors }: { item: Transaction; colors: Record<string, string> }) {
  const deleteMut = useDeleteTransaction(item.id);
  const isIncome = item.type === "income";
  const sign = isIncome ? "+" : "-";
  return (
    <SwipeableRow
      onDelete={() => deleteMut.mutate(undefined as never)}
      confirmTitle="Delete Transaction"
      confirmMessage={`Delete "${item.description || item.merchant || "Transaction"}"?`}
    >
      <View style={{ flex: 1 }}>
        <ListItem
          title={item.description || item.merchant || "Transaction"}
          subtitle={`${item.categoryName ?? "Uncategorised"} · ${formatDayLabel(item.date)}`}
          right={
            <Text style={{ color: isIncome ? colors.success : colors.destructive, fontWeight: "600", fontSize: fontSize.base }}>
              {sign}{formatCurrency(Math.abs(item.amount))}
            </Text>
          }
        />
      </View>
    </SwipeableRow>
  );
}

export default function TransactionsScreen() {
  const { colors } = useTheme();
  const { data, isLoading, refetch } = useTransactions(1, 100);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");
  const [showAdd, setShowAdd] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const filtered = useMemo(() => {
    const all = (data as Transaction[] | undefined) ?? [];
    let items = all;
    if (filter !== "all") items = items.filter((t) => t.type === filter);
    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter(
        (t) =>
          t.description?.toLowerCase().includes(q) ||
          t.merchant?.toLowerCase().includes(q) ||
          t.categoryName?.toLowerCase().includes(q),
      );
    }
    return items;
  }, [data, filter, search]);

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
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        ListHeaderComponent={
          <View style={styles.headerContainer}>
            {/* Search bar */}
            <View style={[styles.searchRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Search size={16} color={colors.mutedForeground} />
              <TextInput
                style={[styles.searchInput, { color: colors.foreground }]}
                placeholder="Search transactions..."
                placeholderTextColor={colors.mutedForeground}
                value={search}
                onChangeText={setSearch}
              />
            </View>

            {/* Filter chips */}
            <View style={styles.filterRow}>
              {(["all", "expense", "income"] as const).map((f) => (
                <Pressable
                  key={f}
                  onPress={() => setFilter(f)}
                  style={[styles.filterChip, { backgroundColor: filter === f ? colors.primary : colors.muted }]}
                >
                  <Text style={{ color: filter === f ? colors.primaryForeground : colors.foreground, fontSize: fontSize.xs, fontWeight: "600", textTransform: "capitalize" }}>
                    {f}
                  </Text>
                </Pressable>
              ))}
              <Text style={{ color: colors.mutedForeground, fontSize: fontSize.xs, marginLeft: "auto" }}>
                {filtered.length} result{filtered.length !== 1 ? "s" : ""}
              </Text>
            </View>
          </View>
        }
        ListEmptyComponent={
          <EmptyState
            icon={<ArrowLeftRight size={40} color={colors.mutedForeground} />}
            title={search ? "No matches" : "No transactions yet"}
            description={search ? "Try a different search term" : "Your transactions will appear here once synced"}
          />
        }
        renderItem={({ item }) => <TransactionRow item={item} colors={colors} />}
      />

      {/* FAB */}
      <Pressable
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={() => setShowAdd(true)}
      >
        <Plus size={24} color={colors.primaryForeground} />
      </Pressable>

      <AddTransactionSheet visible={showAdd} onClose={() => setShowAdd(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: spacing.xl },
  content: { padding: spacing.md, gap: spacing.sm, paddingBottom: 100 },
  headerContainer: { gap: spacing.sm, marginBottom: spacing.sm },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  searchInput: { flex: 1, fontSize: fontSize.base },
  filterRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  filterChip: { paddingHorizontal: spacing.md, paddingVertical: 6, borderRadius: radius.full },
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
