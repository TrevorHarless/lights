import { MaterialIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Dimensions,
  InputAccessoryView,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import LocationInput from "~/components/LocationInput";
import { imageUploadService } from "~/services/imageUpload";
import { Project, ProjectStatus } from "~/types/project";
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
  const [projectLongitude, setProjectLongitude] = useState<
    number | undefined
  >();
  const [projectPhone, setProjectPhone] = useState("");
  const [projectEmail, setProjectEmail] = useState("");
  const [projectStatus, setProjectStatus] = useState<ProjectStatus>("Lead");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);

  const { width, height } = Dimensions.get("window");
  const isTablet = width >= 768;
  const isLandscape = width > height;

  // Refs for keyboard navigation
  const nameInputRef = useRef<TextInput>(null);
  const descriptionInputRef = useRef<TextInput>(null);
  const phoneInputRef = useRef<TextInput>(null);
  const emailInputRef = useRef<TextInput>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  const statusOptions: ProjectStatus[] = [
    "Lead",
    "Estimate Sent",
    "Approved",
    "Scheduled",
    "Installed",
    "Taken Down",
  ];

  const [showDropdown, setShowDropdown] = useState(false);

  const StatusPicker = ({ className }: { className?: string }) => (
    <View className={`${className} mb-6`}>
      <Text className="text-gray-700 font-semibold mb-2 text-base">
        Project Status
      </Text>
      <View style={{ position: "relative" }}>
        <TouchableOpacity
          onPress={() => setShowDropdown(!showDropdown)}
          style={{
            backgroundColor: getStatusColor(projectStatus).bg,
            borderColor: getStatusColor(projectStatus).text,
            borderWidth: 1,
            borderRadius: 12,
            paddingHorizontal: 16,
            paddingVertical: 12,
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Text
            style={{
              color: getStatusColor(projectStatus).text,
              fontSize: 16,
              fontWeight: "600",
            }}
          >
            {projectStatus}
          </Text>
          <Text
            style={{
              color: getStatusColor(projectStatus).text,
              fontSize: 18,
              transform: [{ rotate: showDropdown ? "180deg" : "0deg" }],
            }}
          >
            ▼
          </Text>
        </TouchableOpacity>

        {showDropdown && (
          <View
            style={{
              position: "absolute",
              top: "100%",
              left: 0,
              right: 0,
              backgroundColor: "white",
              borderRadius: 12,
              borderWidth: 1,
              borderColor: "#e5e7eb",
              marginTop: 4,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.15,
              shadowRadius: 8,
              elevation: 8,
              zIndex: 1000,
            }}
          >
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
                  borderBottomColor: "#f3f4f6",
                  backgroundColor:
                    projectStatus === status
                      ? `${getStatusColor(status).bg}40`
                      : "white",
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <View
                    style={{
                      backgroundColor: getStatusColor(status).bg,
                      paddingHorizontal: 8,
                      paddingVertical: 4,
                      borderRadius: 6,
                      marginRight: 12,
                    }}
                  >
                    <Text
                      style={{
                        color: getStatusColor(status).text,
                        fontSize: 12,
                        fontWeight: "600",
                      }}
                    >
                      {status}
                    </Text>
                  </View>
                  {projectStatus === status && (
                    <Text
                      style={{
                        color: getStatusColor(status).text,
                        fontSize: 16,
                      }}
                    >
                      ✓
                    </Text>
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

  const handleLocationSelect = (
    address: string,
    latitude?: number,
    longitude?: number
  ) => {
    setProjectAddress(address);
    setProjectLatitude(latitude);
    setProjectLongitude(longitude);
  };

  const handleDescriptionFocus = () => {
    // Auto-scroll to description field when focused
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 50); // Small delay to ensure keyboard animation starts
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

  const inputAccessoryViewID = 'editDescriptionDone';

  return (
    <>
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
                    disabled={updating}
                  >
                    <MaterialIcons
                      name="close"
                      size={isTablet ? 20 : 16}
                      color="#374151"
                    />
                  </TouchableOpacity>

                  <Text className="text-2xl font-bold text-gray-800">
                    Edit Project
                  </Text>

                  <TouchableOpacity
                    className={`px-4 py-2 rounded-2xl ${
                      updating || !projectName.trim() || !hasChanges
                        ? "bg-gray-300"
                        : "bg-primary-600 active:bg-primary-700"
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

              <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
              >
                <ScrollView
                  ref={scrollViewRef}
                  keyboardShouldPersistTaps="always"
                  keyboardDismissMode="interactive"
                  showsVerticalScrollIndicator={false}
                  onScroll={() => setShowDropdown(false)}
                  scrollEventThrottle={16}
                >
                <View
                  className={`p-8 ${isTablet && isLandscape ? "flex-row space-x-6" : ""}`}
                >
                  {isTablet && isLandscape ? (
                    <>
                      {/* Left Column */}
                      <View className="flex-1 pr-8">
                        <TextInput
                          ref={nameInputRef}
                          className="bg-gray-50/80 border border-gray-300 rounded-2xl px-6 py-4 text-gray-800 mb-6"
                          style={{ fontSize: 16, fontWeight: "500" }}
                          placeholder="Enter project name"
                          value={projectName}
                          onChangeText={setProjectName}
                          maxLength={50}
                          placeholderTextColor="#9ca3af"
                          returnKeyType="done"
                          onSubmitEditing={Keyboard.dismiss}
                        />

                        <StatusPicker />

                        <LocationInput
                          value={projectAddress}
                          onLocationSelect={handleLocationSelect}
                          placeholder="Project address (optional)"
                          className="mb-6"
                        />

                        <TextInput
                          ref={phoneInputRef}
                          className="bg-gray-50/80 border border-gray-300 rounded-2xl px-6 py-4 text-gray-800 mb-6"
                          style={{ fontSize: 16, fontWeight: "500" }}
                          placeholder="Contact number (optional)"
                          value={projectPhone}
                          onChangeText={setProjectPhone}
                          keyboardType="phone-pad"
                          maxLength={20}
                          placeholderTextColor="#9ca3af"
                          returnKeyType="done"
                          onSubmitEditing={Keyboard.dismiss}
                        />

                        <TextInput
                          ref={emailInputRef}
                          className="bg-gray-50/80 border border-gray-300 rounded-2xl px-6 py-4 text-gray-800 mb-6"
                          style={{ fontSize: 16, fontWeight: "500" }}
                          placeholder="Email address (optional)"
                          value={projectEmail}
                          onChangeText={setProjectEmail}
                          keyboardType="email-address"
                          autoCapitalize="none"
                          autoCorrect={false}
                          maxLength={100}
                          placeholderTextColor="#9ca3af"
                          returnKeyType="done"
                          onSubmitEditing={Keyboard.dismiss}
                        />

                        <TextInput
                          ref={descriptionInputRef}
                          className="bg-gray-50/80 border border-gray-300 rounded-2xl px-6 py-4 text-gray-800"
                          style={{
                            fontSize: 16,
                            fontWeight: "500",
                            height: 80,
                            textAlignVertical: "top",
                          }}
                          placeholder="Add a description (optional)"
                          value={projectDescription}
                          onChangeText={setProjectDescription}
                          multiline
                          numberOfLines={3}
                          maxLength={500}
                          placeholderTextColor="#9ca3af"
                          inputAccessoryViewID={inputAccessoryViewID}
                          onFocus={handleDescriptionFocus}
                        />
                      </View>

                      {/* Right Column */}
                      <View className="flex-1">
                        <View className="mb-6">
                          <Text className="text-gray-800 font-semibold mb-4 text-lg">
                            Project Image
                          </Text>

                          {selectedImage ? (
                            <TouchableOpacity
                              className="border-2 border-gray-300 bg-gray-50 rounded-2xl p-6 items-center"
                              onPress={handlePickImage}
                            >
                              <Image
                                source={{ uri: selectedImage }}
                                style={{
                                  width: 120,
                                  height: 120,
                                  borderRadius: 16,
                                  marginBottom: 12,
                                  backgroundColor: "#f3f4f6",
                                }}
                                contentFit="cover"
                                onError={(error) => {
                                  console.log("Image error in modal:", error);
                                }}
                              />
                              <Text className="text-gray-700 font-semibold text-lg mb-1">
                                Project Photo Added
                              </Text>
                              <Text className="text-gray-500 text-base text-center">
                                Tap to change photo
                              </Text>
                            </TouchableOpacity>
                          ) : (
                            <TouchableOpacity
                              className="border-2 border-dashed border-gray-300 bg-gray-50/50 rounded-2xl p-8 items-center"
                              onPress={handlePickImage}
                            >
                              <Text className="text-4xl mb-4">📸</Text>
                              <Text className="text-gray-700 font-semibold text-lg mb-1">
                                Add Project Photo
                              </Text>
                              <Text className="text-gray-500 text-base text-center">
                                Choose from your photo library
                              </Text>
                            </TouchableOpacity>
                          )}
                        </View>

                        <TouchableOpacity
                          className={`rounded-2xl py-4 px-8 items-center shadow-lg ${
                            updating || !projectName.trim() || !hasChanges
                              ? "bg-gray-300"
                              : "bg-primary-600 active:bg-primary-700"
                          }`}
                          onPress={handleUpdateProject}
                          disabled={updating || !projectName.trim() || !hasChanges}
                        >
                          <Text className="text-white text-lg font-semibold">
                            {updating ? "Saving..." : "Save Changes"}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </>
                  ) : (
                    <>
                      <TextInput
                        ref={nameInputRef}
                        className="bg-gray-50/80 border border-gray-300 rounded-2xl px-6 py-5 text-gray-800 mb-6"
                        style={{ fontSize: 18, fontWeight: "500" }}
                        placeholder="Enter project name"
                        value={projectName}
                        onChangeText={setProjectName}
                        maxLength={50}
                        placeholderTextColor="#9ca3af"
                        returnKeyType="done"
                        onSubmitEditing={Keyboard.dismiss}
                      />

                      <StatusPicker />

                      <LocationInput
                        value={projectAddress}
                        onLocationSelect={handleLocationSelect}
                        placeholder="Project address (optional)"
                        className="mb-6"
                      />

                      <TextInput
                        ref={phoneInputRef}
                        className="bg-gray-50/80 border border-gray-300 rounded-2xl px-6 py-5 text-gray-800 mb-6"
                        style={{ fontSize: 18, fontWeight: "500" }}
                        placeholder="Contact number (optional)"
                        value={projectPhone}
                        onChangeText={setProjectPhone}
                        keyboardType="phone-pad"
                        maxLength={20}
                        placeholderTextColor="#9ca3af"
                        returnKeyType="done"
                        onSubmitEditing={Keyboard.dismiss}
                      />

                      <TextInput
                        ref={emailInputRef}
                        className="bg-gray-50/80 border border-gray-300 rounded-2xl px-6 py-5 text-gray-800 mb-6"
                        style={{ fontSize: 18, fontWeight: "500" }}
                        placeholder="Email address (optional)"
                        value={projectEmail}
                        onChangeText={setProjectEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCorrect={false}
                        maxLength={100}
                        placeholderTextColor="#9ca3af"
                        returnKeyType="done"
                        onSubmitEditing={Keyboard.dismiss}
                      />

                      <TextInput
                        ref={descriptionInputRef}
                        className="bg-gray-50/80 border border-gray-300 rounded-2xl px-6 py-5 text-gray-800 mb-6 h-32"
                        style={{ fontSize: 18, fontWeight: "500" }}
                        placeholder="Add a description (optional)"
                        value={projectDescription}
                        onChangeText={setProjectDescription}
                        multiline
                        numberOfLines={4}
                        maxLength={500}
                        textAlignVertical="top"
                        placeholderTextColor="#9ca3af"
                        inputAccessoryViewID={inputAccessoryViewID}
                        onFocus={handleDescriptionFocus}
                      />

                      <View className="mb-6">
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

                      {/* Large Save Button */}
                      <TouchableOpacity
                        className={`rounded-2xl py-4 px-8 items-center shadow-lg ${
                          updating || !projectName.trim() || !hasChanges
                            ? "bg-gray-300"
                            : "bg-primary-600 active:bg-primary-700"
                        }`}
                        onPress={handleUpdateProject}
                        disabled={updating || !projectName.trim() || !hasChanges}
                      >
                        <Text className="text-white text-lg font-semibold">
                          {updating ? "Saving..." : "Save Changes"}
                        </Text>
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              </ScrollView>
              </KeyboardAvoidingView>
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
                  disabled={updating}
                >
                  <MaterialIcons name="close" size={16} color="#374151" />
                </TouchableOpacity>

                <Text className="text-xl font-bold text-gray-800">
                  Edit Project
                </Text>

                <TouchableOpacity
                  className={`px-4 py-2 rounded-2xl ${
                    updating || !projectName.trim() || !hasChanges
                      ? "bg-gray-300"
                      : "bg-primary-600 active:bg-primary-700"
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

            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={{ flex: 1 }}
            >
              <ScrollView
                ref={scrollViewRef}
                className="flex-1"
                keyboardShouldPersistTaps="always"
                keyboardDismissMode="interactive"
                showsVerticalScrollIndicator={false}
                onScroll={() => setShowDropdown(false)}
                scrollEventThrottle={16}
              >
              <View className="p-6 space-y-6">
                <TextInput
                  ref={nameInputRef}
                  className="bg-gray-50/80 border border-gray-300 rounded-2xl px-5 py-4 text-gray-800 mb-6"
                  style={{ fontSize: 16, fontWeight: "500" }}
                  placeholder="Enter project name"
                  value={projectName}
                  onChangeText={setProjectName}
                  maxLength={50}
                  placeholderTextColor="#9ca3af"
                  returnKeyType="done"
                  onSubmitEditing={Keyboard.dismiss}
                />

                <StatusPicker />

                <LocationInput
                  value={projectAddress}
                  onLocationSelect={handleLocationSelect}
                  placeholder="Project address (optional)"
                  className="mb-6"
                />

                <TextInput
                  ref={phoneInputRef}
                  className="bg-gray-50/80 border border-gray-300 rounded-2xl px-5 py-4 text-gray-800 mb-6"
                  style={{ fontSize: 16, fontWeight: "500" }}
                  placeholder="Contact number (optional)"
                  value={projectPhone}
                  onChangeText={setProjectPhone}
                  keyboardType="phone-pad"
                  maxLength={20}
                  placeholderTextColor="#9ca3af"
                  returnKeyType="done"
                  onSubmitEditing={Keyboard.dismiss}
                />

                <TextInput
                  ref={emailInputRef}
                  className="bg-gray-50/80 border border-gray-300 rounded-2xl px-5 py-4 text-gray-800 mb-6"
                  style={{ fontSize: 16, fontWeight: "500" }}
                  placeholder="Email address (optional)"
                  value={projectEmail}
                  onChangeText={setProjectEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  maxLength={100}
                  placeholderTextColor="#9ca3af"
                  returnKeyType="done"
                  onSubmitEditing={Keyboard.dismiss}
                />

                <TextInput
                  ref={descriptionInputRef}
                  className="bg-gray-50/80 border border-gray-300 rounded-2xl px-5 py-4 text-gray-800 mb-6 h-28"
                  style={{ fontSize: 16, fontWeight: "500" }}
                  placeholder="Add a description (optional)"
                  value={projectDescription}
                  onChangeText={setProjectDescription}
                  multiline
                  numberOfLines={3}
                  maxLength={500}
                  textAlignVertical="top"
                  placeholderTextColor="#9ca3af"
                  inputAccessoryViewID={inputAccessoryViewID}
                  onFocus={handleDescriptionFocus}
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
                        <Text className="text-gray-700 font-semibold text-sm mb-1">
                          Project Photo Added
                        </Text>
                        <Text className="text-gray-500 text-xs">
                          Tap to change photo
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      className="border-2 border-dashed border-gray-300 bg-gray-50/50 rounded-2xl p-4 items-center"
                      onPress={handlePickImage}
                    >
                      <Text className="text-2xl mb-2">📸</Text>
                      <Text className="text-gray-700 font-semibold text-sm mb-1">
                        Add Project Photo
                      </Text>
                      <Text className="text-gray-500 text-xs text-center">
                        Choose from your photo library
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>

                {/* Large Save Button */}
                <TouchableOpacity
                  className={`rounded-2xl py-4 px-8 items-center shadow-lg ${
                    updating || !projectName.trim() || !hasChanges
                      ? "bg-gray-300"
                      : "bg-primary-600 active:bg-primary-700"
                  }`}
                  onPress={handleUpdateProject}
                  disabled={updating || !projectName.trim() || !hasChanges}
                >
                  <Text className="text-white text-lg font-semibold">
                    {updating ? "Saving..." : "Save Changes"}
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
            </KeyboardAvoidingView>
          </>
        )}
      </SafeAreaView>
    </Modal>
    <InputAccessoryView nativeID={inputAccessoryViewID}>
      <View className="bg-gray-100 border-t border-gray-300 px-4 py-3 flex-row justify-end items-center">
        <TouchableOpacity
          onPress={() => {
            descriptionInputRef.current?.blur();
            Keyboard.dismiss();
          }}
          className="bg-blue-500 px-6 py-2 rounded-lg shadow-sm"
        >
          <Text className="text-white font-semibold text-base">Done</Text>
        </TouchableOpacity>
      </View>
    </InputAccessoryView>
    </>
  );
}
