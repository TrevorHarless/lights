import { Session, User, AuthChangeEvent } from "@supabase/supabase-js";
import React, { createContext, useContext, useEffect, useState } from "react";
import * as AppleAuthentication from "expo-apple-authentication";
import { supabase } from "~/lib/supabase";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signInWithApple: () => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.log('🔐 AUTH: Error retrieving session:', error.message);
        // Clear any stale auth data
        supabase.auth.signOut();
      }
      console.log('🔐 AUTH: Retrieved session on app start:', session ? `User: ${session.user?.email}` : 'No session found');
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event: AuthChangeEvent, session: Session | null) => {
      if (event === 'SIGNED_IN' && session?.user) {
        console.log('🔐 AUTH: User signed in');
      } else if (event === 'SIGNED_OUT') {
        console.log('🔐 AUTH: User signed out');
      }
      
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

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
          provider: 'apple',
          token: credential.identityToken,
        });
        
        if (error) {
          console.error('🍎 APPLE AUTH: Sign-in failed:', error.message);
        } else {
          console.log('🍎 APPLE AUTH: Successfully signed in');
        }
        
        return { error };
      } else {
        console.error('🍎 APPLE AUTH: No identity token received');
        return { error: { message: 'No identity token received' } };
      }
    } catch (e: any) {
      if (e.code === 'ERR_REQUEST_CANCELED') {
        return { error: { message: 'User canceled Apple sign-in' } };
      } else {
        console.error('🍎 APPLE AUTH: Error:', e.message);
        return { error: e };
      }
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.log('🔐 AUTH: Sign-out failed:', error.message);
        // Even if signOut fails, we should clear local state
        // since the user explicitly wants to sign out
        setSession(null);
        setUser(null);
      } else {
        console.log('🔐 AUTH: Successfully signed out');
      }
    } catch (error) {
      console.log('🔐 AUTH: Sign-out failed:', (error as Error).message);
      // Force clear local auth state even if signOut throws
      setSession(null);
      setUser(null);
    }
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    return { error };
  };

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signInWithApple,
    signOut,
    resetPassword,
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
