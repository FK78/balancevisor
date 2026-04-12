import { ScrollView, View, Text, StyleSheet, RefreshControl, ActivityIndicator, Pressable } from "react-native";
import { useCallback, useState } from "react";
import { useRouter } from "expo-router";
import { useDashboardSummary, useDashboardHealth } from "@/hooks/use-api";
import { useTheme } from "@/lib/theme-context";
import { spacing, fontSize } from "@/constants/theme";
import { Card, Badge, ProgressBar, ListItem } from "@/components/ui";
import { formatCurrency } from "@/lib/shared/formatCurrency";
import type { DashboardSummary, HealthScoreResponse } from "@/lib/shared/types";

export default function DashboardScreen() {
  const { colors } = useTheme();
  const { data: rawSummary, isLoading, refetch } = useDashboardSummary();
  const { data: rawHealth } = useDashboardHealth();
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

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

  const summary = rawSummary as DashboardSummary | undefined;
  const health = rawHealth as HealthScoreResponse | undefined;
  const accounts = summary?.accounts ?? [];
  const totalBalance = accounts.reduce((sum, a) => sum + a.balance, 0);
  const currency = summary?.baseCurrency ?? "GBP";
  const totals = summary?.totals;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
    <ScrollView
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
    >
      {/* Net Balance */}
      <Card>
        <Text style={[styles.cardLabel, { color: colors.mutedForeground }]}>Total Balance</Text>
        <Text style={[styles.cardValue, { color: colors.foreground }]}>
          {formatCurrency(totalBalance, currency)}
        </Text>
        {health && (
          <View style={styles.healthRow}>
            <Badge label={`${health.grade} · ${health.overall}/100`} variant={health.overall >= 70 ? "success" : health.overall >= 40 ? "warning" : "destructive"} />
          </View>
        )}
      </Card>

      {/* Income / Expense */}
      <View style={styles.row}>
        <Card style={styles.halfCard}>
          <Text style={[styles.cardLabel, { color: colors.mutedForeground }]}>Income</Text>
          <Text style={[styles.cardValue, { color: colors.success }]}>
            {formatCurrency(totals?.income ?? 0, currency)}
          </Text>
        </Card>
        <Card style={styles.halfCard}>
          <Text style={[styles.cardLabel, { color: colors.mutedForeground }]}>Expenses</Text>
          <Text style={[styles.cardValue, { color: colors.destructive }]}>
            {formatCurrency(totals?.expenses ?? 0, currency)}
          </Text>
        </Card>
      </View>

      {/* Budget Overview */}
      {(summary?.budgets?.length ?? 0) > 0 && (
        <>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Budgets</Text>
          {summary!.budgets.slice(0, 4).map((b) => {
            const pct = b.budgetAmount > 0 ? b.budgetSpent / b.budgetAmount : 0;
            return (
              <Card key={b.id} style={{ gap: 8 }}>
                <View style={styles.budgetHeader}>
                  <Text style={[styles.budgetName, { color: colors.foreground }]}>{b.categoryName}</Text>
                  <Text style={[styles.budgetAmount, { color: pct >= 1 ? colors.destructive : colors.foreground }]}>
                    {formatCurrency(b.budgetSpent, currency)} / {formatCurrency(b.budgetAmount, currency)}
                  </Text>
                </View>
                <ProgressBar value={pct} color={b.color} />
              </Card>
            );
          })}
        </>
      )}

      {/* Accounts */}
      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Accounts</Text>
      {accounts.map((account) => (
        <Pressable key={account.id} onPress={() => router.push(`/account/${account.id}` as never)}>
          <ListItem
            title={account.name}
            subtitle={account.type}
            right={
              <Text style={[styles.accountBalance, { color: colors.foreground }]}>
                {formatCurrency(account.balance, currency)}
              </Text>
            }
          />
        </Pressable>
      ))}

      {/* Goals */}
      {(summary?.goals?.length ?? 0) > 0 && (
        <>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Goals</Text>
          {summary!.goals.slice(0, 3).map((g) => {
            const pct = g.target_amount > 0 ? g.saved_amount / g.target_amount : 0;
            return (
              <Card key={g.id} style={{ gap: 8 }}>
                <View style={styles.budgetHeader}>
                  <Text style={[styles.budgetName, { color: colors.foreground }]}>{g.name}</Text>
                  <Text style={{ color: colors.mutedForeground, fontSize: fontSize.sm }}>
                    {Math.round(pct * 100)}%
                  </Text>
                </View>
                <ProgressBar value={pct} color={g.color} />
              </Card>
            );
          })}
        </>
      )}
      {/* Net Worth Trend */}
      {(summary?.netWorth?.length ?? 0) > 1 && (
        <>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Net Worth Trend</Text>
          <Card>
            <View style={styles.netWorthRow}>
              {summary!.netWorth.slice(-6).map((point) => {
                const values = summary!.netWorth.slice(-6).map((p) => p.net_worth);
                const maxVal = Math.max(...values);
                const minVal = Math.min(...values);
                const range = maxVal - minVal || 1;
                const height = ((point.net_worth - minVal) / range) * 60 + 8;
                return (
                  <View key={point.date} style={styles.barCol}>
                    <View style={[styles.bar, { height, backgroundColor: point.net_worth >= 0 ? colors.success : colors.destructive }]} />
                    <Text style={{ color: colors.mutedForeground, fontSize: 9 }}>
                      {point.date.slice(5)}
                    </Text>
                  </View>
                );
              })}
            </View>
            <Text style={{ color: colors.foreground, fontSize: fontSize.sm, fontWeight: "600", marginTop: spacing.sm, textAlign: "center" }}>
              Current: {formatCurrency(summary!.netWorth[summary!.netWorth.length - 1]?.net_worth ?? 0, currency)}
            </Text>
          </Card>
        </>
      )}
    </ScrollView>

      {/* FAB: Add Account */}
      <Pressable
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={() => router.push("/add-account" as never)}
      >
        <Text style={{ color: colors.primaryForeground, fontSize: 24, fontWeight: "700", marginTop: -2 }}>+</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  content: { padding: spacing.md, gap: spacing.md, paddingBottom: spacing.xl },
  cardLabel: { fontSize: fontSize.sm, marginBottom: 4 },
  cardValue: { fontSize: fontSize["2xl"], fontWeight: "700" },
  healthRow: { marginTop: spacing.sm },
  row: { flexDirection: "row", gap: spacing.md },
  halfCard: { flex: 1 },
  sectionTitle: { fontSize: fontSize.lg, fontWeight: "600", marginTop: spacing.sm },
  budgetHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  budgetName: { fontSize: fontSize.base, fontWeight: "500" },
  budgetAmount: { fontSize: fontSize.sm, fontWeight: "600" },
  accountBalance: { fontSize: fontSize.base, fontWeight: "600" },
  netWorthRow: { flexDirection: "row", justifyContent: "space-around", alignItems: "flex-end", height: 80 },
  barCol: { alignItems: "center", gap: 4 },
  bar: { width: 20, borderRadius: 4 },
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
