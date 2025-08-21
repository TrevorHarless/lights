// hooks/editor/useDecorAssets.js
import React from "react";

export function useDecorAssets() {
  // Decor asset definitions
  const decorAssets = [
    // PNG-based Decor items (professional quality)
    {
      id: "wreath-traditional-pine",
      name: "Pine Wreath",
      category: "decor",
      type: "traditional",
      renderType: "image",
      image: require("../../assets/wreaths/traditional-pine.png"),
      baseRadius: 60,
      lightSpacing: 20,
    },
    {
      id: "red-bow",
      name: "Bow",
      category: "decor",
      type: "traditional",
      renderType: "image",
      image: require("../../assets/wreaths/red-bow.png"),
      baseRadius: 60,
      lightSpacing: 20,
    },
    // Add more PNG wreaths here when available:
    /*
    {
      id: "wreath-holly-berries",
      name: "Holly & Berries",
      category: "decor",
      type: "decorative", 
      renderType: "image",
      image: require("../../assets/wreaths/holly-berries.png"),
      baseRadius: 65,
      lightSpacing: 18,
    },
    {
      id: "wreath-red-bow",
      name: "Red Bow Wreath",
      category: "decor",
      type: "bow",
      renderType: "image", 
      image: require("../../assets/wreaths/red-bow.png"),
      baseRadius: 70,
      lightSpacing: 22,
    },
    */
  ];

  const [selectedDecorAsset, setSelectedDecorAsset] = React.useState(null);

  // Find the decor asset by ID
  const getDecorAssetById = (id) =>
    decorAssets.find((asset) => asset.id === id);

  // Get all decor types
  const getDecorTypes = () => [
    ...new Set(decorAssets.map((asset) => asset.type)),
  ];

  return {
    decorAssets,
    selectedDecorAsset,
    setSelectedDecorAsset,
    getDecorAssetById,
    getDecorTypes,
  };
}
