import { ThemedText } from "@/components/themed-text";
import { useEffect } from "react";
import { TextStyle } from "react-native";
import Animated, {
  Easing,
  useAnimatedProps,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  style?: TextStyle;
  suffix?: string;
  prefix?: string;
}

// Create an animated version of ThemedText
const AnimatedThemedText = Animated.createAnimatedComponent(ThemedText);

export function AnimatedCounter({
  value,
  duration = 600,
  style,
  suffix = "",
  prefix = "",
}: AnimatedCounterProps) {
  const animatedValue = useSharedValue(value);

  useEffect(() => {
    // Animate from current value to new value
    animatedValue.value = withTiming(value, {
      duration,
      easing: Easing.out(Easing.ease),
    });
  }, [value, duration, animatedValue]);

  const animatedProps = useAnimatedProps(() => {
    // Round to nearest integer for display
    const displayValue = Math.round(animatedValue.value);
    return {
      text: `${prefix}${displayValue}${suffix}`,
    } as any;
  });

  return (
    <AnimatedThemedText
      style={style}
      animatedProps={animatedProps}
      accessible={true}
      accessibilityLabel={`${prefix}${value}${suffix}`}
    />
  );
}
