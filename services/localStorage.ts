import AsyncStorage from '@react-native-async-storage/async-storage';
import { Project } from '~/types/project';

export interface StoredProject extends Project {
  last_synced?: string;
  is_dirty?: boolean;
  sync_status?: 'synced' | 'pending' | 'syncing' | 'error';
}

export interface LocalStorageMetadata {
  last_full_sync?: string;
  user_id?: string;
}

const PROJECTS_KEY = 'local_projects';
const METADATA_KEY = 'local_metadata';

// Simple in-memory cache to reduce AsyncStorage reads
let projectsCache: StoredProject[] | null = null;
let cacheTimestamp: number = 0;
let currentUserId: string | null = null;
const CACHE_DURATION = 5000; // 5 seconds

export const localStorageService = {
  // Clear cache when user changes to prevent data leakage
  clearCacheForUser(userId: string) {
    if (currentUserId && currentUserId !== userId) {
      projectsCache = null;
      cacheTimestamp = 0;
      console.log('💾 LocalStorage: Cleared cache for user change');
    }
    currentUserId = userId;
  },

  async getProjects(): Promise<StoredProject[]> {
    try {
      // Check cache first
      const now = Date.now();
      if (projectsCache && (now - cacheTimestamp) < CACHE_DURATION) {
        console.log('💾 LocalStorage: Retrieved', projectsCache.length, 'projects from cache');
        return projectsCache;
      }

      const data = await AsyncStorage.getItem(PROJECTS_KEY);
      if (!data) {
        projectsCache = [];
        cacheTimestamp = now;
        return [];
      }
      
      const projects = JSON.parse(data);
      projectsCache = projects;
      cacheTimestamp = now;
      console.log('💾 LocalStorage: Retrieved', projects.length, 'projects from local storage');
      return projects;
    } catch (error) {
      console.error('Error reading projects from local storage:', error);
      return [];
    }
  },

  async saveProjects(projects: StoredProject[]): Promise<void> {
    try {
      console.log('💾 LocalStorage: Saving', projects.length, 'projects to local storage');
      await AsyncStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
      
      // Update cache
      projectsCache = projects;
      cacheTimestamp = Date.now();
    } catch (error) {
      console.error('Error saving projects to local storage:', error);
      throw error;
    }
  },

  async getProject(projectId: string): Promise<StoredProject | null> {
    const projects = await this.getProjects();
    return projects.find(p => p.id === projectId) || null;
  },

  async upsertProject(project: StoredProject): Promise<void> {
    const projects = await this.getProjects();
    const index = projects.findIndex(p => p.id === project.id);
    
    const updatedProject = {
      ...project,
      is_dirty: true,
      sync_status: 'pending' as const,
      updated_at: new Date().toISOString(),
    };

    if (index >= 0) {
      console.log('💾 LocalStorage: Updating project -', project.name);
      projects[index] = updatedProject;
    } else {
      console.log('💾 LocalStorage: Creating new project -', project.name);
      projects.unshift(updatedProject);
    }

    await this.saveProjects(projects);
  },

  async deleteProject(projectId: string): Promise<void> {
    console.log('💾 LocalStorage: Deleting project -', projectId);
    const projects = await this.getProjects();
    const filteredProjects = projects.filter(p => p.id !== projectId);
    await this.saveProjects(filteredProjects);
  },

  async markProjectSynced(projectId: string): Promise<void> {
    const projects = await this.getProjects();
    const project = projects.find(p => p.id === projectId);
    
    if (project) {
      project.is_dirty = false;
      project.sync_status = 'synced';
      project.last_synced = new Date().toISOString();
      await this.saveProjects(projects);
    }
  },

  async markProjectSyncing(projectId: string): Promise<void> {
    const projects = await this.getProjects();
    const project = projects.find(p => p.id === projectId);
    
    if (project) {
      project.sync_status = 'syncing';
      await this.saveProjects(projects);
    }
  },

  async markProjectSyncError(projectId: string): Promise<void> {
    const projects = await this.getProjects();
    const project = projects.find(p => p.id === projectId);
    
    if (project) {
      project.sync_status = 'error';
      await this.saveProjects(projects);
    }
  },

  async getDirtyProjects(): Promise<StoredProject[]> {
    const projects = await this.getProjects();
    return projects.filter(p => p.is_dirty);
  },

  async getMetadata(): Promise<LocalStorageMetadata> {
    try {
      const data = await AsyncStorage.getItem(METADATA_KEY);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error('Error reading metadata from local storage:', error);
      return {};
    }
  },

  async saveMetadata(metadata: LocalStorageMetadata): Promise<void> {
    try {
      const current = await this.getMetadata();
      const updated = { ...current, ...metadata };
      await AsyncStorage.setItem(METADATA_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Error saving metadata to local storage:', error);
      throw error;
    }
  },

  async updateLastSyncTime(): Promise<void> {
    try {
      await this.saveMetadata({
        last_full_sync: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error updating last sync time:', error);
      throw error;
    }
  },

  async clearUserData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([PROJECTS_KEY, METADATA_KEY]);
    } catch (error) {
      console.error('Error clearing local storage:', error);
      throw error;
    }
  },

  async getCachedImageUrl(project: StoredProject): Promise<string | null> {
    if (!project.image_url || !project.image_url_expires_at) {
      return null;
    }
    
    const expiresAt = new Date(project.image_url_expires_at);
    const now = new Date();
    const hoursUntilExpiry = (expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    // Refresh if expiring within 4 hours (more efficient than 24 hours)
    if (hoursUntilExpiry < 4) {
      return null;
    }
    
    return project.image_url;
  },

  async cacheImageUrl(projectId: string, url: string): Promise<void> {
    const projects = await this.getProjects();
    const projectIndex = projects.findIndex(p => p.id === projectId);
    
    if (projectIndex >= 0) {
      projects[projectIndex] = {
        ...projects[projectIndex],
        image_url: url,
        image_url_cached_at: new Date().toISOString(),
        // Supabase signed URLs typically expire in 1 hour, cache for 50 minutes
        image_url_expires_at: new Date(Date.now() + 50 * 60 * 1000).toISOString()
      };
      await this.saveProjects(projects);
      console.log('💾 LocalStorage: Cached image URL for project', projectId);
    }
  },

  async replaceAllProjects(projects: Project[], userId: string): Promise<void> {
    const storedProjects: StoredProject[] = projects.map(project => ({
      ...project,
      is_dirty: false,
      sync_status: 'synced' as const,
      last_synced: new Date().toISOString(),
    }));

    await this.saveProjects(storedProjects);
    await this.saveMetadata({
      last_full_sync: new Date().toISOString(),
      user_id: userId,
    });
  }
};