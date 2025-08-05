import React from 'react';
import { Text } from 'react-native';

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

  return (
    <Text className="absolute top-5 left-5 right-5 text-center text-white text-base bg-black/50 p-2.5 rounded-2xl z-10">
      {instructionText}
    </Text>
  );
};
