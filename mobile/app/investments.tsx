import { FlatList, View, Text, StyleSheet, ActivityIndicator, RefreshControl } from "react-native";
import { useCallback, useState } from "react";
import { Stack } from "expo-router";
import { TrendingUp } from "lucide-react-native";
import { useHoldings } from "@/hooks/use-api";
import { useTheme } from "@/lib/theme-context";
import { spacing, fontSize } from "@/constants/theme";
import { Card, Badge, EmptyState } from "@/components/ui";
import { formatCurrency } from "@/lib/shared/formatCurrency";
import type { Holding } from "@/lib/shared/types";

export default function InvestmentsScreen() {
  const { colors } = useTheme();
  const { data, isLoading, refetch } = useHoldings();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const holdings = (data as Holding[] | undefined) ?? [];
  const totalValue = holdings.reduce((s, h) => s + h.quantity * h.currentPrice, 0);
  const totalCost = holdings.reduce((s, h) => s + h.quantity * h.averageCost, 0);
  const totalPnL = totalValue - totalCost;

  if (isLoading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: true, title: "Investments", headerStyle: { backgroundColor: colors.card }, headerTintColor: colors.foreground }} />
      <FlatList
        data={holdings}
        keyExtractor={(item) => item.id}
        style={{ flex: 1, backgroundColor: colors.background }}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        ListHeaderComponent={
          holdings.length > 0 ? (
            <Card style={{ marginBottom: spacing.sm }}>
              <Text style={[styles.label, { color: colors.mutedForeground }]}>Portfolio Value</Text>
              <Text style={[styles.total, { color: colors.foreground }]}>
                {formatCurrency(totalValue)}
              </Text>
              <Text style={{ color: totalPnL >= 0 ? colors.success : colors.destructive, fontSize: fontSize.sm, fontWeight: "600" }}>
                {totalPnL >= 0 ? "+" : ""}{formatCurrency(totalPnL)} ({totalCost > 0 ? ((totalPnL / totalCost) * 100).toFixed(1) : 0}%)
              </Text>
            </Card>
          ) : null
        }
        ListEmptyComponent={
          <EmptyState
            icon={<TrendingUp size={40} color={colors.mutedForeground} />}
            title="No investments"
            description="Connect a broker or add manual holdings from the web app"
          />
        }
        renderItem={({ item }) => {
          const value = item.quantity * item.currentPrice;
          const cost = item.quantity * item.averageCost;
          const pnl = value - cost;
          const pnlPct = cost > 0 ? (pnl / cost) * 100 : 0;
          return (
            <Card style={{ gap: 4 }}>
              <View style={styles.header}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.name, { color: colors.foreground }]}>{item.ticker}</Text>
                  <Text style={{ color: colors.mutedForeground, fontSize: fontSize.xs }} numberOfLines={1}>
                    {item.name}
                  </Text>
                </View>
                <View style={{ alignItems: "flex-end" }}>
                  <Text style={{ color: colors.foreground, fontSize: fontSize.base, fontWeight: "600" }}>
                    {formatCurrency(value, item.currency)}
                  </Text>
                  <Text style={{ color: pnl >= 0 ? colors.success : colors.destructive, fontSize: fontSize.xs }}>
                    {pnl >= 0 ? "+" : ""}{formatCurrency(pnl, item.currency)} ({pnlPct.toFixed(1)}%)
                  </Text>
                </View>
              </View>
              <View style={styles.metaRow}>
                <Badge label={item.type} variant="muted" />
                <Text style={{ color: colors.mutedForeground, fontSize: fontSize.xs }}>
                  {item.quantity} × {formatCurrency(item.currentPrice, item.currency)}
                </Text>
              </View>
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
  label: { fontSize: fontSize.sm, marginBottom: 4 },
  total: { fontSize: fontSize["2xl"], fontWeight: "700" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  name: { fontSize: fontSize.base, fontWeight: "600" },
  metaRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 4 },
});
