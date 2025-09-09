// hooks/useLightAssets.js
import React from "react";
import ImageLight from "~/components/editor/ImageLight";
import { customLightStorage } from "~/services/customLightStorage";

// Constants for better maintainability
const LIGHT_CONSTANTS = {
  // Spacing (pixels representing real-world spacing)
  C9_SPACING: 18, // ~12" real-world spacing

  // Base sizes
  MINI_BASE_SIZE: 8,

  // Glow and shadow settings
  GLOW_MULTIPLIER: 2,
  SHADOW_RADIUS_MULTIPLIER: 0.4,
  DEFAULT_SHADOW_OPACITY: 1,
};

export function useLightAssets() {
  // Custom assets state
  const [customAssets, setCustomAssets] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(true);

  // Light asset definitions
  const lightAssets = [
    {
      id: "c9-warm-white-image",
      name: "Warm White",
      category: "string",
      type: "c9",
      spacing: LIGHT_CONSTANTS.C9_SPACING,
      baseSize: 48,
      renderType: "image",
      component: ImageLight,
      lightImage: require("~/assets/lights/Warm-White.png"),
      image: require("~/assets/light-thumbnails/Warm-White.png"),
    },
    {
      id: "c9-red-image",
      name: "Red",
      category: "string",
      type: "c9",
      spacing: LIGHT_CONSTANTS.C9_SPACING,
      baseSize: 48,
      renderType: "image",
      component: ImageLight,
      lightImage: require("~/assets/lights/Red.png"),
      image: require("~/assets/light-thumbnails/Red.png"),
    },
    {
      id: "c9-blue-image",
      name: "Blue",
      category: "string",
      type: "c9",
      spacing: LIGHT_CONSTANTS.C9_SPACING,
      baseSize: 48,
      renderType: "image",
      component: ImageLight,
      lightImage: require("~/assets/lights/Blue.png"),
      image: require("~/assets/light-thumbnails/Blue.png"),
    },
    {
      id: "c9-green-image",
      name: "Green",
      category: "string",
      type: "c9",
      spacing: LIGHT_CONSTANTS.C9_SPACING,
      baseSize: 48,
      renderType: "image",
      component: ImageLight,
      lightImage: require("~/assets/lights/Green.png"),
      image: require("~/assets/light-thumbnails/Green.png"),
    },
    {
      id: "c9-yellow-image",
      name: "Yellow",
      category: "string",
      type: "c9",
      spacing: LIGHT_CONSTANTS.C9_SPACING,
      baseSize: 48,
      renderType: "image",
      component: ImageLight,
      lightImage: require("~/assets/lights/Yellow.png"),
      image: require("~/assets/light-thumbnails/Yellow.png"),
    },
    {
      id: "c9-orange-image",
      name: "Orange",
      category: "string",
      type: "c9",
      spacing: LIGHT_CONSTANTS.C9_SPACING,
      baseSize: 48,
      renderType: "image",
      component: ImageLight,
      lightImage: require("~/assets/lights/Orange.png"),
      image: require("~/assets/light-thumbnails/Orange.png"),
    },
    {
      id: "c9-cool-white-image",
      name: "Cool White",
      category: "string",
      type: "c9",
      spacing: LIGHT_CONSTANTS.C9_SPACING,
      baseSize: 48,
      renderType: "image",
      component: ImageLight,
      lightImage: require("~/assets/lights/Cool-White.png"),
      image: require("~/assets/light-thumbnails/Cool-White.png"),
    },
    {
      id: "c9-purple-image",
      name: "Purple",
      category: "string",
      type: "c9",
      spacing: LIGHT_CONSTANTS.C9_SPACING,
      baseSize: 48,
      renderType: "image",
      component: ImageLight,
      lightImage: require("~/assets/lights/Purple.png"),
      image: require("~/assets/light-thumbnails/Purple.png"),
    },
    {
      id: "c9-dark-blue-image",
      name: "Dark Blue",
      category: "string",
      type: "c9",
      spacing: LIGHT_CONSTANTS.C9_SPACING,
      baseSize: 48,
      renderType: "image",
      component: ImageLight,
      lightImage: require("~/assets/lights/Dark-Blue.png"),
      image: require("~/assets/light-thumbnails/Dark-Blue.png"),
    },
    // Pattern-based lights
    {
      id: "c9-multicolor-pattern",
      name: "Multicolor",
      category: "string",
      type: "c9",
      spacing: LIGHT_CONSTANTS.C9_SPACING,
      baseSize: 48,
      renderType: "pattern",
      component: ImageLight,
      pattern: [
        { lightImage: require("~/assets/lights/Green.png"), name: "Green" },
        { lightImage: require("~/assets/lights/Blue.png"), name: "Blue" },
        { lightImage: require("~/assets/lights/Yellow.png"), name: "Yellow" },
        { lightImage: require("~/assets/lights/Red.png"), name: "Red" },
      ],
      image: require("~/assets/light-thumbnails/Multicolor.png"),
    },
    {
      id: "c9-4-bulb-pattern",
      name: "4 Bulb Pattern",
      category: "string",
      type: "c9",
      spacing: LIGHT_CONSTANTS.C9_SPACING,
      baseSize: 48,
      renderType: "pattern",
      component: ImageLight,
      pattern: [
        { lightImage: require("~/assets/lights/Yellow.png"), name: "Yellow" },
        { lightImage: require("~/assets/lights/Red.png"), name: "Red" },
        { lightImage: require("~/assets/lights/Yellow.png"), name: "Yellow" },
        { lightImage: require("~/assets/lights/Green.png"), name: "Green" },
      ],
      image: require("~/assets/light-thumbnails/Yellow-Red-Green.png"),
    },
    {
      id: "c9-red-white-pattern",
      name: "Red & White",
      category: "string",
      type: "c9",
      spacing: LIGHT_CONSTANTS.C9_SPACING,
      baseSize: 48,
      renderType: "pattern",
      component: ImageLight,
      pattern: [
        { lightImage: require("~/assets/lights/Red.png"), name: "Red" },
        { lightImage: require("~/assets/lights/Red.png"), name: "Red" },
        {
          lightImage: require("~/assets/lights/Warm-White.png"),
          name: "White",
        },
        {
          lightImage: require("~/assets/lights/Warm-White.png"),
          name: "White",
        },
      ],
      image: require("~/assets/light-thumbnails/Red-White.png"),
    },
  ];

  const [selectedAsset, setSelectedAsset] = React.useState(null);

  // Load custom assets from storage on mount
  React.useEffect(() => {
    const loadCustomAssets = async () => {
      try {
        const savedCustomAssets = await customLightStorage.getCustomLights();
        setCustomAssets(savedCustomAssets);
      } catch (error) {
        console.error("💡 useLightAssets: Error loading custom assets:", error);
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
    if (category === "custom") {
      return customAssets;
    }
    return lightAssets.filter((asset) => asset.category === category);
  };

  // Get all categories
  const getCategories = () => {
    const categories = [...new Set(lightAssets.map((asset) => asset.category))];
    // Always include custom category so users can discover the feature
    categories.push("custom");
    return categories;
  };

  // Get all types within a category
  const getTypesByCategory = (category) => {
    const categoryAssets = getAssetsByCategory(category);
    return [...new Set(categoryAssets.map((asset) => asset.type))];
  };

  // Get render style for SimpleLightRenderer - FIXED border width calculation
  const getLightRenderStyle = (assetId, scale = 1, lightIndex = 0) => {
    const asset = getAssetById(assetId);
    if (!asset) return null;

    const baseSize = asset.baseSize || LIGHT_CONSTANTS.MINI_BASE_SIZE;
    const glowSize = baseSize * LIGHT_CONSTANTS.GLOW_MULTIPLIER * scale;

    // Get the base style (either static or function)
    let baseStyle;
    if (typeof asset.renderStyle === "function") {
      baseStyle = asset.renderStyle(lightIndex);
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
      shadowOpacity:
        baseStyle.shadowOpacity || LIGHT_CONSTANTS.DEFAULT_SHADOW_OPACITY,
      shadowRadius:
        baseStyle.shadowRadius ||
        baseSize * LIGHT_CONSTANTS.SHADOW_RADIUS_MULTIPLIER * scale,
      ...baseStyle,
    };

    // Handle special width ratio (for icicles)
    if (baseStyle.widthRatio) {
      style.width = glowSize * baseStyle.widthRatio;
    }

    return style;
  };

  // Create a new custom light asset
  const createCustomAsset = async (name, config) => {
    try {
      const lightAssetData = {
        name: name,
        category: "custom",
        type: "custom",
        spacing: config.spacing || 36,
        baseSize: config.baseSize || 12,
        renderType: "style",
        isPattern: config.isPattern || false,
        patternColors: config.patternColors,
        backgroundColor: config.backgroundColor,
        shadowColor: config.shadowColor,
        shadowOpacity: config.shadowOpacity || 0.8,
        borderColor: config.borderColor,
        renderStyle: config.isPattern
          ? undefined // Will be restored by storage service
          : {
              backgroundColor: config.backgroundColor || "#ffffff",
              shadowColor:
                config.shadowColor || config.backgroundColor || "#ffffff",
              shadowOpacity: config.shadowOpacity || 0.8,
              shadowRadius: (config.baseSize || 12) * 0.4,
              borderColor: config.borderColor,
              borderWidth: config.borderColor ? 2 : undefined,
            },
      };

      // console.log("custom light asset data: ", JSON.stringify(lightAssetData));

      const savedAsset =
        await customLightStorage.saveCustomLight(lightAssetData);

      // Update local state
      setCustomAssets((prev) => [...prev, savedAsset]);

      return savedAsset;
    } catch (error) {
      console.error("💡 useLightAssets: Error creating custom asset:", error);
      throw error;
    }
  };

  // Create a new custom pattern using image assets
  const createCustomPattern = async (name, config) => {
    try {
      const patternAssetData = {
        name: name,
        category: "custom",
        type: "custom",
        spacing: config.spacing || LIGHT_CONSTANTS.C9_SPACING,
        baseSize: config.baseSize || 48,
        renderType: "pattern",
        component: ImageLight,
        pattern: config.pattern, // Array of { lightImage, name }
        image: require("~/assets/light-thumbnails/Custom-Pattern.png"), // Thumbnail for UI
      };

      const savedAsset =
        await customLightStorage.saveCustomLight(patternAssetData);

      // Update local state
      setCustomAssets((prev) => [...prev, savedAsset]);

      return savedAsset;
    } catch (error) {
      console.error("💡 useLightAssets: Error creating custom pattern:", error);
      throw error;
    }
  };

  // Remove a custom asset
  const removeCustomAsset = async (id) => {
    try {
      await customLightStorage.deleteCustomLight(id);

      // Update local state
      setCustomAssets((prev) => prev.filter((asset) => asset.id !== id));
    } catch (error) {
      console.error("💡 useLightAssets: Error removing custom asset:", error);
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
    createCustomPattern,
    removeCustomAsset,
    customAssets,
    isLoading,
  };
}
