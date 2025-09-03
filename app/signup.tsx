import * as AppleAuthentication from "expo-apple-authentication";
import { Link, router } from "expo-router";
import React, { useRef, useState } from "react";
import {
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
import ErrorMessage from "~/components/ui/ErrorMessage";
import PasswordRequirements from "~/components/ui/PasswordRequirements";
import { useAuth } from "~/contexts/AuthContext";
import "../global.css";

export default function SignUpScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showPasswordRequirements, setShowPasswordRequirements] =
    useState(false);
  const { signUp } = useAuth();
  const passwordRef = useRef<TextInput>(null);
  const confirmPasswordRef = useRef<TextInput>(null);

  const { width } = Dimensions.get("window");
  const isTablet = width >= 768;
  const containerMaxWidth = isTablet ? "max-w-lg" : "max-w-sm";
  const horizontalPadding = isTablet ? "px-12" : "px-6";
  const verticalSpacing = isTablet ? "space-y-6" : "space-y-4";
  const headerMargin = isTablet ? "mb-10" : "mb-8";
  const buttonMargin = isTablet ? "mt-8" : "mt-6";
  const footerMargin = isTablet ? "mt-12" : "mt-8";

  const handleSignUp = async () => {
    // Clear previous messages
    setErrorMessage("");
    setSuccessMessage("");

    if (!email || !password || !confirmPassword) {
      setErrorMessage("Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    const { error } = await signUp(email, password);

    if (error) {
      // Customize password requirement error messages
      let errorMsg = error.message;
      if (error.message.includes("Password should contain")) {
        errorMsg =
          "Password must contain at least:\n• 1 uppercase letter (A-Z)\n• 1 lowercase letter (a-z)\n• 1 number (0-9)";
      }
      setErrorMessage(errorMsg);
    } else {
      setSuccessMessage(
        "Account created successfully! Please check your email to verify your account."
      );
      // Redirect after showing success message
      setTimeout(() => {
        router.replace("/login");
      }, 10000);
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
              Create Account
            </Text>
            {isTablet && (
              <Text className="text-gray-500 text-lg mt-2">
                Join us and get started today
              </Text>
            )}
          </View>

          {/* Form */}
          <View className={verticalSpacing}>
            {/* Error and Success Messages */}
            <ErrorMessage
              message={errorMessage}
              visible={!!errorMessage}
              type="error"
            />
            <ErrorMessage
              message={successMessage}
              visible={!!successMessage}
              type="info"
            />
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
                keyboardType="email-address"
                autoComplete="email"
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
                onFocus={() => setShowPasswordRequirements(true)}
                onBlur={() => setShowPasswordRequirements(false)}
                secureTextEntry
                autoComplete="password"
                autoCorrect={false}
                spellCheck={false}
                enablesReturnKeyAutomatically={true}
                returnKeyType="next"
                blurOnSubmit={false}
                onSubmitEditing={() => confirmPasswordRef.current?.focus()}
              />
              <PasswordRequirements
                password={password}
                visible={showPasswordRequirements}
              />
            </View>

            <View>
              <Text
                className={`text-gray-700 font-medium mb-2 ${isTablet ? "mt-6" : "mt-4"} ml-1`}
              >
                Confirm Password
              </Text>
              <TextInput
                ref={confirmPasswordRef}
                className={`bg-white border border-gray-200 rounded-xl ${isTablet ? "px-5 py-5" : "px-4 py-4"} text-gray-800 shadow-sm focus:border-primary-500 focus:shadow-md`}
                style={{ fontSize: isTablet ? 18 : 16, fontWeight: "500" }}
                placeholder="Confirm your password"
                placeholderTextColor="#9ca3af"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                autoComplete="new-password"
                autoCorrect={false}
                spellCheck={false}
                enablesReturnKeyAutomatically={true}
                returnKeyType="done"
                blurOnSubmit={true}
                onSubmitEditing={handleSignUp}
              />
            </View>

            <TouchableOpacity
              className={`${buttonMargin} rounded-xl ${isTablet ? "py-5" : "py-4"} items-center shadow-medium ${
                loading ? "bg-gray-300" : "bg-success-600 active:bg-success-700"
              }`}
              onPress={handleSignUp}
              disabled={loading}
            >
              <Text
                className={`text-white ${isTablet ? "text-xl" : "text-xl"} font-semibold`}
              >
                {loading ? "Creating Account..." : "Create Account"}
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
                  buttonType={
                    AppleAuthentication.AppleAuthenticationButtonType.SIGN_UP
                  }
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
              Already have an account?{" "}
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
