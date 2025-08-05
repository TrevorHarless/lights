import { useRouter } from "expo-router";
import { useEffect } from "react";
import { Text, View } from "react-native";
import { useAuth } from "~/contexts/AuthContext";
import "../global.css";

export default function Index() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace("/login");
      } else {
        router.replace("/projects");
      }
    }
  }, [user, loading, router]);

  // Show loading screen while determining auth state
  return (
    <View className="flex-1 justify-center items-center p-5">
      <Text className="text-lg">Loading...</Text>
    </View>
  );
}
