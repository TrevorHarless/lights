import { MaterialIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Modal,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { imageUploadService } from "~/services/imageUpload";
import { Project } from "~/types/project";

interface EditProjectModalProps {
  visible: boolean;
  project: Project | null;
  onClose: () => void;
  onProjectUpdated: (project: Project, imageUri?: string | null) => void;
}

export default function EditProjectModal({
  visible,
  project,
  onClose,
  onProjectUpdated,
}: EditProjectModalProps) {
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [projectAddress, setProjectAddress] = useState("");
  const [projectPhone, setProjectPhone] = useState("");
  const [projectEmail, setProjectEmail] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);

  // Refs for keyboard navigation
  const nameInputRef = useRef<TextInput>(null);
  const descriptionInputRef = useRef<TextInput>(null);
  const addressInputRef = useRef<TextInput>(null);
  const phoneInputRef = useRef<TextInput>(null);
  const emailInputRef = useRef<TextInput>(null);

  // Pre-populate form when project changes
  useEffect(() => {
    if (project && visible) {
      setProjectName(project.name || "");
      setProjectDescription(project.description || "");
      setProjectAddress(project.address || "");
      setProjectPhone(project.phone_number || "");
      setProjectEmail(project.email || "");
      setSelectedImage(project.image_url || null);
    }
  }, [project, visible]);

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

  const handleUpdateProject = async () => {
    if (!projectName.trim()) {
      Alert.alert("Error", "Please enter a project name");
      return;
    }

    if (!project) {
      Alert.alert("Error", "No project to update");
      return;
    }

    setUpdating(true);

    try {
      // Create updated project object
      const updatedProject: Project = {
        ...project,
        name: projectName.trim(),
        description: projectDescription.trim() || undefined,
        address: projectAddress.trim() || undefined,
        phone_number: projectPhone.trim() || undefined,
        email: projectEmail.trim() || undefined,
        image_url: selectedImage || undefined,
        updated_at: new Date().toISOString(),
      };

      // Pass to parent to handle persistence and UI updates
      onProjectUpdated(updatedProject, selectedImage);
      onClose();
    } catch (error) {
      Alert.alert("Error", "Failed to update project");
      console.error("Error updating project:", error);
    } finally {
      setUpdating(false);
    }
  };

  const handleClose = () => {
    onClose();
  };

  const hasChanges =
    project &&
    (projectName !== (project.name || "") ||
      projectDescription !== (project.description || "") ||
      projectAddress !== (project.address || "") ||
      projectPhone !== (project.phone_number || "") ||
      projectEmail !== (project.email || "") ||
      selectedImage !== (project.image_url || null));

  return (
    <Modal
      animationType="slide"
      transparent={false}
      visible={visible}
      onRequestClose={handleClose}
    >
      <SafeAreaView className="flex-1 bg-gray-50">
        {/* Header */}
        <View className="bg-white/95 px-5 py-4 shadow-lg border-b border-gray-100">
          <View className="flex-row items-center justify-between">
            <TouchableOpacity
              onPress={handleClose}
              className="w-10 h-10 items-center justify-center"
              disabled={updating}
            >
              <MaterialIcons name="close" size={24} color="#374151" />
            </TouchableOpacity>

            <Text className="text-xl font-bold text-gray-800">
              Edit Project
            </Text>

            <TouchableOpacity
              className={`px-4 py-2 rounded-2xl ${
                updating || !projectName.trim() || !hasChanges
                  ? "bg-gray-300"
                  : "bg-gray-700"
              }`}
              onPress={handleUpdateProject}
              disabled={updating || !projectName.trim() || !hasChanges}
            >
              <Text className="text-white font-semibold text-sm">
                {updating ? "Saving..." : "Save"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="p-6 space-y-6">
            <TextInput
              ref={nameInputRef}
              className="bg-gray-50/80 border border-gray-300 rounded-2xl px-5 py-4 text-gray-800 font-medium mb-5"
              placeholder="Enter project name"
              value={projectName}
              onChangeText={setProjectName}
              maxLength={50}
              placeholderTextColor="#9ca3af"
              returnKeyType="next"
              onSubmitEditing={() => phoneInputRef.current?.focus()}
            />

            <TextInput
              ref={phoneInputRef}
              className="bg-gray-50/80 border border-gray-300 rounded-2xl px-5 py-4 text-gray-800 font-medium mb-5"
              placeholder="Contact number (optional)"
              value={projectPhone}
              onChangeText={setProjectPhone}
              keyboardType="phone-pad"
              maxLength={20}
              placeholderTextColor="#9ca3af"
              returnKeyType="next"
              onSubmitEditing={() => emailInputRef.current?.focus()}
            />

            <TextInput
              ref={emailInputRef}
              className="bg-gray-50/80 border border-gray-300 rounded-2xl px-5 py-4 text-gray-800 font-medium mb-5"
              placeholder="Email address (optional)"
              value={projectEmail}
              onChangeText={setProjectEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              maxLength={100}
              placeholderTextColor="#9ca3af"
              returnKeyType="next"
              onSubmitEditing={() => addressInputRef.current?.focus()}
            />

            <TextInput
              ref={addressInputRef}
              className="bg-gray-50/80 border border-gray-300 rounded-2xl px-5 py-4 text-gray-800 font-medium mb-5"
              placeholder="Project address (optional)"
              value={projectAddress}
              onChangeText={setProjectAddress}
              maxLength={200}
              placeholderTextColor="#9ca3af"
              returnKeyType="next"
              autoCapitalize="words"
              onSubmitEditing={() => descriptionInputRef.current?.focus()}
            />

            <TextInput
              ref={descriptionInputRef}
              className="bg-gray-50/80 border border-gray-300 rounded-2xl px-5 py-4 text-gray-800 font-medium mb-5 h-28"
              placeholder="Add a description (optional)"
              value={projectDescription}
              onChangeText={setProjectDescription}
              multiline
              numberOfLines={3}
              maxLength={500}
              textAlignVertical="top"
              placeholderTextColor="#9ca3af"
            />

            <View className="mb-6">
              <Text className="text-gray-800 font-semibold mb-3 text-base">
                Project Image
              </Text>

              {selectedImage ? (
                <TouchableOpacity
                  className="border-2 border-gray-300 bg-gray-50 rounded-2xl p-4 items-center flex-row"
                  onPress={handlePickImage}
                >
                  <Image
                    source={{ uri: selectedImage }}
                    style={{
                      width: 64,
                      height: 64,
                      borderRadius: 12,
                      marginRight: 16,
                      backgroundColor: "#f3f4f6",
                    }}
                    contentFit="cover"
                    onError={(error) => {
                      console.log("Image error in modal:", error);
                    }}
                  />
                  <View className="flex-1">
                    <Text className="text-gray-700 font-semibold text-base mb-1">
                      Project Photo
                    </Text>
                    <Text className="text-gray-500 text-sm">
                      Tap to change photo
                    </Text>
                  </View>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  className="border-2 border-dashed border-gray-300 bg-gray-50/50 rounded-2xl p-8 items-center"
                  onPress={handlePickImage}
                >
                  <Text className="text-4xl mb-3">📸</Text>
                  <Text className="text-gray-700 font-semibold text-base mb-1">
                    Add Project Photo
                  </Text>
                  <Text className="text-gray-500 text-sm text-center">
                    Choose from your photo library
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}
