import React from 'react';
import { StyleSheet, Text } from 'react-native';

export const InstructionOverlay = ({ selectedAsset, selectedStringId }) => {
  let instructionText = '';

  if (selectedStringId) {
    instructionText = 'Light string selected. Tap empty space to deselect.';
  } else if (selectedAsset) {
    instructionText = `Tap and drag to place ${selectedAsset.name} lights. Tap existing lights to select.`;
  } else {
    instructionText =
      'Select a light style from the options below, then tap existing lights to select or drag to create new ones.';
  }

  return <Text style={styles.instruction}>{instructionText}</Text>;
};

const styles = StyleSheet.create({
  instruction: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    textAlign: 'center',
    color: '#fff',
    fontSize: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 10,
    borderRadius: 10,
    zIndex: 10,
  },
});
