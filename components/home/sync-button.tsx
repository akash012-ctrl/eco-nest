import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { BorderRadius, Microcopy, Shadows, Spacing } from "@/constants/theme";
import { useThemeColor } from "@/hooks/use-theme-color";
import { syncService } from "@/services/sync-service";
import { triggerHaptic } from "@/utils/haptics";
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

    // Light impact haptic with graceful fallback
    await triggerHaptic(Haptics.ImpactFeedbackStyle.Light);

    try {
      const result = await syncService.syncPendingItems();

      // Success haptic with graceful fallback
      await triggerHaptic(Haptics.NotificationFeedbackType.Success);

      // Update UI
      await loadSyncData();
      setCooldownSeconds(5);

      // Notify parent with result details
      if (onSyncComplete) {
        onSyncComplete(result.uploaded, result.conflicts);
      }
    } catch (error) {
      // Error haptic with graceful fallback
      await triggerHaptic(Haptics.NotificationFeedbackType.Error);

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
    if (diffMins === 1) return "1 min ago";
    if (diffMins < 60) return `${diffMins} mins ago`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours === 1) return "1 hr ago";
    if (diffHours < 24) return `${diffHours} hrs ago`;

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
          <ThemedText type="caption" variant="secondary">
            Last synced:
          </ThemedText>
          <ThemedText type="caption" variant="primary">
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
          accessible={true}
          accessibilityLabel={
            isSyncing
              ? `${Microcopy.loading.syncing} ${unsyncedCount} items`
              : cooldownSeconds > 0
                ? `Sync button on cooldown, wait ${cooldownSeconds} seconds`
                : unsyncedCount > 0
                  ? `${Microcopy.actions.sync} ${unsyncedCount} unsynced items`
                  : "Sync - no items to sync"
          }
          accessibilityHint={
            isDisabled
              ? undefined
              : "Tap to synchronize your local data with the server"
          }
          accessibilityRole="button"
          accessibilityState={{
            disabled: isDisabled,
            busy: isSyncing,
          }}
        >
          <View style={styles.buttonContent}>
            {isSyncing ? (
              <>
                <ActivityIndicator
                  color="#FFFFFF"
                  size="small"
                  accessibilityElementsHidden={true}
                />
                <ThemedText type="button" style={styles.buttonText}>
                  {Microcopy.loading.syncing} {unsyncedCount} items...
                </ThemedText>
              </>
            ) : cooldownSeconds > 0 ? (
              <ThemedText type="button" style={styles.buttonText}>
                Wait {cooldownSeconds}s
              </ThemedText>
            ) : (
              <>
                <ThemedText type="button" style={styles.buttonText}>
                  {Microcopy.actions.sync}
                </ThemedText>
                {unsyncedCount > 0 && <UnsyncedBadge count={unsyncedCount} />}
              </>
            )}
          </View>
        </TouchableOpacity>

        {/* Error message with retry */}
        {errorMessage && (
          <View
            style={styles.errorContainer}
            accessible={true}
            accessibilityLabel={`Sync error: ${errorMessage}`}
            accessibilityRole="alert"
          >
            <ThemedText type="bodySmall" style={styles.errorText}>
              {errorMessage}
            </ThemedText>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={handleRetry}
              activeOpacity={0.7}
              accessible={true}
              accessibilityLabel={Microcopy.actions.retry}
              accessibilityHint="Tap to retry synchronization"
              accessibilityRole="button"
            >
              <ThemedText
                type="label"
                style={[styles.retryText, { color: accentColor }]}
              >
                {Microcopy.actions.retry}
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
    paddingHorizontal: Spacing.screenPadding,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.screenPadding,
    borderTopWidth: 1,
    borderTopColor: "rgba(0, 0, 0, 0.1)",
    ...Shadows.cardElevated,
  },
  content: {
    gap: Spacing.md,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  button: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.button,
    minHeight: 48,
    justifyContent: "center",
    alignItems: "center",
    ...Shadows.button,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  buttonText: {
    color: "#FFFFFF",
  },
  errorContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    backgroundColor: "rgba(255, 59, 48, 0.1)",
    borderRadius: BorderRadius.sm,
  },
  errorText: {
    flex: 1,
    color: "#FF3B30",
  },
  retryButton: {
    paddingVertical: Spacing.xs + 2,
    paddingHorizontal: Spacing.md,
    minWidth: 44,
    minHeight: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  retryText: {
    // Color applied inline
  },
});
