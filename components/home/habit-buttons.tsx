import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { habitService } from "@/services/habit-service";
import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { HabitButton, type HabitType } from "./habit-button";

interface HabitButtonsProps {
  onHabitPress: (habitType: HabitType) => void;
}

interface HabitConfig {
  type: HabitType;
  label: string;
  icon: string;
  color: string;
}

const HABITS: HabitConfig[] = [
  { type: "recycle", label: "Recycle", icon: "♻️", color: "#34C759" },
  { type: "bike", label: "Bike", icon: "🚴", color: "#007AFF" },
  { type: "meatless", label: "Meatless", icon: "🥗", color: "#FF9500" },
  { type: "reusable", label: "Reusable", icon: "🛍️", color: "#5856D6" },
  { type: "compost", label: "Compost", icon: "🌱", color: "#32ADE6" },
  { type: "water", label: "Save Water", icon: "💧", color: "#30B0C7" },
];

export function HabitButtons({ onHabitPress }: HabitButtonsProps) {
  const [cappedHabits, setCappedHabits] = useState<Set<HabitType>>(new Set());
  const [debouncing, setDebouncing] = useState<Set<HabitType>>(new Set());

  // Check which habits are capped out
  useEffect(() => {
    const checkCaps = async () => {
      const capped = new Set<HabitType>();
      for (const habit of HABITS) {
        const canLog = await habitService.canLogHabit(habit.type);
        if (!canLog) {
          capped.add(habit.type);
        }
      }
      setCappedHabits(capped);
    };

    checkCaps();
  }, []);

  const handlePress = async (habitType: HabitType) => {
    // Add debounce
    setDebouncing((prev) => new Set(prev).add(habitType));

    // Call parent handler
    await onHabitPress(habitType);

    // Check if now capped
    const canLog = await habitService.canLogHabit(habitType);
    if (!canLog) {
      setCappedHabits((prev) => new Set(prev).add(habitType));
    }

    // Remove debounce after 300ms
    setTimeout(() => {
      setDebouncing((prev) => {
        const next = new Set(prev);
        next.delete(habitType);
        return next;
      });
    }, 300);
  };

  return (
    <ThemedView style={[styles.card, styles.shadow]}>
      <ThemedText type="subtitle" style={styles.title}>
        Quick Log
      </ThemedText>

      <View style={styles.grid}>
        {HABITS.map((habit) => (
          <HabitButton
            key={habit.type}
            type={habit.type}
            label={habit.label}
            icon={habit.icon}
            color={habit.color}
            onPress={() => handlePress(habit.type)}
            disabled={debouncing.has(habit.type)}
            cappedOut={cappedHabits.has(habit.type)}
          />
        ))}
      </View>

      {cappedHabits.size > 0 && (
        <ThemedText style={styles.cappedMessage}>
          Today max reached for some habits
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
  title: {
    marginBottom: 16,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  cappedMessage: {
    marginTop: 12,
    fontSize: 12,
    opacity: 0.6,
    textAlign: "center",
  },
});
