import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { Platform } from "react-native";
import "react-native-get-random-values";
import Purchases, { LOG_LEVEL } from "react-native-purchases";
import { AuthProvider } from "~/contexts/AuthContext";
import { SyncProvider } from "~/contexts/SyncContext";

export default function RootLayout() {
  useEffect(() => {
    Purchases.setLogLevel(LOG_LEVEL.VERBOSE);

    if (Platform.OS === "ios") {
      Purchases.configure({
        apiKey: `${process.env.EXPO_PUBLIC_REVENUECAT_API_KEY}`,
      });
    }

    getCustomerInfo();
    getOfferings();
  }, []);

  async function getCustomerInfo() {
    const customerInfo = await Purchases.getCustomerInfo();
    console.log("customerInfo", JSON.stringify(customerInfo, null, 2));
  }

  async function getOfferings() {
    const offerings = await Purchases.getOfferings();

    if (
      offerings.current !== null &&
      offerings.current.availablePackages.length !== 0
    ) {
      console.log("what the bruhhhhh", JSON.stringify(offerings, null, 2));
    }
  }

  return (
    <AuthProvider>
      <SyncProvider>
        <StatusBar style="dark" backgroundColor="#ffffff" />
        <Stack screenOptions={{ headerShown: false }} />
      </SyncProvider>
    </AuthProvider>
  );
}
