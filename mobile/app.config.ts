import { ExpoConfig, ConfigContext } from "expo/config";

const appConfig = ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "BalanceVisor",
  slug: "balancevisor",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/images/icon.png",
  scheme: "balancevisor",
  userInterfaceStyle: "automatic",
  newArchEnabled: true,
  splash: {
    image: "./assets/images/splash-icon.png",
    resizeMode: "contain",
    backgroundColor: "#f5f0e6",
  },
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.balancevisor.app",
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/images/adaptive-icon.png",
      backgroundColor: "#f5f0e6",
    },
    edgeToEdgeEnabled: true,
    package: "com.balancevisor.app",
  },
  web: {
    bundler: "metro",
    output: "static",
    favicon: "./assets/images/favicon.png",
  },
  plugins: [
    "expo-router",
    "expo-secure-store",
    [
      "expo-local-authentication",
      { faceIDPermission: "Allow BalanceVisor to use Face ID to unlock the app" },
    ],
  ],
  experiments: {
    typedRoutes: true,
  },
  extra: {
    apiUrl: process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000",
    supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL ?? "",
    supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? "",
  },
});

export default appConfig;
