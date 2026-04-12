import { ScrollView, View, Text, StyleSheet, ActivityIndicator, RefreshControl, Pressable } from "react-native";
import { useCallback, useState } from "react";
import { Stack } from "expo-router";
import { Calculator } from "lucide-react-native";
import { useZakat, useCalculateZakat } from "@/hooks/use-api";
import { useTheme } from "@/lib/theme-context";
import { spacing, fontSize, radius } from "@/constants/theme";
import { Card, Badge, EmptyState } from "@/components/ui";
import { formatCurrency } from "@/lib/shared/formatCurrency";

interface ZakatSettings {
  gold_nisab: number;
  silver_nisab: number;
  base_currency: string;
  hawl_start_date: string | null;
}

interface ZakatCalculation {
  zakatableAssets: number;
  totalLiabilities: number;
  netZakatableWealth: number;
  nisabThreshold: number;
  isAboveNisab: boolean;
  zakatDue: number;
}

function RecalcButton({ colors }: { colors: Record<string, string> }) {
  const calcMut = useCalculateZakat();
  return (
    <Pressable
      onPress={() => calcMut.mutate({})}
      disabled={calcMut.isPending}
      style={({ pressed }) => ({
        backgroundColor: colors.primary,
        borderRadius: radius.md,
        padding: spacing.md,
        alignItems: "center" as const,
        opacity: pressed || calcMut.isPending ? 0.7 : 1,
      })}
    >
      {calcMut.isPending ? (
        <ActivityIndicator color={colors.primaryForeground} />
      ) : (
        <Text style={{ color: colors.primaryForeground, fontWeight: "600", fontSize: fontSize.base }}>Recalculate Zakat</Text>
      )}
    </Pressable>
  );
}

export default function ZakatScreen() {
  const { colors } = useTheme();
  const { data, isLoading, refetch } = useZakat();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const settings = data as (ZakatSettings & { calculation?: ZakatCalculation }) | undefined;
  const calc = settings?.calculation;

  if (isLoading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!settings) {
    return (
      <>
        <Stack.Screen options={{ headerShown: true, title: "Zakat", headerStyle: { backgroundColor: colors.card }, headerTintColor: colors.foreground }} />
        <View style={[styles.center, { backgroundColor: colors.background }]}>
          <EmptyState
            icon={<Calculator size={40} color={colors.mutedForeground} />}
            title="Zakat not configured"
            description="Set up zakat calculation from the web app"
          />
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: true, title: "Zakat Calculator", headerStyle: { backgroundColor: colors.card }, headerTintColor: colors.foreground }} />
      <ScrollView
        style={{ flex: 1, backgroundColor: colors.background }}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        {calc ? (
          <>
            <Card>
              <Text style={[styles.label, { color: colors.mutedForeground }]}>Zakat Due</Text>
              <Text style={[styles.total, { color: calc.zakatDue > 0 ? colors.primary : colors.foreground }]}>
                {formatCurrency(calc.zakatDue, settings.base_currency)}
              </Text>
              <Badge
                label={calc.isAboveNisab ? "Above Nisab" : "Below Nisab"}
                variant={calc.isAboveNisab ? "success" : "muted"}
              />
            </Card>

            <Card style={{ gap: spacing.sm }}>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Breakdown</Text>
              <View style={styles.row}>
                <Text style={{ color: colors.mutedForeground, fontSize: fontSize.sm }}>Zakatable Assets</Text>
                <Text style={{ color: colors.foreground, fontSize: fontSize.sm, fontWeight: "600" }}>
                  {formatCurrency(calc.zakatableAssets, settings.base_currency)}
                </Text>
              </View>
              <View style={styles.row}>
                <Text style={{ color: colors.mutedForeground, fontSize: fontSize.sm }}>Liabilities</Text>
                <Text style={{ color: colors.destructive, fontSize: fontSize.sm, fontWeight: "600" }}>
                  -{formatCurrency(calc.totalLiabilities, settings.base_currency)}
                </Text>
              </View>
              <View style={styles.row}>
                <Text style={{ color: colors.mutedForeground, fontSize: fontSize.sm }}>Net Wealth</Text>
                <Text style={{ color: colors.foreground, fontSize: fontSize.sm, fontWeight: "700" }}>
                  {formatCurrency(calc.netZakatableWealth, settings.base_currency)}
                </Text>
              </View>
              <View style={styles.row}>
                <Text style={{ color: colors.mutedForeground, fontSize: fontSize.sm }}>Nisab Threshold</Text>
                <Text style={{ color: colors.foreground, fontSize: fontSize.sm }}>
                  {formatCurrency(calc.nisabThreshold, settings.base_currency)}
                </Text>
              </View>
            </Card>
          </>
        ) : (
          <Card>
            <Text style={{ color: colors.mutedForeground, fontSize: fontSize.sm, textAlign: "center" }}>
              Calculate your zakat based on current holdings and accounts
            </Text>
          </Card>
        )}
        <RecalcButton colors={colors} />
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
