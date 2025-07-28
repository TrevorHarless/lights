// components/projects/ImageCanvas.jsx
import React from 'react';
import { Image, StyleSheet, View } from 'react-native';

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
    <View style={styles.container} {...panHandlers}>
      <Image source={{ uri: imgSource }} style={styles.image} resizeMode="contain" />

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
});
