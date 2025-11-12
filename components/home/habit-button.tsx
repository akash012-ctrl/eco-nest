import { ThemedText } from "@/components/themed-text";
import * as Haptics from "expo-haptics";
import { useEffect, useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { BurstAnimation } from "./burst-animation";

export type HabitType =
  | "recycle"
  | "bike"
  | "meatless"
  | "reusable"
  | "compost"
  | "water";

interface HabitButtonProps {
  type: HabitType;
  label: string;
  icon: string;
  color: string;
  onPress: () => void;
  disabled?: boolean;
  cappedOut?: boolean;
}

export function HabitButton({
  type,
  label,
  icon,
  color,
  onPress,
  disabled = false,
  cappedOut = false,
}: HabitButtonProps) {
  const [showBurst, setShowBurst] = useState(false);
  const [burstKey, setBurstKey] = useState(0);
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  useEffect(() => {
    if (disabled || cappedOut) {
      opacity.value = withTiming(0.5, { duration: 200 });
    } else {
      opacity.value = withTiming(1, { duration: 200 });
    }
  }, [disabled, cappedOut, opacity]);

  const handlePress = async () => {
    if (disabled || cappedOut) return;

    // Trigger haptic feedback at 50ms
    setTimeout(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }, 50);

    // Trigger burst animation
    setBurstKey((prev) => prev + 1);
    setShowBurst(true);

    // Scale animation
    scale.value = withSequence(
      withTiming(1.2, { duration: 100, easing: Easing.out(Easing.ease) }),
      withTiming(1, { duration: 150, easing: Easing.inOut(Easing.ease) })
    );

    // Call the onPress handler
    onPress();

    // Reset burst animation
    setTimeout(() => {
      setShowBurst(false);
    }, 350);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <View style={styles.wrapper}>
      <Animated.View style={animatedStyle}>
        <TouchableOpacity
          style={[
            styles.button,
            { backgroundColor: color },
            (disabled || cappedOut) && styles.disabled,
          ]}
          onPress={handlePress}
          activeOpacity={0.7}
          disabled={disabled || cappedOut}
        >
          <ThemedText style={styles.icon}>{icon}</ThemedText>
          <ThemedText style={styles.label}>{label}</ThemedText>
          {cappedOut && (
            <View style={styles.cappedBadge}>
              <ThemedText style={styles.cappedText}>Max</ThemedText>
            </View>
          )}
        </TouchableOpacity>
      </Animated.View>

      {showBurst && (
        <View style={styles.burstContainer}>
          <BurstAnimation key={burstKey} trigger={showBurst} color={color} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "relative",
  },
  button: {
    width: 100,
    height: 100,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    minWidth: 44,
    minHeight: 44,
  },
  disabled: {
    opacity: 0.5,
  },
  icon: {
    fontSize: 32,
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FFFFFF",
    textAlign: "center",
  },
  burstContainer: {
    ...StyleSheet.absoluteFillObject,
    pointerEvents: "none",
  },
  cappedBadge: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  cappedText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "700",
  },
});
