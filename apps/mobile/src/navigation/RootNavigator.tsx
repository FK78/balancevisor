import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Text, View } from "react-native";
import { useAuthSession } from "../hooks/useAuthSession";

const Stack = createNativeStackNavigator();

function SignInStub() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>BalanceVisor</Text>
      <Text>Sign in</Text>
    </View>
  );
}

function DashboardStub() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Dashboard</Text>
    </View>
  );
}

export function RootNavigator() {
  const { status } = useAuthSession();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {status === "signed-in" ? (
        <Stack.Screen name="Dashboard" component={DashboardStub} />
      ) : (
        <Stack.Screen name="SignIn" component={SignInStub} />
      )}
    </Stack.Navigator>
  );
}
