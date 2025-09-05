import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { Platform } from "react-native";
import "react-native-get-random-values";
import Purchases, { LOG_LEVEL } from "react-native-purchases";
import { AuthProvider } from "~/contexts/AuthContext";
import { SyncProvider } from "~/contexts/SyncContext";
import { useRevenueCat } from "~/hooks/useRevenueCat";

function RootLayoutContent() {
  useRevenueCat();

  return (
    <>
      <StatusBar style="dark" backgroundColor="#ffffff" />
      <Stack screenOptions={{ headerShown: false }} />
    </>
  );
}

export default function RootLayout() {
  useEffect(() => {
    // Set log level to ERROR to reduce noise in production
    Purchases.setLogLevel(LOG_LEVEL.ERROR);

    if (Platform.OS === "ios") {
      Purchases.configure({
        apiKey: `${process.env.EXPO_PUBLIC_REVENUECAT_API_KEY}`,
      });
    }

    // Remove unnecessary API calls on app start
    // These are called when needed by components
  }, []);


  return (
    <AuthProvider>
      <SyncProvider>
        <RootLayoutContent />
      </SyncProvider>
    </AuthProvider>
  );
}
