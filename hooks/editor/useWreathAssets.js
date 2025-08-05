// hooks/editor/useWreathAssets.js
import React from "react";

export function useWreathAssets() {
  // Wreath asset definitions
  const wreathAssets = [
    // PNG-based Wreaths (professional quality)
    {
      id: "wreath-traditional-pine",
      name: "Pine Wreath",
      category: "wreath",
      type: "traditional",
      renderType: "image",
      image: require("../../assets/wreaths/traditional-pine.png"),
      baseRadius: 60,
      lightSpacing: 20,
    },
    // Add more PNG wreaths here when available:
    /*
    {
      id: "wreath-holly-berries",
      name: "Holly & Berries",
      category: "wreath",
      type: "decorative", 
      renderType: "image",
      image: require("../../assets/wreaths/holly-berries.png"),
      baseRadius: 65,
      lightSpacing: 18,
    },
    {
      id: "wreath-red-bow",
      name: "Red Bow Wreath",
      category: "wreath",
      type: "bow",
      renderType: "image", 
      image: require("../../assets/wreaths/red-bow.png"),
      baseRadius: 70,
      lightSpacing: 22,
    },
    */
  ];

  const [selectedWreathAsset, setSelectedWreathAsset] = React.useState(null);

  // Find the wreath asset by ID
  const getWreathAssetById = (id) => wreathAssets.find((asset) => asset.id === id);

  // Get all wreath types
  const getWreathTypes = () => [...new Set(wreathAssets.map((asset) => asset.type))];

  return {
    wreathAssets,
    selectedWreathAsset,
    setSelectedWreathAsset,
    getWreathAssetById,
    getWreathTypes,
  };
}