import { MaterialIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { TouchableOpacity, View } from 'react-native';

import { LightSelectionPopover } from './LightSelectionPopover';
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
  // NEW: Mode toggle functionality
  interactionMode,
  onModeToggle,
  // Custom asset functionality
  onCreateCustomAsset,
  onRemoveCustomAsset,
}) {
  const [showLightPopover, setShowLightPopover] = useState(false);
  const [showRemeasureModal, setShowRemeasureModal] = useState(false);

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

  const handleModeToggle = () => {
    // Toggle between string and tap modes only (wreath mode is auto-activated)
    const newMode = interactionMode === 'tap' ? 'string' : 'tap';
    onModeToggle(newMode);
  };

  return (
    <>
      <View style={{ 
        backgroundColor: '#333',
        marginHorizontal: 60,
        marginBottom: 40,
        borderRadius: 20,
        paddingVertical: 16,
        paddingHorizontal: 20,
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
          style={{ padding: 8 }} 
          onPress={handleRulerPress}
        >
          <MaterialIcons 
            name="straighten" 
            size={28} 
            color={hasReference ? '#4CAF50' : (isSettingReference ? '#FF9800' : 'white')} 
          />
        </TouchableOpacity>
        
        {/* Mode Toggle - NEW */}
        <TouchableOpacity 
          style={{ padding: 8 }} 
          onPress={handleModeToggle}
        >
          <MaterialIcons 
            name={interactionMode === 'tap' ? 'touch-app' : 'timeline'} 
            size={28} 
            color={interactionMode === 'tap' ? '#FF9800' : 'white'} 
          />
        </TouchableOpacity>
        
        {/* Light Bulb */}
        <TouchableOpacity 
          style={{ padding: 8 }} 
          onPress={handleLightPress}
        >
          <MaterialIcons 
            name="lightbulb-outline" 
            size={28} 
            color={selectedAsset ? '#4CAF50' : 'white'} 
          />
        </TouchableOpacity>
        
        {/* Back/Undo Arrow */}
        <TouchableOpacity 
          style={{ padding: 8 }} 
          onPress={onUndo}
          disabled={!canUndo}
        >
          <MaterialIcons 
            name="undo" 
            size={28} 
            color={canUndo ? 'white' : '#666'} 
          />
        </TouchableOpacity>
      </View>

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