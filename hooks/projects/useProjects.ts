import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert } from "react-native";
import { useSync } from "~/contexts/SyncContext";
import { localStorageService } from "~/services/localStorage";
import { projectsService } from "~/services/projects";
import { Project } from "~/types/project";

export function useProjects(user: any) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false); // No longer show loading for local data
  const [syncing, setSyncing] = useState(false); // Track background sync separately
  const [modalVisible, setModalVisible] = useState(false);
  const [projectDetailsModalVisible, setProjectDetailsModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { syncStatus } = useSync(); // Listen to sync status changes
  const router = useRouter();

  useEffect(() => {
    if (user) {
      // Clear cache for user change to prevent data leakage
      localStorageService.clearCacheForUser(user.id);
      loadProjects();
    } else {
      setProjects([]);
    }
  }, [user]);

  // Listen for sync completion and refresh projects
  useEffect(() => {
    const refreshAfterSync = async () => {
      if (syncStatus === 'success' && user) {
        const refreshedProjects = await localStorageService.getProjects();
        setProjects(refreshedProjects);
      }
    };

    refreshAfterSync();
  }, [syncStatus, user]);

  const loadProjects = async () => {
    try {
      // Load immediately from local storage (instant)
      const localProjects = await localStorageService.getProjects();
      setProjects(localProjects);
      
      // SyncContext handles background sync, so we don't need to trigger it here
      // This prevents redundant sync calls on startup
    } catch (error) {
      console.error("Error loading projects from local storage:", error);
      // Fallback to server if local storage fails
      await fallbackToServerProjects();
    }
  };

  // Note: backgroundSyncProjects function removed for true local-first behavior
  // All syncing now happens through the SyncContext manualSync function

  const fallbackToServerProjects = async () => {
    setLoading(true);
    const { data, error } = await projectsService.getProjects();

    if (error) {
      Alert.alert("Error", "Failed to fetch projects");
      console.error("Error fetching projects:", error);
    } else {
      setProjects(data || []);
      // Save to local storage for future use
      if (data && user?.id) {
        await localStorageService.replaceAllProjects(data, user.id);
      }
    }
    setLoading(false);
  };

  const handleShowProjectDetails = (project: Project) => {
    setSelectedProject(project);
    setProjectDetailsModalVisible(true);
  };

  const handleOpenEditor = (project: Project) => {
    if (!project.image_url) {
      Alert.alert(
        "No Image",
        "This project needs an image to use the light editor. Please edit the project and add an image first.",
        [{ text: "OK" }]
      );
      return;
    }

    setProjectDetailsModalVisible(false);
    router.push(`/editor/${project.id}`);
  };

  const handleEditProject = (project: Project) => {
    setSelectedProject(project);
    setProjectDetailsModalVisible(false);
    setEditModalVisible(true);
  };

  const handleDeleteProject = (project: Project) => {
    Alert.alert(
      "Delete Project",
      `Are you sure you want to delete ${project.name}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              // Delete from local storage immediately
              await localStorageService.deleteProject(project.id);
              setProjects((prev) => prev.filter((p) => p.id !== project.id));
              setProjectDetailsModalVisible(false);

              // Delete from server in background
              if (!project.id.startsWith('local_')) {
                const { error } = await projectsService.deleteProject(project.id);
                if (error) {
                  console.error("Error deleting project from server:", error);
                  // Could add retry logic here
                }
              }
            } catch (error) {
              Alert.alert("Error", "Failed to delete project");
              console.error("Error deleting project:", error);
            }
          },
        },
      ]
    );
  };

  const handleProjectCreated = async (newProject: Project, imageUri?: string | null) => {
    try {
      // Save to local storage immediately
      await localStorageService.upsertProject({
        ...newProject,
        is_dirty: true,
        sync_status: 'pending',
      });
      
      // Update UI immediately
      setProjects((prev) => [newProject, ...prev]);
      
      // Note: No automatic background upload - sync only happens when user explicitly triggers it
    } catch (error) {
      console.error("Error saving new project locally:", error);
      Alert.alert("Error", "Failed to save project");
    }
  };

  const handleProjectUpdated = async (updatedProject: Project, imageUri?: string | null) => {
    try {
      // Save to local storage immediately
      await localStorageService.upsertProject({
        ...updatedProject,
        is_dirty: true,
        sync_status: 'pending',
      });
      
      // Update UI immediately
      setProjects((prev) => 
        prev.map(p => p.id === updatedProject.id ? updatedProject : p)
      );
      
      setEditModalVisible(false);
      
      // Note: No automatic background upload - sync only happens when user explicitly triggers it
    } catch (error) {
      console.error("Error updating project locally:", error);
      Alert.alert("Error", "Failed to update project");
    }
  };

  // Note: backgroundUploadProject function removed for true local-first behavior
  // Project uploads now handled through the syncService when user manually syncs

  // Note: backgroundUpdateProject function removed for true local-first behavior
  // Project updates now handled through the syncService when user manually syncs

  // Filter projects based on search query
  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return {
    projects: filteredProjects,
    allProjects: projects,
    loading,
    syncing,
    modalVisible,
    setModalVisible,
    projectDetailsModalVisible,
    setProjectDetailsModalVisible,
    editModalVisible,
    setEditModalVisible,
    selectedProject,
    searchQuery,
    setSearchQuery,
    handleShowProjectDetails,
    handleOpenEditor,
    handleEditProject,
    handleDeleteProject,
    handleProjectCreated,
    handleProjectUpdated,
    refreshProjects: loadProjects,
  };
}