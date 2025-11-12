import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useThemeColor } from "@/hooks/use-theme-color";
import type { ConflictItem } from "@/services/sync-service";
import { StyleSheet, View } from "react-native";
import { ConflictListItem } from "./conflict-list-item";

interface ConflictListProps {
  conflicts: ConflictItem[];
  onConflictResolved: () => void;
}

export function ConflictList({
  conflicts,
  onConflictResolved,
}: ConflictListProps) {
  const textColor = useThemeColor({}, "text");
  const alertColor = useThemeColor({}, "alert");

  if (conflicts.length === 0) {
    return null;
  }

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <ThemedText style={[styles.headerTitle, { color: alertColor }]}>
          {conflicts.length} {conflicts.length === 1 ? "Conflict" : "Conflicts"}{" "}
          Found
        </ThemedText>
        <ThemedText style={[styles.headerSubtitle, { color: textColor }]}>
          Choose which version to keep for each item
        </ThemedText>
      </View>

      {/* Conflict items */}
      <View style={styles.conflictsList}>
        {conflicts.map((conflict) => (
          <ConflictListItem
            key={conflict.id}
            conflict={conflict}
            onResolved={onConflictResolved}
          />
        ))}
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 16,
  },
  header: {
    gap: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  headerSubtitle: {
    fontSize: 14,
    opacity: 0.7,
  },
  conflictsList: {
    gap: 12,
  },
});
