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

  const checkSubscriptionStatus = useCallback(async () => {
    setCheckingSubscription(true);
    try {
      const customerInfo = await Purchases.getCustomerInfo();
      const hasActiveSubscription = Object.keys(customerInfo.entitlements.active).length > 0;
      
      if (hasActiveSubscription) {
        // User has subscription - allow access to main app
        router.replace("/projects");
      } else {
        // No subscription - must subscribe to continue
        router.replace("/paywall");
      }
    } catch (error) {
      console.error("Error checking subscription status:", error);
      // On error, require subscription to be safe
      router.replace("/paywall");
    } finally {
      setCheckingSubscription(false);
    }
  }, [router]);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // User is not logged in - go to login immediately, no subscription check needed
        router.replace("/login");
      } else {
        // User is logged in - check subscription status
        checkSubscriptionStatus();
      }
    }
  }, [user, loading, router, checkSubscriptionStatus]);

  // Show loading screen while determining auth state
  return (
    <View className="flex-1 justify-center items-center p-5">
      <Text className="text-lg">
        {checkingSubscription ? "Checking subscription..." : "Loading..."}
      </Text>
    </View>
  );
}
