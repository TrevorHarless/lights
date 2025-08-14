import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ImageViewer from "~/components/editor/ImageViewer";
import { useAuth } from "~/contexts/AuthContext";
import { localStorageService } from "~/services/localStorage";
import { Project } from "~/types/project";
import "../../global.css";

export default function LightEditorScreen() {
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProject = useCallback(async () => {
    setLoading(true);
    try {
      const project = await localStorageService.getProject(projectId!);

      if (!project) {
        Alert.alert("Error", "Project not found");
        router.back();
        return;
      }

      // Check if project has a valid image URL
      if (!project.image_url && project.image_path) {
        console.log('📱 Editor: Project missing image URL, will load on demand');
      }
      
      console.log('📱 Editor: Loaded project from local storage -', project.name);
      setProject(project);
    } catch (error) {
      Alert.alert("Error", "Failed to load project");
      console.error("Error loading project:", error);
      router.back();
    } finally {
      setLoading(false);
    }
  }, [projectId, router]);

  useEffect(() => {
    if (user && projectId) {
      loadProject();
    }
  }, [user, projectId, loadProject]);

  const handleGoBack = () => {
    router.back();
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 justify-center items-center">
          <View className="bg-white p-8 rounded-2xl shadow-lg">
            <Text className="text-lg text-gray-600 text-center">
              Loading editor...
            </Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (!project) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 justify-center items-center">
          <View className="bg-white p-8 rounded-2xl shadow-lg">
            <Text className="text-lg text-gray-600 text-center mb-4">
              Project not found
            </Text>
            <TouchableOpacity
              className="bg-blue-600 px-6 py-3 rounded-xl"
              onPress={handleGoBack}
            >
              <Text className="text-white font-semibold text-center">
                Go Back
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <>
      <Stack.Screen 
        options={{ 
          gestureEnabled: false,
          headerShown: false 
        }} 
      />
      <SafeAreaView className="flex-1 bg-gray-50">
        {/* Main Content */}
        {project.image_url ? (
          <ImageViewer imgSource={project.image_url} onGoBack={handleGoBack} />
        ) : (
        <View className="flex-1 justify-center items-center px-8">
          <View className="bg-white p-8 rounded-3xl items-center max-w-sm">
            <Text className="text-xl font-bold text-gray-800 mb-2 text-center">
              No Image Available
            </Text>
            <Text className="text-gray-500 text-center mb-6">
              This project needs an image to use the light editor
            </Text>
            <TouchableOpacity
              className="bg-blue-600 px-6 py-3 rounded-xl"
              onPress={handleGoBack}
            >
              <Text className="text-white font-semibold">Go Back</Text>
            </TouchableOpacity>
          </View>
        </View>
        )}
      </SafeAreaView>
    </>
  );
}
