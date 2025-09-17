import { MaterialIcons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { Dimensions, Text, TouchableOpacity, View } from "react-native";
import MapView, { Callout, Marker } from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";
import { EditProjectModal, ProjectDetailsModal } from "~/components/projects";
import { useAuth } from "~/contexts/AuthContext";
import { useProjects } from "~/hooks/projects/useProjects";
import { Project } from "~/types/project";
import { getStatusColor } from "~/utils/statusColors";
import "../global.css";

export default function MapScreen() {
  const { width } = Dimensions.get("window");
  const isTablet = width >= 768;

  const { user } = useAuth();
  const router = useRouter();

  const {
    allProjects,
    handleOpenEditor,
    handleDeleteProject,
    handleProjectUpdated,
    refreshProjects,
  } = useProjects(user);

  const [projectsWithLocation, setProjectsWithLocation] = useState<Project[]>(
    []
  );
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [projectDetailsModalVisible, setProjectDetailsModalVisible] =
    useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const mapRef = useRef<MapView>(null);

  // Filter projects that have location coordinates
  useEffect(() => {
    if (!allProjects || !Array.isArray(allProjects)) {
      setProjectsWithLocation([]);
      return;
    }

    try {
      const filteredProjects = allProjects.filter((project) => {
        const lat = project.latitude;
        const lng = project.longitude;

        // More strict validation for coordinates
        const isValidLat =
          lat !== null &&
          lat !== undefined &&
          typeof lat === "number" &&
          !isNaN(lat) &&
          lat >= -90 &&
          lat <= 90;
        const isValidLng =
          lng !== null &&
          lng !== undefined &&
          typeof lng === "number" &&
          !isNaN(lng) &&
          lng >= -180 &&
          lng <= 180;

        const hasValidLocation = isValidLat && isValidLng;


        return hasValidLocation;
      });
      setProjectsWithLocation(filteredProjects);
    } catch (error) {
      console.error("🗺️ MapScreen: Error filtering projects:", error);
    }
  }, [allProjects]);

  // Get user location when screen loads
  useEffect(() => {
    const getUserLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();

        if (status !== "granted") {
          console.warn("🗺️ MapScreen: Location permission denied");
          return;
        }
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        const userCoords = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        };

        setUserLocation(userCoords);

        // Animate to user location with appropriate zoom
        if (mapRef.current) {
          const region = getRegionForLocation(userCoords);
          mapRef.current.animateToRegion(region, 1000);
        }
      } catch (error) {
        console.error("🗺️ MapScreen: Error getting user location:", error);
      }
    };

    getUserLocation();
  }, []);

  // Refresh projects when screen loads
  useEffect(() => {
    if (user && user.id) {
      refreshProjects();
    }
  }, [user, refreshProjects]);


  // Helper function to get region for a specific location
  const getRegionForLocation = (location: {
    latitude: number;
    longitude: number;
  }) => {
    return {
      latitude: location.latitude,
      longitude: location.longitude,
      latitudeDelta: 0.05,
      longitudeDelta: 0.05,
    };
  };

  // Calculate initial region - starts with user location if available, otherwise defaults
  const getInitialRegion = () => {
    try {
      // Start with user location if we have it
      if (userLocation) {
        return getRegionForLocation(userLocation);
      }

      if (projectsWithLocation.length === 0) {
        // Default to a more reasonable zoom level
        return {
          latitude: 39.8283, // Center of US
          longitude: -98.5795,
          latitudeDelta: 5,
          longitudeDelta: 5,
        };
      }

      if (projectsWithLocation.length === 1) {
        const project = projectsWithLocation[0];
        return {
          latitude: project.latitude!,
          longitude: project.longitude!,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        };
      }

      // Calculate bounds for multiple projects
      const latitudes = projectsWithLocation.map((p) => p.latitude!);
      const longitudes = projectsWithLocation.map((p) => p.longitude!);

      const minLat = Math.min(...latitudes);
      const maxLat = Math.max(...latitudes);
      const minLng = Math.min(...longitudes);
      const maxLng = Math.max(...longitudes);

      const centerLat = (minLat + maxLat) / 2;
      const centerLng = (minLng + maxLng) / 2;
      const latDelta = (maxLat - minLat) * 1.3; // Add padding
      const lngDelta = (maxLng - minLng) * 1.3;

      return {
        latitude: centerLat,
        longitude: centerLng,
        latitudeDelta: Math.max(latDelta, 0.01), // Minimum zoom level
        longitudeDelta: Math.max(lngDelta, 0.01),
      };
    } catch (error) {
      console.error("🗺️ MapScreen: Error calculating initial region:", error);
      // Fallback to safe default
      return {
        latitude: 39.8283,
        longitude: -98.5795,
        latitudeDelta: 5,
        longitudeDelta: 5,
      };
    }
  };

  const handleDetailsPress = (project: Project) => {
    setSelectedProject(project);
    setProjectDetailsModalVisible(true);
  };

  const handleEditProject = (project: Project) => {
    setSelectedProject(project);
    setProjectDetailsModalVisible(false); // Close details modal
    setEditModalVisible(true); // Open edit modal
  };

  try {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        {/* Header */}
        <View
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.95)",
            paddingHorizontal: 20,
            paddingVertical: 16,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 4,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingTop: 15,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={{
                width: 40,
                height: 40,
                alignItems: "center",
                justifyContent: "center",
                marginRight: 12,
              }}
            >
              <MaterialIcons
                name="arrow-back"
                size={isTablet ? 48 : 24}
                color="#374151"
              />
            </TouchableOpacity>
            <Text
              style={{
                fontSize: isTablet ? 36 : 24,
                fontWeight: "700",
                color: "#1f2937",
                letterSpacing: -0.5,
                paddingHorizontal: 8,
              }}
            >
              Projects Map
            </Text>
          </View>
        </View>

        {/* Map */}
        <View style={{ flex: 1 }}>
          {(() => {
            if (!MapView) {
              console.error("🗺️ MapScreen: MapView component is not available");
              return (
                <View
                  style={{
                    flex: 1,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Text style={{ fontSize: 16, color: "red" }}>
                    Map not available
                  </Text>
                </View>
              );
            }

            const initialRegion = getInitialRegion();

            return (
              <MapView
                ref={mapRef}
                style={{ flex: 1 }}
                initialRegion={initialRegion}
                showsUserLocation={true}
                showsMyLocationButton={true}
                showsScale={true}
              >
                {projectsWithLocation.map((project) => {

                  try {
                    // Double-check coordinates before creating marker
                    const lat = project.latitude;
                    const lng = project.longitude;

                    if (
                      typeof lat !== "number" ||
                      typeof lng !== "number" ||
                      isNaN(lat) ||
                      isNaN(lng) ||
                      lat < -90 ||
                      lat > 90 ||
                      lng < -180 ||
                      lng > 180
                    ) {
                      return null;
                    }

                    return (
                      <Marker
                        key={project.id}
                        coordinate={{
                          latitude: lat,
                          longitude: lng,
                        }}
                        title={project.name}
                        description={project.address || "No address"}
                      >
                        <View
                          style={{
                            backgroundColor: (() => {
                              try {
                                return getStatusColor(project.status).text;
                              } catch (error) {
                                console.error(
                                  "🗺️ MapScreen: Error getting status color for",
                                  project.name,
                                  error
                                );
                                return "#374151"; // Fallback color
                              }
                            })(),
                            padding: 8,
                            borderRadius: 20,
                            borderWidth: 3,
                            borderColor: "white",
                            shadowColor: "#000",
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.3,
                            shadowRadius: 4,
                            elevation: 5,
                          }}
                        >
                          <MaterialIcons
                            name="lightbulb"
                            size={isTablet ? 24 : 16}
                            color="white"
                          />
                        </View>

                        <Callout
                          onPress={() => {
                            handleDetailsPress(project);
                          }}
                        >
                          <View
                            style={{
                              padding: 12,
                              minWidth: isTablet ? 250 : 200,
                            }}
                          >
                            <Text
                              style={{
                                fontSize: isTablet ? 24 : 16,
                                fontWeight: "600",
                                color: "#1f2937",
                                marginBottom: 4,
                              }}
                            >
                              {project.name}
                            </Text>
                            {project.address && (
                              <Text
                                style={{
                                  fontSize: isTablet ? 18 : 14,
                                  color: "#6b7280",
                                  marginBottom: 8,
                                }}
                              >
                                {project.address}
                              </Text>
                            )}
                            <View
                              style={{
                                backgroundColor: (() => {
                                  try {
                                    return getStatusColor(project.status).bg;
                                  } catch (error) {
                                    console.error(
                                      "🗺️ MapScreen: Error getting status bg color:",
                                      error
                                    );
                                    return "#f3f4f6"; // Fallback
                                  }
                                })(),
                                paddingHorizontal: 8,
                                paddingVertical: 4,
                                borderRadius: 8,
                                alignSelf: "flex-start",
                                marginBottom: 8,
                              }}
                            >
                              <Text
                                style={{
                                  color: (() => {
                                    try {
                                      return getStatusColor(project.status)
                                        .text;
                                    } catch (error) {
                                      console.error(
                                        "🗺️ MapScreen: Error getting status text color:",
                                        error
                                      );
                                      return "#374151"; // Fallback
                                    }
                                  })(),
                                  fontSize: isTablet ? 16 : 10,
                                  fontWeight: "600",
                                }}
                              >
                                {project.status}
                              </Text>
                            </View>
                            <View
                              style={{
                                backgroundColor: (() => {
                                  try {
                                    return getStatusColor(project.status).text;
                                  } catch (error) {
                                    console.error(
                                      "🗺️ MapScreen: Error getting status text color for button:",
                                      error
                                    );
                                    return "#374151"; // Fallback
                                  }
                                })(),
                                paddingHorizontal: 12,
                                paddingVertical: 6,
                                borderRadius: 12,
                                alignSelf: "flex-start",
                              }}
                            >
                              <Text
                                style={{
                                  color: "white",
                                  fontSize: isTablet ? 18 : 12,
                                  fontWeight: "600",
                                }}
                              >
                                Tap to View Details
                              </Text>
                            </View>
                          </View>
                        </Callout>
                      </Marker>
                    );
                  } catch (error) {
                    console.error(
                      "🗺️ MapScreen: Error creating marker for project:",
                      project.name,
                      error
                    );
                    return null;
                  }
                })}
              </MapView>
            );
          })()}
        </View>

        {/* Empty state overlay */}
        {projectsWithLocation.length === 0 && (
          <View
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0, 0, 0, 0.3)",
              alignItems: "center",
              justifyContent: "center",
              paddingHorizontal: 32,
            }}
          >
            <View
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.95)",
                paddingHorizontal: 32,
                paddingVertical: 40,
                borderRadius: 24,
                alignItems: "center",
                maxWidth: 320,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.1,
                shadowRadius: 16,
                elevation: 8,
              }}
            >
              <MaterialIcons
                name="location-off"
                size={48}
                color="#9ca3af"
                style={{ marginBottom: 16 }}
              />
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: "700",
                  color: "#1f2937",
                  marginBottom: 8,
                  textAlign: "center",
                }}
              >
                No project locations
              </Text>
              <Text
                style={{
                  fontSize: 16,
                  color: "#6b7280",
                  textAlign: "center",
                  marginBottom: 24,
                  lineHeight: 22,
                }}
              >
                Add addresses to your projects to see them on the map
              </Text>
              <TouchableOpacity
                style={{
                  backgroundColor: "#374151",
                  paddingHorizontal: 24,
                  paddingVertical: 12,
                  borderRadius: 16,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 3 },
                  shadowOpacity: 0.15,
                  shadowRadius: 6,
                  elevation: 4,
                }}
                onPress={() => router.back()}
              >
                <Text
                  style={{
                    color: "white",
                    fontWeight: "600",
                    fontSize: 16,
                  }}
                >
                  Back to Projects
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Project Details Modal */}
        <ProjectDetailsModal
          visible={projectDetailsModalVisible}
          project={selectedProject}
          onClose={() => setProjectDetailsModalVisible(false)}
          onOpenEditor={handleOpenEditor}
          onDelete={handleDeleteProject}
          onEdit={handleEditProject}
        />

        {/* Edit Project Modal */}
        <EditProjectModal
          visible={editModalVisible}
          project={selectedProject}
          onClose={() => setEditModalVisible(false)}
          onProjectUpdated={handleProjectUpdated}
        />
      </SafeAreaView>
    );
  } catch (error) {
    console.error("🗺️ MapScreen: Critical error in component render:", error);
    return (
      <SafeAreaView
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      >
        <Text
          style={{
            fontSize: 18,
            color: "red",
            textAlign: "center",
            padding: 20,
          }}
        >
          Map Error: {error instanceof Error ? error.message : "Unknown error"}
        </Text>
        <TouchableOpacity
          style={{
            backgroundColor: "#374151",
            padding: 12,
            borderRadius: 8,
            marginTop: 20,
          }}
          onPress={() => router.back()}
        >
          <Text style={{ color: "white", fontWeight: "600" }}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }
}
