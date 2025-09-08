import { useCallback, useState } from "react";
import { useUndoSystem, UNDO_ACTION_TYPES } from "./useUndoSystem";

export function useSingularLights(lightAssets = [], undoSystem = null) {
  const [singularLights, setSingularLights] = useState([]);
  const [selectedLightId, setSelectedLightId] = useState(null);
  
  // Use passed undo system or create a local one for backward compatibility
  const localUndoSystem = useUndoSystem();
  const undo = undoSystem || localUndoSystem;

  // Delete a specific singular light without confirmation
  const deleteSingularLight = useCallback(
    (lightId) => {
      // Find the light to delete
      const lightToDelete = singularLights.find(
        (light) => light.id === lightId
      );

      if (!lightToDelete) {
        console.error(`No singular light found with id: ${lightId}`);
        return;
      }

      // Record the delete action for undo
      undo.recordAction({
        type: UNDO_ACTION_TYPES.DELETE_SINGULAR_LIGHT,
        data: {
          light: lightToDelete,
          wasSelected: selectedLightId === lightId
        }
      });

      // Remove the light from the list
      setSingularLights((prev) => prev.filter((light) => light.id !== lightId));

      // Deselect after deletion
      if (selectedLightId === lightId) {
        setSelectedLightId(null);
      }

      return lightToDelete;
    },
    [singularLights, selectedLightId, undo]
  );

  // Undo the last action
  const undoLastAction = useCallback(() => {
    if (!undo.canUndo) return false;

    const lastAction = undo.popLastAction();
    if (!lastAction) return false;

    switch (lastAction.type) {
      case UNDO_ACTION_TYPES.DELETE_SINGULAR_LIGHT:
        // Restore deleted light
        setSingularLights(prev => [...prev, lastAction.data.light]);
        if (lastAction.data.wasSelected) {
          setSelectedLightId(lastAction.data.light.id);
        }
        break;

      case UNDO_ACTION_TYPES.ADD_SINGULAR_LIGHT:
        // Remove added light
        setSingularLights(prev => prev.filter(light => light.id !== lastAction.data.light.id));
        if (selectedLightId === lastAction.data.light.id) {
          setSelectedLightId(null);
        }
        break;

      case UNDO_ACTION_TYPES.MOVE_SINGULAR_LIGHT:
        // Restore previous position
        setSingularLights(prev => prev.map(light => 
          light.id === lastAction.data.entityId 
            ? { ...light, position: lastAction.data.startState.position }
            : light
        ));
        break;

      default:
        console.warn('Unknown undo action type:', lastAction.type);
        return false;
    }

    return true;
  }, [undo, selectedLightId]);

  // Add a new singular light
  const addSingularLight = useCallback((position, assetId, asset) => {
    const newLightId = Date.now().toString();
    const newLight = {
      id: newLightId,
      position: { x: position.x, y: position.y },
      assetId: assetId,
      asset: asset,
      lightIndex: 0, // For pattern-based lights
    };

    // Record the add action for undo
    undo.recordAction({
      type: UNDO_ACTION_TYPES.ADD_SINGULAR_LIGHT,
      data: {
        light: newLight
      }
    });

    setSingularLights((prev) => [...prev, newLight]);

    // Optionally auto-select newly created light
    setSelectedLightId(newLightId);

    return newLightId;
  }, [undo]);

  // Clear all singular lights
  const clearAllSingularLights = useCallback(() => {
    // Clear undo history when clearing all
    undo.clearUndoHistory();

    setSingularLights([]);
    setSelectedLightId(null);
  }, [undo]);

  // Select a singular light
  const selectSingularLight = useCallback((lightId) => {
    setSelectedLightId(lightId);
  }, []);

  // Deselect the current singular light
  const deselectSingularLight = useCallback(() => {
    setSelectedLightId(null);
  }, []);

  // Update a singular light's position or properties
  const updateSingularLight = useCallback((lightId, updates) => {
    setSingularLights((prev) =>
      prev.map((light) =>
        light.id === lightId ? { ...light, ...updates } : light
      )
    );
  }, []);

  // Start tracking a move operation
  const startMovingSingularLight = useCallback((lightId) => {
    const light = singularLights.find(l => l.id === lightId);
    if (light) {
      undo.startMoveTracking('SINGULAR_LIGHT', lightId, { position: light.position });
    }
  }, [singularLights, undo]);

  // End tracking a move operation
  const endMovingSingularLight = useCallback((lightId) => {
    const light = singularLights.find(l => l.id === lightId);
    if (light) {
      undo.endMoveTracking('SINGULAR_LIGHT', lightId, { position: light.position });
    }
  }, [singularLights, undo]);

  // Move a singular light to a new position
  const moveSingularLight = useCallback(
    (lightId, newPosition) => {
      updateSingularLight(lightId, { position: newPosition });
    },
    [updateSingularLight]
  );

  // Helper function to get a readable name for the light type
  const getAssetTypeNameForLight = useCallback(
    (light) => {
      if (!light || !light.assetId) return "unknown";

      // Find the asset in the provided lightAssets array
      const asset = lightAssets.find((asset) => asset.id === light.assetId);

      // If found, return its name, otherwise use a default mapping
      if (asset) return asset.name;

      // Fallback mapping
      const assetTypes = {
        "glow-light-blue": "Blue Glow",
        "warm-white": "Warm White",
        "test-light": "Test Light",
      };

      return assetTypes[light.assetId] || "selected";
    },
    [lightAssets]
  );

  // Find a singular light at a specific point within a threshold
  const findSingularLightAtPoint = useCallback(
    (point, getLightRenderStyle, getLightSizeScale, baseThreshold = 5) => {
      if (singularLights.length === 0) return null;

      for (const light of singularLights) {
        // Calculate dynamic threshold based on light's visual size
        let threshold = baseThreshold;

        if (getLightRenderStyle && getLightSizeScale) {
          try {
            const lightScale = getLightSizeScale();
            const lightStyle = getLightRenderStyle(
              light.assetId,
              lightScale,
              light.lightIndex || 0
            );

            if (lightStyle && lightStyle.width) {
              // Make touchable area match the visual radius plus a small buffer
              const visualRadius = lightStyle.width / 2;
              threshold = Math.max(visualRadius + 3, baseThreshold);
            }
          } catch (error) {
            // Fallback to base threshold if there's any error
            console.warn(
              "Error calculating light size for touch detection:",
              error
            );
          }
        }

        const distance = Math.sqrt(
          Math.pow(point.x - light.position.x, 2) +
            Math.pow(point.y - light.position.y, 2)
        );

        if (distance <= threshold) {
          return light;
        }
      }

      return null;
    },
    [singularLights]
  );

  // Get a light by its ID
  const getSingularLightById = useCallback(
    (lightId) => {
      return singularLights.find((light) => light.id === lightId);
    },
    [singularLights]
  );

  // Load singular lights from saved data
  const loadSingularLights = useCallback((singularLightsData) => {
    if (singularLightsData && Array.isArray(singularLightsData)) {
      setSingularLights(singularLightsData);
    }
  }, []);

  return {
    singularLights,
    selectedLightId,
    canUndo: undo.canUndo, // Check if undo is available
    addSingularLight,
    updateSingularLight,
    moveSingularLight,
    startMovingSingularLight, // New move tracking functions
    endMovingSingularLight,
    deleteSingularLight,
    undoLastAction, // New unified undo function
    clearAllSingularLights,
    selectSingularLight,
    deselectSingularLight,
    findSingularLightAtPoint,
    getSingularLightById,
    getAssetTypeNameForLight,
    loadSingularLights,
  };
}
