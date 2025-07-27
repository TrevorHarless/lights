import "../global.css"
import React, { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import { Link, router } from 'expo-router'
import { useAuth } from '@/contexts/AuthContext'

export default function SignUpScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { signUp } = useAuth()

  const handleSignUp = async () => {
    if (!email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields')
      return
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match')
      return
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters')
      return
    }

    setLoading(true)
    const { error } = await signUp(email, password)

    if (error) {
      Alert.alert('Error', error.message)
    } else {
      Alert.alert(
        'Success',
        'Account created successfully! Please check your email to verify your account.',
        [{ text: 'OK', onPress: () => router.replace('/login') }]
      )
    }
    setLoading(false)
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 justify-center px-6 bg-gradient-to-b from-primary-50 to-white"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View className="w-full max-w-sm self-center">
        {/* Header */}
        <View className="items-center mb-8">
          <View className="w-20 h-20 bg-success-500 rounded-3xl items-center justify-center mb-6 shadow-medium">
            <Text className="text-white text-3xl font-bold">+</Text>
          </View>
          <Text className="text-3xl font-bold text-gray-800 mb-2">Create Account</Text>
          <Text className="text-gray-500 text-center">Join Lights App and start managing your projects</Text>
        </View>
        
        {/* Form */}
        <View className="space-y-4">
          <View>
            <Text className="text-gray-700 font-medium mb-2 ml-1">Email</Text>
            <TextInput
              className="bg-white border border-gray-200 rounded-xl px-4 py-4 text-gray-800 text-base shadow-soft focus:border-primary-500 focus:shadow-medium"
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
            <Text className="text-gray-700 font-medium mb-2 ml-1">Password</Text>
            <TextInput
              className="bg-white border border-gray-200 rounded-xl px-4 py-4 text-gray-800 text-base shadow-soft focus:border-primary-500 focus:shadow-medium"
              placeholder="Create a password (min 6 characters)"
              placeholderTextColor="#9ca3af"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete="new-password"
            />
          </View>
          
          <View>
            <Text className="text-gray-700 font-medium mb-2 ml-1">Confirm Password</Text>
            <TextInput
              className="bg-white border border-gray-200 rounded-xl px-4 py-4 text-gray-800 text-base shadow-soft focus:border-primary-500 focus:shadow-medium"
              placeholder="Confirm your password"
              placeholderTextColor="#9ca3af"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              autoComplete="new-password"
            />
          </View>
          
          <TouchableOpacity
            className={`mt-6 rounded-xl py-4 items-center shadow-medium ${
              loading 
                ? 'bg-gray-300' 
                : 'bg-success-600 active:bg-success-700'
            }`}
            onPress={handleSignUp}
            disabled={loading}
          >
            <Text className="text-white text-base font-semibold">
              {loading ? 'Creating Account...' : 'Create Account'}
            </Text>
          </TouchableOpacity>
        </View>
        
        {/* Footer */}
        <View className="flex-row justify-center mt-8">
          <Text className="text-gray-500 text-base">Already have an account? </Text>
          <Link href="/login">
            <Text className="text-primary-600 font-semibold text-base">Sign in</Text>
          </Link>
        </View>
      </View>
    </KeyboardAvoidingView>
  )
}

