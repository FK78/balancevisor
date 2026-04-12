import { ScrollView, View, Text, StyleSheet, Switch, Alert, Pressable } from "react-native";
import { useState, useEffect, useCallback } from "react";
import { Stack } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "@/lib/theme-context";
import { useAuth } from "@/lib/auth-context";
import { spacing, fontSize, radius } from "@/constants/theme";
import { Card } from "@/components/ui";
import { isBiometricAvailable } from "@/lib/biometric-auth";
import { registerForPushNotifications } from "@/lib/notifications";

const BIOMETRIC_KEY = "biometric_lock_enabled";
const NOTIF_KEY = "notifications_enabled";

export default function SettingsScreen() {
  const { colors } = useTheme();
  const { user, signOut } = useAuth();
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [notifEnabled, setNotifEnabled] = useState(false);

  useEffect(() => {
    (async () => {
      const available = await isBiometricAvailable();
      setBiometricAvailable(available);
      const storedBio = await AsyncStorage.getItem(BIOMETRIC_KEY);
      setBiometricEnabled(storedBio === "true");
      const storedNotif = await AsyncStorage.getItem(NOTIF_KEY);
      setNotifEnabled(storedNotif === "true");
    })();
  }, []);

  const toggleBiometric = useCallback(async (val: boolean) => {
    setBiometricEnabled(val);
    await AsyncStorage.setItem(BIOMETRIC_KEY, String(val));
  }, []);

  const toggleNotifications = useCallback(async (val: boolean) => {
    if (val) {
      const token = await registerForPushNotifications();
      if (!token) {
        Alert.alert("Notifications", "Permission denied. Enable in system settings.");
        return;
      }
    }
    setNotifEnabled(val);
    await AsyncStorage.setItem(NOTIF_KEY, String(val));
  }, []);

  const handleSignOut = () => {
    Alert.alert("Sign Out", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign Out", style: "destructive", onPress: signOut },
    ]);
  };

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

        {/* Security */}
        <Card>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Security</Text>
          <View style={styles.row}>
            <Text style={{ color: colors.foreground, fontSize: fontSize.sm }}>Biometric Lock</Text>
            <Switch
              value={biometricEnabled}
              onValueChange={toggleBiometric}
              disabled={!biometricAvailable}
              trackColor={{ true: colors.primary, false: colors.muted }}
            />
          </View>
          {!biometricAvailable && (
            <Text style={{ color: colors.mutedForeground, fontSize: fontSize.xs }}>
              Not available on this device
            </Text>
          )}
        </Card>

        {/* Preferences */}
        <Card>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Preferences</Text>
          <View style={styles.row}>
            <Text style={{ color: colors.foreground, fontSize: fontSize.sm }}>Theme</Text>
            <Text style={{ color: colors.mutedForeground, fontSize: fontSize.xs }}>System</Text>
          </View>
          <View style={styles.row}>
            <Text style={{ color: colors.foreground, fontSize: fontSize.sm }}>Push Notifications</Text>
            <Switch
              value={notifEnabled}
              onValueChange={toggleNotifications}
              trackColor={{ true: colors.primary, false: colors.muted }}
            />
          </View>
        </Card>

        {/* App Info */}
        <Card>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>About</Text>
          <View style={styles.row}>
            <Text style={{ color: colors.mutedForeground, fontSize: fontSize.sm }}>Version</Text>
            <Text style={{ color: colors.foreground, fontSize: fontSize.sm }}>1.0.0</Text>
          </View>
          <View style={styles.row}>
            <Text style={{ color: colors.mutedForeground, fontSize: fontSize.sm }}>Build</Text>
            <Text style={{ color: colors.foreground, fontSize: fontSize.sm }}>Expo SDK 53</Text>
          </View>
        </Card>

        {/* Sign Out */}
        <Pressable
          onPress={handleSignOut}
          style={({ pressed }) => [styles.signOutBtn, { backgroundColor: colors.destructive, opacity: pressed ? 0.8 : 1 }]}
        >
          <Text style={{ color: "#fff", fontWeight: "600", fontSize: fontSize.base }}>Sign Out</Text>
        </Pressable>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.md, gap: spacing.md, paddingBottom: spacing.xl },
  sectionTitle: { fontSize: fontSize.base, fontWeight: "600", marginBottom: spacing.sm },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: spacing.sm },
  signOutBtn: { borderRadius: radius.md, padding: spacing.md, alignItems: "center", marginTop: spacing.sm },
});
