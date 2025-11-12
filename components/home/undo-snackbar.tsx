import { ThemedText } from "@/components/themed-text";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useEffect } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from "react-native-reanimated";

interface UndoSnackbarProps {
  visible: boolean;
  onUndo: () => void;
  onDismiss: () => void;
  duration?: number;
}

export function UndoSnackbar({
  visible,
  onUndo,
  onDismiss,
  duration = 5000,
}: UndoSnackbarProps) {
  const translateY = useSharedValue(100);
  const opacity = useSharedValue(0);
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");

  useEffect(() => {
    if (visible) {
      // Slide in from bottom
      translateY.value = withTiming(0, {
        duration: 300,
        easing: Easing.out(Easing.ease),
      });
      opacity.value = withTiming(1, { duration: 200 });

      // Auto-dismiss after duration
      translateY.value = withSequence(
        withDelay(
          duration,
          withTiming(100, {
            duration: 300,
            easing: Easing.in(Easing.ease),
          })
        )
      );
      opacity.value = withSequence(
        withDelay(
          duration,
          withTiming(0, { duration: 200 }, () => {
            runOnJS(onDismiss)();
          })
        )
      );
    } else {
      // Immediate hide
      translateY.value = 100;
      opacity.value = 0;
    }
  }, [visible, duration, translateY, opacity, onDismiss]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  const handleUndo = () => {
    onUndo();
    onDismiss();
  };

  if (!visible) return null;

  return (
    <Animated.View
      style={[styles.container, { backgroundColor }, animatedStyle]}
    >
      <View style={styles.content}>
        <ThemedText style={[styles.message, { color: textColor }]}>
          Habit logged
        </ThemedText>
        <TouchableOpacity
          style={styles.undoButton}
          onPress={handleUndo}
          activeOpacity={0.7}
        >
          <ThemedText style={styles.undoText}>Undo</ThemedText>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
    zIndex: 1000,
  },
  content: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  message: {
    fontSize: 15,
    fontWeight: "500",
  },
  undoButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: "#34C759",
    borderRadius: 8,
    minWidth: 44,
    minHeight: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  undoText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },
});
