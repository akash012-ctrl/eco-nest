import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useThemeColor } from "@/hooks/use-theme-color";
import type { ConflictItem } from "@/services/sync-service";
import { syncService } from "@/services/sync-service";
import * as Haptics from "expo-haptics";
import { useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

interface ConflictListItemProps {
  conflict: ConflictItem;
  onResolved: () => void;
}

export function ConflictListItem({
  conflict,
  onResolved,
}: ConflictListItemProps) {
  const [isResolving, setIsResolving] = useState(false);

  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const accentColor = useThemeColor({}, "accent");
  const alertColor = useThemeColor({}, "alert");

  const handleResolve = async (resolution: "local" | "server") => {
    setIsResolving(true);

    // Light haptic feedback
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      // Haptics not supported, continue
    }

    try {
      await syncService.handleConflict(conflict.id, resolution);

      // Success haptic
      try {
        await Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Success
        );
      } catch (error) {
        // Haptics not supported, continue
      }

      // Notify parent that conflict is resolved
      onResolved();
    } catch (error) {
      console.error("Failed to resolve conflict:", error);

      // Error haptic
      try {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      } catch (hapticError) {
        // Haptics not supported, continue
      }
    } finally {
      setIsResolving(false);
    }
  };

  const formatHabitType = (habitType: string): string => {
    return habitType
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const formatTimestamp = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  return (
    <ThemedView
      style={[
        styles.container,
        { backgroundColor, borderColor: alertColor + "40" },
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <ThemedText style={[styles.title, { color: alertColor }]}>
          Conflict Detected
        </ThemedText>
        <ThemedText style={[styles.subtitle, { color: textColor }]}>
          {formatHabitType(conflict.localData.habitType)}
        </ThemedText>
      </View>

      {/* Data comparison */}
      <View style={styles.comparisonContainer}>
        {/* Local data */}
        <View style={styles.dataColumn}>
          <ThemedText style={[styles.dataLabel, { color: textColor }]}>
            Your Device
          </ThemedText>
          <View style={styles.dataContent}>
            <ThemedText style={[styles.dataValue, { color: textColor }]}>
              +{conflict.localData.pointsAwarded} points
            </ThemedText>
            <ThemedText style={[styles.dataTimestamp, { color: textColor }]}>
              {formatTimestamp(conflict.localData.loggedAt)}
            </ThemedText>
          </View>
        </View>

        {/* Divider */}
        <View style={[styles.divider, { backgroundColor: textColor }]} />

        {/* Server data */}
        <View style={styles.dataColumn}>
          <ThemedText style={[styles.dataLabel, { color: textColor }]}>
            Server
          </ThemedText>
          <View style={styles.dataContent}>
            <ThemedText style={[styles.dataValue, { color: textColor }]}>
              {conflict.serverData?.pointsAwarded
                ? `+${conflict.serverData.pointsAwarded} points`
                : "Different data"}
            </ThemedText>
            {conflict.serverData?.loggedAt && (
              <ThemedText style={[styles.dataTimestamp, { color: textColor }]}>
                {formatTimestamp(conflict.serverData.loggedAt)}
              </ThemedText>
            )}
          </View>
        </View>
      </View>

      {/* Action buttons */}
      <View style={styles.actionsContainer}>
        {/* Keep Local (default/primary) */}
        <TouchableOpacity
          style={[
            styles.primaryButton,
            { backgroundColor: accentColor },
            isResolving && styles.buttonDisabled,
          ]}
          onPress={() => handleResolve("local")}
          disabled={isResolving}
          activeOpacity={0.7}
        >
          {isResolving ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <ThemedText style={styles.primaryButtonText}>Keep Local</ThemedText>
          )}
        </TouchableOpacity>

        {/* Use Server (secondary) */}
        <TouchableOpacity
          style={[
            styles.secondaryButton,
            { borderColor: textColor + "40" },
            isResolving && styles.buttonDisabled,
          ]}
          onPress={() => handleResolve("server")}
          disabled={isResolving}
          activeOpacity={0.7}
        >
          <ThemedText
            style={[styles.secondaryButtonText, { color: textColor }]}
          >
            Use Server
          </ThemedText>
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    borderWidth: 2,
    padding: 16,
    gap: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    gap: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
  },
  subtitle: {
    fontSize: 14,
    fontWeight: "500",
    opacity: 0.8,
  },
  comparisonContainer: {
    flexDirection: "row",
    gap: 12,
    paddingVertical: 8,
  },
  dataColumn: {
    flex: 1,
    gap: 8,
  },
  dataLabel: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    opacity: 0.6,
  },
  dataContent: {
    gap: 4,
  },
  dataValue: {
    fontSize: 15,
    fontWeight: "600",
  },
  dataTimestamp: {
    fontSize: 12,
    opacity: 0.6,
  },
  divider: {
    width: 1,
    opacity: 0.2,
  },
  actionsContainer: {
    flexDirection: "row",
    gap: 12,
  },
  primaryButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    minHeight: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },
  secondaryButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1.5,
    minHeight: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: "600",
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});
