import { imageUploadService } from "@/services/imageUpload";
import { projectsService } from "@/services/projects";
import { Project } from "@/types/project";
import { Image } from "expo-image";
import React, { useState } from "react";
import {
  Alert,
  Modal,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface CreateProjectModalProps {
  visible: boolean;
  onClose: () => void;
  onProjectCreated: (project: Project) => void;
  userId: string;
}

export default function CreateProjectModal({
  visible,
  onClose,
  onProjectCreated,
  userId,
}: CreateProjectModalProps) {
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDescription, setNewProjectDescription] = useState("");
  const [newProjectAddress, setNewProjectAddress] = useState("");
  const [newProjectPhone, setNewProjectPhone] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [creating, setCreating] = useState(false);

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

  const handleCreateProject = async () => {
    if (!newProjectName.trim()) {
      Alert.alert("Error", "Please enter a project name");
      return;
    }

    setCreating(true);

    let imageUrl: string | undefined;
    let imagePath: string | undefined;

    if (selectedImage) {
      console.log("Starting image upload for:", selectedImage);
      setUploadingImage(true);
      const uploadResult = await imageUploadService.uploadImage(
        selectedImage,
        userId
      );
      setUploadingImage(false);

      console.log("Upload result:", uploadResult);

      if (uploadResult.success) {
        imageUrl = uploadResult.imageUrl;
        imagePath = uploadResult.imagePath;
        console.log(
          "Image uploaded successfully. URL:",
          imageUrl,
          "Path:",
          imagePath
        );
      } else {
        console.error("Image upload failed:", uploadResult.error);
        Alert.alert(
          "Error",
          "Failed to upload image. Project will be created without image."
        );
      }
    }

    const projectData = {
      name: newProjectName.trim(),
      description: newProjectDescription.trim() || undefined,
      address: newProjectAddress.trim() || undefined,
      phone_number: newProjectPhone.trim() || undefined,
      image_url: imageUrl,
      image_path: imagePath,
    };

    console.log("Creating project with data:", projectData);

    const { data, error } = await projectsService.createProject(projectData);

    if (error) {
      Alert.alert("Error", "Failed to create project");
      console.error("Error creating project:", error);
    } else {
      console.log("Project created successfully:", data);
      onProjectCreated(data!);
      clearForm();
      onClose();
    }
    setCreating(false);
  };

  const handleClose = () => {
    onClose();
    clearForm();
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={handleClose}
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
                onPress={handleClose}
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
  );
}
