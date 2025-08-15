import { MaterialIcons } from '@expo/vector-icons';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import React, { useCallback, useMemo, useRef } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Svg from 'react-native-svg';

export function CollapsibleBottomSheet({ lightAssets, selectedAsset, onSelectAsset }) {
  const bottomSheetRef = useRef(null);
  
  // Define snap points
  const snapPoints = useMemo(() => ['12%', '35%'], []);

  // Handle sheet changes
  const handleSheetChanges = useCallback((index) => {
    // Optional: Track sheet state if needed
  }, []);

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={0}
      snapPoints={snapPoints}
      onChange={handleSheetChanges}
      enablePanDownToClose={false}
      backgroundStyle={styles.bottomSheetBackground}
      handleIndicatorStyle={styles.handleIndicator}
    >
      <View className="flex-1 px-4">
        <View className="flex-row items-center justify-between py-2 mb-3">
          <Text className="text-base font-semibold text-gray-700">Choose Light Style</Text>
          
          {/* Show selected asset preview in header */}
          {selectedAsset && (
            <View className="flex-row items-center">
              <View className="w-7 h-7 items-center justify-center rounded-md bg-blue-50 border border-blue-400 mr-2">
                <Svg width={20} height={20} viewBox="0 0 30 30">
                  {selectedAsset.svg()}
                </Svg>
              </View>
              <Text className="text-sm font-medium text-primary-600">{selectedAsset.name}</Text>
            </View>
          )}
        </View>

        <BottomSheetScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 4,
            alignItems: 'center',
            paddingBottom: 20,
          }}
        >
          {lightAssets.map((asset) => (
            <TouchableOpacity
              key={asset.id}
              onPress={() => onSelectAsset(asset)}
              className="items-center mx-2 py-2"
              activeOpacity={0.7}
            >
              <View
                className="w-16 h-16 items-center justify-center rounded-xl border-2 relative bg-white border-gray-200"
              >
                <Svg width={40} height={40} viewBox="0 0 30 30">
                  {asset.svg()}
                </Svg>

                {selectedAsset?.id === asset.id && (
                  <View className="absolute -top-1 -right-1 w-6 h-6 bg-primary-500 rounded-xl items-center justify-center">
                    <MaterialIcons name="check" size={14} color="white" />
                  </View>
                )}
              </View>

              <Text className="mt-2 text-center text-xs text-gray-500">
                {asset.name}
              </Text>
            </TouchableOpacity>
          ))}
        </BottomSheetScrollView>
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  bottomSheetBackground: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  handleIndicator: {
    backgroundColor: '#D1D5DB',
    width: 40,
    height: 4,
  },
});