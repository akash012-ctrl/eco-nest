import { ThemedText } from "@/components/themed-text";
import { useEffect } from "react";
import { StyleSheet } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from "react-native-reanimated";

interface UnsyncedBadgeProps {
  count: number;
}

export function UnsyncedBadge({ count }: UnsyncedBadgeProps) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(count > 0 ? 1 : 0);

  useEffect(() => {
    if (count > 0) {
      // Animate badge appearance and scale
      opacity.value = withTiming(1, { duration: 200 });
      scale.value = withSequence(
        withTiming(1.3, { duration: 100, easing: Easing.out(Easing.ease) }),
        withTiming(1, { duration: 200, easing: Easing.inOut(Easing.ease) })
      );
    } else {
      // Fade out when count is 0
      opacity.value = withTiming(0, { duration: 200 });
    }
  }, [count, scale, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  if (count === 0) return null;

  return (
    <Animated.View style={[styles.badge, animatedStyle]}>
      <ThemedText style={styles.text}>{count}</ThemedText>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  badge: {
    backgroundColor: "#FF3B30",
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    paddingHorizontal: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
});
