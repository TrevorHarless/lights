import { useCallback, useState } from "react";

export function useMeasurementLines(getLineLengthInFeet) {
  const [measurementLines, setMeasurementLines] = useState([]);
  const [selectedMeasurementId, setSelectedMeasurementId] = useState(null);

  // Add a new measurement line
  const addMeasurementLine = useCallback(
    (line) => {
      if (!getLineLengthInFeet) return;

      const lengthInFeet = getLineLengthInFeet(line.start, line.end);
      if (lengthInFeet === null) return;

      const newLine = {
        id: `measurement_${Date.now()}`,
        start: line.start,
        end: line.end,
        lengthInFeet: lengthInFeet,
        label: `${lengthInFeet.toFixed(1)} ft`
      };

      setMeasurementLines(prev => [...prev, newLine]);
    },
    [getLineLengthInFeet]
  );

  // Update a measurement line (for handle dragging)
  const updateMeasurementLine = useCallback(
    (lineId, newStart, newEnd) => {
      if (!getLineLengthInFeet) return;

      const lengthInFeet = getLineLengthInFeet(newStart, newEnd);
      if (lengthInFeet === null) return;

      setMeasurementLines(prev => 
        prev.map(line => 
          line.id === lineId 
            ? {
                ...line,
                start: newStart,
                end: newEnd,
                lengthInFeet: lengthInFeet,
                label: `${lengthInFeet.toFixed(1)} ft`
              }
            : line
        )
      );
    },
    [getLineLengthInFeet]
  );

  // Remove a measurement line
  const removeMeasurementLine = useCallback((lineId) => {
    setMeasurementLines(prev => prev.filter(line => line.id !== lineId));
    if (selectedMeasurementId === lineId) {
      setSelectedMeasurementId(null);
    }
  }, [selectedMeasurementId]);

  // Clear all measurement lines
  const clearAllMeasurementLines = useCallback(() => {
    setMeasurementLines([]);
    setSelectedMeasurementId(null);
  }, []);

  // Select a measurement line
  const selectMeasurementLine = useCallback((lineId) => {
    setSelectedMeasurementId(lineId);
  }, []);

  // Deselect measurement line
  const deselectMeasurementLine = useCallback(() => {
    setSelectedMeasurementId(null);
  }, []);

  // Find measurement line at a point (for selection)
  const findMeasurementLineAtPoint = useCallback((x, y, tolerance = 20) => {
    for (const line of measurementLines) {
      // Calculate distance from point to line segment
      const { start, end } = line;
      
      // Calculate distance from point to line
      const A = x - start.x;
      const B = y - start.y;
      const C = end.x - start.x;
      const D = end.y - start.y;

      const dot = A * C + B * D;
      const lenSq = C * C + D * D;
      
      if (lenSq === 0) continue; // Line has no length
      
      let t = Math.max(0, Math.min(1, dot / lenSq));
      
      const projection = {
        x: start.x + t * C,
        y: start.y + t * D
      };
      
      const distance = Math.sqrt(
        Math.pow(x - projection.x, 2) + Math.pow(y - projection.y, 2)
      );
      
      if (distance <= tolerance) {
        return line;
      }
    }
    return null;
  }, [measurementLines]);

  // Find handle at a point (for dragging)
  const findMeasurementHandleAtPoint = useCallback((x, y, tolerance = 15) => {
    if (!selectedMeasurementId) return null;
    
    const selectedLine = measurementLines.find(line => line.id === selectedMeasurementId);
    if (!selectedLine) return null;
    
    // Check start handle
    const distanceToStart = Math.sqrt(
      Math.pow(x - selectedLine.start.x, 2) + 
      Math.pow(y - selectedLine.start.y, 2)
    );
    
    if (distanceToStart <= tolerance) {
      return { lineId: selectedMeasurementId, handleType: 'start' };
    }
    
    // Check end handle
    const distanceToEnd = Math.sqrt(
      Math.pow(x - selectedLine.end.x, 2) + 
      Math.pow(y - selectedLine.end.y, 2)
    );
    
    if (distanceToEnd <= tolerance) {
      return { lineId: selectedMeasurementId, handleType: 'end' };
    }
    
    return null;
  }, [measurementLines, selectedMeasurementId]);

  // Load measurement lines from saved data
  const loadMeasurementLines = useCallback((lines) => {
    if (Array.isArray(lines)) {
      setMeasurementLines(lines);
      console.log('📏 MeasurementLines: Loaded saved measurement lines');
    }
  }, []);

  // Recalculate all measurement lines when reference scale changes
  const recalculateAllMeasurements = useCallback(() => {
    if (!getLineLengthInFeet) return;

    console.log('📏 MeasurementLines: Recalculating all measurements due to reference scale change');
    
    setMeasurementLines(prev => {
      if (prev.length === 0) return prev;
      
      return prev.map(line => {
        const lengthInFeet = getLineLengthInFeet(line.start, line.end);
        if (lengthInFeet === null) return line;

        return {
          ...line,
          lengthInFeet: lengthInFeet,
          label: `${lengthInFeet.toFixed(1)} ft`
        };
      });
    });
  }, [getLineLengthInFeet]);

  return {
    // State
    measurementLines,
    selectedMeasurementId,

    // Actions
    addMeasurementLine,
    updateMeasurementLine,
    removeMeasurementLine,
    clearAllMeasurementLines,
    selectMeasurementLine,
    deselectMeasurementLine,
    findMeasurementLineAtPoint,
    findMeasurementHandleAtPoint,
    loadMeasurementLines,
    recalculateAllMeasurements,

    // Helpers
    getMeasurementLineById: useCallback(
      (id) => measurementLines.find(line => line.id === id),
      [measurementLines]
    ),
  };
}