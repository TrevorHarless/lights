import { MaterialIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';

export function FloatingExportButton({ onClearAll, onExport, isExporting }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleMenu = () => setIsExpanded(!isExpanded);

  return (
    <View style={{ position: 'absolute', top: 12, right: 12, zIndex: 1000 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        {/* Export Button */}
        <TouchableOpacity
          onPress={onExport}
          disabled={isExporting}
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            justifyContent: 'center',
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.15,
            shadowRadius: 4,
            elevation: 4,
          }}>
          {isExporting ? (
            <ActivityIndicator size="small" color="#007AFF" />
          ) : (
            <MaterialIcons name="file-download" size={22} color="#007AFF" />
          )}
        </TouchableOpacity>

        {/* Menu Button */}
        <TouchableOpacity 
          onPress={toggleMenu} 
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            justifyContent: 'center',
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.15,
            shadowRadius: 4,
            elevation: 4,
          }}>
          <MaterialIcons name={isExpanded ? 'close' : 'more-horiz'} size={22} color="#007AFF" />
        </TouchableOpacity>
      </View>

      {/* Expanded menu items */}
      {isExpanded && (
        <View style={{ 
          position: 'absolute', 
          top: 50, 
          right: 0, 
          minWidth: 120,
        }}>
          <TouchableOpacity
            onPress={() => {
              onClearAll();
              setIsExpanded(false);
            }}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              paddingHorizontal: 12,
              paddingVertical: 10,
              borderRadius: 12,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.15,
              shadowRadius: 4,
              elevation: 4,
            }}>
            <MaterialIcons name="delete-sweep" size={18} color="#EF4444" />
            <Text style={{ marginLeft: 8, fontWeight: '600', color: '#EF4444', fontSize: 14 }}>Clear All</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}