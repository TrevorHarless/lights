import { MaterialIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Dimensions, TouchableOpacity, View } from 'react-native';

import { LightSelectionPopover } from './LightSelectionPopover';
import { ModeSelectionPopover } from './ModeSelectionPopover';
import { RemeasureConfirmModal } from './RemeasureConfirmModal';

export function BottomToolbar({
  // Set Scale functionality
  hasReference,
  isSettingReference,
  onStartReference,
  onClearReference,
  onCancelReference,
  // Light selection functionality
  lightAssets,
  selectedAsset,
  onSelectAsset,
  getAssetsByCategory,
  getCategories,
  getLightRenderStyle,
  // Undo functionality
  canUndo,
  onUndo,
  // Mode toggle functionality
  interactionMode,
  onModeToggle,
  // Custom asset functionality
  onCreateCustomAsset,
  onRemoveCustomAsset,
}) {
  const [showLightPopover, setShowLightPopover] = useState(false);
  const [showModePopover, setShowModePopover] = useState(false);
  const [showRemeasureModal, setShowRemeasureModal] = useState(false);
  
  // Device detection for responsive design
  const { width } = Dimensions.get('window');
  const isTablet = width >= 768;

  const handleRulerPress = () => {
    if (isSettingReference) {
      // Cancel the reference setting process
      onCancelReference();
    } else if (hasReference) {
      // Show confirmation modal before clearing existing reference
      setShowRemeasureModal(true);
    } else {
      // Start new reference
      onStartReference();
    }
  };

  const handleRemeasureConfirm = () => {
    setShowRemeasureModal(false);
    onClearReference();
    onStartReference();
  };

  const handleRemeasureCancel = () => {
    setShowRemeasureModal(false);
  };

  const handleLightPress = () => {
    setShowLightPopover(true);
  };

  const handleModePress = () => {
    setShowModePopover(true);
  };

  return (
    <>
      <View style={{ 
        backgroundColor: '#333',
        marginHorizontal: isTablet ? 120 : 60,
        marginBottom: isTablet ? 60 : 40,
        borderRadius: isTablet ? 30 : 20,
        paddingVertical: isTablet ? 24 : 16,
        paddingHorizontal: isTablet ? 32 : 20,
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
      }}>
        {/* Ruler/Measurement Tool */}
        <TouchableOpacity 
          style={{ 
            padding: isTablet ? 16 : 8,
            borderRadius: isTablet ? 20 : 12,
            backgroundColor: 'transparent',
          }} 
          onPress={handleRulerPress}
        >
          <MaterialIcons 
            name="straighten" 
            size={isTablet ? 40 : 28} 
            color={hasReference ? '#4CAF50' : (isSettingReference ? '#FF9800' : 'white')} 
          />
        </TouchableOpacity>
        
        {/* Mode Selection */}
        <TouchableOpacity 
          style={{ 
            padding: isTablet ? 16 : 8,
            borderRadius: isTablet ? 20 : 12,
            backgroundColor: 'transparent',
          }} 
          onPress={handleModePress}
        >
          <MaterialIcons 
            name={
              interactionMode === 'wreath' ? 'circle' : 
              interactionMode === 'tap' ? 'touch-app' : 
              'timeline'
            } 
            size={isTablet ? 40 : 28} 
            color={
              interactionMode === 'wreath' ? '#FF9800' : 
              interactionMode === 'tap' ? '#00BCD4' : 
              interactionMode === 'string' ? '#E91E63' :
              'white'
            } 
          />
        </TouchableOpacity>
        
        {/* Light Bulb */}
        <TouchableOpacity 
          style={{ 
            padding: isTablet ? 16 : 8,
            borderRadius: isTablet ? 20 : 12,
            backgroundColor: 'transparent',
          }} 
          onPress={handleLightPress}
        >
          <MaterialIcons 
            name="lightbulb-outline" 
            size={isTablet ? 40 : 28} 
            color={selectedAsset ? '#4CAF50' : 'white'} 
          />
        </TouchableOpacity>
        
        {/* Back/Undo Arrow */}
        <TouchableOpacity 
          style={{ 
            padding: isTablet ? 16 : 8,
            borderRadius: isTablet ? 20 : 12,
            backgroundColor: 'transparent',
          }} 
          onPress={onUndo}
          disabled={!canUndo}
        >
          <MaterialIcons 
            name="undo" 
            size={isTablet ? 40 : 28} 
            color={canUndo ? 'white' : '#666'} 
          />
        </TouchableOpacity>
      </View>

      {/* Mode Selection Popover */}
      <ModeSelectionPopover
        visible={showModePopover}
        onClose={() => setShowModePopover(false)}
        currentMode={interactionMode}
        onSelectMode={onModeToggle}
      />

      {/* Light Selection Popover */}
      <LightSelectionPopover
        visible={showLightPopover}
        onClose={() => setShowLightPopover(false)}
        lightAssets={lightAssets}
        selectedAsset={selectedAsset}
        onSelectAsset={(asset) => {
          onSelectAsset(asset);
          setShowLightPopover(false);
        }}
        getAssetsByCategory={getAssetsByCategory}
        getCategories={getCategories}
        getLightRenderStyle={getLightRenderStyle}
        onCreateCustomAsset={onCreateCustomAsset}
        onRemoveCustomAsset={onRemoveCustomAsset}
      />

      {/* Remeasure Confirmation Modal */}
      <RemeasureConfirmModal
        visible={showRemeasureModal}
        onCancel={handleRemeasureCancel}
        onConfirm={handleRemeasureConfirm}
      />
    </>
  );
}