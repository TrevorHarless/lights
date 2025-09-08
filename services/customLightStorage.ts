import AsyncStorage from '@react-native-async-storage/async-storage';

export interface CustomLightAsset {
  id: string;
  name: string;
  category: 'custom';
  type: 'custom';
  spacing: number;
  baseSize: number;
  renderType: 'style' | 'pattern';
  renderStyle?: any; // Can be object or function
  component?: any; // For image-based patterns
  pattern?: Array<{ lightImage: any; name: string }>; // For image-based patterns
  createdAt: string;
  isPattern?: boolean;
  patternColors?: string[]; // For color-based patterns (legacy)
  backgroundColor?: string;
  shadowColor?: string;
  shadowOpacity?: number;
  borderColor?: string;
}

const CUSTOM_LIGHTS_KEY = 'custom_light_assets';

// Simple in-memory cache
let customLightsCache: CustomLightAsset[] | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 10000; // 10 seconds

export const customLightStorage = {
  /**
   * Get all saved custom light assets
   */
  async getCustomLights(): Promise<CustomLightAsset[]> {
    try {
      // Check cache first
      const now = Date.now();
      if (customLightsCache && (now - cacheTimestamp) < CACHE_DURATION) {
        return customLightsCache;
      }

      const data = await AsyncStorage.getItem(CUSTOM_LIGHTS_KEY);
      if (!data) {
        customLightsCache = [];
        cacheTimestamp = now;
        return [];
      }

      const customLights = JSON.parse(data) as CustomLightAsset[];
      
      // Restore function-based render styles for patterns
      const restoredLights = customLights.map(light => {
        if (light.isPattern && light.patternColors) {
          return {
            ...light,
            renderStyle: (lightIndex = 0) => {
              const color = light.patternColors![lightIndex % light.patternColors!.length];
              return {
                backgroundColor: color,
                shadowColor: color,
                shadowOpacity: light.shadowOpacity || 0.8,
                shadowRadius: (light.baseSize || 12) * 0.4,
              };
            }
          };
        }
        return light;
      });

      customLightsCache = restoredLights;
      cacheTimestamp = now;
      
      return restoredLights;
    } catch (error) {
      console.error('💡 CustomLights: Error retrieving custom lights:', error);
      return [];
    }
  },

  /**
   * Save a new custom light asset
   */
  async saveCustomLight(lightAsset: Omit<CustomLightAsset, 'id' | 'createdAt'>): Promise<CustomLightAsset> {
    try {
      const newLight: CustomLightAsset = {
        ...lightAsset,
        id: `custom-${Date.now()}`,
        createdAt: new Date().toISOString(),
      };

      // For pattern lights, ensure the renderStyle function is created
      if (newLight.isPattern && newLight.patternColors) {
        newLight.renderStyle = (lightIndex = 0) => {
          const color = newLight.patternColors![lightIndex % newLight.patternColors!.length];
          return {
            backgroundColor: color,
            shadowColor: color,
            shadowOpacity: newLight.shadowOpacity || 0.8,
            shadowRadius: (newLight.baseSize || 12) * 0.4,
          };
        };
      }

      const existingLights = await this.getCustomLights();
      const updatedLights = [...existingLights, newLight];

      // Prepare for storage (serialize functions)
      const lightsForStorage = updatedLights.map(light => ({
        ...light,
        renderStyle: light.isPattern ? undefined : light.renderStyle, // Don't store functions
      }));

      await AsyncStorage.setItem(CUSTOM_LIGHTS_KEY, JSON.stringify(lightsForStorage));
      
      // Update cache with the full objects including functions
      customLightsCache = updatedLights;
      cacheTimestamp = Date.now();

      return newLight;
    } catch (error) {
      console.error('💡 CustomLights: Error saving custom light:', error);
      throw error;
    }
  },

  /**
   * Delete a custom light asset
   */
  async deleteCustomLight(lightId: string): Promise<void> {
    try {
      const existingLights = await this.getCustomLights();
      const filteredLights = existingLights.filter(light => light.id !== lightId);

      // Prepare for storage
      const lightsForStorage = filteredLights.map(light => ({
        ...light,
        renderStyle: light.isPattern ? undefined : light.renderStyle,
      }));

      await AsyncStorage.setItem(CUSTOM_LIGHTS_KEY, JSON.stringify(lightsForStorage));
      
      // Update cache
      customLightsCache = filteredLights;
      cacheTimestamp = Date.now();

    } catch (error) {
      console.error('💡 CustomLights: Error deleting custom light:', error);
      throw error;
    }
  },

  /**
   * Update an existing custom light asset
   */
  async updateCustomLight(lightId: string, updates: Partial<CustomLightAsset>): Promise<CustomLightAsset | null> {
    try {
      const existingLights = await this.getCustomLights();
      const lightIndex = existingLights.findIndex(light => light.id === lightId);
      
      if (lightIndex === -1) {
        console.warn('💡 CustomLights: Light not found for update:', lightId);
        return null;
      }

      const updatedLight = { ...existingLights[lightIndex], ...updates };
      
      // For pattern lights, ensure the renderStyle function is created
      if (updatedLight.isPattern && updatedLight.patternColors) {
        updatedLight.renderStyle = (lightIndex = 0) => {
          const color = updatedLight.patternColors![lightIndex % updatedLight.patternColors!.length];
          return {
            backgroundColor: color,
            shadowColor: color,
            shadowOpacity: updatedLight.shadowOpacity || 0.8,
            shadowRadius: (updatedLight.baseSize || 12) * 0.4,
          };
        };
      }
      
      const updatedLights = [...existingLights];
      updatedLights[lightIndex] = updatedLight;

      // Prepare for storage
      const lightsForStorage = updatedLights.map(light => ({
        ...light,
        renderStyle: light.isPattern ? undefined : light.renderStyle,
      }));

      await AsyncStorage.setItem(CUSTOM_LIGHTS_KEY, JSON.stringify(lightsForStorage));
      
      // Update cache
      customLightsCache = updatedLights;
      cacheTimestamp = Date.now();

      return updatedLight;
    } catch (error) {
      console.error('💡 CustomLights: Error updating custom light:', error);
      throw error;
    }
  },

  /**
   * Clear all custom lights (useful for testing or reset)
   */
  async clearAllCustomLights(): Promise<void> {
    try {
      await AsyncStorage.removeItem(CUSTOM_LIGHTS_KEY);
      customLightsCache = [];
      cacheTimestamp = Date.now();
    } catch (error) {
      console.error('💡 CustomLights: Error clearing custom lights:', error);
      throw error;
    }
  },

  /**
   * Get count of custom lights
   */
  async getCustomLightCount(): Promise<number> {
    const lights = await this.getCustomLights();
    return lights.length;
  },

  /**
   * Clear cache (useful when switching users or refreshing)
   */
  clearCache(): void {
    customLightsCache = null;
    cacheTimestamp = 0;
  }
};