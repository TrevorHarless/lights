import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { Dimensions, TouchableOpacity, View } from 'react-native';

export function FloatingSelectionControls({
  // String selection props
  selectedStringId,
  selectedStringEndpoint,
  onDeleteString,
  onDeselectString,
  // Decor selection props
  selectedDecorId,
  onDeleteDecor,
  onDeselectDecor,
  // Singular light selection props
  selectedLightId,
  onDeleteSingularLight,
  onDeselectSingularLight,
  // Measurement line selection props
  selectedMeasurementId,
  onDeleteMeasurementLine,
  onDeselectMeasurementLine,
  // Mode
  interactionMode = 'string',
}) {
  // Device detection for responsive design
  const { width } = Dimensions.get('window');
  const isTablet = width >= 768;

  const hasStringSelection = selectedStringId && selectedStringEndpoint;
  const hasDecorSelection = selectedDecorId;
  const hasSingularLightSelection = selectedLightId;
  const hasMeasurementSelection = selectedMeasurementId;
  
  if (!hasStringSelection && !hasDecorSelection && !hasSingularLightSelection && !hasMeasurementSelection) {
    return null;
  }

  const handleDelete = () => {
    if (hasDecorSelection && onDeleteDecor) {
      onDeleteDecor();
    } else if (hasSingularLightSelection && onDeleteSingularLight) {
      onDeleteSingularLight();
    } else if (hasMeasurementSelection && onDeleteMeasurementLine) {
      onDeleteMeasurementLine(selectedMeasurementId);
    } else if (hasStringSelection && onDeleteString) {
      onDeleteString(selectedStringId);
    }
  };

  const handleDeselect = () => {
    if (hasDecorSelection && onDeselectDecor) {
      onDeselectDecor();
    } else if (hasSingularLightSelection && onDeselectSingularLight) {
      onDeselectSingularLight();
    } else if (hasMeasurementSelection && onDeselectMeasurementLine) {
      onDeselectMeasurementLine();
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
      {/* Delete button - works for strings and decor */}
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

      {/* Deselect button */}
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
