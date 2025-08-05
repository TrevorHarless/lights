import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import Svg from 'react-native-svg';

export function FloatingLightPicker({ lightAssets, selectedAsset, onSelectAsset }) {
  return (
    <View className="absolute bottom-6 left-4 right-4 rounded-2xl bg-white/95 shadow-lg border border-white/30"
          style={{ elevation: 8 }}>
      <View className="px-4 py-3">
        <Text className="text-sm font-semibold text-gray-700 mb-3">Choose Light Style</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 4 }}>
          {lightAssets.map((asset) => (
            <TouchableOpacity
              key={asset.id}
              onPress={() => onSelectAsset(asset)}
              className={`items-center mx-2 ${
                selectedAsset?.id === asset.id ? 'scale-105' : ''
              }`}>
              <View
                className={`w-16 h-16 items-center justify-center rounded-xl border-2 relative ${
                  selectedAsset?.id === asset.id 
                    ? 'bg-blue-50 border-blue-400 shadow-sm' 
                    : 'bg-white border-gray-200'
                }`}
                style={selectedAsset?.id === asset.id ? { elevation: 2 } : {}}>
                <Svg width={40} height={40} viewBox="0 0 30 30">
                  {asset.svg()}
                </Svg>

                {selectedAsset?.id === asset.id && (
                  <View className="absolute -top-1 -right-1 w-6 h-6 bg-primary-500 rounded-xl items-center justify-center">
                    <MaterialIcons name="check" size={14} color="white" />
                  </View>
                )}
              </View>

              <Text
                className={`mt-2 text-center text-xs ${
                  selectedAsset?.id === asset.id 
                    ? 'font-semibold text-primary-600' 
                    : 'text-gray-500'
                }`}>
                {asset.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}
