// hooks/useLightAssets.js
import React from "react";
import { Circle, Defs, Ellipse, G, LinearGradient, RadialGradient, Stop } from "react-native-svg";
import { Image } from "react-native";

export function useLightAssets() {
  // Light asset definitions
  const lightAssets = [
    // Professional Grade LED String Lights
    {
      id: "c9-warm-white",
      name: "C9 Warm White",
      category: "string",
      type: "c9",
      svg: (scale = 1) => {
        const outerGlowId = `c9WarmOuter_${Math.random().toString(36).slice(2, 11)}`;
        const middleGlowId = `c9WarmMiddle_${Math.random().toString(36).slice(2, 11)}`;
        const innerGlowId = `c9WarmInner_${Math.random().toString(36).slice(2, 11)}`;
        const bulbGradId = `c9BulbGrad_${Math.random().toString(36).slice(2, 11)}`;

        return (
          <G transform={`scale(${scale})`}>
            <Defs>
              <RadialGradient id={outerGlowId} cx="15" cy="15" r="22" gradientUnits="userSpaceOnUse">
                <Stop offset="0" stopColor="#fff5e0" stopOpacity="0.6" />
                <Stop offset="0.4" stopColor="#fff5e0" stopOpacity="0.3" />
                <Stop offset="1" stopColor="#fff5e0" stopOpacity="0" />
              </RadialGradient>
              <RadialGradient id={middleGlowId} cx="15" cy="15" r="12" gradientUnits="userSpaceOnUse">
                <Stop offset="0" stopColor="#fffaf0" stopOpacity="0.9" />
                <Stop offset="0.6" stopColor="#ffedd9" stopOpacity="0.7" />
                <Stop offset="1" stopColor="#ffedd9" stopOpacity="0.4" />
              </RadialGradient>
              <RadialGradient id={bulbGradId} cx="15" cy="15" r="6" gradientUnits="userSpaceOnUse">
                <Stop offset="0" stopColor="#ffffff" />
                <Stop offset="0.3" stopColor="#fffaf0" />
                <Stop offset="0.7" stopColor="#ffe8c4" />
                <Stop offset="1" stopColor="#ddb88a" />
              </RadialGradient>
            </Defs>
            <Circle cx="15" cy="15" r="22" fill={`url(#${outerGlowId})`} />
            <Circle cx="15" cy="15" r="12" fill={`url(#${middleGlowId})`} />
            <Circle cx="15" cy="15" r="6" fill={`url(#${bulbGradId})`} stroke="#cc9966" strokeWidth="0.5" />
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
      svg: (scale = 1) => {
        const colors = ["#ff3333", "#33ff33", "#3333ff", "#ffff33", "#ff33ff"];
        const color = colors[Math.floor(Math.random() * colors.length)];
        const outerGlowId = `c9MultiOuter_${Math.random().toString(36).slice(2, 11)}`;
        const middleGlowId = `c9MultiMiddle_${Math.random().toString(36).slice(2, 11)}`;
        const bulbGradId = `c9MultiBulb_${Math.random().toString(36).slice(2, 11)}`;

        return (
          <G transform={`scale(${scale})`}>
            <Defs>
              <RadialGradient id={outerGlowId} cx="15" cy="15" r="22" gradientUnits="userSpaceOnUse">
                <Stop offset="0" stopColor={color} stopOpacity="0.5" />
                <Stop offset="0.4" stopColor={color} stopOpacity="0.2" />
                <Stop offset="1" stopColor={color} stopOpacity="0" />
              </RadialGradient>
              <RadialGradient id={middleGlowId} cx="15" cy="15" r="12" gradientUnits="userSpaceOnUse">
                <Stop offset="0" stopColor={color} stopOpacity="0.8" />
                <Stop offset="0.6" stopColor={color} stopOpacity="0.6" />
                <Stop offset="1" stopColor={color} stopOpacity="0.3" />
              </RadialGradient>
              <RadialGradient id={bulbGradId} cx="15" cy="15" r="6" gradientUnits="userSpaceOnUse">
                <Stop offset="0" stopColor="#ffffff" />
                <Stop offset="0.3" stopColor={color} stopOpacity="0.3" />
                <Stop offset="0.7" stopColor={color} />
                <Stop offset="1" stopColor={color} stopOpacity="0.8" />
              </RadialGradient>
            </Defs>
            <Circle cx="15" cy="15" r="22" fill={`url(#${outerGlowId})`} />
            <Circle cx="15" cy="15" r="12" fill={`url(#${middleGlowId})`} />
            <Circle cx="15" cy="15" r="6" fill={`url(#${bulbGradId})`} stroke={color} strokeWidth="0.5" strokeOpacity="0.8" />
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
      svg: (scale = 1) => {
        const outerGlowId = `miniWarmOuter_${Math.random().toString(36).slice(2, 11)}`;
        const innerGlowId = `miniWarmInner_${Math.random().toString(36).slice(2, 11)}`;

        return (
          <G transform={`scale(${scale})`}>
            <Defs>
              <RadialGradient id={outerGlowId} cx="10" cy="10" r="12" gradientUnits="userSpaceOnUse">
                <Stop offset="0" stopColor="#fff5e0" stopOpacity="0.7" />
                <Stop offset="0.5" stopColor="#fff5e0" stopOpacity="0.3" />
                <Stop offset="1" stopColor="#fff5e0" stopOpacity="0" />
              </RadialGradient>
              <RadialGradient id={innerGlowId} cx="10" cy="10" r="4" gradientUnits="userSpaceOnUse">
                <Stop offset="0" stopColor="#ffffff" />
                <Stop offset="0.5" stopColor="#fffaf0" />
                <Stop offset="1" stopColor="#ffe8c4" />
              </RadialGradient>
            </Defs>
            <Circle cx="10" cy="10" r="12" fill={`url(#${outerGlowId})`} />
            <Circle cx="10" cy="10" r="4" fill={`url(#${innerGlowId})`} />
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
      svg: (scale = 1) => {
        const colors = ["#ff4444", "#44ff44", "#4444ff", "#ffff44", "#ff44ff", "#44ffff"];
        const color = colors[Math.floor(Math.random() * colors.length)];
        const outerGlowId = `miniMultiOuter_${Math.random().toString(36).slice(2, 11)}`;
        const innerGlowId = `miniMultiInner_${Math.random().toString(36).slice(2, 11)}`;

        return (
          <G transform={`scale(${scale})`}>
            <Defs>
              <RadialGradient id={outerGlowId} cx="10" cy="10" r="12" gradientUnits="userSpaceOnUse">
                <Stop offset="0" stopColor={color} stopOpacity="0.6" />
                <Stop offset="0.5" stopColor={color} stopOpacity="0.2" />
                <Stop offset="1" stopColor={color} stopOpacity="0" />
              </RadialGradient>
              <RadialGradient id={innerGlowId} cx="10" cy="10" r="4" gradientUnits="userSpaceOnUse">
                <Stop offset="0" stopColor="#ffffff" />
                <Stop offset="0.5" stopColor={color} stopOpacity="0.4" />
                <Stop offset="1" stopColor={color} />
              </RadialGradient>
            </Defs>
            <Circle cx="10" cy="10" r="12" fill={`url(#${outerGlowId})`} />
            <Circle cx="10" cy="10" r="4" fill={`url(#${innerGlowId})`} />
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
      svg: (scale = 1) => {
        const outerGlowId = `icicleOuter_${Math.random().toString(36).slice(2, 11)}`;
        const middleGlowId = `icicleMiddle_${Math.random().toString(36).slice(2, 11)}`;
        const icicleGradId = `icicleGrad_${Math.random().toString(36).slice(2, 11)}`;

        return (
          <G transform={`scale(${scale})`}>
            <Defs>
              <RadialGradient id={outerGlowId} cx="10" cy="15" r="18" gradientUnits="userSpaceOnUse">
                <Stop offset="0" stopColor="#e6f3ff" stopOpacity="0.6" />
                <Stop offset="0.4" stopColor="#e6f3ff" stopOpacity="0.2" />
                <Stop offset="1" stopColor="#e6f3ff" stopOpacity="0" />
              </RadialGradient>
              <RadialGradient id={middleGlowId} cx="10" cy="15" r="8" gradientUnits="userSpaceOnUse">
                <Stop offset="0" stopColor="#ffffff" stopOpacity="0.9" />
                <Stop offset="0.6" stopColor="#f0f8ff" stopOpacity="0.7" />
                <Stop offset="1" stopColor="#e6f3ff" stopOpacity="0.4" />
              </RadialGradient>
              <LinearGradient id={icicleGradId} x1="10" y1="8" x2="10" y2="22" gradientUnits="userSpaceOnUse">
                <Stop offset="0" stopColor="#ffffff" />
                <Stop offset="0.3" stopColor="#f0f8ff" />
                <Stop offset="0.7" stopColor="#e6f3ff" />
                <Stop offset="1" stopColor="#ccddff" />
              </LinearGradient>
            </Defs>
            <Circle cx="10" cy="15" r="18" fill={`url(#${outerGlowId})`} />
            <Circle cx="10" cy="15" r="8" fill={`url(#${middleGlowId})`} />
            <Ellipse cx="10" cy="15" rx="3" ry="7" fill={`url(#${icicleGradId})`} />
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
      svg: (scale = 1) => {
        const outerGlowId = `netWarmOuter_${Math.random().toString(36).slice(2, 11)}`;
        const innerGlowId = `netWarmInner_${Math.random().toString(36).slice(2, 11)}`;

        return (
          <G transform={`scale(${scale})`}>
            <Defs>
              <RadialGradient id={outerGlowId} cx="8" cy="8" r="10" gradientUnits="userSpaceOnUse">
                <Stop offset="0" stopColor="#fff5e0" stopOpacity="0.8" />
                <Stop offset="0.6" stopColor="#fff5e0" stopOpacity="0.3" />
                <Stop offset="1" stopColor="#fff5e0" stopOpacity="0" />
              </RadialGradient>
              <RadialGradient id={innerGlowId} cx="8" cy="8" r="3" gradientUnits="userSpaceOnUse">
                <Stop offset="0" stopColor="#ffffff" />
                <Stop offset="0.6" stopColor="#fffaf0" />
                <Stop offset="1" stopColor="#ffe8c4" />
              </RadialGradient>
            </Defs>
            <Circle cx="8" cy="8" r="10" fill={`url(#${outerGlowId})`} />
            <Circle cx="8" cy="8" r="3" fill={`url(#${innerGlowId})`} />
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
      svg: (scale = 1) => {
        const color = "#3388ff";
        const outerGlowId = `outerGlowBlue_${Math.random().toString(36).slice(2, 11)}`;
        const middleGlowId = `middleGlowBlue_${Math.random().toString(36).slice(2, 11)}`;
        const innerGlowId = `innerGlowBlue_${Math.random().toString(36).slice(2, 11)}`;

        return (
          <G transform={`scale(${scale})`}>
            <Defs>
              <RadialGradient
                id={outerGlowId}
                cx="15"
                cy="15"
                r="18"
                fx="15"
                fy="15"
                gradientUnits="userSpaceOnUse"
              >
                <Stop offset="0" stopColor={color} stopOpacity="0.4" />
                <Stop offset="0.6" stopColor={color} stopOpacity="0.1" />
                <Stop offset="1" stopColor={color} stopOpacity="0" />
              </RadialGradient>
              <RadialGradient
                id={middleGlowId}
                cx="15"
                cy="15"
                r="10"
                fx="15"
                fy="15"
                gradientUnits="userSpaceOnUse"
              >
                <Stop offset="0" stopColor={color} stopOpacity="0.9" />
                <Stop offset="0.7" stopColor="#66aaff" stopOpacity="0.5" />
                <Stop offset="1" stopColor="#66aaff" stopOpacity="0.2" />
              </RadialGradient>
              <RadialGradient
                id={innerGlowId}
                cx="15"
                cy="15"
                r="5"
                fx="15"
                fy="15"
                gradientUnits="userSpaceOnUse"
              >
                <Stop offset="0" stopColor="#ffffff" />
                <Stop offset="0.5" stopColor="#ddffff" stopOpacity="0.9" />
                <Stop offset="1" stopColor="#99ccff" stopOpacity="0.8" />
              </RadialGradient>
            </Defs>
            <Circle cx="15" cy="15" r="18" fill={`url(#${outerGlowId})`} />
            <Circle cx="15" cy="15" r="10" fill={`url(#${middleGlowId})`} />
            <Circle cx="15" cy="15" r="5" fill={`url(#${innerGlowId})`} />
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
      svg: (scale = 1) => {
        const outerGlowId = `outerGlowWarm_${Math.random().toString(36).slice(2, 11)}`;
        const middleGlowId = `middleGlowWarm_${Math.random().toString(36).slice(2, 11)}`;
        const innerGlowId = `innerGlowWarm_${Math.random().toString(36).slice(2, 11)}`;

        return (
          <G transform={`scale(${scale})`}>
            <Defs>
              <RadialGradient
                id={outerGlowId}
                cx="15"
                cy="15"
                r="18"
                fx="15"
                fy="15"
                gradientUnits="userSpaceOnUse"
              >
                <Stop offset="0" stopColor="#fff5e0" stopOpacity="0.4" />
                <Stop offset="0.7" stopColor="#fff5e0" stopOpacity="0.1" />
                <Stop offset="1" stopColor="#fff5e0" stopOpacity="0" />
              </RadialGradient>
              <RadialGradient
                id={middleGlowId}
                cx="15"
                cy="15"
                r="8"
                fx="15"
                fy="15"
                gradientUnits="userSpaceOnUse"
              >
                <Stop offset="0" stopColor="#fffaf0" stopOpacity="0.9" />
                <Stop offset="0.7" stopColor="#ffedd9" stopOpacity="0.6" />
                <Stop offset="1" stopColor="#ffedd9" stopOpacity="0.3" />
              </RadialGradient>
              <RadialGradient
                id={innerGlowId}
                cx="15"
                cy="15"
                r="4"
                fx="15"
                fy="15"
                gradientUnits="userSpaceOnUse"
              >
                <Stop offset="0" stopColor="#ffffff" />
                <Stop offset="0.7" stopColor="#fffaf0" />
                <Stop offset="1" stopColor="#ffe8c4" />
              </RadialGradient>
            </Defs>
            <Circle cx="15" cy="15" r="18" fill={`url(#${outerGlowId})`} />
            <Circle cx="15" cy="15" r="8" fill={`url(#${middleGlowId})`} />
            <Circle cx="15" cy="15" r="4" fill={`url(#${innerGlowId})`} />
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
  };
}
