import { ThemedText } from "@/components/themed-text";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { Card } from "@/components/ui/card";
import { BorderRadius, Spacing, Typography } from "@/constants/theme";
import { useThemeColor } from "@/hooks/use-theme-color";
import { getUserStats } from "@/services/database";
import { memo, useCallback, useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";

export const EcoPointsCard = memo(function EcoPointsCard() {
  const [ecoPoints, setEcoPoints] = useState(0);
  const [rank, setRank] = useState<number | null>(null);
  const accentColor = useThemeColor({}, "accent");

  const loadStats = useCallback(async () => {
    try {
      const stats = await getUserStats();
      setEcoPoints(stats.total_eco_points);
      setRank(stats.current_rank || null);
    } catch (error) {
      console.error("Failed to load user stats:", error);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <ThemedText type="h4">EcoPoints</ThemedText>
        {rank && (
          <View style={[styles.rankBadge, { backgroundColor: accentColor }]}>
            <ThemedText style={styles.rankText}>#{rank}</ThemedText>
          </View>
        )}
      </View>

      <View style={styles.pointsContainer}>
        <AnimatedCounter
          value={ecoPoints}
          style={StyleSheet.flatten([styles.points, { color: accentColor }])}
        />
        <ThemedText
          type="bodyLarge"
          variant="secondary"
          style={styles.pointsLabel}
        >
          points
        </ThemedText>
      </View>

      {rank && (
        <ThemedText type="bodySmall" variant="secondary">
          {`You're ranked #${rank} globally`}
        </ThemedText>
      )}
    </Card>
  );
});

const styles = StyleSheet.create({
  card: {
    marginHorizontal: Spacing.screenPadding,
    marginBottom: Spacing.md,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  rankBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.md,
  },
  rankText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
    color: "#FFFFFF",
  },
  pointsContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  points: {
    fontSize: Typography.fontSize["5xl"],
    fontWeight: Typography.fontWeight.bold,
  },
  pointsLabel: {
    // Inherits from bodyLarge type
  },
});
