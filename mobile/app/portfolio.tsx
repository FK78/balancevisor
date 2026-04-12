import { ScrollView, View, Text, StyleSheet, ActivityIndicator, RefreshControl } from "react-native";
import { useCallback, useState } from "react";
import { Stack } from "expo-router";
import { TrendingUp } from "lucide-react-native";
import { usePortfolio } from "@/hooks/use-api";
import { useTheme } from "@/lib/theme-context";
import { spacing, fontSize } from "@/constants/theme";
import { Card, Badge, EmptyState } from "@/components/ui";
import { formatCurrency } from "@/lib/shared/formatCurrency";

interface PortfolioData {
  totalValue: number;
  totalCost: number;
  totalPnL: number;
  totalPnLPercent: number;
  cash: number;
  currency: string;
  brokerBreakdown: Array<{ broker: string; value: number; holdingsCount: number }>;
  assetAllocation: Array<{ type: string; value: number; percentage: number }>;
}

export default function PortfolioScreen() {
  const { colors } = useTheme();
  const { data: rawData, isLoading, refetch } = usePortfolio();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const data = rawData as PortfolioData | undefined;

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
        <Stack.Screen options={{ headerShown: true, title: "Portfolio", headerStyle: { backgroundColor: colors.card }, headerTintColor: colors.foreground }} />
        <View style={[styles.center, { backgroundColor: colors.background }]}>
          <EmptyState
            icon={<TrendingUp size={40} color={colors.mutedForeground} />}
            title="No portfolio data"
            description="Connect a broker or add holdings to see your portfolio"
          />
        </View>
      </>
    );
  }

  const currency = data.currency ?? "GBP";

  return (
    <>
      <Stack.Screen options={{ headerShown: true, title: "Portfolio", headerStyle: { backgroundColor: colors.card }, headerTintColor: colors.foreground }} />
      <ScrollView
        style={{ flex: 1, backgroundColor: colors.background }}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        {/* Summary */}
        <Card>
          <Text style={[styles.label, { color: colors.mutedForeground }]}>Total Value</Text>
          <Text style={[styles.bigValue, { color: colors.foreground }]}>{formatCurrency(data.totalValue, currency)}</Text>
          <View style={styles.row}>
            <Text style={{ color: data.totalPnL >= 0 ? colors.success : colors.destructive, fontWeight: "600", fontSize: fontSize.sm }}>
              {data.totalPnL >= 0 ? "+" : ""}{formatCurrency(data.totalPnL, currency)} ({data.totalPnLPercent.toFixed(1)}%)
            </Text>
            <Badge label="All Time" variant="muted" />
          </View>
          {data.cash > 0 && (
            <Text style={{ color: colors.mutedForeground, fontSize: fontSize.xs, marginTop: spacing.xs }}>
              Cash: {formatCurrency(data.cash, currency)}
            </Text>
          )}
        </Card>

        {/* Asset Allocation */}
        {(data.assetAllocation?.length ?? 0) > 0 && (
          <>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Asset Allocation</Text>
            {data.assetAllocation.map((asset) => (
              <Card key={asset.type} style={styles.row}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: colors.foreground, fontWeight: "500", fontSize: fontSize.sm, textTransform: "capitalize" }}>{asset.type}</Text>
                </View>
                <Text style={{ color: colors.foreground, fontWeight: "600", fontSize: fontSize.sm }}>
                  {formatCurrency(asset.value, currency)}
                </Text>
                <Badge label={`${asset.percentage.toFixed(0)}%`} variant="muted" />
              </Card>
            ))}
          </>
        )}

        {/* Broker Breakdown */}
        {(data.brokerBreakdown?.length ?? 0) > 0 && (
          <>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Brokers</Text>
            {data.brokerBreakdown.map((b) => (
              <Card key={b.broker} style={styles.row}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: colors.foreground, fontWeight: "500", fontSize: fontSize.sm, textTransform: "capitalize" }}>{b.broker}</Text>
                  <Text style={{ color: colors.mutedForeground, fontSize: fontSize.xs }}>{b.holdingsCount} holdings</Text>
                </View>
                <Text style={{ color: colors.foreground, fontWeight: "600", fontSize: fontSize.sm }}>
                  {formatCurrency(b.value, currency)}
                </Text>
              </Card>
            ))}
          </>
        )}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  content: { padding: spacing.md, gap: spacing.md, paddingBottom: spacing.xl },
  label: { fontSize: fontSize.sm, marginBottom: 4 },
  bigValue: { fontSize: fontSize["2xl"], fontWeight: "700" },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: spacing.sm },
  sectionTitle: { fontSize: fontSize.lg, fontWeight: "600", marginTop: spacing.sm },
});
