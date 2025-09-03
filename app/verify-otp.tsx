import { router, useLocalSearchParams } from "expo-router";
import React, { useState, useRef } from "react";
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

export default function VerifyOTPScreen() {
  const { email } = useLocalSearchParams<{ email: string }>();
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const { verifyOTP, signInWithOTP } = useAuth();
  const otpInputRef = useRef<TextInput>(null);

  const { width } = Dimensions.get("window");
  const isTablet = width >= 768;
  const containerMaxWidth = isTablet ? "max-w-lg" : "max-w-sm";
  const horizontalPadding = isTablet ? "px-12" : "px-6";
  const verticalSpacing = isTablet ? "space-y-6" : "space-y-4";
  const headerMargin = isTablet ? "mb-12" : "mb-10";
  const buttonMargin = isTablet ? "mt-10" : "mt-8";

  const handleVerifyOTP = async () => {
    if (!otp) {
      Alert.alert("Error", "Please enter the verification code");
      return;
    }

    if (otp.length !== 6) {
      Alert.alert("Error", "Please enter a valid 6-digit code");
      return;
    }

    if (!email) {
      Alert.alert("Error", "Email information is missing");
      return;
    }

    console.log("🔐 OTP: Attempting to verify OTP for:", email);
    setLoading(true);

    try {
      const { error } = await verifyOTP(email, otp);

      if (error) {
        console.error("🔐 OTP: Failed to verify OTP:", error.message);
        Alert.alert(
          "Verification Failed",
          error.message.includes("expired") 
            ? "Your verification code has expired. Please request a new one."
            : error.message.includes("invalid")
            ? "Invalid verification code. Please check your code and try again."
            : error.message
        );
      } else {
        console.log("🔐 OTP: Successfully verified OTP");
        router.replace("/");
      }
    } catch (error: any) {
      console.error("🔐 OTP: Exception while verifying OTP:", error);
      Alert.alert("Error", "Failed to verify code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!email) return;

    setResending(true);
    try {
      const { error } = await signInWithOTP(email);
      
      if (error) {
        Alert.alert("Error", error.message);
      } else {
        Alert.alert("Code Resent", "A new verification code has been sent to your email.");
        setOtp(""); // Clear current input
      }
    } catch (error: any) {
      console.error("🔐 OTP: Failed to resend OTP:", error);
      Alert.alert("Error", "Failed to resend code. Please try again.");
    } finally {
      setResending(false);
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
              Enter Verification Code
            </Text>
            <Text className="text-gray-600 text-center mt-2 px-4">
              We&apos;ve sent a 6-digit code to
            </Text>
            <Text className="text-primary-600 font-semibold text-center mt-1">
              {email}
            </Text>
          </View>

          {/* Form */}
          <View className={verticalSpacing}>
            <View>
              <Text className="text-gray-700 font-medium mb-2 ml-1 text-center">
                Verification Code
              </Text>
              <TextInput
                ref={otpInputRef}
                className={`bg-white border border-gray-200 rounded-xl ${isTablet ? "p-5" : "p-4"} text-gray-800 shadow-sm focus:border-primary-500 focus:shadow-md text-center text-2xl font-mono tracking-widest`}
                style={{ fontSize: isTablet ? 24 : 20, fontWeight: "600" }}
                placeholder="000000"
                placeholderTextColor="#9ca3af"
                value={otp}
                onChangeText={(text) => {
                  // Only allow numbers and limit to 6 digits
                  const numericText = text.replace(/[^0-9]/g, '').substring(0, 6);
                  setOtp(numericText);
                }}
                keyboardType="number-pad"
                maxLength={6}
                autoComplete="one-time-code"
                textContentType="oneTimeCode"
                autoCorrect={false}
                spellCheck={false}
                enablesReturnKeyAutomatically={true}
                returnKeyType="done"
                onSubmitEditing={handleVerifyOTP}
                autoFocus={true}
              />
            </View>

            {/* Info Box */}
            <View className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <Text className="text-blue-800 text-sm text-center">
                Enter the 6-digit code from your email. The code will expire in 1 hour.
              </Text>
            </View>

            <TouchableOpacity
              className={`${buttonMargin} rounded-xl ${isTablet ? "py-5" : "py-4"} items-center shadow-medium ${
                loading ? "bg-gray-300" : "bg-primary-600 active:bg-primary-700"
              }`}
              onPress={handleVerifyOTP}
              disabled={loading}
            >
              <Text
                className={`text-white ${isTablet ? "text-xl" : "text-xl"} font-semibold`}
              >
                {loading ? "Verifying..." : "Verify Code"}
              </Text>
            </TouchableOpacity>

            {/* Resend Code */}
            <View className="flex-row justify-center mt-6">
              <Text className="text-gray-500 text-base">
                Didn&apos;t receive the code?{" "}
              </Text>
              <TouchableOpacity onPress={handleResendOTP} disabled={resending}>
                <Text className="text-primary-600 font-semibold text-base">
                  {resending ? "Sending..." : "Resend"}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Back to OTP */}
            <View className="flex-row justify-center mt-4">
              <TouchableOpacity onPress={() => router.back()}>
                <Text className="text-gray-500 text-base">
                  Back to{" "}
                  <Text className="text-primary-600 font-semibold">
                    Email Entry
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