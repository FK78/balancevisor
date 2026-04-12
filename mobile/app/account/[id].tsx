import { FlatList, View, Text, StyleSheet, ActivityIndicator, RefreshControl, Pressable, Alert } from "react-native";
import { useCallback, useState } from "react";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useAccounts, useTransactions, useDeleteAccount, useDeleteTransaction } from "@/hooks/use-api";
import { useTheme } from "@/lib/theme-context";
import { spacing, fontSize } from "@/constants/theme";
import { Card, ListItem, EmptyState } from "@/components/ui";
import { formatCurrency } from "@/lib/shared/formatCurrency";
import { formatDayLabel } from "@/lib/shared/date";
import type { Account, Transaction } from "@/lib/shared/types";
import { Wallet } from "lucide-react-native";

function DeleteTransactionButton({ txn, colors }: { txn: Transaction; colors: Record<string, string> }) {
  const deleteMut = useDeleteTransaction(txn.id);
  return (
    <Pressable
      onPress={() => {
        Alert.alert("Delete", "Delete this transaction?", [
          { text: "Cancel", style: "cancel" },
          { text: "Delete", style: "destructive", onPress: () => deleteMut.mutate(undefined as never) },
        ]);
      }}
    >
      <Text style={{ color: colors.destructive, fontSize: fontSize.xs }}>Delete</Text>
    </Pressable>
  );
}

export default function AccountDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();
  const router = useRouter();
  const { data: rawAccounts } = useAccounts();
  const { data: rawTxns, isLoading, refetch } = useTransactions(1, 100);
  const deleteAccountMut = useDeleteAccount(id ?? "");
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
          headerRight: () => (
            <Pressable
              onPress={() => {
                Alert.alert("Delete Account", `Delete "${account?.name}"? All associated data will be removed.`, [
                  { text: "Cancel", style: "cancel" },
                  {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                      await deleteAccountMut.mutateAsync(undefined as never);
                      router.back();
                    },
                  },
                ]);
              }}
              style={{ paddingHorizontal: spacing.sm }}
            >
              <Text style={{ color: colors.destructive, fontSize: fontSize.sm }}>Delete</Text>
            </Pressable>
          ),
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
            <View style={styles.txnRow}>
              <View style={{ flex: 1 }}>
                <ListItem
                  title={item.description || item.merchant || "Transaction"}
                  subtitle={`${item.categoryName ?? "Uncategorised"} · ${formatDayLabel(item.date)}`}
                  right={
                    <Text style={{ color: isIncome ? colors.success : colors.destructive, fontWeight: "600", fontSize: fontSize.base }}>
                      {sign}{formatCurrency(Math.abs(item.amount), account?.currency)}
                    </Text>
                  }
                />
              </View>
              <DeleteTransactionButton txn={item} colors={colors} />
            </View>
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
  txnRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
});
