import { FlatList, View, Text, StyleSheet, ActivityIndicator, RefreshControl, Pressable, Alert } from "react-native";
import { useCallback, useState } from "react";
import { Stack, useLocalSearchParams } from "expo-router";
import { CreditCard, Plus } from "lucide-react-native";
import { useDebts, useDebtPayments, useCreateDebtPayment, useDeleteDebt } from "@/hooks/use-api";
import { useTheme } from "@/lib/theme-context";
import { spacing, fontSize, radius } from "@/constants/theme";
import { Card, ProgressBar, EmptyState } from "@/components/ui";
import { formatCurrency } from "@/lib/shared/formatCurrency";
import { formatDayLabel } from "@/lib/shared/date";
import type { Debt } from "@/lib/shared/types";
import { useRouter } from "expo-router";

interface DebtPayment {
  id: string;
  amount: number;
  date: string;
  note?: string;
}

function RecordPaymentButton({ debtId, colors }: { debtId: string; colors: Record<string, string> }) {
  const createPayment = useCreateDebtPayment(debtId);

  const handleRecord = () => {
    Alert.prompt(
      "Record Payment",
      "Enter the payment amount",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Record",
          onPress: (value?: string) => {
            const amount = parseFloat(value ?? "");
            if (isNaN(amount) || amount <= 0) return Alert.alert("Error", "Enter a valid amount");
            createPayment.mutate({ amount, date: new Date().toISOString().split("T")[0] });
          },
        },
      ],
      "plain-text",
      "",
      "decimal-pad",
    );
  };

  return (
    <Pressable onPress={handleRecord} style={[styles.payBtn, { backgroundColor: colors.primary }]}>
      <Plus size={14} color={colors.primaryForeground} />
      <Text style={{ color: colors.primaryForeground, fontSize: fontSize.xs, fontWeight: "600" }}>Payment</Text>
    </Pressable>
  );
}

export default function DebtDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();
  const router = useRouter();
  const { data: rawDebts } = useDebts();
  const { data: rawPayments, isLoading, refetch } = useDebtPayments(id ?? "");
  const deleteMut = useDeleteDebt(id ?? "");
  const [refreshing, setRefreshing] = useState(false);

  const debts = (rawDebts as Debt[] | undefined) ?? [];
  const debt = debts.find((d) => d.id === id);
  const payments = (rawPayments as DebtPayment[] | undefined) ?? [];

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const handleDelete = () => {
    Alert.alert("Delete Debt", `Delete "${debt?.name}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await deleteMut.mutateAsync(undefined as never);
          router.back();
        },
      },
    ]);
  };

  if (isLoading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const paidPct = debt && debt.total_amount > 0 ? 1 - debt.remaining_amount / debt.total_amount : 0;

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: debt?.name ?? "Debt",
          headerStyle: { backgroundColor: colors.card },
          headerTintColor: colors.foreground,
          headerRight: () => (
            <Pressable onPress={handleDelete} style={{ paddingHorizontal: spacing.sm }}>
              <Text style={{ color: colors.destructive, fontSize: fontSize.sm }}>Delete</Text>
            </Pressable>
          ),
        }}
      />
      <FlatList
        data={payments}
        keyExtractor={(item) => item.id}
        style={{ flex: 1, backgroundColor: colors.background }}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        ListHeaderComponent={
          debt ? (
            <Card style={{ gap: spacing.sm, marginBottom: spacing.sm }}>
              <View style={styles.row}>
                <Text style={[styles.label, { color: colors.mutedForeground }]}>{debt.type.replace(/_/g, " ")}</Text>
                <RecordPaymentButton debtId={debt.id} colors={colors} />
              </View>
              <Text style={[styles.total, { color: colors.foreground }]}>
                {formatCurrency(debt.remaining_amount)} remaining
              </Text>
              <ProgressBar value={paidPct} color={colors.success} />
              <View style={styles.row}>
                <Text style={{ color: colors.mutedForeground, fontSize: fontSize.xs }}>
                  {formatCurrency(debt.total_amount)} total
                </Text>
                <Text style={{ color: colors.foreground, fontSize: fontSize.xs }}>
                  {debt.interest_rate}% APR · {formatCurrency(debt.minimum_payment)}/mo min
                </Text>
              </View>
            </Card>
          ) : null
        }
        ListEmptyComponent={
          <EmptyState
            icon={<CreditCard size={40} color={colors.mutedForeground} />}
            title="No payments recorded"
            description="Record payments to track your payoff progress"
          />
        }
        renderItem={({ item }) => (
          <Card>
            <View style={styles.row}>
              <Text style={{ color: colors.success, fontWeight: "600", fontSize: fontSize.base }}>
                -{formatCurrency(item.amount)}
              </Text>
              <Text style={{ color: colors.mutedForeground, fontSize: fontSize.xs }}>
                {formatDayLabel(item.date)}
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
  content: { padding: spacing.md, gap: spacing.sm, paddingBottom: spacing.xl },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  label: { fontSize: fontSize.sm, textTransform: "capitalize" },
  total: { fontSize: fontSize.xl, fontWeight: "700" },
  payBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
});
