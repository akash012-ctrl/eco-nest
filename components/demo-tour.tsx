import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import React, { useEffect, useState } from "react";
import { Modal, Pressable, StyleSheet, View } from "react-native";
import Animated, {
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

// ============================================================================
// Types
// ============================================================================

export interface DemoTourStep {
  title: string;
  description: string;
  highlightArea: "quick-log" | "sync" | "leaderboard";
}

interface DemoTourProps {
  visible: boolean;
  onComplete: () => void;
}

// ============================================================================
// Demo Tour Steps
// ============================================================================

const TOUR_STEPS: DemoTourStep[] = [
  {
    title: "Welcome to EcoNest! 🌱",
    description:
      "Track your eco-friendly habits and compete with others. Let's take a quick tour of the key features.",
    highlightArea: "quick-log",
  },
];

// ============================================================================
// DemoTour Component
// ============================================================================

export function DemoTour({ visible, onComplete }: DemoTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const pulseScale = useSharedValue(1);

  // Pulse animation for highlighting
  useEffect(() => {
    if (visible) {
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.05, { duration: 800 }),
          withTiming(1, { duration: 800 })
        ),
        -1,
        false
      );
    }
  }, [visible, pulseScale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  const handleNext = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    setCurrentStep(0);
    onComplete();
  };

  if (!visible) return null;

  const step = TOUR_STEPS[currentStep];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleComplete}
    >
      <Animated.View
        entering={FadeIn.duration(300)}
        exiting={FadeOut.duration(200)}
        style={styles.overlay}
      >
        {/* Semi-transparent backdrop */}
        <Pressable style={styles.backdrop} onPress={handleComplete} />

        {/* Tour content */}
        <View style={styles.contentContainer}>
          <ThemedView style={styles.card}>
            <ThemedText style={styles.title}>{step.title}</ThemedText>
            <ThemedText style={styles.description}>
              {step.description}
            </ThemedText>

            {/* Feature highlights */}
            <View style={styles.featuresContainer}>
              <View style={styles.featureItem}>
                <ThemedText style={styles.featureIcon}>⚡</ThemedText>
                <ThemedText style={styles.featureText}>
                  Quick Log: Tap habit buttons to log actions
                </ThemedText>
              </View>

              <View style={styles.featureItem}>
                <ThemedText style={styles.featureIcon}>🔄</ThemedText>
                <ThemedText style={styles.featureText}>
                  Sync: Upload your logs when ready
                </ThemedText>
              </View>

              <View style={styles.featureItem}>
                <ThemedText style={styles.featureIcon}>🏆</ThemedText>
                <ThemedText style={styles.featureText}>
                  Leaderboard: See your rank and compete
                </ThemedText>
              </View>
            </View>

            {/* Action button */}
            <Pressable
              style={({ pressed }) => [
                styles.button,
                pressed && styles.buttonPressed,
              ]}
              onPress={handleNext}
            >
              <ThemedText style={styles.buttonText}>
                {currentStep < TOUR_STEPS.length - 1 ? "Next" : "Got it!"}
              </ThemedText>
            </Pressable>

            {/* Skip button */}
            <Pressable onPress={handleComplete} style={styles.skipButton}>
              <ThemedText style={styles.skipText}>Skip tour</ThemedText>
            </Pressable>
          </ThemedView>
        </View>
      </Animated.View>
    </Modal>
  );
}

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
  contentContainer: {
    width: "85%",
    maxWidth: 400,
    zIndex: 1,
  },
  card: {
    borderRadius: 16,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 24,
    textAlign: "center",
    opacity: 0.8,
  },
  featuresContainer: {
    marginBottom: 24,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  featureIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  featureText: {
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
  },
  button: {
    backgroundColor: "#4CAF50",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 12,
  },
  buttonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  skipButton: {
    paddingVertical: 8,
    alignItems: "center",
  },
  skipText: {
    fontSize: 14,
    opacity: 0.6,
  },
});
