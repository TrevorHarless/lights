import { useRef, useState, useCallback } from 'react';
import { PanResponder, PanResponderInstance } from 'react-native';
import { Point, Vector, DrawingState, GestureState, GESTURE_CONSTANTS } from '@/types/editor';
import { screenToCanvasCoordinates, clampToCanvas } from '@/utils/editor/geometry';

interface UseVectorDrawingProps {
  canvasLayout: { x: number; y: number; width: number; height: number } | null;
  onVectorComplete: (vector: Vector) => void;
  onCanvasTap: (point: Point) => void;
  selectedAssetId: string;
}

export const useVectorDrawing = ({
  canvasLayout,
  onVectorComplete,
  onCanvasTap,
  selectedAssetId
}: UseVectorDrawingProps) => {
  const [drawingState, setDrawingState] = useState<DrawingState>({
    isDrawing: false,
    startPoint: null,
    currentPoint: null,
    selectedAssetId
  });

  const gestureState = useRef<GestureState>({
    isDragging: false,
    dragDistance: 0,
    startTime: 0
  });

  const panResponder = useRef<PanResponderInstance>(
    PanResponder.create({
      onStartShouldSetPanResponder: () => {
        console.log('onStartShouldSetPanResponder called, canvasLayout exists:', !!canvasLayout);
        return true; // Always try to handle touch
      },
      
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        console.log('onMoveShouldSetPanResponder called with dx/dy:', gestureState.dx, gestureState.dy);
        // Always respond to movement
        return true;
      },

      onPanResponderTerminationRequest: () => {
        console.log('onPanResponderTerminationRequest called');
        return false; // Don't allow termination
      },

      onPanResponderGrant: (evt) => {
        if (!canvasLayout) {
          console.log('No canvas layout available');
          return;
        }

        const touchPoint = { x: evt.nativeEvent.pageX, y: evt.nativeEvent.pageY };
        console.log('Touch started at:', touchPoint);
        console.log('Canvas layout:', canvasLayout);
        
        const canvasPoint = clampToCanvas(
          screenToCanvasCoordinates(touchPoint, canvasLayout)
        );
        console.log('Canvas point:', canvasPoint);

        // Initialize gesture tracking
        gestureState.current = {
          isDragging: false,
          dragDistance: 0,
          startTime: Date.now()
        };

        setDrawingState({
          isDrawing: false, // Don't start drawing until we confirm it's a drag
          startPoint: canvasPoint,
          currentPoint: canvasPoint,
          selectedAssetId
        });
        console.log('Drawing state initialized');
      },

      onPanResponderMove: (evt, panGestureState) => {
        if (!canvasLayout || !drawingState.startPoint) return;

        const currentGestureState = gestureState.current;
        const dragDistance = Math.sqrt(
          panGestureState.dx * panGestureState.dx + panGestureState.dy * panGestureState.dy
        );

        currentGestureState.dragDistance = dragDistance;
        console.log('Drag distance:', dragDistance);

        // Start drawing if we've moved beyond the tap threshold
        if (!currentGestureState.isDragging && dragDistance > GESTURE_CONSTANTS.TAP_THRESHOLD) {
          console.log('Starting drag mode');
          currentGestureState.isDragging = true;
          setDrawingState(prev => ({ ...prev, isDrawing: true }));
        }

        // Update current point if we're drawing
        if (currentGestureState.isDragging) {
          const touchPoint = { x: evt.nativeEvent.pageX, y: evt.nativeEvent.pageY };
          const canvasPoint = clampToCanvas(
            screenToCanvasCoordinates(touchPoint, canvasLayout)
          );
          console.log('Updating current point:', canvasPoint);

          setDrawingState(prev => ({ ...prev, currentPoint: canvasPoint }));
        }
      },

      onPanResponderRelease: () => {
        const currentGestureState = gestureState.current;
        const duration = Date.now() - currentGestureState.startTime;

        console.log('Gesture released - isDragging:', currentGestureState.isDragging, 'duration:', duration);

        if (!drawingState.startPoint) return;

        // Determine if this was a tap or a drag
        const isTap = !currentGestureState.isDragging && 
                     currentGestureState.dragDistance < GESTURE_CONSTANTS.TAP_THRESHOLD &&
                     duration < GESTURE_CONSTANTS.TIME_THRESHOLD;

        if (isTap) {
          console.log('Handling tap');
          // Handle tap for selection
          onCanvasTap(drawingState.startPoint);
        } else if (currentGestureState.isDragging && 
                   drawingState.currentPoint && 
                   drawingState.startPoint) {
          // Handle completed vector drawing
          const vector: Vector = {
            start: drawingState.startPoint,
            end: drawingState.currentPoint
          };
          console.log('Completing vector:', vector);
          onVectorComplete(vector);
        }

        // Reset drawing state
        setDrawingState({
          isDrawing: false,
          startPoint: null,
          currentPoint: null,
          selectedAssetId
        });
      },

      onPanResponderTerminate: () => {
        // Reset state if gesture is terminated
        setDrawingState({
          isDrawing: false,
          startPoint: null,
          currentPoint: null,
          selectedAssetId
        });
      }
    })
  ).current;

  const getCurrentVector = useCallback((): Vector | null => {
    if (drawingState.isDrawing && drawingState.startPoint && drawingState.currentPoint) {
      return {
        start: drawingState.startPoint,
        end: drawingState.currentPoint
      };
    }
    return null;
  }, [drawingState]);

  const resetDrawing = useCallback(() => {
    setDrawingState({
      isDrawing: false,
      startPoint: null,
      currentPoint: null,
      selectedAssetId
    });
  }, [selectedAssetId]);

  return {
    panHandlers: panResponder.panHandlers,
    drawingState,
    currentVector: getCurrentVector(),
    resetDrawing
  };
};