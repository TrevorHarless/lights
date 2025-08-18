// hooks/editor/useDecorGestures.js
import React, { useRef } from 'react';
import { PanResponder } from 'react-native';

export function useDecorGestures({
  selectedAsset,
  setSelectedAsset,
  addDecor,
  moveDecor,
  resizeDecor,
  findDecorAtPoint,
  getDecorById,
  getResizeHandles,
  selectedDecorId,
  setSelectedDecorId,
  isEnabled = true,
}) {
  const gestureState = useRef({
    isDragging: false,
    dragType: null,
    dragTarget: null,
    startPosition: null,
  });

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: (evt) => {
      // Only capture single touches when enabled and in decor mode
      const touches = evt.nativeEvent.touches;
      return isEnabled && touches.length === 1;
    },
    onMoveShouldSetPanResponder: (evt) => {
      // Only capture single touches when enabled and in decor mode
      const touches = evt.nativeEvent.touches;
      return isEnabled && touches.length === 1;
    },

    onPanResponderGrant: (evt) => {
      if (!isEnabled) return;

      const touch = evt.nativeEvent;
      const touchPoint = { x: touch.locationX, y: touch.locationY };

      // Check if we're touching a resize handle first
      if (selectedDecorId) {
        const selectedDecor = getDecorById(selectedDecorId);
        if (selectedDecor) {
          const handles = getResizeHandles(selectedDecor);
          const handleRadius = 12; // Touch target radius for handles

          for (const handle of handles) {
            const distance = Math.sqrt(
              Math.pow(touchPoint.x - handle.x, 2) + 
              Math.pow(touchPoint.y - handle.y, 2)
            );
            if (distance <= handleRadius) {
              gestureState.current = {
                isDragging: true,
                dragType: 'resize',
                dragTarget: selectedDecorId,
                startPosition: touchPoint,
              };
              return;
            }
          }
        }
      }

      // Check if we're touching an existing decor item
      const touchedDecor = findDecorAtPoint(touchPoint);
      if (touchedDecor) {
        setSelectedDecorId(touchedDecor.id);
        gestureState.current = {
          isDragging: true,
          dragType: 'move',
          dragTarget: touchedDecor.id,
          startPosition: touchPoint,
        };
        return;
      }

      // If we have a decor asset selected and didn't touch anything, place new decor item
      if (selectedAsset && selectedAsset.category === 'wreath') {
        const newDecorId = addDecor(touchPoint, null, selectedAsset.id, selectedAsset);
        setSelectedDecorId(newDecorId);
        // Clear the selected asset so user exits placement mode
        setSelectedAsset(null);
        return;
      }

      // Otherwise, deselect any selected decor item
      setSelectedDecorId(null);
    },

    onPanResponderMove: (evt) => {
      // If multi-touch detected, abort this gesture to allow zoom/pan
      if (evt.nativeEvent.touches.length > 1) {
        gestureState.current.isDragging = false;
        return false;
      }
      
      if (!gestureState.current.isDragging) return;

      const touch = evt.nativeEvent;
      const currentPosition = { x: touch.locationX, y: touch.locationY };
      const { dragType, dragTarget, startPosition } = gestureState.current;

      if (dragType === 'move') {
        // Move the decor center
        const deltaX = currentPosition.x - startPosition.x;
        const deltaY = currentPosition.y - startPosition.y;
        const decor = getDecorById(dragTarget);
        
        if (decor) {
          const newCenter = {
            x: decor.center.x + deltaX,
            y: decor.center.y + deltaY,
          };
          moveDecor(dragTarget, newCenter);
          
          // Update start position for next move calculation
          gestureState.current.startPosition = currentPosition;
        }
      } else if (dragType === 'resize') {
        // Resize the decor item
        const decor = getDecorById(dragTarget);
        if (decor) {
          const distanceFromCenter = Math.sqrt(
            Math.pow(currentPosition.x - decor.center.x, 2) + 
            Math.pow(currentPosition.y - decor.center.y, 2)
          );
          resizeDecor(dragTarget, distanceFromCenter);
        }
      }
    },

    onPanResponderRelease: () => {
      gestureState.current.isDragging = false;
    },

    onPanResponderTerminate: () => {
      gestureState.current.isDragging = false;
    },
  });

  return {
    panResponder,
    isDragging: gestureState.current.isDragging,
    dragType: gestureState.current.dragType,
  };
}