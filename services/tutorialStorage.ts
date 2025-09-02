import AsyncStorage from '@react-native-async-storage/async-storage';

const TUTORIAL_STORAGE_KEY = 'tutorial_completion_status';

interface TutorialCompletionStatus {
  hasCompletedTutorial: boolean;
  completedAt?: string;
  skippedAt?: string;
}

export const tutorialStorage = {
  async getCompletionStatus(): Promise<TutorialCompletionStatus> {
    try {
      const data = await AsyncStorage.getItem(TUTORIAL_STORAGE_KEY);
      if (!data) {
        return { hasCompletedTutorial: false };
      }
      return JSON.parse(data);
    } catch (error) {
      console.error('Error reading tutorial completion status:', error);
      return { hasCompletedTutorial: false };
    }
  },

  async markTutorialCompleted(): Promise<void> {
    try {
      const status: TutorialCompletionStatus = {
        hasCompletedTutorial: true,
        completedAt: new Date().toISOString(),
      };
      await AsyncStorage.setItem(TUTORIAL_STORAGE_KEY, JSON.stringify(status));
    } catch (error) {
      console.error('Error saving tutorial completion status:', error);
      throw error;
    }
  },

  async markTutorialSkipped(): Promise<void> {
    try {
      const status: TutorialCompletionStatus = {
        hasCompletedTutorial: true,
        skippedAt: new Date().toISOString(),
      };
      await AsyncStorage.setItem(TUTORIAL_STORAGE_KEY, JSON.stringify(status));
    } catch (error) {
      console.error('Error saving tutorial skip status:', error);
      throw error;
    }
  },

  async resetTutorialStatus(): Promise<void> {
    try {
      await AsyncStorage.removeItem(TUTORIAL_STORAGE_KEY);
    } catch (error) {
      console.error('Error resetting tutorial status:', error);
      throw error;
    }
  },

  async hasCompletedTutorial(): Promise<boolean> {
    const status = await this.getCompletionStatus();
    return status.hasCompletedTutorial;
  }
};