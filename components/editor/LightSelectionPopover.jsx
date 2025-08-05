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
import Svg from 'react-native-svg';

export function LightSelectionPopover({ 
  visible, 
  onClose, 
  lightAssets, 
  selectedAsset, 
  onSelectAsset,
  getAssetsByCategory,
  getCategories 
}) {
  const [selectedCategory, setSelectedCategory] = React.useState('string');
  
  const categories = getCategories ? getCategories() : ['string'];
  const categoryAssets = getAssetsByCategory ? getAssetsByCategory(selectedCategory) : lightAssets;

  const getCategoryDisplayName = (category) => {
    switch (category) {
      case 'string': return 'String Lights';
      case 'wreath': return 'Wreaths';
      case 'net': return 'Net Lights';
      default: return category.charAt(0).toUpperCase() + category.slice(1);
    }
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
                    <Svg width={40} height={40} viewBox="0 0 30 30">
                      {asset.svg && asset.svg()}
                    </Svg>
                  )}

                  {selectedAsset?.id === asset.id && (
                    <View style={styles.checkmark}>
                      <MaterialIcons name="check" size={14} color="white" />
                    </View>
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
});