// components/projects/NightModeOverlay.jsx
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

/**
 * A component that provides a night-time effect overlay with adjustable intensity
 * using simple buttons instead of a slider
 *
 * @param {Object} props
 * @param {number} props.intensity - Current overlay intensity (0-1)
 * @param {Function} props.onIntensityChange - Callback when intensity changes
 * @param {boolean} props.enabled - Whether the overlay is enabled
 */
export const NightModeOverlay = ({ intensity = 0.7, onIntensityChange, enabled = true }) => {
  // Only render the overlay if enabled
  if (!enabled) return null;

  // Function to increase intensity with upper limit of 0.9
  const increaseIntensity = () => {
    const newValue = Math.min(intensity + 0.1, 0.9);
    onIntensityChange(newValue);
  };

  // Function to decrease intensity with lower limit of 0.1
  const decreaseIntensity = () => {
    const newValue = Math.max(intensity - 0.1, 0.1);
    onIntensityChange(newValue);
  };

  // Format intensity as percentage for display
  const intensityPercent = Math.round(intensity * 100);

  return (
    <>
      {/* Night effect overlay */}
      <View
        className="absolute inset-0 z-10"
        style={{ backgroundColor: '#0a1632', opacity: intensity }}
        pointerEvents="none"
      />

      {/* Controls for intensity - Now positioned in top-left */}
      <View className="absolute top-5 left-5 z-50" pointerEvents="box-none">
        <View className="bg-black/60 rounded-2xl p-2.5 items-center">
          <Text className="text-white text-xs mb-1 text-center">
            Night Effect: {intensityPercent}%
          </Text>
          <View className="flex-row justify-between w-25 mt-1">
            <TouchableOpacity
              className="bg-primary-500 w-10 h-10 rounded-full justify-center items-center"
              onPress={decreaseIntensity}
              disabled={intensity <= 0.1}>
              <Text className="text-white text-2xl font-bold">-</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="bg-primary-500 w-10 h-10 rounded-full justify-center items-center"
              onPress={increaseIntensity}
              disabled={intensity >= 0.9}>
              <Text className="text-white text-2xl font-bold">+</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </>
  );
};
