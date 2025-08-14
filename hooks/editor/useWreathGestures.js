// hooks/editor/useWreathGestures.js
import React, { useRef } from 'react';
import { PanResponder } from 'react-native';

export function useWreathGestures({
  selectedAsset,
  setSelectedAsset,
  addWreath,
  moveWreath,
  resizeWreath,
  findWreathAtPoint,
  getWreathById,
  getResizeHandles,
  selectedWreathId,
  setSelectedWreathId,
  isEnabled = true,
}) {
  const gestureState = useRef({
    isDragging: false,
    dragType: null, // 'move', 'resize', or null
    dragTarget: null,
    startPosition: null,
    resizeHandle: null,
  });

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => isEnabled,
    onMoveShouldSetPanResponder: () => isEnabled,

    onPanResponderGrant: (evt) => {
      if (!isEnabled) return;

      const touch = evt.nativeEvent;
      const touchPoint = { x: touch.locationX, y: touch.locationY };

      // Check if we're touching a resize handle first
      if (selectedWreathId) {
        const selectedWreath = getWreathById(selectedWreathId);
        if (selectedWreath) {
          const handles = getResizeHandles(selectedWreath);
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
                dragTarget: selectedWreathId,
                startPosition: touchPoint,
                resizeHandle: handle,
              };
              return;
            }
          }
        }
      }

      // Check if we're touching an existing wreath
      const touchedWreath = findWreathAtPoint(touchPoint);
      if (touchedWreath) {
        setSelectedWreathId(touchedWreath.id);
        gestureState.current = {
          isDragging: true,
          dragType: 'move',
          dragTarget: touchedWreath.id,
          startPosition: touchPoint,
          resizeHandle: null,
        };
        return;
      }

      // If we have a wreath asset selected and didn't touch anything, place new wreath
      if (selectedAsset && selectedAsset.category === 'wreath') {
        const newWreathId = addWreath(touchPoint, null, selectedAsset.id, selectedAsset);
        setSelectedWreathId(newWreathId);
        // Clear the selected asset so user exits placement mode
        setSelectedAsset(null);
        return;
      }

      // Otherwise, deselect any selected wreath
      setSelectedWreathId(null);
    },

    onPanResponderMove: (evt) => {
      if (!gestureState.current.isDragging) return;

      const touch = evt.nativeEvent;
      const currentPosition = { x: touch.locationX, y: touch.locationY };
      const { dragType, dragTarget, startPosition } = gestureState.current;

      if (dragType === 'move') {
        // Move the wreath center
        const deltaX = currentPosition.x - startPosition.x;
        const deltaY = currentPosition.y - startPosition.y;
        const wreath = getWreathById(dragTarget);
        
        if (wreath) {
          const newCenter = {
            x: wreath.center.x + deltaX,
            y: wreath.center.y + deltaY,
          };
          moveWreath(dragTarget, newCenter);
          
          // Update start position for next move calculation
          gestureState.current.startPosition = currentPosition;
        }
      } else if (dragType === 'resize') {
        // Resize the wreath
        const wreath = getWreathById(dragTarget);
        if (wreath) {
          const distanceFromCenter = Math.sqrt(
            Math.pow(currentPosition.x - wreath.center.x, 2) + 
            Math.pow(currentPosition.y - wreath.center.y, 2)
          );
          resizeWreath(dragTarget, distanceFromCenter);
        }
      }
    },

    onPanResponderRelease: () => {
      gestureState.current = {
        isDragging: false,
        dragType: null,
        dragTarget: null,
        startPosition: null,
        resizeHandle: null,
      };
    },

    onPanResponderTerminate: () => {
      gestureState.current = {
        isDragging: false,
        dragType: null,
        dragTarget: null,
        startPosition: null,
        resizeHandle: null,
      };
    },
  });

  return {
    panResponder,
    isDragging: gestureState.current.isDragging,
    dragType: gestureState.current.dragType,
  };
}