import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { Text, View, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useSync } from '~/contexts/SyncContext';

interface SyncStatusIndicatorProps {
  showText?: boolean;
  onPress?: () => void;
}

export function SyncStatusIndicator({ showText = false, onPress }: SyncStatusIndicatorProps) {
  const { syncStatus, pendingChanges, hasSyncErrors, lastSyncTime } = useSync();

  const getSyncIcon = () => {
    switch (syncStatus) {
      case 'syncing':
        return <ActivityIndicator size={16} color="#6b7280" />;
      case 'success':
        return <MaterialIcons name="cloud-done" size={16} color="#10b981" />;
      case 'error':
      case 'idle':
        if (hasSyncErrors) {
          return <MaterialIcons name="cloud-off" size={16} color="#ef4444" />;
        }
        if (pendingChanges > 0) {
          return <MaterialIcons name="cloud-upload" size={16} color="#f59e0b" />;
        }
        return <MaterialIcons name="cloud-done" size={16} color="#6b7280" />;
      default:
        return <MaterialIcons name="cloud" size={16} color="#6b7280" />;
    }
  };

  const getSyncText = () => {
    switch (syncStatus) {
      case 'syncing':
        return 'Syncing...';
      case 'success':
        return 'Synced';
      case 'error':
        return 'Sync error';
      case 'idle':
        if (hasSyncErrors) {
          return 'Sync error';
        }
        if (pendingChanges > 0) {
          return `${pendingChanges} pending`;
        }
        if (lastSyncTime) {
          const syncDate = new Date(lastSyncTime);
          const now = new Date();
          const diffMinutes = Math.floor((now.getTime() - syncDate.getTime()) / (1000 * 60));
          
          if (diffMinutes < 1) {
            return 'Just synced';
          } else if (diffMinutes < 60) {
            return `${diffMinutes}m ago`;
          } else {
            const diffHours = Math.floor(diffMinutes / 60);
            return `${diffHours}h ago`;
          }
        }
        return 'Not synced';
      default:
        return 'Offline';
    }
  };

  const getStatusColor = () => {
    switch (syncStatus) {
      case 'syncing':
        return '#6b7280';
      case 'success':
        return '#10b981';
      case 'error':
        return '#ef4444';
      case 'idle':
        if (hasSyncErrors) return '#ef4444';
        if (pendingChanges > 0) return '#f59e0b';
        return '#6b7280';
      default:
        return '#6b7280';
    }
  };

  const Component = onPress ? TouchableOpacity : View;

  return (
    <Component
      onPress={onPress}
      className="flex-row items-center px-2 py-1 rounded-xl bg-white/10 dark:bg-gray-600/20"
    >
      {getSyncIcon()}
      {showText && (
        <Text
          className="text-xs font-medium ml-1 text-gray-600 dark:text-gray-300"
          style={{ color: getStatusColor() }}
        >
          {getSyncText()}
        </Text>
      )}
      {pendingChanges > 0 && !showText && (
        <View className="absolute -top-0.5 -right-0.5 bg-amber-500 rounded-md min-w-3 h-3 items-center justify-center">
          <Text className="text-xs text-white font-bold">
            {pendingChanges > 9 ? '9+' : pendingChanges}
          </Text>
        </View>
      )}
    </Component>
  );
}