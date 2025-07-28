import { projectsService } from "@/services/projects";
import { Project } from "@/types/project";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert } from "react-native";

export function useProjects(user: any) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [projectDetailsModalVisible, setProjectDetailsModalVisible] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (user) {
      fetchProjects();
    }
  }, [user]);

  const fetchProjects = async () => {
    setLoading(true);
    const { data, error } = await projectsService.getProjects();

    if (error) {
      Alert.alert("Error", "Failed to fetch projects");
      console.error("Error fetching projects:", error);
    } else {
      setProjects(data || []);
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
            const { error } = await projectsService.deleteProject(project.id);

            if (error) {
              Alert.alert("Error", "Failed to delete project");
              console.error("Error deleting project:", error);
            } else {
              setProjects((prev) => prev.filter((p) => p.id !== project.id));
              setProjectDetailsModalVisible(false);
            }
          },
        },
      ]
    );
  };

  const handleProjectCreated = (newProject: Project) => {
    setProjects((prev) => [newProject, ...prev]);
  };

  return {
    projects,
    loading,
    modalVisible,
    setModalVisible,
    projectDetailsModalVisible,
    setProjectDetailsModalVisible,
    selectedProject,
    handleShowProjectDetails,
    handleOpenEditor,
    handleDeleteProject,
    handleProjectCreated,
  };
}