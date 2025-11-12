import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Switch, View } from "react-native";

// AsyncStorage key for privacy setting
const PRIVACY_MODE_KEY = "econest_privacy_mode";

export interface PrivacyToggleProps {
  onPrivacyChange?: (isAnonymous: boolean) => void;
  disabled?: boolean;
}

export function PrivacyToggle({
  onPrivacyChange,
  disabled = false,
}: PrivacyToggleProps) {
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load privacy setting on mount
  useEffect(() => {
    loadPrivacySetting();
  }, []);

  const loadPrivacySetting = async () => {
    try {
      const value = await AsyncStorage.getItem(PRIVACY_MODE_KEY);
      const anonymous = value === "true";
      setIsAnonymous(anonymous);
    } catch (error) {
      console.error("Failed to load privacy setting:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggle = async (value: boolean) => {
    try {
      setIsAnonymous(value);
      await AsyncStorage.setItem(PRIVACY_MODE_KEY, value.toString());
      onPrivacyChange?.(value);
    } catch (error) {
      console.error("Failed to save privacy setting:", error);
      // Revert on error
      setIsAnonymous(!value);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="small" />
      </View>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <View
        style={styles.content}
        accessible={true}
        accessibilityLabel={`Privacy Mode: ${isAnonymous ? "Anonymous" : "Public"}`}
        accessibilityHint={
          isAnonymous
            ? "Your name is hidden on the leaderboard. Toggle to make it visible."
            : "Your name is visible on the leaderboard. Toggle to hide it."
        }
      >
        <View style={styles.textContainer}>
          <ThemedText style={styles.label}>Privacy Mode</ThemedText>
          <ThemedText style={styles.description}>
            {isAnonymous
              ? "Your name is hidden on the leaderboard"
              : "Your name is visible on the leaderboard"}
          </ThemedText>
        </View>
        <Switch
          value={isAnonymous}
          onValueChange={handleToggle}
          disabled={disabled}
          trackColor={{ false: "#767577", true: "#81b0ff" }}
          thumbColor={isAnonymous ? "#4CAF50" : "#f4f3f4"}
          accessible={true}
          accessibilityLabel={`Privacy mode ${isAnonymous ? "enabled" : "disabled"}`}
          accessibilityRole="switch"
          accessibilityState={{
            checked: isAnonymous,
            disabled: disabled,
          }}
        />
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  textContainer: {
    flex: 1,
    marginRight: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    opacity: 0.7,
  },
});

// Helper function to get current privacy setting
export async function getPrivacySetting(): Promise<boolean> {
  try {
    const value = await AsyncStorage.getItem(PRIVACY_MODE_KEY);
    return value === "true";
  } catch (error) {
    console.error("Failed to get privacy setting:", error);
    return false;
  }
}

// Helper function to set privacy setting
export async function setPrivacySetting(isAnonymous: boolean): Promise<void> {
  try {
    await AsyncStorage.setItem(PRIVACY_MODE_KEY, isAnonymous.toString());
  } catch (error) {
    console.error("Failed to set privacy setting:", error);
    throw error;
  }
}
