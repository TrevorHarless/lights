import { MaterialIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';

export function FloatingActionMenu({ onClearAll, onExport, canUndo, onUndo, isExporting }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleMenu = () => setIsExpanded(!isExpanded);

  return (
    <View className="absolute right-4 top-20">
      {/* Expanded menu items */}
      {isExpanded && (
        <View className="mb-3">
          {canUndo && (
            <TouchableOpacity
              onPress={() => {
                onUndo();
                setIsExpanded(false);
              }}
              className="flex-row items-center rounded-xl bg-white/95 px-4 py-3 mb-2 shadow-lg"
              style={{ elevation: 5 }}>
              <MaterialIcons name="undo" size={20} color="#6B7280" />
              <Text className="ml-2 font-semibold text-gray-700">Undo</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            onPress={() => {
              onClearAll();
              setIsExpanded(false);
            }}
            className="flex-row items-center rounded-xl bg-white/95 px-4 py-3 mb-2 shadow-lg"
            style={{ elevation: 5 }}>
            <MaterialIcons name="delete-sweep" size={20} color="#EF4444" />
            <Text className="ml-2 font-semibold text-danger-500">Clear All</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Main FAB for Export */}
      <TouchableOpacity
        onPress={onExport}
        disabled={isExporting}
        className="mb-2 h-14 w-14 items-center justify-center rounded-full bg-primary-500 shadow-lg"
        style={{ elevation: 8 }}>
        {isExporting ? (
          <ActivityIndicator size="small" color="white" />
        ) : (
          <MaterialIcons name="save-alt" size={24} color="white" />
        )}
      </TouchableOpacity>

      {/* Menu toggle button */}
      <TouchableOpacity 
        onPress={toggleMenu} 
        className="h-14 w-14 items-center justify-center rounded-full bg-gray-700/80 shadow-lg"
        style={{ elevation: 8 }}>
        <MaterialIcons name={isExpanded ? 'close' : 'more-horiz'} size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
}
