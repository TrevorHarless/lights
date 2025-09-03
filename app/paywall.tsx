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
      const customerInfo = await Purchases.getCustomerInfo();
      const hasActiveSubscription = Object.keys(customerInfo.entitlements.active).length > 0;
      
      if (hasActiveSubscription) {
        // User has subscription - allow access to main app
        router.replace("/projects");
      } else {
        // No subscription - prevent access, stay on paywall
        // User must subscribe or will be stuck here
        return;
      }
    } catch (error) {
      console.error("Error checking subscription status:", error);
      // On error, prevent access to main app
      return;
    }
  };

  const handleRestoreCompleted = ({ customerInfo }: { customerInfo: CustomerInfo }) => {
    const hasActiveSubscription = Object.keys(customerInfo.entitlements.active).length > 0;
    
    if (hasActiveSubscription) {
      Alert.alert("Success", "Your subscription has been restored!");
      router.replace("/projects");
    } else {
      Alert.alert("No Purchases", "No active subscriptions found to restore.");
    }
  };

  const handlePurchaseCompleted = ({ customerInfo }: { customerInfo: CustomerInfo }) => {
    const hasActiveSubscription = Object.keys(customerInfo.entitlements.active).length > 0;
    
    if (hasActiveSubscription) {
      Alert.alert("Welcome!", "Your subscription is now active!");
      router.replace("/projects");
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
          displayCloseButton: false, // Prevent users from dismissing without subscribing
        }}
        onRestoreCompleted={handleRestoreCompleted}
        onPurchaseCompleted={handlePurchaseCompleted}
        onDismiss={handleDismiss}
      />
    </View>
  );
}