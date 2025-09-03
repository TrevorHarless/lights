import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useRouter } from "expo-router";
import React, { useState, useEffect } from "react";
import {
  Alert,
  Clipboard,
  Dimensions,
  Linking,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Purchases from "react-native-purchases";
import { SubscriptionGuard } from "~/components/SubscriptionGuard";
import { useAuth } from "~/contexts/AuthContext";
import { supabase } from "~/lib/supabase";
import { projectsService } from "~/services/projects";
import { localStorageService } from "~/services/localStorage";
import "../global.css";

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [clearingProjects, setClearingProjects] = useState(false);
  const [appUserID, setAppUserID] = useState<string>("");

  useEffect(() => {
    const getAppUserID = async () => {
      try {
        const customerInfo = await Purchases.getCustomerInfo();
        setAppUserID(customerInfo.originalAppUserId);
      } catch (error) {
        console.error('Error getting app user ID:', error);
      }
    };
    getAppUserID();
  }, []);

  const copyAppUserID = async () => {
    try {
      await Clipboard.setString(appUserID);
      Alert.alert('Copied', 'App User ID copied to clipboard');
    } catch {
      Alert.alert('Error', 'Failed to copy App User ID');
    }
  };

  const contactSupport = async () => {
    const supportEmail = 'trevorharless.dev@gmail.com';
    const subject = 'Holiday Lights Pro Support Request';
    const body = `Hi,

I need help with Holiday Lights Pro.

My App User ID: ${appUserID}
My Email: ${user?.email || 'N/A'}

Issue Description:
[Please describe your issue here]

Thank you!`;
    
    const emailUrl = `mailto:${supportEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    try {
      const canOpen = await Linking.canOpenURL(emailUrl);
      if (canOpen) {
        await Linking.openURL(emailUrl);
      } else {
        // Fallback - copy email to clipboard
        await Clipboard.setString(supportEmail);
        Alert.alert(
          'Email Client Not Available',
          `Support email copied to clipboard: ${supportEmail}`
        );
      }
    } catch {
      // Fallback - copy email to clipboard
      await Clipboard.setString(supportEmail);
      Alert.alert(
        'Error',
        `Could not open email client. Support email copied to clipboard: ${supportEmail}`
      );
    }
  };
  
  const { width } = Dimensions.get('window');
  const isTablet = width >= 768;
  const contentMaxWidth = isTablet ? 600 : '100%';
  const horizontalPadding = isTablet ? 40 : 20;
  const sectionSpacing = isTablet ? 32 : 24;

  const handleSignOut = async () => {
    Alert.alert(
      "Sign Out",
      "Are you sure you want to sign out?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Sign Out",
          style: "destructive",
          onPress: async () => {
            await signOut();
            router.replace("/");
          },
        },
      ]
    );
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert("Error", "Please fill in all password fields");
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "New passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert("Error", "New password must be at least 6 characters long");
      return;
    }

    setLoading(true);

    try {
      // First verify the current password
      const { error: verifyError } = await supabase.auth.signInWithPassword({
        email: user?.email || "",
        password: currentPassword,
      });

      if (verifyError) {
        Alert.alert("Error", "Current password is incorrect");
        setLoading(false);
        return;
      }

      // Update the password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        Alert.alert("Error", updateError.message);
      } else {
        Alert.alert("Success", "Password updated successfully");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch {
      Alert.alert("Error", "Failed to update password");
    }

    setLoading(false);
  };

  const handleClearAllProjects = async () => {
    Alert.alert(
      "Clear All Projects",
      "Are you sure you want to delete ALL of your projects? This action cannot be undone and will remove all projects from both your device and the cloud.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete All",
          style: "destructive",
          onPress: async () => {
            setClearingProjects(true);
            try {
              // Clear from Supabase first
              const { error } = await projectsService.deleteAllProjects();
              
              if (error) {
                Alert.alert("Error", "Failed to delete projects from cloud: " + error.message);
                setClearingProjects(false);
                return;
              }

              // Clear from local storage
              await localStorageService.clearUserData();
              
              Alert.alert("Success", "All projects have been deleted successfully");
            } catch (error) {
              Alert.alert("Error", "Failed to clear projects: " + (error as Error).message);
            }
            setClearingProjects(false);
          },
        },
      ]
    );
  };

  return (
    <SubscriptionGuard>
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
          <TouchableOpacity
            style={{
              width: 40,
              height: 40,
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onPress={() => router.back()}
          >
            <FontAwesome name="arrow-left" size={20} color="#374151" />
          </TouchableOpacity>
          <Text style={{ 
            fontSize: isTablet ? 32 : 28, 
            fontWeight: '700', 
            color: '#1f2937',
            letterSpacing: -0.5 
          }}>
            Profile
          </Text>
          <View style={{ width: 40 }} />
        </View>
      </View>

      {/* Content */}
      <ScrollView 
        style={{ flex: 1 }}
        contentContainerStyle={{ 
          padding: horizontalPadding,
          alignItems: isTablet ? 'center' : 'stretch'
        }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={{
          width: contentMaxWidth,
          maxWidth: contentMaxWidth
        }}>
          {/* User Info Section */}
          <View style={{
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            borderRadius: isTablet ? 20 : 16,
            padding: isTablet ? 28 : 20,
            marginBottom: sectionSpacing,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 12,
          elevation: 6,
        }}>
            <Text style={{
              fontSize: isTablet ? 24 : 20,
              fontWeight: '700',
              color: '#1f2937',
              marginBottom: isTablet ? 16 : 12,
            }}>
            Account Information
          </Text>
            <Text style={{
              fontSize: isTablet ? 18 : 16,
              color: '#6b7280',
              marginBottom: isTablet ? 6 : 4,
            }}>
            Email
          </Text>
            <Text style={{
              fontSize: isTablet ? 18 : 16,
              fontWeight: '600',
              color: '#374151',
              marginBottom: isTablet ? 20 : 16,
            }}>
            {user?.email}
          </Text>
        </View>

        {/* App User ID Section */}
        <View style={{
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          borderRadius: isTablet ? 20 : 16,
          padding: isTablet ? 28 : 20,
          marginBottom: sectionSpacing,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 12,
          elevation: 8,
          alignItems: 'center',
          maxWidth: contentMaxWidth,
          width: '100%',
        }}>
          <Text style={{
            fontSize: isTablet ? 22 : 20,
            fontWeight: '700',
            color: '#1f2937',
            marginBottom: isTablet ? 20 : 16,
            textAlign: 'center',
          }}>
            Support Information
          </Text>
          <Text style={{
            fontSize: isTablet ? 16 : 14,
            fontWeight: '600',
            color: '#374151',
            marginBottom: 8,
            textAlign: 'center',
          }}>
            App User ID
          </Text>
          <Text style={{
            fontSize: isTablet ? 14 : 12,
            color: '#6b7280',
            textAlign: 'center',
            marginBottom: 16,
            paddingHorizontal: 20,
          }}>
            This ID helps our support team assist you with subscription and account issues.
          </Text>
          <TouchableOpacity
            onPress={copyAppUserID}
            style={{
              backgroundColor: '#f3f4f6',
              borderRadius: 12,
              padding: 16,
              borderWidth: 1,
              borderColor: '#e5e7eb',
              width: '100%',
              marginBottom: 12,
            }}
          >
            <Text style={{
              fontSize: isTablet ? 14 : 12,
              fontFamily: 'monospace',
              color: '#374151',
              textAlign: 'center',
              lineHeight: isTablet ? 20 : 16,
            }}>
              {appUserID || 'Loading...'}
            </Text>
          </TouchableOpacity>
          <Text style={{
            fontSize: 12,
            color: '#6b7280',
            textAlign: 'center',
            fontStyle: 'italic',
            marginBottom: 20,
          }}>
            Tap to copy
          </Text>
          
          <Text style={{
            fontSize: isTablet ? 16 : 14,
            fontWeight: '600',
            color: '#374151',
            marginBottom: 8,
            textAlign: 'center',
          }}>
            Need Help?
          </Text>
          <Text style={{
            fontSize: isTablet ? 14 : 12,
            color: '#6b7280',
            textAlign: 'center',
            marginBottom: 16,
            paddingHorizontal: 20,
          }}>
            Contact our support team for help with subscriptions, billing, or app features.
          </Text>
          
          <TouchableOpacity
            onPress={contactSupport}
            style={{
              backgroundColor: '#3b82f6',
              borderRadius: 12,
              padding: 16,
              width: '100%',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 4,
            }}
          >
            <Text style={{
              fontSize: isTablet ? 16 : 14,
              fontWeight: '600',
              color: 'white',
              textAlign: 'center',
            }}>
              Contact Support
            </Text>
            <Text style={{
              fontSize: isTablet ? 12 : 11,
              color: 'rgba(255, 255, 255, 0.8)',
              textAlign: 'center',
              marginTop: 4,
            }}>
              trevorharless.dev@gmail.com
            </Text>
          </TouchableOpacity>
        </View>

          {/* Change Password Section */}
          <View style={{
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            borderRadius: isTablet ? 20 : 16,
            padding: isTablet ? 28 : 20,
            marginBottom: sectionSpacing,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 12,
          elevation: 6,
        }}>
          <Text style={{
            fontSize: 20,
            fontWeight: '700',
            color: '#1f2937',
            marginBottom: 16,
          }}>
            Change Password
          </Text>

          <Text style={{
            fontSize: 14,
            fontWeight: '600',
            color: '#374151',
            marginBottom: 8,
          }}>
            Current Password
          </Text>
          <TextInput
            style={{
              backgroundColor: '#f9fafb',
              borderRadius: 12,
              paddingHorizontal: 16,
              paddingVertical: 12,
              fontSize: 16,
              color: '#1f2937',
              marginBottom: 16,
              borderWidth: 1,
              borderColor: '#e5e7eb',
            }}
            placeholder="Enter current password"
            placeholderTextColor="#9ca3af"
            secureTextEntry
            value={currentPassword}
            onChangeText={setCurrentPassword}
            autoCapitalize="none"
          />

          <Text style={{
            fontSize: 14,
            fontWeight: '600',
            color: '#374151',
            marginBottom: 8,
          }}>
            New Password
          </Text>
          <TextInput
            style={{
              backgroundColor: '#f9fafb',
              borderRadius: 12,
              paddingHorizontal: 16,
              paddingVertical: 12,
              fontSize: 16,
              color: '#1f2937',
              marginBottom: 16,
              borderWidth: 1,
              borderColor: '#e5e7eb',
            }}
            placeholder="Enter new password"
            placeholderTextColor="#9ca3af"
            secureTextEntry
            value={newPassword}
            onChangeText={setNewPassword}
            autoCapitalize="none"
          />

          <Text style={{
            fontSize: 14,
            fontWeight: '600',
            color: '#374151',
            marginBottom: 8,
          }}>
            Confirm New Password
          </Text>
          <TextInput
            style={{
              backgroundColor: '#f9fafb',
              borderRadius: 12,
              paddingHorizontal: 16,
              paddingVertical: 12,
              fontSize: 16,
              color: '#1f2937',
              marginBottom: 20,
              borderWidth: 1,
              borderColor: '#e5e7eb',
            }}
            placeholder="Confirm new password"
            placeholderTextColor="#9ca3af"
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            autoCapitalize="none"
          />

          <TouchableOpacity
            style={{
              backgroundColor: '#3b82f6',
              borderRadius: 12,
              paddingVertical: 14,
              alignItems: 'center',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.15,
              shadowRadius: 8,
              elevation: 6,
              opacity: loading ? 0.7 : 1,
            }}
            onPress={handleChangePassword}
            disabled={loading}
          >
            <Text style={{
              color: 'white',
              fontSize: 16,
              fontWeight: '600',
            }}>
              {loading ? 'Updating...' : 'Update Password'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Clear All Projects Section */}
        <View style={{
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          borderRadius: 16,
          padding: 20,
          marginBottom: 24,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 12,
          elevation: 6,
        }}>
          <Text style={{
            fontSize: 20,
            fontWeight: '700',
            color: '#1f2937',
            marginBottom: 8,
          }}>
            Clear All Projects
          </Text>
          <Text style={{
            fontSize: 14,
            color: '#6b7280',
            marginBottom: 16,
            lineHeight: 20,
          }}>
            This will permanently delete all of your projects from both your device and the cloud. This action cannot be undone.
          </Text>
          <TouchableOpacity
            style={{
              backgroundColor: '#dc2626',
              borderRadius: 12,
              paddingVertical: 14,
              alignItems: 'center',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.15,
              shadowRadius: 8,
              elevation: 6,
              opacity: clearingProjects ? 0.7 : 1,
            }}
            onPress={handleClearAllProjects}
            disabled={clearingProjects}
          >
            <Text style={{
              color: 'white',
              fontSize: 16,
              fontWeight: '600',
            }}>
              {clearingProjects ? 'Deleting All Projects...' : 'Delete All Projects'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Sign Out Section */}
        <View style={{
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          borderRadius: 16,
          padding: 20,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 12,
          elevation: 6,
        }}>
          <TouchableOpacity
            style={{
              backgroundColor: '#ef4444',
              borderRadius: 12,
              paddingVertical: 14,
              alignItems: 'center',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.15,
              shadowRadius: 8,
              elevation: 6,
            }}
            onPress={handleSignOut}
          >
            <Text style={{
              color: 'white',
              fontSize: 16,
              fontWeight: '600',
            }}>
              Sign Out
            </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
      </SubscriptionGuard>
  );
}