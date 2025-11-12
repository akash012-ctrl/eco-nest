import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { getCachedLeaderboard, getUserStats } from "@/services/database";
import { useEffect, useState } from "react";
import { StyleSheet } from "react-native";

interface Competitor {
  displayName: string;
  ecoPoints: number;
  rank: number;
  isUser: boolean;
}

export function ClosestCompetitors() {
  const [competitors, setCompetitors] = useState<Competitor[]>([]);

  useEffect(() => {
    loadCompetitors();
  }, []);

  const loadCompetitors = async () => {
    try {
      const userStats = await getUserStats();
      const userRank = userStats.current_rank;

      if (!userRank) {
        return;
      }

      const leaderboard = await getCachedLeaderboard();

      // Find user's position
      const userIndex = leaderboard.findIndex(
        (entry) => entry.rank === userRank
      );

      if (userIndex === -1) {
        return;
      }

      // Get 1 above and 2 below (or adjust if at edges)
      const start = Math.max(0, userIndex - 1);
      const end = Math.min(leaderboard.length, userIndex + 3);

      const closest = leaderboard.slice(start, end).map((entry) => ({
        displayName: entry.display_name,
        ecoPoints: entry.eco_points,
        rank: entry.rank,
        isUser: entry.rank === userRank,
      }));

      setCompetitors(closest);
    } catch (error) {
      console.error("Failed to load competitors:", error);
    }
  };

  if (competitors.length === 0) {
    return null;
  }

  return (
    <ThemedView style={[styles.card, styles.shadow]}>
      <ThemedText type="subtitle" style={styles.title}>
        You vs. 3 Closest
      </ThemedText>

      <ThemedView style={styles.list}>
        {competitors.map((competitor, index) => (
          <ThemedView
            key={index}
            style={[styles.competitorRow, competitor.isUser && styles.userRow]}
          >
            <ThemedView style={styles.leftSection}>
              <ThemedText style={styles.rank}>#{competitor.rank}</ThemedText>
              <ThemedText
                style={[styles.name, competitor.isUser && styles.userName]}
                numberOfLines={1}
              >
                {competitor.displayName}
              </ThemedText>
            </ThemedView>
            <ThemedText
              style={[styles.points, competitor.isUser && styles.userPoints]}
            >
              {competitor.ecoPoints}
            </ThemedText>
          </ThemedView>
        ))}
      </ThemedView>
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
  title: {
    marginBottom: 16,
  },
  list: {
    gap: 12,
  },
  competitorRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: "rgba(0, 0, 0, 0.02)",
  },
  userRow: {
    backgroundColor: "#34C759",
  },
  leftSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  rank: {
    fontSize: 14,
    fontWeight: "600",
    opacity: 0.6,
    minWidth: 32,
  },
  name: {
    fontSize: 16,
    fontWeight: "500",
    flex: 1,
  },
  userName: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  points: {
    fontSize: 16,
    fontWeight: "700",
    color: "#34C759",
  },
  userPoints: {
    color: "#FFFFFF",
  },
});
