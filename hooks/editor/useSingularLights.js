import { useCallback, useEffect, useRef, useState } from "react";

export function useSingularLights(lightAssets = []) {
  const [singularLights, setSingularLights] = useState([]);
  const [selectedLightId, setSelectedLightId] = useState(null);
  const [deletedLight, setDeletedLight] = useState(null);

  // Use a ref for the undo timer to easily clear it
  const undoTimerRef = useRef(null);

  // Clear any existing undo timer
  const clearUndoTimer = () => {
    if (undoTimerRef.current) {
      clearTimeout(undoTimerRef.current);
      undoTimerRef.current = null;
    }
  };

  // Delete a specific singular light without confirmation
  const deleteSingularLight = useCallback(
    (lightId) => {
      // First, clear any existing undo timer
      clearUndoTimer();

      // Find the light to store for potential undo
      const lightToDelete = singularLights.find(
        (light) => light.id === lightId
      );

      if (!lightToDelete) {
        console.error(`No singular light found with id: ${lightId}`);
        return;
      }

      // Store the deleted light for potential undo
      setDeletedLight(lightToDelete);

      // Remove the light from the list
      setSingularLights((prev) => prev.filter((light) => light.id !== lightId));

      // Deselect after deletion
      setSelectedLightId(null);

      // Set a timer to clear the deleted light from undo history
      undoTimerRef.current = setTimeout(() => {
        setDeletedLight(null);
      }, 5000); // 5 seconds to undo

      return lightToDelete;
    },
    [singularLights]
  );

  // Undo the last deletion
  const undoDelete = useCallback(() => {
    if (!deletedLight) return false;

    // Clear the undo timer
    clearUndoTimer();

    // Add the light back
    setSingularLights((prev) => [...prev, deletedLight]);

    // Optionally select the restored light
    setSelectedLightId(deletedLight.id);

    // Clear the deleted light state
    setDeletedLight(null);

    return true;
  }, [deletedLight]);

  // Add a new singular light
  const addSingularLight = useCallback((position, assetId, asset) => {
    // Clear any existing undo state when adding a new light
    clearUndoTimer();
    setDeletedLight(null);

    const newLightId = Date.now().toString();
    const newLight = {
      id: newLightId,
      position: { x: position.x, y: position.y },
      assetId: assetId,
      asset: asset,
      lightIndex: 0, // For pattern-based lights
    };

    setSingularLights((prev) => [...prev, newLight]);

    // Optionally auto-select newly created light
    setSelectedLightId(newLightId);

    return newLightId;
  }, []);

  // Clear all singular lights
  const clearAllSingularLights = useCallback(() => {
    console.log("💡 useSingularLights: CLEARING ALL SINGULAR LIGHTS");
    // Clear any existing undo state
    clearUndoTimer();
    setDeletedLight(null);

    setSingularLights([]);
    setSelectedLightId(null);
  }, []);

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

  // Debug: Log when singularLights state changes
  useEffect(() => {
    console.log(
      "💡 useSingularLights: State changed - current singularLights:",
      singularLights.length,
      "lights"
    );
    if (singularLights.length > 0) {
      console.log(
        "💡 useSingularLights: First light:",
        JSON.stringify(singularLights[0], null, 2)
      );
    }
  }, [singularLights]);

  // Load singular lights from saved data
  const loadSingularLights = useCallback((singularLightsData) => {
    if (singularLightsData && Array.isArray(singularLightsData)) {
      console.log(
        "💡 useSingularLights: Loading singular lights data:",
        JSON.stringify(singularLightsData, null, 2)
      );
      setSingularLights(singularLightsData);
      console.log(
        "💡 useSingularLights: State updated with",
        singularLightsData.length,
        "singular lights"
      );
    } else {
      console.log(
        "💡 useSingularLights: No valid singular lights data to load"
      );
    }
  }, []);

  return {
    singularLights,
    selectedLightId,
    deletedLight, // Add deleted light to check if undo is available
    addSingularLight,
    updateSingularLight,
    moveSingularLight,
    deleteSingularLight,
    undoDelete, // New undo function
    clearAllSingularLights,
    selectSingularLight,
    deselectSingularLight,
    findSingularLightAtPoint,
    getSingularLightById,
    getAssetTypeNameForLight,
    loadSingularLights,
  };
}
