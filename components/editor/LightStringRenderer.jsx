// components/projects/LightStringRenderer.jsx
import React from 'react';
import { View } from 'react-native';
import Svg, { G, Path } from 'react-native-svg';

export const LightStringRenderer = ({
  lightStrings,
  currentVector,
  isDragging,
  selectedStringId,
  getAssetById,
  calculateLightPositions,
  onDeleteString, // Keep for compatibility but we won't use it directly
  getLightSizeScale, // New prop for light size scaling
}) => {
  // Render saved light strings
  const renderLightStrings = () => {
    // Only render light strings and their highlighting, delete button is handled separately
    return (
      <>
        {/* Render all light strings and their highlighting */}
        {lightStrings.map((string) => {
          const asset = getAssetById(string.assetId);
          if (!asset) return null;

          const positions = calculateLightPositions(string, asset.spacing);
          const isSelected = string.id === selectedStringId;

          return (
            <View
              key={string.id}
              className="absolute inset-0 z-20"
              pointerEvents="none">
              <Svg width="100%" height="100%">
                {/* Render selection highlighting if this string is selected */}
                {isSelected && (
                  <Path
                    d={`M${string.start.x},${string.start.y} L${string.end.x},${string.end.y}`}
                    stroke="#007aff"
                    strokeWidth="3"
                    strokeOpacity="0.7"
                  />
                )}

                {/* Render the lights along the path */}
                {positions.map((pos, idx) => {
                  const lightScale = getLightSizeScale ? getLightSizeScale() : 1;
                  const scaledOffset = 15 * lightScale; // Half of base size (30) scaled
                  return (
                    <G key={idx} x={pos.x - scaledOffset} y={pos.y - scaledOffset}>
                      {asset.svg(lightScale)}
                    </G>
                  );
                })}
              </Svg>
            </View>
          );
        })}
      </>
    );
  };

  // Render current vector while dragging
  const renderCurrentVector = () => {
    if (!currentVector || !isDragging) return null;

    const asset = getAssetById(currentVector.assetId);
    if (!asset) return null;

    const positions = calculateLightPositions(currentVector, asset.spacing);

    return (
      <View className="absolute inset-0 z-20" pointerEvents="none">
        <Svg width="100%" height="100%">
          {/* Render the dashed line ONLY during dragging */}
          <Path
            d={`M${currentVector.start.x},${currentVector.start.y} L${currentVector.end.x},${currentVector.end.y}`}
            stroke="#333333"
            strokeWidth="1"
            strokeDasharray="5,5"
          />

          {/* Render lights along the path */}
          {positions.map((pos, idx) => {
            const lightScale = getLightSizeScale ? getLightSizeScale() : 1;
            const scaledOffset = 15 * lightScale; // Half of base size (30) scaled
            return (
              <G key={idx} x={pos.x - scaledOffset} y={pos.y - scaledOffset}>
                {asset.svg(lightScale)}
              </G>
            );
          })}
        </Svg>
      </View>
    );
  };

  return (
    <View className="absolute inset-0 z-10" pointerEvents="box-none">
      {renderLightStrings()}
      {renderCurrentVector()}
    </View>
  );
};
