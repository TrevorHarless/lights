import { useState } from 'react';
import { PanResponder } from 'react-native';

export function useVectorDrawing({
  selectedAsset,
  onVectorComplete,
  onTapSelection,
  findClosestLightString,
  deselectLightString,
  isSettingReference = false,
  onReferenceComplete = null,
}) {
  const [currentVector, setCurrentVector] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [lastTapTime, setLastTapTime] = useState(0);

  // Create PanResponder for handling gestures
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: (evt) => {
      // Only capture if we have a single touch and either have an asset selected or in reference mode
      const touches = evt.nativeEvent.touches;
      return touches.length === 1 && (selectedAsset || isSettingReference);
    },
    
    onMoveShouldSetPanResponder: (evt) => {
      // Don't capture moves if there are multiple touches (zoom/pan in progress)
      const touches = evt.nativeEvent.touches;
      return touches.length === 1 && (selectedAsset || isSettingReference);
    },

    onPanResponderGrant: (evt, gestureState) => {
      setLastTapTime(Date.now());
    },

    onPanResponderMove: (evt, gestureState) => {
      // If multi-touch detected, abort this gesture to allow zoom/pan
      if (evt.nativeEvent.touches.length > 1) {
        setCurrentVector(null);
        setIsDragging(false);
        return false;
      }
      
      // If we've moved more than a small threshold, this is a drag, not a tap
      if (Math.abs(gestureState.dx) > 5 || Math.abs(gestureState.dy) > 5) {
        // We're now in dragging mode if we have a selected asset OR setting reference
        if ((selectedAsset || isSettingReference) && !isDragging) {
          setIsDragging(true);

          // Initialize the vector for drawing
          const { locationX, locationY } = evt.nativeEvent;
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

        // Only update if we're in dragging mode
        if (isDragging) {
          const { locationX, locationY } = evt.nativeEvent;
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

      if (isTap) {
        // This was a tap - handle selection
        const point = { x: locationX, y: locationY };
        const closestString = findClosestLightString(point);

        if (closestString) {
          // Select the closest light string
          onTapSelection(closestString.id);
        } else {
          // Tap on empty space - deselect
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
    },
  });

  return {
    currentVector,
    isDragging,
    panResponder,
  };
}
