import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export function FloatingReferenceButton({
  hasReference,
  isSettingReference,
  onStartReference,
  onClearReference,
  referenceLength,
}) {
  if (isSettingReference) {
    return (
      <View style={styles.settingContainer}>
        <Text style={styles.settingTitle}>Draw a reference line</Text>
        <Text style={styles.settingSubtitle}>
          Tap and drag to create a line of known length
        </Text>
      </View>
    );
  }

  if (hasReference) {
    return (
      <View style={styles.activeContainer}>
        <Ionicons name="checkmark-circle" size={18} color="white" />
        <Text style={styles.activeText}>{referenceLength}ft reference</Text>
        <TouchableOpacity onPress={onClearReference} style={styles.clearButton}>
          <Text style={styles.clearText}>Clear</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <TouchableOpacity onPress={onStartReference} style={styles.setContainer}>
      <Ionicons name="resize" size={18} color="white" />
      <Text style={styles.setText}>Set Scale</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  settingContainer: {
    position: 'absolute',
    left: 16,
    right: 16,
    top: 80,
    borderRadius: 12,
    backgroundColor: 'rgba(59, 130, 246, 0.9)',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  settingTitle: {
    textAlign: 'center',
    fontWeight: '600',
    color: 'white',
  },
  settingSubtitle: {
    marginTop: 4,
    textAlign: 'center',
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  activeContainer: {
    position: 'absolute',
    left: 16,
    top: 80,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: 'rgba(34, 197, 94, 0.9)',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  activeText: {
    marginLeft: 8,
    fontWeight: '600',
    color: 'white',
  },
  clearButton: {
    marginLeft: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  clearText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },
  setContainer: {
    position: 'absolute',
    left: 16,
    top: 80,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: 'rgba(249, 115, 22, 0.9)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  setText: {
    marginLeft: 8,
    fontWeight: '600',
    color: 'white',
  },
});
