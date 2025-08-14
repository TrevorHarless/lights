import { MaterialIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import React, { useRef, useState } from "react";
import {
  Alert,
  Modal,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { imageUploadService } from "~/services/imageUpload";
import { Project } from "~/types/project";

interface CreateProjectModalProps {
  visible: boolean;
  onClose: () => void;
  onProjectCreated: (project: Project, imageUri?: string | null) => void;
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
  const [creating, setCreating] = useState(false);

  // Refs for keyboard navigation
  const nameInputRef = useRef<TextInput>(null);
  const descriptionInputRef = useRef<TextInput>(null);
  const addressInputRef = useRef<TextInput>(null);
  const phoneInputRef = useRef<TextInput>(null);

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


  const handleCreateProject = async () => {
    if (!newProjectName.trim()) {
      Alert.alert("Error", "Please enter a project name");
      return;
    }

    setCreating(true);

    try {
      // Create project locally first for instant UI feedback
      const localProject: Project = {
        id: `local_${Date.now()}`, // Temporary local ID
        user_id: userId,
        name: newProjectName.trim(),
        description: newProjectDescription.trim() || undefined,
        address: newProjectAddress.trim() || undefined,
        phone_number: newProjectPhone.trim() || undefined,
        image_url: selectedImage || undefined, // Use local image initially
        image_path: undefined, // Will be set after server upload
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Pass to useProjects to handle all persistence and UI updates
      console.log("Creating project locally:", localProject);
      onProjectCreated(localProject, selectedImage); // Pass image for background upload
      clearForm();
      onClose();
      
    } catch (error) {
      Alert.alert("Error", "Failed to create project");
      console.error("Error creating project locally:", error);
    } finally {
      setCreating(false);
    }
  };


  const handleClose = () => {
    onClose();
    clearForm();
  };

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
              disabled={creating}
            >
              <MaterialIcons name="close" size={24} color="#374151" />
            </TouchableOpacity>
            
            <Text className="text-xl font-bold text-gray-800">
              New Project
            </Text>
            
            <TouchableOpacity
              className={`px-4 py-2 rounded-2xl ${
                creating || !newProjectName.trim() 
                  ? 'bg-gray-300' 
                  : 'bg-gray-700'
              }`}
              onPress={handleCreateProject}
              disabled={creating || !newProjectName.trim()}
            >
              <Text className="text-white font-semibold text-sm">
                {creating ? 'Creating...' : 'Create'}
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
              value={newProjectName}
              onChangeText={setNewProjectName}
              maxLength={50}
              placeholderTextColor="#9ca3af"
              returnKeyType="next"
              onSubmitEditing={() => phoneInputRef.current?.focus()}
            />

            <TextInput
              ref={phoneInputRef}
              className="bg-gray-50/80 border border-gray-300 rounded-2xl px-5 py-4 text-gray-800 font-medium mb-5"
              placeholder="Contact number (optional)"
              value={newProjectPhone}
              onChangeText={setNewProjectPhone}
              keyboardType="phone-pad"
              maxLength={20}
              placeholderTextColor="#9ca3af"
              returnKeyType="next"
              onSubmitEditing={() => addressInputRef.current?.focus()}
            />

            <TextInput
              ref={addressInputRef}
              className="bg-gray-50/80 border border-gray-300 rounded-2xl px-5 py-4 text-gray-800 font-medium mb-5"
              placeholder="Project address (optional)"
              value={newProjectAddress}
              onChangeText={setNewProjectAddress}
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
              value={newProjectDescription}
              onChangeText={setNewProjectDescription}
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
                      backgroundColor: '#f3f4f6' // Fallback background to see if container is there
                    }}
                    contentFit="cover"
                    onError={(error) => {
                      console.log("Image error in modal:", error);
                    }}
                  />
                  <View className="flex-1">
                    <Text className="text-gray-700 font-semibold text-base mb-1">
                      Project Photo Added
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
