import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useThemeColor } from "@/hooks/use-theme-color";
import { getUserStats } from "@/services/database";
import { useEffect, useState } from "react";
import { StyleSheet } from "react-native";

export function EcoPointsCard() {
  const [ecoPoints, setEcoPoints] = useState(0);
  const [rank, setRank] = useState<number | null>(null);
  const cardBg = useThemeColor({}, "background");
  const accentColor = "#34C759"; // Green accent for eco theme

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const stats = await getUserStats();
      setEcoPoints(stats.total_eco_points);
      setRank(stats.current_rank || null);
    } catch (error) {
      console.error("Failed to load user stats:", error);
    }
  };

  return (
    <ThemedView style={[styles.card, styles.shadow]}>
      <ThemedView style={styles.header}>
        <ThemedText type="subtitle">EcoPoints</ThemedText>
        {rank && (
          <ThemedView style={styles.rankBadge}>
            <ThemedText style={styles.rankText}>#{rank}</ThemedText>
          </ThemedView>
        )}
      </ThemedView>

      <ThemedView style={styles.pointsContainer}>
        <ThemedText style={styles.points}>{ecoPoints}</ThemedText>
        <ThemedText style={styles.pointsLabel}>points</ThemedText>
      </ThemedView>

      {rank && (
        <ThemedText style={styles.rankPreview}>
          You're ranked #{rank} globally
        </ThemedText>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 20,
    borderRadius: 16,
  },
  shadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  rankBadge: {
    backgroundColor: "#34C759",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  rankText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  pointsContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 8,
    marginBottom: 8,
  },
  points: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#34C759",
  },
  pointsLabel: {
    fontSize: 18,
    opacity: 0.6,
  },
  rankPreview: {
    fontSize: 14,
    opacity: 0.7,
  },
});
