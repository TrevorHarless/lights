import { useCallback, useRef, useState } from "react";

const MAX_UNDO_ACTIONS = 25;

export const UNDO_ACTION_TYPES = {
  // Light String Actions
  ADD_LIGHT_STRING: 'ADD_LIGHT_STRING',
  DELETE_LIGHT_STRING: 'DELETE_LIGHT_STRING',
  MOVE_LIGHT_STRING: 'MOVE_LIGHT_STRING',
  
  // Singular Light Actions
  ADD_SINGULAR_LIGHT: 'ADD_SINGULAR_LIGHT',
  DELETE_SINGULAR_LIGHT: 'DELETE_SINGULAR_LIGHT',
  MOVE_SINGULAR_LIGHT: 'MOVE_SINGULAR_LIGHT',
  
  // Decor Shape Actions
  ADD_DECOR_SHAPE: 'ADD_DECOR_SHAPE',
  DELETE_DECOR_SHAPE: 'DELETE_DECOR_SHAPE',
  MOVE_DECOR_SHAPE: 'MOVE_DECOR_SHAPE',
  RESIZE_DECOR_SHAPE: 'RESIZE_DECOR_SHAPE',
};

export function useUndoSystem() {
  const [undoStack, setUndoStack] = useState([]);
  const moveTrackingRef = useRef(new Map()); // Track ongoing moves

  // Add action to undo stack
  const recordAction = useCallback((action) => {
    setUndoStack(prev => {
      const newStack = [...prev, {
        ...action,
        timestamp: Date.now(),
        id: `${action.type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      }];
      
      // Maintain max stack size
      if (newStack.length > MAX_UNDO_ACTIONS) {
        return newStack.slice(-MAX_UNDO_ACTIONS);
      }
      
      return newStack;
    });
  }, []);

  // Start tracking a move operation
  const startMoveTracking = useCallback((entityType, entityId, startState) => {
    const trackingKey = `${entityType}_${entityId}`;
    moveTrackingRef.current.set(trackingKey, {
      entityType,
      entityId,
      startState,
      startTime: Date.now()
    });
  }, []);

  // End tracking a move operation and record the action
  const endMoveTracking = useCallback((entityType, entityId, endState, operationType = 'MOVE') => {
    const trackingKey = `${entityType}_${entityId}`;
    const tracking = moveTrackingRef.current.get(trackingKey);
    
    if (!tracking) return;
    
    // Only record if there was actual change
    const hasChanged = JSON.stringify(tracking.startState) !== JSON.stringify(endState);
    if (hasChanged) {
      let actionType;
      if (operationType === 'RESIZE' && entityType === 'DECOR_SHAPE') {
        actionType = UNDO_ACTION_TYPES.RESIZE_DECOR_SHAPE;
      } else {
        actionType = entityType === 'SINGULAR_LIGHT' ? UNDO_ACTION_TYPES.MOVE_SINGULAR_LIGHT :
                     entityType === 'LIGHT_STRING' ? UNDO_ACTION_TYPES.MOVE_LIGHT_STRING :
                     entityType === 'DECOR_SHAPE' ? UNDO_ACTION_TYPES.MOVE_DECOR_SHAPE :
                     `MOVE_${entityType}`;
      }
      
      recordAction({
        type: actionType,
        data: {
          entityId,
          startState: tracking.startState,
          endState
        }
      });
    }
    
    moveTrackingRef.current.delete(trackingKey);
  }, [recordAction]);

  // Cancel move tracking without recording
  const cancelMoveTracking = useCallback((entityType, entityId) => {
    const trackingKey = `${entityType}_${entityId}`;
    moveTrackingRef.current.delete(trackingKey);
  }, []);

  // Check if undo is available
  const canUndo = undoStack.length > 0;

  // Get the last action without removing it
  const peekLastAction = useCallback(() => {
    return undoStack.length > 0 ? undoStack[undoStack.length - 1] : null;
  }, [undoStack]);

  // Pop the last action from stack
  const popLastAction = useCallback(() => {
    let poppedAction = null;
    setUndoStack(prev => {
      if (prev.length === 0) return prev;
      poppedAction = prev[prev.length - 1];
      return prev.slice(0, -1);
    });
    return poppedAction;
  }, []);

  // Clear all undo history
  const clearUndoHistory = useCallback(() => {
    setUndoStack([]);
    moveTrackingRef.current.clear();
  }, []);

  // Get stack info for debugging
  const getStackInfo = useCallback(() => {
    return {
      length: undoStack.length,
      actions: undoStack.map(action => ({
        type: action.type,
        timestamp: action.timestamp,
        id: action.id
      }))
    };
  }, [undoStack]);

  return {
    // Core undo functionality
    recordAction,
    canUndo,
    peekLastAction,
    popLastAction,
    clearUndoHistory,
    
    // Move tracking utilities
    startMoveTracking,
    endMoveTracking,
    cancelMoveTracking,
    
    // Debug utilities
    getStackInfo,
    
    // Stack state
    undoStackLength: undoStack.length
  };
}