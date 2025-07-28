import React, { useState, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { LightStringRenderer } from './LightStringRenderer';
import { useVectorDrawing } from '@/hooks/editor/useVectorDrawing';
import { useLightStrings } from '@/hooks/editor/useLightStrings';
import { useLightAssets } from '@/hooks/editor/useLightAssets';
import { Point, Vector } from '@/types/editor';

interface InteractiveCanvasProps {
  imageUrl: string;
  selectedAssetId?: string;
  onSelectionChange?: (selectedStringId: string | null) => void;
  lightStringsHook?: ReturnType<typeof useLightStrings>;
  lightAssetsHook?: ReturnType<typeof useLightAssets>;
}

export const InteractiveCanvas: React.FC<InteractiveCanvasProps> = ({
  imageUrl,
  selectedAssetId,
  onSelectionChange,
  lightStringsHook: externalLightStringsHook,
  lightAssetsHook: externalLightAssetsHook
}) => {
  const [canvasLayout, setCanvasLayout] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);

  // Always call hooks, but use external ones if provided
  const internalLightStringsHook = useLightStrings();
  const internalLightAssetsHook = useLightAssets();
  
  const lightStringsHook = externalLightStringsHook || internalLightStringsHook;
  const lightAssetsHook = externalLightAssetsHook || internalLightAssetsHook;
  
  const { getAssetById } = lightAssetsHook;
  
  // Use selected asset from props or from hook
  const selectedAsset = selectedAssetId 
    ? getAssetById(selectedAssetId)
    : lightAssetsHook.selectedAsset;

  const handleVectorComplete = useCallback((vector: Vector) => {
    console.log('Vector complete callback called with:', vector);
    console.log('Selected asset:', selectedAsset);
    if (selectedAsset) {
      const newString = lightStringsHook.addLightString(vector, selectedAsset.id, selectedAsset.spacing);
      console.log('Light string added:', newString);
    } else {
      console.log('No selected asset to create light string');
    }
  }, [selectedAsset, lightStringsHook]);

  const handleCanvasTap = useCallback((point: Point) => {
    console.log('Canvas tap callback called with point:', point);
    const wasSelected = lightStringsHook.selectLightString(point);
    if (!wasSelected) {
      lightStringsHook.deselectLightString();
    }
    onSelectionChange?.(lightStringsHook.selectionState.selectedStringId);
  }, [lightStringsHook, onSelectionChange]);

  const vectorDrawing = useVectorDrawing({
    canvasLayout,
    onVectorComplete: handleVectorComplete,
    onCanvasTap: handleCanvasTap,
    selectedAssetId: selectedAsset?.id || ''
  });

  const handleCanvasLayout = useCallback((event: any) => {
    const { x, y, width, height } = event.nativeEvent.layout;
    console.log('Canvas layout measured:', { x, y, width, height });
    setCanvasLayout({ x, y, width, height });
  }, []);

  console.log('InteractiveCanvas render - canvasLayout:', canvasLayout);

  return (
    <View style={styles.container}>
      <View
        style={styles.canvasContainer}
        onLayout={handleCanvasLayout}
        {...vectorDrawing.panHandlers}
      >
        {/* Background Image */}
        <Image
          source={{ uri: imageUrl }}
          style={styles.backgroundImage}
          contentFit="contain"
          onLoad={() => console.log('Image loaded')}
          onError={(error) => console.log('Image error:', error)}
        />
        
        {/* Light String Overlay */}
        {canvasLayout ? (
          <LightStringRenderer
            lightStrings={lightStringsHook.lightStrings}
            currentVector={vectorDrawing.currentVector}
            selectedStringId={lightStringsHook.selectionState.selectedStringId}
            canvasLayout={canvasLayout}
            getAssetById={getAssetById}
          />
        ) : (
          <View style={{ position: 'absolute', top: 10, left: 10, backgroundColor: 'red', padding: 5 }}>
            <Text style={{ color: 'white', fontSize: 12 }}>No Layout</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  canvasContainer: {
    flex: 1,
    position: 'relative'
  },
  backgroundImage: {
    width: '100%',
    height: '100%'
  }
});