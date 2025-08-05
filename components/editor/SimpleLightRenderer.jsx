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
}) => {
  const lightScale = getLightSizeScale ? getLightSizeScale() : 1;

  // Memoize all light positions and styles - MUCH simpler than SVG
  const { lightViews, selectionLines, currentVectorLine } = useMemo(() => {
    const views = [];
    const lines = [];
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
      }

      // Add lights as simple Views
      positions.forEach((pos, idx) => {
        const lightStyle = getLightStyle(asset.id, lightScale, idx);
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
          const lightStyle = getLightStyle(asset.id, lightScale, idx);
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
        });
      }
    }

    return {
      lightViews: views,
      selectionLines: lines,
      currentVectorLine: vectorLine,
    };
  }, [lightStrings, currentVector, isDragging, selectedStringId, getAssetById, calculateLightPositions, lightScale]);

  if (!lightViews.length && !currentVectorLine) {
    return null;
  }

  return (
    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} pointerEvents="none">
      {selectionLines}
      {currentVectorLine}
      {lightViews}
    </View>
  );
};

// Ultra-simple light styles - just colored circles with glow effect
const getLightStyle = (assetId, scale, lightIndex = 0) => {
  const baseSize = getBaseLightSize(assetId) * scale;
  const glowSize = baseSize * 1.8;
  
  switch (assetId) {
    case 'c9-warm-white':
      return {
        width: glowSize,
        height: glowSize,
        borderRadius: glowSize / 2,
        backgroundColor: '#fff5e0',
        shadowColor: '#fff5e0',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: baseSize * 0.6,
        // Inner circle using border
        borderWidth: Math.max(1, (glowSize - baseSize) / 2),
        borderColor: 'rgba(255, 245, 224, 0.3)',
      };

    case 'mini-led-warm':
      return {
        width: glowSize,
        height: glowSize,
        borderRadius: glowSize / 2,
        backgroundColor: '#fffaf0',
        shadowColor: '#fff5e0',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.6,
        shadowRadius: baseSize * 0.4,
      };

    case 'c9-multicolor':
      const colors = ["#ff3333", "#33ff33", "#3333ff", "#ffff33", "#ff33ff"];
      const color = colors[lightIndex % colors.length];
      return {
        width: glowSize,
        height: glowSize,
        borderRadius: glowSize / 2,
        backgroundColor: color,
        shadowColor: color,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.6,
        shadowRadius: baseSize * 0.5,
        opacity: 0.9,
      };

    case 'mini-led-multicolor':
      const miniColors = ["#ff4444", "#44ff44", "#4444ff", "#ffff44", "#ff44ff", "#44ffff"];
      const miniColor = miniColors[lightIndex % miniColors.length];
      return {
        width: glowSize,
        height: glowSize,
        borderRadius: glowSize / 2,
        backgroundColor: miniColor,
        shadowColor: miniColor,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: baseSize * 0.3,
        opacity: 0.9,
      };

    case 'glow-light-blue':
      return {
        width: glowSize,
        height: glowSize,
        borderRadius: glowSize / 2,
        backgroundColor: '#66aaff',
        shadowColor: '#3388ff',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.7,
        shadowRadius: baseSize * 0.6,
      };

    case 'icicle-cool-white':
      return {
        width: glowSize * 0.6, // More elliptical
        height: glowSize,
        borderRadius: glowSize / 2,
        backgroundColor: '#f0f8ff',
        shadowColor: '#e6f3ff',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.6,
        shadowRadius: baseSize * 0.5,
      };

    case 'net-warm-white':
      return {
        width: glowSize * 0.7, // Smaller net lights
        height: glowSize * 0.7,
        borderRadius: glowSize / 2,
        backgroundColor: '#fffaf0',
        shadowColor: '#fff5e0',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: baseSize * 0.3,
      };

    default:
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
  }
};

const getBaseLightSize = (assetId) => {
  switch (assetId) {
    case 'c9-warm-white':
    case 'c9-multicolor':
    case 'glow-light-blue':
    case 'warm-white':
      return 12; // Larger C9 bulbs
    case 'mini-led-warm':
    case 'mini-led-multicolor':
      return 8; // Mini LEDs
    case 'net-warm-white':
      return 6; // Small net lights
    case 'icicle-cool-white':
      return 10; // Medium icicle lights
    default:
      return 8;
  }
};

export default React.memo(SimpleLightRenderer);