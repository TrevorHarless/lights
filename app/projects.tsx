import { useAuth } from "@/contexts/AuthContext";
import { imageUploadService } from "@/services/imageUpload";
import { projectsService } from "@/services/projects";
import { Project } from "@/types/project";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import React, { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  Modal,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import "../global.css";

export default function ProjectsScreen() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDescription, setNewProjectDescription] = useState("");
  const [newProjectAddress, setNewProjectAddress] = useState("");
  const [newProjectPhone, setNewProjectPhone] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [creating, setCreating] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchProjects();
    }
  }, [user]);

  const fetchProjects = async () => {
    setLoading(true);
    const { data, error } = await projectsService.getProjects();

    if (error) {
      Alert.alert("Error", "Failed to fetch projects");
      console.error("Error fetching projects:", error);
    } else {
      setProjects(data || []);
    }
    setLoading(false);
  };

  const handleCreateProject = async () => {
    if (!newProjectName.trim()) {
      Alert.alert("Error", "Please enter a project name");
      return;
    }

    setCreating(true);

    let imageUrl: string | undefined;
    let imagePath: string | undefined;

    // Upload image if selected
    if (selectedImage && user) {
      setUploadingImage(true);
      const uploadResult = await imageUploadService.uploadImage(
        selectedImage,
        user.id
      );
      setUploadingImage(false);

      if (uploadResult.success) {
        imageUrl = uploadResult.imageUrl;
        imagePath = uploadResult.imagePath;
      } else {
        Alert.alert(
          "Error",
          "Failed to upload image. Project will be created without image."
        );
      }
    }

    const { data, error } = await projectsService.createProject({
      name: newProjectName.trim(),
      description: newProjectDescription.trim() || undefined,
      address: newProjectAddress.trim() || undefined,
      phone_number: newProjectPhone.trim() || undefined,
      image_url: imageUrl,
      image_path: imagePath,
    });

    if (error) {
      Alert.alert("Error", "Failed to create project");
      console.error("Error creating project:", error);
    } else {
      setProjects((prev) => [data!, ...prev]);
      clearForm();
      setModalVisible(false);
    }
    setCreating(false);
  };

  const clearForm = () => {
    setNewProjectName("");
    setNewProjectDescription("");
    setNewProjectAddress("");
    setNewProjectPhone("");
    setSelectedImage(null);
  };

  const handlePickImage = async () => {
    try {
      const result = await imageUploadService.pickImage();
      if (result && !result.canceled && result.assets[0]) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to pick image");
      console.error("Image picker error:", error);
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
  };

  const handleDeleteProject = (project: Project) => {
    Alert.alert(
      "Delete Project",
      `Are you sure you want to delete ${project.name}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            const { error } = await projectsService.deleteProject(project.id);

            if (error) {
              Alert.alert("Error", "Failed to delete project");
              console.error("Error deleting project:", error);
            } else {
              setProjects((prev) => prev.filter((p) => p.id !== project.id));
            }
          },
        },
      ]
    );
  };

  const renderProject = ({ item }: { item: Project }) => (
    <View className="bg-white mx-4 mb-4 rounded-2xl shadow-medium border border-gray-100">
      <View className="p-5">
        <View className="flex-row">
          {item.image_url ? (
            <Image
              source={{ uri: item.image_url }}
              className="w-16 h-16 rounded-xl mr-4 bg-gray-100"
            />
          ) : (
            <View className="w-16 h-16 rounded-xl mr-4 bg-gray-100 items-center justify-center">
              <Text className="text-2xl text-gray-400">📷</Text>
            </View>
          )}

          <View className="flex-1 mr-3">
            <Text className="text-lg font-bold text-gray-800 mb-1">
              {item.name}
            </Text>
            {item.description && (
              <Text className="text-sm text-gray-600 mb-2 italic leading-5">
                {item.description}
              </Text>
            )}
            {item.address && (
              <View className="flex-row items-center mb-1">
                <Text className="text-xs text-gray-500">📍 {item.address}</Text>
              </View>
            )}
            {item.phone_number && (
              <View className="flex-row items-center mb-1">
                <Text className="text-xs text-gray-500">
                  📞 {item.phone_number}
                </Text>
              </View>
            )}
            <Text className="text-xs text-gray-400 mt-2">
              Created {new Date(item.created_at).toLocaleDateString()}
            </Text>
          </View>

          <TouchableOpacity onPress={() => handleDeleteProject(item)}>
            <FontAwesome name="trash" size={32} color="#ef4444" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
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
      <View className="bg-white px-6 py-4 border-b border-gray-100">
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

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-3xl mx-2 mb-2">
            <View className="p-6">
              <Text className="text-xl font-bold text-gray-800 mb-4">
                New Project
              </Text>

              <TextInput
                className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 text-gray-800 mb-4"
                placeholder="Enter project name"
                value={newProjectName}
                onChangeText={setNewProjectName}
                maxLength={50}
              />

              <TextInput
                className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 text-gray-800 mb-4 h-24"
                placeholder="Add a description (optional)"
                value={newProjectDescription}
                onChangeText={setNewProjectDescription}
                multiline
                numberOfLines={3}
                maxLength={500}
                textAlignVertical="top"
              />

              <TextInput
                className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 text-gray-800 mb-4"
                placeholder="Project address (optional)"
                value={newProjectAddress}
                onChangeText={setNewProjectAddress}
                maxLength={200}
              />

              <TextInput
                className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 text-gray-800 mb-4"
                placeholder="Contact number (optional)"
                value={newProjectPhone}
                onChangeText={setNewProjectPhone}
                keyboardType="phone-pad"
                maxLength={20}
              />

              {/* Image Section */}
              <View className="mb-4">
                <Text className="text-gray-700 font-medium mb-3">
                  Project Image
                </Text>

                {selectedImage ? (
                  <View className="items-center">
                    <Image
                      source={{ uri: selectedImage }}
                      className="w-32 h-32 rounded-2xl mb-3"
                    />
                    <TouchableOpacity
                      className="bg-red-500 px-4 py-2 rounded-lg"
                      onPress={handleRemoveImage}
                    >
                      <Text className="text-white font-semibold text-sm">
                        Remove Image
                      </Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity
                    className="border-2 border-dashed border-blue-300 bg-blue-50 rounded-2xl p-8 items-center"
                    onPress={handlePickImage}
                  >
                    <Text className="text-3xl mb-2">📷</Text>
                    <Text className="text-blue-600 font-semibold text-base mb-1">
                      Add Project Image
                    </Text>
                    <Text className="text-gray-500 text-sm text-center">
                      Choose from your photo library
                    </Text>
                  </TouchableOpacity>
                )}
              </View>

              <View className="flex-row space-x-3 mt-6">
                <TouchableOpacity
                  className="flex-1 bg-gray-100 py-4 rounded-xl"
                  onPress={() => {
                    setModalVisible(false);
                    clearForm();
                  }}
                >
                  <Text className="text-gray-700 font-semibold text-center">
                    Cancel
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className="flex-1 bg-blue-600 py-4 rounded-xl shadow-lg"
                  onPress={handleCreateProject}
                  disabled={creating || uploadingImage}
                >
                  <Text className="text-white font-semibold text-center">
                    Create
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
