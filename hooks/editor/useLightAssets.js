// hooks/useLightAssets.js
import React from "react";
import { Circle, Defs, G, RadialGradient, Stop } from "react-native-svg";

export function useLightAssets() {
  // Light asset definitions
  const lightAssets = [
    {
      id: "glow-light-blue",
      name: "Blue Glow",
      svg: (scale = 1) => {
        const color = "#3388ff";
        const outerGlowId = `outerGlowBlue_${Math.random().toString(36).slice(2, 11)}`;
        const middleGlowId = `middleGlowBlue_${Math.random().toString(36).slice(2, 11)}`;
        const innerGlowId = `innerGlowBlue_${Math.random().toString(36).slice(2, 11)}`;

        return (
          <G transform={`scale(${scale})`}>
            <Defs>
              {/* Outer diffuse glow */}
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

              {/* Middle focused glow */}
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

              {/* Inner bright core */}
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

            {/* Outer diffuse glow */}
            <Circle cx="15" cy="15" r="18" fill={`url(#${outerGlowId})`} />

            {/* Middle focused glow */}
            <Circle cx="15" cy="15" r="10" fill={`url(#${middleGlowId})`} />

            {/* Inner bright core */}
            <Circle cx="15" cy="15" r="5" fill={`url(#${innerGlowId})`} />

            {/* Center bright highlight */}
            <Circle cx="15" cy="15" r="1.5" fill="#ffffff" />

            {/* Small highlight spot */}
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
      name: "Warm White",
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

  return {
    lightAssets,
    selectedAsset,
    setSelectedAsset,
    getAssetById,
  };
}
