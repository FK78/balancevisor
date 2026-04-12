import { useState } from "react";
import { View, Text, TextInput, StyleSheet, Pressable, Alert, ScrollView, ActivityIndicator } from "react-native";
import { useTheme } from "@/lib/theme-context";
import { spacing, fontSize, radius } from "@/constants/theme";
import { useAccounts, useCategories, useCreateTransaction } from "@/hooks/use-api";
import { useQueryClient } from "@tanstack/react-query";
import type { Account, Category } from "@/lib/shared/types";

interface Props {
  visible: boolean;
  onClose: () => void;
}

type TxType = "expense" | "income";

export function AddTransactionSheet({ visible, onClose }: Props) {
  const { colors } = useTheme();
  const { data: rawAccounts } = useAccounts();
  const { data: rawCategories } = useCategories();
  const createTx = useCreateTransaction();
  const qc = useQueryClient();

  const accounts = (rawAccounts as Account[] | undefined) ?? [];
  const categories = (rawCategories as Category[] | undefined) ?? [];

  const [type, setType] = useState<TxType>("expense");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  const filteredCategories = categories.filter((c) => c.type === type);

  const handleSubmit = async () => {
    const parsedAmount = parseFloat(amount);
    if (!description.trim()) return Alert.alert("Error", "Enter a description");
    if (isNaN(parsedAmount) || parsedAmount <= 0) return Alert.alert("Error", "Enter a valid amount");
    if (!selectedAccountId) return Alert.alert("Error", "Select an account");

    try {
      await createTx.mutateAsync({
        accountId: selectedAccountId,
        description: description.trim(),
        amount: parsedAmount,
        type,
        date: new Date().toISOString().split("T")[0],
        categoryId: selectedCategoryId ?? undefined,
      });
      qc.invalidateQueries({ queryKey: ["transactions"] });
      resetAndClose();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to add transaction";
      Alert.alert("Error", msg);
    }
  };

  const resetAndClose = () => {
    setDescription("");
    setAmount("");
    setSelectedAccountId(null);
    setSelectedCategoryId(null);
    setType("expense");
    onClose();
  };

  if (!visible) return null;

  return (
    <View style={[styles.overlay]}>
      <Pressable style={styles.backdrop} onPress={resetAndClose} />
      <View style={[styles.sheet, { backgroundColor: colors.card }]}>
        <View style={styles.handle} />
        <Text style={[styles.title, { color: colors.foreground }]}>Add Transaction</Text>

        <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
          {/* Type toggle */}
          <View style={styles.typeRow}>
            {(["expense", "income"] as const).map((t) => (
              <Pressable
                key={t}
                onPress={() => setType(t)}
                style={[styles.typeBtn, { backgroundColor: type === t ? (t === "income" ? colors.success : colors.destructive) : colors.muted }]}
              >
                <Text style={{ color: type === t ? "#fff" : colors.foreground, fontWeight: "600", fontSize: fontSize.sm, textTransform: "capitalize" }}>
                  {t}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Description */}
          <TextInput
            style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.foreground }]}
            placeholder="Description"
            placeholderTextColor={colors.mutedForeground}
            value={description}
            onChangeText={setDescription}
          />

          {/* Amount */}
          <TextInput
            style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.foreground }]}
            placeholder="Amount"
            placeholderTextColor={colors.mutedForeground}
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
          />

          {/* Account picker */}
          <Text style={[styles.label, { color: colors.mutedForeground }]}>Account</Text>
          <View style={styles.chipRow}>
            {accounts.map((a) => (
              <Pressable
                key={a.id}
                onPress={() => setSelectedAccountId(a.id)}
                style={[styles.chip, { backgroundColor: selectedAccountId === a.id ? colors.primary : colors.muted }]}
              >
                <Text style={{ color: selectedAccountId === a.id ? colors.primaryForeground : colors.foreground, fontSize: fontSize.xs }}>
                  {a.name}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Category picker */}
          <Text style={[styles.label, { color: colors.mutedForeground }]}>Category</Text>
          <View style={styles.chipRow}>
            {filteredCategories.map((c) => (
              <Pressable
                key={c.id}
                onPress={() => setSelectedCategoryId(c.id)}
                style={[styles.chip, { backgroundColor: selectedCategoryId === c.id ? c.color : colors.muted }]}
              >
                <Text style={{ color: selectedCategoryId === c.id ? "#fff" : colors.foreground, fontSize: fontSize.xs }}>
                  {c.name}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Submit */}
          <Pressable
            onPress={handleSubmit}
            disabled={createTx.isPending}
            style={({ pressed }) => [styles.submitBtn, { backgroundColor: colors.primary, opacity: pressed || createTx.isPending ? 0.7 : 1 }]}
          >
            {createTx.isPending ? (
              <ActivityIndicator color={colors.primaryForeground} />
            ) : (
              <Text style={{ color: colors.primaryForeground, fontWeight: "600", fontSize: fontSize.base }}>Add Transaction</Text>
            )}
          </Pressable>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, zIndex: 100, justifyContent: "flex-end" },
  backdrop: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.4)" },
  sheet: { borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingBottom: 40, maxHeight: "85%" },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: "#ccc", alignSelf: "center", marginTop: spacing.sm },
  title: { fontSize: fontSize.lg, fontWeight: "700", textAlign: "center", marginVertical: spacing.md },
  form: { paddingHorizontal: spacing.md, gap: spacing.md, paddingBottom: spacing.xl },
  typeRow: { flexDirection: "row", gap: spacing.sm },
  typeBtn: { flex: 1, paddingVertical: spacing.sm, borderRadius: radius.md, alignItems: "center" },
  input: { borderRadius: radius.md, borderWidth: 1, padding: spacing.md, fontSize: fontSize.base },
  label: { fontSize: fontSize.sm, fontWeight: "500" },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.xs },
  chip: { paddingHorizontal: spacing.sm, paddingVertical: 6, borderRadius: radius.full },
  submitBtn: { borderRadius: radius.md, padding: spacing.md, alignItems: "center", marginTop: spacing.sm },
});
