import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { TouchableOpacity, View } from 'react-native';

export function FloatingSelectionControls({
  // String selection props
  selectedStringId,
  selectedStringEndpoint,
  onDeleteString,
  onDeselectString,
  // Wreath selection props
  selectedWreathId,
  onDeleteWreath,
  onDeselectWreath,
  // Mode
  interactionMode = 'string',
}) {
  const hasStringSelection = selectedStringId && selectedStringEndpoint;
  const hasWreathSelection = selectedWreathId;
  
  if (!hasStringSelection && !hasWreathSelection) {
    return null;
  }

  const handleDelete = () => {
    if (hasWreathSelection && onDeleteWreath) {
      onDeleteWreath();
    } else if (hasStringSelection && onDeleteString) {
      onDeleteString(selectedStringId);
    }
  };

  return (
    <View style={{
      position: 'absolute',
      top: 120, // Above the image container, below the top toolbar
      right: 20,
      zIndex: 1001,
    }}>
      {/* Delete button - works for both strings and wreaths */}
      <TouchableOpacity 
        onPress={handleDelete}
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
