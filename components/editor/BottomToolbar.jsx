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
  // Tutorial system
  tutorial,
  // Layout props
  isLandscape,
}) {
  const [showLightPopover, setShowLightPopover] = useState(false);
  const [showModePopover, setShowModePopover] = useState(false);
  const [showRemeasureModal, setShowRemeasureModal] = useState(false);
  
  // Device detection for responsive design
  const { width } = Dimensions.get('window');
  const isTablet = width >= 768;

  const handleRulerPress = () => {
    // Handle tutorial action when ruler is clicked
    if (tutorial?.handleAction) {
      tutorial.handleAction('ruler_icon_clicked');
    }
    
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
    // Handle tutorial action when mode menu opens
    if (tutorial?.handleAction) {
      tutorial.handleAction('mode_menu_opened');
    }
  };

  return (
    <>
      <View style={{ 
        backgroundColor: '#333',
        marginHorizontal: isTablet && isLandscape ? 60 : isTablet ? 120 : 60,
        marginBottom: isTablet && isLandscape ? 20 : isTablet ? 60 : 40,
        borderRadius: isTablet ? 30 : 20,
        paddingVertical: isTablet && isLandscape ? 16 : isTablet ? 24 : 16,
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
              interactionMode === 'decor' ? 'star' : 
              interactionMode === 'tap' ? 'touch-app' : 
              interactionMode === 'measure' ? 'square-foot' : 
              'timeline'
            } 
            size={isTablet ? 40 : 28} 
            color={
              interactionMode === 'decor' ? '#FF9800' : 
              interactionMode === 'tap' ? '#00BCD4' : 
              interactionMode === 'string' ? '#E91E63' :
              interactionMode === 'measure' ? '#4CAF50' :
              'white'
            } 
          />
        </TouchableOpacity>
        
        {/* Asset Categories */}
        <TouchableOpacity 
          style={{ 
            padding: isTablet ? 16 : 8,
            borderRadius: isTablet ? 20 : 12,
            backgroundColor: 'transparent',
          }} 
          onPress={handleLightPress}
        >
          <MaterialIcons 
            name="category" 
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
        onClose={() => {
          setShowModePopover(false);
          // Handle tutorial action when mode menu closes
          if (tutorial?.handleAction) {
            tutorial.handleAction('mode_selection_closed');
          }
        }}
        currentMode={interactionMode}
        onSelectMode={(mode) => {
          onModeToggle(mode);
          // Handle tutorial actions for mode selection
          if (tutorial?.handleAction) {
            if (mode === 'measure') {
              tutorial.handleAction('measure_mode_selected');
            } else if (mode === 'string') {
              tutorial.handleAction('string_mode_selected');
            }
          }
        }}
        tutorialMessage={
          tutorial?.currentStep?.id === 'select_measure_mode' 
            ? "Select 'Measure Mode' to start setting up your reference measurement."
            : tutorial?.currentStep?.id === 'switch_to_string_mode'
            ? "Choose 'String Mode' to start placing lights."
            : tutorial?.currentStep?.id === 'open_measure_mode'
            ? "Select 'Measure Mode' to start measuring distances."
            : null
        }
        tutorialRestrictToMode={
          tutorial?.currentStep?.id === 'select_measure_mode' 
            ? 'measure'
            : tutorial?.currentStep?.id === 'switch_to_string_mode'
            ? 'string'
            : tutorial?.currentStep?.id === 'open_measure_mode'
            ? 'measure'
            : null
        }
      />

      {/* Light Selection Popover */}
      <LightSelectionPopover
        visible={showLightPopover}
        onClose={() => {
          setShowLightPopover(false);
          // Handle tutorial action when light selection menu closes
          if (tutorial?.handleAction) {
            tutorial.handleAction('category_selection_closed');
          }
        }}
        lightAssets={lightAssets}
        selectedAsset={selectedAsset}
        onSelectAsset={(asset) => {
          onSelectAsset(asset);
          setShowLightPopover(false);
          // Also handle tutorial action when light is selected (another way to close)
          if (tutorial?.handleAction) {
            tutorial.handleAction('category_selection_closed');
          }
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