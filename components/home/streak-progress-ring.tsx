import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useThemeColor } from "@/hooks/use-theme-color";
import { getStreakData } from "@/services/database";
import type { HabitType } from "@/services/habit-service";
import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import Svg, { Circle } from "react-native-svg";

interface StreakProgressRingProps {
  habitType: HabitType;
  size?: number;
  strokeWidth?: number;
}

interface StreakMilestone {
  days: number;
  bonus: number;
  label: string;
}

const STREAK_MILESTONES: StreakMilestone[] = [
  { days: 3, bonus: 5, label: "3-day" },
  { days: 7, bonus: 10, label: "7-day" },
  { days: 14, bonus: 20, label: "14-day" },
];

export function StreakProgressRing({
  habitType,
  size = 120,
  strokeWidth = 8,
}: StreakProgressRingProps) {
  const [currentStreak, setCurrentStreak] = useState(0);
  const accentColor = useThemeColor({}, "accent");
  const textColor = useThemeColor({}, "text");
  const backgroundColor = useThemeColor({}, "background");

  useEffect(() => {
    loadStreakData();
  }, [habitType]);

  const loadStreakData = async () => {
    try {
      const streakData = await getStreakData(habitType);
      setCurrentStreak(streakData?.current_streak || 0);
    } catch (error) {
      console.error("Failed to load streak data:", error);
    }
  };

  // Calculate progress to next milestone
  const getNextMilestone = (): StreakMilestone | null => {
    for (const milestone of STREAK_MILESTONES) {
      if (currentStreak < milestone.days) {
        return milestone;
      }
    }
    return null;
  };

  const getCurrentMilestone = (): StreakMilestone | null => {
    let current: StreakMilestone | null = null;
    for (const milestone of STREAK_MILESTONES) {
      if (currentStreak >= milestone.days) {
        current = milestone;
      }
    }
    return current;
  };

  const nextMilestone = getNextMilestone();
  const currentMilestone = getCurrentMilestone();

  // Calculate progress percentage
  let progress = 0;
  let progressStart = 0;
  let progressEnd = STREAK_MILESTONES[0].days;

  if (nextMilestone) {
    // Find the previous milestone or start from 0
    const milestoneIndex = STREAK_MILESTONES.indexOf(nextMilestone);
    progressStart =
      milestoneIndex > 0 ? STREAK_MILESTONES[milestoneIndex - 1].days : 0;
    progressEnd = nextMilestone.days;
    progress =
      ((currentStreak - progressStart) / (progressEnd - progressStart)) * 100;
  } else {
    // Reached max milestone
    progress = 100;
  }

  // SVG circle calculations
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.ringContainer, { width: size, height: size }]}>
        <Svg width={size} height={size}>
          {/* Background circle */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#E5E5EA"
            strokeWidth={strokeWidth}
            fill="none"
          />
          {/* Progress circle */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={accentColor}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        </Svg>

        {/* Center content */}
        <View style={styles.centerContent}>
          <ThemedText style={styles.streakNumber}>{currentStreak}</ThemedText>
          <ThemedText style={styles.streakLabel}>day streak</ThemedText>
        </View>
      </View>

      {/* Milestone indicators */}
      <View style={styles.milestonesContainer}>
        {STREAK_MILESTONES.map((milestone) => {
          const isAchieved = currentStreak >= milestone.days;
          const isCurrent = currentMilestone?.days === milestone.days;

          return (
            <View
              key={milestone.days}
              style={[
                styles.milestone,
                isAchieved && styles.milestoneAchieved,
                isCurrent && styles.milestoneCurrent,
              ]}
              accessible={true}
              accessibilityLabel={`${milestone.label} streak milestone, ${milestone.bonus} bonus points${isAchieved ? ", achieved" : ""}`}
              accessibilityRole="text"
            >
              <ThemedText
                style={[
                  styles.milestoneText,
                  isAchieved && styles.milestoneTextAchieved,
                ]}
              >
                {milestone.label}
              </ThemedText>
              <ThemedText
                style={[
                  styles.bonusText,
                  isAchieved && styles.bonusTextAchieved,
                ]}
              >
                +{milestone.bonus}
              </ThemedText>
            </View>
          );
        })}
      </View>

      {/* Progress message */}
      {nextMilestone && (
        <ThemedText style={styles.progressMessage}>
          {progressEnd - currentStreak} more{" "}
          {progressEnd - currentStreak === 1 ? "day" : "days"} to +
          {nextMilestone.bonus} bonus
        </ThemedText>
      )}
      {!nextMilestone &&
        currentStreak >=
          STREAK_MILESTONES[STREAK_MILESTONES.length - 1].days && (
          <ThemedText style={styles.progressMessage}>
            🎉 Max streak bonus unlocked!
          </ThemedText>
        )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingVertical: 16,
  },
  ringContainer: {
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  centerContent: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
  },
  streakNumber: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#34C759",
  },
  streakLabel: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 4,
  },
  milestonesContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  milestone: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: "#F2F2F7",
    borderWidth: 2,
    borderColor: "transparent",
    minWidth: 70,
    alignItems: "center",
  },
  milestoneAchieved: {
    backgroundColor: "#E8F5E9",
    borderColor: "#34C759",
  },
  milestoneCurrent: {
    borderColor: "#34C759",
    borderWidth: 2,
  },
  milestoneText: {
    fontSize: 12,
    fontWeight: "600",
    opacity: 0.6,
  },
  milestoneTextAchieved: {
    opacity: 1,
    color: "#34C759",
  },
  bonusText: {
    fontSize: 14,
    fontWeight: "700",
    marginTop: 2,
    opacity: 0.6,
  },
  bonusTextAchieved: {
    opacity: 1,
    color: "#34C759",
  },
  progressMessage: {
    fontSize: 14,
    opacity: 0.7,
    textAlign: "center",
  },
});
