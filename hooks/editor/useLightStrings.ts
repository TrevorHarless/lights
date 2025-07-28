import { useState, useCallback, useRef } from 'react';
import { LightString, Point, Vector, SelectionState, GESTURE_CONSTANTS } from '@/types/editor';
import { 
  generateLightStringId, 
  findClosestLightString 
} from '@/utils/editor/geometry';

interface UseLightStringsProps {
  initialStrings?: LightString[];
}

export const useLightStrings = ({ initialStrings = [] }: UseLightStringsProps = {}) => {
  const [lightStrings, setLightStrings] = useState<LightString[]>(initialStrings);
  const [selectionState, setSelectionState] = useState<SelectionState>({
    selectedStringId: null,
    selectedEndpoint: null
  });

  // Undo system
  const [undoStack, setUndoStack] = useState<LightString[][]>([]);
  const [redoStack, setRedoStack] = useState<LightString[][]>([]);
  const recentlyDeleted = useRef<{ string: LightString; timeout: NodeJS.Timeout } | null>(null);

  const addToUndoStack = useCallback((currentStrings: LightString[]) => {
    setUndoStack(prev => [...prev.slice(-9), currentStrings]); // Keep last 10 states
    setRedoStack([]); // Clear redo stack when new action is performed
  }, []);

  const addLightString = useCallback((vector: Vector, assetId: string, spacing?: number) => {
    const newString: LightString = {
      id: generateLightStringId(),
      start: vector.start,
      end: vector.end,
      assetId,
      spacing,
      createdAt: Date.now()
    };

    setLightStrings(prev => {
      addToUndoStack(prev);
      return [...prev, newString];
    });

    return newString;
  }, [addToUndoStack]);

  const deleteLightString = useCallback((stringId: string) => {
    const stringToDelete = lightStrings.find(s => s.id === stringId);
    if (!stringToDelete) return;

    // Clear any existing undo timeout
    if (recentlyDeleted.current) {
      clearTimeout(recentlyDeleted.current.timeout);
    }

    setLightStrings(prev => {
      addToUndoStack(prev);
      const newStrings = prev.filter(s => s.id !== stringId);
      
      // Set up undo timeout
      const timeout = setTimeout(() => {
        recentlyDeleted.current = null;
      }, GESTURE_CONSTANTS.UNDO_DELAY);

      recentlyDeleted.current = { string: stringToDelete, timeout };
      
      return newStrings;
    });

    // Clear selection if the deleted string was selected
    setSelectionState(prev => 
      prev.selectedStringId === stringId 
        ? { selectedStringId: null, selectedEndpoint: null }
        : prev
    );
  }, [lightStrings, addToUndoStack]);

  const undoDeleteString = useCallback(() => {
    if (!recentlyDeleted.current) return false;

    const { string, timeout } = recentlyDeleted.current;
    clearTimeout(timeout);
    recentlyDeleted.current = null;

    setLightStrings(prev => [...prev, string]);
    return true;
  }, []);

  const selectLightString = useCallback((point: Point): boolean => {
    const result = findClosestLightString(point, lightStrings, GESTURE_CONSTANTS.SELECTION_THRESHOLD);
    
    if (result) {
      setSelectionState({
        selectedStringId: result.lightString.id,
        selectedEndpoint: 'start' // Default to start, could be enhanced to detect closest endpoint
      });
      return true;
    }

    return false;
  }, [lightStrings]);

  const deselectLightString = useCallback(() => {
    setSelectionState({
      selectedStringId: null,
      selectedEndpoint: null
    });
  }, []);

  const updateLightString = useCallback((stringId: string, updates: Partial<LightString>) => {
    setLightStrings(prev => {
      addToUndoStack(prev);
      return prev.map(string => 
        string.id === stringId ? { ...string, ...updates } : string
      );
    });
  }, [addToUndoStack]);

  const undo = useCallback(() => {
    if (undoStack.length === 0) return false;

    const previousState = undoStack[undoStack.length - 1];
    setRedoStack(prev => [...prev, lightStrings]);
    setUndoStack(prev => prev.slice(0, -1));
    setLightStrings(previousState);
    
    return true;
  }, [undoStack, lightStrings]);

  const redo = useCallback(() => {
    if (redoStack.length === 0) return false;

    const nextState = redoStack[redoStack.length - 1];
    setUndoStack(prev => [...prev, lightStrings]);
    setRedoStack(prev => prev.slice(0, -1));
    setLightStrings(nextState);
    
    return true;
  }, [redoStack, lightStrings]);

  const clearAllStrings = useCallback(() => {
    if (lightStrings.length === 0) return;

    addToUndoStack(lightStrings);
    setLightStrings([]);
    setSelectionState({ selectedStringId: null, selectedEndpoint: null });
  }, [lightStrings, addToUndoStack]);

  const getSelectedString = useCallback((): LightString | null => {
    if (!selectionState.selectedStringId) return null;
    return lightStrings.find(s => s.id === selectionState.selectedStringId) || null;
  }, [lightStrings, selectionState.selectedStringId]);

  return {
    // State
    lightStrings,
    selectionState,
    selectedString: getSelectedString(),
    canUndo: undoStack.length > 0,
    canRedo: redoStack.length > 0,
    recentlyDeletedString: recentlyDeleted.current?.string || null,

    // Actions
    addLightString,
    deleteLightString,
    undoDeleteString,
    selectLightString,
    deselectLightString,
    updateLightString,
    undo,
    redo,
    clearAllStrings
  };
};