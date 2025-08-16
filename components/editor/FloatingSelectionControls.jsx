import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { Dimensions, TouchableOpacity, View } from 'react-native';

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
  // NEW: Single light selection props
  selectedSingleLightIds,
  onDeleteSingleLights,
  onDeselectSingleLights,
  // Mode
  interactionMode = 'string',
}) {
  // Device detection for responsive design
  const { width } = Dimensions.get('window');
  const isTablet = width >= 768;

  const hasStringSelection = selectedStringId && selectedStringEndpoint;
  const hasWreathSelection = selectedWreathId;
  const hasSingleLightSelection = selectedSingleLightIds && selectedSingleLightIds.length > 0;
  
  if (!hasStringSelection && !hasWreathSelection && !hasSingleLightSelection) {
    return null;
  }

  const handleDelete = () => {
    if (hasSingleLightSelection && onDeleteSingleLights) {
      onDeleteSingleLights();
    } else if (hasWreathSelection && onDeleteWreath) {
      onDeleteWreath();
    } else if (hasStringSelection && onDeleteString) {
      onDeleteString(selectedStringId);
    }
  };

  const handleDeselect = () => {
    if (hasSingleLightSelection && onDeselectSingleLights) {
      onDeselectSingleLights();
    } else if (hasWreathSelection && onDeselectWreath) {
      onDeselectWreath();
    } else if (hasStringSelection && onDeselectString) {
      onDeselectString();
    }
  };

  return (
    <View style={{
      position: 'absolute',
      top: isTablet ? 140 : 120, // Above the image container, below the top toolbar
      right: isTablet ? 24 : 20,
      zIndex: 1001,
      gap: isTablet ? 16 : 10,
    }}>
      {/* Delete button - works for strings, wreaths, and single lights */}
      <TouchableOpacity 
        onPress={handleDelete}
        style={{
          width: isTablet ? 60 : 50,
          height: isTablet ? 60 : 50,
          borderRadius: isTablet ? 30 : 25,
          backgroundColor: '#EF4444',
          justifyContent: 'center',
          alignItems: 'center',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 4,
          elevation: 5,
        }}>
        <MaterialIcons name="delete" size={isTablet ? 32 : 24} color="white" />
      </TouchableOpacity>

      {/* Deselect button - NEW for better UX */}
      <TouchableOpacity 
        onPress={handleDeselect}
        style={{
          width: isTablet ? 60 : 50,
          height: isTablet ? 60 : 50,
          borderRadius: isTablet ? 30 : 25,
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          justifyContent: 'center',
          alignItems: 'center',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.15,
          shadowRadius: 4,
          elevation: 5,
        }}>
        <MaterialIcons name="close" size={isTablet ? 32 : 24} color="#333" />
      </TouchableOpacity>
    </View>
  );
}
