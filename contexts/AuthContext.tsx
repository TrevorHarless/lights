import { AuthChangeEvent, Session, User } from "@supabase/supabase-js";
import * as AppleAuthentication from "expo-apple-authentication";
import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "~/lib/supabase";
import { projectsService } from "~/services/projects";
import { localStorageService } from "~/services/localStorage";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signInWithApple: () => Promise<{ error: any }>;
  signInWithOTP: (email: string) => Promise<{ error: any }>;
  verifyOTP: (email: string, token: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  deleteAccount: () => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.log("🔐 AUTH: Error retrieving session:", error.message);
        // Clear any stale auth data
        supabase.auth.signOut();
      }
      console.log(
        "🔐 AUTH: Retrieved session on app start:",
        session ? `User: ${session.user?.email}` : "No session found"
      );
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (event: AuthChangeEvent, session: Session | null) => {
        if (event === "SIGNED_IN" && session?.user) {
          console.log("🔐 AUTH: User signed in");
        } else if (event === "SIGNED_OUT") {
          console.log("🔐 AUTH: User signed out");
        }

        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: undefined, // No email confirmation needed
      },
    });
    return { error };
  };

  const signInWithApple = async () => {
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      if (credential.identityToken) {
        const {
          error,
          data: { user },
        } = await supabase.auth.signInWithIdToken({
          provider: "apple",
          token: credential.identityToken,
        });

        if (error) {
          console.error("🍎 APPLE AUTH: Sign-in failed:", error.message);
        } else {
          console.log("🍎 APPLE AUTH: Successfully signed in");
        }

        return { error };
      } else {
        console.error("🍎 APPLE AUTH: No identity token received");
        return { error: { message: "No identity token received" } };
      }
    } catch (e: any) {
      if (e.code === "ERR_REQUEST_CANCELED") {
        return { error: { message: "User canceled Apple sign-in" } };
      } else {
        console.error("🍎 APPLE AUTH: Error:", e.message);
        return { error: e };
      }
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.log("🔐 AUTH: Sign-out failed:", error.message);
        // Even if signOut fails, we should clear local state
        // since the user explicitly wants to sign out
        setSession(null);
        setUser(null);
      }
    } catch (error) {
      console.log("🔐 AUTH: Sign-out failed:", (error as Error).message);
      // Force clear local auth state even if signOut throws
      setSession(null);
      setUser(null);
    }
  };

  const signInWithOTP = async (email: string) => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
      },
    });
    return { error };
  };

  const verifyOTP = async (email: string, token: string) => {
    const { error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'email',
    });
    return { error };
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    return { error };
  };

  const deleteAccount = async () => {
    try {
      // Step 1: Get current user and session for authentication
      const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser();
      if (userError || !currentUser) {
        return { error: userError || new Error("No user found") };
      }

      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) {
        return { error: sessionError || new Error("No session found") };
      }

      // Step 2: Delete all user's projects and associated images
      console.log("🗑️ Deleting all user projects and images...");
      const { error: projectsError } = await projectsService.deleteAllProjects();
      if (projectsError) {
        console.error("Error deleting projects:", projectsError);
        return { error: projectsError };
      }

      // Step 3: Clear all local storage data
      console.log("🗑️ Clearing local storage data...");
      await localStorageService.clearUserData();

      // Step 4: Call Edge Function to delete user account
      console.log("🗑️ Requesting account deletion via Edge Function...");
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/delete-user`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ userId: currentUser.id }),
        }
      );

      const result = await response.json();
      
      if (!response.ok) {
        console.error("Error deleting user account:", result.error);
        // Continue with sign out even if account deletion fails
        console.log("🗑️ Account deletion failed, but user data has been cleared.");
      } else {
        console.log("🗑️ User account successfully deleted.");
      }

      // Step 5: Sign out and clear local auth state
      console.log("🗑️ Account deletion process complete, signing out...");
      await signOut();

      return { error: null };
    } catch (error) {
      console.error("Account deletion failed:", error);
      return { error: error as any };
    }
  };

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signInWithApple,
    signInWithOTP,
    verifyOTP,
    signOut,
    resetPassword,
    deleteAccount,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
