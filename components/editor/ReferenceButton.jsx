import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

export function ReferenceButton({
  hasReference,
  isSettingReference,
  onStartReference,
  onClearReference,
  referenceLength,
}) {
  if (isSettingReference) {
    return (
      <View className="rounded-lg border border-blue-300 bg-blue-100 px-4 py-2">
        <Text className="text-center font-medium text-blue-700">
          Draw a reference line on the image
        </Text>
        <Text className="mt-1 text-center text-xs text-blue-600">
          Tap and drag to create a line of known length
        </Text>
      </View>
    );
  }

  if (hasReference) {
    return (
      <View className="rounded-lg border border-green-200 bg-green-50">
        <View className="flex-row items-center justify-between px-4 py-2">
          <View className="flex-row items-center">
            <Ionicons name="checkmark-circle" size={16} color="#059669" />
            <Text className="ml-2 font-medium text-green-700">Reference: {referenceLength}ft</Text>
          </View>
          <TouchableOpacity onPress={onClearReference} className="rounded bg-green-600 px-3 py-1">
            <Text className="text-xs font-medium text-white">Clear</Text>
          </TouchableOpacity>
        </View>
        <Text className="px-4 pb-2 text-xs text-green-600">
          Lights are now scaled to realistic size
        </Text>
      </View>
    );
  }

  return (
    <TouchableOpacity
      onPress={onStartReference}
      className="flex-row items-center justify-center rounded-lg bg-orange-500 px-4 py-3">
      <Ionicons name="resize" size={18} color="white" />
      <Text className="ml-2 font-medium text-white">Set Scale Reference</Text>
    </TouchableOpacity>
  );
}
