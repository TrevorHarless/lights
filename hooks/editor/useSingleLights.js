import { useState } from 'react';

export function useSingleLights() {
  const [singleLights, setSingleLights] = useState([]);
  const [selectedSingleLightIds, setSelectedSingleLightIds] = useState([]);
  const [deletedSingleLights, setDeletedSingleLights] = useState([]);

  const addSingleLight = (position, assetId) => {
    const newLight = {
      id: `single-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      position,
      assetId,
      timestamp: Date.now(),
    };
    setSingleLights(prev => [...prev, newLight]);
    return newLight.id;
  };

  const removeSingleLight = (lightId) => {
    const lightToDelete = singleLights.find(light => light.id === lightId);
    if (lightToDelete) {
      setDeletedSingleLights([lightToDelete]);
      setSingleLights(prev => prev.filter(light => light.id !== lightId));
      setSelectedSingleLightIds(prev => prev.filter(id => id !== lightId));
    }
  };

  const removeSingleLights = (lightIds) => {
    const lightsToDelete = singleLights.filter(light => lightIds.includes(light.id));
    if (lightsToDelete.length > 0) {
      setDeletedSingleLights(lightsToDelete);
      setSingleLights(prev => prev.filter(light => !lightIds.includes(light.id)));
      setSelectedSingleLightIds(prev => prev.filter(id => !lightIds.includes(id)));
    }
  };

  const updateSingleLight = (lightId, updates) => {
    setSingleLights(prev => 
      prev.map(light => 
        light.id === lightId ? { ...light, ...updates } : light
      )
    );
  };

  const clearAllSingleLights = () => {
    setSingleLights([]);
    setSelectedSingleLightIds([]);
    setDeletedSingleLights([]);
  };

  const selectSingleLight = (lightId) => {
    setSelectedSingleLightIds([lightId]);
  };

  const selectSingleLights = (lightIds) => {
    setSelectedSingleLightIds(lightIds);
  };

  const deselectAllSingleLights = () => {
    setSelectedSingleLightIds([]);
  };

  const findSingleLightAtPoint = (point, threshold = 20) => {
    return singleLights.find(light => {
      const distance = Math.sqrt(
        Math.pow(point.x - light.position.x, 2) + 
        Math.pow(point.y - light.position.y, 2)
      );
      return distance <= threshold;
    });
  };

  const undoDeleteSingleLight = () => {
    if (deletedSingleLights.length > 0) {
      setSingleLights(prev => [...prev, ...deletedSingleLights]);
      setDeletedSingleLights([]);
    }
  };

  const canUndoSingleLight = deletedSingleLights.length > 0;

  return {
    // State
    singleLights,
    selectedSingleLightIds,
    
    // CRUD operations
    addSingleLight,
    removeSingleLight,
    removeSingleLights,
    updateSingleLight,
    clearAllSingleLights,
    
    // Selection management
    selectSingleLight,
    selectSingleLights,
    deselectAllSingleLights,
    
    // Utilities
    findSingleLightAtPoint,
    
    // Undo system
    undoDeleteSingleLight,
    canUndoSingleLight,
  };
}