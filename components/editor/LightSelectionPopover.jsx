import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import {
  Dimensions,
  Image,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { CustomLightModal } from './CustomLightModal';

export function LightSelectionPopover({ 
  visible, 
  onClose, 
  lightAssets, 
  selectedAsset, 
  onSelectAsset,
  getAssetsByCategory,
  getCategories,
  getLightRenderStyle,
  onCreateCustomAsset,
  onRemoveCustomAsset
}) {
  const [selectedCategory, setSelectedCategory] = React.useState('string');
  const [showCustomModal, setShowCustomModal] = React.useState(false);
  const [deleteConfirmVisible, setDeleteConfirmVisible] = React.useState(false);
  const [assetToDelete, setAssetToDelete] = React.useState(null);
  
  // Device detection for responsive design
  const { width } = Dimensions.get('window');
  const isTablet = width >= 768;
  
  const categories = getCategories ? getCategories() : ['string'];
  const categoryAssets = getAssetsByCategory ? getAssetsByCategory(selectedCategory) : lightAssets;

  const getCategoryDisplayName = (category) => {
    switch (category) {
      case 'string': return 'String Lights';
      case 'wreath': return 'Decor';
      case 'net': return 'Net Lights';
      case 'custom': return 'Custom';
      default: return category.charAt(0).toUpperCase() + category.slice(1);
    }
  };

  const handleCreateCustomAsset = async (name, config) => {
    if (onCreateCustomAsset) {
      try {
        const asset = await onCreateCustomAsset(name, config);
        setSelectedCategory('custom');
        return asset;
      } catch (error) {
        console.error('Error creating custom asset:', error);
        throw error;
      }
    }
  };

  const handleRemoveCustomAsset = (asset) => {
    setAssetToDelete(asset);
    setDeleteConfirmVisible(true);
  };

  const confirmDelete = async () => {
    if (onRemoveCustomAsset && assetToDelete) {
      try {
        await onRemoveCustomAsset(assetToDelete.id);
      } catch (error) {
        console.error('Error removing custom asset:', error);
      }
    }
    setDeleteConfirmVisible(false);
    setAssetToDelete(null);
  };

  const cancelDelete = () => {
    setDeleteConfirmVisible(false);
    setAssetToDelete(null);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity 
        style={{
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          justifyContent: 'flex-end',
          alignItems: 'center',
        }} 
        activeOpacity={1} 
        onPress={onClose}
      >
        <View style={{
          backgroundColor: 'white',
          borderTopLeftRadius: isTablet ? 30 : 20,
          borderTopRightRadius: isTablet ? 30 : 20,
          paddingTop: isTablet ? 32 : 20,
          paddingBottom: isTablet ? 32 : 40,
          paddingHorizontal: isTablet ? 32 : 20,
          maxHeight: isTablet ? '70%' : '50%',
          width: '100%',
          maxWidth: '100%',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.15,
          shadowRadius: 12,
          elevation: 8,
        }}>
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: isTablet ? 28 : 20,
          }}>
            <Text style={{
              fontSize: isTablet ? 24 : 18,
              fontWeight: '600',
              color: '#333',
            }}>Choose Light Style</Text>
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

          {/* Category Tabs */}
          {categories.length > 1 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{
                paddingHorizontal: 4,
              }}
              style={{ marginBottom: isTablet ? 24 : 16 }}
            >
              {categories.map((category) => (
                <TouchableOpacity
                  key={category}
                  style={{
                    paddingHorizontal: isTablet ? 32 : 16,
                    paddingVertical: isTablet ? 16 : 8,
                    marginHorizontal: isTablet ? 8 : 4,
                    borderRadius: isTablet ? 28 : 20,
                    backgroundColor: selectedCategory === category ? '#EBF4FF' : '#F3F4F6',
                    borderWidth: 1,
                    borderColor: selectedCategory === category ? '#3B82F6' : '#E5E7EB',
                  }}
                  onPress={() => setSelectedCategory(category)}
                >
                  <Text
                    style={{
                      fontSize: isTablet ? 18 : 14,
                      fontWeight: '500',
                      color: selectedCategory === category ? '#3B82F6' : '#6B7280',
                    }}
                  >
                    {getCategoryDisplayName(category)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}

          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
              paddingHorizontal: 4,
              alignItems: 'center',
            }}
          >
            {/* Create Custom Button - only show in custom category */}
            {selectedCategory === 'custom' && (
              <TouchableOpacity
                onPress={() => setShowCustomModal(true)}
                style={{
                  alignItems: 'center',
                  marginHorizontal: isTablet ? 12 : 8,
                  paddingVertical: isTablet ? 12 : 8,
                }}
                activeOpacity={0.7}
              >
                <View style={{
                  width: isTablet ? 96 : 64,
                  height: isTablet ? 96 : 64,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: isTablet ? 20 : 12,
                  borderWidth: 2,
                  borderStyle: 'dashed',
                  borderColor: '#3B82F6',
                  backgroundColor: '#F8FAFC',
                  position: 'relative',
                }}>
                  <MaterialIcons name="add" size={isTablet ? 48 : 32} color="#3B82F6" />
                </View>
                <Text style={{
                  marginTop: isTablet ? 12 : 8,
                  textAlign: 'center',
                  fontSize: isTablet ? 16 : 12,
                  color: '#6B7280',
                  fontWeight: '500',
                }}>
                  Create New
                </Text>
              </TouchableOpacity>
            )}

            {categoryAssets.map((asset) => (
              <TouchableOpacity
                key={asset.id}
                onPress={() => onSelectAsset(asset)}
                style={{
                  alignItems: 'center',
                  marginHorizontal: isTablet ? 12 : 8,
                  paddingVertical: isTablet ? 12 : 8,
                }}
                activeOpacity={0.7}
              >
                <View
                  style={{
                    width: isTablet ? 96 : 64,
                    height: isTablet ? 96 : 64,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: isTablet ? 20 : 12,
                    borderWidth: 2,
                    borderColor: selectedAsset?.id === asset.id ? '#3B82F6' : '#E5E7EB',
                    backgroundColor: selectedAsset?.id === asset.id ? '#EBF4FF' : 'white',
                    position: 'relative',
                  }}
                >
                  {asset.renderType === 'image' && asset.image ? (
                    <Image 
                      source={asset.image} 
                      style={{ 
                        width: isTablet ? 60 : 40, 
                        height: isTablet ? 60 : 40 
                      }}
                      resizeMode="contain"
                    />
                  ) : (
                    <View
                      style={[
                        {
                          width: isTablet ? 60 : 40,
                          height: isTablet ? 60 : 40,
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: isTablet ? 30 : 20,
                        },
                        getLightRenderStyle && getLightRenderStyle(asset.id, 0.8, 0)
                      ]}
                    />
                  )}

                  {selectedAsset?.id === asset.id && (
                    <View style={{
                      position: 'absolute',
                      top: isTablet ? -6 : -4,
                      right: isTablet ? -6 : -4,
                      width: isTablet ? 32 : 24,
                      height: isTablet ? 32 : 24,
                      backgroundColor: '#3B82F6',
                      borderRadius: isTablet ? 16 : 12,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <MaterialIcons name="check" size={isTablet ? 20 : 14} color="white" />
                    </View>
                  )}

                  {/* Delete button for custom assets */}
                  {asset.category === 'custom' && (
                    <TouchableOpacity
                      style={{
                        position: 'absolute',
                        bottom: isTablet ? -8 : -6,
                        right: isTablet ? -8 : -6,
                        width: isTablet ? 28 : 20,
                        height: isTablet ? 28 : 20,
                        backgroundColor: '#EF4444',
                        borderRadius: isTablet ? 14 : 10,
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderWidth: 2,
                        borderColor: 'white',
                      }}
                      onPress={(e) => {
                        e.stopPropagation();
                        handleRemoveCustomAsset(asset);
                      }}
                    >
                      <MaterialIcons name="close" size={isTablet ? 18 : 14} color="white" />
                    </TouchableOpacity>
                  )}
                </View>

                <Text style={{
                  marginTop: isTablet ? 12 : 8,
                  textAlign: 'center',
                  fontSize: isTablet ? 16 : 12,
                  color: '#6B7280',
                  fontWeight: '500',
                }}>
                  {asset.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </TouchableOpacity>

      {/* Custom Light Creation Modal */}
      <CustomLightModal
        visible={showCustomModal}
        onClose={() => setShowCustomModal(false)}
        onCreateAsset={handleCreateCustomAsset}
        getLightRenderStyle={getLightRenderStyle}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        visible={deleteConfirmVisible}
        transparent
        animationType="fade"
        onRequestClose={cancelDelete}
      >
        <View style={{
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          <View style={{
            backgroundColor: 'white',
            borderRadius: isTablet ? 24 : 16,
            padding: isTablet ? 32 : 24,
            width: '85%',
            maxWidth: isTablet ? 500 : 400,
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.25,
            shadowRadius: 20,
            elevation: 10,
          }}>
            <View style={{
              alignItems: 'center',
              marginBottom: isTablet ? 24 : 16,
            }}>
              <MaterialIcons name="warning" size={isTablet ? 40 : 32} color="#EF4444" />
              <Text style={{
                fontSize: isTablet ? 22 : 18,
                fontWeight: '600',
                color: '#333',
                marginTop: isTablet ? 12 : 8,
              }}>Delete Custom Light</Text>
            </View>
            
            <Text style={{
              fontSize: isTablet ? 18 : 16,
              color: '#666',
              textAlign: 'center',
              lineHeight: isTablet ? 26 : 22,
              marginBottom: isTablet ? 32 : 24,
            }}>
              Are you sure you want to delete &ldquo;{assetToDelete?.name}&rdquo;? This action cannot be undone.
            </Text>
            
            <View style={{
              flexDirection: 'row',
              gap: isTablet ? 16 : 12,
              width: '100%',
            }}>
              <TouchableOpacity
                style={{
                  flex: 1,
                  paddingVertical: isTablet ? 16 : 12,
                  paddingHorizontal: isTablet ? 24 : 20,
                  borderRadius: isTablet ? 12 : 8,
                  borderWidth: 1,
                  borderColor: '#D1D5DB',
                  backgroundColor: '#F9FAFB',
                  alignItems: 'center',
                }}
                onPress={cancelDelete}
              >
                <Text style={{
                  fontSize: isTablet ? 18 : 16,
                  fontWeight: '500',
                  color: '#6B7280',
                }}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={{
                  flex: 1,
                  paddingVertical: isTablet ? 16 : 12,
                  paddingHorizontal: isTablet ? 24 : 20,
                  borderRadius: isTablet ? 12 : 8,
                  backgroundColor: '#EF4444',
                  alignItems: 'center',
                }}
                onPress={confirmDelete}
              >
                <Text style={{
                  fontSize: isTablet ? 18 : 16,
                  fontWeight: '600',
                  color: 'white',
                }}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </Modal>
  );
}

