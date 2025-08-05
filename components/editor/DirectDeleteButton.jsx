import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { Animated, TouchableOpacity } from 'react-native';

/**
 * A standalone delete button component that's rendered directly at the root level
 * to ensure it's always accessible regardless of z-index or touch event issues.
 */
export const DirectDeleteButton = ({ position, stringId, onDelete }) => {
  if (!position || !stringId) return null;

  return (
    <TouchableOpacity
      className="w-9 h-9 rounded-full bg-danger-500 justify-center items-center shadow-lg absolute"
      style={{
        left: position.x - 18,
        top: position.y - 18,
        zIndex: 9999,
        elevation: 10,
      }}
      hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
      activeOpacity={0.7}
      onPress={() => {
        console.log(`Direct delete button pressed for string ID: ${stringId}`);
        onDelete(stringId);
      }}>
      <MaterialIcons name="delete" size={24} color="#fff" />
    </TouchableOpacity>
  );
};
