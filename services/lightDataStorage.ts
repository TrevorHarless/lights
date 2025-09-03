import { Decor, LightData, LightString, MeasurementLine, ReferenceScale, SingleLight } from '~/types/project';
import { localStorageService } from './localStorage';

export const lightDataStorage = {
  /**
   * Helper method to find a project, with fallback for synced local projects
   */
  async findProject(projectId: string): Promise<any> {
    let project = await localStorageService.getProject(projectId);
    
    // If project not found and this looks like a local ID, try to find synced version
    if (!project && projectId.startsWith('local_')) {
      const allProjects = await localStorageService.getProjects();
      
      const timestampMatch = projectId.match(/local_(\d+)/);
      if (timestampMatch) {
        const timestamp = parseInt(timestampMatch[1]);
        const creationDate = new Date(timestamp);
        const timeWindow = 5 * 60 * 1000; // 5 minutes
        
        project = allProjects.find(p => {
          if (p.id.startsWith('local_')) return false;
          const projectCreation = new Date(p.created_at);
          const timeDiff = Math.abs(projectCreation.getTime() - creationDate.getTime());
          return timeDiff < timeWindow;
        }) || null;
        
      }
    }
    
    return project;
  },
  /**
   * Save light drawing data to a project
   */
  async saveProjectLightData(
    projectId: string,
    lightStrings: LightString[],
    singleLights: SingleLight[],
    decor: Decor[],
    referenceScale?: ReferenceScale,
    measurementLines?: MeasurementLine[]
  ): Promise<void> {
    try {
      const project = await this.findProject(projectId);
      if (!project) {
        throw new Error(`Project ${projectId} not found`);
      }

      const lightData: LightData = {
        lightStrings,
        singleLights,
        decor,
        referenceScale,
        measurementLines,
        lastSaved: new Date().toISOString(),
        version: '1.0'
      };

      await localStorageService.upsertProject({
        ...project,
        light_data: lightData,
        updated_at: new Date().toISOString()
      });

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
      const project = await this.findProject(projectId);
      if (!project) {
        console.warn(`Project ${projectId} not found`);
        return null;
      }

      if (!project.light_data) {
        return null;
      }

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
      const project = await this.findProject(projectId);
      return !!(project?.light_data && (
        project.light_data.lightStrings.length > 0 ||
        project.light_data.singleLights.length > 0 ||
        project.light_data.decor.length > 0 ||
        (project.light_data.measurementLines && project.light_data.measurementLines.length > 0)
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
      const project = await this.findProject(projectId);
      if (!project) {
        throw new Error(`Project ${projectId} not found`);
      }

      await localStorageService.upsertProject({
        ...project,
        light_data: undefined,
        updated_at: new Date().toISOString()
      });

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
      decor: [],
      measurementLines: [],
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
    currentDecor: Decor[],
    currentMeasurementLines: MeasurementLine[],
    savedLightData: LightData | null
  ): boolean {
    if (!savedLightData) {
      // No saved data - consider it unsaved if there's any current data
      return currentLightStrings.length > 0 || 
             currentSingleLights.length > 0 || 
             currentDecor.length > 0 ||
             currentMeasurementLines.length > 0;
    }

    // Simple comparison - check if counts differ
    const savedMeasurementLines = savedLightData.measurementLines || [];
    if (currentLightStrings.length !== savedLightData.lightStrings.length ||
        currentSingleLights.length !== savedLightData.singleLights.length ||
        currentDecor.length !== savedLightData.decor.length ||
        currentMeasurementLines.length !== savedMeasurementLines.length) {
      return true;
    }

    // More detailed comparison could be added here if needed
    // For now, assume no changes if counts match
    return false;
  }
};