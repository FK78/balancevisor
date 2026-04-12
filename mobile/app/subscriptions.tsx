import { FlatList, View, Text, StyleSheet, ActivityIndicator, RefreshControl } from "react-native";
import { useCallback, useState } from "react";
import { Stack } from "expo-router";
import { Repeat } from "lucide-react-native";
import { useSubscriptions } from "@/hooks/use-api";
import { useTheme } from "@/lib/theme-context";
import { spacing, fontSize } from "@/constants/theme";
import { Card, Badge, EmptyState } from "@/components/ui";
import { formatCurrency } from "@/lib/shared/formatCurrency";
import type { Subscription } from "@/lib/shared/types";

export default function SubscriptionsScreen() {
  const { colors } = useTheme();
  const { data, isLoading, refetch } = useSubscriptions();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const subs = (data as Subscription[] | undefined) ?? [];
  const activeSubs = subs.filter((s) => s.is_active);
  const monthlyTotal = activeSubs.reduce((s, sub) => {
    const multiplier = sub.billing_cycle === "yearly" ? 1 / 12 : sub.billing_cycle === "weekly" ? 4.33 : sub.billing_cycle === "quarterly" ? 1 / 3 : 1;
    return s + sub.amount * multiplier;
  }, 0);

  if (isLoading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: true, title: "Subscriptions", headerStyle: { backgroundColor: colors.card }, headerTintColor: colors.foreground }} />
      <FlatList
        data={subs}
        keyExtractor={(item) => item.id}
        style={{ flex: 1, backgroundColor: colors.background }}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        ListHeaderComponent={
          subs.length > 0 ? (
            <Card style={{ marginBottom: spacing.sm }}>
              <Text style={[styles.label, { color: colors.mutedForeground }]}>Monthly Cost</Text>
              <Text style={[styles.total, { color: colors.foreground }]}>
                {formatCurrency(monthlyTotal)}/mo
              </Text>
              <Text style={{ color: colors.mutedForeground, fontSize: fontSize.xs }}>
                {activeSubs.length} active subscription{activeSubs.length !== 1 ? "s" : ""}
              </Text>
            </Card>
          ) : null
        }
        ListEmptyComponent={
          <EmptyState
            icon={<Repeat size={40} color={colors.mutedForeground} />}
            title="No subscriptions"
            description="Subscriptions are auto-detected from recurring transactions"
          />
        }
        renderItem={({ item }) => (
          <Card style={{ gap: 4 }}>
            <View style={styles.header}>
              <Text style={[styles.name, { color: colors.foreground }]}>{item.name}</Text>
              <Text style={[styles.amount, { color: colors.foreground }]}>
                {formatCurrency(item.amount)}/{item.billing_cycle === "yearly" ? "yr" : item.billing_cycle === "quarterly" ? "qtr" : item.billing_cycle === "weekly" ? "wk" : "mo"}
              </Text>
            </View>
            <View style={styles.header}>
              <Badge label={item.is_active ? "Active" : "Cancelled"} variant={item.is_active ? "success" : "muted"} />
              <Text style={{ color: colors.mutedForeground, fontSize: fontSize.xs }}>
                Next: {item.next_billing_date}
              </Text>
            </View>
          </Card>
        )}
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
  name: { fontSize: fontSize.base, fontWeight: "600", flex: 1 },
  amount: { fontSize: fontSize.base, fontWeight: "600" },
});
