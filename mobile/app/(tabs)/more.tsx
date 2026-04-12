import { ScrollView, View, Text, StyleSheet, Pressable, Alert } from "react-native";
import { useRouter } from "expo-router";
import {
  Target,
  CreditCard,
  Repeat,
  TrendingUp,
  Calculator,
  Timer,
  Settings,
  LogOut,
} from "lucide-react-native";
import { useTheme } from "@/lib/theme-context";
import { useAuth } from "@/lib/auth-context";
import { spacing, fontSize, radius } from "@/constants/theme";

interface MenuItem {
  label: string;
  icon: React.ComponentType<{ size: number; color: string }>;
  route?: string;
  onPress?: () => void;
}

export default function MoreScreen() {
  const { colors } = useTheme();
  const { signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign Out", style: "destructive", onPress: signOut },
    ]);
  };

  const items: MenuItem[] = [
    { label: "Goals", icon: Target, onPress: () => router.push("/goals" as never) },
    { label: "Debts", icon: CreditCard, onPress: () => router.push("/debts" as never) },
    { label: "Subscriptions", icon: Repeat, onPress: () => router.push("/subscriptions" as never) },
    { label: "Investments", icon: TrendingUp, onPress: () => router.push("/investments" as never) },
    { label: "Zakat", icon: Calculator, onPress: () => router.push("/zakat" as never) },
    { label: "Retirement", icon: Timer, onPress: () => router.push("/retirement" as never) },
    { label: "Settings", icon: Settings, onPress: () => router.push("/settings" as never) },
  ];

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={styles.content}>
      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {items.map((item, i) => {
          const Icon = item.icon;
          return (
            <Pressable
              key={item.label}
              style={({ pressed }) => [
                styles.menuItem,
                i < items.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border },
                pressed && { opacity: 0.7 },
              ]}
              onPress={item.onPress}
            >
              <Icon size={20} color={colors.mutedForeground} />
              <Text style={[styles.menuLabel, { color: colors.foreground }]}>{item.label}</Text>
            </Pressable>
          );
        })}
      </View>

      <Pressable
        style={({ pressed }) => [
          styles.signOutButton,
          { backgroundColor: colors.card, borderColor: colors.destructive },
          pressed && { opacity: 0.7 },
        ]}
        onPress={handleSignOut}
      >
        <LogOut size={20} color={colors.destructive} />
        <Text style={[styles.signOutLabel, { color: colors.destructive }]}>Sign Out</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.md, gap: spacing.md },
  section: { borderRadius: 16, borderWidth: 1, overflow: "hidden" },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    gap: spacing.md,
  },
  menuLabel: { fontSize: fontSize.base, fontWeight: "500" },
  signOutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  signOutLabel: { fontSize: fontSize.base, fontWeight: "600" },
});
