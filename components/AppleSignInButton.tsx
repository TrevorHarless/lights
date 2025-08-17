import React, { useState } from 'react';
import { Alert, Platform } from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import { router } from 'expo-router';
import { useAuth } from '~/contexts/AuthContext';

interface AppleSignInButtonProps {
  buttonType?: AppleAuthentication.AppleAuthenticationButtonType;
  buttonStyle?: AppleAuthentication.AppleAuthenticationButtonStyle;
  cornerRadius?: number;
  style?: any;
}

export default function AppleSignInButton({
  buttonType = AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN,
  buttonStyle = AppleAuthentication.AppleAuthenticationButtonStyle.BLACK,
  cornerRadius = 12,
  style,
}: AppleSignInButtonProps) {
  const [loading, setLoading] = useState(false);
  const { signInWithApple } = useAuth();

  const handleAppleSignIn = async () => {
    if (Platform.OS !== 'ios') {
      Alert.alert('Not Available', 'Apple Sign In is only available on iOS devices');
      return;
    }

    setLoading(true);
    const { error } = await signInWithApple();
    
    if (error) {
      if (error.message !== 'User canceled Apple sign-in') {
        Alert.alert('Sign In Error', error.message || 'Failed to sign in with Apple');
      }
    } else {
      router.replace('/');
    }
    
    setLoading(false);
  };

  if (Platform.OS !== 'ios') {
    return null;
  }

  return (
    <AppleAuthentication.AppleAuthenticationButton
      buttonType={buttonType}
      buttonStyle={buttonStyle}
      cornerRadius={cornerRadius}
      style={[{ opacity: loading ? 0.6 : 1 }, style]}
      onPress={handleAppleSignIn}
      disabled={loading}
    />
  );
}