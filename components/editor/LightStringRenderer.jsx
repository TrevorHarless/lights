// components/projects/LightStringRenderer.jsx
import React, { useMemo } from 'react';
import { View } from 'react-native';
import Svg, { G, Path, Defs } from 'react-native-svg';

const LightStringRenderer = ({
  lightStrings,
  currentVector,
  isDragging,
  selectedStringId,
  getAssetById,
  calculateLightPositions,
  onDeleteString, // Keep for compatibility but we won't use it directly
  getLightSizeScale, // New prop for light size scaling
  getSharedGradientDefs, // New prop for shared gradient definitions
  getLightDefinitions, // New prop for light definitions
}) => {
  // Memoize light positions for all strings - only recalculate when strings or scale change
  const memoizedLightElements = useMemo(() => {
    return lightStrings.flatMap((string) => {
      const asset = getAssetById(string.assetId);
      if (!asset) return [];

      // Custom style-based lights (renderType: "style") use their own size (scale = 1)
      // Custom patterns and preset lights use reference scale for consistent sizing
      const assetLightScale = (asset.type === "custom" && asset.renderType === "style")
        ? 1
        : (getLightSizeScale ? getLightSizeScale() : 1);

      const positions = calculateLightPositions(string, asset.spacing, asset);
      
      console.log("🔍 LightStringRenderer Debug:", {
        stringId: string.id,
        assetId: string.assetId,
        assetName: asset.name,
        assetSpacing: asset.spacing,
        positionsCount: positions.length
      });
      
      return positions.map((pos, idx) => {
        // Temporarily disable instancing to test positioning
        const scaledOffset = 15 * assetLightScale;
        
        if (asset.useInstancing && asset.svg) {
          // If asset has instancing but also has svg fallback, use svg for now
          return (
            <G 
              key={`${string.id}-${idx}`} 
              x={pos.x - scaledOffset} 
              y={pos.y - scaledOffset}
            >
              {asset.svg(assetLightScale, idx)}
            </G>
          );
        } else if (asset.svg) {
          // Fallback to direct SVG rendering
          return (
            <G 
              key={`${string.id}-${idx}`} 
              x={pos.x - scaledOffset} 
              y={pos.y - scaledOffset}
            >
              {asset.svg(assetLightScale, idx)}
            </G>
          );
        } else {
          // No rendering method available
          return null;
        }
      });
    });
  }, [lightStrings, getLightSizeScale, getAssetById, calculateLightPositions]);

  // Memoize current vector lights - only recalculate when current vector or scale changes
  const memoizedCurrentVectorElements = useMemo(() => {
    if (!currentVector || !isDragging) return [];
    
    const asset = getAssetById(currentVector.assetId);
    if (!asset) return [];

    // Custom style-based lights (renderType: "style") use their own size (scale = 1)
    // Custom patterns and preset lights use reference scale for consistent sizing
    const assetLightScale = (asset.type === "custom" && asset.renderType === "style")
      ? 1
      : (getLightSizeScale ? getLightSizeScale() : 1);

    const positions = calculateLightPositions(currentVector, asset.spacing, asset);
    
    console.log("🔍 LightStringRenderer Current Vector Debug:", {
      assetId: currentVector.assetId,
      assetName: asset.name,
      assetSpacing: asset.spacing,
      positionsCount: positions.length
    });

    return positions.map((pos, idx) => {
      // Temporarily disable instancing to test positioning
      const scaledOffset = 15 * assetLightScale;
      
      if (asset.useInstancing && asset.svg) {
        // If asset has instancing but also has svg fallback, use svg for now
        return (
          <G 
            key={`current-${idx}`} 
            x={pos.x - scaledOffset} 
            y={pos.y - scaledOffset}
          >
            {asset.svg(assetLightScale, idx)}
          </G>
        );
      } else if (asset.svg) {
        // Fallback to direct SVG rendering
        return (
          <G 
            key={`current-${idx}`} 
            x={pos.x - scaledOffset} 
            y={pos.y - scaledOffset}
          >
            {asset.svg(assetLightScale, idx)}
          </G>
        );
      } else {
        // No rendering method available
        return null;
      }
    });
  }, [currentVector, isDragging, getLightSizeScale, getAssetById, calculateLightPositions]);

  // Memoize selection highlighting
  const memoizedSelectionPath = useMemo(() => {
    if (!selectedStringId) return null;
    
    const selectedString = lightStrings.find(string => string.id === selectedStringId);
    if (!selectedString) return null;
    
    return (
      <Path
        key={`selection-${selectedString.id}`}
        d={`M${selectedString.start.x},${selectedString.start.y} L${selectedString.end.x},${selectedString.end.y}`}
        stroke="#007aff"
        strokeWidth="3"
        strokeOpacity="0.7"
      />
    );
  }, [selectedStringId, lightStrings]);

  // Memoize current vector path
  const memoizedCurrentVectorPath = useMemo(() => {
    if (!currentVector || !isDragging) return null;
    
    return (
      <Path
        d={`M${currentVector.start.x},${currentVector.start.y} L${currentVector.end.x},${currentVector.end.y}`}
        stroke="#333333"
        strokeWidth="1"
        strokeDasharray="5,5"
      />
    );
  }, [currentVector, isDragging]);

  // Early return if nothing to render
  if (!lightStrings.length && (!currentVector || !isDragging)) {
    return null;
  }

  return (
    <View className="absolute inset-0 z-10" pointerEvents="box-none">
      <View className="absolute inset-0 z-20" pointerEvents="none">
        <Svg width="100%" height="100%">
          {/* Single Defs section with all shared gradients and light definitions */}
          <Defs>
            {getSharedGradientDefs && getSharedGradientDefs()}
            {getLightDefinitions && getLightDefinitions()}
          </Defs>

          {/* Render selection highlighting */}
          {memoizedSelectionPath}

          {/* Render current vector path while dragging */}
          {memoizedCurrentVectorPath}

          {/* Render all lights from all strings */}
          {memoizedLightElements}

          {/* Render current vector lights while dragging */}
          {memoizedCurrentVectorElements}
        </Svg>
      </View>
    </View>
  );
};

// Export with React.memo for performance
export const LightStringRendererMemo = React.memo(LightStringRenderer);

// Also export the regular component for compatibility
export { LightStringRenderer };
