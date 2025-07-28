// components/projects/AssetSelector.jsx
import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Svg from 'react-native-svg';

export const AssetSelector = ({ lightAssets, selectedAsset, onSelectAsset }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Light Styles</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.content}>
        {lightAssets.map((asset) => (
          <TouchableOpacity
            key={asset.id}
            style={[styles.assetButton, selectedAsset?.id === asset.id && styles.selectedAsset]}
            onPress={() => onSelectAsset(asset)}>
            <View style={styles.assetIconContainer}>
              <Svg width={36} height={36} viewBox="0 0 20 20">
                {asset.svg()}
              </Svg>

              {/* Move checkmark inside the icon container but position it in the top-right corner */}
              {selectedAsset?.id === asset.id && (
                <View style={styles.checkmarkContainer}>
                  <MaterialIcons name="check-circle" size={18} color="#007aff" />
                </View>
              )}
            </View>
            <Text
              style={[
                styles.assetName,
                selectedAsset?.id === asset.id && styles.selectedAssetName,
              ]}>
              {asset.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f9f9f9',
    borderTopWidth: 1,
    borderColor: '#e0e0e0',
    paddingTop: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#555',
    marginLeft: 12,
    marginBottom: 8,
  },
  content: {
    paddingHorizontal: 8,
    paddingBottom: 12,
  },
  assetButton: {
    alignItems: 'center',
    marginHorizontal: 8,
    width: 80,
    position: 'relative',
    marginTop: 5,
  },
  assetIconContainer: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    elevation: 2,
    position: 'relative', // Important for absolute positioning of the checkmark
  },
  selectedAsset: {
    transform: [{ scale: 1.05 }],
  },
  checkmarkContainer: {
    position: 'absolute',
    top: -5,
    right: -5, // Adjusted to be more centered on the corner
    backgroundColor: '#fff',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 1,
    elevation: 1,
  },
  assetName: {
    fontSize: 12,
    marginTop: 6,
    textAlign: 'center',
    color: '#555',
  },
  selectedAssetName: {
    color: '#007aff',
    fontWeight: '500',
  },
});
