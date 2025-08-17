// hooks/useLightAssets.js
import React from "react";
import { customLightStorage } from "~/services/customLightStorage";

export function useLightAssets() {
  // Custom assets state
  const [customAssets, setCustomAssets] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(true);

  // Light asset definitions - using only renderStyle for consistent rendering
  const lightAssets = [
    // Professional Grade LED String Lights
    {
      id: "c9-warm-white",
      name: "Warm White",
      category: "string",
      type: "c9",
      spacing: 36,
      baseSize: 12,
      renderType: "image",
      image: require("~/assets/light-thumbnails/Warm-White.png"),
      renderStyle: {
        backgroundColor: "#FFF4E6",
        shadowColor: "#FFE4B5",
        shadowOpacity: 1.2,
        shadowRadius: 18,
        borderColor: "rgba(255, 228, 181, 0.6)",
        borderWidth: 2,
      },
    },
    {
      id: "c9-multicolor",
      name: "Multicolor",
      category: "string",
      type: "c9",
      spacing: 36,
      baseSize: 12,
      renderType: "image",
      image: require("~/assets/light-thumbnails/Multicolor.png"),
      renderStyle: (lightIndex = 0) => {
        const colors = ["#33ff33", "#3333ff", "#ffff33", "#ff3333", "#ffff33"];
        const color = colors[lightIndex % colors.length];
        return {
          backgroundColor: color,
          shadowColor: color,
          shadowOpacity: 0.6,
        };
      },
    },
    {
      id: "c9-red-white",
      name: "Red & White",
      category: "string",
      type: "c9",
      spacing: 36,
      baseSize: 12,
      renderType: "image",
      image: require("~/assets/light-thumbnails/Red-White.png"),
      renderStyle: (lightIndex = 0) => {
        const pattern = ["#ff3333", "#ff3333", "#ffffff", "#ffffff"];
        const color = pattern[lightIndex % pattern.length];
        const isRed = color === "#ff3333";
        return {
          backgroundColor: color,
          shadowColor: isRed ? "#ff3333" : "#fff5e0",
          shadowOpacity: isRed ? 0.6 : 0.8,
        };
      },
    },
    {
      id: "c9-4-bulb-pattern",
      name: "4 Bulb Pattern",
      category: "string",
      type: "c9",
      spacing: 36,
      baseSize: 12,
      renderType: "image",
      image: require("~/assets/light-thumbnails/Yellow-Red-Green.png"),
      renderStyle: (lightIndex = 0) => {
        const colors = ["#FFD59A", "#C1121F", "#FFD59A", "#0B6623"];
        const color = colors[lightIndex % colors.length];
        return {
          backgroundColor: color,
          shadowColor: color,
          shadowOpacity: 0.8,
        };
      },
    },
    {
      id: "c7-c9-cool-white",
      name: "Cool White",
      category: "string",
      type: "c9",
      spacing: 36,
      baseSize: 12,
      renderType: "image",
      image: require("~/assets/light-thumbnails/Cool-White.png"),
      renderStyle: {
        backgroundColor: "#E8F9FF",
        shadowColor: "#E8F9FF",
        shadowOpacity: 0.8,
        borderColor: "rgba(232, 249, 255, 0.3)",
      },
    },
    {
      id: "c7-c9-red",
      name: "Red",
      category: "string",
      type: "c9",
      spacing: 36,
      baseSize: 12,
      renderType: "image",
      image: require("~/assets/light-thumbnails/Red.png"),
      renderStyle: {
        backgroundColor: "#C1121F",
        shadowColor: "#C1121F",
        shadowOpacity: 0.8,
        borderColor: "rgba(193, 18, 31, 0.3)",
      },
    },
    {
      id: "c7-c9-green",
      name: "Green",
      category: "string",
      type: "c9",
      spacing: 36,
      baseSize: 12,
      renderType: "image",
      image: require("~/assets/light-thumbnails/Green.png"),
      renderStyle: {
        backgroundColor: "#0B6623",
        shadowColor: "#0B6623",
        shadowOpacity: 0.8,
        borderColor: "rgba(11, 102, 35, 0.3)",
      },
    },
    {
      id: "c7-c9-blue",
      name: "Blue",
      category: "string",
      type: "c9",
      spacing: 36,
      baseSize: 12,
      renderType: "image",
      image: require("~/assets/light-thumbnails/Blue.png"),
      renderStyle: {
        backgroundColor: "#0074B7",
        shadowColor: "#0074B7",
        shadowOpacity: 0.8,
        borderColor: "rgba(0, 116, 183, 0.3)",
      },
    },
    {
      id: "mini-led-warm",
      name: "Mini Warm White",
      category: "string",
      type: "mini",
      spacing: 15,
      baseSize: 8,
      renderType: "image",
      image: require("~/assets/light-thumbnails/Mini-Warm-White.png"),
      renderStyle: {
        backgroundColor: "#FFE6B3",
        shadowColor: "#fff5e0",
        shadowOpacity: 0.6,
      },
    },
    {
      id: "mini-led-multicolor",
      name: "Mini Multicolor",
      category: "string",
      type: "mini",
      spacing: 15,
      baseSize: 8,
      renderType: "image",
      image: require("~/assets/light-thumbnails/Mini-Multicolor.png"),
      renderStyle: (lightIndex = 0) => {
        const colors = ["#33ff33", "#3333ff", "#ffff33", "#ff3333", "#ffff33"];
        const color = colors[lightIndex % colors.length];
        return {
          backgroundColor: color,
          shadowColor: color,
          shadowOpacity: 0.5,
        };
      },
    },
    // {
    //   id: "mini-yellow",
    //   name: "Mini Yellow",
    //   category: "string",
    //   type: "mini",
    //   spacing: 15,
    //   baseSize: 8,
    //   renderStyle: {
    //     backgroundColor: "#FFD300",
    //     shadowColor: "#FFD300",
    //     shadowOpacity: 0.6,
    //   },
    // },
  ];

  const [selectedAsset, setSelectedAsset] = React.useState(null);

  // Load custom assets from storage on mount
  React.useEffect(() => {
    const loadCustomAssets = async () => {
      try {
        const savedCustomAssets = await customLightStorage.getCustomLights();
        setCustomAssets(savedCustomAssets);
        console.log('💡 useLightAssets: Loaded', savedCustomAssets.length, 'custom light assets');
      } catch (error) {
        console.error('💡 useLightAssets: Error loading custom assets:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCustomAssets();
  }, []);

  // Combine predefined and custom assets
  const allAssets = [...lightAssets, ...customAssets];

  // Find the asset by ID
  const getAssetById = (id) => allAssets.find((asset) => asset.id === id);

  // Filter assets by category
  const getAssetsByCategory = (category) => {
    if (category === 'custom') {
      return customAssets;
    }
    return lightAssets.filter((asset) => asset.category === category);
  };

  // Get all categories
  const getCategories = () => {
    const categories = [...new Set(lightAssets.map((asset) => asset.category))];
    // Always include custom category so users can discover the feature
    categories.push('custom');
    return categories;
  };

  // Get all types within a category
  const getTypesByCategory = (category) => {
    const categoryAssets = getAssetsByCategory(category);
    return [...new Set(categoryAssets.map((asset) => asset.type))];
  };

  // Get render style for SimpleLightRenderer
  const getLightRenderStyle = (assetId, scale = 1, lightIndex = 0) => {
    const asset = getAssetById(assetId);
    if (!asset) return null;

    const baseSize = asset.baseSize || 8;
    const glowSize = baseSize * 1.8 * scale;

    // Get the base style (either static or function)
    let baseStyle;
    if (typeof asset.renderStyle === "function") {
      baseStyle = asset.renderStyle(lightIndex);
      if (asset.category === 'custom' && asset.isPattern) {
        console.log('💡 getLightRenderStyle: Pattern asset', asset.name, 'lightIndex:', lightIndex, 'color:', baseStyle.backgroundColor);
      }
    } else {
      baseStyle = asset.renderStyle || {};
    }

    // Apply size modifiers
    const style = {
      width: glowSize * (baseStyle.sizeRatio || 1),
      height: glowSize * (baseStyle.heightRatio || baseStyle.sizeRatio || 1),
      borderRadius: glowSize / 2,
      backgroundColor: baseStyle.backgroundColor || "#ffffff",
      shadowColor:
        baseStyle.shadowColor || baseStyle.backgroundColor || "#ffffff",
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: baseStyle.shadowOpacity || 0.6,
      shadowRadius: baseSize * 0.4 * scale,
      ...baseStyle,
    };

    // Handle special width ratio (for icicles)
    if (baseStyle.widthRatio) {
      style.width = glowSize * baseStyle.widthRatio;
    }

    // Handle border for lights that need it
    if (baseStyle.borderColor) {
      style.borderWidth = Math.max(1, (glowSize - baseSize * scale) / 2);
      style.borderColor = baseStyle.borderColor;
    }

    return style;
  };

  // Create a new custom light asset
  const createCustomAsset = async (name, config) => {
    try {
      const lightAssetData = {
        name: name,
        category: 'custom',
        type: 'custom',
        spacing: config.spacing || 36,
        baseSize: config.baseSize || 12,
        renderType: 'style',
        isPattern: config.isPattern || false,
        patternColors: config.patternColors,
        backgroundColor: config.backgroundColor,
        shadowColor: config.shadowColor,
        shadowOpacity: config.shadowOpacity || 0.8,
        borderColor: config.borderColor,
        renderStyle: config.isPattern ? 
          undefined : // Will be restored by storage service
          {
            backgroundColor: config.backgroundColor || '#ffffff',
            shadowColor: config.shadowColor || config.backgroundColor || '#ffffff',
            shadowOpacity: config.shadowOpacity || 0.8,
            shadowRadius: (config.baseSize || 12) * 0.4,
            borderColor: config.borderColor,
            borderWidth: config.borderColor ? 2 : undefined,
          },
      };

      const savedAsset = await customLightStorage.saveCustomLight(lightAssetData);
      
      // Update local state
      setCustomAssets(prev => [...prev, savedAsset]);
      
      console.log('💡 useLightAssets: Created and saved custom asset:', savedAsset.name);
      return savedAsset;
    } catch (error) {
      console.error('💡 useLightAssets: Error creating custom asset:', error);
      throw error;
    }
  };

  // Remove a custom asset
  const removeCustomAsset = async (id) => {
    try {
      await customLightStorage.deleteCustomLight(id);
      
      // Update local state
      setCustomAssets(prev => prev.filter(asset => asset.id !== id));
      
      console.log('💡 useLightAssets: Removed custom asset:', id);
    } catch (error) {
      console.error('💡 useLightAssets: Error removing custom asset:', error);
      throw error;
    }
  };

  return {
    lightAssets: allAssets,
    selectedAsset,
    setSelectedAsset,
    getAssetById,
    getAssetsByCategory,
    getCategories,
    getTypesByCategory,
    getLightRenderStyle,
    createCustomAsset,
    removeCustomAsset,
    customAssets,
    isLoading,
  };
}
