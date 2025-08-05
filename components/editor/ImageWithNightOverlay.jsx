import React, { useState } from 'react';
import { Image, View, StyleSheet } from 'react-native';

export function ImageWithNightOverlay({ 
  source, 
  nightModeEnabled, 
  nightModeIntensity, 
  style,
  ...props 
}) {
  const [imageDimensions, setImageDimensions] = useState(null);
  const [containerDimensions, setContainerDimensions] = useState(null);

  const handleImageLoad = (event) => {
    const { width, height } = event.nativeEvent.source;
    setImageDimensions({ width, height });
  };

  const handleContainerLayout = (event) => {
    const { width, height } = event.nativeEvent.layout;
    setContainerDimensions({ width, height });
  };

  // Calculate the actual image position and size when using resizeMode="contain"
  const getImageOverlayStyle = () => {
    if (!imageDimensions || !containerDimensions) {
      return { display: 'none' };
    }

    const imageAspectRatio = imageDimensions.width / imageDimensions.height;
    const containerAspectRatio = containerDimensions.width / containerDimensions.height;

    let imageWidth, imageHeight, imageTop, imageLeft;

    if (imageAspectRatio > containerAspectRatio) {
      // Image is wider - constrained by container width
      imageWidth = containerDimensions.width;
      imageHeight = containerDimensions.width / imageAspectRatio;
      imageLeft = 0;
      imageTop = (containerDimensions.height - imageHeight) / 2;
    } else {
      // Image is taller - constrained by container height
      imageHeight = containerDimensions.height;
      imageWidth = containerDimensions.height * imageAspectRatio;
      imageTop = 0;
      imageLeft = (containerDimensions.width - imageWidth) / 2;
    }

    return {
      position: 'absolute',
      top: imageTop,
      left: imageLeft,
      width: imageWidth,
      height: imageHeight,
      backgroundColor: '#0a1632',
      opacity: nightModeIntensity,
      zIndex: 2,
    };
  };

  return (
    <View style={style} onLayout={handleContainerLayout}>
      <Image
        source={source}
        style={StyleSheet.absoluteFill}
        resizeMode="contain"
        onLoad={handleImageLoad}
        {...props}
      />
      
      {nightModeEnabled && (
        <View
          style={getImageOverlayStyle()}
          pointerEvents="none"
        />
      )}
    </View>
  );
}