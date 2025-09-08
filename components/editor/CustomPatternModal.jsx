import { MaterialIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  Dimensions,
  Image,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

// Available light images for pattern creation
const AVAILABLE_LIGHTS = [
  { 
    name: 'Red', 
    lightImage: require('~/assets/lights/Red.png'),
    color: '#FF0000' // For preview background
  },
  { 
    name: 'Green', 
    lightImage: require('~/assets/lights/Green.png'),
    color: '#00FF00'
  },
  { 
    name: 'Blue', 
    lightImage: require('~/assets/lights/Blue.png'),
    color: '#0000FF'
  },
  { 
    name: 'Yellow', 
    lightImage: require('~/assets/lights/Yellow.png'),
    color: '#FFFF00'
  },
  { 
    name: 'Warm White', 
    lightImage: require('~/assets/lights/Warm-White.png'),
    color: '#FFF8DC'
  },
];

const SPACING_PRESETS = [
  { label: 'Close', value: 12 },
  { label: 'Standard', value: 18 },
  { label: 'Wide', value: 24 },
];

export function CustomPatternModal({ 
  visible, 
  onClose, 
  onCreatePattern,
}) {
  const [name, setName] = useState('');
  const [selectedSpacing, setSelectedSpacing] = useState(18);
  const [pattern, setPattern] = useState([AVAILABLE_LIGHTS[0]]); // Start with Red
  const [showLightPicker, setShowLightPicker] = useState(false);
  const [editingPatternIndex, setEditingPatternIndex] = useState(null);
  
  // Device detection for responsive design
  const { width } = Dimensions.get('window');
  const isTablet = width >= 768;

  const handleCreate = async () => {
    if (!name.trim() || pattern.length === 0) {
      return;
    }

    const config = {
      spacing: selectedSpacing,
      baseSize: 48, // Fixed size for image-based patterns
      pattern: pattern, // Array of { lightImage, name }
    };

    try {
      const asset = await onCreatePattern(name.trim(), config);
      
      // Reset form
      setName('');
      setSelectedSpacing(18);
      setPattern([AVAILABLE_LIGHTS[0]]);
      setShowLightPicker(false);
      setEditingPatternIndex(null);
      
      onClose();
      return asset;
    } catch (error) {
      console.error('Error creating custom pattern:', error);
    }
  };

  const handleLightSelection = (light) => {
    if (editingPatternIndex !== null) {
      // Update existing pattern step
      const newPattern = [...pattern];
      newPattern[editingPatternIndex] = light;
      setPattern(newPattern);
      setEditingPatternIndex(null);
    }
    setShowLightPicker(false);
  };

  const addPatternStep = () => {
    setPattern([...pattern, AVAILABLE_LIGHTS[0]]);
  };

  const removePatternStep = (index) => {
    if (pattern.length > 1) {
      setPattern(pattern.filter((_, i) => i !== index));
    }
  };

  const editPatternStep = (index) => {
    setEditingPatternIndex(index);
    setShowLightPicker(true);
  };

  // Generate preview - show pattern lights
  const generatePreview = () => {
    return pattern.slice(0, 6).map((light, index) => (
      <View key={index} style={{
        alignItems: 'center',
        marginHorizontal: 4,
      }}>
        <Image
          source={light.lightImage}
          style={{
            width: isTablet ? 32 : 24,
            height: isTablet ? 32 : 24,
          }}
          resizeMode="contain"
        />
        <Text style={{
          fontSize: isTablet ? 10 : 8,
          color: '#666',
          marginTop: 2,
        }}>{index + 1}</Text>
      </View>
    ));
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
            }}>Create Custom Pattern</Text>
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
              }}>Preview Pattern</Text>
              <View style={{
                alignItems: 'center',
                justifyContent: 'center',
                height: isTablet ? 80 : 60,
                backgroundColor: '#F8F9FA',
                borderRadius: isTablet ? 16 : 12,
                marginTop: isTablet ? 12 : 8,
                flexDirection: 'row',
              }}>
                {generatePreview()}
                {pattern.length > 6 && (
                  <Text style={{
                    fontSize: isTablet ? 14 : 12,
                    color: '#666',
                    fontStyle: 'italic',
                    marginLeft: 8,
                  }}>+{pattern.length - 6} more</Text>
                )}
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
              }}>Pattern Name</Text>
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
                placeholder="Enter pattern name"
                placeholderTextColor="#999"
              />
            </View>

            {/* Pattern Design */}
            <View style={{
              marginBottom: isTablet ? 32 : 24,
            }}>
              <Text style={{
                fontSize: isTablet ? 20 : 16,
                fontWeight: '600',
                color: '#333',
                marginBottom: isTablet ? 16 : 12,
              }}>Pattern Sequence</Text>
              <View style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                gap: isTablet ? 16 : 12,
                marginTop: isTablet ? 12 : 8,
              }}>
                {pattern.map((light, index) => (
                  <View key={index} style={{
                    alignItems: 'center',
                    position: 'relative',
                  }}>
                    <TouchableOpacity
                      style={{
                        width: isTablet ? 60 : 44,
                        height: isTablet ? 60 : 44,
                        borderRadius: isTablet ? 30 : 22,
                        backgroundColor: '#F3F4F6',
                        borderWidth: 2,
                        borderColor: '#E5E7EB',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden',
                      }}
                      onPress={() => editPatternStep(index)}
                    >
                      <Image
                        source={light.lightImage}
                        style={{
                          width: isTablet ? 40 : 30,
                          height: isTablet ? 40 : 30,
                        }}
                        resizeMode="contain"
                      />
                    </TouchableOpacity>
                    <Text style={{
                      fontSize: isTablet ? 14 : 12,
                      fontWeight: '600',
                      color: '#6B7280',
                      marginTop: isTablet ? 6 : 4,
                    }}>{index + 1}</Text>
                    <Text style={{
                      fontSize: isTablet ? 12 : 10,
                      color: '#9CA3AF',
                      textAlign: 'center',
                    }}>{light.name}</Text>
                    {pattern.length > 1 && (
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
                        onPress={() => removePatternStep(index)}
                      >
                        <MaterialIcons name="close" size={isTablet ? 16 : 14} color="#EF4444" />
                      </TouchableOpacity>
                    )}
                  </View>
                ))}
                
                {pattern.length < 8 && (
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
                    onPress={addPatternStep}
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
                Tap lights to change • Add up to 8 steps
              </Text>
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
              backgroundColor: !name.trim() || pattern.length === 0 ? '#E5E7EB' : '#3B82F6',
              borderRadius: isTablet ? 16 : 12,
              paddingVertical: isTablet ? 20 : 16,
              margin: isTablet ? 28 : 20,
              alignItems: 'center',
            }}
            onPress={handleCreate}
            disabled={!name.trim() || pattern.length === 0}
          >
            <Text style={{
              color: !name.trim() || pattern.length === 0 ? '#9CA3AF' : 'white',
              fontSize: isTablet ? 18 : 16,
              fontWeight: '600',
            }}>
              Create Pattern
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Light Selection Modal */}
      <Modal
        visible={showLightPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLightPicker(false)}
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
              }}>Choose Light</Text>
              <TouchableOpacity 
                onPress={() => setShowLightPicker(false)}
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
              padding: isTablet ? 28 : 20,
            }}>
              <View style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                gap: isTablet ? 16 : 12,
                justifyContent: 'center',
              }}>
                {AVAILABLE_LIGHTS.map((light, index) => (
                  <TouchableOpacity
                    key={index}
                    style={{
                      alignItems: 'center',
                      padding: isTablet ? 12 : 8,
                      borderRadius: isTablet ? 16 : 12,
                      backgroundColor: '#F8F9FA',
                      borderWidth: 2,
                      borderColor: 'transparent',
                    }}
                    onPress={() => handleLightSelection(light)}
                  >
                    <Image
                      source={light.lightImage}
                      style={{
                        width: isTablet ? 48 : 36,
                        height: isTablet ? 48 : 36,
                      }}
                      resizeMode="contain"
                    />
                    <Text style={{
                      fontSize: isTablet ? 14 : 12,
                      fontWeight: '500',
                      color: '#333',
                      marginTop: isTablet ? 8 : 6,
                      textAlign: 'center',
                    }}>
                      {light.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </Modal>
  );
}