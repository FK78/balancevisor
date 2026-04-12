import { FlatList, View, Text, StyleSheet, ActivityIndicator, RefreshControl } from "react-native";
import { useCallback, useState } from "react";
import { Stack, useLocalSearchParams } from "expo-router";
import { useAccounts, useTransactions } from "@/hooks/use-api";
import { useTheme } from "@/lib/theme-context";
import { spacing, fontSize } from "@/constants/theme";
import { Card, ListItem, EmptyState } from "@/components/ui";
import { formatCurrency } from "@/lib/shared/formatCurrency";
import { formatDayLabel } from "@/lib/shared/date";
import type { Account, Transaction } from "@/lib/shared/types";
import { Wallet } from "lucide-react-native";

export default function AccountDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();
  const { data: rawAccounts } = useAccounts();
  const { data: rawTxns, isLoading, refetch } = useTransactions(1, 100);
  const [refreshing, setRefreshing] = useState(false);

  const accounts = (rawAccounts as Account[] | undefined) ?? [];
  const account = accounts.find((a) => a.id === id);
  const allTxns = (rawTxns as Transaction[] | undefined) ?? [];
  const accountTxns = allTxns.filter((t) => t.accountId === id);

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

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: account?.name ?? "Account",
          headerStyle: { backgroundColor: colors.card },
          headerTintColor: colors.foreground,
        }}
      />
      <FlatList
        data={accountTxns}
        keyExtractor={(item) => item.id}
        style={{ flex: 1, backgroundColor: colors.background }}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        ListHeaderComponent={
          account ? (
            <Card style={{ marginBottom: spacing.sm }}>
              <Text style={[styles.label, { color: colors.mutedForeground }]}>{account.type} · {account.institution}</Text>
              <Text style={[styles.balance, { color: colors.foreground }]}>
                {formatCurrency(account.balance, account.currency)}
              </Text>
              {account.lastSynced && (
                <Text style={{ color: colors.mutedForeground, fontSize: fontSize.xs }}>
                  Last synced: {formatDayLabel(account.lastSynced)}
                </Text>
              )}
            </Card>
          ) : null
        }
        ListEmptyComponent={
          <EmptyState
            icon={<Wallet size={40} color={colors.mutedForeground} />}
            title="No transactions"
            description="No transactions found for this account"
          />
        }
        renderItem={({ item }) => {
          const isIncome = item.type === "income";
          const sign = isIncome ? "+" : "-";
          return (
            <ListItem
              title={item.description || item.merchant || "Transaction"}
              subtitle={`${item.categoryName ?? "Uncategorised"} · ${formatDayLabel(item.date)}`}
              right={
                <Text style={{ color: isIncome ? colors.success : colors.destructive, fontWeight: "600", fontSize: fontSize.base }}>
                  {sign}{formatCurrency(Math.abs(item.amount), account?.currency)}
                </Text>
              }
            />
          );
        }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  content: { padding: spacing.md, gap: spacing.sm, paddingBottom: spacing.xl },
  label: { fontSize: fontSize.sm, marginBottom: 4, textTransform: "capitalize" },
  balance: { fontSize: fontSize["2xl"], fontWeight: "700" },
});
