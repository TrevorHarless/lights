import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useLightAssets } from '@/hooks/editor/useLightAssets';

interface AssetPaletteProps {
  lightAssetsHook?: ReturnType<typeof useLightAssets>;
  onAssetSelect?: (assetId: string) => void;
}

export const AssetPalette: React.FC<AssetPaletteProps> = ({ 
  lightAssetsHook: externalHook,
  onAssetSelect 
}) => {
  const internalHook = useLightAssets();
  const { lightAssets, selectedAssetId, selectAsset } = externalHook || internalHook;

  const handleAssetPress = (assetId: string) => {
    selectAsset(assetId);
    onAssetSelect?.(assetId);
  };

  const getAssetEmoji = (assetId: string): string => {
    switch (assetId) {
      case 'warm-white':
        return '💡';
      case 'blue-glow':
        return '🔵';
      case 'multicolor':
        return '🌈';
      case 'icicle':
        return '❄️';
      default:
        return '💡';
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Assets</Text>
      
      <View style={styles.assetGrid}>
        {lightAssets.map((asset) => (
          <TouchableOpacity
            key={asset.id}
            style={[
              styles.assetButton,
              selectedAssetId === asset.id && styles.selectedAsset
            ]}
            onPress={() => handleAssetPress(asset.id)}
            activeOpacity={0.7}
          >
            <Text style={styles.assetEmoji}>
              {getAssetEmoji(asset.id)}
            </Text>
            <Text style={styles.assetName} numberOfLines={2}>
              {asset.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 8,
    backgroundColor: 'white'
  },
  title: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    fontWeight: '500',
    marginBottom: 12
  },
  assetGrid: {
    gap: 8
  },
  assetButton: {
    width: 64,
    height: 64,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 4
  },
  selectedAsset: {
    backgroundColor: '#EBF4FF',
    borderColor: '#3B82F6',
    borderWidth: 2
  },
  assetEmoji: {
    fontSize: 20,
    marginBottom: 2
  },
  assetName: {
    fontSize: 9,
    color: '#374151',
    textAlign: 'center',
    fontWeight: '500'
  }
});