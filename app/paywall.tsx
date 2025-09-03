import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, View } from "react-native";
import Purchases, { CustomerInfo, PurchasesOffering } from "react-native-purchases";
import RevenueCatUI from "react-native-purchases-ui";

export default function PaywallScreen() {
  const router = useRouter();
  const [offering, setOffering] = useState<PurchasesOffering | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOffering();
  }, []);

  const loadOffering = async () => {
    try {
      const offerings = await Purchases.getOfferings();
      if (offerings.current !== null) {
        setOffering(offerings.current);
      }
    } catch (error) {
      console.error("Error loading offering:", error);
      Alert.alert("Error", "Failed to load subscription options");
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = async () => {
    try {
      // Check if user has active subscription after purchase/restore
      const customerInfo = await Purchases.getCustomerInfo();
      const hasActiveSubscription = Object.keys(customerInfo.entitlements.active).length > 0;
      
      if (hasActiveSubscription) {
        // User has subscription, go to projects
        router.replace("/projects");
      } else {
        // User dismissed without purchasing, still go to projects
        // You might want to implement a limited trial mode here
        router.replace("/projects");
      }
    } catch (error) {
      console.error("Error checking subscription status:", error);
      router.replace("/projects");
    }
  };

  const handleRestoreCompleted = ({ customerInfo }: { customerInfo: CustomerInfo }) => {
    console.log("Restore completed:", customerInfo);
    const hasActiveSubscription = Object.keys(customerInfo.entitlements.active).length > 0;
    
    if (hasActiveSubscription) {
      Alert.alert("Success", "Your subscription has been restored!");
      router.replace("/projects");
    } else {
      Alert.alert("No Purchases", "No active subscriptions found to restore.");
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: "#f8f9fa" }} />
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <RevenueCatUI.Paywall
        options={{
          offering: offering || undefined,
        }}
        onRestoreCompleted={handleRestoreCompleted}
        onDismiss={handleDismiss}
      />
    </View>
  );
}