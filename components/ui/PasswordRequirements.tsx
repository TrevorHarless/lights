import React from 'react';
import { Text, View } from 'react-native';

interface PasswordRequirementsProps {
  password: string;
  visible?: boolean;
}

export default function PasswordRequirements({ 
  password, 
  visible = false 
}: PasswordRequirementsProps) {
  if (!visible) return null;

  const requirements = [
    { 
      text: 'At least 1 uppercase letter (A-Z)', 
      met: /[A-Z]/.test(password) 
    },
    { 
      text: 'At least 1 lowercase letter (a-z)', 
      met: /[a-z]/.test(password) 
    },
    { 
      text: 'At least 1 number (0-9)', 
      met: /[0-9]/.test(password) 
    },
    { 
      text: 'Minimum 6 characters', 
      met: password.length >= 6 
    }
  ];

  return (
    <View className="bg-gray-50 border border-gray-200 rounded-lg p-3 mt-2">
      <Text className="text-gray-700 text-sm font-medium mb-2">
        Password Requirements:
      </Text>
      {requirements.map((req, index) => (
        <View key={index} className="flex-row items-center mb-1">
          <Text className={`text-sm mr-2 ${req.met ? 'text-green-600' : 'text-gray-400'}`}>
            {req.met ? '✓' : '○'}
          </Text>
          <Text className={`text-sm ${req.met ? 'text-green-700' : 'text-gray-600'}`}>
            {req.text}
          </Text>
        </View>
      ))}
    </View>
  );
}