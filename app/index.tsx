import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Text, View } from "react-native";
import Purchases from "react-native-purchases";
import { useAuth } from "~/contexts/AuthContext";
import "../global.css";

export default function Index() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [checkingSubscription, setCheckingSubscription] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace("/login");
      } else {
        checkSubscriptionStatus();
      }
    }
  }, [user, loading, router, checkSubscriptionStatus]);

  const checkSubscriptionStatus = useCallback(async () => {
    setCheckingSubscription(true);
    try {
      const customerInfo = await Purchases.getCustomerInfo();
      const hasActiveSubscription = Object.keys(customerInfo.entitlements.active).length > 0;
      
      if (hasActiveSubscription) {
        router.replace("/projects");
      } else {
        router.replace("/paywall");
      }
    } catch (error) {
      console.error("Error checking subscription status:", error);
      // If there's an error, still show paywall to be safe
      router.replace("/paywall");
    } finally {
      setCheckingSubscription(false);
    }
  }, [router]);

  // Show loading screen while determining auth state
  return (
    <View className="flex-1 justify-center items-center p-5">
      <Text className="text-lg">
        {checkingSubscription ? "Checking subscription..." : "Loading..."}
      </Text>
    </View>
  );
}
