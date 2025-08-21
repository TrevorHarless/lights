// components/projects/AssetSelector.jsx
import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import Svg from 'react-native-svg';

export const AssetSelector = ({ 
  lightAssets, 
  selectedAsset, 
  onSelectAsset,
  getAssetsByCategory,
  getCategories 
}) => {
  const [selectedCategory, setSelectedCategory] = React.useState('string');
  
  const categories = getCategories ? getCategories() : ['string'];
  const categoryAssets = getAssetsByCategory ? getAssetsByCategory(selectedCategory) : lightAssets;

  const getCategoryDisplayName = (category) => {
    switch (category) {
      case 'string': return 'String Lights';
      case 'decor': return 'Decor';
      case 'net': return 'Net Lights';
      default: return category.charAt(0).toUpperCase() + category.slice(1);
    }
  };

  return (
    <View className="bg-gray-50 border-t border-gray-200 pt-2.5">
      {/* Category Tabs */}
      {categories.length > 1 && (
        <View className="px-3 mb-2">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingRight: 16 }}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category}
                className={`px-3 py-1.5 mr-2 rounded-full ${
                  selectedCategory === category 
                    ? 'bg-blue-100 border border-blue-300' 
                    : 'bg-gray-100 border border-gray-200'
                }`}
                onPress={() => setSelectedCategory(category)}>
                <Text
                  className={`text-xs font-medium ${
                    selectedCategory === category 
                      ? 'text-blue-700' 
                      : 'text-gray-600'
                  }`}>
                  {getCategoryDisplayName(category)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      <Text className="text-sm font-medium text-gray-600 ml-3 mb-2">
        {getCategoryDisplayName(selectedCategory)}
      </Text>
      
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 8, paddingBottom: 12 }}>
        {categoryAssets.map((asset) => (
          <TouchableOpacity
            key={asset.id}
            className={`items-center mx-2 w-20 relative mt-1 ${
              selectedAsset?.id === asset.id ? 'scale-105' : ''
            }`}
            onPress={() => onSelectAsset(asset)}>
            <View className="w-15 h-15 justify-center items-center bg-white rounded-2xl border border-gray-200 shadow-sm relative">
              {asset.renderType === 'image' && asset.image ? (
                <Image 
                  source={asset.image} 
                  style={{ width: 36, height: 36 }}
                  resizeMode="contain"
                />
              ) : (
                <Svg width={36} height={36} viewBox="0 0 20 20">
                  {asset.svg && asset.svg()}
                </Svg>
              )}

              {selectedAsset?.id === asset.id && (
                <View 
                  className="absolute bg-white rounded-2xl w-5 h-5 justify-center items-center shadow-sm"
                  style={{ top: -5, right: -5, elevation: 1 }}>
                  <MaterialIcons name="check-circle" size={18} color="#3b82f6" />
                </View>
              )}
            </View>
            <Text
              className={`text-xs mt-1.5 text-center leading-3 ${
                selectedAsset?.id === asset.id 
                  ? 'text-primary-500 font-medium' 
                  : 'text-gray-600'
              }`}
              numberOfLines={2}>
              {asset.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};
