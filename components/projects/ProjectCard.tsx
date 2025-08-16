import { Image } from "expo-image";
import React from "react";
import { Dimensions, Text, TouchableOpacity, View } from "react-native";
import { Project } from "~/types/project";

interface ProjectCardProps {
  project: Project;
  onPress: (project: Project) => void;
  isTablet?: boolean;
  numColumns?: number;
}

export default function ProjectCard({ project, onPress, isTablet = false, numColumns = 1 }: ProjectCardProps) {
  const { width } = Dimensions.get('window');
  
  // Calculate card width for grid layout
  const getCardWidth = () => {
    if (!isTablet || numColumns === 1) {
      return undefined; // Let it use full width
    }
    const screenPadding = 48; // 24px on each side
    const cardGap = 16 * (numColumns - 1); // 16px gap between cards
    const availableWidth = width - screenPadding - cardGap;
    return availableWidth / numColumns;
  };
  
  const cardWidth = getCardWidth();
  const marginHorizontal = isTablet && numColumns > 1 ? 8 : 16;
  const marginBottom = isTablet ? 24 : 16;
  const cardPadding = isTablet ? 24 : 20;
  const imageSize = isTablet ? 96 : 72;
  return (
    <View style={{
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      width: cardWidth,
      marginHorizontal: marginHorizontal,
      marginBottom: marginBottom,
      borderRadius: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 6,
    }}>
      <TouchableOpacity
        style={{ padding: cardPadding }}
        onPress={() => onPress(project)}
        activeOpacity={0.95}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={{
            borderRadius: isTablet ? 20 : 16,
            marginRight: isTablet ? 20 : 16,
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
                style={{ 
                  width: imageSize, 
                  height: imageSize, 
                  borderRadius: isTablet ? 20 : 16 
                }}
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
                width: imageSize,
                height: imageSize,
                borderRadius: isTablet ? 20 : 16,
                backgroundColor: '#e5e7eb',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Text style={{ 
                  fontSize: isTablet ? 36 : 28, 
                  color: '#9ca3af' 
                }}>📷</Text>
              </View>
            )}
          </View>

          <View style={{ flex: 1 }}>
            <Text style={{
              fontSize: isTablet && numColumns > 1 ? 22 : 20,
              fontWeight: '700',
              color: '#1f2937',
              marginBottom: isTablet ? 8 : 4,
              letterSpacing: -0.3
            }}>
              {project.name}
            </Text>
            {project.description && (
              <Text 
                style={{
                  fontSize: isTablet && numColumns > 1 ? 18 : 15,
                  color: '#6b7280',
                  lineHeight: isTablet && numColumns > 1 ? 24 : 20,
                  fontStyle: 'italic'
                }}
                numberOfLines={isTablet && numColumns > 1 ? 3 : undefined}
              >
                {project.description}
              </Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
}
