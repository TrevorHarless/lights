// components/projects/ControlPanel.jsx
import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';

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
    <View className="bg-gray-50 p-3 border-t border-gray-200">
      <View className="flex-row justify-around items-center">
        {/* Action buttons with improved layout */}
        {canUndo && (
          <TouchableOpacity 
            className="flex-row items-center justify-center py-2.5 px-4 rounded-lg flex-1 mx-1.5 bg-gray-100 border border-gray-200" 
            onPress={onUndo} 
            activeOpacity={0.7}>
            <MaterialIcons name="undo" size={22} color="#6b7280" />
            <Text className="ml-1.5 font-medium text-gray-600 text-sm">Undo</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          className="flex-row items-center justify-center py-2.5 px-4 rounded-lg flex-1 mx-1.5 bg-red-50 border border-red-200"
          onPress={onClearAll}
          activeOpacity={0.7}>
          <MaterialIcons name="delete-sweep" size={22} color="#ef4444" />
          <Text className="ml-1.5 font-medium text-danger-500 text-sm">Clear All</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="flex-row items-center justify-center py-2.5 px-4 rounded-lg flex-1 mx-1.5 bg-primary-500 border border-primary-600"
          onPress={onExport}
          disabled={isExporting}
          activeOpacity={0.7}>
          {isExporting ? (
            <>
              <ActivityIndicator size="small" color="#fff" />
              <Text className="text-white ml-1.5 font-medium text-sm">Exporting...</Text>
            </>
          ) : (
            <>
              <MaterialIcons name="save-alt" size={22} color="#fff" />
              <Text className="text-white ml-1.5 font-medium text-sm">Export</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};
