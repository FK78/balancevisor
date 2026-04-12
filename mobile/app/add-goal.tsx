import { ScrollView, View, Text, TextInput, StyleSheet, Pressable, Alert, ActivityIndicator } from "react-native";
import { useState } from "react";
import { Stack, useRouter } from "expo-router";
import { useCreateGoal } from "@/hooks/use-api";
import { useTheme } from "@/lib/theme-context";
import { spacing, fontSize, radius } from "@/constants/theme";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4", "#64748b"];
const ICONS = ["🎯", "🏠", "✈️", "🚗", "💰", "📚", "🎉", "🔧"];

export default function AddGoalScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const createGoal = useCreateGoal();

  const [name, setName] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [icon, setIcon] = useState(ICONS[0]);
  const [color, setColor] = useState(COLORS[0]);

  const handleSubmit = async () => {
    if (!name.trim()) return Alert.alert("Error", "Enter a goal name");
    const amount = parseFloat(targetAmount);
    if (isNaN(amount) || amount <= 0) return Alert.alert("Error", "Enter a valid target amount");

    try {
      await createGoal.mutateAsync({
        name: name.trim(),
        target_amount: amount,
        target_date: targetDate || undefined,
        icon,
        color,
      });
      router.back();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to create goal";
      Alert.alert("Error", msg);
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: true, title: "Add Goal", headerStyle: { backgroundColor: colors.card }, headerTintColor: colors.foreground }} />
      <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={[styles.label, { color: colors.mutedForeground }]}>Name</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.foreground }]}
          placeholder="e.g. Emergency Fund"
          placeholderTextColor={colors.mutedForeground}
          value={name}
          onChangeText={setName}
        />

        <Text style={[styles.label, { color: colors.mutedForeground }]}>Target Amount</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.foreground }]}
          placeholder="e.g. 10000"
          placeholderTextColor={colors.mutedForeground}
          value={targetAmount}
          onChangeText={setTargetAmount}
          keyboardType="decimal-pad"
        />

        <Text style={[styles.label, { color: colors.mutedForeground }]}>Target Date (optional, YYYY-MM-DD)</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.foreground }]}
          placeholder="e.g. 2025-12-31"
          placeholderTextColor={colors.mutedForeground}
          value={targetDate}
          onChangeText={setTargetDate}
        />

        <Text style={[styles.label, { color: colors.mutedForeground }]}>Icon</Text>
        <View style={styles.chipRow}>
          {ICONS.map((i) => (
            <Pressable key={i} onPress={() => setIcon(i)} style={[styles.iconChip, { backgroundColor: icon === i ? colors.primary : colors.muted }]}>
              <Text style={{ fontSize: 20 }}>{i}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={[styles.label, { color: colors.mutedForeground }]}>Colour</Text>
        <View style={styles.colorRow}>
          {COLORS.map((c) => (
            <Pressable key={c} onPress={() => setColor(c)} style={[styles.colorDot, { backgroundColor: c, borderWidth: color === c ? 3 : 0, borderColor: colors.foreground }]} />
          ))}
        </View>

        <Pressable
          onPress={handleSubmit}
          disabled={createGoal.isPending}
          style={({ pressed }) => [styles.submitBtn, { backgroundColor: colors.primary, opacity: pressed || createGoal.isPending ? 0.7 : 1 }]}
        >
          {createGoal.isPending ? (
            <ActivityIndicator color={colors.primaryForeground} />
          ) : (
            <Text style={{ color: colors.primaryForeground, fontWeight: "600", fontSize: fontSize.base }}>Create Goal</Text>
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
  iconChip: { width: 44, height: 44, borderRadius: radius.md, alignItems: "center", justifyContent: "center" },
  colorRow: { flexDirection: "row", gap: spacing.sm },
  colorDot: { width: 32, height: 32, borderRadius: 16 },
  submitBtn: { borderRadius: radius.md, padding: spacing.md, alignItems: "center", marginTop: spacing.sm },
});
