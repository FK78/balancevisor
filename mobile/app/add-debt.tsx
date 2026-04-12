import { ScrollView, View, Text, TextInput, StyleSheet, Pressable, Alert, ActivityIndicator } from "react-native";
import { useState } from "react";
import { Stack, useRouter } from "expo-router";
import { useCreateDebt } from "@/hooks/use-api";
import { useTheme } from "@/lib/theme-context";
import { spacing, fontSize, radius } from "@/constants/theme";

const DEBT_TYPES = ["credit_card", "personal_loan", "student_loan", "mortgage", "car_loan", "other"] as const;

export default function AddDebtScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const createDebt = useCreateDebt();

  const [name, setName] = useState("");
  const [type, setType] = useState<string>("credit_card");
  const [totalAmount, setTotalAmount] = useState("");
  const [remainingAmount, setRemainingAmount] = useState("");
  const [interestRate, setInterestRate] = useState("");
  const [minimumPayment, setMinimumPayment] = useState("");
  const [lender, setLender] = useState("");

  const handleSubmit = async () => {
    if (!name.trim()) return Alert.alert("Error", "Enter a debt name");
    const total = parseFloat(totalAmount);
    if (isNaN(total) || total <= 0) return Alert.alert("Error", "Enter a valid total amount");

    try {
      await createDebt.mutateAsync({
        name: name.trim(),
        type,
        total_amount: total,
        remaining_amount: parseFloat(remainingAmount) || total,
        interest_rate: parseFloat(interestRate) || 0,
        minimum_payment: parseFloat(minimumPayment) || 0,
        lender: lender.trim() || "Unknown",
      });
      router.back();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to create debt";
      Alert.alert("Error", msg);
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: true, title: "Add Debt", headerStyle: { backgroundColor: colors.card }, headerTintColor: colors.foreground }} />
      <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={[styles.label, { color: colors.mutedForeground }]}>Name</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.foreground }]}
          placeholder="e.g. Credit Card"
          placeholderTextColor={colors.mutedForeground}
          value={name}
          onChangeText={setName}
        />

        <Text style={[styles.label, { color: colors.mutedForeground }]}>Type</Text>
        <View style={styles.chipRow}>
          {DEBT_TYPES.map((t) => (
            <Pressable key={t} onPress={() => setType(t)} style={[styles.chip, { backgroundColor: type === t ? colors.primary : colors.muted }]}>
              <Text style={{ color: type === t ? colors.primaryForeground : colors.foreground, fontSize: fontSize.xs }}>{t.replace(/_/g, " ")}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={[styles.label, { color: colors.mutedForeground }]}>Total Amount</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.foreground }]}
          placeholder="e.g. 5000"
          placeholderTextColor={colors.mutedForeground}
          value={totalAmount}
          onChangeText={setTotalAmount}
          keyboardType="decimal-pad"
        />

        <Text style={[styles.label, { color: colors.mutedForeground }]}>Remaining Amount</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.foreground }]}
          placeholder="Same as total if not specified"
          placeholderTextColor={colors.mutedForeground}
          value={remainingAmount}
          onChangeText={setRemainingAmount}
          keyboardType="decimal-pad"
        />

        <Text style={[styles.label, { color: colors.mutedForeground }]}>Interest Rate (%)</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.foreground }]}
          placeholder="e.g. 19.9"
          placeholderTextColor={colors.mutedForeground}
          value={interestRate}
          onChangeText={setInterestRate}
          keyboardType="decimal-pad"
        />

        <Text style={[styles.label, { color: colors.mutedForeground }]}>Minimum Payment / Month</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.foreground }]}
          placeholder="e.g. 100"
          placeholderTextColor={colors.mutedForeground}
          value={minimumPayment}
          onChangeText={setMinimumPayment}
          keyboardType="decimal-pad"
        />

        <Text style={[styles.label, { color: colors.mutedForeground }]}>Lender</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.foreground }]}
          placeholder="e.g. Barclays"
          placeholderTextColor={colors.mutedForeground}
          value={lender}
          onChangeText={setLender}
        />

        <Pressable
          onPress={handleSubmit}
          disabled={createDebt.isPending}
          style={({ pressed }) => [styles.submitBtn, { backgroundColor: colors.primary, opacity: pressed || createDebt.isPending ? 0.7 : 1 }]}
        >
          {createDebt.isPending ? (
            <ActivityIndicator color={colors.primaryForeground} />
          ) : (
            <Text style={{ color: colors.primaryForeground, fontWeight: "600", fontSize: fontSize.base }}>Create Debt</Text>
          )}
        </Pressable>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.md, gap: spacing.md, paddingBottom: spacing.xl },
  label: { fontSize: fontSize.sm, fontWeight: "500" },
  input: { borderRadius: radius.md, borderWidth: 1, padding: spacing.md, fontSize: fontSize.base },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.xs },
  chip: { paddingHorizontal: spacing.sm, paddingVertical: 6, borderRadius: radius.full, textTransform: "capitalize" },
  submitBtn: { borderRadius: radius.md, padding: spacing.md, alignItems: "center", marginTop: spacing.sm },
});
