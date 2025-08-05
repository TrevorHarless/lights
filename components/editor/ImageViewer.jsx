// components/projects/ImageViewer.jsx
import { MaterialIcons } from '@expo/vector-icons';
import * as MediaLibrary from 'expo-media-library';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import ViewShot from 'react-native-view-shot';

import { BottomToolbar } from './BottomToolbar';
import { FloatingSelectionControls } from './FloatingSelectionControls';
import { ImageWithNightOverlay } from './ImageWithNightOverlay';
import { LightStringRenderer } from './LightStringRenderer';
import { ReferenceLineRenderer } from './ReferenceLineRenderer';
import { ReferenceModal } from './ReferenceModal';

import { useLightAssets } from '~/hooks/editor/useLightAssets';
import { useLightStrings } from '~/hooks/editor/useLightStrings';
import { useReferenceScale } from '~/hooks/editor/useReferenceScale';
import { useVectorDrawing } from '~/hooks/editor/useVectorDrawing';

const ImageViewer = ({ imgSource, onGoBack }) => {
  // Custom hooks
  const { lightAssets, selectedAsset, setSelectedAsset, getAssetById } = useLightAssets();

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
    getScaledLightSpacing,
    getLightSizeScale,
    hasReference,
  } = useReferenceScale();

  const {
    lightStrings,
    selectedStringId,
    deletedString,
    addLightString,
    deleteLightString,
    undoDelete,
    clearAllLightStrings,
    calculateLightPositions,
    selectLightString,
    deselectLightString,
    findClosestLightString,
  } = useLightStrings(lightAssets, getScaledLightSpacing);

  const { currentVector, isDragging, panResponder } = useVectorDrawing({
    selectedAsset,
    onVectorComplete: addLightString,
    onTapSelection: selectLightString,
    findClosestLightString,
    deselectLightString,
    isSettingReference,
    onReferenceComplete: handleReferenceLineComplete,
  });

  // State for selected string's endpoint position for delete button
  const [selectedStringEndpoint, setSelectedStringEndpoint] = useState(null);

  // State for help tooltip
  // const [helpVisible, setHelpVisible] = useState(false);

  // State for night mode
  const [nightModeEnabled, setNightModeEnabled] = useState(false);
  const [nightModeIntensity, setNightModeIntensity] = useState(0.5);

  // State for menu
  const [isMenuExpanded, setIsMenuExpanded] = useState(false);

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

  // Check for media library permissions
  useEffect(() => {
    (async () => {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      setHasMediaPermission(status === 'granted');
    })();
  }, []);

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
      } else if (scale.value > 3) {
        scale.value = withSpring(3);
        savedScale.value = 3;
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
    undoDelete();
  };

  // Direct delete handler
  const handleDeleteString = (stringId) => {
    deleteLightString(stringId);
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
        quality: 0.8,
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
            top: 64, 
            right: 12, 
            zIndex: 1000 
          }}>
            <View style={{
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              borderRadius: 12,
              paddingHorizontal: 12,
              paddingVertical: 10,
              flexDirection: 'row',
              alignItems: 'center',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.15,
              shadowRadius: 4,
              elevation: 4,
              gap: 10,
            }}>
              <Text style={{
                fontSize: 13,
                fontWeight: '600',
                color: '#333',
                minWidth: 35,
              }}>
                {Math.round(nightModeIntensity * 100)}%
              </Text>
              
              <TouchableOpacity
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 14,
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
                  size={16} 
                  color={nightModeIntensity <= 0.1 ? '#ccc' : 'white'} 
                />
              </TouchableOpacity>
              
              <TouchableOpacity
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 14,
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
                  size={16} 
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
            width: 40,
            height: 40,
            borderRadius: 20,
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
            size={22}
            color="#333"
          />
        </TouchableOpacity>

        {/* Top Right Button Group */}
        <View style={{ position: 'absolute', top: 12, right: 12, zIndex: 1000 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            {/* Night Mode Toggle */}
            <TouchableOpacity
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
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
                size={22}
                color={nightModeEnabled ? '#FFD700' : '#333'}
              />
            </TouchableOpacity>

            {/* Export Button */}
            <TouchableOpacity
              onPress={handleExport}
              disabled={isExporting}
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
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
                <ActivityIndicator size="small" color="#333" />
              ) : (
                <MaterialIcons name="file-download" size={22} color="#333" />
              )}
            </TouchableOpacity>

            {/* Reset Zoom Button */}
            <TouchableOpacity
              onPress={resetZoom}
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                justifyContent: 'center',
                alignItems: 'center',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.15,
                shadowRadius: 4,
                elevation: 4,
              }}>
              <MaterialIcons name="zoom-out-map" size={22} color="#333" />
            </TouchableOpacity>

            {/* Menu Button */}
            <TouchableOpacity 
              onPress={() => setIsMenuExpanded(!isMenuExpanded)} 
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                justifyContent: 'center',
                alignItems: 'center',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.15,
                shadowRadius: 4,
                elevation: 4,
              }}>
              <MaterialIcons name={isMenuExpanded ? 'close' : 'more-horiz'} size={22} color="#333" />
            </TouchableOpacity>
          </View>

          {/* Expanded menu items */}
          {isMenuExpanded && (
            <View style={{ 
              position: 'absolute', 
              top: 50, 
              right: 0, 
              minWidth: 120,
            }}>
              <TouchableOpacity
                onPress={() => {
                  clearAllLightStrings();
                  setIsMenuExpanded(false);
                }}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                  borderRadius: 12,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.15,
                  shadowRadius: 4,
                  elevation: 4,
                }}>
                <MaterialIcons name="delete-sweep" size={18} color="#EF4444" />
                <Text style={{ marginLeft: 8, fontWeight: '600', color: '#EF4444', fontSize: 14 }}>Clear All</Text>
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
              <View style={[StyleSheet.absoluteFill, styles.lightsLayer]} {...panResponder.panHandlers}>
                <LightStringRenderer
                  lightStrings={lightStrings}
                  currentVector={currentVector}
                  isDragging={isDragging}
                  selectedStringId={selectedStringId}
                  getAssetById={getAssetById}
                  calculateLightPositions={calculateLightPositions}
                  onDeleteString={handleDeleteString}
                  getLightSizeScale={getLightSizeScale}
                />

                {/* Reference line renderer */}
                <ReferenceLineRenderer
                  referenceLine={referenceLine}
                  referenceLength={referenceLength}
                  isSettingReference={isSettingReference}
                  pendingLine={currentVector?.isReference ? currentVector : null}
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
        />

        {/* Bottom Toolbar */}
        <BottomToolbar
          hasReference={hasReference}
          isSettingReference={isSettingReference}
          onStartReference={startReferenceMode}
          onClearReference={clearReference}
          onCancelReference={cancelReferenceMode}
          lightAssets={lightAssets}
          selectedAsset={selectedAsset}
          onSelectAsset={setSelectedAsset}
          canUndo={!!deletedString}
          onUndo={handleUndo}
        />

        {/* Reference modal */}
        <ReferenceModal
          visible={showReferenceModal}
          onClose={cancelReferenceMode}
          onConfirm={confirmReferenceLength}
          onCancel={cancelReferenceMode}
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
