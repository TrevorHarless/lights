import React from 'react';
import { Dimensions, Text, View } from 'react-native';
import Svg, { Circle, Line } from 'react-native-svg';

export function MeasureLineRenderer({
  measurementLines,
  selectedMeasurementId,
  currentMeasureLine, // The line currently being drawn
  isDrawing,
}) {
  const { width } = Dimensions.get('window');
  const isTablet = width >= 768;

  const renderMeasurementLine = (line, isSelected = false, isPending = false) => {
    const { start, end } = line;

    return (
      <React.Fragment key={line.id || 'pending'}>
        <Line
          x1={start.x}
          y1={start.y}
          x2={end.x}
          y2={end.y}
          stroke={isPending ? "#FF9800" : isSelected ? "#2196F3" : "#4CAF50"}
          strokeWidth={isSelected ? 4 : 3}
          strokeDasharray={isPending ? "8,4" : undefined}
        />
      </React.Fragment>
    );
  };

  const renderMeasurementLabel = (line, isSelected = false, isPending = false) => {
    const { start, end, label } = line;

    // Calculate midpoint for label positioning
    const midX = (start.x + end.x) / 2;
    const midY = (start.y + end.y) / 2;

    // Calculate angle for label rotation
    const angle = Math.atan2(end.y - start.y, end.x - start.x);

    // Adjust label position to be just above the line
    const offset = 12;
    const labelX = midX - Math.sin(angle) * offset;
    const labelY = midY + Math.cos(angle) * offset;

    // Determine if text should be flipped to remain readable
    let rotationAngle = (angle * 180) / Math.PI;
    if (rotationAngle > 90 || rotationAngle < -90) {
      rotationAngle += 180;
    }

    return (
      <View
        key={`label-${line.id || 'pending'}`}
        style={{
          position: 'absolute',
          left: labelX,
          top: labelY,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: isPending ? "rgba(255, 152, 0, 0.9)" : isSelected ? "rgba(33, 150, 243, 0.9)" : "rgba(76, 175, 80, 0.9)",
          borderRadius: isTablet ? 8 : 6,
          paddingHorizontal: isTablet ? 8 : 6,
          paddingVertical: isTablet ? 4 : 3,
          transform: [
            { translateX: '-50%' }, // Center horizontally
            { translateY: '-50%' }, // Center vertically
            { rotate: `${rotationAngle}deg` }
          ],
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.2,
          shadowRadius: 2,
          elevation: 2,
        }}
      >
        <Text
          style={{
            color: 'white',
            fontSize: isTablet ? 12 : 10,
            fontWeight: '600',
            textAlign: 'center',
          }}
        >
          {label}
        </Text>
      </View>
    );
  };

  return (
    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 15 }} pointerEvents="none">
      {/* SVG for lines */}
      <Svg width="100%" height="100%">
        {/* Render all measurement lines */}
        {measurementLines.map((line) =>
          renderMeasurementLine(line, line.id === selectedMeasurementId)
        )}
        
        {/* Render current drawing line if in progress */}
        {isDrawing && currentMeasureLine && 
          renderMeasurementLine(currentMeasureLine, false, true)
        }

        {/* Render handles for selected measurement line */}
        {measurementLines.map((line) => {
          const isSelected = line.id === selectedMeasurementId;
          if (!isSelected) return null;
          
          return (
            <React.Fragment key={`handles-${line.id}`}>
              {/* Start handle */}
              <Circle
                cx={line.start.x}
                cy={line.start.y}
                r={8}
                fill="white"
                stroke="#4CAF50"
                strokeWidth={3}
              />
              {/* End handle */}
              <Circle
                cx={line.end.x}
                cy={line.end.y}
                r={8}
                fill="white"
                stroke="#4CAF50"
                strokeWidth={3}
              />
            </React.Fragment>
          );
        })}
      </Svg>

      {/* Text labels positioned absolutely */}
      {measurementLines.map((line) =>
        renderMeasurementLabel(line, line.id === selectedMeasurementId)
      )}
      
      {/* Current drawing line label if in progress */}
      {isDrawing && currentMeasureLine && 
        renderMeasurementLabel(currentMeasureLine, false, true)
      }
    </View>
  );
}