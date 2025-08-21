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
      spacing: 36, // Default fallback spacing (pixels) - represents ~12" real-world spacing // Default fallback spacing (pixels) - represents ~12" real-world spacing
      baseSize: 12,
      renderType: "image",
      image: require("~/assets/light-thumbnails/Warm-White.png"),
      renderStyle: {
        backgroundColor: "#FFF8DC", // Cornsilk - more authentic warm white LED color
        shadowColor: "#FFD700", // Golden glow for realistic light emission
        shadowOpacity: 0.9, // Stronger, more visible glow
        shadowRadius: 16, // Custom glow radius for better definition
        borderColor: "#FFEAA7", // Soft golden border for bulb definition
        borderWidth: 1.5, // Thinner border for more subtle bulb outline
      },
    },
    {
      id: "c9-multicolor",
      name: "Multicolor",
      category: "string",
      type: "c9",
      spacing: 36, // Default fallback spacing (pixels) - represents ~12" real-world spacing
      baseSize: 12,
      renderType: "image",
      image: require("~/assets/light-thumbnails/Multicolor.png"),
      renderStyle: (lightIndex = 0) => {
        // Realistic holiday light colors - warmer, more muted tones like actual colored glass bulbs
        const colorData = [
          { bg: "#228B22", shadow: "#90EE90", name: "Green" }, // Forest green with soft glow
          { bg: "#4169E1", shadow: "#87CEEB", name: "Blue" }, // Royal blue with light glow
          { bg: "#FFD700", shadow: "#FFF8DC", name: "Yellow" }, // Rich gold with warm glow
          { bg: "#DC143C", shadow: "#FF6B6B", name: "Red" }, // Deep red with warm glow
          { bg: "#FFD700", shadow: "#FFF8DC", name: "Yellow" }, // Rich gold with warm glow
        ];

        const colorInfo = colorData[lightIndex % colorData.length];
        return {
          backgroundColor: colorInfo.bg,
          shadowColor: colorInfo.shadow,
          shadowOpacity: 0.8, // Use custom light approach - slightly softer than fixed value
          // Let shadowRadius be calculated by getLightRenderStyle function like custom lights
          borderColor: `${colorInfo.bg}40`, // Subtle border with 25% opacity of main color
          borderWidth: 1.5, // Keep consistent border thickness
        };
      },
    },
    {
      id: "c9-red-white",
      name: "Red & White",
      category: "string",
      type: "c9",
      spacing: 36, // Default fallback spacing (pixels) - represents ~12" real-world spacing
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
      spacing: 36, // Default fallback spacing (pixels) - represents ~12" real-world spacing
      baseSize: 12,
      renderType: "image",
      image: require("~/assets/light-thumbnails/Yellow-Red-Green.png"),
      renderStyle: (lightIndex = 0) => {
        // Classic 4-bulb pattern: Yellow-Red-Yellow-Green with realistic holiday light colors
        const colorData = [
          { bg: "#FFD700", shadow: "#FFF8DC", name: "Yellow" }, // Rich gold yellow with warm glow
          { bg: "#DC143C", shadow: "#FF6B6B", name: "Red" }, // Deep crimson red with warm glow
          { bg: "#FFD700", shadow: "#FFF8DC", name: "Yellow" }, // Rich gold yellow with warm glow
          { bg: "#228B22", shadow: "#90EE90", name: "Green" }, // Forest green with soft glow
        ];

        const colorInfo = colorData[lightIndex % colorData.length];
        return {
          backgroundColor: colorInfo.bg,
          shadowColor: colorInfo.shadow,
          shadowOpacity: 0.8, // Use custom light approach for consistent glow quality
          // Let shadowRadius be calculated by getLightRenderStyle function like custom lights
          borderColor: `${colorInfo.bg}40`, // Subtle border with 25% opacity of main color
          borderWidth: 1.5, // Consistent border thickness
        };
      },
    },
    {
      id: "c7-c9-cool-white",
      name: "Cool White",
      category: "string",
      type: "c9",
      spacing: 36, // Default fallback spacing (pixels) - represents ~12" real-world spacing
      baseSize: 12,
      renderType: "image",
      image: require("~/assets/light-thumbnails/Cool-White.png"),
      renderStyle: {
        backgroundColor: "#F4FDFF", // Ghost white - more realistic cool white LED color
        shadowColor: "#E6F3FF", // Subtle cool blue-white glow like real cool white LEDs
        shadowOpacity: 0.8, // Consistent with other improved assets
        borderColor: "#eef1ffff", // Soft blue-white border for better definition
        borderWidth: 1.5, // Consistent border thickness
      },
    },
    {
      id: "c7-c9-red",
      name: "Red",
      category: "string",
      type: "c9",
      spacing: 36, // Default fallback spacing (pixels) - represents ~12" real-world spacing
      baseSize: 12,
      renderType: "image",
      image: require("~/assets/light-thumbnails/Red.png"),
      renderStyle: {
        backgroundColor: "#DC143C", // Deep crimson red - matches multicolor pattern
        shadowColor: "#FF6B6B", // Warm red glow for realistic light emission
        shadowOpacity: 0.8, // Consistent with other improved assets
        borderColor: "#DC143C40", // Subtle border with 25% opacity of main color
        borderWidth: 1.5, // Consistent border thickness
      },
    },
    {
      id: "c7-c9-green",
      name: "Green",
      category: "string",
      type: "c9",
      spacing: 36, // Default fallback spacing (pixels) - represents ~12" real-world spacing
      baseSize: 12,
      renderType: "image",
      image: require("~/assets/light-thumbnails/Green.png"),
      renderStyle: {
        backgroundColor: "#228B22", // Forest green - matches multicolor pattern
        shadowColor: "#90EE90", // Soft green glow for realistic light emission
        shadowOpacity: 0.8, // Consistent with other improved assets
        borderColor: "#228B2240", // Subtle border with 25% opacity of main color
        borderWidth: 1.5, // Consistent border thickness
      },
    },
    {
      id: "c7-c9-blue",
      name: "Blue",
      category: "string",
      type: "c9",
      spacing: 36, // Default fallback spacing (pixels) - represents ~12" real-world spacing
      baseSize: 12,
      renderType: "image",
      image: require("~/assets/light-thumbnails/Blue.png"),
      renderStyle: {
        backgroundColor: "#4169E1", // Royal blue - matches multicolor pattern
        shadowColor: "#87CEEB", // Light blue glow for realistic light emission
        shadowOpacity: 0.8, // Consistent with other improved assets
        borderColor: "#4169E140", // Subtle border with 25% opacity of main color
        borderWidth: 1.5, // Consistent border thickness
      },
    },
    {
      id: "mini-led-warm",
      name: "Mini Warm White",
      category: "mini",
      type: "mini",
      spacing: 15, // Default fallback spacing (pixels) - represents ~6" real-world spacing for mini lights
      baseSize: 8,
      renderType: "image",
      image: require("~/assets/light-thumbnails/Warm-White.png"),
      renderStyle: {
        backgroundColor: "#FFF8DC", // Match C9 warm white color
        shadowColor: "#FFD700", // Golden glow for realistic light emission
        shadowOpacity: 0.8, // Consistent with other improved assets
        borderColor: "#FFEAA740", // Soft golden border with 25% opacity
        borderWidth: 1, // Thinner border for mini lights
      },
    },
    {
      id: "mini-led-multicolor",
      name: "Mini Multicolor",
      category: "mini",
      type: "mini",
      spacing: 15, // Default fallback spacing (pixels) - represents ~6" real-world spacing for mini lights
      baseSize: 8,
      renderType: "image",
      image: require("~/assets/light-thumbnails/Multicolor.png"),
      renderStyle: (lightIndex = 0) => {
        // Same realistic colors as C9 multicolor but scaled for mini lights
        const colorData = [
          { bg: "#DC143C", shadow: "#FF6B6B", name: "Red" }, // Deep red with warm glow
          { bg: "#228B22", shadow: "#90EE90", name: "Green" }, // Forest green with soft glow
          { bg: "#4169E1", shadow: "#87CEEB", name: "Blue" }, // Royal blue with light glow
          { bg: "#FFD700", shadow: "#FFF8DC", name: "Yellow" }, // Rich gold with warm glow
          { bg: "#FF8C00", shadow: "#FFE4B5", name: "Orange" }, // Deep orange with warm glow
        ];

        const colorInfo = colorData[lightIndex % colorData.length];
        return {
          backgroundColor: colorInfo.bg,
          shadowColor: colorInfo.shadow,
          shadowOpacity: 0.8, // Use custom light approach for consistent glow quality
          // Let shadowRadius be calculated by getLightRenderStyle function like custom lights
          borderColor: `${colorInfo.bg}30`, // More subtle border (18.75% opacity)
          borderWidth: 1, // Slightly thicker border for better definition
        };
      },
    },
    {
      id: "mini-red-white",
      name: "Mini Red & White",
      category: "mini",
      type: "mini",
      spacing: 15, // Default fallback spacing (pixels) - represents ~6" real-world spacing for mini lights
      baseSize: 8,
      renderType: "image",
      image: require("~/assets/light-thumbnails/Red-White.png"),
      renderStyle: (lightIndex = 0) => {
        const pattern = ["#ff3333", "#ff3333", "#ffffff", "#ffffff"];
        const color = pattern[lightIndex % pattern.length];
        const isRed = color === "#ff3333";
        return {
          backgroundColor: color,
          shadowColor: isRed ? "#ff3333" : "#fff5e0",
          shadowOpacity: 0.8, // Consistent with other mini lights
          borderColor: isRed ? "#ff333340" : "#ffffff40",
          borderWidth: 1,
        };
      },
    },
    {
      id: "mini-4-bulb-pattern",
      name: "Mini 4 Bulb Pattern",
      category: "mini",
      type: "mini",
      spacing: 15, // Default fallback spacing (pixels) - represents ~6" real-world spacing for mini lights
      baseSize: 8,
      renderType: "image",
      image: require("~/assets/light-thumbnails/Yellow-Red-Green.png"),
      renderStyle: (lightIndex = 0) => {
        // Same pattern as C9 but for mini lights
        const colorData = [
          { bg: "#FFD700", shadow: "#FFF8DC", name: "Yellow" }, // Rich gold yellow with warm glow
          { bg: "#DC143C", shadow: "#FF6B6B", name: "Red" }, // Deep crimson red with warm glow
          { bg: "#FFD700", shadow: "#FFF8DC", name: "Yellow" }, // Rich gold yellow with warm glow
          { bg: "#228B22", shadow: "#90EE90", name: "Green" }, // Forest green with soft glow
        ];

        const colorInfo = colorData[lightIndex % colorData.length];
        return {
          backgroundColor: colorInfo.bg,
          shadowColor: colorInfo.shadow,
          shadowOpacity: 0.8, // Consistent with other mini lights
          borderColor: `${colorInfo.bg}30`, // More subtle border for mini lights
          borderWidth: 1,
        };
      },
    },
    {
      id: "mini-cool-white",
      name: "Mini Cool White",
      category: "mini",
      type: "mini",
      spacing: 15, // Default fallback spacing (pixels) - represents ~6" real-world spacing for mini lights
      baseSize: 8,
      renderType: "image",
      image: require("~/assets/light-thumbnails/Cool-White.png"),
      renderStyle: {
        backgroundColor: "#F4FDFF", // Match C9 cool white color
        shadowColor: "#E6F3FF", // Subtle cool blue-white glow
        shadowOpacity: 0.8, // Consistent with other mini lights
        borderColor: "#E0E6FF40", // Soft blue-white border with opacity
        borderWidth: 1,
      },
    },
    {
      id: "mini-red",
      name: "Mini Red",
      category: "mini",
      type: "mini",
      spacing: 15, // Default fallback spacing (pixels) - represents ~6" real-world spacing for mini lights
      baseSize: 8,
      renderType: "image",
      image: require("~/assets/light-thumbnails/Red.png"),
      renderStyle: {
        backgroundColor: "#DC143C", // Match C9 red color
        shadowColor: "#FF6B6B", // Warm red glow
        shadowOpacity: 0.8, // Consistent with other mini lights
        borderColor: "#DC143C30", // Subtle border with 18.75% opacity
        borderWidth: 1,
      },
    },
    {
      id: "mini-green",
      name: "Mini Green",
      category: "mini",
      type: "mini",
      spacing: 15, // Default fallback spacing (pixels) - represents ~6" real-world spacing for mini lights
      baseSize: 8,
      renderType: "image",
      image: require("~/assets/light-thumbnails/Green.png"),
      renderStyle: {
        backgroundColor: "#228B22", // Match C9 green color
        shadowColor: "#90EE90", // Soft green glow
        shadowOpacity: 0.8, // Consistent with other mini lights
        borderColor: "#228B2230", // Subtle border with 18.75% opacity
        borderWidth: 1,
      },
    },
    {
      id: "mini-blue",
      name: "Mini Blue",
      category: "mini",
      type: "mini",
      spacing: 15, // Default fallback spacing (pixels) - represents ~6" real-world spacing for mini lights
      baseSize: 8,
      renderType: "image",
      image: require("~/assets/light-thumbnails/Blue.png"),
      renderStyle: {
        backgroundColor: "#4169E1", // Match C9 blue color
        shadowColor: "#87CEEB", // Light blue glow
        shadowOpacity: 0.8, // Consistent with other mini lights
        borderColor: "#4169E130", // Subtle border with 18.75% opacity
        borderWidth: 1,
      },
    },
  ];

  const [selectedAsset, setSelectedAsset] = React.useState(null);

  // Load custom assets from storage on mount
  React.useEffect(() => {
    const loadCustomAssets = async () => {
      try {
        const savedCustomAssets = await customLightStorage.getCustomLights();
        setCustomAssets(savedCustomAssets);
        console.log(
          "💡 useLightAssets: Loaded",
          savedCustomAssets.length,
          "custom light assets"
        );
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
      if (asset.category === "custom" && asset.isPattern) {
        console.log(
          "💡 getLightRenderStyle: Pattern asset",
          asset.name,
          "lightIndex:",
          lightIndex,
          "color:",
          baseStyle.backgroundColor
        );
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
      shadowRadius: baseStyle.shadowRadius || baseSize * 0.4 * scale,
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

      console.log(
        "💡 useLightAssets: Created and saved custom asset:",
        savedAsset.name
      );
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

      console.log("💡 useLightAssets: Removed custom asset:", id);
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
