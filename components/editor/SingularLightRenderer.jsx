// components/editor/SingularLightRenderer.jsx
import React, { useMemo } from 'react';
import { View } from 'react-native';
import ImageLight from '~/components/editor/ImageLight';

const SingularLightRenderer = ({
  singularLights,
  selectedLightId,
  getLightSizeScale,
  getLightRenderStyle,
  getAssetById, // Add this to get asset information
  showTouchableAreas = false, // Debug prop to show touchable areas
}) => {
  const lightScale = getLightSizeScale ? getLightSizeScale() : 1;

  // Memoize all singular light views and selection indicators
  const { lightViews, selectionIndicators, touchableAreas } = useMemo(() => {
    const views = [];
    const indicators = [];
    const touchAreas = [];

    // Process singular lights
    singularLights.forEach((light) => {
      const isSelected = light.id === selectedLightId;
      
      // Get light style
      // Fallback style function if getLightRenderStyle is not available
      const getFallbackLightStyle = (assetId, scale = 1) => {
        return {
          width: 12 * scale,
          height: 12 * scale,
          borderRadius: 6 * scale,
          backgroundColor: '#ffffff',
          shadowColor: '#ffffff',
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.6,
          shadowRadius: 6 * scale,
        };
      };

      const lightStyle = getLightRenderStyle 
        ? getLightRenderStyle(light.assetId, lightScale, light.lightIndex || 0) 
        : getFallbackLightStyle(light.assetId, lightScale);
      
      // Calculate touchable radius for debug visualization
      let touchableRadius = 15; // Default fallback
      if (lightStyle && lightStyle.width) {
        const visualRadius = lightStyle.width / 2;
        touchableRadius = Math.max(visualRadius + 3, 15);
      }

      // Add touchable area visualization if debug mode is enabled
      if (showTouchableAreas) {
        const touchAreaSize = touchableRadius * 2;
        touchAreas.push(
          <View
            key={`touchable-${light.id}`}
            style={{
              position: 'absolute',
              left: light.position.x - touchableRadius,
              top: light.position.y - touchableRadius,
              width: touchAreaSize,
              height: touchAreaSize,
              borderRadius: touchableRadius,
              borderWidth: 1,
              borderColor: isSelected ? '#007aff' : '#ff0000',
              backgroundColor: 'transparent',
              opacity: 0.3,
              pointerEvents: 'none', // Don't interfere with touch events
            }}
          />
        );
      }
      
      // Get asset information for image rendering
      const asset = getAssetById ? getAssetById(light.assetId) : null;
      
      
      if (asset && asset.renderType === 'image' && asset.lightImage) {
        // Render using ImageLight component
        views.push(
          <ImageLight
            key={light.id}
            position={light.position}
            scale={lightScale}
            opacity={1}
            imageSource={asset.lightImage}
          />
        );
      } else if (asset && asset.renderType === 'pattern' && asset.pattern) {
        // Handle pattern-based rendering
        const patternStep = asset.pattern[(light.lightIndex || 0) % asset.pattern.length];
        views.push(
          <ImageLight
            key={light.id}
            position={light.position}
            scale={lightScale}
            opacity={1}
            imageSource={patternStep.lightImage}
          />
        );
      } else if (lightStyle) {
        // Fallback to View-based rendering
        views.push(
          <View
            key={light.id}
            style={[
              lightStyle,
              {
                position: 'absolute',
                left: light.position.x - lightStyle.width / 2,
                top: light.position.y - lightStyle.height / 2,
                pointerEvents: 'none', // Allow touch events to pass through to the gesture handler
              }
            ]}
          />
        );
      }

      // Add selection indicator if selected (for all render types)
      if (isSelected) {
        // Configurable multiplier for easy fine-tuning
        const SELECTION_INDICATOR_MULTIPLIER = .5; // Easy value to modify
        
        let indicatorSize = 40; // Default fallback
        
        if (asset && (asset.lightImage || asset.pattern)) {
          // For image-based lights, base size on the actual image size
          const baseImageSize = 128 * lightScale; // Same calculation as ImageLight
          indicatorSize = baseImageSize * SELECTION_INDICATOR_MULTIPLIER;
        } else if (lightStyle) {
          // For style-based lights (fallback), use the lightStyle width
          indicatorSize = lightStyle.width * SELECTION_INDICATOR_MULTIPLIER;
        }
        
        // Ensure minimum size for usability
        indicatorSize = Math.max(indicatorSize, 20);
        
        const indicatorRadius = indicatorSize / 2;
        
        indicators.push(
          <View
            key={`selection-${light.id}`}
            style={{
              position: 'absolute',
              left: light.position.x - indicatorRadius,
              top: light.position.y - indicatorRadius,
              width: indicatorSize,
              height: indicatorSize,
              borderRadius: indicatorRadius,
              borderWidth: 2,
              borderColor: '#007aff',
              backgroundColor: 'transparent',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.3,
              shadowRadius: 2,
              elevation: 3,
              pointerEvents: 'none', // Allow touch events to pass through
            }}
          />
        );
      }
    });

    return {
      lightViews: views,
      selectionIndicators: indicators,
      touchableAreas: touchAreas,
    };
  }, [singularLights, selectedLightId, lightScale, getLightRenderStyle, getAssetById, showTouchableAreas]);

  if (!lightViews.length) {
    return null;
  }

  return (
    <>
      {/* Render touchable area debug overlays first (behind lights) */}
      {showTouchableAreas && touchableAreas}
      {/* Render all singular lights */}
      {lightViews}
      {/* Render selection indicators */}
      {selectionIndicators}
    </>
  );
};

export default SingularLightRenderer;