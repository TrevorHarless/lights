import { useAuth } from "@/contexts/AuthContext";
import { projectsService } from "@/services/projects";
import { Project } from "@/types/project";
import React, { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function ProjectsScreen() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDescription, setNewProjectDescription] = useState("");
  const [newProjectAddress, setNewProjectAddress] = useState("");
  const [newProjectPhone, setNewProjectPhone] = useState("");
  const [creating, setCreating] = useState(false);
  const { user } = useAuth();

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

  const handleCreateProject = async () => {
    if (!newProjectName.trim()) {
      Alert.alert("Error", "Please enter a project name");
      return;
    }

    setCreating(true);
    const { data, error } = await projectsService.createProject({
      name: newProjectName.trim(),
      description: newProjectDescription.trim() || undefined,
      address: newProjectAddress.trim() || undefined,
      phone_number: newProjectPhone.trim() || undefined,
    });

    if (error) {
      Alert.alert("Error", "Failed to create project");
      console.error("Error creating project:", error);
    } else {
      setProjects((prev) => [data!, ...prev]);
      clearForm();
      setModalVisible(false);
    }
    setCreating(false);
  };

  const clearForm = () => {
    setNewProjectName("");
    setNewProjectDescription("");
    setNewProjectAddress("");
    setNewProjectPhone("");
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
            }
          },
        },
      ]
    );
  };

  const renderProject = ({ item }: { item: Project }) => (
    <View style={styles.projectItem}>
      <View style={styles.projectInfo}>
        <Text style={styles.projectName}>{item.name}</Text>
        {item.description && (
          <Text style={styles.projectDescription}>{item.description}</Text>
        )}
        {item.address && (
          <Text style={styles.projectDetail}>📍 {item.address}</Text>
        )}
        {item.phone_number && (
          <Text style={styles.projectDetail}>📞 {item.phone_number}</Text>
        )}
        <Text style={styles.projectDate}>
          Created {new Date(item.created_at).toLocaleDateString()}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => handleDeleteProject(item)}
      >
        <Text style={styles.deleteButtonText}>Delete</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.loadingText}>Loading projects...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Projects</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.addButtonText}>+ Add Project</Text>
        </TouchableOpacity>
      </View>

      {projects.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No projects yet</Text>
          <Text style={styles.emptyStateSubtext}>
            Tap &quot;Add Project&quot; to create your first project
          </Text>
        </View>
      ) : (
        <FlatList
          data={projects}
          renderItem={renderProject}
          keyExtractor={(item) => item.id}
          style={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>New Project</Text>

            <ScrollView
              style={styles.formContainer}
              showsVerticalScrollIndicator={false}
            >
              <TextInput
                style={styles.input}
                placeholder="Project name *"
                value={newProjectName}
                onChangeText={setNewProjectName}
                autoFocus
                maxLength={50}
              />

              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Description (optional)"
                value={newProjectDescription}
                onChangeText={setNewProjectDescription}
                multiline
                numberOfLines={3}
                maxLength={500}
                textAlignVertical="top"
              />

              <TextInput
                style={styles.input}
                placeholder="Address (optional)"
                value={newProjectAddress}
                onChangeText={setNewProjectAddress}
                maxLength={200}
              />

              <TextInput
                style={styles.input}
                placeholder="Phone number (optional)"
                value={newProjectPhone}
                onChangeText={setNewProjectPhone}
                keyboardType="phone-pad"
                maxLength={20}
              />
            </ScrollView>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setModalVisible(false);
                  clearForm();
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.modalButton,
                  styles.createButton,
                  creating && styles.buttonDisabled,
                ]}
                onPress={handleCreateProject}
                disabled={creating}
              >
                <Text style={styles.createButtonText}>
                  {creating ? "Creating..." : "Create"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  addButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  loadingText: {
    textAlign: "center",
    marginTop: 50,
    fontSize: 16,
    color: "#666",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  list: {
    flex: 1,
  },
  projectItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  projectInfo: {
    flex: 1,
  },
  projectName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  projectDescription: {
    fontSize: 14,
    color: "#555",
    marginBottom: 4,
    fontStyle: "italic",
  },
  projectDetail: {
    fontSize: 12,
    color: "#777",
    marginBottom: 2,
  },
  projectDate: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
  deleteButton: {
    backgroundColor: "#FF3B30",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  deleteButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "90%",
    maxHeight: "80%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
  },
  formContainer: {
    maxHeight: 300,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#f0f0f0",
    marginRight: 8,
  },
  createButton: {
    backgroundColor: "#007AFF",
    marginLeft: 8,
  },
  buttonDisabled: {
    backgroundColor: "#ccc",
  },
  cancelButtonText: {
    color: "#333",
    fontSize: 16,
    fontWeight: "600",
  },
  createButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
