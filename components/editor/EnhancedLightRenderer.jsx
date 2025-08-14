// components/editor/EnhancedLightRenderer.jsx
import React, { useMemo } from 'react';
import { View } from 'react-native';

const EnhancedLightRenderer = ({
  lightStrings,
  currentVector,
  isDragging,
  selectedStringId,
  getAssetById,
  calculateLightPositions,
  getLightSizeScale,
}) => {
  const lightScale = getLightSizeScale ? getLightSizeScale() : 1;

  // Memoize enhanced light components
  const { lightComponents, selectionLines, currentVectorLine } = useMemo(() => {
    const components = [];
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
              top: start.y - 2,
              width: length,
              height: 4,
              backgroundColor: '#007aff',
              opacity: 0.8,
              borderRadius: 2,
              transform: [{ rotate: `${angle}rad` }],
              transformOrigin: 'left center',
              shadowColor: '#007aff',
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.6,
              shadowRadius: 4,
            }}
          />
        );
      }

      // Add enhanced lights
      positions.forEach((pos, idx) => {
        const lightComponent = createEnhancedLight(asset.id, pos, lightScale, idx, `${string.id}-${idx}`);
        if (lightComponent) components.push(lightComponent);
      });
    });

    // Process current vector if dragging
    if (currentVector && isDragging) {
      const asset = getAssetById(currentVector.assetId);
      if (asset) {
        const positions = calculateLightPositions(currentVector, asset.spacing);
        
        // Enhanced dashed line with glow
        const start = currentVector.start;
        const end = currentVector.end;
        const length = Math.sqrt((end.x - start.x) ** 2 + (end.y - start.y) ** 2);
        const angle = Math.atan2(end.y - start.y, end.x - start.x);
        const dashCount = Math.floor(length / 8);
        
        const dashViews = [];
        for (let i = 0; i < dashCount; i += 2) {
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
                width: 6,
                height: 1,
                backgroundColor: '#666',
                borderRadius: 0.5,
                opacity: 0.8,
                transform: [{ rotate: `${angle}rad` }],
              }}
            />
          );
        }
        
        vectorLine = <>{dashViews}</>;

        // Add current vector lights with preview opacity
        positions.forEach((pos, idx) => {
          const lightComponent = createEnhancedLight(asset.id, pos, lightScale, idx, `current-${idx}`, 0.8);
          if (lightComponent) components.push(lightComponent);
        });
      }
    }

    return {
      lightComponents: components,
      selectionLines: lines,
      currentVectorLine: vectorLine,
    };
  }, [lightStrings, currentVector, isDragging, selectedStringId, getAssetById, calculateLightPositions, lightScale]);

  if (!lightComponents.length && !currentVectorLine) {
    return null;
  }

  return (
    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} pointerEvents="none">
      {selectionLines}
      {currentVectorLine}
      {lightComponents}
    </View>
  );
};

// Create enhanced light with layered effects using multiple Views
const createEnhancedLight = (assetId, position, scale, lightIndex, key, opacity = 1) => {
  const config = getLightConfig(assetId, scale, lightIndex);
  const { centerX, centerY } = { centerX: position.x, centerY: position.y };

  return (
    <View key={key} style={{ position: 'absolute' }}>
      {/* Outer glow layer */}
      <View
        style={{
          position: 'absolute',
          left: centerX - config.outerGlow.size / 2,
          top: centerY - config.outerGlow.size / 2,
          width: config.outerGlow.size,
          height: config.outerGlow.size,
          borderRadius: config.outerGlow.size / 2,
          backgroundColor: config.outerGlow.color,
          opacity: config.outerGlow.opacity * opacity,
        }}
      />

      {/* Middle glow layer */}
      <View
        style={{
          position: 'absolute',
          left: centerX - config.middleGlow.size / 2,
          top: centerY - config.middleGlow.size / 2,
          width: config.middleGlow.size,
          height: config.middleGlow.size,
          borderRadius: config.middleGlow.size / 2,
          backgroundColor: config.middleGlow.color,
          opacity: config.middleGlow.opacity * opacity,
          shadowColor: config.middleGlow.color,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.4 * opacity,
          shadowRadius: config.middleGlow.size * 0.2,
        }}
      />

      {/* Core bulb layer */}
      <View
        style={{
          position: 'absolute',
          left: centerX - config.core.size / 2,
          top: centerY - config.core.size / 2,
          width: config.core.size,
          height: config.core.size,
          borderRadius: config.core.size / 2,
          backgroundColor: config.core.color,
          opacity: opacity,
          shadowColor: config.core.shadowColor,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.6 * opacity,
          shadowRadius: config.core.size * 0.4,
          // Add border for bulb effect
          borderWidth: config.core.borderWidth,
          borderColor: config.core.borderColor,
        }}
      />

      {/* Highlight dot */}
      <View
        style={{
          position: 'absolute',
          left: centerX - config.highlight.size / 2,
          top: centerY - config.highlight.size / 2,
          width: config.highlight.size,
          height: config.highlight.size,
          borderRadius: config.highlight.size / 2,
          backgroundColor: config.highlight.color,
          opacity: config.highlight.opacity * opacity,
        }}
      />

      {/* Secondary highlight (for realism) */}
      {config.secondaryHighlight && (
        <View
          style={{
            position: 'absolute',
            left: centerX - config.secondaryHighlight.offsetX,
            top: centerY - config.secondaryHighlight.offsetY,
            width: config.secondaryHighlight.size,
            height: config.secondaryHighlight.size,
            borderRadius: config.secondaryHighlight.size / 2,
            backgroundColor: config.secondaryHighlight.color,
            opacity: config.secondaryHighlight.opacity * opacity,
          }}
        />
      )}
    </View>
  );
};

// Enhanced light configurations with layered effects
const getLightConfig = (assetId, scale, lightIndex = 0) => {
  switch (assetId) {
    case 'c9-warm-white':
      return {
        outerGlow: {
          size: 44 * scale,
          color: 'rgba(255, 245, 224, 0.3)',
          opacity: 0.6,
        },
        middleGlow: {
          size: 24 * scale,
          color: 'rgba(255, 250, 240, 0.8)',
          opacity: 0.7,
        },
        core: {
          size: 12 * scale,
          color: '#fffaf0',
          shadowColor: '#ffeb99',
          borderWidth: Math.max(0.5, scale * 0.5),
          borderColor: 'rgba(204, 153, 102, 0.6)',
        },
        highlight: {
          size: 4 * scale,
          color: '#ffffff',
          opacity: 0.9,
        },
        secondaryHighlight: {
          size: 1.6 * scale,
          color: 'rgba(255, 255, 255, 0.7)',
          opacity: 0.8,
          offsetX: 2 * scale,
          offsetY: 2 * scale,
        },
      };

    case 'c9-multicolor':
      const colors = ["#ff3333", "#33ff33", "#3333ff", "#ffff33", "#ff33ff"];
      const color = colors[lightIndex % colors.length];
      return {
        outerGlow: {
          size: 44 * scale,
          color: color,
          opacity: 0.3,
        },
        middleGlow: {
          size: 24 * scale,
          color: color,
          opacity: 0.6,
        },
        core: {
          size: 12 * scale,
          color: color,
          shadowColor: color,
          borderWidth: Math.max(0.5, scale * 0.5),
          borderColor: `${color}AA`,
        },
        highlight: {
          size: 4 * scale,
          color: '#ffffff',
          opacity: 0.9,
        },
        secondaryHighlight: {
          size: 1.6 * scale,
          color: 'rgba(255, 255, 255, 0.6)',
          opacity: 0.7,
          offsetX: 2 * scale,
          offsetY: 2 * scale,
        },
      };

    case 'c9-red-white':
      const redWhitePattern = ["#ff3333", "#ff3333", "#ffffff", "#ffffff"];
      const redWhiteColor = redWhitePattern[lightIndex % redWhitePattern.length];
      const isRedLight = redWhiteColor === "#ff3333";
      return {
        outerGlow: {
          size: 44 * scale,
          color: isRedLight ? "#ff3333" : "#fff5e0",
          opacity: isRedLight ? 0.3 : 0.6,
        },
        middleGlow: {
          size: 24 * scale,
          color: isRedLight ? "#ff3333" : "#fffaf0",
          opacity: isRedLight ? 0.6 : 0.9,
        },
        core: {
          size: 12 * scale,
          color: redWhiteColor,
          shadowColor: redWhiteColor,
          borderWidth: Math.max(0.5, scale * 0.5),
          borderColor: isRedLight ? "#cc2222" : "#cc9966",
        },
        highlight: {
          size: 4 * scale,
          color: '#ffffff',
          opacity: 0.9,
        },
        secondaryHighlight: {
          size: 1.6 * scale,
          color: 'rgba(255, 255, 255, 0.8)',
          opacity: 0.8,
          offsetX: 2 * scale,
          offsetY: 2 * scale,
        },
      };

    case 'mini-led-warm':
      return {
        outerGlow: {
          size: 24 * scale,
          color: 'rgba(255, 245, 224, 0.4)',
          opacity: 0.7,
        },
        middleGlow: {
          size: 12 * scale,
          color: 'rgba(255, 250, 240, 0.9)',
          opacity: 0.8,
        },
        core: {
          size: 6 * scale,
          color: '#fffaf0',
          shadowColor: '#ffeb99',
          borderWidth: 0,
          borderColor: 'transparent',
        },
        highlight: {
          size: 2 * scale,
          color: '#ffffff',
          opacity: 0.9,
        },
      };

    case 'mini-led-multicolor':
      const miniColors = ["#ff4444", "#44ff44", "#4444ff", "#ffff44", "#ff44ff", "#44ffff"];
      const miniColor = miniColors[lightIndex % miniColors.length];
      return {
        outerGlow: {
          size: 24 * scale,
          color: miniColor,
          opacity: 0.4,
        },
        middleGlow: {
          size: 12 * scale,
          color: miniColor,
          opacity: 0.7,
        },
        core: {
          size: 6 * scale,
          color: miniColor,
          shadowColor: miniColor,
          borderWidth: 0,
          borderColor: 'transparent',
        },
        highlight: {
          size: 2 * scale,
          color: '#ffffff',
          opacity: 0.8,
        },
      };

    case 'glow-light-blue':
      return {
        outerGlow: {
          size: 36 * scale,
          color: 'rgba(51, 136, 255, 0.3)',
          opacity: 0.6,
        },
        middleGlow: {
          size: 20 * scale,
          color: 'rgba(102, 170, 255, 0.7)',
          opacity: 0.8,
        },
        core: {
          size: 10 * scale,
          color: '#66aaff',
          shadowColor: '#3388ff',
          borderWidth: Math.max(0.5, scale * 0.3),
          borderColor: 'rgba(51, 136, 255, 0.5)',
        },
        highlight: {
          size: 3 * scale,
          color: '#ffffff',
          opacity: 0.9,
        },
        secondaryHighlight: {
          size: 1 * scale,
          color: 'rgba(221, 255, 255, 0.8)',
          opacity: 0.7,
          offsetX: 1.5 * scale,
          offsetY: 1.5 * scale,
        },
      };

    case 'icicle-cool-white':
      return {
        outerGlow: {
          size: 36 * scale,
          color: 'rgba(230, 243, 255, 0.4)',
          opacity: 0.6,
        },
        middleGlow: {
          size: 16 * scale,
          color: 'rgba(240, 248, 255, 0.8)',
          opacity: 0.7,
        },
        core: {
          size: 8 * scale,
          color: '#f0f8ff',
          shadowColor: '#e6f3ff',
          borderWidth: 0,
          borderColor: 'transparent',
        },
        highlight: {
          size: 3 * scale,
          color: '#ffffff',
          opacity: 0.95,
        },
      };

    case 'net-warm-white':
      return {
        outerGlow: {
          size: 20 * scale,
          color: 'rgba(255, 245, 224, 0.5)',
          opacity: 0.8,
        },
        middleGlow: {
          size: 10 * scale,
          color: 'rgba(255, 250, 240, 0.9)',
          opacity: 0.9,
        },
        core: {
          size: 4 * scale,
          color: '#fffaf0',
          shadowColor: '#ffeb99',
          borderWidth: 0,
          borderColor: 'transparent',
        },
        highlight: {
          size: 1.6 * scale,
          color: '#ffffff',
          opacity: 0.9,
        },
      };

    default:
      return {
        outerGlow: {
          size: 32 * scale,
          color: 'rgba(255, 255, 255, 0.3)',
          opacity: 0.6,
        },
        middleGlow: {
          size: 16 * scale,
          color: 'rgba(255, 255, 255, 0.7)',
          opacity: 0.7,
        },
        core: {
          size: 8 * scale,
          color: '#ffffff',
          shadowColor: '#ffffff',
          borderWidth: 0,
          borderColor: 'transparent',
        },
        highlight: {
          size: 2 * scale,
          color: '#ffffff',
          opacity: 0.9,
        },
      };
  }
};

export default React.memo(EnhancedLightRenderer);