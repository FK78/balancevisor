import { ScrollView, View, Text, StyleSheet, RefreshControl, ActivityIndicator } from "react-native";
import { useCallback, useState } from "react";
import { useDashboardSummary } from "@/hooks/use-api";
import { useTheme } from "@/lib/theme-context";
import { spacing, fontSize } from "@/constants/theme";

export default function DashboardScreen() {
  const { colors } = useTheme();
  const { data, isLoading, refetch } = useDashboardSummary();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  if (isLoading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const summary = data as Record<string, unknown> | undefined;
  const accounts = (summary?.accounts as Array<{ id: string; name: string; balance: number }>) ?? [];
  const totalBalance = accounts.reduce((sum, a) => sum + a.balance, 0);
  const totals = summary?.totals as { income: number; expenses: number } | undefined;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
    >
      {/* Net Balance Card */}
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.cardLabel, { color: colors.mutedForeground }]}>Total Balance</Text>
        <Text style={[styles.cardValue, { color: colors.foreground }]}>
          £{totalBalance.toLocaleString("en-GB", { minimumFractionDigits: 2 })}
        </Text>
      </View>

      {/* Income / Expense Row */}
      <View style={styles.row}>
        <View style={[styles.card, styles.halfCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.cardLabel, { color: colors.mutedForeground }]}>Income</Text>
          <Text style={[styles.cardValue, { color: colors.success }]}>
            £{(totals?.income ?? 0).toLocaleString("en-GB", { minimumFractionDigits: 2 })}
          </Text>
        </View>
        <View style={[styles.card, styles.halfCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.cardLabel, { color: colors.mutedForeground }]}>Expenses</Text>
          <Text style={[styles.cardValue, { color: colors.destructive }]}>
            £{(totals?.expenses ?? 0).toLocaleString("en-GB", { minimumFractionDigits: 2 })}
          </Text>
        </View>
      </View>

      {/* Accounts List */}
      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Accounts</Text>
      {accounts.map((account) => (
        <View key={account.id} style={[styles.listItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.listItemTitle, { color: colors.foreground }]}>{account.name}</Text>
          <Text style={[styles.listItemValue, { color: colors.foreground }]}>
            £{account.balance.toLocaleString("en-GB", { minimumFractionDigits: 2 })}
          </Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  content: { padding: spacing.md, gap: spacing.md },
  card: {
    borderRadius: 16,
    padding: spacing.lg,
    borderWidth: 1,
  },
  cardLabel: { fontSize: fontSize.sm, marginBottom: 4 },
  cardValue: { fontSize: fontSize["2xl"], fontWeight: "700" },
  row: { flexDirection: "row", gap: spacing.md },
  halfCard: { flex: 1 },
  sectionTitle: { fontSize: fontSize.lg, fontWeight: "600", marginTop: spacing.sm },
  listItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 1,
  },
  listItemTitle: { fontSize: fontSize.base, fontWeight: "500" },
  listItemValue: { fontSize: fontSize.base, fontWeight: "600" },
});
