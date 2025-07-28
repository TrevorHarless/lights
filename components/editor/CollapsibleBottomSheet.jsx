import { MaterialIcons } from '@expo/vector-icons';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import React, { useCallback, useMemo, useRef } from 'react';
import {
  ScrollView,
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
      <View style={styles.contentContainer}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Choose Light Style</Text>
          
          {/* Show selected asset preview in header */}
          {selectedAsset && (
            <View style={styles.selectedPreview}>
              <View style={styles.previewIcon}>
                <Svg width={20} height={20} viewBox="0 0 30 30">
                  {selectedAsset.svg()}
                </Svg>
              </View>
              <Text style={styles.previewText}>{selectedAsset.name}</Text>
            </View>
          )}
        </View>

        <BottomSheetScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {lightAssets.map((asset) => (
            <TouchableOpacity
              key={asset.id}
              onPress={() => onSelectAsset(asset)}
              style={[
                styles.assetButton,
                selectedAsset?.id === asset.id && styles.selectedAssetButton,
              ]}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.assetIcon,
                  selectedAsset?.id === asset.id ? styles.selectedAssetIcon : styles.unselectedAssetIcon,
                ]}
              >
                <Svg width={40} height={40} viewBox="0 0 30 30">
                  {asset.svg()}
                </Svg>

                {selectedAsset?.id === asset.id && (
                  <View style={styles.checkmark}>
                    <MaterialIcons name="check" size={14} color="white" />
                  </View>
                )}
              </View>

              <Text
                style={[
                  styles.assetName,
                  selectedAsset?.id === asset.id ? styles.selectedAssetName : styles.unselectedAssetName,
                ]}
              >
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
  contentContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  selectedPreview: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  previewIcon: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
    backgroundColor: '#EBF8FF',
    borderWidth: 1,
    borderColor: '#60A5FA',
    marginRight: 8,
  },
  previewText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#2563EB',
  },
  scrollContent: {
    paddingHorizontal: 4,
    alignItems: 'center',
    paddingBottom: 20,
  },
  assetButton: {
    alignItems: 'center',
    marginHorizontal: 8,
    paddingVertical: 8,
  },
  selectedAssetButton: {
    transform: [{ scale: 1.05 }],
  },
  assetIcon: {
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    borderWidth: 2,
    position: 'relative',
  },
  selectedAssetIcon: {
    backgroundColor: '#EBF8FF',
    borderColor: '#60A5FA',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  unselectedAssetIcon: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E7EB',
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
  },
  selectedAssetName: {
    fontWeight: '600',
    color: '#2563EB',
  },
  unselectedAssetName: {
    color: '#6B7280',
  },
});