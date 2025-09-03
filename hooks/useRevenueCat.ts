import { useEffect } from "react";
import Purchases from "react-native-purchases";
import { useAuth } from "~/contexts/AuthContext";

export function useRevenueCat() {
  const { user } = useAuth();

  useEffect(() => {
    const identifyUser = async () => {
      try {
        const currentCustomer = await Purchases.getCustomerInfo();
        
        if (user?.id) {
          // User is logged in with Supabase - identify them with RevenueCat
          if (currentCustomer.originalAppUserId !== user.id) {
            const { customerInfo, created } = await Purchases.logIn(user.id);
            
            // Log successful identification for debugging
            if (created) {
              console.log(`RevenueCat: Aliased anonymous user to ${user.id}`);
            } else {
              console.log(`RevenueCat: Logged in existing user ${user.id}`);
            }
            
            // Check if anonymous purchases were transferred
            const hasActiveEntitlements = Object.keys(customerInfo.entitlements.active).length > 0;
            if (hasActiveEntitlements && created) {
              console.log("RevenueCat: Anonymous purchases successfully transferred to user");
            }
          }
        } else {
          // User logged out - revert to anonymous
          if (!currentCustomer.originalAppUserId.startsWith('$RCAnonymousID:')) {
            await Purchases.logOut();
            console.log("RevenueCat: User logged out, reverted to anonymous");
          }
        }
      } catch (error) {
        console.error("RevenueCat user identification error:", error);
      }
    };

    const timer = setTimeout(identifyUser, 100);
    return () => clearTimeout(timer);
  }, [user?.id]);

  return {};
}