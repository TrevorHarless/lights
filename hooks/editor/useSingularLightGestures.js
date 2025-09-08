// hooks/editor/useSingularLightGestures.js
import React, { useRef } from 'react';
import { PanResponder } from 'react-native';

export function useSingularLightGestures({
  selectedAsset,
  setSelectedAsset,
  addSingularLight,
  moveSingularLight,
  findSingularLightAtPoint,
  getSingularLightById,
  selectedLightId,
  setSelectedLightId,
  getLightRenderStyle,
  getLightSizeScale,
  startMovingSingularLight = null,
  endMovingSingularLight = null,
  isEnabled = true,
}) {
  const gestureState = useRef({
    isDragging: false,
    dragType: null,
    dragTarget: null,
    startPosition: null,
    startTime: null,
    hasActuallyMoved: false,
  });

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: (evt) => {
      // Very strict - only capture single touches when we have something specific to do
      const touches = evt.nativeEvent.touches;
      if (touches.length !== 1 || !isEnabled) return false;
      
      const touchPoint = { x: evt.nativeEvent.locationX, y: evt.nativeEvent.locationY };
      const touchedLight = findSingularLightAtPoint(touchPoint, getLightRenderStyle, getLightSizeScale);
      
      // Capture if:
      // 1. Touching an existing light (for selection/movement)
      // 2. Have selected asset and no light selected (for placement)
      // 3. Have a light selected (for deselection)
      return !!(touchedLight || 
                (selectedAsset && selectedAsset.category === 'string' && !selectedLightId) ||
                selectedLightId);
    },
    onMoveShouldSetPanResponder: (evt) => {
      // Only capture moves for existing drags
      const touches = evt.nativeEvent.touches;
      if (touches.length !== 1) return false;
      return isEnabled && gestureState.current.isDragging;
    },

    onPanResponderGrant: (evt) => {
      if (!isEnabled) return;

      const touch = evt.nativeEvent;
      const touchPoint = { x: touch.locationX, y: touch.locationY };

      // Store timing info for gesture discrimination
      gestureState.current.startTime = Date.now();
      gestureState.current.startPosition = touchPoint;
      gestureState.current.hasActuallyMoved = false;

      // Check if we're touching an existing singular light
      const touchedLight = findSingularLightAtPoint(touchPoint, getLightRenderStyle, getLightSizeScale);
      if (touchedLight) {
        setSelectedLightId(touchedLight.id);
        gestureState.current.isDragging = true;
        gestureState.current.dragType = 'move';
        gestureState.current.dragTarget = touchedLight.id;
        
        // Start tracking the move operation for undo
        if (startMovingSingularLight) {
          startMovingSingularLight(touchedLight.id);
        }
        return;
      }
    },

    onPanResponderMove: (evt) => {
      // If multi-touch detected, abort this gesture to allow zoom/pan
      if (evt.nativeEvent.touches.length > 1) {
        gestureState.current.isDragging = false;
        gestureState.current.dragType = null;
        gestureState.current.dragTarget = null;
        return false;
      }
      
      // Track if we've actually moved (for tap vs drag discrimination)
      if (gestureState.current.startPosition) {
        const touch = evt.nativeEvent;
        const currentPosition = { x: touch.locationX, y: touch.locationY };
        const deltaX = currentPosition.x - gestureState.current.startPosition.x;
        const deltaY = currentPosition.y - gestureState.current.startPosition.y;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        
        if (distance > 5) { // 5 pixel threshold for movement
          gestureState.current.hasActuallyMoved = true;
        }
      }
      
      if (!gestureState.current.isDragging) return;

      const touch = evt.nativeEvent;
      const currentPosition = { x: touch.locationX, y: touch.locationY };
      const { dragType, dragTarget, startPosition } = gestureState.current;

      if (dragType === 'move') {
        // Move the singular light
        const deltaX = currentPosition.x - startPosition.x;
        const deltaY = currentPosition.y - startPosition.y;
        const light = getSingularLightById(dragTarget);
        
        if (light) {
          const newPosition = {
            x: light.position.x + deltaX,
            y: light.position.y + deltaY,
          };
          moveSingularLight(dragTarget, newPosition);
          
          // Update start position for next move calculation
          gestureState.current.startPosition = currentPosition;
        }
      }
    },

    onPanResponderRelease: (evt) => {
      // End tracking the move operation for undo if we were dragging
      if (gestureState.current.isDragging && gestureState.current.dragTarget && endMovingSingularLight) {
        endMovingSingularLight(gestureState.current.dragTarget);
      }

      // Only handle tap actions if we didn't drag and it was a quick tap
      const wasTap = !gestureState.current.hasActuallyMoved && 
                     !gestureState.current.isDragging &&
                     gestureState.current.startTime &&
                     (Date.now() - gestureState.current.startTime) < 300; // Quick tap

      if (wasTap) {
        const touch = evt.nativeEvent;
        const touchPoint = { x: touch.locationX, y: touch.locationY };

        // If a light is currently selected, just deselect it (don't place a new light)
        if (selectedLightId) {
          setSelectedLightId(null);
        }
        // If we have a light asset selected and no light is currently selected, place new light
        else if (selectedAsset && selectedAsset.category === 'string') {
          const newLightId = addSingularLight(touchPoint, selectedAsset.id, selectedAsset);
          setSelectedLightId(newLightId);
        }
      }

      // Reset gesture state
      gestureState.current.isDragging = false;
      gestureState.current.dragType = null;
      gestureState.current.dragTarget = null;
      gestureState.current.startTime = null;
      gestureState.current.hasActuallyMoved = false;
    },

    onPanResponderTerminate: () => {
      // Reset gesture state on termination
      gestureState.current.isDragging = false;
      gestureState.current.dragType = null;
      gestureState.current.dragTarget = null;
      gestureState.current.startTime = null;
      gestureState.current.hasActuallyMoved = false;
    },
  });

  return {
    panResponder,
    isDragging: gestureState.current.isDragging,
    dragType: gestureState.current.dragType,
  };
}