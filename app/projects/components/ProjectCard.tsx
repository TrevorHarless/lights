import { Project } from "@/types/project";
import { Image } from "expo-image";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface ProjectCardProps {
  project: Project;
  onPress: (project: Project) => void;
}

export default function ProjectCard({ project, onPress }: ProjectCardProps) {
  return (
    <View className="bg-white mx-4 mb-4 rounded-2xl shadow-medium border border-gray-100">
      <TouchableOpacity
        className="p-5"
        onPress={() => onPress(project)}
        activeOpacity={0.7}
      >
        <View className="flex-row">
          <View className="rounded-xl mr-8 bg-gray-100">
            {project.image_url ? (
              <Image
                source={{ uri: project.image_url }}
                style={{ width: 64, height: 64 }}
                contentFit="cover"
                onError={(error) => {
                  console.log(
                    "Image load error for project:",
                    project.name,
                    "URL:",
                    project.image_url,
                    "Error:",
                    error
                  );
                }}
              />
            ) : (
              <View className="w-16 h-16 rounded-xl mr-4 bg-gray-100 items-center justify-center">
                <Text className="text-2xl text-gray-400">📷</Text>
              </View>
            )}
          </View>

          <View className="flex-1">
            <Text className="text-lg font-bold text-gray-800 mb-1">
              {project.name}
            </Text>
            {project.description && (
              <Text className="text-sm text-gray-600 italic leading-5">
                {project.description}
              </Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
}