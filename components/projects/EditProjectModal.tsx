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
import { Project, ProjectStatus } from "~/types/project";
import LocationInput from "~/components/LocationInput";
import { getStatusColor } from "~/utils/statusColors";

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
  const [projectLatitude, setProjectLatitude] = useState<number | undefined>();
  const [projectLongitude, setProjectLongitude] = useState<number | undefined>();
  const [projectPhone, setProjectPhone] = useState("");
  const [projectEmail, setProjectEmail] = useState("");
  const [projectStatus, setProjectStatus] = useState<ProjectStatus>("Lead");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);

  // Refs for keyboard navigation
  const nameInputRef = useRef<TextInput>(null);
  const descriptionInputRef = useRef<TextInput>(null);
  const phoneInputRef = useRef<TextInput>(null);
  const emailInputRef = useRef<TextInput>(null);

  const statusOptions: ProjectStatus[] = [
    'Lead',
    'Estimate Sent', 
    'Approved',
    'Scheduled',
    'Installed',
    'Taken Down'
  ];

  const [showDropdown, setShowDropdown] = useState(false);

  const StatusPicker = ({ className }: { className?: string }) => (
    <View className={`${className} mb-5`}>
      <Text className="text-gray-700 font-semibold mb-2 text-base">Project Status</Text>
      <View style={{ position: 'relative' }}>
        <TouchableOpacity
          onPress={() => setShowDropdown(!showDropdown)}
          style={{
            backgroundColor: getStatusColor(projectStatus).bg,
            borderColor: getStatusColor(projectStatus).text,
            borderWidth: 1,
            borderRadius: 12,
            paddingHorizontal: 16,
            paddingVertical: 12,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <Text
            style={{
              color: getStatusColor(projectStatus).text,
              fontSize: 16,
              fontWeight: '600'
            }}
          >
            {projectStatus}
          </Text>
          <Text style={{ 
            color: getStatusColor(projectStatus).text, 
            fontSize: 18,
            transform: [{ rotate: showDropdown ? '180deg' : '0deg' }]
          }}>
            ▼
          </Text>
        </TouchableOpacity>

        {showDropdown && (
          <View style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            backgroundColor: 'white',
            borderRadius: 12,
            borderWidth: 1,
            borderColor: '#e5e7eb',
            marginTop: 4,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.15,
            shadowRadius: 8,
            elevation: 8,
            zIndex: 1000
          }}>
            {statusOptions.map((status, index) => (
              <TouchableOpacity
                key={status}
                onPress={() => {
                  setProjectStatus(status);
                  setShowDropdown(false);
                }}
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  borderBottomWidth: index < statusOptions.length - 1 ? 1 : 0,
                  borderBottomColor: '#f3f4f6',
                  backgroundColor: projectStatus === status ? `${getStatusColor(status).bg}40` : 'white',
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={{
                    backgroundColor: getStatusColor(status).bg,
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                    borderRadius: 6,
                    marginRight: 12
                  }}>
                    <Text style={{
                      color: getStatusColor(status).text,
                      fontSize: 12,
                      fontWeight: '600'
                    }}>
                      {status}
                    </Text>
                  </View>
                  {projectStatus === status && (
                    <Text style={{ color: getStatusColor(status).text, fontSize: 16 }}>✓</Text>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    </View>
  );

  // Pre-populate form when project changes
  useEffect(() => {
    if (project && visible) {
      setProjectName(project.name || "");
      setProjectDescription(project.description || "");
      setProjectAddress(project.address || "");
      setProjectLatitude(project.latitude);
      setProjectLongitude(project.longitude);
      setProjectPhone(project.phone_number || "");
      setProjectEmail(project.email || "");
      setProjectStatus(project.status || "Lead");
      setSelectedImage(project.image_url || null);
    }
    // Close dropdown when modal visibility changes
    if (!visible) {
      setShowDropdown(false);
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
        latitude: projectLatitude,
        longitude: projectLongitude,
        phone_number: projectPhone.trim() || undefined,
        email: projectEmail.trim() || undefined,
        status: projectStatus,
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

  const handleLocationSelect = (address: string, latitude?: number, longitude?: number) => {
    setProjectAddress(address);
    setProjectLatitude(latitude);
    setProjectLongitude(longitude);
  };

  const handleClose = () => {
    onClose();
  };

  const hasChanges =
    project &&
    (projectName !== (project.name || "") ||
      projectDescription !== (project.description || "") ||
      projectAddress !== (project.address || "") ||
      projectLatitude !== project.latitude ||
      projectLongitude !== project.longitude ||
      projectPhone !== (project.phone_number || "") ||
      projectEmail !== (project.email || "") ||
      projectStatus !== (project.status || "Lead") ||
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

        <ScrollView 
          className="flex-1" 
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="always"
          keyboardDismissMode="none"
          onScroll={() => setShowDropdown(false)}
          scrollEventThrottle={16}
        >
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

            <StatusPicker />

            <LocationInput
              value={projectAddress}
              onLocationSelect={handleLocationSelect}
              placeholder="Project address (optional)"
              className="mb-5"
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
