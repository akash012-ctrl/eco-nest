import { ThemedText } from "@/components/themed-text";
import { BorderRadius, Shadows, Spacing, Typography } from "@/constants/theme";
import { useReducedMotion } from "@/contexts/reduced-motion-context";
import { triggerHaptic } from "@/utils/haptics";
import * as Haptics from "expo-haptics";
import { memo, useCallback, useEffect, useState } from "react";
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

export const HabitButton = memo(function HabitButton({
  label,
  icon,
  color,
  onPress,
  disabled = false,
  cappedOut = false,
}: HabitButtonProps) {
  const { reducedMotion } = useReducedMotion();
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

  const handlePress = useCallback(async () => {
    if (disabled || cappedOut) return;

    // Trigger haptic feedback at 50ms with graceful fallback
    setTimeout(() => {
      triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
    }, 50);

    // Trigger burst animation only if reduced motion is disabled
    if (!reducedMotion) {
      setBurstKey((prev) => prev + 1);
      setShowBurst(true);

      // Scale animation
      scale.value = withSequence(
        withTiming(1.2, { duration: 100, easing: Easing.out(Easing.ease) }),
        withTiming(1, { duration: 150, easing: Easing.inOut(Easing.ease) })
      );

      // Reset burst animation
      setTimeout(() => {
        setShowBurst(false);
      }, 350);
    }

    // Call the onPress handler
    onPress();
  }, [disabled, cappedOut, reducedMotion, onPress, scale]);

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
          accessible={true}
          accessibilityLabel={`Log ${label} habit`}
          accessibilityHint={
            cappedOut
              ? "Daily maximum reached for this habit"
              : disabled
                ? "This habit is currently unavailable"
                : `Tap to log ${label} and earn EcoPoints`
          }
          accessibilityRole="button"
          accessibilityState={{
            disabled: disabled || cappedOut,
          }}
        >
          <ThemedText style={styles.icon}>{icon}</ThemedText>
          <ThemedText style={styles.label}>{label}</ThemedText>
          {cappedOut && (
            <View
              style={styles.cappedBadge}
              accessible={true}
              accessibilityLabel="Maximum reached"
            >
              <ThemedText style={styles.cappedText}>Max</ThemedText>
            </View>
          )}
        </TouchableOpacity>
      </Animated.View>

      {showBurst && (
        <View style={styles.burstContainer} accessibilityElementsHidden={true}>
          <BurstAnimation key={burstKey} trigger={showBurst} color={color} />
        </View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  wrapper: {
    position: "relative",
  },
  button: {
    width: 100,
    height: 100,
    borderRadius: BorderRadius.xl,
    justifyContent: "center",
    alignItems: "center",
    gap: Spacing.sm,
    minWidth: 44,
    minHeight: 44,
    ...Shadows.button,
  },
  disabled: {
    opacity: 0.5,
  },
  icon: {
    fontSize: 32,
  },
  label: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.semibold,
    color: "#FFFFFF",
    textAlign: "center",
  },
  burstContainer: {
    ...StyleSheet.absoluteFillObject,
    pointerEvents: "none",
  },
  cappedBadge: {
    position: "absolute",
    top: Spacing.xs,
    right: Spacing.xs,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    paddingHorizontal: Spacing.xs + 2,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  cappedText: {
    color: "#FFFFFF",
    fontSize: Typography.fontSize.xs - 2,
    fontWeight: Typography.fontWeight.bold,
  },
});
