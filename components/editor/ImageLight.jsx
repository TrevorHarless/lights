// components/editor/ImageLight.jsx
import React from 'react';
import { Image } from 'react-native';

const ImageLight = ({ 
  position, 
  scale = 1, 
  opacity = 1,
  imageSource,
  style = {}
}) => {
  // Base size for the image - you can adjust this based on your image export size
  const baseSize = 128 * scale; // Assuming your image export is around 48px
  const centerX = position.x;
  const centerY = position.y;

  return (
    <Image
      source={imageSource}
      pointerEvents="none" // Allow touch events to pass through to the gesture handler
      style={[
        {
          position: 'absolute',
          left: centerX - baseSize / 2,
          top: centerY - baseSize / 2,
          width: baseSize,
          height: baseSize,
          opacity: opacity,
          // Ensure image scales properly
          resizeMode: 'contain',
        },
        style
      ]}
    />
  );
};

export default ImageLight;