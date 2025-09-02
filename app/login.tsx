import { Link, router } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Alert,
  Dimensions,
  Platform,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import AppleSignInButton from "~/components/AppleSignInButton";
import { useAuth } from "~/contexts/AuthContext";
import "../global.css";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const passwordRef = useRef<TextInput>(null);

  const { width } = Dimensions.get("window");
  const isTablet = width >= 768;
  const containerMaxWidth = isTablet ? "max-w-lg" : "max-w-sm";
  const horizontalPadding = isTablet ? "px-12" : "px-6";
  const verticalSpacing = isTablet ? "space-y-6" : "space-y-4";
  const headerMargin = isTablet ? "mb-12" : "mb-10";
  const buttonMargin = isTablet ? "mt-10" : "mt-8";
  const footerMargin = isTablet ? "mt-12" : "mt-8";

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
    <SafeAreaView className="flex-1 bg-gradient-to-b from-primary-50 to-white">
      <ScrollView
        className={`flex-1 ${horizontalPadding}`}
        contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        showsVerticalScrollIndicator={false}
      >
        <View className={`w-full ${containerMaxWidth} self-center`}>
          {/* Header */}
          <View className={`items-center ${headerMargin}`}>
            <Text
              className={`${isTablet ? "text-4xl" : "text-3xl"} font-bold text-gray-800 mb-2`}
            >
              Sign In
            </Text>
          </View>

          {/* Form */}
          <View className={verticalSpacing}>
            <View>
              <Text className="text-gray-700 font-medium mb-2 ml-1">Email</Text>
              <TextInput
                className={`bg-white border border-gray-200 rounded-xl ${isTablet ? "p-5" : "p-4"} text-gray-800 shadow-sm focus:border-primary-500 focus:shadow-md`}
                style={{ fontSize: isTablet ? 18 : 16, fontWeight: "500" }}
                placeholder="Enter your email"
                placeholderTextColor="#9ca3af"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                autoComplete="email"
                inputMode="email"
                autoCorrect={false}
                spellCheck={false}
                enablesReturnKeyAutomatically={true}
                returnKeyType="next"
                blurOnSubmit={false}
                onSubmitEditing={() => passwordRef.current?.focus()}
              />
            </View>

            <View>
              <Text
                className={`text-gray-700 font-medium mb-2 ${isTablet ? "mt-6" : "mt-4"} ml-1`}
              >
                Password
              </Text>
              <TextInput
                ref={passwordRef}
                className={`bg-white border border-gray-200 rounded-xl ${isTablet ? "px-5 py-5" : "px-4 py-4"} text-gray-800 shadow-sm focus:border-primary-500 focus:shadow-md`}
                style={{ fontSize: isTablet ? 18 : 16, fontWeight: "500" }}
                placeholder="Enter your password"
                placeholderTextColor="#9ca3af"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoComplete="password"
                autoCorrect={false}
                spellCheck={false}
                enablesReturnKeyAutomatically={true}
                returnKeyType="done"
                blurOnSubmit={true}
                onSubmitEditing={handleLogin}
              />
            </View>

            <View className="flex-row justify-end mt-2">
              <Link href="/forgot-password">
                <Text className="text-primary-600 font-medium text-sm">
                  Forgot your password?
                </Text>
              </Link>
            </View>

            <TouchableOpacity
              className={`${buttonMargin} rounded-xl ${isTablet ? "py-5" : "py-4"} items-center shadow-medium ${
                loading ? "bg-gray-300" : "bg-primary-600 active:bg-primary-700"
              }`}
              onPress={handleLogin}
              disabled={loading}
            >
              <Text
                className={`text-white ${isTablet ? "text-xl" : "text-xl"} font-semibold`}
              >
                {loading ? "Signing in..." : "Sign In"}
              </Text>
            </TouchableOpacity>

            {Platform.OS === "ios" && (
              <>
                <View className="flex-row items-center my-6">
                  <View className="flex-1 h-px bg-gray-300" />
                  <Text className="mx-4 text-gray-500 text-sm">or</Text>
                  <View className="flex-1 h-px bg-gray-300" />
                </View>

                <AppleSignInButton
                  style={{
                    width: "100%",
                    height: isTablet ? 56 : 48,
                  }}
                  cornerRadius={12}
                />
              </>
            )}
          </View>

          {/* Footer */}
          <View className={`flex-row justify-center ${footerMargin}`}>
            <Text
              className={`text-gray-500 ${isTablet ? "text-lg" : "text-base"}`}
            >
              Don&apos;t have an account?{" "}
            </Text>
            <Link href="/signup">
              <Text
                className={`text-primary-600 font-semibold ${isTablet ? "text-lg" : "text-base"}`}
              >
                Sign up
              </Text>
            </Link>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
