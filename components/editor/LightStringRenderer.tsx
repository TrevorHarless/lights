import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Line, Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { LightString, Vector, LightAsset } from '@/types/editor';
import { calculateLightPositions, canvasToScreenCoordinates } from '@/utils/editor/geometry';

interface LightStringRendererProps {
  lightStrings: LightString[];
  currentVector: Vector | null;
  selectedStringId: string | null;
  canvasLayout: { x: number; y: number; width: number; height: number };
  getAssetById: (assetId: string) => LightAsset | null;
  scale?: number;
}

export const LightStringRenderer: React.FC<LightStringRendererProps> = ({
  lightStrings,
  currentVector,
  selectedStringId,
  canvasLayout,
  getAssetById,
  scale = 1
}) => {
  const renderLightString = (lightString: LightString, isSelected: boolean = false) => {
    const asset = getAssetById(lightString.assetId);
    if (!asset) return null;

    const vector = { start: lightString.start, end: lightString.end };
    const lightPositions = calculateLightPositions(vector, asset.spacing, scale);

    // Convert canvas coordinates to screen coordinates
    const startScreen = canvasToScreenCoordinates(lightString.start, canvasLayout);
    const endScreen = canvasToScreenCoordinates(lightString.end, canvasLayout);

    const strokeColor = isSelected ? '#3B82F6' : '#9CA3AF';
    const strokeWidth = isSelected ? 2 : 1;

    return (
      <React.Fragment key={lightString.id}>
        {/* Light string line */}
        <Line
          x1={startScreen.x}
          y1={startScreen.y}
          x2={endScreen.x}
          y2={endScreen.y}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeOpacity={0.6}
        />
        
        {/* Individual lights */}
        {lightPositions.map((position, index) => {
          const screenPosition = canvasToScreenCoordinates(position, canvasLayout);
          const gradientId = `${asset.id}-gradient`;
          
          return (
            <Circle
              key={`${lightString.id}-light-${index}`}
              cx={screenPosition.x}
              cy={screenPosition.y}
              r={3 * scale}
              fill={`url(#${gradientId})`}
              opacity={0.9}
            />
          );
        })}
      </React.Fragment>
    );
  };

  const renderCurrentVector = () => {
    if (!currentVector) return null;

    const startScreen = canvasToScreenCoordinates(currentVector.start, canvasLayout);
    const endScreen = canvasToScreenCoordinates(currentVector.end, canvasLayout);

    return (
      <Line
        x1={startScreen.x}
        y1={startScreen.y}
        x2={endScreen.x}
        y2={endScreen.y}
        stroke="#3B82F6"
        strokeWidth={2}
        strokeDasharray="5,5"
        strokeOpacity={0.8}
      />
    );
  };

  if (!canvasLayout.width || !canvasLayout.height) {
    return null;
  }

  return (
    <View style={[styles.container, { 
      width: canvasLayout.width, 
      height: canvasLayout.height 
    }]} pointerEvents="none">
      <Svg
        width={canvasLayout.width}
        height={canvasLayout.height}
        style={StyleSheet.absoluteFillObject}
      >
        <Defs>
          <LinearGradient id="warm-white-gradient" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="#FFF8DC" stopOpacity={1} />
            <Stop offset="70%" stopColor="#FFE4B5" stopOpacity={0.8} />
            <Stop offset="100%" stopColor="#DEB887" stopOpacity={0.3} />
          </LinearGradient>
          
          <LinearGradient id="blue-glow-gradient" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="#87CEEB" stopOpacity={1} />
            <Stop offset="70%" stopColor="#4682B4" stopOpacity={0.8} />
            <Stop offset="100%" stopColor="#191970" stopOpacity={0.3} />
          </LinearGradient>
          
          <LinearGradient id="multicolor-gradient" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="#FF6B6B" stopOpacity={1} />
            <Stop offset="33%" stopColor="#4ECDC4" stopOpacity={0.9} />
            <Stop offset="66%" stopColor="#45B7D1" stopOpacity={0.8} />
            <Stop offset="100%" stopColor="#F9CA24" stopOpacity={0.7} />
          </LinearGradient>
          
          <LinearGradient id="icicle-gradient" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="#F0F8FF" stopOpacity={1} />
            <Stop offset="80%" stopColor="#E6F3FF" stopOpacity={0.9} />
            <Stop offset="100%" stopColor="#B0E0E6" stopOpacity={0.4} />
          </LinearGradient>
        </Defs>
        
        {/* Render all light strings */}
        {lightStrings.map(lightString => 
          renderLightString(lightString, lightString.id === selectedStringId)
        )}
        
        {/* Render current drawing vector */}
        {renderCurrentVector()}
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 10
  }
});