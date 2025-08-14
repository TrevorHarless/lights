// hooks/editor/useWreathShapes.js
import React from "react";

export function useWreathShapes() {
  const [wreaths, setWreaths] = React.useState([]);
  const [selectedWreathId, setSelectedWreathId] = React.useState(null);

  // Add a new wreath
  const addWreath = (center, radius, assetId, asset = null) => {
    // Use asset's baseRadius and lightSpacing if available
    const defaultRadius = asset?.baseRadius || 50;
    const defaultSpacing = asset?.lightSpacing || 18;

    const newWreath = {
      id: `wreath_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`,
      type: "circle",
      center,
      radius: radius || defaultRadius,
      assetId: assetId || "wreath-traditional-pine", // Default to the PNG wreath
      lightSpacing: defaultSpacing,
      createdAt: Date.now(),
    };
    setWreaths((prev) => [...prev, newWreath]);
    return newWreath.id;
  };

  // Remove a wreath by ID
  const removeWreath = (wreathId) => {
    setWreaths((prev) => prev.filter((wreath) => wreath.id !== wreathId));
    if (selectedWreathId === wreathId) {
      setSelectedWreathId(null);
    }
  };

  // Update wreath properties
  const updateWreath = (wreathId, updates) => {
    setWreaths((prev) =>
      prev.map((wreath) =>
        wreath.id === wreathId ? { ...wreath, ...updates } : wreath
      )
    );
  };

  // Move wreath center
  const moveWreath = (wreathId, newCenter) => {
    updateWreath(wreathId, { center: newCenter });
  };

  // Resize wreath with proper bounds
  const resizeWreath = (wreathId, newRadius) => {
    // Set reasonable min/max bounds for wreath sizing
    const minRadius = 5; // Smaller minimum - allow smaller wreaths
    const maxRadius = 120; // Upper bound - prevent oversized wreaths

    const clampedRadius = Math.min(Math.max(minRadius, newRadius), maxRadius);
    updateWreath(wreathId, { radius: clampedRadius });
  };

  // Calculate light positions for a wreath
  const calculateWreathLightPositions = (wreath) => {
    const circumference = 2 * Math.PI * wreath.radius;
    const lightCount = Math.floor(circumference / wreath.lightSpacing);
    const angleStep = (2 * Math.PI) / lightCount;

    return Array.from({ length: lightCount }, (_, i) => {
      const angle = i * angleStep;
      return {
        x: wreath.center.x + wreath.radius * Math.cos(angle),
        y: wreath.center.y + wreath.radius * Math.sin(angle),
        angle,
        index: i,
      };
    });
  };

  // Get wreath by ID
  const getWreathById = (wreathId) => {
    return wreaths.find((wreath) => wreath.id === wreathId);
  };

  // Check if point is inside wreath (for selection) - entire wreath area is touchable
  const isPointInWreath = (point, wreath, tolerance = 0) => {
    const distance = Math.sqrt(
      Math.pow(point.x - wreath.center.x, 2) +
        Math.pow(point.y - wreath.center.y, 2)
    );
    // Point is inside if distance from center is less than or equal to radius
    return distance <= wreath.radius + tolerance;
  };

  // Find wreath at point
  const findWreathAtPoint = (point) => {
    // Check in reverse order (most recently added first)
    for (let i = wreaths.length - 1; i >= 0; i--) {
      const wreath = wreaths[i];
      if (isPointInWreath(point, wreath)) {
        return wreath;
      }
    }
    return null;
  };

  // Get resize handle positions for a wreath (left and right only)
  const getResizeHandles = (wreath) => {
    if (!wreath) return [];

    const handles = [];
    const handlePositions = [
      { angle: 0, label: "right" }, // Right side
      // { angle: Math.PI, label: "left" }, // Left side
    ];

    handlePositions.forEach(({ angle, label }) => {
      handles.push({
        x: wreath.center.x + wreath.radius * Math.cos(angle),
        y: wreath.center.y + wreath.radius * Math.sin(angle),
        angle,
        label,
      });
    });

    return handles;
  };

  // Clear all wreaths
  const clearWreaths = () => {
    setWreaths([]);
    setSelectedWreathId(null);
  };

  // Undo/Redo support
  const saveState = () => {
    return {
      wreaths: JSON.parse(JSON.stringify(wreaths)),
      selectedWreathId,
    };
  };

  const restoreState = (state) => {
    setWreaths(state.wreaths || []);
    setSelectedWreathId(state.selectedWreathId || null);
  };

  return {
    wreaths,
    selectedWreathId,
    setSelectedWreathId,
    addWreath,
    removeWreath,
    updateWreath,
    moveWreath,
    resizeWreath,
    calculateWreathLightPositions,
    getWreathById,
    isPointInWreath,
    findWreathAtPoint,
    getResizeHandles,
    clearWreaths,
    saveState,
    restoreState,
  };
}
