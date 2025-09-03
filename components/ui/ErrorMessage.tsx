import React from 'react';
import { Text, View } from 'react-native';

interface ErrorMessageProps {
  message?: string;
  visible?: boolean;
  type?: 'error' | 'warning' | 'info';
}

export default function ErrorMessage({ 
  message, 
  visible = false, 
  type = 'error' 
}: ErrorMessageProps) {
  if (!visible || !message) return null;

  const getStyles = () => {
    switch (type) {
      case 'warning':
        return {
          container: 'bg-amber-50 border border-amber-200',
          text: 'text-amber-800',
          icon: '⚠️'
        };
      case 'info':
        return {
          container: 'bg-blue-50 border border-blue-200',
          text: 'text-blue-800',
          icon: 'ℹ️'
        };
      default:
        return {
          container: 'bg-red-50 border border-red-200',
          text: 'text-red-800',
          icon: '❌'
        };
    }
  };

  const styles = getStyles();

  return (
    <View className={`${styles.container} rounded-lg p-3 mb-4`}>
      <View className="flex-row items-start">
        <Text className="text-base mr-2">{styles.icon}</Text>
        <Text className={`${styles.text} text-sm flex-1 leading-5`}>
          {message}
        </Text>
      </View>
    </View>
  );
}