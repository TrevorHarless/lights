// components/projects/ImageViewer.jsx
import { MaterialIcons } from '@expo/vector-icons';
import * as MediaLibrary from 'expo-media-library';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Image,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import ViewShot from 'react-native-view-shot';

import { CollapsibleBottomSheet } from './CollapsibleBottomSheet';
import { FloatingActionMenu } from './FloatingActionMenu';
import { FloatingReferenceButton } from './FloatingReferenceButton';
import { FloatingSelectionControls } from './FloatingSelectionControls';
import { LightStringRenderer } from './LightStringRenderer';
import { ReferenceLineRenderer } from './ReferenceLineRenderer';
import { ReferenceModal } from './ReferenceModal';

import { useLightAssets } from '~/hooks/editor/useLightAssets';
import { useLightStrings } from '~/hooks/editor/useLightStrings';
import { useReferenceScale } from '~/hooks/editor/useReferenceScale';
import { useVectorDrawing } from '~/hooks/editor/useVectorDrawing';

const ImageViewer = ({ imgSource }) => {
  // Custom hooks
  const { lightAssets, selectedAsset, setSelectedAsset, getAssetById } = useLightAssets();

  // Reference scale hook
  const {
    referenceLine,
    referenceLength,
    isSettingReference,
    showReferenceModal,
    pendingReferenceLine,
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
    getAssetTypeNameForString,
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
  const [helpVisible, setHelpVisible] = useState(false);

  // State for night mode
  const [nightModeEnabled, setNightModeEnabled] = useState(false);
  const [nightModeIntensity, setNightModeIntensity] = useState(0.5);

  // State for undo toast message
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

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

  // Update toast visibility when deleted string changes
  useEffect(() => {
    if (deletedString) {
      const assetName = getAssetTypeNameForString(deletedString);
      setToastMessage(`${assetName} light string deleted`);
      setToastVisible(true);
    } else {
      setToastVisible(false);
    }
  }, [deletedString, getAssetTypeNameForString]);

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
          <View style={styles.nightModeControlsContainer} pointerEvents="box-none">
            <View style={styles.nightModeControlsBox}>
              <Text style={styles.nightModeControlsLabel}>
                Night Effect: {Math.round(nightModeIntensity * 100)}%
              </Text>
              <View style={styles.nightModeButtonsRow}>
                <TouchableOpacity
                  style={styles.nightModeAdjustButton}
                  onPress={() =>
                    handleNightModeIntensityChange(Math.max(nightModeIntensity - 0.1, 0.1))
                  }
                  disabled={nightModeIntensity <= 0.1}>
                  <Text style={styles.nightModeButtonText}>-</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.nightModeAdjustButton}
                  onPress={() =>
                    handleNightModeIntensityChange(Math.min(nightModeIntensity + 0.1, 0.9))
                  }
                  disabled={nightModeIntensity >= 0.9}>
                  <Text style={styles.nightModeButtonText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
        {/* Night Mode Toggle - Positioned in top right */}
        <TouchableOpacity
          style={[styles.nightModeButton, nightModeEnabled && styles.nightModeButtonActive]}
          onPress={toggleNightMode}>
          <MaterialIcons
            name={nightModeEnabled ? 'nightlight-round' : 'wb-sunny'}
            size={24}
            color={nightModeEnabled ? '#FFD700' : '#007AFF'}
          />
        </TouchableOpacity>

        {/* Help Button */}
        <TouchableOpacity style={styles.helpButton} onPress={() => setHelpVisible(!helpVisible)}>
          <MaterialIcons name="help-outline" size={24} color="#007AFF" />
        </TouchableOpacity>

        {/* Help Tooltip */}
        {helpVisible && (
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
        )}

        <ViewShot ref={viewShotRef} style={styles.canvasContainer}>
          {/* Main image */}
          <View style={[StyleSheet.absoluteFill, styles.imageContainer]}>
            <Image source={{ uri: imgSource }} style={styles.image} resizeMode="contain" />
          </View>

          {/* Night Mode Overlay - rendered on top of the image but below the lights */}
          {nightModeEnabled && (
            <View style={[StyleSheet.absoluteFill, styles.nightModeLayer]}>
              <View
                style={[
                  StyleSheet.absoluteFill,
                  {
                    backgroundColor: '#0a1632',
                    opacity: nightModeIntensity,
                  },
                ]}
                pointerEvents="none"
              />
            </View>
          )}

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

        {/* Floating Reference Button */}
        <FloatingReferenceButton
          hasReference={hasReference}
          isSettingReference={isSettingReference}
          onStartReference={startReferenceMode}
          onClearReference={clearReference}
          referenceLength={referenceLength}
        />

        {/* Floating Action Menu */}
        <FloatingActionMenu
          onClearAll={clearAllLightStrings}
          onExport={handleExport}
          canUndo={!!deletedString}
          onUndo={handleUndo}
          isExporting={isExporting}
        />

        {/* Floating Selection Controls */}
        <FloatingSelectionControls
          selectedStringId={selectedStringId}
          selectedStringEndpoint={selectedStringEndpoint}
          onDeleteString={handleDeleteString}
          onDeselectString={deselectLightString}
        />

        {/* Collapsible Bottom Sheet for Light Picker */}
        <CollapsibleBottomSheet
          lightAssets={lightAssets}
          selectedAsset={selectedAsset}
          onSelectAsset={setSelectedAsset}
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
  nightModeLayer: {
    zIndex: 5, // Above the image but below the lights
  },
  lightsLayer: {
    zIndex: 10, // Above both the image and night mode layer
  },
  helpButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 1000,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  nightModeButton: {
    position: 'absolute',
    top: 12,
    right: 60, // Positioned to the left of the help button
    zIndex: 1000,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  nightModeButtonActive: {
    backgroundColor: 'rgba(25, 25, 50, 0.8)',
  },
  nightModeControlsContainer: {
    position: 'absolute',
    top: 20,
    left: 20,
    zIndex: 20, // Above other elements
  },
  nightModeControlsBox: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
  },
  nightModeControlsLabel: {
    color: 'white',
    fontSize: 12,
    marginBottom: 5,
    textAlign: 'center',
  },
  nightModeButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 100,
    marginTop: 5,
  },
  nightModeAdjustButton: {
    backgroundColor: '#007AFF',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nightModeButtonText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  helpTooltip: {
    position: 'absolute',
    top: 60,
    left: 15,
    right: 15,
    backgroundColor: 'rgba(0,0,0,0.75)',
    borderRadius: 10,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 900,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  helpText: {
    color: '#fff',
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    paddingRight: 8,
  },
  closeHelp: {
    padding: 4,
  },
});
