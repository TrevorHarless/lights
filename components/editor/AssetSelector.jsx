// components/projects/AssetSelector.jsx
import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import Svg from 'react-native-svg';

export const AssetSelector = ({ lightAssets, selectedAsset, onSelectAsset }) => {
  return (
    <View className="bg-gray-50 border-t border-gray-200 pt-2.5">
      <Text className="text-sm font-medium text-gray-600 ml-3 mb-2">Light Styles</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 8, paddingBottom: 12 }}>
        {lightAssets.map((asset) => (
          <TouchableOpacity
            key={asset.id}
            className={`items-center mx-2 w-20 relative mt-1 ${
              selectedAsset?.id === asset.id ? 'scale-105' : ''
            }`}
            onPress={() => onSelectAsset(asset)}>
            <View className="w-15 h-15 justify-center items-center bg-white rounded-2xl border border-gray-200 shadow-sm relative">
              <Svg width={36} height={36} viewBox="0 0 20 20">
                {asset.svg()}
              </Svg>

              {/* Move checkmark inside the icon container but position it in the top-right corner */}
              {selectedAsset?.id === asset.id && (
                <View 
                  className="absolute bg-white rounded-2xl w-5 h-5 justify-center items-center shadow-sm"
                  style={{ top: -5, right: -5, elevation: 1 }}>
                  <MaterialIcons name="check-circle" size={18} color="#3b82f6" />
                </View>
              )}
            </View>
            <Text
              className={`text-xs mt-1.5 text-center ${
                selectedAsset?.id === asset.id 
                  ? 'text-primary-500 font-medium' 
                  : 'text-gray-600'
              }`}>
              {asset.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};
