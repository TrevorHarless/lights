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

export const localStorageService = {
  async getProjects(): Promise<StoredProject[]> {
    try {
      const data = await AsyncStorage.getItem(PROJECTS_KEY);
      if (!data) return [];
      return JSON.parse(data);
    } catch (error) {
      console.error('Error reading projects from local storage:', error);
      return [];
    }
  },

  async saveProjects(projects: StoredProject[]): Promise<void> {
    try {
      await AsyncStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
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
      projects[index] = updatedProject;
    } else {
      projects.unshift(updatedProject);
    }

    await this.saveProjects(projects);
  },

  async deleteProject(projectId: string): Promise<void> {
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

  async clearUserData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([PROJECTS_KEY, METADATA_KEY]);
    } catch (error) {
      console.error('Error clearing local storage:', error);
      throw error;
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