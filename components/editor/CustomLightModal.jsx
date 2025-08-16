import { MaterialIcons } from '@expo/vector-icons';
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
  const [selectedColor, setSelectedColor] = useState('#FF0000');
  const [selectedSize, setSelectedSize] = useState(12);
  const [selectedSpacing, setSelectedSpacing] = useState(36);
  const [customColor, setCustomColor] = useState('');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [isPatternMode, setIsPatternMode] = useState(false);
  const [patternColors, setPatternColors] = useState(['#FF0000']);
  const [editingPatternIndex, setEditingPatternIndex] = useState(null);
  
  // Device detection for responsive design
  const { width } = Dimensions.get('window');
  const isTablet = width >= 768;

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
    setPatternColors([...patternColors, '#FF0000']);
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

          <ScrollView style={{
            padding: isTablet ? 28 : 20,
          }} showsVerticalScrollIndicator={false}>
            {/* Preview */}
            <View style={{
              marginBottom: isTablet ? 32 : 24,
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
                height: isTablet ? 120 : 80,
                backgroundColor: '#F8F9FA',
                borderRadius: isTablet ? 16 : 12,
                marginTop: isTablet ? 12 : 8,
                flexDirection: isPatternMode ? 'row' : 'column',
              }}>
                {generatePreview()}
              </View>
            </View>

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
                onPress={() => setShowColorPicker(true)}
              >
                <MaterialIcons name="palette" size={isTablet ? 22 : 18} color="#3B82F6" />
                <Text style={{
                  color: '#3B82F6',
                  fontWeight: '500',
                  fontSize: isTablet ? 16 : 14,
                }}>More Colors</Text>
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
              <Text style={{
                fontSize: isTablet ? 20 : 16,
                fontWeight: '600',
                color: '#333',
                marginBottom: isTablet ? 16 : 12,
              }}>Size</Text>
              <View style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                gap: isTablet ? 12 : 8,
              }}>
                {SIZE_PRESETS.map((size) => (
                  <TouchableOpacity
                    key={size.value}
                    style={{
                      paddingHorizontal: isTablet ? 20 : 16,
                      paddingVertical: isTablet ? 12 : 8,
                      borderRadius: isTablet ? 24 : 20,
                      borderWidth: 1,
                      borderColor: selectedSize === size.value ? '#3B82F6' : '#E5E7EB',
                      backgroundColor: selectedSize === size.value ? '#EBF4FF' : '#F8F9FA',
                    }}
                    onPress={() => setSelectedSize(size.value)}
                  >
                    <Text style={{
                      fontSize: isTablet ? 16 : 14,
                      fontWeight: '500',
                      color: selectedSize === size.value ? '#3B82F6' : '#666',
                    }}>
                      {size.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Spacing Selection */}
            <View style={{
              marginBottom: isTablet ? 32 : 24,
            }}>
              <Text style={{
                fontSize: isTablet ? 20 : 16,
                fontWeight: '600',
                color: '#333',
                marginBottom: isTablet ? 16 : 12,
              }}>Spacing</Text>
              <View style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                gap: isTablet ? 12 : 8,
              }}>
                {SPACING_PRESETS.map((spacing) => (
                  <TouchableOpacity
                    key={spacing.value}
                    style={{
                      paddingHorizontal: isTablet ? 20 : 16,
                      paddingVertical: isTablet ? 12 : 8,
                      borderRadius: isTablet ? 24 : 20,
                      borderWidth: 1,
                      borderColor: selectedSpacing === spacing.value ? '#3B82F6' : '#E5E7EB',
                      backgroundColor: selectedSpacing === spacing.value ? '#EBF4FF' : '#F8F9FA',
                    }}
                    onPress={() => setSelectedSpacing(spacing.value)}
                  >
                    <Text style={{
                      fontSize: isTablet ? 16 : 14,
                      fontWeight: '500',
                      color: selectedSpacing === spacing.value ? '#3B82F6' : '#666',
                    }}>
                      {spacing.label}
                    </Text>
                  </TouchableOpacity>
                ))}
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

      {/* Extended Color Palette Modal */}
      <Modal
        visible={showColorPicker}
        transparent
        animationType="fade"
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
            width: '85%',
            maxWidth: isTablet ? 600 : 400,
            paddingBottom: isTablet ? 28 : 20,
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
            
            <ScrollView style={{
              padding: isTablet ? 28 : 20,
              maxHeight: isTablet ? 500 : 400,
            }} showsVerticalScrollIndicator={false}>
              <View style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                gap: isTablet ? 12 : 8,
                justifyContent: 'center',
              }}>
                {EXTENDED_COLORS.map((color, index) => (
                  <TouchableOpacity
                    key={index}
                    style={{
                      width: isTablet ? 48 : 36,
                      height: isTablet ? 48 : 36,
                      borderRadius: isTablet ? 24 : 18,
                      backgroundColor: color,
                      borderWidth: (customColor === color || (!customColor && selectedColor === color)) ? 3 : 2,
                      borderColor: (customColor === color || (!customColor && selectedColor === color)) ? '#3B82F6' : 'transparent',
                      justifyContent: 'center',
                      alignItems: 'center',
                      margin: isTablet ? 3 : 2,
                    }}
                    onPress={() => {
                      handleColorPickerChange(color);
                      setShowColorPicker(false);
                    }}
                  >
                    {(customColor === color || (!customColor && selectedColor === color)) && (
                      <MaterialIcons name="check" size={isTablet ? 20 : 16} color={color === '#FFFFFF' ? '#333' : 'white'} />
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

