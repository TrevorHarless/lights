import { useCallback, useState } from "react";
import { UNDO_ACTION_TYPES, useUndoSystem } from "./useUndoSystem";

export function useLightStrings(
  lightAssets = [],
  getScaledSpacing = null,
  undoSystem = null,
  getLightSizeScale = null
) {
  const [lightStrings, setLightStrings] = useState([]);
  const [selectedStringId, setSelectedStringId] = useState(null);

  // Use passed undo system or create a local one for backward compatibility
  const localUndoSystem = useUndoSystem();
  const undo = undoSystem || localUndoSystem;

  // Delete a specific light string without confirmation
  const deleteLightString = useCallback(
    (stringId) => {
      // Find the string to delete
      const stringToDelete = lightStrings.find(
        (string) => string.id === stringId
      );

      if (!stringToDelete) {
        console.error(`No light string found with id: ${stringId}`);
        return;
      }

      // Record the delete action for undo
      undo.recordAction({
        type: UNDO_ACTION_TYPES.DELETE_LIGHT_STRING,
        data: {
          string: stringToDelete,
          wasSelected: selectedStringId === stringId,
        },
      });

      // Remove the string from the list
      setLightStrings((prev) =>
        prev.filter((string) => string.id !== stringId)
      );

      // Deselect after deletion
      if (selectedStringId === stringId) {
        setSelectedStringId(null);
      }

      return stringToDelete;
    },
    [lightStrings, selectedStringId, undo]
  );

  // Undo the last action
  const undoLastAction = useCallback(() => {
    if (!undo.canUndo) return false;

    const lastAction = undo.popLastAction();
    if (!lastAction) return false;

    switch (lastAction.type) {
      case UNDO_ACTION_TYPES.DELETE_LIGHT_STRING:
        // Restore deleted string
        setLightStrings((prev) => [...prev, lastAction.data.string]);
        if (lastAction.data.wasSelected) {
          setSelectedStringId(lastAction.data.string.id);
        }
        break;

      case UNDO_ACTION_TYPES.ADD_LIGHT_STRING:
        // Remove added string
        setLightStrings((prev) =>
          prev.filter((string) => string.id !== lastAction.data.string.id)
        );
        if (selectedStringId === lastAction.data.string.id) {
          setSelectedStringId(null);
        }
        break;

      case UNDO_ACTION_TYPES.MOVE_LIGHT_STRING:
        // Restore previous positions
        setLightStrings((prev) =>
          prev.map((string) =>
            string.id === lastAction.data.entityId
              ? {
                  ...string,
                  start: lastAction.data.startState.start,
                  end: lastAction.data.startState.end,
                }
              : string
          )
        );
        break;

      default:
        console.warn("Unknown undo action type:", lastAction.type);
        return false;
    }

    return true;
  }, [undo, selectedStringId]);

  // Add a new light string
  const addLightString = useCallback(
    (vector) => {
      const newStringId = Date.now().toString();
      const newString = { ...vector, id: newStringId };

      // Record the add action for undo
      undo.recordAction({
        type: UNDO_ACTION_TYPES.ADD_LIGHT_STRING,
        data: {
          string: newString,
        },
      });

      setLightStrings((prev) => [...prev, newString]);

      // Optionally auto-select newly created string
      setSelectedStringId(newStringId);

      return newStringId;
    },
    [undo]
  );

  // Clear all light strings
  const clearAllLightStrings = useCallback(() => {
    // Clear undo history when clearing all
    undo.clearUndoHistory();

    setLightStrings([]);
    setSelectedStringId(null);
  }, [undo]);

  // Select a light string
  const selectLightString = useCallback((stringId) => {
    setSelectedStringId(stringId);
  }, []);

  // Deselect the current light string
  const deselectLightString = useCallback(() => {
    setSelectedStringId(null);
  }, []);

  // Start tracking a move operation
  const startMovingLightString = useCallback(
    (stringId) => {
      const string = lightStrings.find((s) => s.id === stringId);
      if (string) {
        undo.startMoveTracking("LIGHT_STRING", stringId, {
          start: string.start,
          end: string.end,
        });
      }
    },
    [lightStrings, undo]
  );

  // End tracking a move operation
  const endMovingLightString = useCallback(
    (stringId) => {
      const string = lightStrings.find((s) => s.id === stringId);
      if (string) {
        undo.endMoveTracking("LIGHT_STRING", stringId, {
          start: string.start,
          end: string.end,
        });
      }
    },
    [lightStrings, undo]
  );

  // Update a light string's start or end position
  const updateLightString = useCallback((stringId, updates) => {
    setLightStrings((prev) =>
      prev.map((string) =>
        string.id === stringId ? { ...string, ...updates } : string
      )
    );
  }, []);

  // Helper function to get a readable name for the string type
  const getAssetTypeNameForString = useCallback(
    (string) => {
      if (!string || !string.assetId) return "unknown";

      // Find the asset in the provided lightAssets array
      const asset = lightAssets.find((asset) => asset.id === string.assetId);

      // If found, return its name, otherwise use a default mapping
      if (asset) return asset.name;

      // Fallback mapping
      const assetTypes = {
        "glow-light-blue": "Blue Glow",
        "warm-white": "Warm White",
        "test-light": "Test Light",
      };

      return assetTypes[string.assetId] || "selected";
    },
    [lightAssets]
  );

  // Find the closest light string to a point within a threshold
  const findClosestLightString = useCallback(
    (point, staticThreshold = null) => {
      if (lightStrings.length === 0) return null;

      // Calculate dynamic threshold based on light size scale
      let threshold;
      if (staticThreshold !== null) {
        threshold = staticThreshold;
      } else {
        const baseThreshold = 8; // minimum touch area in pixels
        const lightSizeMultiplier = getLightSizeScale ? getLightSizeScale() : 1;
        threshold = Math.max(baseThreshold, baseThreshold * lightSizeMultiplier * 1.5);
      }

      let closestString = null;
      let minDistance = Number.MAX_VALUE;

      lightStrings.forEach((string) => {
        // Check distance to endpoints first (makes it easier to select short strings)
        const distanceToStart = Math.sqrt(
          (point.x - string.start.x) ** 2 + (point.y - string.start.y) ** 2
        );

        const distanceToEnd = Math.sqrt(
          (point.x - string.end.x) ** 2 + (point.y - string.end.y) ** 2
        );

        // Give endpoints a slight priority by multiplying by 0.8
        const endpointDistance = Math.min(distanceToStart, distanceToEnd) * 0.8;

        // Also calculate the line segment distance
        const lineDistance = pointToLineDistance(
          point,
          string.start,
          string.end
        );

        // Use the smaller of the two distances
        const distance = Math.min(endpointDistance, lineDistance);

        if (distance < minDistance && distance <= threshold) {
          minDistance = distance;
          closestString = string;
        }
      });

      return closestString;
    },
    [lightStrings, getLightSizeScale]
  );

  // Calculate positions for lights along a vector
  const calculateLightPositions = useCallback(
    (vector, assetSpacing, asset = null) => {
      if (!vector) return [];

      const { start, end } = vector;
      const dx = end.x - start.x;
      const dy = end.y - start.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // Custom style-based lights (renderType: "style") use their own spacing
      // Custom patterns and preset lights (renderType: "pattern" or "image") use scaled spacing
      let spacing;
      if (asset && asset.type === "custom" && asset.renderType === "style") {
        spacing = assetSpacing; // Use custom light's own spacing
      } else {
        spacing = getScaledSpacing ? getScaledSpacing() : assetSpacing; // Use scaled spacing for patterns and presets
      }

      // Calculate how many lights to place
      const count = Math.floor(distance / spacing);

      // console.log('🔍 Light Position Debug:', {
      //   distance,
      //   spacing,
      //   assetSpacing,
      //   count,
      //   hasScaledSpacing: !!getScaledSpacing,
      //   scaledSpacingValue: getScaledSpacing ? getScaledSpacing() : null,
      //   vectorId: vector.id,
      //   assetId: vector.assetId
      // });

      // If distance is too short, at least place one light
      if (count === 0) return [{ x: start.x, y: start.y }];

      const positions = [];

      for (let i = 0; i <= count; i++) {
        const progress = i / count;
        positions.push({
          x: start.x + dx * progress,
          y: start.y + dy * progress,
        });
      }

      return positions;
    },
    [getScaledSpacing]
  );

  // Calculate the distance from a point to a line segment
  const pointToLineDistance = (point, lineStart, lineEnd) => {
    // Line vector
    const dx = lineEnd.x - lineStart.x;
    const dy = lineEnd.y - lineStart.y;

    // Line length squared
    const lenSq = dx * dx + dy * dy;

    // If the line is just a point, calculate direct distance to that point
    if (lenSq === 0) {
      return Math.sqrt(
        (point.x - lineStart.x) * (point.x - lineStart.x) +
          (point.y - lineStart.y) * (point.y - lineStart.y)
      );
    }

    // Calculate projection proportion
    const t = Math.max(
      0,
      Math.min(
        1,
        ((point.x - lineStart.x) * dx + (point.y - lineStart.y) * dy) / lenSq
      )
    );

    // Find the closest point on the segment
    const projX = lineStart.x + t * dx;
    const projY = lineStart.y + t * dy;

    // Calculate the distance to the projected point
    return Math.sqrt(
      (point.x - projX) * (point.x - projX) +
        (point.y - projY) * (point.y - projY)
    );
  };

  // Load light strings from saved data
  const loadLightStrings = useCallback((lightStringsData) => {
    if (lightStringsData && Array.isArray(lightStringsData)) {
      setLightStrings(lightStringsData);
    }
  }, []);

  return {
    lightStrings,
    selectedStringId,
    canUndo: undo.canUndo, // Check if undo is available
    addLightString,
    updateLightString,
    startMovingLightString, // New move tracking functions
    endMovingLightString,
    deleteLightString,
    undoLastAction, // New unified undo function
    clearAllLightStrings,
    calculateLightPositions,
    selectLightString,
    deselectLightString,
    findClosestLightString,
    getAssetTypeNameForString,
    loadLightStrings,
  };
}
