// components/editor/WreathRenderer.jsx
import { Image, View } from "react-native";
import Svg, { Circle, G } from "react-native-svg";
import { useWreathAssets } from "../../hooks/editor/useWreathAssets";

export function WreathRenderer({ 
  wreaths, 
  selectedWreathId, 
  onWreathSelect,
  showResizeHandles = true,
  getResizeHandles,
}) {
  const { getWreathAssetById } = useWreathAssets();

  if (!wreaths || wreaths.length === 0) return null;

  const renderWreathBase = (wreath) => {
    const asset = getWreathAssetById(wreath.assetId);
    if (!asset) return null;

    if (asset.renderType === 'image' && asset.image) {
      const size = wreath.radius * 2;
      return (
        <View
          key={`${wreath.id}-base`}
          style={{
            position: 'absolute',
            left: wreath.center.x - wreath.radius,
            top: wreath.center.y - wreath.radius,
            width: size,
            height: size,
          }}
        >
          <Image 
            source={asset.image}
            style={{ 
              width: size, 
              height: size,
              opacity: 0.9 
            }}
            resizeMode="contain"
          />
        </View>
      );
    }
    return null;
  };

  // Remove wreath lights - wreaths are just the base images
  const renderWreathLights = () => {
    // No lights rendered around wreaths
    return null;
  };

  // Show resize handles ONLY when wreath is selected
  const renderResizeHandles = (wreath) => {
    if (!showResizeHandles || selectedWreathId !== wreath.id) return null;
    
    const handles = getResizeHandles(wreath);
    
    return handles.map((handle, index) => (
      <Circle
        key={`${wreath.id}-handle-${index}`}
        cx={handle.x}
        cy={handle.y}
        r="8"
        fill="rgba(0, 123, 255, 0.8)"
        stroke="#ffffff"
        strokeWidth="2"
      />
    ));
  };

  // Show outline ONLY when wreath is selected
  const renderWreathOutline = (wreath) => {
    const isSelected = selectedWreathId === wreath.id;
    
    // Only render outline if selected
    if (!isSelected) return null;
    
    return (
      <Circle
        key={`${wreath.id}-outline`}
        cx={wreath.center.x}
        cy={wreath.center.y}
        r={wreath.radius}
        fill="none"
        stroke="#007bff"
        strokeWidth="2"
        strokeDasharray="5,5"
        opacity={1}
        onPress={() => onWreathSelect && onWreathSelect(wreath.id)}
      />
    );
  };

  return (
    <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }} pointerEvents="none">
      {/* Render PNG wreath bases first (behind lights) */}
      {wreaths.map((wreath) => renderWreathBase(wreath))}
      
      {/* Render SVG elements (lights, outlines, handles) */}
      <Svg style={{ width: "100%", height: "100%" }} pointerEvents="box-none">
        {wreaths.map((wreath) => (
          <G key={wreath.id}>
            {/* Wreath outline (for selection and visual guide) */}
            {renderWreathOutline(wreath)}
            
            {/* Individual lights around the wreath */}
            {renderWreathLights(wreath)}
            
            {/* Resize handles for selected wreath */}
            {renderResizeHandles(wreath)}
          </G>
        ))}
      </Svg>
    </View>
  );
}