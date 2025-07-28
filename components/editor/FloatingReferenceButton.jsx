import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

export function FloatingReferenceButton({
  hasReference,
  isSettingReference,
  onStartReference,
  onClearReference,
  referenceLength,
}) {
  if (isSettingReference) {
    return (
      <View className="absolute left-4 right-4 top-20 rounded-xl bg-primary-500/90 px-4 py-3">
        <Text className="text-center font-semibold text-white">Draw a reference line</Text>
        <Text className="mt-1 text-center text-xs text-white/80">
          Tap and drag to create a line of known length
        </Text>
      </View>
    );
  }

  if (hasReference) {
    return (
      <View className="absolute left-4 top-20 flex-row items-center rounded-xl bg-success-500/90 px-4 py-2">
        <Ionicons name="checkmark-circle" size={18} color="white" />
        <Text className="ml-2 font-semibold text-white">{referenceLength}ft reference</Text>
        <TouchableOpacity 
          onPress={onClearReference} 
          className="ml-3 rounded-xl bg-white/20 px-2 py-1">
          <Text className="text-xs font-semibold text-white">Clear</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <TouchableOpacity 
      onPress={onStartReference} 
      className="absolute left-4 top-20 flex-row items-center rounded-xl bg-warning-500/90 px-4 py-3 shadow-lg"
      style={{ elevation: 5 }}>
      <Ionicons name="resize" size={18} color="white" />
      <Text className="ml-2 font-semibold text-white">Set Scale</Text>
    </TouchableOpacity>
  );
}
