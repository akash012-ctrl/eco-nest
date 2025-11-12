import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React from "react";
import { Modal, Pressable, StyleSheet, View } from "react-native";

// AsyncStorage key for tracking if prompt has been shown
const PRIVACY_PROMPT_SHOWN_KEY = "econest_privacy_prompt_shown";

export interface PrivacyPromptProps {
  visible: boolean;
  onSelectPublic: () => void;
  onSelectAnonymous: () => void;
}

export function PrivacyPrompt({
  visible,
  onSelectPublic,
  onSelectAnonymous,
}: PrivacyPromptProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={() => {
        // Prevent closing without selection
      }}
      accessible={true}
      accessibilityViewIsModal={true}
    >
      <View style={styles.overlay}>
        <ThemedView
          style={styles.container}
          accessible={true}
          accessibilityLabel="Privacy selection dialog"
          accessibilityRole="alert"
        >
          <ThemedText style={styles.title}>Choose Your Privacy</ThemedText>
          <ThemedText style={styles.description}>
            How would you like to appear on the leaderboard?
          </ThemedText>

          <View style={styles.optionsContainer}>
            {/* Public Option */}
            <Pressable
              style={({ pressed }) => [
                styles.optionButton,
                styles.publicButton,
                pressed && styles.optionButtonPressed,
              ]}
              onPress={onSelectPublic}
              accessible={true}
              accessibilityLabel="Public mode"
              accessibilityHint="Your display name will be visible to everyone on the leaderboard"
              accessibilityRole="button"
            >
              <ThemedText style={styles.optionTitle}>Public</ThemedText>
              <ThemedText style={styles.optionDescription}>
                Your display name will be visible to everyone
              </ThemedText>
            </Pressable>

            {/* Anonymous Option */}
            <Pressable
              style={({ pressed }) => [
                styles.optionButton,
                styles.anonymousButton,
                pressed && styles.optionButtonPressed,
              ]}
              onPress={onSelectAnonymous}
              accessible={true}
              accessibilityLabel="Anonymous mode"
              accessibilityHint="You'll appear as Anonymous on the leaderboard"
              accessibilityRole="button"
            >
              <ThemedText style={styles.optionTitle}>Anonymous</ThemedText>
              <ThemedText style={styles.optionDescription}>
                {`You'll appear as "Anonymous" on the leaderboard`}
              </ThemedText>
            </Pressable>
          </View>

          <ThemedText style={styles.note}>
            You can change this anytime in Settings
          </ThemedText>
        </ThemedView>
      </View>
    </Modal>
  );
}

// Helper function to check if prompt has been shown
export async function hasShownPrivacyPrompt(): Promise<boolean> {
  try {
    const value = await AsyncStorage.getItem(PRIVACY_PROMPT_SHOWN_KEY);
    return value === "true";
  } catch (error) {
    console.error("Failed to check privacy prompt status:", error);
    return false;
  }
}

// Helper function to mark prompt as shown
export async function markPrivacyPromptShown(): Promise<void> {
  try {
    await AsyncStorage.setItem(PRIVACY_PROMPT_SHOWN_KEY, "true");
  } catch (error) {
    console.error("Failed to mark privacy prompt as shown:", error);
    throw error;
  }
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  container: {
    width: "100%",
    maxWidth: 400,
    borderRadius: 16,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    textAlign: "center",
    opacity: 0.8,
    marginBottom: 24,
  },
  optionsContainer: {
    gap: 12,
    marginBottom: 16,
  },
  optionButton: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
  },
  publicButton: {
    borderColor: "#4CAF50",
    backgroundColor: "rgba(76, 175, 80, 0.1)",
  },
  anonymousButton: {
    borderColor: "#2196F3",
    backgroundColor: "rgba(33, 150, 243, 0.1)",
  },
  optionButtonPressed: {
    opacity: 0.7,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    opacity: 0.7,
  },
  note: {
    fontSize: 12,
    textAlign: "center",
    opacity: 0.6,
    fontStyle: "italic",
  },
});
