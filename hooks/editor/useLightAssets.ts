import { useState, useCallback, useMemo } from 'react';
import { LightAsset, LightRenderProps } from '@/types/editor';
import React from 'react';

export const useLightAssets = () => {
  const [selectedAssetId, setSelectedAssetId] = useState<string>('warm-white');

  // Light asset definitions
  const lightAssets: LightAsset[] = useMemo(() => [
    {
      id: 'warm-white',
      name: 'Warm White',
      spacing: 15,
      renderFunction: ({ x, y, scale, gradientId }: LightRenderProps) => 
        React.createElement(Circle, {
          key: `light-${x}-${y}`,
          cx: x,
          cy: y,
          r: 3 * scale,
          fill: `url(#${gradientId})`,
          opacity: 0.9
        })
    },
    {
      id: 'blue-glow',
      name: 'Blue Glow',
      spacing: 18,
      renderFunction: ({ x, y, scale, gradientId }: LightRenderProps) =>
        React.createElement(Circle, {
          key: `light-${x}-${y}`,
          cx: x,
          cy: y,
          r: 4 * scale,
          fill: `url(#${gradientId})`,
          opacity: 0.8
        })
    },
    {
      id: 'multicolor',
      name: 'Multicolor',
      spacing: 12,
      renderFunction: ({ x, y, scale, gradientId }: LightRenderProps) =>
        React.createElement(Circle, {
          key: `light-${x}-${y}`,
          cx: x,
          cy: y,
          r: 3.5 * scale,
          fill: `url(#${gradientId})`,
          opacity: 0.85
        })
    },
    {
      id: 'icicle',
      name: 'Icicle',
      spacing: 20,
      renderFunction: ({ x, y, scale, gradientId }: LightRenderProps) =>
        React.createElement(Circle, {
          key: `light-${x}-${y}`,
          cx: x,
          cy: y,
          r: 2.5 * scale,
          fill: `url(#${gradientId})`,
          opacity: 0.95
        })
    }
  ], []);

  // Simplified - gradients are now defined directly in the SVG component

  const getAssetById = useCallback((assetId: string): LightAsset | null => {
    return lightAssets.find(asset => asset.id === assetId) || null;
  }, [lightAssets]);

  const getSelectedAsset = useCallback((): LightAsset | null => {
    return getAssetById(selectedAssetId);
  }, [selectedAssetId, getAssetById]);

  const selectAsset = useCallback((assetId: string) => {
    const asset = getAssetById(assetId);
    if (asset) {
      setSelectedAssetId(assetId);
    }
  }, [getAssetById]);

  return {
    lightAssets,
    selectedAssetId,
    selectedAsset: getSelectedAsset(),
    getAssetById,
    selectAsset
  };
};