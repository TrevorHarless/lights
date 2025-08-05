// hooks/useLightAssets.js
import React from "react";
import { Circle, Ellipse, G, LinearGradient, RadialGradient, Stop } from "react-native-svg";
import { Image } from "react-native";

// Shared gradient definitions - these IDs are reused across all light instances
const SHARED_GRADIENT_DEFS = {
  // C9 Warm White gradients
  'c9-warm-outer': (
    <RadialGradient id="c9-warm-outer" cx="15" cy="15" r="22" gradientUnits="userSpaceOnUse">
      <Stop offset="0" stopColor="#fff5e0" stopOpacity="0.6" />
      <Stop offset="0.4" stopColor="#fff5e0" stopOpacity="0.3" />
      <Stop offset="1" stopColor="#fff5e0" stopOpacity="0" />
    </RadialGradient>
  ),
  'c9-warm-middle': (
    <RadialGradient id="c9-warm-middle" cx="15" cy="15" r="12" gradientUnits="userSpaceOnUse">
      <Stop offset="0" stopColor="#fffaf0" stopOpacity="0.9" />
      <Stop offset="0.6" stopColor="#ffedd9" stopOpacity="0.7" />
      <Stop offset="1" stopColor="#ffedd9" stopOpacity="0.4" />
    </RadialGradient>
  ),
  'c9-warm-bulb': (
    <RadialGradient id="c9-warm-bulb" cx="15" cy="15" r="6" gradientUnits="userSpaceOnUse">
      <Stop offset="0" stopColor="#ffffff" />
      <Stop offset="0.3" stopColor="#fffaf0" />
      <Stop offset="0.7" stopColor="#ffe8c4" />
      <Stop offset="1" stopColor="#ddb88a" />
    </RadialGradient>
  ),
  
  // Mini LED Warm gradients
  'mini-warm-outer': (
    <RadialGradient id="mini-warm-outer" cx="10" cy="10" r="12" gradientUnits="userSpaceOnUse">
      <Stop offset="0" stopColor="#fff5e0" stopOpacity="0.7" />
      <Stop offset="0.5" stopColor="#fff5e0" stopOpacity="0.3" />
      <Stop offset="1" stopColor="#fff5e0" stopOpacity="0" />
    </RadialGradient>
  ),
  'mini-warm-inner': (
    <RadialGradient id="mini-warm-inner" cx="10" cy="10" r="4" gradientUnits="userSpaceOnUse">
      <Stop offset="0" stopColor="#ffffff" />
      <Stop offset="0.5" stopColor="#fffaf0" />
      <Stop offset="1" stopColor="#ffe8c4" />
    </RadialGradient>
  ),
  
  // Icicle gradients
  'icicle-outer': (
    <RadialGradient id="icicle-outer" cx="10" cy="15" r="18" gradientUnits="userSpaceOnUse">
      <Stop offset="0" stopColor="#e6f3ff" stopOpacity="0.6" />
      <Stop offset="0.4" stopColor="#e6f3ff" stopOpacity="0.2" />
      <Stop offset="1" stopColor="#e6f3ff" stopOpacity="0" />
    </RadialGradient>
  ),
  'icicle-middle': (
    <RadialGradient id="icicle-middle" cx="10" cy="15" r="8" gradientUnits="userSpaceOnUse">
      <Stop offset="0" stopColor="#ffffff" stopOpacity="0.9" />
      <Stop offset="0.6" stopColor="#f0f8ff" stopOpacity="0.7" />
      <Stop offset="1" stopColor="#e6f3ff" stopOpacity="0.4" />
    </RadialGradient>
  ),
  'icicle-linear': (
    <LinearGradient id="icicle-linear" x1="10" y1="8" x2="10" y2="22" gradientUnits="userSpaceOnUse">
      <Stop offset="0" stopColor="#ffffff" />
      <Stop offset="0.3" stopColor="#f0f8ff" />
      <Stop offset="0.7" stopColor="#e6f3ff" />
      <Stop offset="1" stopColor="#ccddff" />
    </LinearGradient>
  ),
  
  // Net Light Warm gradients
  'net-warm-outer': (
    <RadialGradient id="net-warm-outer" cx="8" cy="8" r="10" gradientUnits="userSpaceOnUse">
      <Stop offset="0" stopColor="#fff5e0" stopOpacity="0.8" />
      <Stop offset="0.6" stopColor="#fff5e0" stopOpacity="0.3" />
      <Stop offset="1" stopColor="#fff5e0" stopOpacity="0" />
    </RadialGradient>
  ),
  'net-warm-inner': (
    <RadialGradient id="net-warm-inner" cx="8" cy="8" r="3" gradientUnits="userSpaceOnUse">
      <Stop offset="0" stopColor="#ffffff" />
      <Stop offset="0.6" stopColor="#fffaf0" />
      <Stop offset="1" stopColor="#ffe8c4" />
    </RadialGradient>
  ),
  
  // Legacy Blue Glow gradients
  'legacy-blue-outer': (
    <RadialGradient id="legacy-blue-outer" cx="15" cy="15" r="18" fx="15" fy="15" gradientUnits="userSpaceOnUse">
      <Stop offset="0" stopColor="#3388ff" stopOpacity="0.4" />
      <Stop offset="0.6" stopColor="#3388ff" stopOpacity="0.1" />
      <Stop offset="1" stopColor="#3388ff" stopOpacity="0" />
    </RadialGradient>
  ),
  'legacy-blue-middle': (
    <RadialGradient id="legacy-blue-middle" cx="15" cy="15" r="10" fx="15" fy="15" gradientUnits="userSpaceOnUse">
      <Stop offset="0" stopColor="#3388ff" stopOpacity="0.9" />
      <Stop offset="0.7" stopColor="#66aaff" stopOpacity="0.5" />
      <Stop offset="1" stopColor="#66aaff" stopOpacity="0.2" />
    </RadialGradient>
  ),
  'legacy-blue-inner': (
    <RadialGradient id="legacy-blue-inner" cx="15" cy="15" r="5" fx="15" fy="15" gradientUnits="userSpaceOnUse">
      <Stop offset="0" stopColor="#ffffff" />
      <Stop offset="0.5" stopColor="#ddffff" stopOpacity="0.9" />
      <Stop offset="1" stopColor="#99ccff" stopOpacity="0.8" />
    </RadialGradient>
  ),
  
  // Legacy Warm White gradients
  'legacy-warm-outer': (
    <RadialGradient id="legacy-warm-outer" cx="15" cy="15" r="18" fx="15" fy="15" gradientUnits="userSpaceOnUse">
      <Stop offset="0" stopColor="#fff5e0" stopOpacity="0.4" />
      <Stop offset="0.7" stopColor="#fff5e0" stopOpacity="0.1" />
      <Stop offset="1" stopColor="#fff5e0" stopOpacity="0" />
    </RadialGradient>
  ),
  'legacy-warm-middle': (
    <RadialGradient id="legacy-warm-middle" cx="15" cy="15" r="8" fx="15" fy="15" gradientUnits="userSpaceOnUse">
      <Stop offset="0" stopColor="#fffaf0" stopOpacity="0.9" />
      <Stop offset="0.7" stopColor="#ffedd9" stopOpacity="0.6" />
      <Stop offset="1" stopColor="#ffedd9" stopOpacity="0.3" />
    </RadialGradient>
  ),
  'legacy-warm-inner': (
    <RadialGradient id="legacy-warm-inner" cx="15" cy="15" r="4" fx="15" fy="15" gradientUnits="userSpaceOnUse">
      <Stop offset="0" stopColor="#ffffff" />
      <Stop offset="0.7" stopColor="#fffaf0" />
      <Stop offset="1" stopColor="#ffe8c4" />
    </RadialGradient>
  ),
};

// Reusable light definitions for instancing
const LIGHT_DEFINITIONS = {
  'c9-warm-white': (
    <G id="c9-warm-white-def">
      <Circle cx="15" cy="15" r="22" fill="url(#c9-warm-outer)" />
      <Circle cx="15" cy="15" r="12" fill="url(#c9-warm-middle)" />
      <Circle cx="15" cy="15" r="6" fill="url(#c9-warm-bulb)" stroke="#cc9966" strokeWidth="0.5" />
      <Circle cx="15" cy="15" r="2" fill="#ffffff" />
      <Circle cx="13" cy="13" r="0.8" fill="#ffffff" fillOpacity="0.8" />
    </G>
  ),
  'mini-led-warm': (
    <G id="mini-led-warm-def">
      <Circle cx="10" cy="10" r="12" fill="url(#mini-warm-outer)" />
      <Circle cx="10" cy="10" r="4" fill="url(#mini-warm-inner)" />
      <Circle cx="10" cy="10" r="1" fill="#ffffff" />
    </G>
  ),
  'icicle-cool-white': (
    <G id="icicle-cool-white-def">
      <Circle cx="10" cy="15" r="18" fill="url(#icicle-outer)" />
      <Circle cx="10" cy="15" r="8" fill="url(#icicle-middle)" />
      <Ellipse cx="10" cy="15" rx="3" ry="7" fill="url(#icicle-linear)" />
      <Circle cx="10" cy="15" r="1.5" fill="#ffffff" />
    </G>
  ),
  'net-warm-white': (
    <G id="net-warm-white-def">
      <Circle cx="8" cy="8" r="10" fill="url(#net-warm-outer)" />
      <Circle cx="8" cy="8" r="3" fill="url(#net-warm-inner)" />
      <Circle cx="8" cy="8" r="0.8" fill="#ffffff" />
    </G>
  ),
  'glow-light-blue': (
    <G id="glow-light-blue-def">
      <Circle cx="15" cy="15" r="18" fill="url(#legacy-blue-outer)" />
      <Circle cx="15" cy="15" r="10" fill="url(#legacy-blue-middle)" />
      <Circle cx="15" cy="15" r="5" fill="url(#legacy-blue-inner)" />
      <Circle cx="15" cy="15" r="1.5" fill="#ffffff" />
      <Circle cx="13.5" cy="13.5" r="0.5" fill="#ffffff" fillOpacity="0.9" />
    </G>
  ),
  'warm-white': (
    <G id="warm-white-def">
      <Circle cx="15" cy="15" r="18" fill="url(#legacy-warm-outer)" />
      <Circle cx="15" cy="15" r="8" fill="url(#legacy-warm-middle)" />
      <Circle cx="15" cy="15" r="4" fill="url(#legacy-warm-inner)" />
      <Circle cx="15" cy="15" r="1.5" fill="#ffffff" />
      <Circle cx="13.5" cy="13.5" r="0.5" fill="#ffffff" fillOpacity="0.9" />
    </G>
  ),
};

// Function to get all shared gradient definitions as JSX
const getSharedGradientDefs = () => {
  return Object.values(SHARED_GRADIENT_DEFS);
};

// Function to get all light definitions for instancing
const getLightDefinitions = () => {
  return Object.values(LIGHT_DEFINITIONS);
};

export function useLightAssets() {
  // Light asset definitions with simplified SVG functions (no individual <Defs>)
  const lightAssets = [
    // Professional Grade LED String Lights
    {
      id: "c9-warm-white",
      name: "C9 Warm White",
      category: "string",
      type: "c9",
      useInstancing: true,
      instanceDefId: "c9-warm-white-def",
      centerOffset: { x: 15, y: 15 }, // Center point of the light for positioning
      svg: (scale = 1) => {
        return (
          <G transform={`scale(${scale})`}>
            <Circle cx="15" cy="15" r="22" fill="url(#c9-warm-outer)" />
            <Circle cx="15" cy="15" r="12" fill="url(#c9-warm-middle)" />
            <Circle cx="15" cy="15" r="6" fill="url(#c9-warm-bulb)" stroke="#cc9966" strokeWidth="0.5" />
            <Circle cx="15" cy="15" r="2" fill="#ffffff" />
            <Circle cx="13" cy="13" r="0.8" fill="#ffffff" fillOpacity="0.8" />
          </G>
        );
      },
      spacing: 36,
    },
    {
      id: "c9-multicolor",
      name: "C9 Multicolor",
      category: "string",
      type: "c9",
      useInstancing: false, // Keep custom rendering for multicolor
      svg: (scale = 1, lightIndex = 0) => {
        const colors = ["#ff3333", "#33ff33", "#3333ff", "#ffff33", "#ff33ff"];
        const color = colors[lightIndex % colors.length];
        return (
          <G transform={`scale(${scale})`}>
            <Circle cx="15" cy="15" r="22" fill={color} fillOpacity="0.3" />
            <Circle cx="15" cy="15" r="12" fill={color} fillOpacity="0.6" />
            <Circle cx="15" cy="15" r="6" fill={color} stroke={color} strokeWidth="0.5" strokeOpacity="0.8" />
            <Circle cx="15" cy="15" r="2" fill="#ffffff" />
            <Circle cx="13" cy="13" r="0.8" fill="#ffffff" fillOpacity="0.8" />
          </G>
        );
      },
      spacing: 36,
    },
    {
      id: "mini-led-warm",
      name: "Mini LED Warm White",
      category: "string",
      type: "mini",
      useInstancing: true,
      instanceDefId: "mini-led-warm-def",
      centerOffset: { x: 10, y: 10 },
      svg: (scale = 1) => {
        return (
          <G transform={`scale(${scale})`}>
            <Circle cx="10" cy="10" r="12" fill="url(#mini-warm-outer)" />
            <Circle cx="10" cy="10" r="4" fill="url(#mini-warm-inner)" />
            <Circle cx="10" cy="10" r="1" fill="#ffffff" />
          </G>
        );
      },
      spacing: 15,
    },
    {
      id: "mini-led-multicolor",
      name: "Mini LED Multicolor",
      category: "string",
      type: "mini",
      useInstancing: false, // Keep custom rendering for multicolor
      svg: (scale = 1, lightIndex = 0) => {
        const colors = ["#ff4444", "#44ff44", "#4444ff", "#ffff44", "#ff44ff", "#44ffff"];
        const color = colors[lightIndex % colors.length];
        return (
          <G transform={`scale(${scale})`}>
            <Circle cx="10" cy="10" r="12" fill={color} fillOpacity="0.4" />
            <Circle cx="10" cy="10" r="4" fill={color} fillOpacity="0.8" />
            <Circle cx="10" cy="10" r="1" fill="#ffffff" />
          </G>
        );
      },
      spacing: 15,
    },
    {
      id: "icicle-cool-white",
      name: "Icicle Cool White",
      category: "string",
      type: "icicle",
      useInstancing: true,
      instanceDefId: "icicle-cool-white-def",
      centerOffset: { x: 10, y: 15 },
      svg: (scale = 1) => {
        return (
          <G transform={`scale(${scale})`}>
            <Circle cx="10" cy="15" r="18" fill="url(#icicle-outer)" />
            <Circle cx="10" cy="15" r="8" fill="url(#icicle-middle)" />
            <Ellipse cx="10" cy="15" rx="3" ry="7" fill="url(#icicle-linear)" />
            <Circle cx="10" cy="15" r="1.5" fill="#ffffff" />
          </G>
        );
      },
      spacing: 24,
    },
    {
      id: "net-warm-white",
      name: "Net Light Warm White",
      category: "net",
      type: "net",
      useInstancing: true,
      instanceDefId: "net-warm-white-def",
      centerOffset: { x: 8, y: 8 },
      svg: (scale = 1) => {
        return (
          <G transform={`scale(${scale})`}>
            <Circle cx="8" cy="8" r="10" fill="url(#net-warm-outer)" />
            <Circle cx="8" cy="8" r="3" fill="url(#net-warm-inner)" />
            <Circle cx="8" cy="8" r="0.8" fill="#ffffff" />
          </G>
        );
      },
      spacing: 12,
    },
    // Legacy lights for backward compatibility
    {
      id: "glow-light-blue",
      name: "Blue Glow (Legacy)",
      category: "string",
      type: "legacy",
      useInstancing: true,
      instanceDefId: "glow-light-blue-def",
      centerOffset: { x: 15, y: 15 },
      svg: (scale = 1) => {
        return (
          <G transform={`scale(${scale})`}>
            <Circle cx="15" cy="15" r="18" fill="url(#legacy-blue-outer)" />
            <Circle cx="15" cy="15" r="10" fill="url(#legacy-blue-middle)" />
            <Circle cx="15" cy="15" r="5" fill="url(#legacy-blue-inner)" />
            <Circle cx="15" cy="15" r="1.5" fill="#ffffff" />
            <Circle
              cx="13.5"
              cy="13.5"
              r="0.5"
              fill="#ffffff"
              fillOpacity="0.9"
            />
          </G>
        );
      },
      spacing: 30,
    },
    {
      id: "warm-white",
      name: "Warm White (Legacy)",
      category: "string",
      type: "legacy",
      useInstancing: true,
      instanceDefId: "warm-white-def",
      centerOffset: { x: 15, y: 15 },
      svg: (scale = 1) => {
        return (
          <G transform={`scale(${scale})`}>
            <Circle cx="15" cy="15" r="18" fill="url(#legacy-warm-outer)" />
            <Circle cx="15" cy="15" r="8" fill="url(#legacy-warm-middle)" />
            <Circle cx="15" cy="15" r="4" fill="url(#legacy-warm-inner)" />
            <Circle cx="15" cy="15" r="1.5" fill="#ffffff" />
            <Circle
              cx="13.5"
              cy="13.5"
              r="0.5"
              fill="#ffffff"
              fillOpacity="0.9"
            />
          </G>
        );
      },
      spacing: 30,
    },
  ];

  const [selectedAsset, setSelectedAsset] = React.useState(null);

  // Find the asset by ID
  const getAssetById = (id) => lightAssets.find((asset) => asset.id === id);

  // Filter assets by category
  const getAssetsByCategory = (category) => lightAssets.filter((asset) => asset.category === category);

  // Get all categories
  const getCategories = () => [...new Set(lightAssets.map((asset) => asset.category))];

  // Get all types within a category
  const getTypesByCategory = (category) => {
    const categoryAssets = getAssetsByCategory(category);
    return [...new Set(categoryAssets.map((asset) => asset.type))];
  };

  return {
    lightAssets,
    selectedAsset,
    setSelectedAsset,
    getAssetById,
    getAssetsByCategory,
    getCategories,
    getTypesByCategory,
    getSharedGradientDefs, // Export the shared gradient definitions
    getLightDefinitions, // Export the light definitions for instancing
  };
}
