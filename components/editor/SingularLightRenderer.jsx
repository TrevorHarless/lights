// components/editor/SingularLightRenderer.jsx
import React, { useMemo } from 'react';
import { View } from 'react-native';

const SingularLightRenderer = ({
  singularLights,
  selectedLightId,
  getLightSizeScale,
  getLightRenderStyle,
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
      
      if (lightStyle) {
        // Add the light
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

        // Add selection indicator if selected
        if (isSelected) {
          const indicatorSize = Math.max(lightStyle.width * 1.5, 20);
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
      }
    });

    return {
      lightViews: views,
      selectionIndicators: indicators,
      touchableAreas: touchAreas,
    };
  }, [singularLights, selectedLightId, lightScale, getLightRenderStyle, showTouchableAreas]);

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