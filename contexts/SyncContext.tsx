import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { AppState } from 'react-native';
import { syncService, SyncStatus, SyncResult } from '~/services/syncService';
import { localStorageService } from '~/services/localStorage';
import { useAuth } from './AuthContext';

interface SyncContextType {
  syncStatus: SyncStatus;
  lastSyncTime: string | null;
  pendingChanges: number;
  isOnline: boolean;
  manualSync: () => Promise<SyncResult>;
  retryFailedSyncs: () => Promise<SyncResult>;
  hasSyncErrors: boolean;
}

const SyncContext = createContext<SyncContextType | undefined>(undefined);

export function SyncProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const [pendingChanges, setPendingChanges] = useState(0);
  const [isOnline, setIsOnline] = useState(true);
  const [hasSyncErrors, setHasSyncErrors] = useState(false);

  const updatePendingChanges = useCallback(async () => {
    try {
      const projects = await localStorageService.getProjects();
      const dirtyProjects = projects.filter(p => p.is_dirty);
      const errorProjects = projects.filter(p => p.sync_status === 'error');
      
      setPendingChanges(dirtyProjects.length);
      setHasSyncErrors(errorProjects.length > 0);
    } catch (error) {
      console.error('Error updating pending changes:', error);
    }
  }, []);

  const updateLastSyncTime = useCallback(async () => {
    try {
      const metadata = await localStorageService.getMetadata();
      setLastSyncTime(metadata.last_full_sync || null);
    } catch (error) {
      console.error('Error getting last sync time:', error);
    }
  }, []);

  const manualSync = useCallback(async (): Promise<SyncResult> => {
    if (!user?.id) {
      return { success: false, error: 'User not authenticated' };
    }

    setSyncStatus('syncing');
    
    try {
      const result = await syncService.fullSync(user.id);
      
      if (result.success) {
        setSyncStatus('success');
        setTimeout(() => setSyncStatus('idle'), 2000);
      } else {
        setSyncStatus('error');
        setTimeout(() => setSyncStatus('idle'), 5000);
      }

      await updatePendingChanges();
      await updateLastSyncTime();

      return result;
    } catch (error) {
      setSyncStatus('error');
      setTimeout(() => setSyncStatus('idle'), 5000);
      await updatePendingChanges();
      
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }, [user?.id, updatePendingChanges, updateLastSyncTime]);

  const retryFailedSyncs = useCallback(async (): Promise<SyncResult> => {
    if (!user?.id) {
      return { success: false, error: 'User not authenticated' };
    }

    setSyncStatus('syncing');
    
    try {
      const result = await syncService.retryFailedSyncs(user.id);
      
      if (result.success) {
        setSyncStatus('success');
        setTimeout(() => setSyncStatus('idle'), 2000);
      } else {
        setSyncStatus('error');
        setTimeout(() => setSyncStatus('idle'), 5000);
      }

      await updatePendingChanges();
      
      return result;
    } catch (error) {
      setSyncStatus('error');
      setTimeout(() => setSyncStatus('idle'), 5000);
      await updatePendingChanges();
      
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }, [user?.id, updatePendingChanges]);

  const backgroundSync = useCallback(async () => {
    if (!user?.id || syncStatus === 'syncing') return;
    
    try {
      const result = await syncService.backgroundSync(user.id);
      if (result.success) {
        await updatePendingChanges();
        await updateLastSyncTime();
      }
    } catch (error) {
      console.error('Background sync error:', error);
    }
  }, [user?.id, syncStatus, updatePendingChanges, updateLastSyncTime]);

  const initialSync = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      const metadata = await localStorageService.getMetadata();
      const hasData = await localStorageService.getProjects();
      
      // Update state immediately with current data
      await updatePendingChanges();
      await updateLastSyncTime();
      
      // If no local data or different user, do initial sync
      if (hasData.length === 0 || metadata.user_id !== user.id) {
        setSyncStatus('syncing');
        const result = await syncService.syncFromCloud(user.id);
        
        if (result.success) {
          setSyncStatus('success');
          setTimeout(() => setSyncStatus('idle'), 2000);
        } else {
          setSyncStatus('error');
          setTimeout(() => setSyncStatus('idle'), 5000);
        }
        
        // Update state after sync
        await updatePendingChanges();
        await updateLastSyncTime();
      }
    } catch (error) {
      console.error('Initial sync failed:', error);
      setSyncStatus('error');
      setTimeout(() => setSyncStatus('idle'), 5000);
    }
  }, [user?.id, updatePendingChanges, updateLastSyncTime]);

  useEffect(() => {
    if (user) {
      // Only run initial sync, which will handle pending changes and sync time updates
      initialSync();
    }
  }, [user, initialSync]);

  useEffect(() => {
    if (!user) return;

    // Don't run immediate background sync since initialSync handles initial state
    // Only set up scheduled and app state syncing

    const handleAppStateChange = (nextAppState: string) => {
      if (nextAppState === 'active') {
        backgroundSync();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    const interval = setInterval(() => {
      if (AppState.currentState === 'active') {
        backgroundSync();
      }
    }, 15 * 60 * 1000); // Increased to 15 minutes

    return () => {
      subscription?.remove();
      clearInterval(interval);
    };
  }, [user, backgroundSync]);

  useEffect(() => {
    if (!user) {
      setPendingChanges(0);
      setHasSyncErrors(false);
      setLastSyncTime(null);
      setSyncStatus('idle');
      // Clear local storage when user signs out
      localStorageService.clearUserData().catch(error => {
        console.error('Error clearing user data:', error);
      });
    }
  }, [user]);

  const value = {
    syncStatus,
    lastSyncTime,
    pendingChanges,
    isOnline,
    manualSync,
    retryFailedSyncs,
    hasSyncErrors,
  };

  return <SyncContext.Provider value={value}>{children}</SyncContext.Provider>;
}

export function useSync() {
  const context = useContext(SyncContext);
  if (context === undefined) {
    throw new Error('useSync must be used within a SyncProvider');
  }
  return context;
}