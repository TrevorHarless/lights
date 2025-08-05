import { Point, Vector, LightString } from '~/types/editor';

/**
 * Calculate distance between two points
 */
export const calculateDistance = (point1: Point, point2: Point): number => {
  const dx = point2.x - point1.x;
  const dy = point2.y - point1.y;
  return Math.sqrt(dx * dx + dy * dy);
};

/**
 * Calculate distance from a point to a line segment
 */
export const distanceToLineSegment = (point: Point, lineStart: Point, lineEnd: Point): number => {
  const A = point.x - lineStart.x;
  const B = point.y - lineStart.y;
  const C = lineEnd.x - lineStart.x;
  const D = lineEnd.y - lineStart.y;

  const dot = A * C + B * D;
  const lenSq = C * C + D * D;
  
  if (lenSq === 0) {
    return calculateDistance(point, lineStart);
  }

  let param = dot / lenSq;
  param = Math.max(0, Math.min(1, param));

  const closestPoint = {
    x: lineStart.x + param * C,
    y: lineStart.y + param * D
  };

  return calculateDistance(point, closestPoint);
};

/**
 * Find the closest light string to a given point
 */
export const findClosestLightString = (
  point: Point, 
  lightStrings: LightString[], 
  threshold: number = 20
): { lightString: LightString; distance: number } | null => {
  let closestString: LightString | null = null;
  let minDistance = threshold;

  for (const lightString of lightStrings) {
    const distance = distanceToLineSegment(point, lightString.start, lightString.end);
    if (distance < minDistance) {
      minDistance = distance;
      closestString = lightString;
    }
  }

  return closestString ? { lightString: closestString, distance: minDistance } : null;
};

/**
 * Calculate positions for individual lights along a vector
 */
export const calculateLightPositions = (
  vector: Vector, 
  spacing: number, 
  scale: number = 1
): Point[] => {
  const distance = calculateDistance(vector.start, vector.end);
  const adjustedSpacing = spacing * scale;
  
  if (distance < adjustedSpacing) {
    // If the line is too short, place a single light at the midpoint
    return [{
      x: (vector.start.x + vector.end.x) / 2,
      y: (vector.start.y + vector.end.y) / 2
    }];
  }

  const numLights = Math.floor(distance / adjustedSpacing);
  const actualSpacing = distance / numLights;
  
  const dx = vector.end.x - vector.start.x;
  const dy = vector.end.y - vector.start.y;
  
  const unitX = dx / distance;
  const unitY = dy / distance;
  
  const positions: Point[] = [];
  
  for (let i = 0; i <= numLights; i++) {
    const t = i * actualSpacing;
    positions.push({
      x: vector.start.x + unitX * t,
      y: vector.start.y + unitY * t
    });
  }
  
  return positions;
};

/**
 * Convert screen coordinates to canvas coordinates (percentage-based)
 */
export const screenToCanvasCoordinates = (
  screenPoint: Point,
  canvasLayout: { x: number; y: number; width: number; height: number }
): Point => {
  return {
    x: ((screenPoint.x - canvasLayout.x) / canvasLayout.width) * 100,
    y: ((screenPoint.y - canvasLayout.y) / canvasLayout.height) * 100
  };
};

/**
 * Convert canvas coordinates (percentage-based) to screen coordinates
 */
export const canvasToScreenCoordinates = (
  canvasPoint: Point,
  canvasLayout: { x: number; y: number; width: number; height: number }
): Point => {
  return {
    x: (canvasPoint.x / 100) * canvasLayout.width + canvasLayout.x,
    y: (canvasPoint.y / 100) * canvasLayout.height + canvasLayout.y
  };
};

/**
 * Generate a unique ID for light strings
 */
export const generateLightStringId = (): string => {
  return `light_string_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Calculate the angle of a vector in degrees
 */
export const calculateVectorAngle = (vector: Vector): number => {
  const dx = vector.end.x - vector.start.x;
  const dy = vector.end.y - vector.start.y;
  return Math.atan2(dy, dx) * (180 / Math.PI);
};

/**
 * Clamp a point to stay within canvas bounds
 */
export const clampToCanvas = (point: Point): Point => {
  return {
    x: Math.max(0, Math.min(100, point.x)),
    y: Math.max(0, Math.min(100, point.y))
  };
};