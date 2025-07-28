// components/projects/NightModeOverlay.jsx
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

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
        style={[StyleSheet.absoluteFill, styles.overlay, { opacity: intensity }]}
        pointerEvents="none"
      />

      {/* Controls for intensity - Now positioned in top-left */}
      <View style={styles.controlsContainer} pointerEvents="box-none">
        <View style={styles.controlsBox}>
          <Text style={styles.controlsLabel}>Night Effect: {intensityPercent}%</Text>
          <View style={styles.buttonsRow}>
            <TouchableOpacity
              style={styles.button}
              onPress={decreaseIntensity}
              disabled={intensity <= 0.1}>
              <Text style={styles.buttonText}>-</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.button}
              onPress={increaseIntensity}
              disabled={intensity >= 0.9}>
              <Text style={styles.buttonText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  overlay: {
    backgroundColor: '#0a1632', // Deep blue night color
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10, // Above the image (z-index 1) but below the lights (z-index 20)
  },
  controlsContainer: {
    position: 'absolute',
    top: 20,
    left: 20, // Moved from right to left
    zIndex: 50, // Above everything else
  },
  controlsBox: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
  },
  controlsLabel: {
    color: 'white',
    fontSize: 12,
    marginBottom: 5,
    textAlign: 'center',
  },
  buttonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 100,
    marginTop: 5,
  },
  button: {
    backgroundColor: '#007AFF',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
});
