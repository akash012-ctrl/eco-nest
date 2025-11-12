import { ThemedText } from "@/components/themed-text";
import { Card } from "@/components/ui/card";
import { Spacing } from "@/constants/theme";
import { useThemeColor } from "@/hooks/use-theme-color";
import { getDatabase } from "@/services/database";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import Svg, { Polyline } from "react-native-svg";

interface DayData {
  date: string;
  points: number;
}

export const SparklineChart = memo(function SparklineChart() {
  const [data, setData] = useState<DayData[]>([]);
  const [expanded, setExpanded] = useState(false);
  const lineColor = useThemeColor({}, "accent");

  const loadWeekData = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    loadWeekData();
  }, [loadWeekData]);

  const chartDimensions = useMemo(
    () => ({
      maxPoints: Math.max(...data.map((d) => d.points), 1),
      chartWidth: 280,
      chartHeight: 60,
      padding: 10,
    }),
    [data]
  );

  // Generate SVG points for polyline
  const points = useMemo(() => {
    if (data.length === 0) return "";

    return data
      .map((d, i) => {
        const x =
          chartDimensions.padding +
          (i * (chartDimensions.chartWidth - 2 * chartDimensions.padding)) /
            (data.length - 1);
        const y =
          chartDimensions.chartHeight -
          chartDimensions.padding -
          (d.points / chartDimensions.maxPoints) *
            (chartDimensions.chartHeight - 2 * chartDimensions.padding);
        return `${x},${y}`;
      })
      .join(" ");
  }, [data, chartDimensions]);

  const toggleExpanded = useCallback(() => {
    setExpanded((prev) => !prev);
  }, []);

  return (
    <TouchableOpacity onPress={toggleExpanded} activeOpacity={0.7}>
      <Card style={styles.card}>
        <ThemedText type="h4" style={styles.title}>
          7-Day Activity
        </ThemedText>

        <View style={styles.chartContainer}>
          <Svg
            width={chartDimensions.chartWidth}
            height={chartDimensions.chartHeight}
          >
            <Polyline
              points={points}
              fill="none"
              stroke={lineColor}
              strokeWidth="2"
            />
          </Svg>
        </View>

        {expanded && (
          <View style={styles.detailsContainer}>
            {data.map((day, index) => (
              <View key={index} style={styles.dayRow}>
                <ThemedText type="bodySmall" variant="secondary">
                  {day.date}
                </ThemedText>
                <ThemedText type="label">{day.points} pts</ThemedText>
              </View>
            ))}
          </View>
        )}

        <ThemedText type="caption" variant="tertiary" style={styles.tapHint}>
          {expanded ? "Tap to collapse" : "Tap to expand"}
        </ThemedText>
      </Card>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  card: {
    marginHorizontal: Spacing.screenPadding,
    marginBottom: Spacing.md,
  },
  title: {
    marginBottom: Spacing.md,
  },
  chartContainer: {
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  detailsContainer: {
    marginTop: Spacing.sm,
    gap: Spacing.sm,
  },
  dayRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: Spacing.xs,
  },
  tapHint: {
    textAlign: "center",
  },
});
