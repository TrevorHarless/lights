import { useAuth } from "@/contexts/AuthContext";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import React from "react";
import { FlatList, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import "../global.css";
import {
  CreateProjectModal,
  ProjectCard,
  ProjectDetailsModal,
} from "./projects/components";
import { useProjects } from "./projects/hooks/useProjects";

export default function ProjectsScreen() {
  const { user } = useAuth();
  const {
    projects,
    loading,
    modalVisible,
    setModalVisible,
    projectDetailsModalVisible,
    setProjectDetailsModalVisible,
    selectedProject,
    handleShowProjectDetails,
    handleOpenEditor,
    handleDeleteProject,
    handleProjectCreated,
  } = useProjects(user);

  const renderProject = ({ item }: { item: any }) => (
    <ProjectCard project={item} onPress={handleShowProjectDetails} />
  );

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 justify-center items-center">
          <View className="bg-white p-8 rounded-2xl shadow-medium">
            <Text className="text-lg text-gray-600 text-center">
              Loading projects...
            </Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-6 py-4 border-b border-gray-100 mb-4">
        <View className="flex-row justify-between items-center">
          <View>
            <Text className="text-2xl font-bold text-gray-800">
              My Projects
            </Text>
          </View>
          <TouchableOpacity
            className="w-12 h-12 bg-blue-600 rounded-full items-center justify-center shadow-lg"
            onPress={() => setModalVisible(true)}
          >
            <FontAwesome name="plus" size={18} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      {projects.length === 0 ? (
        <View className="flex-1 justify-center items-center px-8">
          <View className="bg-white p-8 rounded-3xl items-center max-w-sm">
            <Text className="text-xl font-bold text-gray-800 mb-2 text-center">
              No projects yet
            </Text>
            <Text className="text-gray-500 text-center mb-6">
              Create your first project to start organizing your lighting work
            </Text>
            <TouchableOpacity
              className="bg-blue-600 px-6 py-3 rounded-xl shadow-lg"
              onPress={() => setModalVisible(true)}
            >
              <Text className="text-white font-semibold">Get Started</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <FlatList
          data={projects}
          renderItem={renderProject}
          keyExtractor={(item) => item.id}
          className="flex-1"
          showsVerticalScrollIndicator={false}
        />
      )}

      <CreateProjectModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onProjectCreated={handleProjectCreated}
        userId={user?.id || ""}
      />

      <ProjectDetailsModal
        visible={projectDetailsModalVisible}
        project={selectedProject}
        onClose={() => setProjectDetailsModalVisible(false)}
        onOpenEditor={handleOpenEditor}
        onDelete={handleDeleteProject}
      />
    </SafeAreaView>
  );
}
