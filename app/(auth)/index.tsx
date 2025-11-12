import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useAuth } from "@/contexts/auth-context";
import { useDemoMode } from "@/contexts/demo-mode-context";
import { useThemeColor } from "@/hooks/use-theme-color";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from "react-native";

export default function AuthScreen() {
  const router = useRouter();
  const { signIn, signUp, isAuthenticated, isLoading: authLoading } = useAuth();
  const { activateDemoMode, isDemoMode } = useDemoMode();

  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Animation values
  const [logoScale] = useState(new Animated.Value(0.8));
  const [logoOpacity] = useState(new Animated.Value(0));
  const [contentOpacity] = useState(new Animated.Value(0));

  // Theme colors
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const tintColor = useThemeColor({}, "tint");
  const iconColor = useThemeColor({}, "icon");

  // Navigate to home if already authenticated or in demo mode
  useEffect(() => {
    if (isAuthenticated || isDemoMode) {
      router.replace("/(tabs)");
    }
  }, [isAuthenticated, isDemoMode, router]);

  // Logo animation on mount
  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.spring(logoScale, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(contentOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleDemoMode = async () => {
    try {
      setIsLoading(true);
      setError("");

      await activateDemoMode();

      // Success haptic
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Navigate to home
      router.replace("/(tabs)");
    } catch (error) {
      setError("Failed to activate demo mode");
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuth = async () => {
    // Validation
    if (!email.trim() || !password.trim()) {
      setError("Please fill in all fields");
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    if (isSignUp && !displayName.trim()) {
      setError("Please enter your display name");
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email");
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    // Password length validation
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    try {
      setIsLoading(true);
      setError("");

      if (isSignUp) {
        await signUp(email, password, displayName);
      } else {
        await signIn(email, password);
      }

      // Success haptic
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Success animation (brief scale)
      Animated.sequence([
        Animated.timing(contentOpacity, {
          toValue: 0.5,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(contentOpacity, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();

      // Navigate to home
      setTimeout(() => {
        router.replace("/(tabs)");
      }, 300);
    } catch (error: any) {
      setError(error.message || "Authentication failed. Please try again.");
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleAuthMode = () => {
    setIsSignUp(!isSignUp);
    setError("");
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  if (authLoading) {
    return (
      <ThemedView style={styles.container}>
        <ActivityIndicator size="large" color={tintColor} />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        {/* Logo Section */}
        <Animated.View
          style={[
            styles.logoContainer,
            {
              opacity: logoOpacity,
              transform: [{ scale: logoScale }],
            },
          ]}
        >
          <View style={[styles.logoCircle, { backgroundColor: tintColor }]}>
            <ThemedText style={styles.logoText}>🌱</ThemedText>
          </View>
          <ThemedText type="title" style={styles.appName}>
            EcoNest
          </ThemedText>
          <ThemedText style={[styles.tagline, { color: iconColor }]}>
            Track your green wins, compete with friends
          </ThemedText>
        </Animated.View>

        {/* Auth Form */}
        <Animated.View
          style={[styles.formContainer, { opacity: contentOpacity }]}
        >
          {/* Demo Mode Button */}
          <Pressable
            style={[styles.demoButton, { backgroundColor: tintColor }]}
            onPress={handleDemoMode}
            disabled={isLoading}
          >
            <ThemedText style={styles.demoButtonText}>
              ✨ Try demo data
            </ThemedText>
          </Pressable>

          <View style={styles.divider}>
            <View
              style={[styles.dividerLine, { backgroundColor: iconColor }]}
            />
            <ThemedText style={[styles.dividerText, { color: iconColor }]}>
              or
            </ThemedText>
            <View
              style={[styles.dividerLine, { backgroundColor: iconColor }]}
            />
          </View>

          {/* Email Input */}
          <View style={styles.inputContainer}>
            <ThemedText style={styles.inputLabel}>Email</ThemedText>
            <TextInput
              style={[
                styles.input,
                {
                  color: textColor,
                  borderColor: iconColor,
                  backgroundColor: backgroundColor,
                },
              ]}
              placeholder="your@email.com"
              placeholderTextColor={iconColor}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              editable={!isLoading}
            />
          </View>

          {/* Display Name Input (Sign Up only) */}
          {isSignUp && (
            <View style={styles.inputContainer}>
              <ThemedText style={styles.inputLabel}>Display Name</ThemedText>
              <TextInput
                style={[
                  styles.input,
                  {
                    color: textColor,
                    borderColor: iconColor,
                    backgroundColor: backgroundColor,
                  },
                ]}
                placeholder="Your Name"
                placeholderTextColor={iconColor}
                value={displayName}
                onChangeText={setDisplayName}
                editable={!isLoading}
              />
            </View>
          )}

          {/* Password Input */}
          <View style={styles.inputContainer}>
            <ThemedText style={styles.inputLabel}>Password</ThemedText>
            <TextInput
              style={[
                styles.input,
                {
                  color: textColor,
                  borderColor: iconColor,
                  backgroundColor: backgroundColor,
                },
              ]}
              placeholder="••••••••"
              placeholderTextColor={iconColor}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              editable={!isLoading}
            />
          </View>

          {/* Error Message */}
          {error ? (
            <View style={styles.errorContainer}>
              <ThemedText style={styles.errorText}>{error}</ThemedText>
            </View>
          ) : null}

          {/* Auth Button */}
          <Pressable
            style={[
              styles.authButton,
              {
                backgroundColor: tintColor,
                opacity: isLoading ? 0.6 : 1,
              },
            ]}
            onPress={handleAuth}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <ThemedText style={styles.authButtonText}>
                {isSignUp ? "Sign Up" : "Sign In"}
              </ThemedText>
            )}
          </Pressable>

          {/* Toggle Auth Mode */}
          <Pressable
            style={styles.toggleContainer}
            onPress={toggleAuthMode}
            disabled={isLoading}
          >
            <ThemedText style={[styles.toggleText, { color: iconColor }]}>
              {isSignUp
                ? "Already have an account? "
                : "Don't have an account? "}
            </ThemedText>
            <ThemedText style={[styles.toggleLink, { color: tintColor }]}>
              {isSignUp ? "Sign In" : "Sign Up"}
            </ThemedText>
          </Pressable>
        </Animated.View>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 48,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  logoText: {
    fontSize: 40,
  },
  appName: {
    marginBottom: 8,
  },
  tagline: {
    fontSize: 14,
    textAlign: "center",
  },
  formContainer: {
    width: "100%",
  },
  demoButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 24,
  },
  demoButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    opacity: 0.3,
  },
  dividerText: {
    marginHorizontal: 12,
    fontSize: 14,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  errorContainer: {
    backgroundColor: "#fee",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: "#c00",
    fontSize: 14,
  },
  authButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
    marginBottom: 16,
  },
  authButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  toggleContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 8,
  },
  toggleText: {
    fontSize: 14,
  },
  toggleLink: {
    fontSize: 14,
    fontWeight: "600",
  },
});
