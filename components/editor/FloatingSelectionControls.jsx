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
    <>
      {/* Delete button near the end of the selected string */}
      <View
        style={{
          position: 'absolute',
          left: selectedStringEndpoint.x - 20,
          top: selectedStringEndpoint.y - 40,
          zIndex: 1000,
        }}>
        <TouchableOpacity 
          onPress={() => onDeleteString(selectedStringId)} 
          className="h-10 w-10 items-center justify-center rounded-full bg-danger-500 shadow-lg"
          style={{ elevation: 5 }}>
          <MaterialIcons name="delete" size={20} color="white" />
        </TouchableOpacity>
      </View>

      {/* Deselect button in top-left area */}
      <View className="absolute left-4 top-32">
        <TouchableOpacity 
          onPress={onDeselectString} 
          className="flex-row items-center rounded-xl bg-gray-700/80 px-4 py-2 shadow-lg"
          style={{ elevation: 5 }}>
          <MaterialIcons name="close" size={18} color="white" />
          <Text className="ml-2 font-semibold text-white">Deselect</Text>
        </TouchableOpacity>
      </View>
    </>
  );
}
