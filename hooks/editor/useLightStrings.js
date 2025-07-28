import { useCallback, useRef, useState } from 'react';

export function useLightStrings(lightAssets = [], getScaledSpacing = null) {
  const [lightStrings, setLightStrings] = useState([]);
  const [selectedStringId, setSelectedStringId] = useState(null);
  const [deletedString, setDeletedString] = useState(null);

  // Use a ref for the undo timer to easily clear it
  const undoTimerRef = useRef(null);

  // Clear any existing undo timer
  const clearUndoTimer = () => {
    if (undoTimerRef.current) {
      clearTimeout(undoTimerRef.current);
      undoTimerRef.current = null;
    }
  };

  // Delete a specific light string without confirmation
  const deleteLightString = useCallback(
    (stringId) => {
      // First, clear any existing undo timer
      clearUndoTimer();

      // Find the string to store for potential undo
      const stringToDelete = lightStrings.find((string) => string.id === stringId);

      if (!stringToDelete) {
        console.error(`No light string found with id: ${stringId}`);
        return;
      }

      // Store the deleted string for potential undo
      setDeletedString(stringToDelete);

      // Remove the string from the list
      setLightStrings((prev) => prev.filter((string) => string.id !== stringId));

      // Deselect after deletion
      setSelectedStringId(null);

      // Set a timer to clear the deleted string from undo history
      undoTimerRef.current = setTimeout(() => {
        setDeletedString(null);
      }, 5000); // 5 seconds to undo

      return stringToDelete;
    },
    [lightStrings]
  );

  // Undo the last deletion
  const undoDelete = useCallback(() => {
    if (!deletedString) return false;

    // Clear the undo timer
    clearUndoTimer();

    // Add the string back
    setLightStrings((prev) => [...prev, deletedString]);

    // Optionally select the restored string
    setSelectedStringId(deletedString.id);

    // Clear the deleted string state
    setDeletedString(null);

    return true;
  }, [deletedString]);

  // Add a new light string
  const addLightString = (vector) => {
    // Clear any existing undo state when adding a new string
    clearUndoTimer();
    setDeletedString(null);

    const newStringId = Date.now().toString();
    setLightStrings((prev) => [...prev, { ...vector, id: newStringId }]);

    // Optionally auto-select newly created string
    setSelectedStringId(newStringId);
  };

  // Clear all light strings
  const clearAllLightStrings = useCallback(() => {
    // Clear any existing undo state
    clearUndoTimer();
    setDeletedString(null);

    setLightStrings([]);
    setSelectedStringId(null);
  }, []);

  // Select a light string
  const selectLightString = useCallback((stringId) => {
    setSelectedStringId(stringId);
  }, []);

  // Deselect the current light string
  const deselectLightString = useCallback(() => {
    setSelectedStringId(null);
  }, []);

  // Helper function to get a readable name for the string type
  const getAssetTypeNameForString = useCallback(
    (string) => {
      if (!string || !string.assetId) return 'unknown';

      // Find the asset in the provided lightAssets array
      const asset = lightAssets.find((asset) => asset.id === string.assetId);

      // If found, return its name, otherwise use a default mapping
      if (asset) return asset.name;

      // Fallback mapping
      const assetTypes = {
        'glow-light-blue': 'Blue Glow',
        'warm-white': 'Warm White',
        'test-light': 'Test Light',
      };

      return assetTypes[string.assetId] || 'selected';
    },
    [lightAssets]
  );

  // Find the closest light string to a point within a threshold
  const findClosestLightString = useCallback(
    (point, threshold = 20) => {
      if (lightStrings.length === 0) return null;

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
        const lineDistance = pointToLineDistance(point, string.start, string.end);

        // Use the smaller of the two distances
        const distance = Math.min(endpointDistance, lineDistance);

        if (distance < minDistance && distance <= threshold) {
          minDistance = distance;
          closestString = string;
        }
      });

      return closestString;
    },
    [lightStrings]
  );

  // Calculate positions for lights along a vector
  const calculateLightPositions = useCallback(
    (vector, assetSpacing) => {
      if (!vector) return [];

      const { start, end } = vector;
      const dx = end.x - start.x;
      const dy = end.y - start.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // Use scaled spacing if available, otherwise use asset default spacing
      const spacing = getScaledSpacing ? getScaledSpacing() : assetSpacing;

      // Calculate how many lights to place
      const count = Math.floor(distance / spacing);

      console.log('🔍 Light Position Debug:', {
        distance,
        spacing,
        assetSpacing,
        count,
        hasScaledSpacing: !!getScaledSpacing,
      });

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
      Math.min(1, ((point.x - lineStart.x) * dx + (point.y - lineStart.y) * dy) / lenSq)
    );

    // Find the closest point on the segment
    const projX = lineStart.x + t * dx;
    const projY = lineStart.y + t * dy;

    // Calculate the distance to the projected point
    return Math.sqrt((point.x - projX) * (point.x - projX) + (point.y - projY) * (point.y - projY));
  };

  return {
    lightStrings,
    selectedStringId,
    deletedString, // Add deleted string to check if undo is available
    addLightString,
    deleteLightString,
    undoDelete, // New undo function
    clearAllLightStrings,
    calculateLightPositions,
    selectLightString,
    deselectLightString,
    findClosestLightString,
    getAssetTypeNameForString,
  };
}
