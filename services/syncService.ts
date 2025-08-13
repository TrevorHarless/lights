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

            const updatedProject = {
              ...localProject,
              id: data.id,
              created_at: data.created_at,
              updated_at: data.updated_at,
            };

            await localStorageService.deleteProject(localProject.id);
            await localStorageService.upsertProject(updatedProject);
            await localStorageService.markProjectSynced(data.id);
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
        cloudProjects.map(async (project) => {
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

      const uploadResult = await this.syncToCloud(userId);
      if (!uploadResult.success) {
        return uploadResult;
      }

      const downloadResult = await this.syncFromCloud(userId);
      if (!downloadResult.success) {
        return downloadResult;
      }

      return {
        success: true,
        syncedCount: (uploadResult.syncedCount || 0) + (downloadResult.syncedCount || 0),
        conflictCount: uploadResult.conflictCount || 0
      };
    } catch (error) {
      console.error('Full sync failed:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
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
      
      const dirtyProjects = await localStorageService.getDirtyProjects();
      if (dirtyProjects.length > 0) {
        const uploadResult = await this.syncToCloud(userId);
        totalSynced += uploadResult.syncedCount || 0;
      }
      
      const metadata = await localStorageService.getMetadata();
      const lastSync = metadata.last_full_sync;
      
      if (!lastSync) {
        const downloadResult = await this.syncFromCloud(userId);
        totalSynced += downloadResult.syncedCount || 0;
        return { success: true, syncedCount: totalSynced };
      }
      
      const lastSyncDate = new Date(lastSync);
      const now = new Date();
      const timeSinceLastSync = now.getTime() - lastSyncDate.getTime();
      const thirtyMinutes = 30 * 60 * 1000;
      
      if (timeSinceLastSync > thirtyMinutes) {
        const downloadResult = await this.syncFromCloud(userId);
        totalSynced += downloadResult.syncedCount || 0;
      }
      
      return { success: true, syncedCount: totalSynced };
    } catch (error) {
      console.error('Background sync failed:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }
}

export const syncService = new SyncService();