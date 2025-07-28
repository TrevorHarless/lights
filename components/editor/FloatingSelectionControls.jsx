import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

export function FloatingSelectionControls({
  selectedStringId,
  selectedStringEndpoint,
  onDeleteString,
  onDeselectString,
}) {
  if (!selectedStringId || !selectedStringEndpoint) {
    return null;
  }

  return (
    <View style={{
      position: 'absolute',
      top: 120, // Above the image container, below the top toolbar
      right: 20,
      zIndex: 1001,
    }}>
      {/* Delete button only - users can tap anywhere to deselect */}
      <TouchableOpacity 
        onPress={() => onDeleteString(selectedStringId)} 
        style={{
          width: 50,
          height: 50,
          borderRadius: 25,
          backgroundColor: '#EF4444',
          justifyContent: 'center',
          alignItems: 'center',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 4,
          elevation: 5,
        }}>
        <MaterialIcons name="delete" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
}
