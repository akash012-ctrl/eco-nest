import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

interface ConfettiAnimationProps {
  visible: boolean;
  onComplete?: () => void;
}

interface ConfettiPiece {
  id: number;
  x: number;
  color: string;
  rotation: number;
  delay: number;
}

const COLORS = ["#34C759", "#007AFF", "#FF9500", "#5856D6", "#32ADE6"];
const PIECE_COUNT = 25;

export function ConfettiAnimation({
  visible,
  onComplete,
}: ConfettiAnimationProps) {
  const pieces: ConfettiPiece[] = Array.from(
    { length: PIECE_COUNT },
    (_, i) => ({
      id: i,
      x: Math.random() * 100, // percentage
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      rotation: Math.random() * 360,
      delay: Math.random() * 200,
    })
  );

  if (!visible) return null;

  return (
    <View style={styles.container} pointerEvents="none">
      {pieces.map((piece) => (
        <ConfettiPiece
          key={piece.id}
          piece={piece}
          visible={visible}
          onComplete={piece.id === 0 ? onComplete : undefined}
        />
      ))}
    </View>
  );
}

interface ConfettiPieceProps {
  piece: ConfettiPiece;
  visible: boolean;
  onComplete?: () => void;
}

function ConfettiPiece({ piece, visible, onComplete }: ConfettiPieceProps) {
  const translateY = useSharedValue(-50);
  const opacity = useSharedValue(1);
  const rotate = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      // Fall animation
      translateY.value = withTiming(600, {
        duration: 1000,
        easing: Easing.in(Easing.quad),
      });

      // Fade out
      opacity.value = withTiming(
        0,
        {
          duration: 800,
          easing: Easing.out(Easing.ease),
        },
        (finished) => {
          if (finished && onComplete) {
            runOnJS(onComplete)();
          }
        }
      );

      // Rotation
      rotate.value = withTiming(piece.rotation + 360, {
        duration: 1000,
        easing: Easing.linear,
      });
    }
  }, [visible, piece.rotation, translateY, opacity, rotate, onComplete]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { rotate: `${rotate.value}deg` },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.piece,
        {
          left: `${piece.x}%`,
          backgroundColor: piece.color,
        },
        animatedStyle,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
  },
  piece: {
    position: "absolute",
    width: 8,
    height: 8,
    borderRadius: 2,
  },
});
