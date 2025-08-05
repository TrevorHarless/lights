import React from 'react';
import { View } from 'react-native';
import Svg, { Line } from 'react-native-svg';

export function ReferenceLineRenderer({
  referenceLine,
  referenceLength,
  isSettingReference,
  pendingLine,
}) {
  if (isSettingReference && pendingLine) {
    // Show the line being drawn - only while actively setting reference
    return (
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 15 }} pointerEvents="none">
        <Svg width="100%" height="100%">
          <Line
            x1={pendingLine.start.x}
            y1={pendingLine.start.y}
            x2={pendingLine.end.x}
            y2={pendingLine.end.y}
            stroke="#ff6b35"
            strokeWidth={3}
            strokeDasharray="8,4"
          />
        </Svg>
      </View>
    );
  }

  // Don't show the permanent reference line - only show during drawing

  return null;
}
