import { MaterialIcons } from "@expo/vector-icons";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useRouter } from "expo-router";
import React from "react";
import { FlatList, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "~/contexts/AuthContext";
import "../global.css";
import {
  CreateProjectModal,
  ProjectCard,
  ProjectDetailsModal,
} from "~/components/projects";
import { useProjects } from "~/hooks/projects/useProjects";

export default function ProjectsScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const {
    projects,
    allProjects,
    loading,
    modalVisible,
    setModalVisible,
    projectDetailsModalVisible,
    setProjectDetailsModalVisible,
    selectedProject,
    searchQuery,
    setSearchQuery,
    handleShowProjectDetails,
    handleOpenEditor,
    handleDeleteProject,
    handleProjectCreated,
  } = useProjects(user);

  const renderProject = ({ item }: { item: any }) => (
    <ProjectCard project={item} onPress={handleShowProjectDetails} />
  );

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#f8f9fa' }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 }}>
          <View style={{
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            paddingHorizontal: 32,
            paddingVertical: 24,
            borderRadius: 20,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 12,
            elevation: 8,
            alignItems: 'center',
          }}>
            <Text style={{ 
              fontSize: 18, 
              color: '#374151', 
              fontWeight: '600',
              textAlign: 'center'
            }}>
              Loading projects...
            </Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f8f9fa' }}>
      {/* Header */}
      <View style={{
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        paddingHorizontal: 20,
        paddingVertical: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
      }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View>
            <Text style={{ 
              fontSize: 28, 
              fontWeight: '700', 
              color: '#1f2937',
              letterSpacing: -0.5 
            }}>
              My Projects
            </Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <TouchableOpacity
              style={{
                width: 48,
                height: 48,
                backgroundColor: '#6b7280',
                borderRadius: 24,
                alignItems: 'center',
                justifyContent: 'center',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.15,
                shadowRadius: 8,
                elevation: 6,
              }}
              onPress={() => router.push('/profile')}
            >
              <FontAwesome name="user" size={20} color="white" />
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                width: 48,
                height: 48,
                backgroundColor: '#374151',
                borderRadius: 24,
                alignItems: 'center',
                justifyContent: 'center',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.15,
                shadowRadius: 8,
                elevation: 6,
              }}
              onPress={() => setModalVisible(true)}
            >
              <FontAwesome name="plus" size={20} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Bar */}
        <View style={{
          marginTop: 16,
        }}>
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            borderRadius: 16,
            paddingHorizontal: 16,
            paddingVertical: 12,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.08,
            shadowRadius: 8,
            elevation: 4,
          }}>
            <MaterialIcons name="search" size={20} color="#6b7280" style={{ marginRight: 12 }} />
            <TextInput
              style={{
                flex: 1,
                fontSize: 16,
                color: '#1f2937',
                fontWeight: '500',
              }}
              placeholder="Search projects..."
              placeholderTextColor="#9ca3af"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
              autoCorrect={false}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => setSearchQuery("")}
                style={{
                  marginLeft: 8,
                  padding: 4,
                }}
              >
                <MaterialIcons name="clear" size={18} color="#6b7280" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      {/* Content */}
      {allProjects.length === 0 ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 }}>
          <View style={{
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            paddingHorizontal: 32,
            paddingVertical: 40,
            borderRadius: 24,
            alignItems: 'center',
            maxWidth: 320,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.1,
            shadowRadius: 16,
            elevation: 8,
          }}>
            <Text style={{ 
              fontSize: 24, 
              fontWeight: '700', 
              color: '#1f2937', 
              marginBottom: 8, 
              textAlign: 'center'
            }}>
              No projects yet
            </Text>
            <Text style={{ 
              fontSize: 16, 
              color: '#6b7280', 
              textAlign: 'center', 
              marginBottom: 24,
              lineHeight: 22
            }}>
              Create your first project to start organizing your lighting work
            </Text>
            <TouchableOpacity
              style={{
                backgroundColor: '#374151',
                paddingHorizontal: 24,
                paddingVertical: 12,
                borderRadius: 16,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 3 },
                shadowOpacity: 0.15,
                shadowRadius: 6,
                elevation: 4,
              }}
              onPress={() => setModalVisible(true)}
            >
              <Text style={{ 
                color: 'white', 
                fontWeight: '600',
                fontSize: 16
              }}>
                Get Started
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : projects.length === 0 && searchQuery.length > 0 ? (
        // No search results found
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 }}>
          <View style={{
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            paddingHorizontal: 32,
            paddingVertical: 40,
            borderRadius: 24,
            alignItems: 'center',
            maxWidth: 320,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.1,
            shadowRadius: 16,
            elevation: 8,
          }}>
            <MaterialIcons name="search-off" size={48} color="#9ca3af" style={{ marginBottom: 16 }} />
            <Text style={{ 
              fontSize: 20, 
              fontWeight: '700', 
              color: '#1f2937', 
              marginBottom: 8, 
              textAlign: 'center'
            }}>
              No projects found
            </Text>
            <Text style={{ 
              fontSize: 16, 
              color: '#6b7280', 
              textAlign: 'center', 
              marginBottom: 24,
              lineHeight: 22
            }}>
              No projects match &ldquo;{searchQuery}&rdquo;. Try a different search term.
            </Text>
            <TouchableOpacity
              style={{
                backgroundColor: '#374151',
                paddingHorizontal: 20,
                paddingVertical: 10,
                borderRadius: 14,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.15,
                shadowRadius: 4,
                elevation: 4,
              }}
              onPress={() => setSearchQuery("")}
            >
              <Text style={{ 
                color: 'white', 
                fontWeight: '600',
                fontSize: 14
              }}>
                Clear Search
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <FlatList
          data={projects}
          renderItem={renderProject}
          keyExtractor={(item) => item.id}
          style={{ flex: 1, paddingTop: 16 }}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}

      <CreateProjectModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onProjectCreated={handleProjectCreated}
        userId={user?.id || ""}
      />

      <ProjectDetailsModal
        visible={projectDetailsModalVisible}
        project={selectedProject}
        onClose={() => setProjectDetailsModalVisible(false)}
        onOpenEditor={handleOpenEditor}
        onDelete={handleDeleteProject}
      />
    </SafeAreaView>
  );
}
