import { MaterialIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const PRESET_COLORS = [
  '#FF0000', // Red
  '#00FF00', // Green  
  '#0000FF', // Blue
  '#FFFF00', // Yellow
  '#FF00FF', // Magenta
  '#00FFFF', // Cyan
  '#FF8000', // Orange
  '#8000FF', // Purple
  '#FFFFFF', // White
  '#FFE4B5', // Warm White
];

const EXTENDED_COLORS = [
  // Reds
  '#FF0000', '#FF3333', '#FF6666', '#FF9999', '#FFCCCC',
  '#CC0000', '#990000', '#660000', '#330000', '#FF4444',
  // Oranges
  '#FF8000', '#FFAA00', '#FFCC00', '#FFDD00', '#FFEE00',
  '#CC6600', '#AA5500', '#884400', '#663300', '#FF7722',
  // Yellows
  '#FFFF00', '#FFFF33', '#FFFF66', '#FFFF99', '#FFFFCC',
  '#CCCC00', '#999900', '#666600', '#333300', '#FFFF44',
  // Greens
  '#00FF00', '#33FF33', '#66FF66', '#99FF99', '#CCFFCC',
  '#00CC00', '#009900', '#006600', '#003300', '#44FF44',
  // Blues
  '#0000FF', '#3333FF', '#6666FF', '#9999FF', '#CCCCFF',
  '#0000CC', '#000099', '#000066', '#000033', '#4444FF',
  // Purples
  '#8000FF', '#9933FF', '#AA66FF', '#BB99FF', '#CCCCFF',
  '#6600CC', '#550099', '#440066', '#330033', '#7744FF',
  // Whites & Neutrals
  '#FFFFFF', '#EEEEEE', '#DDDDDD', '#CCCCCC', '#BBBBBB',
  '#AAAAAA', '#999999', '#888888', '#777777', '#666666',
  // Special Christmas/Holiday colors
  '#FFE4B5', '#FFF8DC', '#F0E68C', '#DDA0DD', '#98FB98',
];

const SIZE_PRESETS = [
  { label: 'Mini', value: 8 },
  { label: 'Small', value: 10 },
  { label: 'Medium', value: 12 },
  { label: 'Large', value: 16 },
  { label: 'Extra Large', value: 20 },
];

const SPACING_PRESETS = [
  { label: 'Close', value: 20 },
  { label: 'Standard', value: 36 },
  { label: 'Wide', value: 50 },
];

export function CustomLightModal({ 
  visible, 
  onClose, 
  onCreateAsset,
  getLightRenderStyle 
}) {
  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState('#FFFFFF');
  const [selectedSize, setSelectedSize] = useState(12);
  const [selectedSpacing, setSelectedSpacing] = useState(36);
  const [customColor, setCustomColor] = useState('');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [isPatternMode, setIsPatternMode] = useState(false);
  const [patternColors, setPatternColors] = useState(['#FFFFFF']);
  const [editingPatternIndex, setEditingPatternIndex] = useState(null);

  const handleCreate = () => {
    if (!name.trim()) {
      return;
    }

    const config = {
      baseSize: selectedSize,
      spacing: selectedSpacing,
      shadowOpacity: 0.8,
      isPattern: isPatternMode,
      patternColors: isPatternMode ? patternColors : undefined,
      backgroundColor: !isPatternMode ? (customColor || selectedColor) : undefined,
      shadowColor: !isPatternMode ? (customColor || selectedColor) : undefined,
    };

    const asset = onCreateAsset(name.trim(), config);
    
    // Reset form
    setName('');
    setSelectedColor('#FFFFFF');
    setSelectedSize(12);
    setSelectedSpacing(36);
    setCustomColor('');
    setShowColorPicker(false);
    setIsPatternMode(false);
    setPatternColors(['#FFFFFF']);
    setEditingPatternIndex(null);
    
    onClose();
    return asset;
  };

  const handleColorPickerChange = (color) => {
    if (editingPatternIndex !== null) {
      // Update pattern color
      const newPattern = [...patternColors];
      newPattern[editingPatternIndex] = color;
      setPatternColors(newPattern);
      setEditingPatternIndex(null);
    } else {
      // Update single color
      setCustomColor(color);
      setSelectedColor(''); // Clear preset selection when using color picker
    }
  };

  const addPatternColor = () => {
    setPatternColors([...patternColors, '#FFFFFF']);
  };

  const removePatternColor = (index) => {
    if (patternColors.length > 1) {
      setPatternColors(patternColors.filter((_, i) => i !== index));
    }
  };

  const editPatternColor = (index) => {
    setEditingPatternIndex(index);
    setShowColorPicker(true);
  };

  // Generate preview - show multiple lights for patterns
  const generatePreview = () => {
    const lightSize = selectedSize * 1.8;
    
    if (isPatternMode) {
      // Show first 5 lights of the pattern
      return patternColors.slice(0, 5).map((color, index) => (
        <View
          key={index}
          style={{
            width: lightSize * 0.8,
            height: lightSize * 0.8,
            borderRadius: lightSize * 0.4,
            backgroundColor: color,
            shadowColor: color,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.8,
            shadowRadius: selectedSize * 0.3,
            marginHorizontal: 2,
          }}
        />
      ));
    } else {
      // Single color preview
      return (
        <View
          style={{
            width: lightSize,
            height: lightSize,
            borderRadius: lightSize * 0.5,
            backgroundColor: customColor || selectedColor,
            shadowColor: customColor || selectedColor,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.8,
            shadowRadius: selectedSize * 0.4,
          }}
        />
      );
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <Text style={styles.title}>Create Custom Light</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <MaterialIcons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Preview */}
            <View style={styles.previewSection}>
              <Text style={styles.sectionTitle}>Preview</Text>
              <View style={[styles.previewContainer, isPatternMode && styles.patternPreviewContainer]}>
                {generatePreview()}
              </View>
            </View>

            {/* Name Input */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Name</Text>
              <TextInput
                style={styles.textInput}
                value={name}
                onChangeText={setName}
                placeholder="Enter light name"
                placeholderTextColor="#999"
              />
            </View>

            {/* Mode Toggle */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Type</Text>
              <View style={styles.modeToggle}>
                <TouchableOpacity
                  style={[styles.modeButton, !isPatternMode && styles.selectedModeButton]}
                  onPress={() => setIsPatternMode(false)}
                >
                  <Text style={[styles.modeButtonText, !isPatternMode && styles.selectedModeButtonText]}>
                    Single Color
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modeButton, isPatternMode && styles.selectedModeButton]}
                  onPress={() => setIsPatternMode(true)}
                >
                  <Text style={[styles.modeButtonText, isPatternMode && styles.selectedModeButtonText]}>
                    Pattern
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Color Selection or Pattern Creation */}
            {isPatternMode ? (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Pattern Colors</Text>
                <View style={styles.patternColorsContainer}>
                  {patternColors.map((color, index) => (
                    <View key={index} style={styles.patternColorItem}>
                      <TouchableOpacity
                        style={[styles.patternColorSwatch, { backgroundColor: color }]}
                        onPress={() => editPatternColor(index)}
                      />
                      <Text style={styles.patternColorIndex}>{index + 1}</Text>
                      {patternColors.length > 1 && (
                        <TouchableOpacity
                          style={styles.removePatternColor}
                          onPress={() => removePatternColor(index)}
                        >
                          <MaterialIcons name="close" size={14} color="#EF4444" />
                        </TouchableOpacity>
                      )}
                    </View>
                  ))}
                  
                  {patternColors.length < 8 && (
                    <TouchableOpacity
                      style={styles.addPatternColor}
                      onPress={addPatternColor}
                    >
                      <MaterialIcons name="add" size={20} color="#3B82F6" />
                    </TouchableOpacity>
                  )}
                </View>
                <Text style={styles.patternHint}>
                  Tap colors to edit, pattern repeats every {patternColors.length} light{patternColors.length !== 1 ? 's' : ''}
                </Text>
              </View>
            ) : (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Color</Text>
                <View style={styles.colorGrid}>
                  {PRESET_COLORS.map((color) => (
                    <TouchableOpacity
                      key={color}
                      style={[
                        styles.colorOption,
                        { backgroundColor: color },
                        selectedColor === color && !customColor && styles.selectedColorOption
                      ]}
                      onPress={() => {
                        setSelectedColor(color);
                        setCustomColor('');
                      }}
                    />
                  ))}
                </View>
              
              {/* More Colors Button */}
              <TouchableOpacity
                style={styles.moreColorsButton}
                onPress={() => setShowColorPicker(true)}
              >
                <MaterialIcons name="palette" size={18} color="#3B82F6" />
                <Text style={styles.moreColorsText}>More Colors</Text>
                <MaterialIcons name="expand-more" size={18} color="#3B82F6" />
              </TouchableOpacity>
              
              {/* Custom Hex Input */}
              <Text style={styles.subsectionTitle}>Or enter hex color:</Text>
              <TextInput
                style={styles.textInput}
                value={customColor}
                onChangeText={setCustomColor}
                placeholder="#FF0000"
                placeholderTextColor="#999"
                autoCapitalize="characters"
              />
              </View>
            )}

            {/* Size Selection */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Size</Text>
              <View style={styles.optionGrid}>
                {SIZE_PRESETS.map((size) => (
                  <TouchableOpacity
                    key={size.value}
                    style={[
                      styles.optionButton,
                      selectedSize === size.value && styles.selectedOption
                    ]}
                    onPress={() => setSelectedSize(size.value)}
                  >
                    <Text style={[
                      styles.optionText,
                      selectedSize === size.value && styles.selectedOptionText
                    ]}>
                      {size.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Spacing Selection */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Spacing</Text>
              <View style={styles.optionGrid}>
                {SPACING_PRESETS.map((spacing) => (
                  <TouchableOpacity
                    key={spacing.value}
                    style={[
                      styles.optionButton,
                      selectedSpacing === spacing.value && styles.selectedOption
                    ]}
                    onPress={() => setSelectedSpacing(spacing.value)}
                  >
                    <Text style={[
                      styles.optionText,
                      selectedSpacing === spacing.value && styles.selectedOptionText
                    ]}>
                      {spacing.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>

          {/* Create Button */}
          <TouchableOpacity
            style={[styles.createButton, !name.trim() && styles.disabledButton]}
            onPress={handleCreate}
            disabled={!name.trim()}
          >
            <Text style={[styles.createButtonText, !name.trim() && styles.disabledButtonText]}>
              Create Light
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Extended Color Palette Modal */}
      <Modal
        visible={showColorPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowColorPicker(false)}
      >
        <View style={styles.colorPickerOverlay}>
          <View style={styles.colorPickerModal}>
            <View style={styles.colorPickerHeader}>
              <Text style={styles.colorPickerTitle}>Choose Color</Text>
              <TouchableOpacity 
                onPress={() => setShowColorPicker(false)}
                style={styles.closeButton}
              >
                <MaterialIcons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.colorPickerContainer} showsVerticalScrollIndicator={false}>
              <View style={styles.extendedColorGrid}>
                {EXTENDED_COLORS.map((color, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.extendedColorOption,
                      { backgroundColor: color },
                      (customColor === color || (!customColor && selectedColor === color)) && styles.selectedExtendedColor
                    ]}
                    onPress={() => {
                      handleColorPickerChange(color);
                      setShowColorPicker(false);
                    }}
                  >
                    {(customColor === color || (!customColor && selectedColor === color)) && (
                      <MaterialIcons name="check" size={16} color={color === '#FFFFFF' ? '#333' : 'white'} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: 20,
    width: '90%',
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    padding: 20,
  },
  previewSection: {
    marginBottom: 24,
  },
  previewContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 80,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    marginTop: 8,
  },
  previewLight: {
    // Dynamic styles applied from previewStyle
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  subsectionTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginTop: 12,
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#333',
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  colorOption: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 3,
    borderColor: 'transparent',
  },
  selectedColorOption: {
    borderColor: '#3B82F6',
  },
  optionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#F8F9FA',
  },
  selectedOption: {
    backgroundColor: '#EBF4FF',
    borderColor: '#3B82F6',
  },
  optionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  selectedOptionText: {
    color: '#3B82F6',
  },
  createButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    paddingVertical: 16,
    margin: 20,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#E5E7EB',
  },
  createButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButtonText: {
    color: '#9CA3AF',
  },
  moreColorsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#EBF4FF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#3B82F6',
    gap: 6,
    marginTop: 12,
    marginBottom: 8,
  },
  moreColorsText: {
    color: '#3B82F6',
    fontWeight: '500',
    fontSize: 14,
  },
  colorPickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  colorPickerModal: {
    backgroundColor: 'white',
    borderRadius: 20,
    width: '85%',
    maxWidth: 400,
    paddingBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  colorPickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  colorPickerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  colorPickerContainer: {
    padding: 20,
    maxHeight: 400,
  },
  extendedColorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
  },
  extendedColorOption: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 2,
  },
  selectedExtendedColor: {
    borderColor: '#3B82F6',
    borderWidth: 3,
  },
  patternPreviewContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modeToggle: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 2,
  },
  modeButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
  },
  selectedModeButton: {
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  modeButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  selectedModeButtonText: {
    color: '#3B82F6',
  },
  patternColorsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 8,
  },
  patternColorItem: {
    alignItems: 'center',
    position: 'relative',
  },
  patternColorSwatch: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  patternColorIndex: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 4,
  },
  removePatternColor: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addPatternColor: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: '#3B82F6',
    borderStyle: 'dashed',
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  patternHint: {
    fontSize: 12,
    color: '#6B7280',
    fontStyle: 'italic',
    marginTop: 8,
    textAlign: 'center',
  },
});