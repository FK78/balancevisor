import { FlatList, View, Text, StyleSheet, ActivityIndicator, RefreshControl, Pressable } from "react-native";
import { useCallback, useState } from "react";
import { Stack, useRouter } from "expo-router";
import { CreditCard, Plus } from "lucide-react-native";
import { useDebts } from "@/hooks/use-api";
import { useTheme } from "@/lib/theme-context";
import { spacing, fontSize } from "@/constants/theme";
import { Card, ProgressBar, Badge, EmptyState } from "@/components/ui";
import { formatCurrency } from "@/lib/shared/formatCurrency";
import type { Debt } from "@/lib/shared/types";

export default function DebtsScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { data, isLoading, refetch } = useDebts();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const debts = (data as Debt[] | undefined) ?? [];
  const totalRemaining = debts.reduce((s, d) => s + d.remaining_amount, 0);

  if (isLoading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Stack.Screen options={{ headerShown: true, title: "Debts", headerStyle: { backgroundColor: colors.card }, headerTintColor: colors.foreground }} />
      <FlatList
        data={debts}
        keyExtractor={(item) => item.id}
        style={{ flex: 1, backgroundColor: colors.background }}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        ListHeaderComponent={
          debts.length > 0 ? (
            <Card style={{ marginBottom: spacing.sm }}>
              <Text style={[styles.label, { color: colors.mutedForeground }]}>Total Remaining</Text>
              <Text style={[styles.total, { color: colors.destructive }]}>
                {formatCurrency(totalRemaining)}
              </Text>
            </Card>
          ) : null
        }
        ListEmptyComponent={
          <EmptyState
            icon={<CreditCard size={40} color={colors.mutedForeground} />}
            title="No debts tracked"
            description="Add debts from the web app to track payoff progress"
          />
        }
        renderItem={({ item }) => {
          const paidPct = item.total_amount > 0 ? 1 - item.remaining_amount / item.total_amount : 0;
          return (
            <Pressable onPress={() => router.push(`/debt/${item.id}` as never)}>
              <Card style={{ gap: spacing.sm }}>
                <View style={styles.header}>
                  <Text style={[styles.name, { color: colors.foreground }]}>{item.name}</Text>
                  <Badge label={item.type.replace(/_/g, " ")} variant="muted" />
                </View>
                <ProgressBar value={paidPct} color={colors.success} />
                <View style={styles.header}>
                  <Text style={{ color: colors.mutedForeground, fontSize: fontSize.xs }}>
                    {formatCurrency(item.remaining_amount)} remaining
                  </Text>
                  <Text style={{ color: colors.foreground, fontSize: fontSize.xs }}>
                    {item.interest_rate}% APR
                  </Text>
                </View>
                {item.minimum_payment > 0 && (
                  <Text style={{ color: colors.mutedForeground, fontSize: fontSize.xs }}>
                    Min payment: {formatCurrency(item.minimum_payment)}/mo
                  </Text>
                )}
              </Card>
            </Pressable>
          );
        }}
      />
      <Pressable style={[styles.fab, { backgroundColor: colors.primary }]} onPress={() => router.push("/add-debt" as never)}>
        <Plus size={24} color={colors.primaryForeground} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  content: { padding: spacing.md, gap: spacing.md, paddingBottom: spacing.xl },
  label: { fontSize: fontSize.sm, marginBottom: 4 },
  total: { fontSize: fontSize["2xl"], fontWeight: "700" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  name: { fontSize: fontSize.base, fontWeight: "600", flex: 1, marginRight: spacing.sm },
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
