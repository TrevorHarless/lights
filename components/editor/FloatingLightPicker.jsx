import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Svg from 'react-native-svg';

export function FloatingLightPicker({ lightAssets, selectedAsset, onSelectAsset }) {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Choose Light Style</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}>
          {lightAssets.map((asset) => (
            <TouchableOpacity
              key={asset.id}
              onPress={() => onSelectAsset(asset)}
              style={[
                styles.assetButton,
                selectedAsset?.id === asset.id && styles.selectedAssetButton,
              ]}>
              <View
                style={[
                  styles.assetIcon,
                  selectedAsset?.id === asset.id ? styles.selectedAssetIcon : styles.unselectedAssetIcon,
                ]}>
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
                ]}>
                {asset.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 24,
    left: 16,
    right: 16,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  content: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  scrollContent: {
    paddingHorizontal: 4,
  },
  assetButton: {
    alignItems: 'center',
    marginHorizontal: 8,
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
