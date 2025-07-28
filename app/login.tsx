import { useAuth } from "@/contexts/AuthContext";
import { Link, router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import "../global.css";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setLoading(true);
    const { error } = await signIn(email, password);

    if (error) {
      Alert.alert("Error", error.message);
    } else {
      router.replace("/");
    }
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 justify-center px-6 bg-gradient-to-b from-primary-50 to-white"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View className="w-full max-w-sm self-center">
        {/* Header */}
        <View className="items-center mb-10">
          <Text className="text-3xl font-bold text-gray-800 mb-2">Sign In</Text>
        </View>

        {/* Form */}
        <View className="space-y-4">
          <View>
            <Text className="text-gray-700 font-medium mb-2 ml-1">Email</Text>
            <TextInput
              className="bg-white border border-gray-200 rounded-xl p-4 text-gray-800 shadow-sm focus:border-primary-500 focus:shadow-md"
              placeholder="Enter your email"
              placeholderTextColor="#9ca3af"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
            />
          </View>

          <View>
            <Text className="text-gray-700 font-medium mb-2 mt-4 ml-1">
              Password
            </Text>
            <TextInput
              className="bg-white border border-gray-200 rounded-xl px-4 py-4 text-gray-800 shadow-sm focus:border-primary-500 focus:shadow-md"
              placeholder="Enter your password"
              placeholderTextColor="#9ca3af"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete="password"
            />
          </View>

          <TouchableOpacity
            className={`mt-8 rounded-xl py-4 items-center shadow-medium ${
              loading ? "bg-gray-300" : "bg-primary-600 active:bg-primary-700"
            }`}
            onPress={handleLogin}
            disabled={loading}
          >
            <Text className="text-white text-base font-semibold">
              {loading ? "Signing in..." : "Sign In"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View className="flex-row justify-center mt-8">
          <Text className="text-gray-500 text-base">
            Don&apos;t have an account?{" "}
          </Text>
          <Link href="/signup">
            <Text className="text-primary-600 font-semibold text-base">
              Sign up
            </Text>
          </Link>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
