import { ThemedText } from "@/components/themed-text";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { BorderRadius, Shadows, Spacing } from "@/constants/theme";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useEffect, useMemo } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from "react-native-reanimated";

interface ToastProps {
  message: string;
  visible: boolean;
  onDismiss: () => void;
  duration?: number;
  pointsAwarded?: number;
}

export function Toast({
  message,
  visible,
  onDismiss,
  duration = 2000,
  pointsAwarded,
}: ToastProps) {
  const translateY = useSharedValue(-100);
  const opacity = useSharedValue(0);
  const accentColor = useThemeColor({}, "accent");

  // Parse message to check if it contains points
  const messageInfo = useMemo(() => {
    const pointsMatch = message.match(/Logged \+(\d+) EcoPoints/);
    if (pointsMatch && pointsAwarded !== undefined) {
      return {
        hasPoints: true,
        points: pointsAwarded,
        prefix: "Logged +",
        suffix: " EcoPoints",
      };
    }
    return { hasPoints: false };
  }, [message, pointsAwarded]);

  useEffect(() => {
    if (visible) {
      // Slide in from top
      translateY.value = withTiming(0, {
        duration: 300,
        easing: Easing.out(Easing.ease),
      });
      opacity.value = withTiming(1, { duration: 200 });

      // Auto-dismiss after duration
      translateY.value = withSequence(
        withDelay(
          duration,
          withTiming(-100, {
            duration: 300,
            easing: Easing.in(Easing.ease),
          })
        )
      );
      opacity.value = withSequence(
        withDelay(duration, withTiming(0, { duration: 200 }))
      );

      // Call onDismiss after animation completes
      setTimeout(onDismiss, duration + 200);
    }
  }, [visible, duration, translateY, opacity, onDismiss]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        { backgroundColor: accentColor },
        animatedStyle,
      ]}
    >
      {messageInfo.hasPoints ? (
        <View style={styles.textContainer}>
          <ThemedText type="label" style={styles.text}>
            {messageInfo.prefix}
          </ThemedText>
          <AnimatedCounter
            value={messageInfo.points ?? 0}
            style={styles.text}
            duration={400}
          />
          <ThemedText type="label" style={styles.text}>
            {messageInfo.suffix}
          </ThemedText>
        </View>
      ) : (
        <ThemedText type="label" style={styles.text}>
          {message}
        </ThemedText>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 60,
    left: Spacing.screenPadding,
    right: Spacing.screenPadding,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.button,
    ...Shadows.cardElevated,
    zIndex: 1000,
  },
  textContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    color: "#FFFFFF",
    textAlign: "center",
  },
});
