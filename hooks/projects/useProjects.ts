import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert } from "react-native";
import { projectsService } from "~/services/projects";
import { localStorageService } from "~/services/localStorage";
import { syncService } from "~/services/syncService";
import { useSync } from "~/contexts/SyncContext";
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
        console.log('🔄 Refreshing projects after sync completion');
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

  const backgroundSyncProjects = async () => {
    try {
      setSyncing(true);
      const result = await syncService.backgroundSync(user.id);
      
      // Refresh UI if sync made changes
      if (result && (result.syncedCount || 0) > 0) {
        const refreshedProjects = await localStorageService.getProjects();
        setProjects(refreshedProjects);
        console.log('🔄 UI refreshed after background sync');
      }
    } catch (error) {
      console.error('Background sync failed:', error);
      // Don't show error to user for background sync
    } finally {
      setSyncing(false);
    }
  };

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
      
      // Handle background upload to server
      if (user?.id) {
        backgroundUploadProject(newProject, imageUri);
      }
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
      
      // Handle background upload to server
      if (user?.id) {
        backgroundUpdateProject(updatedProject, imageUri);
      }
    } catch (error) {
      console.error("Error updating project locally:", error);
      Alert.alert("Error", "Failed to update project");
    }
  };

  const backgroundUploadProject = async (localProject: Project, imageUri?: string | null) => {
    try {
      let imageUrl: string | undefined;
      let imagePath: string | undefined;

      // Upload image if provided
      if (imageUri) {
        console.log("Starting background image upload for:", imageUri);
        const { imageUploadService } = await import("~/services/imageUpload");
        const uploadResult = await imageUploadService.uploadImage(imageUri, user.id);

        if (uploadResult.success) {
          imageUrl = uploadResult.imageUrl;
          imagePath = uploadResult.imagePath;
          console.log("Background image upload successful:", { imageUrl, imagePath });
        } else {
          console.error("Background image upload failed:", uploadResult.error);
        }
      }

      // Create final project data for server
      const projectData = {
        name: localProject.name,
        description: localProject.description,
        address: localProject.address,
        phone_number: localProject.phone_number,
        image_url: imageUrl,
        image_path: imagePath,
      };

      // Upload to server
      const { data, error } = await projectsService.createProject(projectData);

      if (error) {
        console.error("Background server upload failed:", error);
        // Mark project as having sync error
        await localStorageService.markProjectSyncError(localProject.id);
        return;
      }

      if (data) {
        console.log("Project uploaded to server successfully:", data);
        
        // Update local project with server data and mark as synced
        await localStorageService.deleteProject(localProject.id); // Remove temp project
        await localStorageService.upsertProject({
          ...data,
          is_dirty: false,
          sync_status: 'synced',
          image_url_expires_at: imageUrl ? new Date(Date.now() + 50 * 60 * 1000).toISOString() : undefined,
          image_url_cached_at: imageUrl ? new Date().toISOString() : undefined,
        });
        
        // Update UI state to match localStorage (prevents race conditions)
        const refreshedProjects = await localStorageService.getProjects();
        setProjects(refreshedProjects);
      }

    } catch (error) {
      console.error("Background upload failed:", error);
      await localStorageService.markProjectSyncError(localProject.id);
    }
  };

  const backgroundUpdateProject = async (localProject: Project, imageUri?: string | null) => {
    try {
      let imageUrl: string | undefined;
      let imagePath: string | undefined;

      // Upload new image if provided and different from current
      if (imageUri && imageUri !== localProject.image_url) {
        console.log("Starting background image upload for updated project:", imageUri);
        const { imageUploadService } = await import("~/services/imageUpload");
        const uploadResult = await imageUploadService.uploadImage(imageUri, user.id);

        if (uploadResult.success) {
          imageUrl = uploadResult.imageUrl;
          imagePath = uploadResult.imagePath;
          console.log("Background image upload successful:", { imageUrl, imagePath });
        } else {
          console.error("Background image upload failed:", uploadResult.error);
          // Use existing image URL if upload fails
          imageUrl = localProject.image_url;
          imagePath = localProject.image_path;
        }
      } else {
        // Keep existing image data
        imageUrl = localProject.image_url;
        imagePath = localProject.image_path;
      }

      // Update project on server
      const projectData = {
        name: localProject.name,
        description: localProject.description,
        address: localProject.address,
        phone_number: localProject.phone_number,
        image_url: imageUrl,
        image_path: imagePath,
      };

      const { data, error } = await projectsService.updateProject(localProject.id, projectData);

      if (error) {
        console.error("Background server update failed:", error);
        await localStorageService.markProjectSyncError(localProject.id);
        return;
      }

      if (data) {
        console.log("Project updated on server successfully:", data);
        
        // Update local project with server data and mark as synced
        await localStorageService.upsertProject({
          ...data,
          is_dirty: false,
          sync_status: 'synced',
          image_url_expires_at: imageUrl ? new Date(Date.now() + 50 * 60 * 1000).toISOString() : undefined,
          image_url_cached_at: imageUrl ? new Date().toISOString() : undefined,
        });
        
        // Update UI state to match localStorage
        const refreshedProjects = await localStorageService.getProjects();
        setProjects(refreshedProjects);
      }

    } catch (error) {
      console.error("Background update failed:", error);
      await localStorageService.markProjectSyncError(localProject.id);
    }
  };

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