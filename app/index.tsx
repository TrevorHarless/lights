import { useRouter } from "expo-router";
import { useEffect } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { useAuth } from "~/contexts/AuthContext";
import "../global.css";

export default function Index() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center p-5">
        <Text className="text-lg">Loading...</Text>
      </View>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <View className="flex-1 justify-center items-center p-5 bg-gray-50">
      <Text className="text-2xl font-bold mb-2 text-center text-gray-800 mb-8">
        Welcome to Lights!
      </Text>

      <View className="gap-4 w-full max-w-[200px]">
        <TouchableOpacity
          className="bg-blue-500 rounded-lg p-4 items-center min-w-[120px] shadow-lg active:bg-blue-600"
          onPress={() => router.navigate("/projects")}
        >
          <Text className="text-white text-base font-semibold">
            My Projects
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="bg-red-500 rounded-lg p-4 items-center min-w-[120px] shadow-lg active:bg-red-600"
          onPress={signOut}
        >
          <Text className="text-white text-base font-semibold">Sign Out</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
