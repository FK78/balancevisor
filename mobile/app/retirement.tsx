import { ScrollView, View, Text, StyleSheet, ActivityIndicator, RefreshControl } from "react-native";
import { useCallback, useState } from "react";
import { Stack } from "expo-router";
import { Timer } from "lucide-react-native";
import { useRetirement } from "@/hooks/use-api";
import { useTheme } from "@/lib/theme-context";
import { spacing, fontSize } from "@/constants/theme";
import { Card, Badge, ProgressBar, EmptyState } from "@/components/ui";
import { formatCurrency } from "@/lib/shared/formatCurrency";

interface RetirementData {
  profile: {
    current_age: number;
    target_retirement_age: number;
    life_expectancy: number;
    desired_annual_spending: number;
    expected_pension_annual: number;
    expected_investment_return: number;
    inflation_rate: number;
  };
  projection?: {
    estimatedRetirementAge: number;
    canRetireOnTarget: boolean;
    requiredFundAtTarget: number;
    projectedFundAtTarget: number;
    fundGap: number;
    fundProgress: number;
    monthlySavings: number;
    savingsRate: number;
    scenarios: Array<{
      label: string;
      description: string;
      estimatedRetirementAge: number;
    }>;
  };
}

export default function RetirementScreen() {
  const { colors } = useTheme();
  const { data, isLoading, refetch } = useRetirement();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const ret = data as RetirementData | undefined;
  const projection = ret?.projection;

  if (isLoading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!ret?.profile) {
    return (
      <>
        <Stack.Screen options={{ headerShown: true, title: "Retirement", headerStyle: { backgroundColor: colors.card }, headerTintColor: colors.foreground }} />
        <View style={[styles.center, { backgroundColor: colors.background }]}>
          <EmptyState
            icon={<Timer size={40} color={colors.mutedForeground} />}
            title="Not configured"
            description="Set up your retirement profile from the web app"
          />
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: true, title: "Retirement Planner", headerStyle: { backgroundColor: colors.card }, headerTintColor: colors.foreground }} />
      <ScrollView
        style={{ flex: 1, backgroundColor: colors.background }}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        {/* Target Age Card */}
        <Card>
          <Text style={[styles.label, { color: colors.mutedForeground }]}>Target Retirement Age</Text>
          <Text style={[styles.total, { color: colors.foreground }]}>
            {ret.profile.target_retirement_age}
          </Text>
          {projection && (
            <Badge
              label={projection.canRetireOnTarget ? "On Track" : `Est. age ${projection.estimatedRetirementAge}`}
              variant={projection.canRetireOnTarget ? "success" : "warning"}
            />
          )}
        </Card>

        {projection && (
          <>
            {/* Fund Progress */}
            <Card style={{ gap: spacing.sm }}>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Fund Progress</Text>
              <ProgressBar value={projection.fundProgress / 100} />
              <Text style={{ color: colors.mutedForeground, fontSize: fontSize.sm, textAlign: "center" }}>
                {projection.fundProgress}% of target
              </Text>
              <View style={styles.row}>
                <Text style={{ color: colors.mutedForeground, fontSize: fontSize.sm }}>Projected</Text>
                <Text style={{ color: colors.foreground, fontSize: fontSize.sm, fontWeight: "600" }}>
                  {formatCurrency(projection.projectedFundAtTarget)}
                </Text>
              </View>
              <View style={styles.row}>
                <Text style={{ color: colors.mutedForeground, fontSize: fontSize.sm }}>Required</Text>
                <Text style={{ color: colors.foreground, fontSize: fontSize.sm, fontWeight: "600" }}>
                  {formatCurrency(projection.requiredFundAtTarget)}
                </Text>
              </View>
              {projection.fundGap > 0 && (
                <View style={styles.row}>
                  <Text style={{ color: colors.mutedForeground, fontSize: fontSize.sm }}>Gap</Text>
                  <Text style={{ color: colors.destructive, fontSize: fontSize.sm, fontWeight: "600" }}>
                    {formatCurrency(projection.fundGap)}
                  </Text>
                </View>
              )}
            </Card>

            {/* Savings */}
            <Card style={{ gap: spacing.sm }}>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Monthly Savings</Text>
              <Text style={[styles.total, { color: colors.foreground }]}>
                {formatCurrency(projection.monthlySavings)}/mo
              </Text>
              <Text style={{ color: colors.mutedForeground, fontSize: fontSize.sm }}>
                Savings rate: {projection.savingsRate}%
              </Text>
            </Card>

            {/* Scenarios */}
            {projection.scenarios.length > 0 && (
              <Card style={{ gap: spacing.sm }}>
                <Text style={[styles.sectionTitle, { color: colors.foreground }]}>What-If Scenarios</Text>
                {projection.scenarios.map((s, i) => (
                  <View key={i} style={{ paddingVertical: 4 }}>
                    <Text style={{ color: colors.foreground, fontSize: fontSize.sm, fontWeight: "600" }}>
                      {s.label}
                    </Text>
                    <Text style={{ color: colors.mutedForeground, fontSize: fontSize.xs }}>
                      {s.description} → retire at {s.estimatedRetirementAge}
                    </Text>
                  </View>
                ))}
              </Card>
            )}
          </>
        )}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  content: { padding: spacing.md, gap: spacing.md, paddingBottom: spacing.xl },
  label: { fontSize: fontSize.sm, marginBottom: 4 },
  total: { fontSize: fontSize["2xl"], fontWeight: "700", marginBottom: spacing.sm },
  sectionTitle: { fontSize: fontSize.base, fontWeight: "600" },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 4 },
});
