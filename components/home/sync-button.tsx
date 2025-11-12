import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useThemeColor } from "@/hooks/use-theme-color";
import { syncService } from "@/services/sync-service";
import * as Haptics from "expo-haptics";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { UnsyncedBadge } from "./unsynced-badge";

import type { ConflictItem } from "@/services/sync-service";

interface SyncButtonProps {
  onSyncComplete?: (uploaded: number, conflicts: ConflictItem[]) => void;
  refreshKey?: number;
}

export function SyncButton({ onSyncComplete, refreshKey }: SyncButtonProps) {
  const [unsyncedCount, setUnsyncedCount] = useState(0);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const accentColor = useThemeColor({}, "accent");

  // Load initial data and refresh when refreshKey changes
  useEffect(() => {
    loadSyncData();
  }, [refreshKey]);

  // Cooldown timer
  useEffect(() => {
    if (cooldownSeconds > 0) {
      const timer = setTimeout(() => {
        setCooldownSeconds((prev) => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldownSeconds]);

  const loadSyncData = async () => {
    try {
      const count = await syncService.getUnsyncedCount();
      const lastSync = await syncService.getLastSyncTimestamp();
      setUnsyncedCount(count);
      setLastSyncTime(lastSync);
    } catch (error) {
      console.error("Failed to load sync data:", error);
    }
  };

  const handleSync = async () => {
    // Check cooldown
    if (syncService.isOnCooldown()) {
      const remaining = syncService.getRemainingCooldown();
      setCooldownSeconds(remaining);
      return;
    }

    // Clear any previous errors
    setErrorMessage(null);
    setIsSyncing(true);

    // Light impact haptic
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      // Haptics not supported, continue
    }

    try {
      const result = await syncService.syncPendingItems();

      // Success haptic
      try {
        await Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Success
        );
      } catch (error) {
        // Haptics not supported, continue
      }

      // Update UI
      await loadSyncData();
      setCooldownSeconds(5);

      // Notify parent with result details
      if (onSyncComplete) {
        onSyncComplete(result.uploaded, result.conflicts);
      }
    } catch (error) {
      // Error haptic
      try {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      } catch (hapticError) {
        // Haptics not supported, continue
      }

      const message = error instanceof Error ? error.message : "Failed to sync";
      setErrorMessage(message);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleRetry = () => {
    setErrorMessage(null);
    handleSync();
  };

  const formatLastSync = (date: Date | null): string => {
    if (!date) return "Never synced";

    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "Just now";
    if (diffMins === 1) return "1 minute ago";
    if (diffMins < 60) return `${diffMins} minutes ago`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours === 1) return "1 hour ago";
    if (diffHours < 24) return `${diffHours} hours ago`;

    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return "1 day ago";
    return `${diffDays} days ago`;
  };

  const isDisabled = isSyncing || cooldownSeconds > 0 || unsyncedCount === 0;

  return (
    <ThemedView style={[styles.container, { backgroundColor }]}>
      <View style={styles.content}>
        {/* Last sync timestamp */}
        <View style={styles.infoRow}>
          <ThemedText style={[styles.label, { color: textColor }]}>
            Last synced:
          </ThemedText>
          <ThemedText style={[styles.timestamp, { color: textColor }]}>
            {formatLastSync(lastSyncTime)}
          </ThemedText>
        </View>

        {/* Sync button with badge */}
        <TouchableOpacity
          style={[
            styles.button,
            { backgroundColor: accentColor },
            isDisabled && styles.buttonDisabled,
          ]}
          onPress={handleSync}
          disabled={isDisabled}
          activeOpacity={0.7}
        >
          <View style={styles.buttonContent}>
            {isSyncing ? (
              <>
                <ActivityIndicator color="#FFFFFF" size="small" />
                <ThemedText style={styles.buttonText}>
                  Syncing {unsyncedCount} items...
                </ThemedText>
              </>
            ) : cooldownSeconds > 0 ? (
              <ThemedText style={styles.buttonText}>
                Wait {cooldownSeconds}s
              </ThemedText>
            ) : (
              <>
                <ThemedText style={styles.buttonText}>Sync</ThemedText>
                {unsyncedCount > 0 && <UnsyncedBadge count={unsyncedCount} />}
              </>
            )}
          </View>
        </TouchableOpacity>

        {/* Error message with retry */}
        {errorMessage && (
          <View style={styles.errorContainer}>
            <ThemedText style={styles.errorText}>{errorMessage}</ThemedText>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={handleRetry}
              activeOpacity={0.7}
            >
              <ThemedText style={[styles.retryText, { color: accentColor }]}>
                Retry
              </ThemedText>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: "rgba(0, 0, 0, 0.1)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  content: {
    gap: 12,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  label: {
    fontSize: 13,
    opacity: 0.6,
  },
  timestamp: {
    fontSize: 13,
    fontWeight: "500",
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    minHeight: 48,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  errorContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "rgba(255, 59, 48, 0.1)",
    borderRadius: 8,
  },
  errorText: {
    flex: 1,
    fontSize: 13,
    color: "#FF3B30",
  },
  retryButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    minWidth: 44,
    minHeight: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  retryText: {
    fontSize: 14,
    fontWeight: "600",
  },
});
