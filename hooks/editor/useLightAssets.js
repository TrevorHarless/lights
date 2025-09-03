// hooks/useLightAssets.js
import React from "react";
import { customLightStorage } from "~/services/customLightStorage";

// Constants for better maintainability
const LIGHT_CONSTANTS = {
  // Spacing (pixels representing real-world spacing)
  C9_SPACING: 36, // ~12" real-world spacing
  MINI_SPACING: 15, // ~6" real-world spacing

  // Base sizes
  C9_BASE_SIZE: 12,
  MINI_BASE_SIZE: 8,

  // Border and glow settings
  MAX_BORDER_WIDTH: 2, // Prevent thick black borders
  GLOW_MULTIPLIER: 1.8,
  SHADOW_RADIUS_MULTIPLIER: 0.4,

  // Opacity settings
  DEFAULT_SHADOW_OPACITY: 0.8,
  BORDER_OPACITY: "40", // 25% opacity as hex suffix
  MINI_BORDER_OPACITY: "30", // 18.75% opacity as hex suffix
};

// Reusable color patterns to reduce duplication - using RGBA for better control
const COLOR_PATTERNS = {
  multicolor: [
    {
      bg: "rgba(57, 205, 57, 1)",
      shadow: "rgba(43, 166, 43, 1)",
      name: "Green",
    },
    {
      bg: "rgba(29, 116, 255, 1)", // Royal Blue
      shadow: "rgba(65, 105, 225, 0.9)",
      name: "Blue",
    },
    {
      bg: "rgba(255, 232, 101, 1)", // Gold Yellow
      shadow: "rgba(255, 232, 101, 1)",
      name: "Yellow",
    },
    {
      bg: "rgba(220, 20, 60, 1)", // Crimson Red
      shadow: "rgba(220, 20, 60, 0.9)",
      name: "Red",
    },
  ],

  fourBulbPattern: [
    {
      bg: "rgba(255, 232, 101, 1)", // Gold Yellow
      shadow: "rgba(255, 232, 101, 1)",
      name: "Yellow",
    },
    {
      bg: "rgba(220, 20, 60, 1)", // Crimson Red
      shadow: "rgba(220, 20, 60, 0.9)",
      name: "Red",
    },
    {
      bg: "rgba(255, 232, 101, 1)", // Gold Yellow
      shadow: "rgba(255, 232, 101, 1)",
      name: "Yellow",
    },
    {
      bg: "rgba(57, 205, 57, 1)", // Forest Green
      shadow: "rgba(57, 205, 57, 1)",
      name: "Green",
    },
  ],

  redWhitePattern: [
    {
      bg: "rgba(220, 20, 60, 1)", // Crimson Red
      shadow: "rgba(220, 20, 60, 0.9)",
      name: "Red",
    },
    {
      bg: "rgba(220, 20, 60, 1)", // Crimson Red
      shadow: "rgba(220, 20, 60, 0.9)",
      name: "Red",
    },
    {
      bg: "rgba(255, 255, 255, 1)", // Pure White
      shadow: "rgba(255, 245, 224, 0.9)", // Warm white glow
      name: "White",
    },
    {
      bg: "rgba(255, 255, 255, 1)", // Pure White
      shadow: "rgba(255, 245, 224, 0.9)", // Warm white glow
      name: "White",
    },
  ],

  miniMulticolor: [
    {
      bg: "rgba(57, 205, 57, 1)",
      shadow: "rgba(43, 166, 43, 1)",
      name: "Green",
    },
    {
      bg: "rgba(29, 116, 255, 1)", // Royal Blue
      shadow: "rgba(65, 105, 225, 0.9)",
      name: "Blue",
    },
    {
      bg: "rgba(255, 232, 101, 1)", // Gold Yellow
      shadow: "rgba(255, 232, 101, 1)",
      name: "Yellow",
    },
    {
      bg: "rgba(220, 20, 60, 1)", // Crimson Red
      shadow: "rgba(220, 20, 60, 0.9)",
      name: "Red",
    },
  ],
};

// Helper function to convert RGBA to lower opacity for borders
const createBorderColor = (rgbaColor, isMinLight = false) => {
  // If it's already an RGBA string, extract RGB and apply new opacity
  if (rgbaColor.startsWith("rgba(")) {
    const rgbMatch = rgbaColor.match(
      /rgba\((\d+),\s*(\d+),\s*(\d+),\s*[\d.]+\)/
    );
    if (rgbMatch) {
      const [, r, g, b] = rgbMatch;
      const opacity = isMinLight ? 0.18 : 0.25; // 18% for mini, 25% for regular
      return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    }
  }

  // If it's a hex color, convert to RGBA
  if (rgbaColor.startsWith("#")) {
    const hex = rgbaColor.replace("#", "");
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const opacity = isMinLight ? 0.18 : 0.25;
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }

  // Fallback: return the original color with reduced opacity
  return rgbaColor;
};

// Helper function to create pattern-based render styles
const createPatternRenderStyle = (pattern, isMinLight = false) => {
  return (lightIndex = 0) => {
    const colorInfo = pattern[lightIndex % pattern.length];

    return {
      backgroundColor: colorInfo.bg,
      shadowColor: colorInfo.shadow,
      shadowOpacity: LIGHT_CONSTANTS.DEFAULT_SHADOW_OPACITY,
      borderColor: createBorderColor(colorInfo.bg, isMinLight),
      borderWidth: isMinLight ? 1 : 1.5,
    };
  };
};

// Helper function to create solid color render styles
const createSolidRenderStyle = (
  backgroundColor,
  shadowColor,
  isMinLight = false
) => {
  return {
    backgroundColor,
    shadowColor: shadowColor || backgroundColor,
    shadowOpacity: LIGHT_CONSTANTS.DEFAULT_SHADOW_OPACITY,
    borderColor: createBorderColor(backgroundColor, isMinLight),
    borderWidth: isMinLight ? 1 : 1.5,
  };
};

export function useLightAssets() {
  // Custom assets state
  const [customAssets, setCustomAssets] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(true);

  // Light asset definitions - using standardized configurations
  const lightAssets = [
    // C9 String Lights
    {
      id: "c9-warm-white",
      name: "Warm White",
      category: "string",
      type: "c9",
      spacing: LIGHT_CONSTANTS.C9_SPACING,
      baseSize: LIGHT_CONSTANTS.C9_BASE_SIZE,
      renderType: "image",
      image: require("~/assets/light-thumbnails/Warm-White.png"),
      renderStyle: {
        backgroundColor: "#FFF8DC",
        shadowColor: "#FFD700",
        shadowOpacity: LIGHT_CONSTANTS.DEFAULT_SHADOW_OPACITY,
        shadowRadius: 16,
        borderColor: "#FFEAA740",
        borderWidth: 1.5,
      },
    },
    {
      id: "c9-multicolor",
      name: "Multicolor",
      category: "string",
      type: "c9",
      spacing: LIGHT_CONSTANTS.C9_SPACING,
      baseSize: LIGHT_CONSTANTS.C9_BASE_SIZE,
      renderType: "image",
      image: require("~/assets/light-thumbnails/Multicolor.png"),
      renderStyle: createPatternRenderStyle(COLOR_PATTERNS.multicolor, false),
    },
    {
      id: "c9-red-white",
      name: "Red & White",
      category: "string",
      type: "c9",
      spacing: LIGHT_CONSTANTS.C9_SPACING,
      baseSize: LIGHT_CONSTANTS.C9_BASE_SIZE,
      renderType: "image",
      image: require("~/assets/light-thumbnails/Red-White.png"),
      renderStyle: createPatternRenderStyle(
        COLOR_PATTERNS.redWhitePattern,
        false
      ),
    },
    {
      id: "c9-4-bulb-pattern",
      name: "4 Bulb Pattern",
      category: "string",
      type: "c9",
      spacing: LIGHT_CONSTANTS.C9_SPACING,
      baseSize: LIGHT_CONSTANTS.C9_BASE_SIZE,
      renderType: "image",
      image: require("~/assets/light-thumbnails/Yellow-Red-Green.png"),
      renderStyle: createPatternRenderStyle(
        COLOR_PATTERNS.fourBulbPattern,
        false
      ),
    },
    {
      id: "c7-c9-cool-white",
      name: "Cool White",
      category: "string",
      type: "c9",
      spacing: LIGHT_CONSTANTS.C9_SPACING,
      baseSize: LIGHT_CONSTANTS.C9_BASE_SIZE,
      renderType: "image",
      image: require("~/assets/light-thumbnails/Cool-White.png"),
      renderStyle: createSolidRenderStyle("#F4FDFF", "#E6F3FF", false),
    },
    {
      id: "c7-c9-red",
      name: "Red",
      category: "string",
      type: "c9",
      spacing: LIGHT_CONSTANTS.C9_SPACING,
      baseSize: LIGHT_CONSTANTS.C9_BASE_SIZE,
      renderType: "image",
      image: require("~/assets/light-thumbnails/Red.png"),
      renderStyle: createSolidRenderStyle(
        "rgba(220, 20, 60, 1)",
        "rgba(220, 20, 60, 1)",
        false
      ),
    },
    {
      id: "c7-c9-green",
      name: "Green",
      category: "string",
      type: "c9",
      spacing: LIGHT_CONSTANTS.C9_SPACING,
      baseSize: LIGHT_CONSTANTS.C9_BASE_SIZE,
      renderType: "image",
      image: require("~/assets/light-thumbnails/Green.png"),
      renderStyle: createSolidRenderStyle(
        "rgba(57, 205, 57, 1)",
        "rgba(57, 205, 57, 1)",
        false
      ),
    },
    {
      id: "c7-c9-blue",
      name: "Blue",
      category: "string",
      type: "c9",
      spacing: LIGHT_CONSTANTS.C9_SPACING,
      baseSize: LIGHT_CONSTANTS.C9_BASE_SIZE,
      renderType: "image",
      image: require("~/assets/light-thumbnails/Blue.png"),
      renderStyle: createSolidRenderStyle(
        "rgba(29, 116, 255, 1)",
        "rgba(29, 116, 255, 1)",
        false
      ),
    },
    {
      id: "mini-led-warm",
      name: "Mini Warm White",
      category: "mini",
      type: "mini",
      spacing: LIGHT_CONSTANTS.MINI_SPACING,
      baseSize: LIGHT_CONSTANTS.MINI_BASE_SIZE,
      renderType: "image",
      image: require("~/assets/light-thumbnails/Warm-White.png"),
      renderStyle: createSolidRenderStyle("#FFF8DC", "#FFD700", true),
    },
    {
      id: "mini-led-multicolor",
      name: "Mini Multicolor",
      category: "mini",
      type: "mini",
      spacing: LIGHT_CONSTANTS.MINI_SPACING,
      baseSize: LIGHT_CONSTANTS.MINI_BASE_SIZE,
      renderType: "image",
      image: require("~/assets/light-thumbnails/Multicolor.png"),
      renderStyle: createPatternRenderStyle(
        COLOR_PATTERNS.miniMulticolor,
        true
      ),
    },
    {
      id: "mini-red-white",
      name: "Mini Red & White",
      category: "mini",
      type: "mini",
      spacing: LIGHT_CONSTANTS.MINI_SPACING,
      baseSize: LIGHT_CONSTANTS.MINI_BASE_SIZE,
      renderType: "image",
      image: require("~/assets/light-thumbnails/Red-White.png"),
      renderStyle: createPatternRenderStyle(
        COLOR_PATTERNS.redWhitePattern,
        true
      ),
    },
    {
      id: "mini-4-bulb-pattern",
      name: "Mini 4 Bulb Pattern",
      category: "mini",
      type: "mini",
      spacing: LIGHT_CONSTANTS.MINI_SPACING,
      baseSize: LIGHT_CONSTANTS.MINI_BASE_SIZE,
      renderType: "image",
      image: require("~/assets/light-thumbnails/Yellow-Red-Green.png"),
      renderStyle: createPatternRenderStyle(
        COLOR_PATTERNS.fourBulbPattern,
        true
      ),
    },
    {
      id: "mini-cool-white",
      name: "Mini Cool White",
      category: "mini",
      type: "mini",
      spacing: LIGHT_CONSTANTS.MINI_SPACING,
      baseSize: LIGHT_CONSTANTS.MINI_BASE_SIZE,
      renderType: "image",
      image: require("~/assets/light-thumbnails/Cool-White.png"),
      renderStyle: createSolidRenderStyle("#F4FDFF", "#E6F3FF", true),
    },
    {
      id: "mini-red",
      name: "Mini Red",
      category: "mini",
      type: "mini",
      spacing: LIGHT_CONSTANTS.MINI_SPACING,
      baseSize: LIGHT_CONSTANTS.MINI_BASE_SIZE,
      renderType: "image",
      image: require("~/assets/light-thumbnails/Red.png"),
      renderStyle: createSolidRenderStyle(
        "rgba(220, 20, 60, 1)",
        "rgba(220, 20, 60, 1)",
        true
      ),
    },
    {
      id: "mini-green",
      name: "Mini Green",
      category: "mini",
      type: "mini",
      spacing: LIGHT_CONSTANTS.MINI_SPACING,
      baseSize: LIGHT_CONSTANTS.MINI_BASE_SIZE,
      renderType: "image",
      image: require("~/assets/light-thumbnails/Green.png"),
      renderStyle: createSolidRenderStyle(
        "rgba(57, 205, 57, 1)",
        "rgba(57, 205, 57, 1)",
        true
      ),
    },
    {
      id: "mini-blue",
      name: "Mini Blue",
      category: "mini",
      type: "mini",
      spacing: LIGHT_CONSTANTS.MINI_SPACING,
      baseSize: LIGHT_CONSTANTS.MINI_BASE_SIZE,
      renderType: "image",
      image: require("~/assets/light-thumbnails/Blue.png"),
      renderStyle: createSolidRenderStyle(
        "rgba(29, 116, 255, 1)",
        "rgba(29, 116, 255, 1)",
        true
      ),
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

    // FIXED: Handle border for lights that need it - prevent thick black borders
    if (baseStyle.borderColor) {
      // Use a reasonable border width instead of the problematic calculation
      // The old calculation: Math.max(1, (glowSize - baseSize * scale) / 2)
      // could create very thick borders that appeared as black circles
      style.borderWidth = Math.min(
        baseStyle.borderWidth || LIGHT_CONSTANTS.MAX_BORDER_WIDTH,
        LIGHT_CONSTANTS.MAX_BORDER_WIDTH
      );
      style.borderColor = baseStyle.borderColor;
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
    removeCustomAsset,
    customAssets,
    isLoading,
  };
}
