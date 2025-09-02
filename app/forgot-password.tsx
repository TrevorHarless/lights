import { Link, router } from "expo-router";
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

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const { resetPassword } = useAuth();

  const { width } = Dimensions.get("window");
  const isTablet = width >= 768;
  const containerMaxWidth = isTablet ? "max-w-lg" : "max-w-sm";
  const horizontalPadding = isTablet ? "px-12" : "px-6";
  const verticalSpacing = isTablet ? "space-y-6" : "space-y-4";
  const headerMargin = isTablet ? "mb-12" : "mb-10";
  const buttonMargin = isTablet ? "mt-10" : "mt-8";
  const footerMargin = isTablet ? "mt-12" : "mt-8";

  const handleResetPassword = async () => {
    if (!email) {
      Alert.alert("Error", "Please enter your email address");
      return;
    }

    if (!email.includes("@")) {
      Alert.alert("Error", "Please enter a valid email address");
      return;
    }

    setLoading(true);
    const { error } = await resetPassword(email);

    if (error) {
      Alert.alert("Error", error.message);
    } else {
      setEmailSent(true);
    }
    setLoading(false);
  };

  if (emailSent) {
    return (
      <SafeAreaView className="flex-1 bg-gradient-to-b from-primary-50 to-white">
        <ScrollView
          className={`flex-1 ${horizontalPadding}`}
          contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className={`w-full ${containerMaxWidth} self-center`}>
            <View className={`items-center ${headerMargin}`}>
              <Text
                className={`${isTablet ? "text-4xl" : "text-3xl"} font-bold text-gray-800 mb-2`}
              >
                Check Your Email
              </Text>
              <Text
                className={`text-center text-gray-600 ${isTablet ? "text-lg" : "text-base"} leading-relaxed`}
              >
                We&apos;ve sent a password reset link to {email}
              </Text>
            </View>

            <View className={`bg-green-50 border border-green-200 rounded-xl ${isTablet ? "p-6" : "p-4"} mb-6`}>
              <Text className={`text-green-800 ${isTablet ? "text-lg" : "text-base"} leading-relaxed`}>
                Click the link in your email to reset your password. The link will expire in 1 hour.
              </Text>
            </View>

            <TouchableOpacity
              className={`${buttonMargin} rounded-xl ${isTablet ? "py-5" : "py-4"} items-center shadow-medium bg-primary-600 active:bg-primary-700`}
              onPress={() => router.replace("/login")}
            >
              <Text
                className={`text-white ${isTablet ? "text-xl" : "text-xl"} font-semibold`}
              >
                Back to Sign In
              </Text>
            </TouchableOpacity>

            <View className={`flex-row justify-center ${footerMargin}`}>
              <Text
                className={`text-gray-500 ${isTablet ? "text-lg" : "text-base"}`}
              >
                Didn&apos;t receive the email?{" "}
              </Text>
              <TouchableOpacity onPress={() => setEmailSent(false)}>
                <Text
                  className={`text-primary-600 font-semibold ${isTablet ? "text-lg" : "text-base"}`}
                >
                  Try again
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

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
          <View className={`items-center ${headerMargin}`}>
            <Text
              className={`${isTablet ? "text-4xl" : "text-3xl"} font-bold text-gray-800 mb-2`}
            >
              Reset Password
            </Text>
            <Text
              className={`text-center text-gray-600 ${isTablet ? "text-lg" : "text-base"} leading-relaxed`}
            >
              Enter your email address and we&apos;ll send you a link to reset your password
            </Text>
          </View>

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
                onSubmitEditing={handleResetPassword}
              />
            </View>

            <TouchableOpacity
              className={`${buttonMargin} rounded-xl ${isTablet ? "py-5" : "py-4"} items-center shadow-medium ${
                loading ? "bg-gray-300" : "bg-primary-600 active:bg-primary-700"
              }`}
              onPress={handleResetPassword}
              disabled={loading}
            >
              <Text
                className={`text-white ${isTablet ? "text-xl" : "text-xl"} font-semibold`}
              >
                {loading ? "Sending..." : "Send Reset Link"}
              </Text>
            </TouchableOpacity>
          </View>

          <View className={`flex-row justify-center ${footerMargin}`}>
            <Text
              className={`text-gray-500 ${isTablet ? "text-lg" : "text-base"}`}
            >
              Remember your password?{" "}
            </Text>
            <Link href="/login">
              <Text
                className={`text-primary-600 font-semibold ${isTablet ? "text-lg" : "text-base"}`}
              >
                Sign in
              </Text>
            </Link>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}