import { MaterialIcons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import React, { useState } from 'react';
import {
  Dimensions,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { runOnJS, useSharedValue } from 'react-native-reanimated';
import ColorPicker, {
  HSLSaturationSlider,
  HueSlider,
  LuminanceSlider,
  OpacitySlider
} from 'reanimated-color-picker';

const PRESET_COLORS = [

];

// Generate custom swatches for the color picker
const customSwatches = [
  ...PRESET_COLORS,
  // Additional swatches
];

// Size range: from extremely small (4) to extremely large (32)
const MIN_SIZE = 1;
const MAX_SIZE = 32;

// Spacing range: from very close (10) to very wide (80)
const MIN_SPACING = 10;
const MAX_SPACING = 80;

export function CustomLightModal({ 
  visible, 
  onClose, 
  onCreateAsset,
  getLightRenderStyle 
}) {
  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState('#FF0000');
  const [selectedSize, setSelectedSize] = useState(12);
  const [selectedSpacing, setSelectedSpacing] = useState(36);
  const [customColor, setCustomColor] = useState('');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [isPatternMode, setIsPatternMode] = useState(false);
  const [patternColors, setPatternColors] = useState(['#FF0000']);
  const [editingPatternIndex, setEditingPatternIndex] = useState(null);
  
  // Reanimated color picker state
  const currentColor = useSharedValue(customColor || selectedColor);
  const [resultColor, setResultColor] = useState(customColor || selectedColor);
  
  // Device detection for responsive design
  const { width } = Dimensions.get('window');
  const isTablet = width >= 768;

  const handleCreate = async () => {
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

    try {
      const asset = await onCreateAsset(name.trim(), config);
      
      // Reset form
      setName('');
      setSelectedColor('#FF0000');
      setSelectedSize(12);
      setSelectedSpacing(36);
      setCustomColor('');
      setShowColorPicker(false);
      setIsPatternMode(false);
      setPatternColors(['#FF0000']);
      setEditingPatternIndex(null);
      
      onClose();
      return asset;
    } catch (error) {
      console.error('Error creating custom light:', error);
      // Could show an error message to user here
    }
  };

  // Color picker handlers for reanimated-color-picker
  const onColorChange = (color) => {
    'worklet';
    currentColor.value = color.hex;
    // Update preview in real-time
    runOnJS(setResultColor)(color.hex);
  };

  const onColorPick = (color) => {
    setResultColor(color.hex);
    if (editingPatternIndex !== null) {
      // Update pattern color
      const newPattern = [...patternColors];
      newPattern[editingPatternIndex] = color.hex;
      setPatternColors(newPattern);
      setEditingPatternIndex(null);
    } else {
      // Update single color
      setCustomColor(color.hex);
      setSelectedColor(''); // Clear preset selection when using color picker
    }
  };


  const addPatternColor = () => {
    setPatternColors([...patternColors, '#FF0000']);
  };

  const removePatternColor = (index) => {
    if (patternColors.length > 1) {
      setPatternColors(patternColors.filter((_, i) => i !== index));
    }
  };

  const editPatternColor = (index) => {
    setEditingPatternIndex(index);
    const colorToEdit = patternColors[index];
    setResultColor(colorToEdit);
    currentColor.value = colorToEdit;
    setShowColorPicker(true);
  };

  const openColorPicker = () => {
    const colorToEdit = customColor || selectedColor;
    setResultColor(colorToEdit);
    currentColor.value = colorToEdit;
    setShowColorPicker(true);
  };

  // Generate preview - show light string with proper spacing
  const generatePreview = () => {
    // Match the actual light rendering formula: baseSize * GLOW_MULTIPLIER * lightScale
    // GLOW_MULTIPLIER = 2, lightScale = getLightSizeScale() (usually 1 unless reference scale is set)
    // For preview, we assume lightScale = 1 and scale everything proportionally
    const previewScale = 1; // Scale everything down for preview container
    const lightSize = selectedSize * 2 * previewScale; // Match actual rendering formula, scaled for preview
    const spacing = selectedSpacing * previewScale; // Scale spacing by same factor as light size
    const numLights = isPatternMode ? Math.min(patternColors.length, 3) : 3; // Show 3 lights max
    
    if (isPatternMode) {
      // Show pattern lights with spacing
      return patternColors.slice(0, numLights).map((color, index) => (
        <View
          key={index}
          style={{
            width: lightSize,
            height: lightSize,
            borderRadius: lightSize * 0.5,
            backgroundColor: color,
            shadowColor: color,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.8,
            shadowRadius: selectedSize * 0.4 * 0.6, // Match actual formula: baseSize * 0.4 * scale
            marginRight: index < numLights - 1 ? (spacing - lightSize) : 0,
          }}
        />
      ));
    } else {
      // Single color light string
      const lightColor = customColor || selectedColor;
      return Array.from({ length: numLights }, (_, index) => (
        <View
          key={index}
          style={{
            width: lightSize,
            height: lightSize,
            borderRadius: lightSize * 0.5,
            backgroundColor: lightColor,
            shadowColor: lightColor,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.8,
            shadowRadius: selectedSize * 0.4 * 0.6, // Match actual formula: baseSize * 0.4 * scale
            marginRight: index < numLights - 1 ? (spacing - lightSize) : 0,
          }}
        />
      ));
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={{
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
      }}>
        <View style={{
          backgroundColor: 'white',
          borderRadius: isTablet ? 24 : 20,
          width: isTablet ? 700 : '90%',
          maxWidth: isTablet ? 700 : '90%',
          maxHeight: isTablet ? '85%' : '80%',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.25,
          shadowRadius: 20,
          elevation: 10,
        }}>
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: isTablet ? 28 : 20,
            borderBottomWidth: 1,
            borderBottomColor: '#E5E7EB',
          }}>
            <Text style={{
              fontSize: isTablet ? 24 : 18,
              fontWeight: '600',
              color: '#333',
            }}>Create Custom Light</Text>
            <TouchableOpacity onPress={onClose} style={{
              padding: isTablet ? 8 : 4,
              width: isTablet ? 44 : 32,
              height: isTablet ? 44 : 32,
              borderRadius: isTablet ? 22 : 16,
              backgroundColor: '#f3f4f6',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <MaterialIcons name="close" size={isTablet ? 28 : 24} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Sticky Preview */}
          <View style={{
            paddingHorizontal: isTablet ? 28 : 20,
            paddingTop: isTablet ? 20 : 16,
            paddingBottom: isTablet ? 16 : 12,
            backgroundColor: 'white',
            borderBottomWidth: 1,
            borderBottomColor: '#F3F4F6',
          }}>
            <Text style={{
              fontSize: isTablet ? 20 : 16,
              fontWeight: '600',
              color: '#333',
              marginBottom: isTablet ? 16 : 12,
            }}>Preview</Text>
            <View style={{
              alignItems: 'center',
              justifyContent: 'center',
              height: 142,
              backgroundColor: '#2d2d2d',
              borderRadius: isTablet ? 16 : 12,
              flexDirection: 'row',
              paddingHorizontal: isTablet ? 20 : 16,
            }}>
              {generatePreview()}
            </View>
          </View>

          <ScrollView style={{
            padding: isTablet ? 28 : 20,
          }} showsVerticalScrollIndicator={false}>

            {/* Name Input */}
            <View style={{
              marginBottom: isTablet ? 32 : 24,
            }}>
              <Text style={{
                fontSize: isTablet ? 20 : 16,
                fontWeight: '600',
                color: '#333',
                marginBottom: isTablet ? 16 : 12,
              }}>Name</Text>
              <TextInput
                style={{
                  borderWidth: 1,
                  borderColor: '#E5E7EB',
                  borderRadius: isTablet ? 12 : 8,
                  paddingHorizontal: isTablet ? 16 : 12,
                  paddingVertical: isTablet ? 14 : 10,
                  fontSize: isTablet ? 18 : 16,
                  color: '#333',
                }}
                value={name}
                onChangeText={setName}
                placeholder="Enter light name"
                placeholderTextColor="#999"
              />
            </View>

            {/* Mode Toggle */}
            <View style={{
              marginBottom: isTablet ? 32 : 24,
            }}>
              <Text style={{
                fontSize: isTablet ? 20 : 16,
                fontWeight: '600',
                color: '#333',
                marginBottom: isTablet ? 16 : 12,
              }}>Type</Text>
              <View style={{
                flexDirection: 'row',
                backgroundColor: '#F3F4F6',
                borderRadius: isTablet ? 12 : 8,
                padding: isTablet ? 4 : 2,
              }}>
                <TouchableOpacity
                  style={{
                    flex: 1,
                    paddingVertical: isTablet ? 12 : 8,
                    paddingHorizontal: isTablet ? 20 : 16,
                    borderRadius: isTablet ? 8 : 6,
                    alignItems: 'center',
                    backgroundColor: !isPatternMode ? 'white' : 'transparent',
                    shadowColor: !isPatternMode ? '#000' : 'transparent',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: !isPatternMode ? 0.1 : 0,
                    shadowRadius: 2,
                    elevation: !isPatternMode ? 2 : 0,
                  }}
                  onPress={() => setIsPatternMode(false)}
                >
                  <Text style={{
                    fontSize: isTablet ? 16 : 14,
                    fontWeight: '500',
                    color: !isPatternMode ? '#3B82F6' : '#6B7280',
                  }}>
                    Single Color
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{
                    flex: 1,
                    paddingVertical: isTablet ? 12 : 8,
                    paddingHorizontal: isTablet ? 20 : 16,
                    borderRadius: isTablet ? 8 : 6,
                    alignItems: 'center',
                    backgroundColor: isPatternMode ? 'white' : 'transparent',
                    shadowColor: isPatternMode ? '#000' : 'transparent',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: isPatternMode ? 0.1 : 0,
                    shadowRadius: 2,
                    elevation: isPatternMode ? 2 : 0,
                  }}
                  onPress={() => setIsPatternMode(true)}
                >
                  <Text style={{
                    fontSize: isTablet ? 16 : 14,
                    fontWeight: '500',
                    color: isPatternMode ? '#3B82F6' : '#6B7280',
                  }}>
                    Pattern
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Color Selection or Pattern Creation */}
            {isPatternMode ? (
              <View style={{
                marginBottom: isTablet ? 32 : 24,
              }}>
                <Text style={{
                  fontSize: isTablet ? 20 : 16,
                  fontWeight: '600',
                  color: '#333',
                  marginBottom: isTablet ? 16 : 12,
                }}>Pattern Colors</Text>
                <View style={{
                  flexDirection: 'row',
                  flexWrap: 'wrap',
                  gap: isTablet ? 16 : 12,
                  marginTop: isTablet ? 12 : 8,
                }}>
                  {patternColors.map((color, index) => (
                    <View key={index} style={{
                      alignItems: 'center',
                      position: 'relative',
                    }}>
                      <TouchableOpacity
                        style={{
                          width: isTablet ? 60 : 44,
                          height: isTablet ? 60 : 44,
                          borderRadius: isTablet ? 30 : 22,
                          backgroundColor: color,
                          borderWidth: 2,
                          borderColor: '#E5E7EB',
                        }}
                        onPress={() => editPatternColor(index)}
                      />
                      <Text style={{
                        fontSize: isTablet ? 14 : 12,
                        fontWeight: '600',
                        color: '#6B7280',
                        marginTop: isTablet ? 6 : 4,
                      }}>{index + 1}</Text>
                      {patternColors.length > 1 && (
                        <TouchableOpacity
                          style={{
                            position: 'absolute',
                            top: isTablet ? -6 : -4,
                            right: isTablet ? -6 : -4,
                            width: isTablet ? 24 : 20,
                            height: isTablet ? 24 : 20,
                            borderRadius: isTablet ? 12 : 10,
                            backgroundColor: 'white',
                            borderWidth: 1,
                            borderColor: '#EF4444',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                          onPress={() => removePatternColor(index)}
                        >
                          <MaterialIcons name="close" size={isTablet ? 16 : 14} color="#EF4444" />
                        </TouchableOpacity>
                      )}
                    </View>
                  ))}
                  
                  {patternColors.length < 8 && (
                    <TouchableOpacity
                      style={{
                        width: isTablet ? 60 : 44,
                        height: isTablet ? 60 : 44,
                        borderRadius: isTablet ? 30 : 22,
                        borderWidth: 2,
                        borderColor: '#3B82F6',
                        borderStyle: 'dashed',
                        backgroundColor: '#F8FAFC',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                      onPress={addPatternColor}
                    >
                      <MaterialIcons name="add" size={isTablet ? 28 : 20} color="#3B82F6" />
                    </TouchableOpacity>
                  )}
                </View>
                <Text style={{
                  fontSize: isTablet ? 14 : 12,
                  color: '#6B7280',
                  fontStyle: 'italic',
                  marginTop: isTablet ? 12 : 8,
                  textAlign: 'center',
                }}>
                  Tap colors to edit
                </Text>
              </View>
            ) : (
              <View style={{
                marginBottom: isTablet ? 32 : 24,
              }}>
                <Text style={{
                  fontSize: isTablet ? 20 : 16,
                  fontWeight: '600',
                  color: '#333',
                  marginBottom: isTablet ? 16 : 12,
                }}>Color</Text>
                <View style={{
                  flexDirection: 'row',
                  flexWrap: 'wrap',
                  gap: isTablet ? 16 : 12,
                }}>
                  {PRESET_COLORS.map((color) => (
                    <TouchableOpacity
                      key={color}
                      style={{
                        width: isTablet ? 60 : 44,
                        height: isTablet ? 60 : 44,
                        borderRadius: isTablet ? 30 : 22,
                        backgroundColor: color,
                        borderWidth: 3,
                        borderColor: selectedColor === color && !customColor ? '#3B82F6' : 'transparent',
                      }}
                      onPress={() => {
                        setSelectedColor(color);
                        setCustomColor('');
                      }}
                    />
                  ))}
                </View>
              
              {/* More Colors Button */}
              <TouchableOpacity
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingHorizontal: isTablet ? 20 : 16,
                  paddingVertical: isTablet ? 14 : 10,
                  backgroundColor: '#EBF4FF',
                  borderRadius: isTablet ? 12 : 8,
                  borderWidth: 1,
                  borderColor: '#3B82F6',
                  gap: isTablet ? 8 : 6,
                  marginTop: isTablet ? 16 : 12,
                  marginBottom: isTablet ? 12 : 8,
                }}
                onPress={openColorPicker}
              >
                <MaterialIcons name="palette" size={isTablet ? 22 : 18} color="#3B82F6" />
                <Text style={{
                  color: '#3B82F6',
                  fontWeight: '500',
                  fontSize: isTablet ? 16 : 14,
                }}>Colors</Text>
                <MaterialIcons name="expand-more" size={isTablet ? 22 : 18} color="#3B82F6" />
              </TouchableOpacity>
              
              {/* Custom Hex Input */}
              <Text style={{
                fontSize: isTablet ? 16 : 14,
                fontWeight: '500',
                color: '#666',
                marginTop: isTablet ? 16 : 12,
                marginBottom: isTablet ? 12 : 8,
              }}>Or enter hex color:</Text>
              <TextInput
                style={{
                  borderWidth: 1,
                  borderColor: '#E5E7EB',
                  borderRadius: isTablet ? 12 : 8,
                  paddingHorizontal: isTablet ? 16 : 12,
                  paddingVertical: isTablet ? 14 : 10,
                  fontSize: isTablet ? 18 : 16,
                  color: '#333',
                }}
                value={customColor}
                onChangeText={setCustomColor}
                placeholder="#FF0000"
                placeholderTextColor="#999"
                autoCapitalize="characters"
              />
              </View>
            )}

            {/* Size Selection */}
            <View style={{
              marginBottom: isTablet ? 32 : 24,
            }}>
              <View style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: isTablet ? 16 : 12,
              }}>
                <Text style={{
                  fontSize: isTablet ? 20 : 16,
                  fontWeight: '600',
                  color: '#333',
                }}>Size</Text>
                <Text style={{
                  fontSize: isTablet ? 16 : 14,
                  fontWeight: '500',
                  color: '#3B82F6',
                  backgroundColor: '#EBF4FF',
                  paddingHorizontal: isTablet ? 12 : 8,
                  paddingVertical: isTablet ? 6 : 4,
                  borderRadius: isTablet ? 8 : 6,
                }}>
                  {selectedSize}px
                </Text>
              </View>
              
              <View style={{
                backgroundColor: '#F8F9FA',
                borderRadius: isTablet ? 12 : 8,
                padding: isTablet ? 16 : 12,
              }}>
                <Slider
                  style={{
                    width: '100%',
                    height: isTablet ? 50 : 40,
                  }}
                  minimumValue={MIN_SIZE}
                  maximumValue={MAX_SIZE}
                  value={selectedSize}
                  onValueChange={setSelectedSize}
                  minimumTrackTintColor="#3B82F6"
                  maximumTrackTintColor="#E5E7EB"
                  thumbStyle={{
                    backgroundColor: '#3B82F6',
                    width: isTablet ? 24 : 20,
                    height: isTablet ? 24 : 20,
                  }}
                  trackStyle={{
                    height: isTablet ? 6 : 4,
                    borderRadius: isTablet ? 3 : 2,
                  }}
                  step={1}
                />
                
                <View style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  marginTop: isTablet ? 8 : 4,
                }}>
                  <Text style={{
                    fontSize: isTablet ? 14 : 12,
                    color: '#6B7280',
                    fontWeight: '500',
                  }}>
                    Tiny ({MIN_SIZE}px)
                  </Text>
                  <Text style={{
                    fontSize: isTablet ? 14 : 12,
                    color: '#6B7280',
                    fontWeight: '500',
                  }}>
                    Huge ({MAX_SIZE}px)
                  </Text>
                </View>
              </View>
            </View>

            {/* Spacing Selection */}
            <View style={{
              marginBottom: isTablet ? 32 : 24,
            }}>
              <View style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: isTablet ? 16 : 12,
              }}>
                <Text style={{
                  fontSize: isTablet ? 20 : 16,
                  fontWeight: '600',
                  color: '#333',
                }}>Spacing</Text>
                <Text style={{
                  fontSize: isTablet ? 16 : 14,
                  fontWeight: '500',
                  color: '#3B82F6',
                  backgroundColor: '#EBF4FF',
                  paddingHorizontal: isTablet ? 12 : 8,
                  paddingVertical: isTablet ? 6 : 4,
                  borderRadius: isTablet ? 8 : 6,
                }}>
                  {selectedSpacing}px
                </Text>
              </View>
              
              <View style={{
                backgroundColor: '#F8F9FA',
                borderRadius: isTablet ? 12 : 8,
                padding: isTablet ? 16 : 12,
              }}>
                <Slider
                  style={{
                    width: '100%',
                    height: isTablet ? 50 : 40,
                  }}
                  minimumValue={MIN_SPACING}
                  maximumValue={MAX_SPACING}
                  value={selectedSpacing}
                  onValueChange={setSelectedSpacing}
                  minimumTrackTintColor="#3B82F6"
                  maximumTrackTintColor="#E5E7EB"
                  thumbStyle={{
                    backgroundColor: '#3B82F6',
                    width: isTablet ? 24 : 20,
                    height: isTablet ? 24 : 20,
                  }}
                  trackStyle={{
                    height: isTablet ? 6 : 4,
                    borderRadius: isTablet ? 3 : 2,
                  }}
                  step={1}
                />
                
                <View style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  marginTop: isTablet ? 8 : 4,
                }}>
                  <Text style={{
                    fontSize: isTablet ? 14 : 12,
                    color: '#6B7280',
                    fontWeight: '500',
                  }}>
                    Close ({MIN_SPACING}px)
                  </Text>
                  <Text style={{
                    fontSize: isTablet ? 14 : 12,
                    color: '#6B7280',
                    fontWeight: '500',
                  }}>
                    Wide ({MAX_SPACING}px)
                  </Text>
                </View>
              </View>
            </View>
          </ScrollView>

          {/* Create Button */}
          <TouchableOpacity
            style={{
              backgroundColor: !name.trim() ? '#E5E7EB' : '#3B82F6',
              borderRadius: isTablet ? 16 : 12,
              paddingVertical: isTablet ? 20 : 16,
              margin: isTablet ? 28 : 20,
              alignItems: 'center',
            }}
            onPress={handleCreate}
            disabled={!name.trim()}
          >
            <Text style={{
              color: !name.trim() ? '#9CA3AF' : 'white',
              fontSize: isTablet ? 18 : 16,
              fontWeight: '600',
            }}>
              Create Light
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Reanimated Color Picker Modal */}
      <Modal
        visible={showColorPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowColorPicker(false)}
      >
        <View style={{
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          <View style={{
            backgroundColor: 'white',
            borderRadius: isTablet ? 24 : 20,
            width: '90%',
            maxWidth: isTablet ? 600 : 400,
            paddingBottom: isTablet ? 28 : 20,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.25,
            shadowRadius: 20,
            elevation: 10,
          }}>
            <View style={{
              padding: isTablet ? 28 : 20,
              borderBottomWidth: 1,
              borderBottomColor: '#E5E7EB',
            }}>
              <View style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: isTablet ? 16 : 12,
              }}>
                <Text style={{
                  fontSize: isTablet ? 24 : 18,
                  fontWeight: '600',
                  color: '#333',
                }}>Choose Color</Text>
                <TouchableOpacity 
                  onPress={() => setShowColorPicker(false)}
                  style={{
                    padding: isTablet ? 8 : 4,
                    width: isTablet ? 44 : 32,
                    height: isTablet ? 44 : 32,
                    borderRadius: isTablet ? 22 : 16,
                    backgroundColor: '#f3f4f6',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <MaterialIcons name="close" size={isTablet ? 28 : 24} color="#666" />
                </TouchableOpacity>
              </View>
              
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: isTablet ? 16 : 12,
              }}>
                <View style={{
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: isTablet ? 60 : 50,
                  width: isTablet ? 60 : 50,
                  backgroundColor: '#2d2d2dff',
                  borderRadius: isTablet ? 8 : 6,
                }}>
                  <View
                    style={{
                      width: selectedSize * 1.6,
                      height: selectedSize * 1.6,
                      borderRadius: selectedSize * 0.8,
                      backgroundColor: resultColor,
                      shadowColor: resultColor,
                      shadowOffset: { width: 0, height: 0 },
                      shadowOpacity: 0.8,
                      shadowRadius: selectedSize * 0.3,
                    }}
                  />
                </View>
                
                <TouchableOpacity
                  style={{
                    flex: 1,
                    backgroundColor: '#3B82F6',
                    borderRadius: isTablet ? 16 : 12,
                    paddingVertical: isTablet ? 16 : 12,
                    alignItems: 'center',
                  }}
                  onPress={() => setShowColorPicker(false)}
                >
                  <Text style={{
                    color: 'white',
                    fontSize: isTablet ? 16 : 14,
                    fontWeight: '600',
                  }}>
                    Done
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            
            <View style={{
              padding: isTablet ? 28 : 20,
            }}>
              <ColorPicker
                value={resultColor}
                sliderThickness={isTablet ? 30 : 25}
                thumbSize={isTablet ? 28 : 24}
                thumbShape='circle'
                onChange={onColorChange}
                onCompleteJS={onColorPick}
                style={{
                  width: '100%',
                  height: isTablet ? 300 : 250,
                }}
                adaptSpectrum
                boundedThumb
              >
                <View style={{ marginBottom: isTablet ? 20 : 15 }}>
                  <Text style={{
                    fontSize: isTablet ? 16 : 14,
                    fontWeight: '600',
                    color: '#333',
                    marginBottom: isTablet ? 12 : 8,
                  }}>Hue</Text>
                  <HueSlider style={{
                    borderRadius: isTablet ? 15 : 12,
                    height: isTablet ? 30 : 25,
                  }} />
                </View>

                <View style={{ marginBottom: isTablet ? 20 : 15 }}>
                  <Text style={{
                    fontSize: isTablet ? 16 : 14,
                    fontWeight: '600',
                    color: '#333',
                    marginBottom: isTablet ? 12 : 8,
                  }}>Saturation</Text>
                  <HSLSaturationSlider style={{
                    borderRadius: isTablet ? 15 : 12,
                    height: isTablet ? 30 : 25,
                  }} />
                </View>

                <View style={{ marginBottom: isTablet ? 20 : 15 }}>
                  <Text style={{
                    fontSize: isTablet ? 16 : 14,
                    fontWeight: '600',
                    color: '#333',
                    marginBottom: isTablet ? 12 : 8,
                  }}>Brightness</Text>
                  <LuminanceSlider style={{
                    borderRadius: isTablet ? 15 : 12,
                    height: isTablet ? 30 : 25,
                  }} />
                </View>

                <View style={{ marginBottom: isTablet ? 20 : 15 }}>
                  <Text style={{
                    fontSize: isTablet ? 16 : 14,
                    fontWeight: '600',
                    color: '#333',
                    marginBottom: isTablet ? 12 : 8,
                  }}>Opacity</Text>
                  <OpacitySlider style={{
                    borderRadius: isTablet ? 15 : 12,
                    height: isTablet ? 30 : 25,
                  }} />
                </View>


              </ColorPicker>
            </View>
          </View>
        </View>
      </Modal>
    </Modal>
  );
}

