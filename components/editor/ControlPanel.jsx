// components/projects/ControlPanel.jsx
import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export const ControlPanel = ({
  onClearAll,
  onExport,
  hasSelection,
  onDeselect,
  canUndo,
  onUndo,
  isExporting = false,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.buttonRow}>
        {/* Action buttons with improved layout */}
        {canUndo && (
          <TouchableOpacity style={styles.actionButton} onPress={onUndo} activeOpacity={0.7}>
            <MaterialIcons name="undo" size={22} color="#555" />
            <Text style={styles.buttonText}>Undo</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.actionButton, styles.clearButton]}
          onPress={onClearAll}
          activeOpacity={0.7}>
          <MaterialIcons name="delete-sweep" size={22} color="#FF3B30" />
          <Text style={[styles.buttonText, styles.clearText]}>Clear All</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.exportButton]}
          onPress={onExport}
          disabled={isExporting}
          activeOpacity={0.7}>
          {isExporting ? (
            <>
              <ActivityIndicator size="small" color="#fff" style={styles.exportIcon} />
              <Text style={styles.exportText}>Exporting...</Text>
            </>
          ) : (
            <>
              <MaterialIcons name="save-alt" size={22} color="#fff" style={styles.exportIcon} />
              <Text style={styles.exportText}>Export</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderTopWidth: 1,
    borderColor: '#e0e0e0',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 6,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  clearButton: {
    backgroundColor: '#fff0f0',
    borderColor: '#ffcccb',
  },
  exportButton: {
    backgroundColor: '#007AFF',
    borderColor: '#0062cc',
  },
  buttonText: {
    marginLeft: 6,
    fontWeight: '500',
    color: '#555',
    fontSize: 14,
  },
  clearText: {
    color: '#FF3B30',
  },
  exportText: {
    color: '#fff',
    marginLeft: 6,
    fontWeight: '500',
    fontSize: 14,
  },
  exportIcon: {
    marginRight: 0,
  },
});
