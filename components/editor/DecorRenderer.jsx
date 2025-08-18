// components/editor/DecorRenderer.jsx
import { Image, View } from "react-native";
import Svg, { Circle, G } from "react-native-svg";
import { useDecorAssets } from "../../hooks/editor/useDecorAssets";

export function DecorRenderer({ 
  decor, 
  selectedDecorId, 
  onDecorSelect,
  showResizeHandles = true,
  getResizeHandles,
}) {
  const { getDecorAssetById } = useDecorAssets();

  if (!decor || decor.length === 0) return null;

  const renderDecorBase = (decorItem) => {
    const asset = getDecorAssetById(decorItem.assetId);
    if (!asset) return null;

    if (asset.renderType === 'image' && asset.image) {
      const size = decorItem.radius * 2;
      return (
        <View
          key={`${decorItem.id}-base`}
          style={{
            position: 'absolute',
            left: decorItem.center.x - decorItem.radius,
            top: decorItem.center.y - decorItem.radius,
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

  // Remove decor lights - decor items are just the base images
  const renderDecorLights = () => {
    // No lights rendered around decor items
    return null;
  };

  // Show resize handles ONLY when decor item is selected
  const renderResizeHandles = (decorItem) => {
    if (!showResizeHandles || selectedDecorId !== decorItem.id) return null;
    
    const handles = getResizeHandles(decorItem);
    
    return handles.map((handle, index) => (
      <Circle
        key={`${decorItem.id}-handle-${index}`}
        cx={handle.x}
        cy={handle.y}
        r="8"
        fill="rgba(0, 123, 255, 0.8)"
        stroke="#ffffff"
        strokeWidth="2"
      />
    ));
  };

  // Show outline ONLY when decor item is selected
  const renderDecorOutline = (decorItem) => {
    const isSelected = selectedDecorId === decorItem.id;
    
    // Only render outline if selected
    if (!isSelected) return null;
    
    return (
      <Circle
        key={`${decorItem.id}-outline`}
        cx={decorItem.center.x}
        cy={decorItem.center.y}
        r={decorItem.radius}
        fill="none"
        stroke="#007bff"
        strokeWidth="2"
        strokeDasharray="5,5"
        opacity={1}
        onPress={() => onDecorSelect && onDecorSelect(decorItem.id)}
      />
    );
  };

  return (
    <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }} pointerEvents="none">
      {/* Render PNG decor bases first (behind lights) */}
      {decor.map((decorItem) => renderDecorBase(decorItem))}
      
      {/* Render SVG elements (lights, outlines, handles) */}
      <Svg style={{ width: "100%", height: "100%" }} pointerEvents="box-none">
        {decor.map((decorItem) => (
          <G key={decorItem.id}>
            {/* Decor outline (for selection and visual guide) */}
            {renderDecorOutline(decorItem)}
            
            {/* Individual lights around the decor */}
            {renderDecorLights(decorItem)}
            
            {/* Resize handles for selected decor */}
            {renderResizeHandles(decorItem)}
          </G>
        ))}
      </Svg>
    </View>
  );
}