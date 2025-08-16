import { MaterialIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import React, { useRef, useState } from "react";
import {
  Alert,
  Dimensions,
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

  const { width } = Dimensions.get("window");
  const isTablet = width >= 768;

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
        {isTablet ? (
          // iPad Layout - Centered Modal
          <View className="flex-1 items-center justify-center p-8">
            <View
              className="bg-white rounded-3xl shadow-2xl overflow-hidden"
              style={{ width: 600, maxHeight: "85%" }}
            >
              {/* Header */}
              <View className="bg-white/95 px-8 py-6">
                <View className="flex-row items-center justify-between">
                  <TouchableOpacity
                    onPress={handleClose}
                    className="bg-gray-100 rounded-full items-center justify-center"
                    style={{
                      width: isTablet ? 44 : 36,
                      height: isTablet ? 44 : 36,
                    }}
                    disabled={creating}
                  >
                    <MaterialIcons
                      name="close"
                      size={isTablet ? 20 : 16}
                      color="#374151"
                    />
                  </TouchableOpacity>

                  <Text className="text-2xl font-bold text-gray-800">
                    New Project
                  </Text>

                  <View className="w-10" />
                </View>
              </View>

              <View className="p-8">
                <TextInput
                  ref={nameInputRef}
                  className="bg-gray-50/80 border border-gray-300 rounded-2xl px-6 py-5 text-gray-800 mb-6"
                  style={{ fontSize: 18, fontWeight: '500' }}
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
                  className="bg-gray-50/80 border border-gray-300 rounded-2xl px-6 py-5 text-gray-800 mb-6"
                  style={{ fontSize: 18, fontWeight: '500' }}
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
                  className="bg-gray-50/80 border border-gray-300 rounded-2xl px-6 py-5 text-gray-800 mb-6"
                  style={{ fontSize: 18, fontWeight: '500' }}
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
                  className="bg-gray-50/80 border border-gray-300 rounded-2xl px-6 py-5 text-gray-800 mb-6 h-32"
                  style={{ fontSize: 18, fontWeight: '500' }}
                  placeholder="Add a description (optional)"
                  value={newProjectDescription}
                  onChangeText={setNewProjectDescription}
                  multiline
                  numberOfLines={4}
                  maxLength={500}
                  textAlignVertical="top"
                  placeholderTextColor="#9ca3af"
                />

                <View>
                  <Text className="text-gray-800 font-semibold mb-4 text-lg">
                    Project Image
                  </Text>

                  {selectedImage ? (
                    <TouchableOpacity
                      className="border-2 border-gray-300 bg-gray-50 rounded-2xl p-6 items-center flex-row"
                      onPress={handlePickImage}
                    >
                      <Image
                        source={{ uri: selectedImage }}
                        style={{
                          width: 80,
                          height: 80,
                          borderRadius: 16,
                          marginRight: 20,
                          backgroundColor: "#f3f4f6",
                        }}
                        contentFit="cover"
                        onError={(error) => {
                          console.log("Image error in modal:", error);
                        }}
                      />
                      <View className="flex-1">
                        <Text className="text-gray-700 font-semibold text-lg mb-1">
                          Project Photo Added
                        </Text>
                        <Text className="text-gray-500 text-base">
                          Tap to change photo
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      className="border-2 border-dashed border-gray-300 bg-gray-50/50 rounded-2xl p-10 items-center"
                      onPress={handlePickImage}
                    >
                      <Text className="text-5xl mb-4">📸</Text>
                      <Text className="text-gray-700 font-semibold text-lg mb-1">
                        Add Project Photo
                      </Text>
                      <Text className="text-gray-500 text-base text-center">
                        Choose from your photo library
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>

                {/* Large Create Button */}
                <TouchableOpacity
                  className={`mt-8 rounded-2xl py-4 px-8 items-center shadow-lg ${
                    creating || !newProjectName.trim()
                      ? "bg-gray-300"
                      : "bg-primary-600 active:bg-primary-700"
                  }`}
                  onPress={handleCreateProject}
                  disabled={creating || !newProjectName.trim()}
                >
                  <Text className="text-white text-lg font-semibold">
                    {creating ? "Creating Project..." : "Create Project"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ) : (
          // iPhone Layout - Full Screen
          <>
            {/* Header */}
            <View className="bg-white/95 px-5 py-4 shadow-lg border-b border-gray-100">
              <View className="flex-row items-center justify-between">
                <TouchableOpacity
                  onPress={handleClose}
                  className="bg-gray-100 rounded-full items-center justify-center"
                  style={{
                    width: 36,
                    height: 36,
                  }}
                  disabled={creating}
                >
                  <MaterialIcons name="close" size={16} color="#374151" />
                </TouchableOpacity>

                <Text className="text-xl font-bold text-gray-800">
                  New Project
                </Text>

                <View className="w-10" />
              </View>
            </View>

            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
              <View className="p-6 space-y-6">
                <TextInput
                  ref={nameInputRef}
                  className="bg-gray-50/80 border border-gray-300 rounded-2xl px-5 py-4 text-gray-800 mb-5"
                  style={{ fontSize: 16, fontWeight: '500' }}
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
                  className="bg-gray-50/80 border border-gray-300 rounded-2xl px-5 py-4 text-gray-800 mb-5"
                  style={{ fontSize: 16, fontWeight: '500' }}
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
                  className="bg-gray-50/80 border border-gray-300 rounded-2xl px-5 py-4 text-gray-800 mb-5"
                  style={{ fontSize: 16, fontWeight: '500' }}
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
                  className="bg-gray-50/80 border border-gray-300 rounded-2xl px-5 py-4 text-gray-800 mb-5 h-28"
                  style={{ fontSize: 16, fontWeight: '500' }}
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
                          backgroundColor: "#f3f4f6",
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

                {/* Large Create Button */}
                <TouchableOpacity
                  className={`mt-8 rounded-2xl py-4 px-8 items-center shadow-lg ${
                    creating || !newProjectName.trim()
                      ? "bg-gray-300"
                      : "bg-primary-600 active:bg-primary-700"
                  }`}
                  onPress={handleCreateProject}
                  disabled={creating || !newProjectName.trim()}
                >
                  <Text className="text-white text-lg font-semibold">
                    {creating ? "Creating Project..." : "Create Project"}
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </>
        )}
      </SafeAreaView>
    </Modal>
  );
}
