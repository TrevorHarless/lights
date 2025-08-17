// components/projects/ImageViewer.jsx
import { MaterialIcons } from '@expo/vector-icons';
import * as MediaLibrary from 'expo-media-library';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
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
import { FloatingSelectionControls } from './FloatingSelectionControls';
import { ImageWithNightOverlay } from './ImageWithNightOverlay';
import { ReferenceLineRenderer } from './ReferenceLineRenderer';
import { ReferenceModal } from './ReferenceModal';
import SimpleLightRenderer from './SimpleLightRenderer';
import SingularLightRenderer from './SingularLightRenderer';
import { WreathRenderer } from './WreathRenderer';

import { useLightAssets } from '~/hooks/editor/useLightAssets';
import { useLightStrings } from '~/hooks/editor/useLightStrings';
import { useReferenceScale } from '~/hooks/editor/useReferenceScale';
import { useSingularLightGestures } from '~/hooks/editor/useSingularLightGestures';
import { useSingularLights } from '~/hooks/editor/useSingularLights';
import { useVectorDrawing } from '~/hooks/editor/useVectorDrawing';
import { useWreathAssets } from '~/hooks/editor/useWreathAssets';
import { useWreathGestures } from '~/hooks/editor/useWreathGestures';
import { useWreathShapes } from '~/hooks/editor/useWreathShapes';
import { lightDataStorage } from '~/services/lightDataStorage';

const ImageViewer = ({ imgSource, onGoBack, project, projectId }) => {
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
    wreathAssets,
    getWreathAssetById,
  } = useWreathAssets();

  // Combined asset system
  const allAssets = [...lightAssets, ...wreathAssets];
  const [selectedAsset, setSelectedAsset] = React.useState(null);

  // Combined asset helpers
  const getAssetById = (id) => getLightAssetById(id) || getWreathAssetById(id);
  const getAssetsByCategory = (category) => {
    if (category === 'wreath') {
      return wreathAssets;
    }
    return getLightAssetsByCategory(category);
  };
  const getCategories = () => [...getLightCategories(), 'wreath'];

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
  } = useReferenceScale();

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
    updateSingularLight,
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

  // Wreath management
  const {
    wreaths,
    selectedWreathId,
    setSelectedWreathId,
    addWreath,
    removeWreath,
    moveWreath,
    resizeWreath,
    getWreathById,
    findWreathAtPoint,
    getResizeHandles,
    clearWreaths,
    loadWreaths,
  } = useWreathShapes();


  // Interaction mode state
  const [interactionMode, setInteractionMode] = React.useState('string'); // 'string', 'tap', or 'wreath'

  // Auto-switch mode based on selected asset
  React.useEffect(() => {
    if (selectedAsset) {
      if (selectedAsset.category === 'wreath') {
        setInteractionMode('wreath');
      } else {
        // Default to tap mode for string assets unless already in string mode
        setInteractionMode(interactionMode === 'string' ? 'string' : 'tap');
      }
    }
  }, [selectedAsset]);

  // Enhanced tap selection handler
  const handleTapSelection = (type, id) => {
    // Clear other selections first
    deselectLightString();
    setSelectedWreathId(null);
    deselectSingularLight();
    
    // Apply new selection
    switch (type) {
      case 'string':
        selectLightString(id);
        break;
      case 'wreath':
        setSelectedWreathId(id);
        break;
      case 'light':
        selectSingularLight(id);
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
    onVectorComplete: addLightString,
    onUpdateLightString: updateLightString,
    onTapSelection: handleTapSelection,
    findClosestLightString,
    deselectLightString,
    isSettingReference,
    onReferenceComplete: handleReferenceLineComplete,
  });

  // Wreath placement/manipulation gestures
  const { 
    panResponder: wreathPanResponder, 
    isDragging: isManipulatingWreath 
  } = useWreathGestures({
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
    isEnabled: interactionMode === 'wreath',
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

  // Use appropriate pan responder based on mode
  const activePanResponder = 
    interactionMode === 'wreath' ? wreathPanResponder :
    interactionMode === 'tap' ? singularLightPanResponder :
    stringPanResponder;
  const isDragging = 
    interactionMode === 'wreath' ? isManipulatingWreath :
    interactionMode === 'tap' ? isManipulatingSingularLight :
    isDrawingString;

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
          console.log('💡 ImageViewer: Wreaths to load:', loadedData.wreaths?.length || 0);
          
          // Apply loaded data to hooks
          if (loadedData.lightStrings?.length > 0) {
            console.log('💡 ImageViewer: Calling loadLightStrings with:', loadedData.lightStrings);
            loadLightStrings(loadedData.lightStrings);
          }
          if (loadedData.singleLights?.length > 0) {
            console.log('💡 ImageViewer: Calling loadSingularLights with:', loadedData.singleLights);
            loadSingularLights(loadedData.singleLights);
          }
          if (loadedData.wreaths?.length > 0) {
            console.log('💡 ImageViewer: Calling loadWreaths with:', loadedData.wreaths);
            loadWreaths(loadedData.wreaths);
          }
          
          // Load reference scale if it exists
          if (loadedData.referenceScale) {
            console.log('💡 ImageViewer: Loading reference scale:', loadedData.referenceScale);
            loadReferenceScale(loadedData.referenceScale);
          }
          
          console.log('💡 ImageViewer: Finished loading data into hooks');
        }
      } catch (error) {
        console.error('Error loading light data:', error);
      }
    };

    loadLightData();
  }, [projectId, loadLightStrings, loadSingularLights, loadWreaths]);

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
        wreaths,
        referenceScale
      );

      const now = new Date().toISOString();
      setHasUnsavedChanges(false);

      // Update saved data for comparison
      setSavedLightData({
        lightStrings,
        singleLights: singularLights,
        wreaths,
        referenceScale,
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
  }, [projectId, isSaving, lightStrings, singularLights, wreaths, referenceLine, referenceLength]);

  // Check for unsaved changes
  useEffect(() => {
    const hasChanges = lightDataStorage.hasUnsavedChanges(
      lightStrings,
      singularLights,
      wreaths,
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
      }, 30000); // 30 seconds
    }
  }, [lightStrings, singularLights, wreaths, savedLightData, isSaving, handleSaveProject]);

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

  // Direct delete handler for wreaths
  const handleDeleteWreath = () => {
    if (selectedWreathId) {
      removeWreath(selectedWreathId);
      setSelectedWreathId(null);
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

  const handleClearAllConfirm = () => {
    clearAllLightStrings();
    clearAllSingularLights();
    clearWreaths();
    setShowClearAllModal(false);
  };


  // Toggle night mode
  const toggleNightMode = () => {
    setNightModeEnabled(!nightModeEnabled);
  };

  // Handle night mode intensity change
  const handleNightModeIntensityChange = (newIntensity) => {
    setNightModeIntensity(newIntensity);
  };

  // Handle export
  const handleExport = async () => {
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
                name={nightModeEnabled ? 'nightlight-round' : 'wb-sunny'}
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
                  Clear All
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

              {/* Light strings - rendered ON TOP of the night mode overlay */}
              <View style={[StyleSheet.absoluteFill, styles.lightsLayer]} {...activePanResponder.panHandlers}>
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

                {/* Reference line renderer */}
                <ReferenceLineRenderer
                  referenceLine={referenceLine}
                  referenceLength={referenceLength}
                  isSettingReference={isSettingReference}
                  pendingLine={currentVector?.isReference ? currentVector : null}
                />

                {/* Wreaths */}
                <WreathRenderer
                  wreaths={wreaths}
                  selectedWreathId={selectedWreathId}
                  onWreathSelect={setSelectedWreathId}
                  showResizeHandles={interactionMode === 'wreath'}
                  getResizeHandles={getResizeHandles}
                />
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
          selectedWreathId={selectedWreathId}
          onDeleteWreath={handleDeleteWreath}
          onDeselectWreath={() => setSelectedWreathId(null)}
          selectedLightId={selectedLightId}
          onDeleteSingularLight={handleDeleteSingularLight}
          onDeselectSingularLight={deselectSingularLight}
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
          onSelectAsset={setSelectedAsset}
          getAssetsByCategory={getAssetsByCategory}
          getCategories={getCategories}
          getLightRenderStyle={getLightRenderStyle}
          canUndo={!!deletedString || !!deletedLight}
          onUndo={handleUndo}
          interactionMode={interactionMode}
          onModeToggle={setInteractionMode}
          onCreateCustomAsset={createCustomAsset}
          onRemoveCustomAsset={removeCustomAsset}
        />

        {/* Reference modal */}
        <ReferenceModal
          visible={showReferenceModal}
          onClose={cancelReferenceMode}
          onConfirm={confirmReferenceLength}
          onCancel={cancelReferenceMode}
        />

        {/* Clear All Confirmation Modal */}
        <ClearAllConfirmModal
          visible={showClearAllModal}
          onCancel={handleClearAllCancel}
          onConfirm={handleClearAllConfirm}
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
