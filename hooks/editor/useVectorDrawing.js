import { useState } from 'react';
import { PanResponder } from 'react-native';

export function useVectorDrawing({
  selectedAsset,
  lightStrings = [],
  selectedStringId = null,
  onVectorComplete,
  onUpdateLightString = null,
  onStartMovingString = null,
  onEndMovingString = null,
  onTapSelection,
  findClosestLightString,
  deselectLightString,
  isSettingReference = false,
  onReferenceComplete = null,
  interactionMode = 'string',
}) {
  const [currentVector, setCurrentVector] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [lastTapTime, setLastTapTime] = useState(0);
  const [dragHandle, setDragHandle] = useState(null); // { stringId, handleType: 'start' | 'end' }

  // Check if a point is within a handle's touch area
  const findHandleAtPoint = (point) => {
    if (!selectedStringId || !lightStrings.length) return null;
    
    const selectedString = lightStrings.find(s => s.id === selectedStringId);
    if (!selectedString) return null;
    
    const handleRadius = 15; // Touch area radius (slightly larger than visual handle)
    
    // Check start handle
    const distanceToStart = Math.sqrt(
      Math.pow(point.x - selectedString.start.x, 2) + 
      Math.pow(point.y - selectedString.start.y, 2)
    );
    
    if (distanceToStart <= handleRadius) {
      return { stringId: selectedStringId, handleType: 'start' };
    }
    
    // Check end handle
    const distanceToEnd = Math.sqrt(
      Math.pow(point.x - selectedString.end.x, 2) + 
      Math.pow(point.y - selectedString.end.y, 2)
    );
    
    if (distanceToEnd <= handleRadius) {
      return { stringId: selectedStringId, handleType: 'end' };
    }
    
    return null;
  };

  // Create PanResponder for handling gestures
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: (evt) => {
      // Only capture if we have a single touch
      const touches = evt.nativeEvent.touches;
      if (touches.length !== 1) return false;
      
      // Capture if we have an asset selected, in reference mode, touching a handle, or in string mode with existing strings
      const point = { x: evt.nativeEvent.locationX, y: evt.nativeEvent.locationY };
      const handle = findHandleAtPoint(point);
      const canSelectStrings = interactionMode === 'string' && lightStrings.length > 0;
      
      return selectedAsset || isSettingReference || handle || canSelectStrings;
    },
    
    onMoveShouldSetPanResponder: (evt) => {
      // Don't capture moves if there are multiple touches (zoom/pan in progress)
      const touches = evt.nativeEvent.touches;
      const canSelectStrings = interactionMode === 'string' && lightStrings.length > 0;
      return touches.length === 1 && (selectedAsset || isSettingReference || dragHandle || canSelectStrings);
    },

    onPanResponderGrant: (evt, gestureState) => {
      const { locationX, locationY } = evt.nativeEvent;
      const point = { x: locationX, y: locationY };
      
      // Check if touching a handle first (highest priority)
      const handle = findHandleAtPoint(point);
      if (handle) {
        setDragHandle(handle);
        setIsDragging(true);
        // Start tracking the move operation for undo
        if (onStartMovingString) {
          onStartMovingString(handle.stringId);
        }
        return;
      }
      
      setLastTapTime(Date.now());
    },

    onPanResponderMove: (evt, gestureState) => {
      // If multi-touch detected, abort this gesture to allow zoom/pan
      if (evt.nativeEvent.touches.length > 1) {
        setCurrentVector(null);
        setIsDragging(false);
        setDragHandle(null);
        return false;
      }
      
      const { locationX, locationY } = evt.nativeEvent;
      
      // Handle dragging (moving string endpoints)
      if (dragHandle && onUpdateLightString) {
        const newPosition = { x: locationX, y: locationY };
        const updates = dragHandle.handleType === 'start' 
          ? { start: newPosition }
          : { end: newPosition };
        
        onUpdateLightString(dragHandle.stringId, updates);
        return;
      }
      
      // If we've moved more than a small threshold, this is a drag, not a tap
      if (Math.abs(gestureState.dx) > 5 || Math.abs(gestureState.dy) > 5) {
        // Start dragging for string drawing or reference mode
        if ((selectedAsset || isSettingReference) && !isDragging) {
          setIsDragging(true);

          // Initialize the vector for drawing
          const startPos = {
            x: locationX - gestureState.dx,
            y: locationY - gestureState.dy,
          };

          // Prioritize reference mode over asset selection
          setCurrentVector({
            start: startPos,
            end: { x: locationX, y: locationY },
            assetId: isSettingReference ? 'reference' : selectedAsset?.id,
            isReference: isSettingReference,
          });
        }

        // Only update if we're in dragging mode (but not handle dragging)
        if (isDragging && !dragHandle) {
          setCurrentVector((prev) => ({
            ...prev,
            end: { x: locationX, y: locationY },
          }));
        }
      }
    },

    onPanResponderRelease: (evt, gestureState) => {
      const { locationX, locationY } = evt.nativeEvent;
      const isTap =
        Math.abs(gestureState.dx) < 5 &&
        Math.abs(gestureState.dy) < 5 &&
        Date.now() - lastTapTime < 300;

      // If we were dragging a handle, just clean up
      if (dragHandle) {
        // End tracking the move operation for undo
        if (onEndMovingString) {
          onEndMovingString(dragHandle.stringId);
        }
        setDragHandle(null);
        setIsDragging(false);
        return;
      }

      if (isTap) {
        // This was a tap - handle string selection
        const point = { x: locationX, y: locationY };
        const closestString = findClosestLightString(point);
        
        if (closestString) {
          onTapSelection('string', closestString.id);
        } else {
          deselectLightString();
        }
      } else if (isDragging && currentVector) {
        // This was a drag - complete the vector
        if (currentVector.isReference && onReferenceComplete) {
          onReferenceComplete(currentVector);
        } else if (!currentVector.isReference) {
          onVectorComplete(currentVector);
        }
      }

      // Reset state
      setCurrentVector(null);
      setIsDragging(false);
    },

    onPanResponderTerminate: () => {
      // Reset state if the gesture is terminated
      setCurrentVector(null);
      setIsDragging(false);
      setDragHandle(null);
    },
  });

  return {
    currentVector,
    isDragging,
    panResponder,
  };
}
