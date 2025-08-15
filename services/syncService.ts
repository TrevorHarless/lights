import { supabase } from '~/lib/supabase';
import { Project, CreateProjectData } from '~/types/project';
import { localStorageService, StoredProject } from './localStorage';
import { imageUploadService } from './imageUpload';

export type SyncStatus = 'idle' | 'syncing' | 'error' | 'success';

export interface SyncResult {
  success: boolean;
  error?: string;
  syncedCount?: number;
  conflictCount?: number;
}

class SyncService {
  private retryAttempts = 3;
  private retryDelay = 1000;

  async syncToCloud(userId: string): Promise<SyncResult> {
    try {
      const dirtyProjects = await localStorageService.getDirtyProjects();
      console.log(`📤 Sync: Found ${dirtyProjects.length} dirty projects to upload`);
      let syncedCount = 0;
      let conflictCount = 0;

      for (const localProject of dirtyProjects) {
        await localStorageService.markProjectSyncing(localProject.id);

        try {
          if (localProject.id.startsWith('local_')) {
            const createData: CreateProjectData = {
              name: localProject.name,
              description: localProject.description,
              address: localProject.address,
              phone_number: localProject.phone_number,
              image_url: localProject.image_url,
              image_path: localProject.image_path,
            };

            const { data, error } = await supabase
              .from('projects')
              .insert([{ user_id: userId, ...createData }])
              .select()
              .single();

            if (error) throw error;

            const projectData = data as Project;
            const updatedProject = {
              ...localProject,
              id: projectData.id,
              created_at: projectData.created_at,
              updated_at: projectData.updated_at,
            };

            await localStorageService.deleteProject(localProject.id);
            await localStorageService.upsertProject(updatedProject);
            await localStorageService.markProjectSynced(projectData.id);
          } else {
            const { error: updateError } = await supabase
              .from('projects')
              .update({
                name: localProject.name,
                description: localProject.description,
                address: localProject.address,
                phone_number: localProject.phone_number,
                image_url: localProject.image_url,
                image_path: localProject.image_path,
              })
              .eq('id', localProject.id);

            if (updateError) {
              if (updateError.code === 'PGRST116') {
                conflictCount++;
                await localStorageService.markProjectSyncError(localProject.id);
                continue;
              }
              throw updateError;
            }

            await localStorageService.markProjectSynced(localProject.id);
          }
          
          syncedCount++;
        } catch (error) {
          console.error(`Error syncing project ${localProject.id}:`, error);
          await localStorageService.markProjectSyncError(localProject.id);
        }
      }

      return { success: true, syncedCount, conflictCount };
    } catch (error) {
      console.error('Sync to cloud failed:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async syncFromCloud(userId: string): Promise<SyncResult> {
    try {
      const { data: cloudProjects, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (!cloudProjects) {
        return { success: true, syncedCount: 0 };
      }

      const projectsWithUrls = await Promise.all(
        (cloudProjects as unknown as Project[]).map(async (project) => {
          if (project.image_path) {
            const { url } = await imageUploadService.getSignedUrl(project.image_path);
            return {
              ...project,
              image_url: url || project.image_url
            };
          }
          return project;
        })
      );

      await localStorageService.replaceAllProjects(projectsWithUrls, userId);

      return { success: true, syncedCount: cloudProjects.length };
    } catch (error) {
      console.error('Sync from cloud failed:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async syncMissingFromCloud(userId: string): Promise<SyncResult> {
    try {
      // Get local projects to compare
      const localProjects = await localStorageService.getProjects();
      const localProjectIds = new Set(localProjects.map(p => p.id));

      const { data: cloudProjects, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (!cloudProjects) {
        return { success: true, syncedCount: 0 };
      }

      // Filter to only projects not in local storage
      const missingProjects = (cloudProjects as unknown as Project[]).filter(project => !localProjectIds.has(project.id));
      
      if (missingProjects.length === 0) {
        console.log('📥 No missing projects to sync from cloud');
        return { success: true, syncedCount: 0 };
      }

      console.log(`📥 Sync: Found ${missingProjects.length} missing projects to download`);

      // Only get signed URLs for missing projects
      const projectsWithUrls = await Promise.all(
        missingProjects.map(async (project) => {
          if (project.image_path) {
            const { url } = await imageUploadService.getSignedUrl(project.image_path);
            return {
              ...project,
              image_url: url || project.image_url
            };
          }
          return project;
        })
      );

      // Add missing projects to local storage instead of replacing all
      for (const project of projectsWithUrls) {
        await localStorageService.upsertProject({
          ...project,
          is_dirty: false,
          sync_status: 'synced' as const
        });
      }

      return { success: true, syncedCount: missingProjects.length };
    } catch (error) {
      console.error('Sync missing from cloud failed:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async fullSync(userId: string): Promise<SyncResult> {
    try {
      const metadata = await localStorageService.getMetadata();
      const lastSync = metadata.last_full_sync;
      const now = new Date();
      
      if (lastSync) {
        const lastSyncDate = new Date(lastSync);
        const timeSinceLastSync = now.getTime() - lastSyncDate.getTime();
        const fiveMinutes = 5 * 60 * 1000;
        
        if (timeSinceLastSync < fiveMinutes) {
          return { success: true, syncedCount: 0 };
        }
      }

      return await this.performFullSync(userId);
    } catch (error) {
      console.error('Full sync failed:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async manualSync(userId: string): Promise<SyncResult> {
    try {
      // Manual sync bypasses rate limiting - always sync when user requests it
      console.log('🔄 Manual sync requested, bypassing rate limit');
      return await this.performFullSync(userId);
    } catch (error) {
      console.error('Manual sync failed:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  private async performFullSync(userId: string): Promise<SyncResult> {
    // First, upload any dirty (unsynced) local projects
    const uploadResult = await this.syncToCloud(userId);
    if (!uploadResult.success) {
      return uploadResult;
    }

    // Then, download any missing projects from cloud (selective sync)
    const downloadResult = await this.syncMissingFromCloud(userId);
    if (!downloadResult.success) {
      return downloadResult;
    }

    // Update last sync time after successful sync
    await localStorageService.updateLastSyncTime();

    return {
      success: true,
      syncedCount: (uploadResult.syncedCount || 0) + (downloadResult.syncedCount || 0),
      conflictCount: uploadResult.conflictCount || 0
    };
  }

  async retryFailedSyncs(userId: string): Promise<SyncResult> {
    const projects = await localStorageService.getProjects();
    const errorProjects = projects.filter(p => p.sync_status === 'error');
    
    if (errorProjects.length === 0) {
      return { success: true, syncedCount: 0 };
    }

    for (const project of errorProjects) {
      project.is_dirty = true;
      project.sync_status = 'pending';
    }
    
    await localStorageService.saveProjects(projects);
    return await this.syncToCloud(userId);
  }

  async backgroundSync(userId: string): Promise<SyncResult> {
    try {
      if (!userId) return { success: true, syncedCount: 0 };
      
      let totalSynced = 0;
      
      // Always upload dirty projects
      const dirtyProjects = await localStorageService.getDirtyProjects();
      if (dirtyProjects.length > 0) {
        const uploadResult = await this.syncToCloud(userId);
        totalSynced += uploadResult.syncedCount || 0;
      }
      
      const metadata = await localStorageService.getMetadata();
      const lastSync = metadata.last_full_sync;
      
      if (!lastSync) {
        // First time sync - use selective sync to only get missing projects
        const downloadResult = await this.syncMissingFromCloud(userId);
        totalSynced += downloadResult.syncedCount || 0;
        await localStorageService.updateLastSyncTime();
        return { success: true, syncedCount: totalSynced };
      }
      
      const lastSyncDate = new Date(lastSync);
      const now = new Date();
      const timeSinceLastSync = now.getTime() - lastSyncDate.getTime();
      const thirtyMinutes = 30 * 60 * 1000;
      
      if (timeSinceLastSync > thirtyMinutes) {
        // Periodic sync - use selective sync to only get missing projects
        const downloadResult = await this.syncMissingFromCloud(userId);
        totalSynced += downloadResult.syncedCount || 0;
        await localStorageService.updateLastSyncTime();
      }
      
      return { success: true, syncedCount: totalSynced };
    } catch (error) {
      console.error('Background sync failed:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }
}

export const syncService = new SyncService();