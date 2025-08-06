import { MaterialIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { TouchableOpacity, Alert, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSync } from '~/contexts/SyncContext';

interface SyncButtonProps {
  size?: number;
  color?: string;
  style?: any;
}

export function SyncButton({ size = 20, color = 'white', style }: SyncButtonProps) {
  const { manualSync, syncStatus, pendingChanges, hasSyncErrors, retryFailedSyncs } = useSync();
  const [isPressed, setIsPressed] = useState(false);

  const handleSync = async () => {
    try {
      setIsPressed(true);
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      let result;
      if (hasSyncErrors) {
        result = await retryFailedSyncs();
      } else {
        result = await manualSync();
      }

      if (result.success) {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        
        if (result.syncedCount && result.syncedCount > 0) {
          Alert.alert(
            'Sync Complete',
            `Successfully synced ${result.syncedCount} project${result.syncedCount === 1 ? '' : 's'}.`
          );
        }
        
        if (result.conflictCount && result.conflictCount > 0) {
          Alert.alert(
            'Sync Conflicts',
            `${result.conflictCount} project${result.conflictCount === 1 ? '' : 's'} could not be synced due to conflicts. Please check your projects.`
          );
        }
      } else {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Alert.alert(
          'Sync Failed',
          result.error || 'An unknown error occurred during sync.'
        );
      }
    } catch (error) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Sync Failed', 'An error occurred while syncing.');
      console.error('Manual sync error:', error);
    } finally {
      setIsPressed(false);
    }
  };

  const isDisabled = syncStatus === 'syncing';
  const hasChanges = pendingChanges > 0 || hasSyncErrors;

  return (
    <TouchableOpacity
      onPress={handleSync}
      disabled={isDisabled}
      className={`items-center justify-center rounded-full ${
        isPressed
          ? 'bg-white/30 dark:bg-gray-300/30'
          : hasChanges
          ? 'bg-amber-500/20 dark:bg-amber-400/20 border border-amber-500'
          : 'bg-white/10 dark:bg-gray-600/20'
      } ${isDisabled ? 'opacity-50' : ''}`}
      style={[
        {
          width: size + 16,
          height: size + 16,
        },
        style,
      ]}
    >
      <MaterialIcons
        name={
          hasSyncErrors
            ? 'sync-problem'
            : hasChanges
            ? 'cloud-upload'
            : 'sync'
        }
        size={size}
        color={color}
        style={{
          transform: [
            {
              rotate: isPressed || syncStatus === 'syncing' ? '180deg' : '0deg',
            },
          ],
        }}
      />
      
      {hasChanges && (
        <View
          className={`absolute top-0.5 right-0.5 rounded w-2 h-2 ${
            hasSyncErrors ? 'bg-red-500' : 'bg-amber-500'
          }`}
        />
      )}
    </TouchableOpacity>
  );
}