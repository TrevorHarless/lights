import { Image } from "expo-image";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { Project } from "~/types/project";

interface ProjectCardProps {
  project: Project;
  onPress: (project: Project) => void;
}

export default function ProjectCard({ project, onPress }: ProjectCardProps) {
  return (
    <View style={{
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      marginHorizontal: 16,
      marginBottom: 16,
      borderRadius: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 6,
    }}>
      <TouchableOpacity
        style={{ padding: 20 }}
        onPress={() => onPress(project)}
        activeOpacity={0.95}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={{
            borderRadius: 16,
            marginRight: 16,
            backgroundColor: '#f3f4f6',
            overflow: 'hidden',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 2,
          }}>
            {project.image_url ? (
              <Image
                source={{ uri: project.image_url }}
                style={{ width: 72, height: 72, borderRadius: 16 }}
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
              <View style={{
                width: 72,
                height: 72,
                borderRadius: 16,
                backgroundColor: '#e5e7eb',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Text style={{ fontSize: 28, color: '#9ca3af' }}>📷</Text>
              </View>
            )}
          </View>

          <View style={{ flex: 1 }}>
            <Text style={{
              fontSize: 20,
              fontWeight: '700',
              color: '#1f2937',
              marginBottom: 4,
              letterSpacing: -0.3
            }}>
              {project.name}
            </Text>
            {project.description && (
              <Text style={{
                fontSize: 15,
                color: '#6b7280',
                lineHeight: 20,
                fontStyle: 'italic'
              }}>
                {project.description}
              </Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
}
