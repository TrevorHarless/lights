import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import Purchases from "react-native-purchases";
import { useAuth } from "~/contexts/AuthContext";

export function useSubscription() {
  const router = useRouter();
  const { user } = useAuth();
  const [hasSubscription, setHasSubscription] = useState<boolean | null>(null);

  useEffect(() => {
    let mounted = true;
    
    const checkSubscription = async () => {
      // If user is not logged in, don't check subscription
      if (!user) {
        if (!mounted) return;
        setHasSubscription(false);
        return;
      }

      try {
        const customerInfo = await Purchases.getCustomerInfo();
        const hasActiveSubscription = Object.keys(customerInfo.entitlements.active).length > 0;
        
        if (!mounted) return;
        setHasSubscription(hasActiveSubscription);
      } catch (error) {
        console.error("Error checking subscription:", error);
        if (!mounted) return;
        setHasSubscription(false);
      }
    };

    checkSubscription();
    
    return () => {
      mounted = false;
    };
  }, [user]);

  const requireSubscription = (action: () => void) => {
    if (hasSubscription === true) {
      action();
    } else {
      router.push("/paywall");
    }
  };

  return {
    hasSubscription,
    requireSubscription,
    loading: hasSubscription === null,
  };
}