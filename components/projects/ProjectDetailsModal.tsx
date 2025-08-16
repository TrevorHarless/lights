import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Image } from "expo-image";
import React from "react";
import { Alert, Linking, Modal, Text, TouchableOpacity, View } from "react-native";
import { Project } from "~/types/project";

interface ProjectDetailsModalProps {
  visible: boolean;
  project: Project | null;
  onClose: () => void;
  onOpenEditor: (project: Project) => void;
  onDelete: (project: Project) => void;
  onEdit: (project: Project) => void;
}

export default function ProjectDetailsModal({
  visible,
  project,
  onClose,
  onOpenEditor,
  onDelete,
  onEdit,
}: ProjectDetailsModalProps) {
  if (!project) return null;

  const handlePhonePress = async (phoneNumber: string) => {
    const url = `tel:${phoneNumber}`;
    const supported = await Linking.canOpenURL(url);
    
    if (supported) {
      await Linking.openURL(url);
    } else {
      Alert.alert("Error", "Phone calls are not supported on this device");
    }
  };

  const handleAddressPress = (address: string) => {
    const encodedAddress = encodeURIComponent(address);
    
    Alert.alert(
      "Open Address",
      "Choose how to open this address:",
      [
        {
          text: "Apple Maps",
          onPress: () => Linking.openURL(`http://maps.apple.com/?q=${encodedAddress}`)
        },
        {
          text: "Google Maps",
          onPress: () => Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`)
        },
        {
          text: "Cancel",
          style: "cancel"
        }
      ]
    );
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-center bg-black/50 px-4">
        <View className="bg-white rounded-3xl max-h-4/5">
          <View className="p-6">
            <View className="flex-row justify-between items-start mb-4">
              <Text className="text-2xl font-bold text-gray-800 flex-1 pr-4">
                {project.name}
              </Text>
              <View className="flex-row">
                <TouchableOpacity
                  onPress={() => onEdit(project)}
                  className="p-2 mr-2"
                >
                  <FontAwesome name="pencil" size={20} color="#3b82f6" />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => onDelete(project)}
                  className="p-2 mr-2"
                >
                  <FontAwesome name="trash" size={20} color="#ef4444" />
                </TouchableOpacity>
                <TouchableOpacity onPress={onClose} className="p-2">
                  <FontAwesome name="times" size={20} color="#6b7280" />
                </TouchableOpacity>
              </View>
            </View>

            {project.image_url && (
              <View className="mb-4 items-center">
                <Image
                  source={{ uri: project.image_url }}
                  className="w-48 h-48 rounded-2xl"
                  contentFit="cover"
                />
              </View>
            )}

            {project.description && (
              <View className="mb-4">
                <Text className="text-sm font-semibold text-gray-700 mb-2">
                  Description
                </Text>
                <Text className="text-gray-600 leading-5">
                  {project.description}
                </Text>
              </View>
            )}

            {project.address && (
              <View className="mb-4">
                <Text className="text-sm font-semibold text-gray-700 mb-2">
                  Address
                </Text>
                <TouchableOpacity
                  onPress={() => handleAddressPress(project.address!)}
                  className="flex-row items-center"
                >
                  <FontAwesome name="map-marker" size={16} color="#3b82f6" />
                  <Text className="text-blue-600 ml-2 underline">{project.address}</Text>
                </TouchableOpacity>
              </View>
            )}

            {project.phone_number && (
              <View className="mb-4">
                <Text className="text-sm font-semibold text-gray-700 mb-2">
                  Contact Number
                </Text>
                <TouchableOpacity
                  onPress={() => handlePhonePress(project.phone_number!)}
                  className="flex-row items-center"
                >
                  <FontAwesome name="phone" size={16} color="#3b82f6" />
                  <Text className="text-blue-600 ml-2 underline">
                    {project.phone_number}
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            <View className="mb-6">
              <Text className="text-sm font-semibold text-gray-700 mb-2">
                Created
              </Text>
              <Text className="text-gray-600">
                {new Date(project.created_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </Text>
            </View>

            <TouchableOpacity
              className="bg-blue-600 py-4 rounded-xl shadow-lg"
              onPress={() => onOpenEditor(project)}
            >
              <View className="flex-row items-center justify-center">
                <FontAwesome name="edit" size={18} color="white" />
                <Text className="text-white font-semibold text-lg ml-2">
                  Open Light Editor
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
