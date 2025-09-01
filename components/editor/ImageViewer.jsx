// components/projects/ImageViewer.jsx
import { MaterialIcons } from '@expo/vector-icons';
import * as MediaLibrary from 'expo-media-library';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  PanResponder,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import ViewShot from 'react-native-view-shot';

import { BottomToolbar } from './BottomToolbar';
import { ClearAllConfirmModal } from './ClearAllConfirmModal';
import { DecorRenderer } from './DecorRenderer';
import { FloatingSelectionControls } from './FloatingSelectionControls';
import { ImageWithNightOverlay } from './ImageWithNightOverlay';
import { MeasureLineRenderer } from './MeasureLineRenderer';
import { ReferenceLineRenderer } from './ReferenceLineRenderer';
import { ReferenceModal } from './ReferenceModal';
import SimpleLightRenderer from './SimpleLightRenderer';
import SingularLightRenderer from './SingularLightRenderer';

import { useDecorAssets } from '~/hooks/editor/useDecorAssets';
import { useDecorGestures } from '~/hooks/editor/useDecorGestures';
import { useDecorShapes } from '~/hooks/editor/useDecorShapes';
import { useLightAssets } from '~/hooks/editor/useLightAssets';
import { useLightStrings } from '~/hooks/editor/useLightStrings';
import { useMeasurementLines } from '~/hooks/editor/useMeasurementLines';
import { useReferenceScale } from '~/hooks/editor/useReferenceScale';
import { useSingularLightGestures } from '~/hooks/editor/useSingularLightGestures';
import { useSingularLights } from '~/hooks/editor/useSingularLights';
import { useVectorDrawing } from '~/hooks/editor/useVectorDrawing';
import { lightDataStorage } from '~/services/lightDataStorage';

import TutorialOverlay from '~/components/tutorial/TutorialOverlay';
import { useTutorial } from '~/hooks/tutorial/useTutorial';

const ImageViewer = ({ imgSource, onGoBack, project, projectId }) => {
  console.log('🎯 ImageViewer: Component mounted/rendered');
  
  // Device detection for responsive design
  const { width } = Dimensions.get('window');
  const isTablet = width >= 768;

  // Asset management hooks
  const { 
    lightAssets, 
    getAssetById: getLightAssetById,
    getAssetsByCategory: getLightAssetsByCategory,
    getCategories: getLightCategories,
    getLightRenderStyle,
    createCustomAsset,
    removeCustomAsset
  } = useLightAssets();

  const {
    decorAssets,
    getDecorAssetById,
  } = useDecorAssets();

  // Combined asset system
  const allAssets = [...lightAssets, ...decorAssets];
  const [selectedAsset, setSelectedAsset] = React.useState(null);
  
  // Asset selection handler  
  const handleAssetSelection = React.useCallback((asset) => {
    setSelectedAsset(asset);
  }, []);

  // Combined asset helpers
  const getAssetById = (id) => getLightAssetById(id) || getDecorAssetById(id);
  const getAssetsByCategory = (category) => {
    if (category === 'decor') {
      return decorAssets;
    }
    return getLightAssetsByCategory(category);
  };
  const getCategories = () => [...getLightCategories(), 'decor'];

  // Reference scale hook
  const {
    referenceLine,
    referenceLength,
    isSettingReference,
    showReferenceModal,
    startReferenceMode,
    cancelReferenceMode,
    handleReferenceLineComplete,
    confirmReferenceLength,
    clearReference,
    loadReferenceScale,
    getScaledLightSpacing,
    getLightSizeScale,
    hasReference,
    getLineLengthInFeet,
  } = useReferenceScale();

  // Measurement lines hook
  const {
    measurementLines,
    selectedMeasurementId,
    addMeasurementLine,
    updateMeasurementLine,
    removeMeasurementLine,
    selectMeasurementLine,
    deselectMeasurementLine,
    findMeasurementLineAtPoint,
    findMeasurementHandleAtPoint,
    loadMeasurementLines,
    recalculateAllMeasurements,
    getMeasurementLineById,
  } = useMeasurementLines(getLineLengthInFeet);

  const {
    lightStrings,
    selectedStringId,
    deletedString,
    addLightString,
    updateLightString,
    deleteLightString,
    undoDelete,
    clearAllLightStrings,
    calculateLightPositions,
    selectLightString,
    deselectLightString,
    findClosestLightString,
    loadLightStrings,
  } = useLightStrings(lightAssets, getScaledLightSpacing);

  // Singular lights management
  const {
    singularLights,
    selectedLightId,
    deletedLight,
    addSingularLight,
    moveSingularLight,
    deleteSingularLight,
    undoDelete: undoDeleteLight,
    clearAllSingularLights,
    selectSingularLight,
    deselectSingularLight,
    findSingularLightAtPoint,
    getSingularLightById,
    loadSingularLights,
  } = useSingularLights(lightAssets);

  // Decor management
  const {
    decor,
    selectedDecorId,
    setSelectedDecorId,
    addDecor,
    removeDecor,
    moveDecor,
    resizeDecor,
    getDecorById,
    findDecorAtPoint,
    getResizeHandles,
    clearDecor,
    loadDecor,
  } = useDecorShapes();

  // Tutorial-aware wrapper for addLightString
  const addLightStringWithTutorial = useCallback((vector) => {
    console.log('🎯 Tutorial: addLightStringWithTutorial called, current lightStrings.length:', lightStrings.length);
    console.log('🎯 Tutorial: tutorial state:', { isActive: tutorial?.isActive, currentStep: tutorial?.currentStep?.id });
    
    // Check if this is the first string light drawn for tutorial (before adding)
    const isFirstString = lightStrings.length === 0;
    
    // Call the original addLightString function
    addLightString(vector);
    
    // Trigger tutorial action if this was the first string
    if (isFirstString && tutorial?.handleAction) {
      console.log('🎯 Tutorial: First string light drawn, triggering tutorial action');
      setTimeout(() => {
        tutorial.handleAction('first_string_light_drawn');
      }, 1000); // Small delay to let the string render
    }
  }, [addLightString, lightStrings.length, tutorial]);

  // Tutorial-aware wrapper for addMeasurementLine
  const addMeasurementLineWithTutorial = useCallback((line) => {
    console.log('🎯 Tutorial: addMeasurementLineWithTutorial called');
    console.log('🎯 Tutorial: tutorial state:', { isActive: tutorial?.isActive, currentStep: tutorial?.currentStep?.id });
    
    // Call the original addMeasurementLine function
    addMeasurementLine(line);
    
    // Trigger tutorial action for measure mode tutorial
    if (tutorial?.handleAction && tutorial?.currentStep?.id === 'try_measuring') {
      console.log('🎯 Tutorial: Measurement line drawn during tutorial, triggering tutorial action');
      setTimeout(() => {
        tutorial.handleAction('measurement_line_drawn');
      }, 500); // Small delay to let the line render
    }
  }, [addMeasurementLine, tutorial]);

  // Interaction mode state
  const [interactionMode, setInteractionMode] = React.useState(null); // null, 'string', 'tap', 'decor', or 'measure'

  // Mode handler that clears selections when manually switching modes
  const handleModeChange = React.useCallback((newMode) => {
    // Only clear selections for manual mode changes, not automatic ones from asset selection
    if (newMode !== interactionMode) {
      // Clear all selections
      deselectLightString();
      deselectSingularLight();
      deselectMeasurementLine();
      setSelectedDecorId(null);
      setSelectedAsset(null);
    }
    setInteractionMode(newMode);
  }, [interactionMode, deselectLightString, deselectSingularLight, deselectMeasurementLine, setSelectedDecorId, setSelectedAsset]);

  // Auto-switch mode based on selected asset
  React.useEffect(() => {
    if (selectedAsset) {
      if (selectedAsset.category === 'decor') {
        setInteractionMode('decor');
      } else {
        // For light assets, only auto-switch to string mode if not in tap mode
        if (interactionMode !== 'tap') {
          setInteractionMode('string');
        }
      }
    }
  }, [selectedAsset, interactionMode]);

  // Enhanced tap selection handler
  const handleTapSelection = (type, id) => {
    // Clear other selections first
    deselectLightString();
    setSelectedDecorId(null);
    deselectSingularLight();
    deselectMeasurementLine();
    
    // Apply new selection
    switch (type) {
      case 'string':
        selectLightString(id);
        break;
      case 'decor':
        setSelectedDecorId(id);
        break;
      case 'light':
        selectSingularLight(id);
        break;
      case 'measurement':
        selectMeasurementLine(id);
        break;
    }
  };

  // String drawing gestures
  const { 
    currentVector, 
    isDragging: isDrawingString, 
    panResponder: stringPanResponder 
  } = useVectorDrawing({
    selectedAsset,
    lightStrings,
    selectedStringId,
    onVectorComplete: addLightStringWithTutorial,
    onUpdateLightString: updateLightString,
    onTapSelection: handleTapSelection,
    findClosestLightString,
    deselectLightString,
    isSettingReference,
    onReferenceComplete: handleReferenceLineComplete,
    interactionMode,
  });

  // Decor placement/manipulation gestures
  const { 
    panResponder: decorPanResponder, 
    isDragging: isManipulatingDecor 
  } = useDecorGestures({
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
    isEnabled: interactionMode === 'decor',
  });

  // Singular light tap/manipulation gestures
  const { 
    panResponder: singularLightPanResponder, 
    isDragging: isManipulatingSingularLight 
  } = useSingularLightGestures({
    selectedAsset,
    setSelectedAsset,
    addSingularLight,
    moveSingularLight,
    findSingularLightAtPoint,
    getSingularLightById,
    selectedLightId,
    setSelectedLightId: selectSingularLight,
    getLightRenderStyle,
    getLightSizeScale,
    isEnabled: interactionMode === 'tap',
  });

  // Measure mode gesture state
  const [currentMeasureLine, setCurrentMeasureLine] = useState(null);
  const [isMeasuring, setIsMeasuring] = useState(false);
  const [draggedMeasureHandle, setDraggedMeasureHandle] = useState(null); // { lineId, handleType: 'start'|'end' }

  // Simple measure mode pan responder
  const measurePanResponder = PanResponder.create({
    onStartShouldSetPanResponder: (evt) => {
      const touches = evt.nativeEvent.touches;
      return touches.length === 1 && interactionMode === 'measure';
    },
    
    onMoveShouldSetPanResponder: (evt) => {
      const touches = evt.nativeEvent.touches;
      return touches.length === 1 && interactionMode === 'measure';
    },

    onPanResponderGrant: (evt) => {
      const { locationX, locationY } = evt.nativeEvent;
      const point = { x: locationX, y: locationY };
      
      // Check if touching a handle first (highest priority)
      if (!isMeasuring) {
        const handle = findMeasurementHandleAtPoint(point.x, point.y);
        if (handle) {
          setDraggedMeasureHandle(handle);
          return;
        }
        
        // Check if tapping on an existing measurement line to select it
        const hitLine = findMeasurementLineAtPoint(point.x, point.y);
        if (hitLine) {
          handleTapSelection('measurement', hitLine.id);
          return;
        }
        
        // Clear selections if not hitting anything
        deselectMeasurementLine();
      }
      
      // Start drawing a new measurement line if reference is set
      if (hasReference && !isMeasuring && !draggedMeasureHandle) {
        setCurrentMeasureLine({
          start: point,
          end: point,
        });
        setIsMeasuring(true);
      } else if (!hasReference && !isMeasuring && !draggedMeasureHandle) {
        // Show alert with option to set reference
        Alert.alert(
          'Reference Required',
          'You need to set a reference measurement first to establish scale. Would you like to set one now?',
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Set Reference', 
              onPress: () => {
                startReferenceMode();
              }
            }
          ]
        );
      }
    },

    onPanResponderMove: (evt) => {
      if (evt.nativeEvent.touches.length > 1) {
        setCurrentMeasureLine(null);
        setIsMeasuring(false);
        setDraggedMeasureHandle(null);
        return false;
      }

      const { locationX, locationY } = evt.nativeEvent;
      const newPosition = { x: locationX, y: locationY };

      // Handle measurement line handle dragging
      if (draggedMeasureHandle) {
        const selectedLine = getMeasurementLineById(draggedMeasureHandle.lineId);
        if (selectedLine) {
          const newStart = draggedMeasureHandle.handleType === 'start' ? newPosition : selectedLine.start;
          const newEnd = draggedMeasureHandle.handleType === 'end' ? newPosition : selectedLine.end;
          
          updateMeasurementLine(draggedMeasureHandle.lineId, newStart, newEnd);
        }
        return;
      }

      // Handle drawing new measurement line
      if (isMeasuring && currentMeasureLine) {
        setCurrentMeasureLine(prev => ({
          ...prev,
          end: newPosition
        }));
      }
    },

    onPanResponderRelease: () => {
      // Handle measurement line creation
      if (isMeasuring && currentMeasureLine && hasReference) {
        // Calculate line length and add the measurement
        const lengthInFeet = getLineLengthInFeet(currentMeasureLine.start, currentMeasureLine.end);
        if (lengthInFeet !== null && lengthInFeet > 0.1) { // Minimum line length
          const measurementLine = {
            ...currentMeasureLine,
            lengthInFeet: lengthInFeet,
            label: `${lengthInFeet.toFixed(1)} ft`
          };
          addMeasurementLineWithTutorial(measurementLine);
        }
      }
      
      // Reset all dragging states
      setCurrentMeasureLine(null);
      setIsMeasuring(false);
      setDraggedMeasureHandle(null);
    },
  });

  // Use appropriate pan responder based on mode
  const activePanResponder = 
    isSettingReference ? stringPanResponder : // Use string pan responder for reference setting
    interactionMode === 'decor' ? decorPanResponder :
    interactionMode === 'tap' ? singularLightPanResponder :
    interactionMode === 'measure' ? measurePanResponder :
    interactionMode === 'string' ? stringPanResponder :
    null; // No interaction when no mode selected
  const isDragging = 
    isSettingReference ? isDrawingString : // Use string dragging state for reference setting
    interactionMode === 'decor' ? isManipulatingDecor :
    interactionMode === 'tap' ? isManipulatingSingularLight :
    interactionMode === 'measure' ? (isMeasuring || !!draggedMeasureHandle) :
    interactionMode === 'string' ? isDrawingString :
    false; // No dragging when no mode selected

  // State for selected string's endpoint position for delete button
  const [selectedStringEndpoint, setSelectedStringEndpoint] = useState(null);

  // State for help tooltip
  // const [helpVisible, setHelpVisible] = useState(false);

  // State for night mode
  const [nightModeEnabled, setNightModeEnabled] = useState(false);
  const [nightModeIntensity, setNightModeIntensity] = useState(0.6);

  // State for menu
  const [isMenuExpanded, setIsMenuExpanded] = useState(false);

  // State for clear all confirmation
  const [showClearAllModal, setShowClearAllModal] = useState(false);

  // Debug: Set to true to show touchable areas for singular lights
  const showTouchableAreas = false;

  // Zoom gesture state
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);

  // ViewShot ref and export state
  const viewShotRef = useRef(null);
  const [isExporting, setIsExporting] = useState(false);
  const [hasMediaPermission, setHasMediaPermission] = useState(false);

  // Save state
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [savedLightData, setSavedLightData] = useState(null);
  const autoSaveTimerRef = useRef(null);

  // Tutorial system
  console.log('🎯 ImageViewer: Creating tutorial hook');
  const tutorial = useTutorial();
  console.log('🎯 ImageViewer: Tutorial hook created, isActive:', tutorial.isActive);
  const tutorialStarted = useRef(false);
  const startTutorialRef = useRef(tutorial.startTutorial);
  const zoomPanDetected = useRef(false);
  const gestureHappened = useSharedValue(0);
  
  // Update the ref when tutorial changes
  useEffect(() => {
    startTutorialRef.current = tutorial.startTutorial;
  }, [tutorial.startTutorial]);

  // Watch for gesture events to trigger tutorial
  useEffect(() => {
    const checkGesture = () => {
      if (gestureHappened.value > 0 && !zoomPanDetected.current) {
        console.log('🎯 Tutorial: Zoom/pan detected, triggering tutorial action');
        zoomPanDetected.current = true;
        if (tutorial?.handleAction) {
          // Add slight delay before triggering
          setTimeout(() => {
            console.log('🎯 Tutorial: Calling zoom_or_pan_detected action');
            tutorial.handleAction('zoom_or_pan_detected');
          }, 1500);
        }
      }
    };

    // Check periodically for gesture changes
    const interval = setInterval(checkGesture, 100);
    return () => clearInterval(interval);
  }, [tutorial, gestureHappened]);
  
  // Start tutorial when component mounts (if not completed)
  useEffect(() => {
    console.log('🎯 Tutorial: useEffect triggered, tutorialStarted:', tutorialStarted.current);
    if (!tutorialStarted.current) {
      console.log('🎯 Tutorial: Starting tutorial...');
      tutorialStarted.current = true;
      // Start tutorial after a short delay to let the component fully load
      const timer = setTimeout(() => {
        console.log('🎯 Tutorial: Calling startTutorial');
        startTutorialRef.current('editor_intro');
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, []);


  // Check for media library permissions
  useEffect(() => {
    (async () => {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      setHasMediaPermission(status === 'granted');
    })();
  }, []);

  // Load existing light data when component mounts
  useEffect(() => {
    const loadLightData = async () => {
      if (!projectId) return;
      
      try {
        const loadedData = await lightDataStorage.loadProjectLightData(projectId);
        if (loadedData) {
          setSavedLightData(loadedData);
          
          console.log('💡 ImageViewer: About to load data into hooks');
          console.log('💡 ImageViewer: Light strings to load:', loadedData.lightStrings?.length || 0);
          console.log('💡 ImageViewer: Singular lights to load:', loadedData.singleLights?.length || 0);
          console.log('💡 ImageViewer: Decor to load:', loadedData.decor?.length || 0);
          
          // Apply loaded data to hooks
          if (loadedData.lightStrings?.length > 0) {
            console.log('💡 ImageViewer: Calling loadLightStrings with:', loadedData.lightStrings);
            loadLightStrings(loadedData.lightStrings);
          }
          if (loadedData.singleLights?.length > 0) {
            console.log('💡 ImageViewer: Calling loadSingularLights with:', loadedData.singleLights);
            loadSingularLights(loadedData.singleLights);
          }
          if (loadedData.decor?.length > 0) {
            console.log('💡 ImageViewer: Calling loadDecor with:', loadedData.decor);
            loadDecor(loadedData.decor);
          }
          
          // Load reference scale if it exists
          if (loadedData.referenceScale) {
            console.log('💡 ImageViewer: Loading reference scale:', loadedData.referenceScale);
            loadReferenceScale(loadedData.referenceScale);
          }
          
          // Load measurement lines if they exist
          if (loadedData.measurementLines?.length > 0) {
            console.log('💡 ImageViewer: Loading measurement lines:', loadedData.measurementLines);
            loadMeasurementLines(loadedData.measurementLines);
          }
          
          console.log('💡 ImageViewer: Finished loading data into hooks');
        }
      } catch (error) {
        console.error('Error loading light data:', error);
      }
    };

    loadLightData();
  }, [projectId, loadLightStrings, loadSingularLights, loadDecor, loadMeasurementLines, loadReferenceScale]);

  // Recalculate measurement lines when reference scale changes
  useEffect(() => {
    if (hasReference && measurementLines.length > 0) {
      console.log('📏 ImageViewer: Reference scale changed, recalculating measurement lines');
      recalculateAllMeasurements();
    }
  }, [hasReference, referenceLine, referenceLength, measurementLines.length, recalculateAllMeasurements]);

  // Clear auto-save timer on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, []);

  // Save project light data
  const handleSaveProject = useCallback(async () => {
    if (!projectId || isSaving) return;

    setIsSaving(true);
    try {
      const referenceScale = referenceLine && referenceLength ? {
        referenceLine,
        referenceLength
      } : undefined;

      await lightDataStorage.saveProjectLightData(
        projectId,
        lightStrings,
        singularLights,
        decor,
        referenceScale,
        measurementLines
      );

      const now = new Date().toISOString();
      setHasUnsavedChanges(false);

      // Update saved data for comparison
      setSavedLightData({
        lightStrings,
        singleLights: singularLights,
        decor,
        referenceScale,
        measurementLines,
        lastSaved: now,
        version: '1.0'
      });

      console.log('💡 ImageViewer: Successfully saved project');
    } catch (error) {
      console.error('Error saving project:', error);
      Alert.alert('Save Error', 'Failed to save your project. Please try again.');
    } finally {
      setIsSaving(false);
    }
  }, [projectId, isSaving, lightStrings, singularLights, decor, referenceLine, referenceLength, measurementLines]);

  // Check for unsaved changes
  useEffect(() => {
    const hasChanges = lightDataStorage.hasUnsavedChanges(
      lightStrings,
      singularLights,
      decor,
      measurementLines,
      savedLightData
    );
    setHasUnsavedChanges(hasChanges);

    // Auto-save after 30 seconds of changes
    if (hasChanges && !isSaving) {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
      
      autoSaveTimerRef.current = setTimeout(() => {
        handleSaveProject();
      }, 60000); // 30 seconds
    }
  }, [lightStrings, singularLights, decor, measurementLines, savedLightData, isSaving, handleSaveProject]);

  // Pure pinch gesture for zoom only
  const pinchGesture = Gesture.Pinch()
    .onUpdate((e) => {
      scale.value = savedScale.value * e.scale;
    })
    .onEnd(() => {
      // Limit zoom levels
      if (scale.value < 0.5) {
        scale.value = withSpring(0.5);
        savedScale.value = 0.5;
      } else if (scale.value > 6) {
        scale.value = withSpring(6);
        savedScale.value = 6;
      } else {
        savedScale.value = scale.value;
      }
      
      // Trigger tutorial detection
      gestureHappened.value = gestureHappened.value + 1;
    });

  // Two-finger pan gesture for moving the image when zoomed
  const twoFingerPanGesture = Gesture.Pan()
    .minPointers(2)
    .maxPointers(2)
    .onUpdate((e) => {
      // Only allow panning when zoomed in
      if (scale.value > 1.1) {
        translateX.value = savedTranslateX.value + e.translationX;
        translateY.value = savedTranslateY.value + e.translationY;
      }
    })
    .onEnd(() => {
      if (scale.value > 1.1) {
        savedTranslateX.value = translateX.value;
        savedTranslateY.value = translateY.value;
        
        // Trigger tutorial detection
        gestureHappened.value = gestureHappened.value + 1;
      }
    });

  // Combine pinch and two-finger pan gestures
  const imageGestures = Gesture.Simultaneous(pinchGesture, twoFingerPanGesture);

  // Animated style for the zoom container
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  // Reset zoom function
  const resetZoom = () => {
    scale.value = withSpring(1);
    savedScale.value = 1;
    translateX.value = withSpring(0);
    translateY.value = withSpring(0);
    savedTranslateX.value = 0;
    savedTranslateY.value = 0;
    
    // Handle tutorial action when reset zoom is clicked (with delay)
    if (tutorial?.handleAction) {
      setTimeout(() => {
        tutorial.handleAction('reset_zoom_clicked');
      }, 500); // 0.5 second delay
    }
  };

  // Update the endpoint position when selection changes
  useEffect(() => {
    if (selectedStringId) {
      const selectedString = lightStrings.find((string) => string.id === selectedStringId);
      if (selectedString) {
        setSelectedStringEndpoint(selectedString.end);
      }
    } else {
      setSelectedStringEndpoint(null);
    }
  }, [selectedStringId, lightStrings]);

  // Handle undo action
  const handleUndo = () => {
    if (deletedString) {
      undoDelete();
    } else if (deletedLight) {
      undoDeleteLight();
    }
  };

  // Direct delete handler
  const handleDeleteString = (stringId) => {
    deleteLightString(stringId);
  };

  // Direct delete handler for decor
  const handleDeleteDecor = () => {
    if (selectedDecorId) {
      removeDecor(selectedDecorId);
      setSelectedDecorId(null);
    }
  };

  // Direct delete handler for singular lights
  const handleDeleteSingularLight = () => {
    if (selectedLightId) {
      deleteSingularLight(selectedLightId);
    }
  };

  // Clear all confirmation handlers
  const handleClearAllRequest = () => {
    setIsMenuExpanded(false);
    setShowClearAllModal(true);
  };

  const handleClearAllCancel = () => {
    setShowClearAllModal(false);
  };

  const handleRestartTutorial = async () => {
    console.log('🎯 Tutorial: User requested tutorial restart');
    // Reset tutorial completion status
    await tutorial.resetTutorialStatus();
    // Start the tutorial again
    tutorial.startTutorial('editor_intro');
  };

  const handleClearAllConfirm = () => {
    clearAllLightStrings();
    clearAllSingularLights();
    clearDecor();
    setShowClearAllModal(false);
  };


  // Toggle night mode
  const toggleNightMode = () => {
    setNightModeEnabled(!nightModeEnabled);
    
    // Handle tutorial action when dark mode is toggled (with delay)
    if (tutorial?.handleAction) {
      setTimeout(() => {
        tutorial.handleAction('dark_mode_toggled');
      }, 1000); // 1 second delay before showing Export tutorial
    }
  };

  // Handle night mode intensity change
  const handleNightModeIntensityChange = (newIntensity) => {
    setNightModeIntensity(newIntensity);
  };

  // Handle export
  const handleExport = async () => {
    // Handle tutorial action when export button is clicked
    if (tutorial?.handleAction) {
      tutorial.handleAction('export_button_clicked');
    }
    
    if (!hasMediaPermission) {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant media library access to save images.', [
          { text: 'OK' },
        ]);
        return;
      }
      setHasMediaPermission(true);
    }

    setIsExporting(true);

    try {
      // Set options for the capture
      const captureOptions = {
        format: 'jpg',
        quality: 1,
        result: 'file',
      };

      // Capture the view
      const uri = await viewShotRef.current.capture(captureOptions);

      // Save to media library
      const asset = await MediaLibrary.createAssetAsync(uri);

      // Create an album and add the asset to it
      const album = await MediaLibrary.getAlbumAsync('Light Designer');
      if (album === null) {
        await MediaLibrary.createAlbumAsync('Light Designer', asset, false);
      } else {
        await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
      }

      // Notify user of success
      Alert.alert('Success', 'Your design has been saved to your media library!', [{ text: 'OK' }]);
    } catch (error) {
      console.error('Export error:', error);
      Alert.alert('Export Failed', 'There was a problem saving your design.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" />

        <View style={styles.container}>
        {/* Night Mode Controls - Only shown when night mode is enabled */}
        {nightModeEnabled && (
          <View style={{ 
            position: 'absolute', 
            top: isTablet ? 84 : 64, 
            right: 12, 
            zIndex: 1000 
          }}>
            <View style={{
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              borderRadius: isTablet ? 20 : 12,
              paddingHorizontal: isTablet ? 20 : 12,
              paddingVertical: isTablet ? 18 : 10,
              flexDirection: 'row',
              alignItems: 'center',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.15,
              shadowRadius: 4,
              elevation: 4,
              gap: isTablet ? 18 : 10,
            }}>
              <Text style={{
                fontSize: isTablet ? 18 : 13,
                fontWeight: '600',
                color: '#333',
                minWidth: isTablet ? 50 : 35,
              }}>
                {Math.round(nightModeIntensity * 100)}%
              </Text>
              
              <TouchableOpacity
                style={{
                  width: isTablet ? 44 : 28,
                  height: isTablet ? 44 : 28,
                  borderRadius: isTablet ? 22 : 14,
                  backgroundColor: nightModeIntensity <= 0.1 ? '#f5f5f5' : '#333',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
                onPress={() =>
                  handleNightModeIntensityChange(Math.max(nightModeIntensity - 0.1, 0.1))
                }
                disabled={nightModeIntensity <= 0.1}>
                <MaterialIcons 
                  name="remove" 
                  size={isTablet ? 24 : 16} 
                  color={nightModeIntensity <= 0.1 ? '#ccc' : 'white'} 
                />
              </TouchableOpacity>
              
              <TouchableOpacity
                style={{
                  width: isTablet ? 44 : 28,
                  height: isTablet ? 44 : 28,
                  borderRadius: isTablet ? 22 : 14,
                  backgroundColor: nightModeIntensity >= 0.9 ? '#f5f5f5' : '#333',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
                onPress={() =>
                  handleNightModeIntensityChange(Math.min(nightModeIntensity + 0.1, 0.9))
                }
                disabled={nightModeIntensity >= 0.9}>
                <MaterialIcons 
                  name="add" 
                  size={isTablet ? 24 : 16} 
                  color={nightModeIntensity >= 0.9 ? '#ccc' : 'white'} 
                />
              </TouchableOpacity>
            </View>
          </View>
        )}
        {/* Back Button - Positioned in top left */}
        <TouchableOpacity
          style={{
            position: 'absolute',
            top: 12,
            left: 12,
            zIndex: 1000,
            width: isTablet ? 60 : 40,
            height: isTablet ? 60 : 40,
            borderRadius: isTablet ? 30 : 20,
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            justifyContent: 'center',
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.15,
            shadowRadius: 4,
            elevation: 4,
          }}
          onPress={onGoBack}>
          <MaterialIcons
            name="arrow-back"
            size={isTablet ? 32 : 22}
            color="#333"
          />
        </TouchableOpacity>

        {/* Top Right Button Group */}
        <View style={{ position: 'absolute', top: 12, right: 12, zIndex: 1000 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: isTablet ? 16 : 8 }}>
            {/* Night Mode Toggle */}
            <TouchableOpacity
              style={{
                width: isTablet ? 60 : 40,
                height: isTablet ? 60 : 40,
                borderRadius: isTablet ? 30 : 20,
                backgroundColor: nightModeEnabled ? 'rgba(25, 25, 50, 0.9)' : 'rgba(255, 255, 255, 0.9)',
                justifyContent: 'center',
                alignItems: 'center',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.15,
                shadowRadius: 4,
                elevation: 4,
              }}
              onPress={toggleNightMode}>
              <MaterialIcons
                name={nightModeEnabled ? 'wb-sunny' : 'nightlight-round'}
                size={isTablet ? 32 : 22}
                color={nightModeEnabled ? '#FFD700' : '#333'}
              />
            </TouchableOpacity>

            {/* Save Button */}
            <TouchableOpacity
              onPress={handleSaveProject}
              disabled={isSaving}
              style={{
                width: isTablet ? 60 : 40,
                height: isTablet ? 60 : 40,
                borderRadius: isTablet ? 30 : 20,
                backgroundColor: hasUnsavedChanges 
                  ? 'rgba(59, 130, 246, 0.9)' // Blue when unsaved changes
                  : 'rgba(34, 197, 94, 0.9)', // Green when saved
                justifyContent: 'center',
                alignItems: 'center',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.15,
                shadowRadius: 4,
                elevation: 4,
              }}>
              {isSaving ? (
                <ActivityIndicator size={isTablet ? "large" : "small"} color="white" />
              ) : (
                <MaterialIcons 
                  name={hasUnsavedChanges ? "save" : "check"} 
                  size={isTablet ? 32 : 22} 
                  color="white" 
                />
              )}
            </TouchableOpacity>

            {/* Export Button */}
            <TouchableOpacity
              onPress={handleExport}
              disabled={isExporting}
              style={{
                width: isTablet ? 60 : 40,
                height: isTablet ? 60 : 40,
                borderRadius: isTablet ? 30 : 20,
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                justifyContent: 'center',
                alignItems: 'center',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.15,
                shadowRadius: 4,
                elevation: 4,
              }}>
              {isExporting ? (
                <ActivityIndicator size={isTablet ? "large" : "small"} color="#333" />
              ) : (
                <MaterialIcons name="file-download" size={isTablet ? 32 : 22} color="#333" />
              )}
            </TouchableOpacity>

            {/* Reset Zoom Button */}
            <TouchableOpacity
              onPress={resetZoom}
              style={{
                width: isTablet ? 60 : 40,
                height: isTablet ? 60 : 40,
                borderRadius: isTablet ? 30 : 20,
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                justifyContent: 'center',
                alignItems: 'center',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.15,
                shadowRadius: 4,
                elevation: 4,
              }}>
              <MaterialIcons name="zoom-out-map" size={isTablet ? 32 : 22} color="#333" />
            </TouchableOpacity>

            {/* Menu Button */}
            <TouchableOpacity 
              onPress={() => setIsMenuExpanded(!isMenuExpanded)} 
              style={{
                width: isTablet ? 60 : 40,
                height: isTablet ? 60 : 40,
                borderRadius: isTablet ? 30 : 20,
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                justifyContent: 'center',
                alignItems: 'center',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.15,
                shadowRadius: 4,
                elevation: 4,
              }}>
              <MaterialIcons name={isMenuExpanded ? 'close' : 'more-horiz'} size={isTablet ? 32 : 22} color="#333" />
            </TouchableOpacity>
          </View>

          {/* Expanded menu items */}
          {isMenuExpanded && (
            <View style={{ 
              position: 'absolute', 
              top: isTablet ? 70 : 50, 
              right: 0, 
              minWidth: isTablet ? 200 : 120,
            }}>
              <TouchableOpacity
                onPress={handleClearAllRequest}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  paddingHorizontal: isTablet ? 28 : 12,
                  paddingVertical: isTablet ? 24 : 10,
                  borderRadius: isTablet ? 24 : 12,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.15,
                  shadowRadius: 4,
                  elevation: 4,
                }}>
                <MaterialIcons name="delete-sweep" size={isTablet ? 32 : 18} color="#EF4444" />
                <Text style={{ 
                  marginLeft: isTablet ? 20 : 8, 
                  fontWeight: '600', 
                  color: '#EF4444', 
                  fontSize: isTablet ? 20 : 14 
                }}>
                  Clear All Lights & Decor
                </Text>
              </TouchableOpacity>

              {/* Restart Tutorial Button */}
              <TouchableOpacity
                onPress={() => {
                  setIsMenuExpanded(false);
                  handleRestartTutorial();
                }}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  paddingHorizontal: isTablet ? 28 : 12,
                  paddingVertical: isTablet ? 24 : 10,
                  borderRadius: isTablet ? 24 : 12,
                  marginTop: isTablet ? 16 : 8,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.15,
                  shadowRadius: 4,
                  elevation: 4,
                }}>
                <MaterialIcons name="school" size={isTablet ? 32 : 18} color="#2196F3" />
                <Text style={{ 
                  marginLeft: isTablet ? 20 : 8, 
                  fontWeight: '600', 
                  color: '#2196F3', 
                  fontSize: isTablet ? 20 : 14 
                }}>
                  Restart Tutorial
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Help Button */}
        {/* <TouchableOpacity style={styles.helpButton} onPress={() => setHelpVisible(!helpVisible)}>
          <MaterialIcons name="help-outline" size={24} color="#007AFF" />
        </TouchableOpacity> */}

        {/* Help Tooltip */}
        {/* {helpVisible && (
          <View style={styles.helpTooltip}>
            <Text style={styles.helpText}>
              {selectedStringId
                ? 'Tap the delete button to remove the selected light. Tap elsewhere to deselect.'
                : selectedAsset
                  ? `Tap and drag to place ${selectedAsset.name} lights on the image.`
                  : 'Select a light style from below, then tap and drag to place lights.'}
            </Text>
            <TouchableOpacity style={styles.closeHelp} onPress={() => setHelpVisible(false)}>
              <MaterialIcons name="close" size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        )} */}

        <GestureDetector gesture={imageGestures}>
          <Animated.View style={[styles.zoomContainer, animatedStyle]}>
            <ViewShot ref={viewShotRef} style={styles.canvasContainer}>
              {/* Main image with precise night mode overlay */}
              <ImageWithNightOverlay
                source={{ uri: imgSource }}
                nightModeEnabled={nightModeEnabled}
                nightModeIntensity={nightModeIntensity}
                style={[StyleSheet.absoluteFill, styles.imageContainer]}
              />

              {/* Light strings and assets - hidden in measure mode */}
              <View style={[StyleSheet.absoluteFill, styles.lightsLayer]} {...(activePanResponder?.panHandlers || {})}>
                {interactionMode !== 'measure' && (
                  <>
                    <SimpleLightRenderer
                      lightStrings={lightStrings}
                      currentVector={currentVector}
                      isDragging={isDragging}
                      selectedStringId={selectedStringId}
                      getAssetById={getAssetById}
                      calculateLightPositions={calculateLightPositions}
                      getLightSizeScale={getLightSizeScale}
                      getLightRenderStyle={getLightRenderStyle}
                    />

                    {/* Singular lights */}
                    <SingularLightRenderer
                      singularLights={singularLights}
                      selectedLightId={selectedLightId}
                      getLightSizeScale={getLightSizeScale}
                      getLightRenderStyle={getLightRenderStyle}
                      showTouchableAreas={showTouchableAreas}
                    />

                    {/* Decor */}
                    <DecorRenderer
                      decor={decor}
                      selectedDecorId={selectedDecorId}
                      onDecorSelect={setSelectedDecorId}
                      showResizeHandles={interactionMode === 'decor'}
                      getResizeHandles={getResizeHandles}
                    />
                  </>
                )}

                {/* Reference line renderer - always visible */}
                <ReferenceLineRenderer
                  referenceLine={referenceLine}
                  referenceLength={referenceLength}
                  isSettingReference={isSettingReference}
                  pendingLine={currentVector?.isReference ? currentVector : null}
                />

                {/* Measurement lines - only visible in measure mode */}
                {interactionMode === 'measure' && (
                  <MeasureLineRenderer
                    measurementLines={measurementLines}
                    selectedMeasurementId={selectedMeasurementId}
                    currentMeasureLine={currentMeasureLine}
                    isDrawing={isMeasuring}
                  />
                )}
                
                {/* Measure mode helper message when no reference is set */}
              </View>
            </ViewShot>
          </Animated.View>
        </GestureDetector>

        {/* Floating Selection Controls */}
        <FloatingSelectionControls
          selectedStringId={selectedStringId}
          selectedStringEndpoint={selectedStringEndpoint}
          onDeleteString={handleDeleteString}
          onDeselectString={deselectLightString}
          selectedDecorId={selectedDecorId}
          onDeleteDecor={handleDeleteDecor}
          onDeselectDecor={() => setSelectedDecorId(null)}
          selectedLightId={selectedLightId}
          onDeleteSingularLight={handleDeleteSingularLight}
          onDeselectSingularLight={deselectSingularLight}
          selectedMeasurementId={selectedMeasurementId}
          onDeleteMeasurementLine={removeMeasurementLine}
          onDeselectMeasurementLine={deselectMeasurementLine}
          interactionMode={interactionMode}
        />

        {/* Bottom Toolbar */}
        <BottomToolbar
          hasReference={hasReference}
          isSettingReference={isSettingReference}
          onStartReference={startReferenceMode}
          onClearReference={clearReference}
          onCancelReference={cancelReferenceMode}
          lightAssets={allAssets}
          selectedAsset={selectedAsset}
          onSelectAsset={handleAssetSelection}
          getAssetsByCategory={getAssetsByCategory}
          getCategories={getCategories}
          getLightRenderStyle={getLightRenderStyle}
          canUndo={!!deletedString || !!deletedLight}
          onUndo={handleUndo}
          interactionMode={interactionMode}
          onModeToggle={handleModeChange}
          onCreateCustomAsset={createCustomAsset}
          onRemoveCustomAsset={removeCustomAsset}
          tutorial={tutorial}
        />

        {/* Reference modal */}
        <ReferenceModal
          visible={showReferenceModal}
          onClose={cancelReferenceMode}
          onConfirm={(lengthInFeet) => {
            confirmReferenceLength(lengthInFeet);
            // Handle tutorial action when reference is taken
            if (tutorial?.handleAction) {
              tutorial.handleAction('reference_measurement_taken');
            }
          }}
          onCancel={cancelReferenceMode}
        />

        {/* Clear All Confirmation Modal */}
        <ClearAllConfirmModal
          visible={showClearAllModal}
          onCancel={handleClearAllCancel}
          onConfirm={handleClearAllConfirm}
        />

        {/* Tutorial Overlay */}
        <TutorialOverlay
          visible={tutorial.isActive}
          step={tutorial.currentStep}
          onNext={tutorial.nextStep}
          onEnd={tutorial.endTutorial}
        />
      </View>
    </SafeAreaView>
    </GestureHandlerRootView>
  );
};

export default ImageViewer;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  zoomContainer: {
    flex: 1,
  },
  canvasContainer: {
    flex: 1,
    position: 'relative',
  },
  imageContainer: {
    zIndex: 1, // Base layer - the image
  },
  image: {
    width: '100%',
    height: '100%',
  },
  lightsLayer: {
    zIndex: 10, // Above both the image and night mode layer
  },
});
