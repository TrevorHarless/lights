import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { AuthProvider } from "~/contexts/AuthContext";
import { SyncProvider } from "~/contexts/SyncContext";

export default function RootLayout() {
  return (
    <AuthProvider>
      <SyncProvider>
        <StatusBar style="dark" backgroundColor="#ffffff" />
        <Stack screenOptions={{ headerShown: false }} />
      </SyncProvider>
    </AuthProvider>
  );
}
