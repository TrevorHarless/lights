import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import {
  Image,
  Modal,
  ScrollView,
  StyleSheet,
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
  
  const categories = getCategories ? getCategories() : ['string'];
  const categoryAssets = getAssetsByCategory ? getAssetsByCategory(selectedCategory) : lightAssets;

  const getCategoryDisplayName = (category) => {
    switch (category) {
      case 'string': return 'String Lights';
      case 'wreath': return 'Wreaths';
      case 'net': return 'Net Lights';
      case 'custom': return 'Custom';
      default: return category.charAt(0).toUpperCase() + category.slice(1);
    }
  };

  const handleCreateCustomAsset = (name, config) => {
    if (onCreateCustomAsset) {
      const asset = onCreateCustomAsset(name, config);
      setSelectedCategory('custom');
      return asset;
    }
  };

  const handleRemoveCustomAsset = (asset) => {
    setAssetToDelete(asset);
    setDeleteConfirmVisible(true);
  };

  const confirmDelete = () => {
    if (onRemoveCustomAsset && assetToDelete) {
      onRemoveCustomAsset(assetToDelete.id);
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
        style={styles.overlay} 
        activeOpacity={1} 
        onPress={onClose}
      >
        <View style={styles.popover}>
          <View style={styles.header}>
            <Text style={styles.title}>Choose Light Style</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <MaterialIcons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Category Tabs */}
          {categories.length > 1 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryTabs}
              style={{ marginBottom: 16 }}
            >
              {categories.map((category) => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.categoryTab,
                    selectedCategory === category && styles.selectedCategoryTab
                  ]}
                  onPress={() => setSelectedCategory(category)}
                >
                  <Text
                    style={[
                      styles.categoryTabText,
                      selectedCategory === category && styles.selectedCategoryTabText
                    ]}
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
            contentContainerStyle={styles.scrollContent}
          >
            {/* Create Custom Button - only show in custom category */}
            {selectedCategory === 'custom' && (
              <TouchableOpacity
                onPress={() => setShowCustomModal(true)}
                style={styles.assetButton}
                activeOpacity={0.7}
              >
                <View style={[styles.assetContainer, styles.createButton]}>
                  <MaterialIcons name="add" size={32} color="#3B82F6" />
                </View>
                <Text style={styles.assetName}>
                  Create New
                </Text>
              </TouchableOpacity>
            )}

            {categoryAssets.map((asset) => (
              <TouchableOpacity
                key={asset.id}
                onPress={() => onSelectAsset(asset)}
                style={styles.assetButton}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.assetContainer,
                    selectedAsset?.id === asset.id && styles.selectedAsset
                  ]}
                >
                  {asset.renderType === 'image' && asset.image ? (
                    <Image 
                      source={asset.image} 
                      style={{ width: 40, height: 40 }}
                      resizeMode="contain"
                    />
                  ) : (
                    <View
                      style={[
                        {
                          width: 40,
                          height: 40,
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: 20,
                        },
                        getLightRenderStyle && getLightRenderStyle(asset.id, 0.8, 0)
                      ]}
                    />
                  )}

                  {selectedAsset?.id === asset.id && (
                    <View style={styles.checkmark}>
                      <MaterialIcons name="check" size={14} color="white" />
                    </View>
                  )}

                  {/* Delete button for custom assets */}
                  {asset.category === 'custom' && (
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={(e) => {
                        e.stopPropagation();
                        handleRemoveCustomAsset(asset);
                      }}
                    >
                      <MaterialIcons name="close" size={14} color="white" />
                    </TouchableOpacity>
                  )}
                </View>

                <Text style={styles.assetName}>
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
        <View style={styles.deleteOverlay}>
          <View style={styles.deleteModal}>
            <View style={styles.deleteHeader}>
              <MaterialIcons name="warning" size={32} color="#EF4444" />
              <Text style={styles.deleteTitle}>Delete Custom Light</Text>
            </View>
            
            <Text style={styles.deleteMessage}>
              Are you sure you want to delete &ldquo;{assetToDelete?.name}&rdquo;? This action cannot be undone.
            </Text>
            
            <View style={styles.deleteActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={cancelDelete}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.deleteConfirmButton}
                onPress={confirmDelete}
              >
                <Text style={styles.deleteConfirmButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
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
    justifyContent: 'flex-end',
  },
  popover: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingBottom: 40,
    paddingHorizontal: 20,
    maxHeight: '50%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  scrollContent: {
    paddingHorizontal: 4,
    alignItems: 'center',
  },
  assetButton: {
    alignItems: 'center',
    marginHorizontal: 8,
    paddingVertical: 8,
  },
  assetContainer: {
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    backgroundColor: 'white',
    position: 'relative',
  },
  selectedAsset: {
    borderColor: '#3B82F6',
    backgroundColor: '#EBF4FF',
  },
  checkmark: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 24,
    height: 24,
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  assetName: {
    marginTop: 8,
    textAlign: 'center',
    fontSize: 12,
    color: '#6B7280',
  },
  categoryTabs: {
    paddingHorizontal: 4,
  },
  categoryTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  selectedCategoryTab: {
    backgroundColor: '#EBF4FF',
    borderColor: '#3B82F6',
  },
  categoryTabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  selectedCategoryTabText: {
    color: '#3B82F6',
  },
  createButton: {
    borderStyle: 'dashed',
    borderWidth: 2,
    borderColor: '#3B82F6',
    backgroundColor: '#F8FAFC',
  },
  deleteButton: {
    position: 'absolute',
    bottom: -6,
    right: -6,
    width: 20,
    height: 20,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  deleteOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteModal: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    width: '85%',
    maxWidth: 400,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  deleteHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  deleteTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 8,
  },
  deleteMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  deleteActions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6B7280',
  },
  deleteConfirmButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: '#EF4444',
    alignItems: 'center',
  },
  deleteConfirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});