import { useRouter, usePathname } from "expo-router";
import { useEffect, useState } from "react";
import { View, Text } from "react-native";
import Purchases from "react-native-purchases";
import { useAuth } from "~/contexts/AuthContext";

interface SubscriptionGuardProps {
  children: React.ReactNode;
}

export function SubscriptionGuard({ children }: SubscriptionGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();
  const [hasSubscription, setHasSubscription] = useState<boolean | null>(null);

  useEffect(() => {
    let mounted = true;
    
    const checkSubscription = async () => {
      // If user is not logged in, don't do subscription checks
      // Let the index route handle authentication redirects
      if (!user) {
        return;
      }

      try {
        const customerInfo = await Purchases.getCustomerInfo();
        const hasActiveSubscription = Object.keys(customerInfo.entitlements.active).length > 0;
        
        if (!mounted) return;
        
        if (!hasActiveSubscription) {
          // Allow access to profile and projects screens even without subscription
          // Profile enables users to delete their account if needed
          // Projects allows access to profile button but protects other actions
          if (pathname === "/profile" || pathname === "/projects") {
            setHasSubscription(false);
            return;
          }
          
          // No subscription - redirect to paywall for other screens
          router.replace("/paywall");
          return;
        }
        
        setHasSubscription(true);
      } catch (error) {
        console.error("Error checking subscription:", error);
        if (!mounted) return;
        
        // Allow access to profile and projects screens even on error
        if (pathname === "/profile" || pathname === "/projects") {
          setHasSubscription(false);
          return;
        }
        
        // On error, redirect to paywall to be safe for other screens
        router.replace("/paywall");
      }
    };

    checkSubscription();
    
    return () => {
      mounted = false;
    };
  }, [router, pathname, user]);

  // If user is not logged in, render children without subscription checks
  // The index route will handle redirecting to login
  if (!user) {
    return <>{children}</>;
  }

  // Show loading while checking subscription for logged-in users
  if (hasSubscription === null) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Verifying subscription...</Text>
      </View>
    );
  }

  // Render children if user has subscription OR is on profile/projects screen
  return <>{children}</>;
}