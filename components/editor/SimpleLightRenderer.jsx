// components/editor/SimpleLightRenderer.jsx
import React, { useMemo } from 'react';
import { View } from 'react-native';

const SimpleLightRenderer = ({
  lightStrings,
  currentVector,
  isDragging,
  selectedStringId,
  getAssetById,
  calculateLightPositions,
  getLightSizeScale,
  getLightRenderStyle,
}) => {
  const lightScale = getLightSizeScale ? getLightSizeScale() : 1;

  // Memoize all light positions and styles - MUCH simpler than SVG
  const { lightViews, selectionLines, selectionHandles, currentVectorLine } = useMemo(() => {
    const views = [];
    const lines = [];
    const handles = [];
    let vectorLine = null;

    // Process existing light strings
    lightStrings.forEach((string) => {
      const asset = getAssetById(string.assetId);
      if (!asset) return;

      const positions = calculateLightPositions(string, asset.spacing);
      const isSelected = string.id === selectedStringId;

      // Add selection line if selected
      if (isSelected && positions.length >= 2) {
        const start = positions[0];
        const end = positions[positions.length - 1];
        const angle = Math.atan2(end.y - start.y, end.x - start.x);
        const length = Math.sqrt((end.x - start.x) ** 2 + (end.y - start.y) ** 2);
        
        lines.push(
          <View
            key={`selection-${string.id}`}
            style={{
              position: 'absolute',
              left: start.x,
              top: start.y - 1.5,
              width: length,
              height: 3,
              backgroundColor: '#007aff',
              opacity: 0.7,
              transform: [{ rotate: `${angle}rad` }],
              transformOrigin: 'left center',
            }}
          />
        );

        // Add handles at start and end points
        const handleSize = 12;
        const handleRadius = handleSize / 2;
        
        // Start handle
        handles.push(
          <View
            key={`handle-start-${string.id}`}
            style={{
              position: 'absolute',
              left: start.x - handleRadius,
              top: start.y - handleRadius,
              width: handleSize,
              height: handleSize,
              borderRadius: handleRadius,
              backgroundColor: '#007aff',
              borderWidth: 2,
              borderColor: '#ffffff',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.3,
              shadowRadius: 2,
              elevation: 3,
            }}
          />
        );

        // End handle
        handles.push(
          <View
            key={`handle-end-${string.id}`}
            style={{
              position: 'absolute',
              left: end.x - handleRadius,
              top: end.y - handleRadius,
              width: handleSize,
              height: handleSize,
              borderRadius: handleRadius,
              backgroundColor: '#007aff',
              borderWidth: 2,
              borderColor: '#ffffff',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.3,
              shadowRadius: 2,
              elevation: 3,
            }}
          />
        );
      }

      // Add lights as simple Views
      positions.forEach((pos, idx) => {
        const lightStyle = getLightRenderStyle ? getLightRenderStyle(asset.id, lightScale, idx) : getFallbackStyle(asset.id, lightScale);
        if (lightStyle) {
          views.push(
            <View
              key={`${string.id}-${idx}`}
              style={[
                lightStyle,
                {
                  position: 'absolute',
                  left: pos.x - lightStyle.width / 2,
                  top: pos.y - lightStyle.height / 2,
                }
              ]}
            />
          );
        }
      });
    });

    // Process current vector if dragging
    if (currentVector && isDragging) {
      const asset = getAssetById(currentVector.assetId);
      if (asset) {
        const positions = calculateLightPositions(currentVector, asset.spacing);
        
        // Add dashed line (simplified as multiple small rectangles)
        const start = currentVector.start;
        const end = currentVector.end;
        const length = Math.sqrt((end.x - start.x) ** 2 + (end.y - start.y) ** 2);
        const angle = Math.atan2(end.y - start.y, end.x - start.x);
        const dashCount = Math.floor(length / 10);
        
        const dashViews = [];
        for (let i = 0; i < dashCount; i += 2) { // Every other dash to create dashed effect
          const progress = i / dashCount;
          const x = start.x + (end.x - start.x) * progress;
          const y = start.y + (end.y - start.y) * progress;
          
          dashViews.push(
            <View
              key={`dash-${i}`}
              style={{
                position: 'absolute',
                left: x,
                top: y - 0.5,
                width: 5,
                height: 1,
                backgroundColor: '#333333',
                transform: [{ rotate: `${angle}rad` }],
              }}
            />
          );
        }
        
        vectorLine = <>{dashViews}</>;

        // Add current vector lights
        positions.forEach((pos, idx) => {
          const lightStyle = getLightRenderStyle ? getLightRenderStyle(asset.id, lightScale, idx) : getFallbackStyle(asset.id, lightScale);
          if (lightStyle) {
            views.push(
              <View
                key={`current-${idx}`}
                style={[
                  lightStyle,
                  {
                    position: 'absolute',
                    left: pos.x - lightStyle.width / 2,
                    top: pos.y - lightStyle.height / 2,
                    opacity: 0.8, // Slightly transparent for preview
                  }
                ]}
              />
            );
          }
        });
      }
    }

    return {
      lightViews: views,
      selectionLines: lines,
      selectionHandles: handles,
      currentVectorLine: vectorLine,
    };
  }, [lightStrings, currentVector, isDragging, selectedStringId, getAssetById, calculateLightPositions, lightScale, getLightRenderStyle]);

  if (!lightViews.length && !currentVectorLine) {
    return null;
  }

  return (
    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} pointerEvents="none">
      {selectionLines}
      {selectionHandles}
      {currentVectorLine}
      {lightViews}
    </View>
  );
};

// Simple fallback for when getLightRenderStyle is not available
const getFallbackStyle = (assetId, scale = 1) => {
  const baseSize = 8 * scale;
  const glowSize = baseSize * 1.8;
  
  return {
    width: glowSize,
    height: glowSize,
    borderRadius: glowSize / 2,
    backgroundColor: '#ffffff',
    shadowColor: '#ffffff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: baseSize * 0.4,
  };
};

export default React.memo(SimpleLightRenderer);