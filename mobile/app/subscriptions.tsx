import { FlatList, View, Text, StyleSheet, ActivityIndicator, RefreshControl, Pressable, Alert } from "react-native";
import { useCallback, useState } from "react";
import { Stack } from "expo-router";
import { Repeat } from "lucide-react-native";
import { useSubscriptions, useUpdateSubscription, useDeleteSubscription } from "@/hooks/use-api";
import { useTheme } from "@/lib/theme-context";
import { spacing, fontSize, radius } from "@/constants/theme";
import { Card, Badge, EmptyState } from "@/components/ui";
import { formatCurrency } from "@/lib/shared/formatCurrency";
import type { Subscription } from "@/lib/shared/types";

function SubscriptionActions({ sub, colors }: { sub: Subscription; colors: Record<string, string> }) {
  const toggleMut = useUpdateSubscription(sub.id);
  const deleteMut = useDeleteSubscription(sub.id);

  const handleToggle = () => {
    const action = sub.is_active ? "Cancel" : "Reactivate";
    Alert.alert(action, `${action} "${sub.name}"?`, [
      { text: "No", style: "cancel" },
      { text: action, onPress: () => toggleMut.mutate({ is_active: !sub.is_active }) },
    ]);
  };

  const handleDelete = () => {
    Alert.alert("Delete", `Delete "${sub.name}" permanently?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => deleteMut.mutate(undefined as never) },
    ]);
  };

  return (
    <View style={styles.actionRow}>
      <Pressable onPress={handleToggle} style={[styles.actionBtn, { backgroundColor: sub.is_active ? colors.destructive : colors.success }]}>
        <Text style={{ color: "#fff", fontSize: fontSize.xs, fontWeight: "600" }}>
          {sub.is_active ? "Cancel" : "Reactivate"}
        </Text>
      </Pressable>
      <Pressable onPress={handleDelete} style={[styles.actionBtn, { backgroundColor: colors.muted }]}>
        <Text style={{ color: colors.foreground, fontSize: fontSize.xs }}>Delete</Text>
      </Pressable>
    </View>
  );
}

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
  const cancelledSubs = subs.filter((s) => !s.is_active);
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

  const allSections = [...activeSubs, ...cancelledSubs];

  return (
    <>
      <Stack.Screen options={{ headerShown: true, title: "Subscriptions", headerStyle: { backgroundColor: colors.card }, headerTintColor: colors.foreground }} />
      <FlatList
        data={allSections}
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
                {activeSubs.length} active · {cancelledSubs.length} cancelled
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
          <Card style={{ gap: spacing.xs, opacity: item.is_active ? 1 : 0.6 }}>
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
            <SubscriptionActions sub={item} colors={colors} />
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
  actionRow: { flexDirection: "row", gap: spacing.sm, marginTop: spacing.xs },
  actionBtn: { paddingHorizontal: spacing.sm, paddingVertical: 4, borderRadius: radius.full },
});
