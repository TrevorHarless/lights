// components/projects/ImageCanvas.jsx
import React from 'react';
import { Image, View } from 'react-native';

import { LightStringRenderer } from './LightStringRenderer';

export const ImageCanvas = ({
  imgSource,
  lightStrings,
  currentVector,
  isDragging,
  selectedStringId,
  getAssetById,
  calculateLightPositions,
  onDeleteString,
  panHandlers,
}) => {
  return (
    <View className="flex-1 justify-center items-center" {...panHandlers}>
      <Image source={{ uri: imgSource }} className="w-full h-full" resizeMode="contain" />

      <LightStringRenderer
        lightStrings={lightStrings}
        currentVector={currentVector}
        isDragging={isDragging}
        selectedStringId={selectedStringId}
        getAssetById={getAssetById}
        calculateLightPositions={calculateLightPositions}
        onDeleteString={onDeleteString}
      />

      {/* NightModeOverlay will be rendered as a sibling in the parent component */}
    </View>
  );
};
