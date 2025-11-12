import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useThemeColor } from "@/hooks/use-theme-color";
import { getDatabase } from "@/services/database";
import { useEffect, useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import Svg, { Polyline } from "react-native-svg";

interface DayData {
  date: string;
  points: number;
}

export function SparklineChart() {
  const [data, setData] = useState<DayData[]>([]);
  const [expanded, setExpanded] = useState(false);
  const lineColor = "#34C759";
  const textColor = useThemeColor({}, "text");

  useEffect(() => {
    loadWeekData();
  }, []);

  const loadWeekData = async () => {
    try {
      const database = getDatabase();
      const weekData: DayData[] = [];

      // Get data for last 7 days
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);
        const dayStart = date.getTime();

        const nextDay = new Date(date);
        nextDay.setDate(nextDay.getDate() + 1);
        const dayEnd = nextDay.getTime();

        const result = await database.getFirstAsync<{ total: number }>(
          `SELECT COALESCE(SUM(json_extract(payload_json, '$.pointsAwarded')), 0) as total
           FROM habits_queue 
           WHERE created_at >= ? AND created_at < ?`,
          [dayStart, dayEnd]
        );

        weekData.push({
          date: date.toLocaleDateString("en-US", { weekday: "short" }),
          points: result?.total || 0,
        });
      }

      setData(weekData);
    } catch (error) {
      console.error("Failed to load week data:", error);
    }
  };

  const maxPoints = Math.max(...data.map((d) => d.points), 1);
  const chartWidth = 280;
  const chartHeight = 60;
  const padding = 10;

  // Generate SVG points for polyline
  const points = data
    .map((d, i) => {
      const x = padding + (i * (chartWidth - 2 * padding)) / (data.length - 1);
      const y =
        chartHeight -
        padding -
        (d.points / maxPoints) * (chartHeight - 2 * padding);
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <TouchableOpacity
      onPress={() => setExpanded(!expanded)}
      activeOpacity={0.7}
    >
      <ThemedView style={[styles.card, styles.shadow]}>
        <ThemedText type="subtitle" style={styles.title}>
          7-Day Activity
        </ThemedText>

        <View style={styles.chartContainer}>
          <Svg width={chartWidth} height={chartHeight}>
            <Polyline
              points={points}
              fill="none"
              stroke={lineColor}
              strokeWidth="2"
            />
          </Svg>
        </View>

        {expanded && (
          <ThemedView style={styles.detailsContainer}>
            {data.map((day, index) => (
              <ThemedView key={index} style={styles.dayRow}>
                <ThemedText style={styles.dayLabel}>{day.date}</ThemedText>
                <ThemedText style={styles.dayPoints}>
                  {day.points} pts
                </ThemedText>
              </ThemedView>
            ))}
          </ThemedView>
        )}

        <ThemedText style={styles.tapHint}>
          {expanded ? "Tap to collapse" : "Tap to expand"}
        </ThemedText>
      </ThemedView>
    </TouchableOpacity>
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
  chartContainer: {
    alignItems: "center",
    marginBottom: 12,
  },
  detailsContainer: {
    marginTop: 8,
    gap: 8,
  },
  dayRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  dayLabel: {
    fontSize: 14,
    opacity: 0.7,
  },
  dayPoints: {
    fontSize: 14,
    fontWeight: "600",
  },
  tapHint: {
    fontSize: 12,
    opacity: 0.5,
    textAlign: "center",
  },
});
