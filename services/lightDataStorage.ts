import { LightData, LightString, SingleLight, Wreath, ReferenceScale } from '~/types/project';
import { localStorageService } from './localStorage';

export const lightDataStorage = {
  /**
   * Save light drawing data to a project
   */
  async saveProjectLightData(
    projectId: string,
    lightStrings: LightString[],
    singleLights: SingleLight[],
    wreaths: Wreath[],
    referenceScale?: ReferenceScale
  ): Promise<void> {
    try {
      const project = await localStorageService.getProject(projectId);
      if (!project) {
        throw new Error(`Project ${projectId} not found`);
      }

      const lightData: LightData = {
        lightStrings,
        singleLights,
        wreaths,
        referenceScale,
        lastSaved: new Date().toISOString(),
        version: '1.0'
      };

      await localStorageService.upsertProject({
        ...project,
        light_data: lightData,
        updated_at: new Date().toISOString()
      });

      console.log('💡 LightData: Saved light data for project', project.name);
    } catch (error) {
      console.error('Error saving light data:', error);
      throw error;
    }
  },

  /**
   * Load light drawing data from a project
   */
  async loadProjectLightData(projectId: string): Promise<LightData | null> {
    try {
      const project = await localStorageService.getProject(projectId);
      if (!project) {
        console.warn(`Project ${projectId} not found`);
        return null;
      }

      if (!project.light_data) {
        console.log('💡 LightData: No light data found for project', project.name);
        return null;
      }

      console.log('💡 LightData: Loaded light data for project', project.name);
      return project.light_data;
    } catch (error) {
      console.error('Error loading light data:', error);
      return null;
    }
  },

  /**
   * Check if a project has any saved light data
   */
  async hasLightData(projectId: string): Promise<boolean> {
    try {
      const project = await localStorageService.getProject(projectId);
      return !!(project?.light_data && (
        project.light_data.lightStrings.length > 0 ||
        project.light_data.singleLights.length > 0 ||
        project.light_data.wreaths.length > 0
      ));
    } catch (error) {
      console.error('Error checking light data:', error);
      return false;
    }
  },

  /**
   * Clear all light data from a project
   */
  async clearProjectLightData(projectId: string): Promise<void> {
    try {
      const project = await localStorageService.getProject(projectId);
      if (!project) {
        throw new Error(`Project ${projectId} not found`);
      }

      await localStorageService.upsertProject({
        ...project,
        light_data: undefined,
        updated_at: new Date().toISOString()
      });

      console.log('💡 LightData: Cleared light data for project', project.name);
    } catch (error) {
      console.error('Error clearing light data:', error);
      throw error;
    }
  },

  /**
   * Create empty light data structure
   */
  createEmptyLightData(): LightData {
    return {
      lightStrings: [],
      singleLights: [],
      wreaths: [],
      lastSaved: new Date().toISOString(),
      version: '1.0'
    };
  },

  /**
   * Check if light data has unsaved changes by comparing with saved version
   */
  hasUnsavedChanges(
    currentLightStrings: LightString[],
    currentSingleLights: SingleLight[],
    currentWreaths: Wreath[],
    savedLightData: LightData | null
  ): boolean {
    if (!savedLightData) {
      // No saved data - consider it unsaved if there's any current data
      return currentLightStrings.length > 0 || 
             currentSingleLights.length > 0 || 
             currentWreaths.length > 0;
    }

    // Simple comparison - check if counts differ
    if (currentLightStrings.length !== savedLightData.lightStrings.length ||
        currentSingleLights.length !== savedLightData.singleLights.length ||
        currentWreaths.length !== savedLightData.wreaths.length) {
      return true;
    }

    // More detailed comparison could be added here if needed
    // For now, assume no changes if counts match
    return false;
  }
};