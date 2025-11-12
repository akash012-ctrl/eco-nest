import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useNetworkStatus } from "@/hooks/use-network-status";
import { StyleSheet } from "react-native";

/**
 * Offline indicator component
 * Displays a banner when the device is offline
 */
export function OfflineIndicator() {
  const { isOnline, isChecking } = useNetworkStatus();

  // Don't show anything while checking or if online
  if (isChecking || isOnline) {
    return null;
  }

  return (
    <ThemedView
      style={styles.container}
      lightColor="#FFF3CD"
      darkColor="#664D03"
    >
      <ThemedText style={styles.text} lightColor="#856404" darkColor="#FFECB5">
        📡 Offline — changes saved locally
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    fontSize: 14,
    fontWeight: "500",
  },
});
