import { Link, router } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Alert,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "~/contexts/AuthContext";
import "../global.css";

export default function SignUpScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const passwordRef = useRef<TextInput>(null);
  const confirmPasswordRef = useRef<TextInput>(null);

  const handleSignUp = async () => {
    if (!email || !password || !confirmPassword) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    const { error } = await signUp(email, password);

    if (error) {
      Alert.alert("Error", error.message);
    } else {
      Alert.alert(
        "Success",
        "Account created successfully! Please check your email to verify your account.",
        [{ text: "OK", onPress: () => router.replace("/login") }]
      );
    }
    setLoading(false);
  };

  return (
    <SafeAreaView className="flex-1 bg-gradient-to-b from-primary-50 to-white">
      <ScrollView
        className="flex-1 px-6"
        contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        showsVerticalScrollIndicator={false}
      >
        <View className="w-full max-w-sm self-center">
        {/* Header */}
        <View className="items-center mb-8">
          <Text className="text-3xl font-bold text-gray-800 mb-2">
            Create Account
          </Text>
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
              autoCorrect={false}
              spellCheck={false}
              enablesReturnKeyAutomatically={true}
              returnKeyType="next"
              blurOnSubmit={false}
              onSubmitEditing={() => passwordRef.current?.focus()}
            />
          </View>

          <View>
            <Text className="text-gray-700 font-medium mb-2 mt-4 ml-1">
              Password
            </Text>
            <TextInput
              ref={passwordRef}
              className="bg-white border border-gray-200 rounded-xl px-4 py-4 text-gray-800 shadow-sm focus:border-primary-500 focus:shadow-md"
              placeholder="Enter your password"
              placeholderTextColor="#9ca3af"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete="password"
              autoCorrect={false}
              spellCheck={false}
              enablesReturnKeyAutomatically={true}
              returnKeyType="next"
              blurOnSubmit={false}
              onSubmitEditing={() => confirmPasswordRef.current?.focus()}
            />
          </View>

          <View>
            <Text className="text-gray-700 font-medium mb-2 mt-4 ml-1">
              Password
            </Text>
            <TextInput
              ref={confirmPasswordRef}
              className="bg-white border border-gray-200 rounded-xl px-4 py-4 text-gray-800 shadow-sm focus:border-primary-500 focus:shadow-md"
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
            className={`mt-6 rounded-xl py-4 items-center shadow-medium ${
              loading ? "bg-gray-300" : "bg-success-600 active:bg-success-700"
            }`}
            onPress={handleSignUp}
            disabled={loading}
          >
            <Text className="text-white font-semibold">
              {loading ? "Creating Account..." : "Create Account"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View className="flex-row justify-center mt-8">
          <Text className="text-gray-500 ">Already have an account? </Text>
          <Link href="/login">
            <Text className="text-primary-600 font-semibold">Sign in</Text>
          </Link>
        </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
