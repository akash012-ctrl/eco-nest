import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { ConvexProvider } from "convex/react";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import "react-native-reanimated";

import { SplashScreen } from "@/components/splash-screen";
import { AuthProvider, convex, useAuth } from "@/contexts/auth-context";
import { DemoModeProvider, useDemoMode } from "@/contexts/demo-mode-context";
import { useColorScheme } from "@/hooks/use-color-scheme";

export const unstable_settings = {
  initialRouteName: "(auth)",
};

function RootLayoutNav() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { isDemoMode, isLoading: demoLoading } = useDemoMode();
  const segments = useSegments();
  const router = useRouter();
  const [showSplash, setShowSplash] = useState(true);

  const isLoading = authLoading || demoLoading;

  // Handle splash screen
  useEffect(() => {
    if (!isLoading && showSplash) {
      // Splash screen will call setShowSplash(false) after animation
    }
  }, [isLoading, showSplash]);

  // Handle navigation based on auth state
  useEffect(() => {
    if (isLoading || showSplash) return;

    const inAuthGroup = segments[0] === "(auth)";
    const inTabsGroup = segments[0] === "(tabs)";

    if (isAuthenticated || isDemoMode) {
      // User is authenticated or in demo mode, redirect to tabs
      if (!inTabsGroup) {
        router.replace("/(tabs)");
      }
    } else {
      // User is not authenticated, redirect to auth
      if (!inAuthGroup) {
        router.replace("/(auth)");
      }
    }
  }, [isAuthenticated, isDemoMode, segments, isLoading, showSplash, router]);

  // Show splash screen during initial load
  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen
        name="modal"
        options={{ presentation: "modal", title: "Modal" }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ConvexProvider client={convex}>
      <AuthProvider>
        <DemoModeProvider>
          <ThemeProvider
            value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
          >
            <RootLayoutNav />
            <StatusBar style="auto" />
          </ThemeProvider>
        </DemoModeProvider>
      </AuthProvider>
    </ConvexProvider>
  );
}
