import React from 'react';
import { Circle, Line, Text as SvgText } from 'react-native-svg';

export function ReferenceLineRenderer({
  referenceLine,
  referenceLength,
  isSettingReference,
  pendingLine,
}) {
  if (isSettingReference && pendingLine) {
    // Show the line being drawn
    return (
      <Line
        x1={pendingLine.start.x}
        y1={pendingLine.start.y}
        x2={pendingLine.end.x}
        y2={pendingLine.end.y}
        stroke="#ff6b35"
        strokeWidth={3}
        strokeDasharray="8,4"
      />
    );
  }

  if (referenceLine && referenceLength) {
    const midX = (referenceLine.start.x + referenceLine.end.x) / 2;
    const midY = (referenceLine.start.y + referenceLine.end.y) / 2;

    return (
      <>
        {/* Reference line */}
        <Line
          x1={referenceLine.start.x}
          y1={referenceLine.start.y}
          x2={referenceLine.end.x}
          y2={referenceLine.end.y}
          stroke="#059669"
          strokeWidth={2}
          strokeDasharray="6,3"
        />

        {/* Start point */}
        <Circle
          cx={referenceLine.start.x}
          cy={referenceLine.start.y}
          r={4}
          fill="#059669"
          stroke="white"
          strokeWidth={2}
        />

        {/* End point */}
        <Circle
          cx={referenceLine.end.x}
          cy={referenceLine.end.y}
          r={4}
          fill="#059669"
          stroke="white"
          strokeWidth={2}
        />

        {/* Length label */}
        <SvgText
          x={midX}
          y={midY - 8}
          fontSize="12"
          fill="#059669"
          fontWeight="bold"
          textAnchor="middle">
          {referenceLength}ft
        </SvgText>
      </>
    );
  }

  return null;
}
