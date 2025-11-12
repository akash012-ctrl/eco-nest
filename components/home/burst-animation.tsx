import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from "react-native-reanimated";

interface BurstAnimationProps {
  trigger: boolean;
  color?: string;
}

interface ParticleProps {
  index: number;
  color: string;
  trigger: boolean;
}

const Particle = ({ index, color, trigger }: ParticleProps) => {
  const opacity = useSharedValue(0);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(0);

  useEffect(() => {
    if (trigger) {
      // Calculate angle for radial distribution
      const angle = (index * 360) / 10;
      const radian = (angle * Math.PI) / 180;
      const distance = 30 + Math.random() * 20;

      // Reset values
      opacity.value = 0;
      translateX.value = 0;
      translateY.value = 0;
      scale.value = 0;

      // Animate particle
      opacity.value = withSequence(
        withTiming(1, { duration: 50 }),
        withDelay(150, withTiming(0, { duration: 200 }))
      );

      translateX.value = withTiming(Math.cos(radian) * distance, {
        duration: 300,
        easing: Easing.out(Easing.ease),
      });

      translateY.value = withTiming(Math.sin(radian) * distance, {
        duration: 300,
        easing: Easing.out(Easing.ease),
      });

      scale.value = withSequence(
        withTiming(1, { duration: 100 }),
        withDelay(100, withTiming(0.5, { duration: 200 }))
      );
    }
  }, [trigger, index, opacity, translateX, translateY, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  return (
    <Animated.View
      style={[styles.particle, { backgroundColor: color }, animatedStyle]}
    />
  );
};

export function BurstAnimation({
  trigger,
  color = "#34C759",
}: BurstAnimationProps) {
  const scale = useSharedValue(1);

  useEffect(() => {
    if (trigger) {
      // Button scale animation
      scale.value = withSequence(
        withTiming(1.2, { duration: 100, easing: Easing.out(Easing.ease) }),
        withTiming(1, { duration: 150, easing: Easing.inOut(Easing.ease) })
      );
    }
  }, [trigger, scale]);

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.buttonScale, buttonAnimatedStyle]}>
        <View style={styles.particleContainer}>
          {Array.from({ length: 10 }).map((_, index) => (
            <Particle
              key={index}
              index={index}
              color={color}
              trigger={trigger}
            />
          ))}
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    pointerEvents: "none",
  },
  buttonScale: {
    width: "100%",
    height: "100%",
  },
  particleContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
  particle: {
    position: "absolute",
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});
