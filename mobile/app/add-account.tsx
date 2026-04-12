import { ScrollView, View, Text, TextInput, StyleSheet, Pressable, Alert, ActivityIndicator } from "react-native";
import { useState } from "react";
import { Stack, useRouter } from "expo-router";
import { useCreateAccount, useCategories } from "@/hooks/use-api";
import { useTheme } from "@/lib/theme-context";
import { spacing, fontSize, radius } from "@/constants/theme";

const ACCOUNT_TYPES = ["current", "savings", "credit", "investment", "cash", "mortgage", "loan", "other"] as const;
const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4", "#64748b"];

export default function AddAccountScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const createAccount = useCreateAccount();

  const [name, setName] = useState("");
  const [type, setType] = useState<string>("current");
  const [balance, setBalance] = useState("");
  const [institution, setInstitution] = useState("");
  const [color, setColor] = useState(COLORS[0]);

  const handleSubmit = async () => {
    if (!name.trim()) return Alert.alert("Error", "Enter an account name");
    const parsedBalance = parseFloat(balance || "0");

    try {
      await createAccount.mutateAsync({
        name: name.trim(),
        type,
        balance: parsedBalance,
        currency: "GBP",
        institution: institution.trim() || "Manual",
        color,
      });
      router.back();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to create account";
      Alert.alert("Error", msg);
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: true, title: "Add Account", headerStyle: { backgroundColor: colors.card }, headerTintColor: colors.foreground }} />
      <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={[styles.label, { color: colors.mutedForeground }]}>Name</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.foreground }]}
          placeholder="e.g. Main Current Account"
          placeholderTextColor={colors.mutedForeground}
          value={name}
          onChangeText={setName}
        />

        <Text style={[styles.label, { color: colors.mutedForeground }]}>Type</Text>
        <View style={styles.chipRow}>
          {ACCOUNT_TYPES.map((t) => (
            <Pressable key={t} onPress={() => setType(t)} style={[styles.chip, { backgroundColor: type === t ? colors.primary : colors.muted }]}>
              <Text style={{ color: type === t ? colors.primaryForeground : colors.foreground, fontSize: fontSize.xs, textTransform: "capitalize" }}>{t}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={[styles.label, { color: colors.mutedForeground }]}>Opening Balance</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.foreground }]}
          placeholder="0.00"
          placeholderTextColor={colors.mutedForeground}
          value={balance}
          onChangeText={setBalance}
          keyboardType="decimal-pad"
        />

        <Text style={[styles.label, { color: colors.mutedForeground }]}>Institution</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.foreground }]}
          placeholder="e.g. Barclays"
          placeholderTextColor={colors.mutedForeground}
          value={institution}
          onChangeText={setInstitution}
        />

        <Text style={[styles.label, { color: colors.mutedForeground }]}>Colour</Text>
        <View style={styles.colorRow}>
          {COLORS.map((c) => (
            <Pressable
              key={c}
              onPress={() => setColor(c)}
              style={[styles.colorDot, { backgroundColor: c, borderWidth: color === c ? 3 : 0, borderColor: colors.foreground }]}
            />
          ))}
        </View>

        <Pressable
          onPress={handleSubmit}
          disabled={createAccount.isPending}
          style={({ pressed }) => [styles.submitBtn, { backgroundColor: colors.primary, opacity: pressed || createAccount.isPending ? 0.7 : 1 }]}
        >
          {createAccount.isPending ? (
            <ActivityIndicator color={colors.primaryForeground} />
          ) : (
            <Text style={{ color: colors.primaryForeground, fontWeight: "600", fontSize: fontSize.base }}>Create Account</Text>
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
  colorRow: { flexDirection: "row", gap: spacing.sm },
  colorDot: { width: 32, height: 32, borderRadius: 16 },
  submitBtn: { borderRadius: radius.md, padding: spacing.md, alignItems: "center", marginTop: spacing.sm },
});
