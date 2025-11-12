import { PrivacyToggle } from "@/components/privacy-toggle";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useAuth } from "@/contexts/auth-context";
import { useDemoMode } from "@/contexts/demo-mode-context";
import { useReducedMotion } from "@/contexts/reduced-motion-context";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  View,
} from "react-native";

// AsyncStorage key for haptic feedback setting
const HAPTIC_FEEDBACK_KEY = "econest_haptic_feedback";

export default function SettingsScreen() {
  const { user, signOut, updatePrivacy, isAuthenticated } = useAuth();
  const { isDemoMode, deactivateDemoMode } = useDemoMode();
  const {
    reducedMotion,
    setReducedMotion,
    isLoading: isLoadingReducedMotion,
  } = useReducedMotion();
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [hapticFeedback, setHapticFeedback] = useState(true);
  const [isLoadingHaptic, setIsLoadingHaptic] = useState(true);

  // Load haptic feedback setting on mount
  useEffect(() => {
    loadHapticSetting();
  }, []);

  const loadHapticSetting = async () => {
    try {
      const hapticValue = await AsyncStorage.getItem(HAPTIC_FEEDBACK_KEY);
      setHapticFeedback(hapticValue !== "false"); // Default to true
    } catch (error) {
      console.error("Failed to load haptic feedback setting:", error);
    } finally {
      setIsLoadingHaptic(false);
    }
  };

  const handlePrivacyChange = async (isAnonymous: boolean) => {
    if (isAuthenticated && !isDemoMode) {
      try {
        await updatePrivacy(isAnonymous);
      } catch (error) {
        Alert.alert(
          "Error",
          "Failed to update privacy setting. Please try again."
        );
      }
    }
  };

  const handleReducedMotionToggle = async (value: boolean) => {
    try {
      await setReducedMotion(value);
    } catch (error) {
      console.error("Failed to save reduced motion setting:", error);
      Alert.alert("Error", "Failed to save setting. Please try again.");
    }
  };

  const handleHapticFeedbackToggle = async (value: boolean) => {
    try {
      setHapticFeedback(value);
      await AsyncStorage.setItem(HAPTIC_FEEDBACK_KEY, value.toString());
    } catch (error) {
      console.error("Failed to save haptic feedback setting:", error);
      setHapticFeedback(!value); // Revert on error
      Alert.alert("Error", "Failed to save setting. Please try again.");
    }
  };

  const handleSignOut = () => {
    Alert.alert(
      "Sign Out",
      "Are you sure you want to sign out?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Sign Out",
          style: "destructive",
          onPress: async () => {
            try {
              setIsSigningOut(true);
              if (isDemoMode) {
                await deactivateDemoMode();
              } else {
                await signOut();
              }
              router.replace("/(auth)");
            } catch (error) {
              Alert.alert("Error", "Failed to sign out. Please try again.");
            } finally {
              setIsSigningOut(false);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <ThemedText style={styles.title}>Settings</ThemedText>
          {isDemoMode && (
            <View style={styles.demoBadge}>
              <ThemedText style={styles.demoBadgeText}>Demo Mode</ThemedText>
            </View>
          )}
        </View>

        {/* Account Section */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Account</ThemedText>

          {user && (
            <View style={styles.accountInfo}>
              <ThemedText style={styles.accountLabel}>Email</ThemedText>
              <ThemedText style={styles.accountValue}>
                {isDemoMode ? "demo@econest.app" : user.email}
              </ThemedText>

              <ThemedText style={styles.accountLabel}>Display Name</ThemedText>
              <ThemedText style={styles.accountValue}>
                {isDemoMode ? "Demo User" : user.displayName}
              </ThemedText>

              <ThemedText style={styles.accountLabel}>EcoPoints</ThemedText>
              <ThemedText style={styles.accountValue}>
                {user.ecoPoints}
              </ThemedText>
            </View>
          )}
        </View>

        {/* Privacy Section */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Privacy</ThemedText>
          <PrivacyToggle
            onPrivacyChange={handlePrivacyChange}
            disabled={!isAuthenticated || isDemoMode}
          />
          {isDemoMode && (
            <ThemedText style={styles.disabledNote}>
              Privacy settings are disabled in demo mode
            </ThemedText>
          )}
        </View>

        {/* Accessibility Section */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Accessibility</ThemedText>

          {/* Reduced Motion Toggle */}
          <View
            style={styles.settingRow}
            accessible={true}
            accessibilityLabel={`Reduced Motion: ${reducedMotion ? "enabled" : "disabled"}`}
            accessibilityHint="Disables non-essential animations for better accessibility"
          >
            <View style={styles.settingTextContainer}>
              <ThemedText style={styles.settingLabel}>
                Reduced Motion
              </ThemedText>
              <ThemedText style={styles.settingDescription}>
                Disable non-essential animations
              </ThemedText>
            </View>
            <Switch
              value={reducedMotion}
              onValueChange={handleReducedMotionToggle}
              disabled={isLoadingReducedMotion}
              trackColor={{ false: "#767577", true: "#81b0ff" }}
              thumbColor={reducedMotion ? "#34C759" : "#f4f3f4"}
              accessible={true}
              accessibilityLabel={`Reduced motion ${reducedMotion ? "enabled" : "disabled"}`}
              accessibilityRole="switch"
              accessibilityState={{
                checked: reducedMotion,
                disabled: isLoadingReducedMotion,
              }}
            />
          </View>

          {/* Haptic Feedback Toggle */}
          <View
            style={styles.settingRow}
            accessible={true}
            accessibilityLabel={`Haptic Feedback: ${hapticFeedback ? "enabled" : "disabled"}`}
            accessibilityHint="Enables vibration feedback for interactions"
          >
            <View style={styles.settingTextContainer}>
              <ThemedText style={styles.settingLabel}>
                Haptic Feedback
              </ThemedText>
              <ThemedText style={styles.settingDescription}>
                Enable vibration for interactions
              </ThemedText>
            </View>
            <Switch
              value={hapticFeedback}
              onValueChange={handleHapticFeedbackToggle}
              disabled={isLoadingHaptic}
              trackColor={{ false: "#767577", true: "#81b0ff" }}
              thumbColor={hapticFeedback ? "#34C759" : "#f4f3f4"}
              accessible={true}
              accessibilityLabel={`Haptic feedback ${hapticFeedback ? "enabled" : "disabled"}`}
              accessibilityRole="switch"
              accessibilityState={{
                checked: hapticFeedback,
                disabled: isLoadingHaptic,
              }}
            />
          </View>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>About</ThemedText>
          <View style={styles.aboutInfo}>
            <ThemedText style={styles.aboutLabel}>Version</ThemedText>
            <ThemedText style={styles.aboutValue}>1.0.0</ThemedText>

            <ThemedText style={styles.aboutLabel}>Platform</ThemedText>
            <ThemedText style={styles.aboutValue}>{Platform.OS}</ThemedText>
          </View>

          <ThemedText style={styles.credits}>
            EcoNest - Track your green wins, compete with friends, and stay
            eco-motivated
          </ThemedText>
        </View>

        {/* Sign Out Button */}
        <Pressable
          style={({ pressed }) => [
            styles.signOutButton,
            pressed && styles.signOutButtonPressed,
          ]}
          onPress={handleSignOut}
          disabled={isSigningOut}
          accessible={true}
          accessibilityLabel={
            isSigningOut
              ? "Signing out"
              : isDemoMode
                ? "Exit demo mode"
                : "Sign out"
          }
          accessibilityHint={
            isDemoMode
              ? "Tap to exit demo mode and return to login"
              : "Tap to sign out of your account"
          }
          accessibilityRole="button"
          accessibilityState={{
            disabled: isSigningOut,
            busy: isSigningOut,
          }}
        >
          <Ionicons
            name="log-out-outline"
            size={20}
            color="#fff"
            accessibilityElementsHidden={true}
          />
          <ThemedText style={styles.signOutButtonText}>
            {isSigningOut
              ? "Signing Out..."
              : isDemoMode
                ? "Exit Demo"
                : "Sign Out"}
          </ThemedText>
        </Pressable>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
  },
  demoBadge: {
    backgroundColor: "#FF9800",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  demoBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
    opacity: 0.8,
  },
  accountInfo: {
    backgroundColor: "rgba(0, 0, 0, 0.05)",
    borderRadius: 12,
    padding: 16,
  },
  accountLabel: {
    fontSize: 14,
    opacity: 0.6,
    marginTop: 8,
  },
  accountValue: {
    fontSize: 16,
    fontWeight: "500",
    marginTop: 4,
  },
  disabledNote: {
    fontSize: 12,
    opacity: 0.5,
    marginTop: 8,
    fontStyle: "italic",
  },
  comingSoon: {
    fontSize: 14,
    opacity: 0.6,
    fontStyle: "italic",
    paddingVertical: 12,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "rgba(0, 0, 0, 0.05)",
    borderRadius: 12,
    marginBottom: 12,
  },
  settingTextContainer: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    opacity: 0.7,
  },
  aboutInfo: {
    backgroundColor: "rgba(0, 0, 0, 0.05)",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  aboutLabel: {
    fontSize: 14,
    opacity: 0.6,
    marginTop: 8,
  },
  aboutValue: {
    fontSize: 16,
    fontWeight: "500",
    marginTop: 4,
  },
  credits: {
    fontSize: 14,
    opacity: 0.7,
    textAlign: "center",
    lineHeight: 20,
  },
  signOutButton: {
    backgroundColor: "#f44336",
    marginHorizontal: 20,
    marginTop: 32,
    paddingVertical: 16,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  signOutButtonPressed: {
    opacity: 0.8,
  },
  signOutButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  bottomSpacer: {
    height: 40,
  },
});

// ============================================================================
// Helper Function for Haptic Feedback Setting Access
// ============================================================================

/**
 * Get the haptic feedback setting
 * @returns Promise<boolean> - true if haptic feedback is enabled (default)
 */
export async function getHapticFeedbackSetting(): Promise<boolean> {
  try {
    const value = await AsyncStorage.getItem(HAPTIC_FEEDBACK_KEY);
    return value !== "false"; // Default to true
  } catch (error) {
    console.error("Failed to get haptic feedback setting:", error);
    return true;
  }
}
