// hooks/editor/useDecorShapes.js
import React, { useCallback } from "react";
import { useUndoSystem, UNDO_ACTION_TYPES } from "./useUndoSystem";

export function useDecorShapes(undoSystem = null) {
  const [decor, setDecor] = React.useState([]);
  const [selectedDecorId, setSelectedDecorId] = React.useState(null);
  
  // Use passed undo system or create a local one for backward compatibility
  const localUndoSystem = useUndoSystem();
  const undo = undoSystem || localUndoSystem;

  // Add a new decor item
  const addDecor = useCallback((center, radius, assetId, asset = null) => {
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

    // Record the add action for undo
    undo.recordAction({
      type: UNDO_ACTION_TYPES.ADD_DECOR_SHAPE,
      data: {
        decor: newDecor
      }
    });

    setDecor((prev) => [...prev, newDecor]);
    return newDecor.id;
  }, [undo]);

  // Remove a decor item by ID
  const removeDecor = useCallback((decorId) => {
    const decorToDelete = decor.find(d => d.id === decorId);
    if (!decorToDelete) {
      console.error(`No decor found with id: ${decorId}`);
      return;
    }

    // Record the delete action for undo
    undo.recordAction({
      type: UNDO_ACTION_TYPES.DELETE_DECOR_SHAPE,
      data: {
        decor: decorToDelete,
        wasSelected: selectedDecorId === decorId
      }
    });

    setDecor((prev) => prev.filter((decor) => decor.id !== decorId));
    if (selectedDecorId === decorId) {
      setSelectedDecorId(null);
    }
  }, [decor, selectedDecorId, undo]);

  // Update decor properties
  const updateDecor = (decorId, updates) => {
    setDecor((prev) =>
      prev.map((decor) =>
        decor.id === decorId ? { ...decor, ...updates } : decor
      )
    );
  };

  // Start tracking a move operation
  const startMovingDecor = useCallback((decorId) => {
    const decorItem = decor.find(d => d.id === decorId);
    if (decorItem) {
      undo.startMoveTracking('DECOR_SHAPE', decorId, { 
        center: decorItem.center 
      });
    }
  }, [decor, undo]);

  // End tracking a move operation
  const endMovingDecor = useCallback((decorId) => {
    const decorItem = decor.find(d => d.id === decorId);
    if (decorItem) {
      undo.endMoveTracking('DECOR_SHAPE', decorId, { 
        center: decorItem.center 
      });
    }
  }, [decor, undo]);

  // Move decor center
  const moveDecor = useCallback((decorId, newCenter) => {
    updateDecor(decorId, { center: newCenter });
  }, []);

  // Start tracking a resize operation
  const startResizingDecor = useCallback((decorId) => {
    const decorItem = decor.find(d => d.id === decorId);
    if (decorItem) {
      undo.startMoveTracking('DECOR_SHAPE', decorId, { 
        radius: decorItem.radius 
      });
    }
  }, [decor, undo]);

  // End tracking a resize operation
  const endResizingDecor = useCallback((decorId) => {
    const decorItem = decor.find(d => d.id === decorId);
    if (decorItem) {
      undo.endMoveTracking('DECOR_SHAPE', decorId, { 
        radius: decorItem.radius 
      }, 'RESIZE');
    }
  }, [decor, undo]);

  // Resize decor with proper bounds
  const resizeDecor = useCallback((decorId, newRadius) => {
    // Set reasonable min/max bounds for decor sizing
    const minRadius = 5; // Smaller minimum - allow smaller decor items
    const maxRadius = 120; // Upper bound - prevent oversized decor items

    const clampedRadius = Math.min(Math.max(minRadius, newRadius), maxRadius);
    updateDecor(decorId, { radius: clampedRadius });
  }, []);

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
  const clearDecor = useCallback(() => {
    // Clear undo history when clearing all
    undo.clearUndoHistory();
    
    setDecor([]);
    setSelectedDecorId(null);
  }, [undo]);

  // Undo the last action
  const undoLastAction = useCallback(() => {
    if (!undo.canUndo) return false;

    const lastAction = undo.popLastAction();
    if (!lastAction) return false;

    switch (lastAction.type) {
      case UNDO_ACTION_TYPES.DELETE_DECOR_SHAPE:
        // Restore deleted decor
        setDecor(prev => [...prev, lastAction.data.decor]);
        if (lastAction.data.wasSelected) {
          setSelectedDecorId(lastAction.data.decor.id);
        }
        break;

      case UNDO_ACTION_TYPES.ADD_DECOR_SHAPE:
        // Remove added decor
        setDecor(prev => prev.filter(decor => decor.id !== lastAction.data.decor.id));
        if (selectedDecorId === lastAction.data.decor.id) {
          setSelectedDecorId(null);
        }
        break;

      case UNDO_ACTION_TYPES.MOVE_DECOR_SHAPE:
        // Restore previous position or size
        setDecor(prev => prev.map(decor => {
          if (decor.id === lastAction.data.entityId) {
            const updates = {};
            if (lastAction.data.startState.center) {
              updates.center = lastAction.data.startState.center;
            }
            if (lastAction.data.startState.radius !== undefined) {
              updates.radius = lastAction.data.startState.radius;
            }
            return { ...decor, ...updates };
          }
          return decor;
        }));
        break;

      case UNDO_ACTION_TYPES.RESIZE_DECOR_SHAPE:
        // Restore previous size
        setDecor(prev => prev.map(decor => 
          decor.id === lastAction.data.entityId 
            ? { ...decor, radius: lastAction.data.startState.radius }
            : decor
        ));
        break;

      default:
        console.warn('Unknown undo action type:', lastAction.type);
        return false;
    }

    return true;
  }, [undo, selectedDecorId]);

  // Load decor from saved data
  const loadDecor = useCallback((decorData) => {
    if (decorData && Array.isArray(decorData)) {
      setDecor(decorData);
    }
  }, []);

  return {
    decor,
    selectedDecorId,
    canUndo: undo.canUndo, // Check if undo is available
    setSelectedDecorId,
    addDecor,
    removeDecor,
    updateDecor,
    moveDecor,
    startMovingDecor, // New move tracking functions
    endMovingDecor,
    resizeDecor,
    startResizingDecor, // New resize tracking functions
    endResizingDecor,
    undoLastAction, // New unified undo function
    calculateDecorLightPositions,
    getDecorById,
    isPointInDecor,
    findDecorAtPoint,
    getResizeHandles,
    clearDecor,
    loadDecor,
  };
}
