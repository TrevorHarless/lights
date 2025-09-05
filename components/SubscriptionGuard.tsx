import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { View, Text } from "react-native";
import Purchases from "react-native-purchases";

interface SubscriptionGuardProps {
  children: React.ReactNode;
}

export function SubscriptionGuard({ children }: SubscriptionGuardProps) {
  const router = useRouter();
  const [hasSubscription, setHasSubscription] = useState<boolean | null>(null);

  useEffect(() => {
    let mounted = true;
    
    const checkSubscription = async () => {
      try {
        const customerInfo = await Purchases.getCustomerInfo();
        const hasActiveSubscription = Object.keys(customerInfo.entitlements.active).length > 0;
        
        if (!mounted) return;
        
        if (!hasActiveSubscription) {
          // No subscription - redirect to paywall
          router.replace("/paywall");
          return;
        }
        
        setHasSubscription(true);
      } catch (error) {
        console.error("Error checking subscription:", error);
        if (!mounted) return;
        // On error, redirect to paywall to be safe
        router.replace("/paywall");
      }
    };

    checkSubscription();
    
    return () => {
      mounted = false;
    };
  }, [router]); // Include router dependency as required by ESLint

  // Show loading while checking subscription
  if (hasSubscription === null) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Verifying subscription...</Text>
      </View>
    );
  }

  // If we get here, user has subscription
  return <>{children}</>;
}