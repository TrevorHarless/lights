// hooks/useLightAssets.js
import React from "react";
import { Circle, Ellipse, G, LinearGradient, RadialGradient, Stop } from "react-native-svg";

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
  
  // C7/C9 Cool White LED gradients
  'c7-c9-cool-white-outer': (
    <RadialGradient id="c7-c9-cool-white-outer" cx="15" cy="15" r="22" gradientUnits="userSpaceOnUse">
      <Stop offset="0" stopColor="#E8F9FF" stopOpacity="0.6" />
      <Stop offset="0.4" stopColor="#E8F9FF" stopOpacity="0.3" />
      <Stop offset="1" stopColor="#E8F9FF" stopOpacity="0" />
    </RadialGradient>
  ),
  'c7-c9-cool-white-middle': (
    <RadialGradient id="c7-c9-cool-white-middle" cx="15" cy="15" r="12" gradientUnits="userSpaceOnUse">
      <Stop offset="0" stopColor="#F8FCFF" stopOpacity="0.9" />
      <Stop offset="0.6" stopColor="#E8F9FF" stopOpacity="0.7" />
      <Stop offset="1" stopColor="#E8F9FF" stopOpacity="0.4" />
    </RadialGradient>
  ),
  'c7-c9-cool-white-bulb': (
    <RadialGradient id="c7-c9-cool-white-bulb" cx="15" cy="15" r="6" gradientUnits="userSpaceOnUse">
      <Stop offset="0" stopColor="#ffffff" />
      <Stop offset="0.3" stopColor="#F8FCFF" />
      <Stop offset="0.7" stopColor="#E8F9FF" />
      <Stop offset="1" stopColor="#B8D6E8" />
    </RadialGradient>
  ),
  
  // C7/C9 Red gradients
  'c7-c9-red-outer': (
    <RadialGradient id="c7-c9-red-outer" cx="15" cy="15" r="22" gradientUnits="userSpaceOnUse">
      <Stop offset="0" stopColor="#C1121F" stopOpacity="0.6" />
      <Stop offset="0.4" stopColor="#C1121F" stopOpacity="0.3" />
      <Stop offset="1" stopColor="#C1121F" stopOpacity="0" />
    </RadialGradient>
  ),
  'c7-c9-red-middle': (
    <RadialGradient id="c7-c9-red-middle" cx="15" cy="15" r="12" gradientUnits="userSpaceOnUse">
      <Stop offset="0" stopColor="#FF5555" stopOpacity="0.9" />
      <Stop offset="0.6" stopColor="#C1121F" stopOpacity="0.7" />
      <Stop offset="1" stopColor="#C1121F" stopOpacity="0.4" />
    </RadialGradient>
  ),
  'c7-c9-red-bulb': (
    <RadialGradient id="c7-c9-red-bulb" cx="15" cy="15" r="6" gradientUnits="userSpaceOnUse">
      <Stop offset="0" stopColor="#ffffff" />
      <Stop offset="0.3" stopColor="#FFB3B3" />
      <Stop offset="0.7" stopColor="#C1121F" />
      <Stop offset="1" stopColor="#8A0E17" />
    </RadialGradient>
  ),
  
  // C7/C9 Green gradients
  'c7-c9-green-outer': (
    <RadialGradient id="c7-c9-green-outer" cx="15" cy="15" r="22" gradientUnits="userSpaceOnUse">
      <Stop offset="0" stopColor="#0B6623" stopOpacity="0.6" />
      <Stop offset="0.4" stopColor="#0B6623" stopOpacity="0.3" />
      <Stop offset="1" stopColor="#0B6623" stopOpacity="0" />
    </RadialGradient>
  ),
  'c7-c9-green-middle': (
    <RadialGradient id="c7-c9-green-middle" cx="15" cy="15" r="12" gradientUnits="userSpaceOnUse">
      <Stop offset="0" stopColor="#55AA55" stopOpacity="0.9" />
      <Stop offset="0.6" stopColor="#0B6623" stopOpacity="0.7" />
      <Stop offset="1" stopColor="#0B6623" stopOpacity="0.4" />
    </RadialGradient>
  ),
  'c7-c9-green-bulb': (
    <RadialGradient id="c7-c9-green-bulb" cx="15" cy="15" r="6" gradientUnits="userSpaceOnUse">
      <Stop offset="0" stopColor="#ffffff" />
      <Stop offset="0.3" stopColor="#B3FFB3" />
      <Stop offset="0.7" stopColor="#0B6623" />
      <Stop offset="1" stopColor="#084D1A" />
    </RadialGradient>
  ),
  
  // C7/C9 Blue gradients
  'c7-c9-blue-outer': (
    <RadialGradient id="c7-c9-blue-outer" cx="15" cy="15" r="22" gradientUnits="userSpaceOnUse">
      <Stop offset="0" stopColor="#0074B7" stopOpacity="0.6" />
      <Stop offset="0.4" stopColor="#0074B7" stopOpacity="0.3" />
      <Stop offset="1" stopColor="#0074B7" stopOpacity="0" />
    </RadialGradient>
  ),
  'c7-c9-blue-middle': (
    <RadialGradient id="c7-c9-blue-middle" cx="15" cy="15" r="12" gradientUnits="userSpaceOnUse">
      <Stop offset="0" stopColor="#5599DD" stopOpacity="0.9" />
      <Stop offset="0.6" stopColor="#0074B7" stopOpacity="0.7" />
      <Stop offset="1" stopColor="#0074B7" stopOpacity="0.4" />
    </RadialGradient>
  ),
  'c7-c9-blue-bulb': (
    <RadialGradient id="c7-c9-blue-bulb" cx="15" cy="15" r="6" gradientUnits="userSpaceOnUse">
      <Stop offset="0" stopColor="#ffffff" />
      <Stop offset="0.3" stopColor="#B3D9FF" />
      <Stop offset="0.7" stopColor="#0074B7" />
      <Stop offset="1" stopColor="#005A8D" />
    </RadialGradient>
  ),
  
  // Mini Yellow gradients
  'mini-yellow-outer': (
    <RadialGradient id="mini-yellow-outer" cx="10" cy="10" r="12" gradientUnits="userSpaceOnUse">
      <Stop offset="0" stopColor="#FFD300" stopOpacity="0.7" />
      <Stop offset="0.5" stopColor="#FFD300" stopOpacity="0.3" />
      <Stop offset="1" stopColor="#FFD300" stopOpacity="0" />
    </RadialGradient>
  ),
  'mini-yellow-inner': (
    <RadialGradient id="mini-yellow-inner" cx="10" cy="10" r="4" gradientUnits="userSpaceOnUse">
      <Stop offset="0" stopColor="#ffffff" />
      <Stop offset="0.5" stopColor="#FFFF99" />
      <Stop offset="1" stopColor="#FFD300" />
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
  'c7-c9-cool-white': (
    <G id="c7-c9-cool-white-def">
      <Circle cx="15" cy="15" r="22" fill="url(#c7-c9-cool-white-outer)" />
      <Circle cx="15" cy="15" r="12" fill="url(#c7-c9-cool-white-middle)" />
      <Circle cx="15" cy="15" r="6" fill="url(#c7-c9-cool-white-bulb)" stroke="#99ccdd" strokeWidth="0.5" />
      <Circle cx="15" cy="15" r="2" fill="#ffffff" />
      <Circle cx="13" cy="13" r="0.8" fill="#ffffff" fillOpacity="0.8" />
    </G>
  ),
  'c7-c9-red': (
    <G id="c7-c9-red-def">
      <Circle cx="15" cy="15" r="22" fill="url(#c7-c9-red-outer)" />
      <Circle cx="15" cy="15" r="12" fill="url(#c7-c9-red-middle)" />
      <Circle cx="15" cy="15" r="6" fill="url(#c7-c9-red-bulb)" stroke="#aa0e17" strokeWidth="0.5" />
      <Circle cx="15" cy="15" r="2" fill="#ffffff" />
      <Circle cx="13" cy="13" r="0.8" fill="#ffffff" fillOpacity="0.8" />
    </G>
  ),
  'c7-c9-green': (
    <G id="c7-c9-green-def">
      <Circle cx="15" cy="15" r="22" fill="url(#c7-c9-green-outer)" />
      <Circle cx="15" cy="15" r="12" fill="url(#c7-c9-green-middle)" />
      <Circle cx="15" cy="15" r="6" fill="url(#c7-c9-green-bulb)" stroke="#084d1a" strokeWidth="0.5" />
      <Circle cx="15" cy="15" r="2" fill="#ffffff" />
      <Circle cx="13" cy="13" r="0.8" fill="#ffffff" fillOpacity="0.8" />
    </G>
  ),
  'c7-c9-blue': (
    <G id="c7-c9-blue-def">
      <Circle cx="15" cy="15" r="22" fill="url(#c7-c9-blue-outer)" />
      <Circle cx="15" cy="15" r="12" fill="url(#c7-c9-blue-middle)" />
      <Circle cx="15" cy="15" r="6" fill="url(#c7-c9-blue-bulb)" stroke="#005a8d" strokeWidth="0.5" />
      <Circle cx="15" cy="15" r="2" fill="#ffffff" />
      <Circle cx="13" cy="13" r="0.8" fill="#ffffff" fillOpacity="0.8" />
    </G>
  ),
  'mini-yellow': (
    <G id="mini-yellow-def">
      <Circle cx="10" cy="10" r="12" fill="url(#mini-yellow-outer)" />
      <Circle cx="10" cy="10" r="4" fill="url(#mini-yellow-inner)" />
      <Circle cx="10" cy="10" r="1" fill="#ffffff" />
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
      centerOffset: { x: 15, y: 15 },
      spacing: 36,
      baseSize: 12,
      renderStyle: {
        backgroundColor: '#FFD59A', // Using standardized hex value
        shadowColor: '#fff5e0',
        shadowOpacity: 0.8,
        borderColor: 'rgba(255, 245, 224, 0.3)',
      },
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
    },
    {
      id: "c9-multicolor",
      name: "C9 Multicolor",
      category: "string",
      type: "c9",
      useInstancing: false,
      spacing: 36,
      baseSize: 12,
      renderStyle: (lightIndex = 0) => {
        const colors = ["#ff3333", "#33ff33", "#3333ff", "#ffff33", "#ff33ff"];
        const color = colors[lightIndex % colors.length];
        return {
          backgroundColor: color,
          shadowColor: color,
          shadowOpacity: 0.6,
        };
      },
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
    },
    {
      id: "mini-led-warm",
      name: "Mini Warm White",
      category: "string",
      type: "mini",
      useInstancing: true,
      instanceDefId: "mini-led-warm-def",
      centerOffset: { x: 10, y: 10 },
      spacing: 15,
      baseSize: 8,
      renderStyle: {
        backgroundColor: '#FFE6B3', // Using standardized hex value
        shadowColor: '#fff5e0',
        shadowOpacity: 0.6,
      },
      svg: (scale = 1) => {
        return (
          <G transform={`scale(${scale})`}>
            <Circle cx="10" cy="10" r="12" fill="url(#mini-warm-outer)" />
            <Circle cx="10" cy="10" r="4" fill="url(#mini-warm-inner)" />
            <Circle cx="10" cy="10" r="1" fill="#ffffff" />
          </G>
        );
      },
    },
    {
      id: "mini-led-multicolor",
      name: "Mini Multicolor",
      category: "string",
      type: "mini",
      useInstancing: false,
      spacing: 15,
      baseSize: 8,
      renderStyle: (lightIndex = 0) => {
        const colors = ["#ff4444", "#44ff44", "#4444ff", "#ffff44", "#ff44ff", "#44ffff"];
        const color = colors[lightIndex % colors.length];
        return {
          backgroundColor: color,
          shadowColor: color,
          shadowOpacity: 0.5,
        };
      },
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
    },
    {
      id: "icicle-cool-white",
      name: "Icicle Cool White",
      category: "string",
      type: "icicle",
      useInstancing: true,
      instanceDefId: "icicle-cool-white-def",
      centerOffset: { x: 10, y: 15 },
      spacing: 24,
      baseSize: 10,
      renderStyle: {
        backgroundColor: '#f0f8ff',
        shadowColor: '#e6f3ff',
        shadowOpacity: 0.6,
        widthRatio: 0.6, // More elliptical
      },
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
    },
    {
      id: "net-warm-white",
      name: "Warm White",
      category: "net",
      type: "net",
      useInstancing: true,
      instanceDefId: "net-warm-white-def",
      centerOffset: { x: 8, y: 8 },
      spacing: 12,
      baseSize: 6,
      renderStyle: {
        backgroundColor: '#fffaf0',
        shadowColor: '#fff5e0',
        shadowOpacity: 0.5,
        sizeRatio: 0.7, // Smaller net lights
      },
      svg: (scale = 1) => {
        return (
          <G transform={`scale(${scale})`}>
            <Circle cx="8" cy="8" r="10" fill="url(#net-warm-outer)" />
            <Circle cx="8" cy="8" r="3" fill="url(#net-warm-inner)" />
            <Circle cx="8" cy="8" r="0.8" fill="#ffffff" />
          </G>
        );
      },
    },
    {
      id: "c9-red-white",
      name: "C9 Red & White",
      category: "string",
      type: "c9",
      useInstancing: false,
      spacing: 36,
      baseSize: 12,
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
      svg: (scale = 1, lightIndex = 0) => {
        // RRWW pattern: Red, Red, White, White, Red, Red, White, White...
        const pattern = ["#ff3333", "#ff3333", "#ffffff", "#ffffff"];
        const color = pattern[lightIndex % pattern.length];
        const isRed = color === "#ff3333";
        
        return (
          <G transform={`scale(${scale})`}>
            {/* Outer glow - red or warm white based on bulb color */}
            <Circle 
              cx="15" 
              cy="15" 
              r="22" 
              fill={isRed ? "#ff3333" : "#fff5e0"} 
              fillOpacity={isRed ? "0.3" : "0.6"} 
            />
            {/* Middle glow */}
            <Circle 
              cx="15" 
              cy="15" 
              r="12" 
              fill={isRed ? "#ff3333" : "#fffaf0"} 
              fillOpacity={isRed ? "0.6" : "0.9"} 
            />
            {/* Bulb */}
            <Circle 
              cx="15" 
              cy="15" 
              r="6" 
              fill={color} 
              stroke={isRed ? "#cc2222" : "#cc9966"} 
              strokeWidth="0.5" 
            />
            {/* Inner highlight */}
            <Circle cx="15" cy="15" r="2" fill="#ffffff" />
            <Circle cx="13" cy="13" r="0.8" fill="#ffffff" fillOpacity="0.8" />
          </G>
        );
      },
    },
    {
      id: "c7-c9-cool-white",
      name: "C7/C9 Cool White LED",
      category: "string",
      type: "c9",
      useInstancing: true,
      instanceDefId: "c7-c9-cool-white-def",
      centerOffset: { x: 15, y: 15 },
      spacing: 36,
      baseSize: 12,
      renderStyle: {
        backgroundColor: '#E8F9FF',
        shadowColor: '#E8F9FF',
        shadowOpacity: 0.8,
        borderColor: 'rgba(232, 249, 255, 0.3)',
      },
      svg: (scale = 1) => {
        return (
          <G transform={`scale(${scale})`}>
            <Circle cx="15" cy="15" r="22" fill="url(#c7-c9-cool-white-outer)" />
            <Circle cx="15" cy="15" r="12" fill="url(#c7-c9-cool-white-middle)" />
            <Circle cx="15" cy="15" r="6" fill="url(#c7-c9-cool-white-bulb)" stroke="#99ccdd" strokeWidth="0.5" />
            <Circle cx="15" cy="15" r="2" fill="#ffffff" />
            <Circle cx="13" cy="13" r="0.8" fill="#ffffff" fillOpacity="0.8" />
          </G>
        );
      },
    },
    {
      id: "c7-c9-red",
      name: "C7/C9 Red",
      category: "string",
      type: "c9",
      useInstancing: true,
      instanceDefId: "c7-c9-red-def",
      centerOffset: { x: 15, y: 15 },
      spacing: 36,
      baseSize: 12,
      renderStyle: {
        backgroundColor: '#C1121F',
        shadowColor: '#C1121F',
        shadowOpacity: 0.8,
        borderColor: 'rgba(193, 18, 31, 0.3)',
      },
      svg: (scale = 1) => {
        return (
          <G transform={`scale(${scale})`}>
            <Circle cx="15" cy="15" r="22" fill="url(#c7-c9-red-outer)" />
            <Circle cx="15" cy="15" r="12" fill="url(#c7-c9-red-middle)" />
            <Circle cx="15" cy="15" r="6" fill="url(#c7-c9-red-bulb)" stroke="#aa0e17" strokeWidth="0.5" />
            <Circle cx="15" cy="15" r="2" fill="#ffffff" />
            <Circle cx="13" cy="13" r="0.8" fill="#ffffff" fillOpacity="0.8" />
          </G>
        );
      },
    },
    {
      id: "c7-c9-green",
      name: "C7/C9 Green",
      category: "string",
      type: "c9",
      useInstancing: true,
      instanceDefId: "c7-c9-green-def",
      centerOffset: { x: 15, y: 15 },
      spacing: 36,
      baseSize: 12,
      renderStyle: {
        backgroundColor: '#0B6623',
        shadowColor: '#0B6623',
        shadowOpacity: 0.8,
        borderColor: 'rgba(11, 102, 35, 0.3)',
      },
      svg: (scale = 1) => {
        return (
          <G transform={`scale(${scale})`}>
            <Circle cx="15" cy="15" r="22" fill="url(#c7-c9-green-outer)" />
            <Circle cx="15" cy="15" r="12" fill="url(#c7-c9-green-middle)" />
            <Circle cx="15" cy="15" r="6" fill="url(#c7-c9-green-bulb)" stroke="#084d1a" strokeWidth="0.5" />
            <Circle cx="15" cy="15" r="2" fill="#ffffff" />
            <Circle cx="13" cy="13" r="0.8" fill="#ffffff" fillOpacity="0.8" />
          </G>
        );
      },
    },
    {
      id: "c7-c9-blue",
      name: "C7/C9 Blue",
      category: "string",
      type: "c9",
      useInstancing: true,
      instanceDefId: "c7-c9-blue-def",
      centerOffset: { x: 15, y: 15 },
      spacing: 36,
      baseSize: 12,
      renderStyle: {
        backgroundColor: '#0074B7',
        shadowColor: '#0074B7',
        shadowOpacity: 0.8,
        borderColor: 'rgba(0, 116, 183, 0.3)',
      },
      svg: (scale = 1) => {
        return (
          <G transform={`scale(${scale})`}>
            <Circle cx="15" cy="15" r="22" fill="url(#c7-c9-blue-outer)" />
            <Circle cx="15" cy="15" r="12" fill="url(#c7-c9-blue-middle)" />
            <Circle cx="15" cy="15" r="6" fill="url(#c7-c9-blue-bulb)" stroke="#005a8d" strokeWidth="0.5" />
            <Circle cx="15" cy="15" r="2" fill="#ffffff" />
            <Circle cx="13" cy="13" r="0.8" fill="#ffffff" fillOpacity="0.8" />
          </G>
        );
      },
    },
    {
      id: "mini-yellow",
      name: "Mini Yellow",
      category: "string",
      type: "mini",
      useInstancing: true,
      instanceDefId: "mini-yellow-def",
      centerOffset: { x: 10, y: 10 },
      spacing: 15,
      baseSize: 8,
      renderStyle: {
        backgroundColor: '#FFD300',
        shadowColor: '#FFD300',
        shadowOpacity: 0.6,
      },
      svg: (scale = 1) => {
        return (
          <G transform={`scale(${scale})`}>
            <Circle cx="10" cy="10" r="12" fill="url(#mini-yellow-outer)" />
            <Circle cx="10" cy="10" r="4" fill="url(#mini-yellow-inner)" />
            <Circle cx="10" cy="10" r="1" fill="#ffffff" />
          </G>
        );
      },
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

  // Get render style for SimpleLightRenderer
  const getLightRenderStyle = (assetId, scale = 1, lightIndex = 0) => {
    const asset = getAssetById(assetId);
    if (!asset) return null;

    const baseSize = asset.baseSize || 8;
    const glowSize = baseSize * 1.8 * scale;
    
    // Get the base style (either static or function)
    let baseStyle;
    if (typeof asset.renderStyle === 'function') {
      baseStyle = asset.renderStyle(lightIndex);
    } else {
      baseStyle = asset.renderStyle || {};
    }

    // Apply size modifiers
    const style = {
      width: glowSize * (baseStyle.sizeRatio || 1),
      height: glowSize * (baseStyle.heightRatio || baseStyle.sizeRatio || 1),
      borderRadius: glowSize / 2,
      backgroundColor: baseStyle.backgroundColor || '#ffffff',
      shadowColor: baseStyle.shadowColor || baseStyle.backgroundColor || '#ffffff',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: baseStyle.shadowOpacity || 0.6,
      shadowRadius: baseSize * 0.4 * scale,
      ...baseStyle
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

  return {
    lightAssets,
    selectedAsset,
    setSelectedAsset,
    getAssetById,
    getAssetsByCategory,
    getCategories,
    getTypesByCategory,
    getLightRenderStyle, // New function for render styles
    getSharedGradientDefs, // Export the shared gradient definitions
    getLightDefinitions, // Export the light definitions for instancing
  };
}
