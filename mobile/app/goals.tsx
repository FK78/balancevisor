import { FlatList, View, Text, StyleSheet, ActivityIndicator, RefreshControl, Pressable, Alert } from "react-native";
import { useCallback, useState } from "react";
import { Stack, useRouter } from "expo-router";
import { Target, Plus } from "lucide-react-native";
import { useGoals, useContributeToGoal } from "@/hooks/use-api";
import { useTheme } from "@/lib/theme-context";
import { spacing, fontSize, radius } from "@/constants/theme";
import { Card, ProgressBar, EmptyState } from "@/components/ui";
import { formatCurrency } from "@/lib/shared/formatCurrency";
import type { Goal } from "@/lib/shared/types";

function ContributeButton({ goalId, colors }: { goalId: string; colors: Record<string, string> }) {
  const contribute = useContributeToGoal(goalId);

  const handleContribute = () => {
    Alert.prompt(
      "Contribute",
      "Enter amount to add to this goal",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Add",
          onPress: (value?: string) => {
            const amount = parseFloat(value ?? "");
            if (isNaN(amount) || amount <= 0) return Alert.alert("Error", "Enter a valid amount");
            contribute.mutate({ amount });
          },
        },
      ],
      "plain-text",
      "",
      "decimal-pad",
    );
  };

  return (
    <Pressable
      onPress={handleContribute}
      style={[styles.contributeBtn, { backgroundColor: colors.primary }]}
    >
      <Plus size={14} color={colors.primaryForeground} />
      <Text style={{ color: colors.primaryForeground, fontSize: fontSize.xs, fontWeight: "600" }}>Add</Text>
    </Pressable>
  );
}

export default function GoalsScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { data, isLoading, refetch } = useGoals();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const goals = (data as Goal[] | undefined) ?? [];

  if (isLoading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Stack.Screen options={{ headerShown: true, title: "Goals", headerStyle: { backgroundColor: colors.card }, headerTintColor: colors.foreground }} />
      <FlatList
        data={goals}
        keyExtractor={(item) => item.id}
        style={{ flex: 1, backgroundColor: colors.background }}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        ListEmptyComponent={
          <EmptyState
            icon={<Target size={40} color={colors.mutedForeground} />}
            title="No goals yet"
            description="Set savings goals from the web app"
          />
        }
        renderItem={({ item }) => {
          const pct = item.target_amount > 0 ? item.saved_amount / item.target_amount : 0;
          return (
            <Card style={{ gap: spacing.sm }}>
              <View style={styles.header}>
                <Text style={[styles.name, { color: colors.foreground }]}>{item.name}</Text>
                <ContributeButton goalId={item.id} colors={colors} />
              </View>
              <ProgressBar value={pct} color={item.color} />
              <View style={styles.header}>
                <Text style={{ color: colors.mutedForeground, fontSize: fontSize.xs }}>
                  {formatCurrency(item.saved_amount)} saved
                </Text>
                <Text style={{ color: colors.foreground, fontSize: fontSize.xs, fontWeight: "600" }}>
                  {formatCurrency(item.target_amount)} target · {Math.round(pct * 100)}%
                </Text>
              </View>
              {item.target_date && (
                <Text style={{ color: colors.mutedForeground, fontSize: fontSize.xs }}>
                  Target: {item.target_date}
                </Text>
              )}
            </Card>
          );
        }}
      />
      <Pressable style={[styles.fab, { backgroundColor: colors.primary }]} onPress={() => router.push("/add-goal" as never)}>
        <Plus size={24} color={colors.primaryForeground} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  content: { padding: spacing.md, gap: spacing.md, paddingBottom: spacing.xl },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  name: { fontSize: fontSize.base, fontWeight: "600", flex: 1 },
  contributeBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
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
