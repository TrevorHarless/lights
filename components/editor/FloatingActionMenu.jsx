import { MaterialIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export function FloatingActionMenu({ onClearAll, onExport, canUndo, onUndo, isExporting }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleMenu = () => setIsExpanded(!isExpanded);

  return (
    <View style={styles.container}>
      {/* Expanded menu items */}
      {isExpanded && (
        <View style={styles.menuItems}>
          {canUndo && (
            <TouchableOpacity
              onPress={() => {
                onUndo();
                setIsExpanded(false);
              }}
              style={styles.menuItem}>
              <MaterialIcons name="undo" size={20} color="#6B7280" />
              <Text style={styles.menuItemText}>Undo</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            onPress={() => {
              onClearAll();
              setIsExpanded(false);
            }}
            style={styles.menuItem}>
            <MaterialIcons name="delete-sweep" size={20} color="#EF4444" />
            <Text style={styles.clearText}>Clear All</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Main FAB for Export */}
      <TouchableOpacity
        onPress={onExport}
        disabled={isExporting}
        style={styles.exportFab}>
        {isExporting ? (
          <ActivityIndicator size="small" color="white" />
        ) : (
          <MaterialIcons name="save-alt" size={24} color="white" />
        )}
      </TouchableOpacity>

      {/* Menu toggle button */}
      <TouchableOpacity onPress={toggleMenu} style={styles.menuFab}>
        <MaterialIcons name={isExpanded ? 'close' : 'more-horiz'} size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 16,
    top: 80,
  },
  menuItems: {
    marginBottom: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  menuItemText: {
    marginLeft: 8,
    fontWeight: '600',
    color: '#374151',
  },
  clearText: {
    marginLeft: 8,
    fontWeight: '600',
    color: '#EF4444',
  },
  exportFab: {
    marginBottom: 8,
    height: 56,
    width: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 28,
    backgroundColor: '#3B82F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  menuFab: {
    height: 56,
    width: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 28,
    backgroundColor: 'rgba(55, 65, 81, 0.8)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
});
