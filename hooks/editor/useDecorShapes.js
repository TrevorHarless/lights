// hooks/editor/useDecorShapes.js
import React, { useCallback } from "react";

export function useDecorShapes() {
  const [decor, setDecor] = React.useState([]);
  const [selectedDecorId, setSelectedDecorId] = React.useState(null);

  // Add a new decor item
  const addDecor = (center, radius, assetId, asset = null) => {
    // Use asset's baseRadius and lightSpacing if available
    const defaultRadius = asset?.baseRadius || 50;
    const defaultSpacing = asset?.lightSpacing || 18;

    const newDecor = {
      id: `decor_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`,
      type: "circle",
      center,
      radius: radius || defaultRadius,
      assetId: assetId || "wreath-traditional-pine", // Default to the PNG decor
      lightSpacing: defaultSpacing,
      createdAt: Date.now(),
    };
    setDecor((prev) => [...prev, newDecor]);
    return newDecor.id;
  };

  // Remove a decor item by ID
  const removeDecor = (decorId) => {
    setDecor((prev) => prev.filter((decor) => decor.id !== decorId));
    if (selectedDecorId === decorId) {
      setSelectedDecorId(null);
    }
  };

  // Update decor properties
  const updateDecor = (decorId, updates) => {
    setDecor((prev) =>
      prev.map((decor) =>
        decor.id === decorId ? { ...decor, ...updates } : decor
      )
    );
  };

  // Move decor center
  const moveDecor = (decorId, newCenter) => {
    updateDecor(decorId, { center: newCenter });
  };

  // Resize decor with proper bounds
  const resizeDecor = (decorId, newRadius) => {
    // Set reasonable min/max bounds for decor sizing
    const minRadius = 5; // Smaller minimum - allow smaller decor items
    const maxRadius = 120; // Upper bound - prevent oversized decor items

    const clampedRadius = Math.min(Math.max(minRadius, newRadius), maxRadius);
    updateDecor(decorId, { radius: clampedRadius });
  };

  // Calculate light positions for a decor item
  const calculateDecorLightPositions = (decor) => {
    const circumference = 2 * Math.PI * decor.radius;
    const lightCount = Math.floor(circumference / decor.lightSpacing);
    const angleStep = (2 * Math.PI) / lightCount;

    return Array.from({ length: lightCount }, (_, i) => {
      const angle = i * angleStep;
      return {
        x: decor.center.x + decor.radius * Math.cos(angle),
        y: decor.center.y + decor.radius * Math.sin(angle),
        angle,
        index: i,
      };
    });
  };

  // Get decor by ID
  const getDecorById = (decorId) => {
    return decor.find((decor) => decor.id === decorId);
  };

  // Check if point is inside decor (for selection) - entire decor area is touchable
  const isPointInDecor = (point, decor, tolerance = 0) => {
    const distance = Math.sqrt(
      Math.pow(point.x - decor.center.x, 2) +
        Math.pow(point.y - decor.center.y, 2)
    );
    // Point is inside if distance from center is less than or equal to radius
    return distance <= decor.radius + tolerance;
  };

  // Find decor at point
  const findDecorAtPoint = (point) => {
    // Check in reverse order (most recently added first)
    for (let i = decor.length - 1; i >= 0; i--) {
      const decorItem = decor[i];
      if (isPointInDecor(point, decorItem)) {
        return decorItem;
      }
    }
    return null;
  };

  // Get resize handle positions for a decor item (left and right only)
  const getResizeHandles = (decor) => {
    if (!decor) return [];

    const handles = [];
    const handlePositions = [
      { angle: 0, label: "right" }, // Right side
      // { angle: Math.PI, label: "left" }, // Left side
    ];

    handlePositions.forEach(({ angle, label }) => {
      handles.push({
        x: decor.center.x + decor.radius * Math.cos(angle),
        y: decor.center.y + decor.radius * Math.sin(angle),
        angle,
        label,
      });
    });

    return handles;
  };

  // Clear all decor
  const clearDecor = () => {
    setDecor([]);
    setSelectedDecorId(null);
  };

  // Undo/Redo support
  const saveState = () => {
    return {
      decor: JSON.parse(JSON.stringify(decor)),
      selectedDecorId,
    };
  };

  const restoreState = (state) => {
    setDecor(state.decor || []);
    setSelectedDecorId(state.selectedDecorId || null);
  };

  // Load decor from saved data
  const loadDecor = useCallback((decorData) => {
    console.log('💡 useDecorShapes: loadDecor called with:', decorData);
    if (decorData && Array.isArray(decorData)) {
      setDecor(decorData);
      console.log('💡 useDecorShapes: Loaded', decorData.length, 'decor items');
    } else {
      console.log('💡 useDecorShapes: No valid decor data to load');
    }
  }, []);

  return {
    decor,
    selectedDecorId,
    setSelectedDecorId,
    addDecor,
    removeDecor,
    updateDecor,
    moveDecor,
    resizeDecor,
    calculateDecorLightPositions,
    getDecorById,
    isPointInDecor,
    findDecorAtPoint,
    getResizeHandles,
    clearDecor,
    saveState,
    restoreState,
    loadDecor,
  };
}
