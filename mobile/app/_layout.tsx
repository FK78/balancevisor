import FontAwesome from "@expo/vector-icons/FontAwesome";
import { DarkTheme, DefaultTheme, ThemeProvider as NavThemeProvider } from "@react-navigation/native";
import { QueryClientProvider } from "@tanstack/react-query";
import { useFonts } from "expo-font";
import { Redirect, Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { useColorScheme } from "react-native";
import "react-native-reanimated";

import { AuthProvider, useAuth } from "@/lib/auth-context";
import { ThemeProvider } from "@/lib/theme-context";
import { queryClient } from "@/lib/query-client";

export { ErrorBoundary } from "expo-router";

export const unstable_settings = {
  initialRouteName: "(tabs)",
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    ...FontAwesome.font,
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) return null;

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider>
          <RootLayoutNav />
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const { isLoading, isAuthenticated } = useAuth();

  if (isLoading) return null;

  return (
    <NavThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      {!isAuthenticated && <Redirect href="/(auth)/sign-in" />}
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" redirect={isAuthenticated} />
        <Stack.Screen name="(tabs)" redirect={!isAuthenticated} />
        <Stack.Screen name="settings" options={{ presentation: "card" }} redirect={!isAuthenticated} />
        <Stack.Screen name="goals" options={{ presentation: "card" }} redirect={!isAuthenticated} />
        <Stack.Screen name="debts" options={{ presentation: "card" }} redirect={!isAuthenticated} />
        <Stack.Screen name="subscriptions" options={{ presentation: "card" }} redirect={!isAuthenticated} />
        <Stack.Screen name="investments" options={{ presentation: "card" }} redirect={!isAuthenticated} />
        <Stack.Screen name="zakat" options={{ presentation: "card" }} redirect={!isAuthenticated} />
        <Stack.Screen name="retirement" options={{ presentation: "card" }} redirect={!isAuthenticated} />
        <Stack.Screen name="nudges" options={{ presentation: "card" }} redirect={!isAuthenticated} />
        <Stack.Screen name="chat" options={{ presentation: "card" }} redirect={!isAuthenticated} />
        <Stack.Screen name="account/[id]" options={{ presentation: "card" }} redirect={!isAuthenticated} />
        <Stack.Screen name="cashflow" options={{ presentation: "card" }} redirect={!isAuthenticated} />
      </Stack>
    </NavThemeProvider>
  );
}
