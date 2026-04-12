import { ScrollView, View, Text, StyleSheet, Switch } from "react-native";
import { Stack } from "expo-router";
import { useTheme } from "@/lib/theme-context";
import { useAuth } from "@/lib/auth-context";
import { spacing, fontSize } from "@/constants/theme";
import { Card } from "@/components/ui";

export default function SettingsScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();

  return (
    <>
      <Stack.Screen options={{ headerShown: true, title: "Settings", headerStyle: { backgroundColor: colors.card }, headerTintColor: colors.foreground }} />
      <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={styles.content}>
        {/* Account Info */}
        <Card>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Account</Text>
          <View style={styles.row}>
            <Text style={{ color: colors.mutedForeground, fontSize: fontSize.sm }}>Email</Text>
            <Text style={{ color: colors.foreground, fontSize: fontSize.sm, fontWeight: "500" }}>
              {user?.email ?? "—"}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={{ color: colors.mutedForeground, fontSize: fontSize.sm }}>User ID</Text>
            <Text style={{ color: colors.mutedForeground, fontSize: fontSize.xs }} numberOfLines={1}>
              {user?.id?.slice(0, 8) ?? "—"}...
            </Text>
          </View>
        </Card>

        {/* Preferences */}
        <Card>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Preferences</Text>
          <View style={styles.row}>
            <Text style={{ color: colors.foreground, fontSize: fontSize.sm }}>Dark Mode</Text>
            <Text style={{ color: colors.mutedForeground, fontSize: fontSize.xs }}>System</Text>
          </View>
          <View style={styles.row}>
            <Text style={{ color: colors.foreground, fontSize: fontSize.sm }}>Notifications</Text>
            <Switch value={false} disabled trackColor={{ true: colors.primary, false: colors.muted }} />
          </View>
        </Card>

        {/* App Info */}
        <Card>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>About</Text>
          <View style={styles.row}>
            <Text style={{ color: colors.mutedForeground, fontSize: fontSize.sm }}>Version</Text>
            <Text style={{ color: colors.foreground, fontSize: fontSize.sm }}>1.0.0</Text>
          </View>
        </Card>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.md, gap: spacing.md, paddingBottom: spacing.xl },
  sectionTitle: { fontSize: fontSize.base, fontWeight: "600", marginBottom: spacing.sm },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: spacing.sm },
});
