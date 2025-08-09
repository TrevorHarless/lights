// contexts/editor/AssetManagementProvider.test.tsx
// Simple test component to validate AssetManagementProvider functionality

import React from 'react';
import { View, Text } from 'react-native';
import { AssetManagementProvider, useAssetManagement } from './AssetManagementProvider';

// Test component that consumes the context
function AssetManagementTestConsumer() {
  const {
    lightAssets,
    wreathAssets,
    allAssets,
    selectedAsset,
    setSelectedAsset,
    getAssetById,
    getAssetsByCategory,
    getCategories,
    getLightSizeScale,
  } = useAssetManagement();

  // Basic validation tests
  React.useEffect(() => {
    console.log('=== AssetManagementProvider Test Results ===');
    
    // Test 1: Assets are loaded
    console.log(`Light assets count: ${lightAssets.length}`);
    console.log(`Wreath assets count: ${wreathAssets.length}`);
    console.log(`All assets count: ${allAssets.length}`);
    console.log(`Expected all assets: ${lightAssets.length + wreathAssets.length}`);
    
    // Test 2: Categories
    const categories = getCategories();
    console.log(`Categories: ${categories.join(', ')}`);
    console.log(`Expected: string, net, wreath (and possibly others)`);
    
    // Test 3: Asset lookup
    if (lightAssets.length > 0) {
      const firstLightAsset = lightAssets[0];
      const foundAsset = getAssetById(firstLightAsset.id);
      console.log(`Asset lookup test: ${foundAsset ? 'PASS' : 'FAIL'}`);
      console.log(`Found asset: ${foundAsset?.name || 'None'}`);
    }
    
    // Test 4: Category filtering
    const stringAssets = getAssetsByCategory('string');
    console.log(`String assets count: ${stringAssets.length}`);
    
    const wreathAssetsFromCategory = getAssetsByCategory('wreath');
    console.log(`Wreath assets from category: ${wreathAssetsFromCategory.length}`);
    
    // Test 5: Light size scale
    const lightSizeScale = getLightSizeScale();
    console.log(`Light size scale: ${lightSizeScale}`);
    
    // Test 6: Selection functionality
    if (allAssets.length > 0) {
      console.log(`Testing selection with first asset: ${allAssets[0].name}`);
      setSelectedAsset(allAssets[0]);
    }
    
    console.log('=== End Test Results ===');
  }, []);

  React.useEffect(() => {
    if (selectedAsset) {
      console.log(`Selected asset changed to: ${selectedAsset.name} (${selectedAsset.category})`);
    }
  }, [selectedAsset]);

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
        AssetManagement Test Component
      </Text>
      <Text>Light Assets: {lightAssets.length}</Text>
      <Text>Wreath Assets: {wreathAssets.length}</Text>
      <Text>Total Assets: {allAssets.length}</Text>
      <Text>Categories: {getCategories().join(', ')}</Text>
      <Text>Selected Asset: {selectedAsset?.name || 'None'}</Text>
      <Text style={{ marginTop: 10, fontStyle: 'italic' }}>
        Check console for detailed test results
      </Text>
    </View>
  );
}

// Main test component wrapped with provider
export function AssetManagementProviderTest() {
  return (
    <AssetManagementProvider>
      <AssetManagementTestConsumer />
    </AssetManagementProvider>
  );
}

// Export for use in development/debugging
export default AssetManagementProviderTest;