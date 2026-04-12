import { ScrollView, View, Text, StyleSheet, ActivityIndicator, RefreshControl } from "react-native";
import { useCallback, useState } from "react";
import { Stack } from "expo-router";
import { TrendingUp, TrendingDown, ArrowRightLeft } from "lucide-react-native";
import { useDashboardCashflow } from "@/hooks/use-api";
import { useTheme } from "@/lib/theme-context";
import { spacing, fontSize } from "@/constants/theme";
import { Card, EmptyState, ProgressBar } from "@/components/ui";
import { formatCurrency } from "@/lib/shared/formatCurrency";

interface CashflowData {
  income: number;
  expenses: number;
  projectedIncome: number;
  projectedExpenses: number;
  currency: string;
  topExpenseCategories?: Array<{ name: string; amount: number; color: string }>;
}

export default function CashflowScreen() {
  const { colors } = useTheme();
  const { data: rawData, isLoading, refetch } = useDashboardCashflow();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const data = rawData as CashflowData | undefined;

  if (isLoading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!data) {
    return (
      <>
        <Stack.Screen options={{ headerShown: true, title: "Cashflow", headerStyle: { backgroundColor: colors.card }, headerTintColor: colors.foreground }} />
        <View style={[styles.center, { backgroundColor: colors.background }]}>
          <EmptyState
            icon={<ArrowRightLeft size={40} color={colors.mutedForeground} />}
            title="No cashflow data"
            description="Add transactions to see your cashflow forecast"
          />
        </View>
      </>
    );
  }

  const currency = data.currency ?? "GBP";
  const netCurrent = data.income - data.expenses;
  const netProjected = data.projectedIncome - data.projectedExpenses;
  const topCategories = data.topExpenseCategories ?? [];

  return (
    <>
      <Stack.Screen options={{ headerShown: true, title: "Cashflow", headerStyle: { backgroundColor: colors.card }, headerTintColor: colors.foreground }} />
      <ScrollView
        style={{ flex: 1, backgroundColor: colors.background }}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        {/* Current month */}
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>This Month</Text>
        <View style={styles.row}>
          <Card style={styles.halfCard}>
            <View style={styles.iconRow}>
              <TrendingUp size={16} color={colors.success} />
              <Text style={[styles.label, { color: colors.mutedForeground }]}>Income</Text>
            </View>
            <Text style={[styles.value, { color: colors.success }]}>{formatCurrency(data.income, currency)}</Text>
          </Card>
          <Card style={styles.halfCard}>
            <View style={styles.iconRow}>
              <TrendingDown size={16} color={colors.destructive} />
              <Text style={[styles.label, { color: colors.mutedForeground }]}>Expenses</Text>
            </View>
            <Text style={[styles.value, { color: colors.destructive }]}>{formatCurrency(data.expenses, currency)}</Text>
          </Card>
        </View>
        <Card>
          <Text style={[styles.label, { color: colors.mutedForeground }]}>Net</Text>
          <Text style={[styles.value, { color: netCurrent >= 0 ? colors.success : colors.destructive }]}>
            {netCurrent >= 0 ? "+" : ""}{formatCurrency(netCurrent, currency)}
          </Text>
        </Card>

        {/* Projected */}
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>End-of-Month Projection</Text>
        <View style={styles.row}>
          <Card style={styles.halfCard}>
            <Text style={[styles.label, { color: colors.mutedForeground }]}>Income</Text>
            <Text style={[styles.smallValue, { color: colors.success }]}>{formatCurrency(data.projectedIncome, currency)}</Text>
          </Card>
          <Card style={styles.halfCard}>
            <Text style={[styles.label, { color: colors.mutedForeground }]}>Expenses</Text>
            <Text style={[styles.smallValue, { color: colors.destructive }]}>{formatCurrency(data.projectedExpenses, currency)}</Text>
          </Card>
        </View>
        <Card>
          <Text style={[styles.label, { color: colors.mutedForeground }]}>Projected Net</Text>
          <Text style={[styles.value, { color: netProjected >= 0 ? colors.success : colors.destructive }]}>
            {netProjected >= 0 ? "+" : ""}{formatCurrency(netProjected, currency)}
          </Text>
        </Card>

        {/* Top expense categories */}
        {topCategories.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Top Expense Categories</Text>
            {topCategories.slice(0, 5).map((cat) => {
              const maxAmount = topCategories[0]?.amount ?? 1;
              return (
                <Card key={cat.name} style={{ gap: 6 }}>
                  <View style={styles.catHeader}>
                    <Text style={[styles.catName, { color: colors.foreground }]}>{cat.name}</Text>
                    <Text style={{ color: colors.foreground, fontWeight: "600", fontSize: fontSize.sm }}>
                      {formatCurrency(cat.amount, currency)}
                    </Text>
                  </View>
                  <ProgressBar value={cat.amount / maxAmount} color={cat.color} />
                </Card>
              );
            })}
          </>
        )}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  content: { padding: spacing.md, gap: spacing.md, paddingBottom: spacing.xl },
  sectionTitle: { fontSize: fontSize.lg, fontWeight: "600", marginTop: spacing.sm },
  row: { flexDirection: "row", gap: spacing.md },
  halfCard: { flex: 1 },
  iconRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 4 },
  label: { fontSize: fontSize.sm },
  value: { fontSize: fontSize["2xl"], fontWeight: "700" },
  smallValue: { fontSize: fontSize.lg, fontWeight: "700" },
  catHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  catName: { fontSize: fontSize.base, fontWeight: "500" },
});
