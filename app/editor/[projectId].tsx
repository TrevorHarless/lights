import { useAuth } from "@/contexts/AuthContext";
import { projectsService } from "@/services/projects";
import { Project } from "@/types/project";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { InteractiveCanvas } from "@/components/editor/InteractiveCanvas";
import { AssetPalette } from "@/components/editor/AssetPalette";
import { useLightStrings } from "@/hooks/editor/useLightStrings";
import { useLightAssets } from "@/hooks/editor/useLightAssets";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import "../../global.css";

export default function LightEditorScreen() {
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize editor hooks
  const lightStringsHook = useLightStrings();
  const lightAssetsHook = useLightAssets();

  const loadProject = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await projectsService.getProject(projectId!);

      if (error) {
        Alert.alert("Error", "Failed to load project");
        console.error("Error loading project:", error);
        router.back();
        return;
      }

      if (!data) {
        Alert.alert("Error", "Project not found");
        router.back();
        return;
      }

      setProject(data);
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
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View style={{ backgroundColor: 'white', paddingHorizontal: 16, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
            <TouchableOpacity
              style={{ width: 40, height: 40, alignItems: 'center', justifyContent: 'center', marginRight: 12 }}
              onPress={handleGoBack}
            >
              <FontAwesome name="arrow-left" size={20} color="#374151" />
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#1f2937' }}>
                {project.name}
              </Text>
              <Text style={{ fontSize: 14, color: '#6b7280' }}>Light Editor</Text>
            </View>
          </View>

          <TouchableOpacity style={{ backgroundColor: '#2563eb', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 }}>
            <Text style={{ color: 'white', fontWeight: '600', fontSize: 14 }}>Export</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Content */}
      <View className="flex-1 flex-row">
        {project.image_url ? (
          <>
            {/* Interactive Canvas Area */}
            <View className="flex-1 bg-gray-100">
              <View className="flex-1 p-4">
                <View className="flex-1 bg-white rounded-xl shadow-lg overflow-hidden">
                  <InteractiveCanvas
                    imageUrl={project.image_url}
                    selectedAssetId={lightAssetsHook.selectedAssetId}
                    lightStringsHook={lightStringsHook}
                    lightAssetsHook={lightAssetsHook}
                    onSelectionChange={(selectedStringId) => {
                      console.log('Selection changed:', selectedStringId);
                    }}
                  />
                </View>
              </View>
            </View>

            {/* Asset Palette Sidebar */}
            <View style={{ width: 80, backgroundColor: 'white', borderLeftWidth: 1, borderLeftColor: '#E5E7EB' }}>
              <AssetPalette
                lightAssetsHook={lightAssetsHook}
                onAssetSelect={(assetId) => {
                  console.log('Asset selected:', assetId);
                }}
              />
            </View>
          </>
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
      </View>
    </SafeAreaView>
  );
}
