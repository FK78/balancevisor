import { ScrollView, View, Text, TextInput, StyleSheet, Pressable, Alert, ActivityIndicator } from "react-native";
import { useState } from "react";
import { Stack, useRouter } from "expo-router";
import { useCategories, useCreateBudget } from "@/hooks/use-api";
import { useTheme } from "@/lib/theme-context";
import { spacing, fontSize, radius } from "@/constants/theme";
import type { Category } from "@/lib/shared/types";

const PERIODS = ["monthly", "weekly", "yearly"] as const;

export default function AddBudgetScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { data: rawCategories } = useCategories();
  const createBudget = useCreateBudget();

  const categories = ((rawCategories as Category[] | undefined) ?? []).filter((c) => c.type === "expense");

  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [amount, setAmount] = useState("");
  const [period, setPeriod] = useState<string>("monthly");

  const handleSubmit = async () => {
    if (!selectedCategoryId) return Alert.alert("Error", "Select a category");
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) return Alert.alert("Error", "Enter a valid amount");

    try {
      await createBudget.mutateAsync({ categoryId: selectedCategoryId, amount: parsedAmount, period });
      router.back();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to create budget";
      Alert.alert("Error", msg);
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: true, title: "Add Budget", headerStyle: { backgroundColor: colors.card }, headerTintColor: colors.foreground }} />
      <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={[styles.label, { color: colors.mutedForeground }]}>Category</Text>
        <View style={styles.chipRow}>
          {categories.map((c) => (
            <Pressable
              key={c.id}
              onPress={() => setSelectedCategoryId(c.id)}
              style={[styles.chip, { backgroundColor: selectedCategoryId === c.id ? c.color : colors.muted }]}
            >
              <Text style={{ color: selectedCategoryId === c.id ? "#fff" : colors.foreground, fontSize: fontSize.xs }}>{c.name}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={[styles.label, { color: colors.mutedForeground }]}>Amount</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.foreground }]}
          placeholder="e.g. 500"
          placeholderTextColor={colors.mutedForeground}
          value={amount}
          onChangeText={setAmount}
          keyboardType="decimal-pad"
        />

        <Text style={[styles.label, { color: colors.mutedForeground }]}>Period</Text>
        <View style={styles.chipRow}>
          {PERIODS.map((p) => (
            <Pressable key={p} onPress={() => setPeriod(p)} style={[styles.chip, { backgroundColor: period === p ? colors.primary : colors.muted }]}>
              <Text style={{ color: period === p ? colors.primaryForeground : colors.foreground, fontSize: fontSize.xs, textTransform: "capitalize" }}>{p}</Text>
            </Pressable>
          ))}
        </View>

        <Pressable
          onPress={handleSubmit}
          disabled={createBudget.isPending}
          style={({ pressed }) => [styles.submitBtn, { backgroundColor: colors.primary, opacity: pressed || createBudget.isPending ? 0.7 : 1 }]}
        >
          {createBudget.isPending ? (
            <ActivityIndicator color={colors.primaryForeground} />
          ) : (
            <Text style={{ color: colors.primaryForeground, fontWeight: "600", fontSize: fontSize.base }}>Create Budget</Text>
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
  chip: { paddingHorizontal: spacing.sm, paddingVertical: 6, borderRadius: radius.full },
  submitBtn: { borderRadius: radius.md, padding: spacing.md, alignItems: "center", marginTop: spacing.sm },
});
