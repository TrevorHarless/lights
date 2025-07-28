import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { Animated, StyleSheet, TouchableOpacity } from 'react-native';

/**
 * A standalone delete button component that's rendered directly at the root level
 * to ensure it's always accessible regardless of z-index or touch event issues.
 */
export const DirectDeleteButton = ({ position, stringId, onDelete }) => {
  if (!position || !stringId) return null;

  return (
    <TouchableOpacity
      style={[
        styles.deleteButton,
        {
          position: 'absolute',
          left: position.x - 18,
          top: position.y - 18,
          zIndex: 9999, // Extremely high to ensure it's on top
        },
      ]}
      hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }} // Larger touch area
      activeOpacity={0.7}
      onPress={() => {
        console.log(`Direct delete button pressed for string ID: ${stringId}`);
        onDelete(stringId);
      }}>
      <MaterialIcons name="delete" size={24} color="#fff" />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  deleteButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#ff3b30',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 10,
  },
});
