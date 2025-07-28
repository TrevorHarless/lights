import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

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
        <TouchableOpacity onPress={() => onDeleteString(selectedStringId)} style={styles.deleteButton}>
          <MaterialIcons name="delete" size={20} color="white" />
        </TouchableOpacity>
      </View>

      {/* Deselect button in top-left area */}
      <View style={styles.deselectContainer}>
        <TouchableOpacity onPress={onDeselectString} style={styles.deselectButton}>
          <MaterialIcons name="close" size={18} color="white" />
          <Text style={styles.deselectText}>Deselect</Text>
        </TouchableOpacity>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  deleteButton: {
    height: 40,
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: '#EF4444',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  deselectContainer: {
    position: 'absolute',
    left: 16,
    top: 128,
  },
  deselectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: 'rgba(55, 65, 81, 0.8)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  deselectText: {
    marginLeft: 8,
    fontWeight: '600',
    color: 'white',
  },
});
