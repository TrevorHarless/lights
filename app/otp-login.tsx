import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Dimensions,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "~/contexts/AuthContext";
import "../global.css";

export default function OTPLoginScreen() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const { signInWithOTP } = useAuth();

  const { width } = Dimensions.get("window");
  const isTablet = width >= 768;
  const containerMaxWidth = isTablet ? "max-w-lg" : "max-w-sm";
  const horizontalPadding = isTablet ? "px-12" : "px-6";
  const verticalSpacing = isTablet ? "space-y-6" : "space-y-4";
  const headerMargin = isTablet ? "mb-12" : "mb-10";
  const buttonMargin = isTablet ? "mt-10" : "mt-8";

  const handleSendOTP = async () => {
    if (!email) {
      Alert.alert("Error", "Please enter your email address");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert("Error", "Please enter a valid email address");
      return;
    }

    console.log("🔐 OTP: Attempting to send OTP to:", email);
    setLoading(true);

    try {
      // Add timeout protection
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Request timeout")), 15000)
      );

      const otpPromise = signInWithOTP(email);
      
      const { error } = await Promise.race([otpPromise, timeoutPromise]) as any;

      if (error) {
        console.error("🔐 OTP: Failed to send OTP:", error.message);
        Alert.alert(
          "Error",
          error.message.includes("rate limit")
            ? "You can only request one sign-in link per minute. Please wait before trying again."
            : error.message
        );
      } else {
        console.log("🔐 OTP: Successfully sent OTP");
        // Navigate to verification screen with email parameter
        router.push(`/verify-otp?email=${encodeURIComponent(email)}`);
      }
    } catch (error: any) {
      console.error("🔐 OTP: Exception while sending OTP:", error);
      Alert.alert(
        "Error", 
        error.message === "Request timeout"
          ? "The request timed out. Please check your internet connection and try again."
          : "Failed to send sign-in link. Please try again."
      );
    } finally {
      setLoading(false);
    }
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
              Sign in with OTP
            </Text>
            <Text className="text-gray-600 text-center mt-2 px-4">
              Enter your email address and we&apos;ll send you a secure sign-in link
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
                returnKeyType="done"
                blurOnSubmit={true}
                onSubmitEditing={handleSendOTP}
                autoFocus={true}
              />
            </View>

            {/* Info Box */}
            <View className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <Text className="text-blue-800 text-sm text-center">
                No password required! We&apos;ll send you a secure link to sign in instantly.
              </Text>
            </View>

            <TouchableOpacity
              className={`${buttonMargin} rounded-xl ${isTablet ? "py-5" : "py-4"} items-center shadow-medium ${
                loading ? "bg-gray-300" : "bg-primary-600 active:bg-primary-700"
              }`}
              onPress={handleSendOTP}
              disabled={loading}
            >
              <Text
                className={`text-white ${isTablet ? "text-xl" : "text-xl"} font-semibold`}
              >
                {loading ? "Sending..." : "Send One-Time Password"}
              </Text>
            </TouchableOpacity>

            {/* Back to login */}
            <View className="flex-row justify-center mt-6">
              <TouchableOpacity onPress={() => router.back()}>
                <Text className="text-gray-500 text-base">
                  Back to{" "}
                  <Text className="text-primary-600 font-semibold">
                    Password Sign In
                  </Text>
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}