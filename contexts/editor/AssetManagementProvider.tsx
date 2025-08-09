// contexts/editor/AssetManagementProvider.tsx
import React, { createContext, ReactNode } from 'react';
import { useLightAssets } from '~/hooks/editor/useLightAssets';
import { useWreathAssets } from '~/hooks/editor/useWreathAssets';

// Types
interface Asset {
  id: string;
  name: string;
  category: string;
  type: string;
}

interface AssetManagementContextValue {
  // Assets
  lightAssets: Asset[];
  wreathAssets: Asset[];
  allAssets: Asset[];
  selectedAsset: Asset | null;
  
  // Asset Operations
  setSelectedAsset: (asset: Asset | null) => void;
  getAssetById: (id: string) => Asset | undefined;
  getAssetsByCategory: (category: string) => Asset[];
  getCategories: () => string[];
  
  // Light-specific functions
  getLightSizeScale: () => number;
  getLightRenderStyle: (assetId: string, scale?: number, lightIndex?: number) => any;
  getSharedGradientDefs: () => React.ReactElement[];
  getLightDefinitions: () => React.ReactElement[];
  
  // Wreath-specific functions
  getWreathAssetById: (id: string) => Asset | undefined;
  getWreathTypes: () => string[];
}

// Create Context
export const AssetManagementContext = createContext<AssetManagementContextValue | null>(null);

// Provider Component
interface AssetManagementProviderProps {
  children: ReactNode;
}

export function AssetManagementProvider({ children }: AssetManagementProviderProps) {
  // Get light assets
  const {
    lightAssets,
    getAssetById: getLightAssetById,
    getAssetsByCategory: getLightAssetsByCategory,
    getCategories: getLightCategories,
    getLightRenderStyle,
    getSharedGradientDefs,
    getLightDefinitions,
  } = useLightAssets();

  // Get wreath assets
  const {
    wreathAssets,
    getWreathAssetById,
    getWreathTypes,
  } = useWreathAssets();

  // Combined asset system
  const allAssets = [...lightAssets, ...wreathAssets];
  const [selectedAsset, setSelectedAsset] = React.useState<Asset | null>(null);

  // Combined asset helpers
  const getAssetById = (id: string): Asset | undefined => {
    return getLightAssetById(id) || getWreathAssetById(id);
  };

  const getAssetsByCategory = (category: string): Asset[] => {
    if (category === 'wreath') {
      return wreathAssets;
    }
    return getLightAssetsByCategory(category);
  };

  const getCategories = (): string[] => {
    const lightCategories = getLightCategories();
    return [...lightCategories, 'wreath'];
  };

  // Light size scale function - TODO: This will need to be connected to reference scale
  // For now, returning a default scale
  const getLightSizeScale = (): number => {
    return 1.0; // This will be updated when we integrate with ReferenceScaleContext
  };

  // Context value
  const contextValue: AssetManagementContextValue = {
    // Assets
    lightAssets,
    wreathAssets,
    allAssets,
    selectedAsset,
    
    // Asset Operations
    setSelectedAsset,
    getAssetById,
    getAssetsByCategory,
    getCategories,
    
    // Light-specific functions
    getLightSizeScale,
    getLightRenderStyle,
    getSharedGradientDefs,
    getLightDefinitions,
    
    // Wreath-specific functions
    getWreathAssetById,
    getWreathTypes,
  };

  return (
    <AssetManagementContext.Provider value={contextValue}>
      {children}
    </AssetManagementContext.Provider>
  );
}

// Custom Hook
export function useAssetManagement(): AssetManagementContextValue {
  const context = React.useContext(AssetManagementContext);
  if (!context) {
    throw new Error('useAssetManagement must be used within AssetManagementProvider');
  }
  return context;
}