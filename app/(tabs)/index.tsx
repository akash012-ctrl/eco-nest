import { OfflineIndicator } from "@/components";
import { DemoTour } from "@/components/demo-tour";
import {
  ClosestCompetitors,
  ConfettiAnimation,
  ConflictList,
  EcoPointsCard,
  GreetingHeader,
  HabitButtons,
  SparklineChart,
  SyncButton,
  type HabitType,
} from "@/components/home";
import { Toast } from "@/components/home/toast";
import { UndoSnackbar } from "@/components/home/undo-snackbar";
import { ThemedView } from "@/components/themed-view";
import { useDemoMode } from "@/contexts/demo-mode-context";
import { habitService } from "@/services/habit-service";
import type { ConflictItem } from "@/services/sync-service";
import { useCallback, useState } from "react";
import { ScrollView, StyleSheet } from "react-native";

export default function HomeScreen() {
  const { showDemoTour, completeDemoTour } = useDemoMode();
  const [refreshKey, setRefreshKey] = useState(0);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastPoints, setToastPoints] = useState<number | undefined>(undefined);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [lastLogId, setLastLogId] = useState<string | null>(null);
  const [confettiVisible, setConfettiVisible] = useState(false);
  const [conflicts, setConflicts] = useState<ConflictItem[]>([]);

  const handleHabitPress = useCallback(async (habitType: HabitType) => {
    try {
      const result = await habitService.logHabit(habitType);

      // Show toast notification at 200ms
      setTimeout(() => {
        setToastMessage(`Logged +${result.pointsAwarded} EcoPoints`);
        setToastPoints(result.pointsAwarded);
        setToastVisible(true);
      }, 200);

      // Show undo snackbar at 350ms
      setTimeout(() => {
        setLastLogId(result.logId);
        setSnackbarVisible(true);
      }, 350);

      // Trigger refresh of components at 400ms
      setTimeout(() => {
        setRefreshKey((prev) => prev + 1);
      }, 400);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to log habit";

      // Show error toast
      setToastMessage(message);
      setToastPoints(undefined);
      setToastVisible(true);
    }
  }, []);

  const handleUndo = useCallback(async () => {
    if (!lastLogId) return;

    try {
      await habitService.undoLastLog(lastLogId);
      setLastLogId(null);
      setSnackbarVisible(false);

      // Show undo confirmation
      setToastMessage("Habit log removed");
      setToastPoints(undefined);
      setToastVisible(true);

      // Refresh components
      setRefreshKey((prev) => prev + 1);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to undo";
      setToastMessage(message);
      setToastPoints(undefined);
      setToastVisible(true);
    }
  }, [lastLogId]);

  const handleSyncComplete = useCallback(
    (uploaded: number, syncConflicts: ConflictItem[]) => {
      // Store conflicts for display
      setConflicts(syncConflicts);

      // Show confetti animation only if no conflicts
      if (syncConflicts.length === 0) {
        setConfettiVisible(true);
      }

      // Show success toast with summary
      const message =
        syncConflicts.length > 0
          ? `${uploaded} items uploaded — ${syncConflicts.length} conflicts found`
          : `${uploaded} items uploaded`;
      setToastMessage(message);
      setToastPoints(undefined);
      setToastVisible(true);

      // Refresh components to update data
      setRefreshKey((prev) => prev + 1);

      // Hide confetti after animation completes
      if (syncConflicts.length === 0) {
        setTimeout(() => {
          setConfettiVisible(false);
        }, 1000);
      }
    },
    []
  );

  const handleConflictResolved = useCallback(() => {
    // Refresh the conflict list and other components
    setRefreshKey((prev) => prev + 1);

    // Show success feedback
    setToastMessage("Conflict resolved");
    setToastPoints(undefined);
    setToastVisible(true);

    // Remove the resolved conflict from the list
    // Note: In a real implementation, we'd track which specific conflict was resolved
    // For now, we'll just refresh the entire list by clearing it
    // The next sync will show any remaining conflicts
    setConflicts([]);
  }, []);

  return (
    <ThemedView style={styles.container}>
      {/* Demo Tour */}
      <DemoTour visible={showDemoTour} onComplete={completeDemoTour} />

      {/* Offline Indicator */}
      <OfflineIndicator />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <GreetingHeader key={`greeting-${refreshKey}`} />
        <EcoPointsCard key={`points-${refreshKey}`} />
        <SparklineChart key={`chart-${refreshKey}`} />
        <ClosestCompetitors key={`competitors-${refreshKey}`} />

        {/* Conflict resolution UI */}
        {conflicts.length > 0 && (
          <ConflictList
            conflicts={conflicts}
            onConflictResolved={handleConflictResolved}
          />
        )}

        <HabitButtons onHabitPress={handleHabitPress} />

        {/* Bottom padding for scroll */}
        <ThemedView style={styles.bottomPadding} />
      </ScrollView>

      {/* Toast notification */}
      <Toast
        message={toastMessage}
        visible={toastVisible}
        onDismiss={() => setToastVisible(false)}
        pointsAwarded={toastPoints}
      />

      {/* Undo snackbar */}
      <UndoSnackbar
        visible={snackbarVisible}
        onUndo={handleUndo}
        onDismiss={() => setSnackbarVisible(false)}
      />

      {/* Sync button (sticky at bottom) */}
      <SyncButton onSyncComplete={handleSyncComplete} refreshKey={refreshKey} />

      {/* Confetti animation */}
      <ConfettiAnimation visible={confettiVisible} />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 0,
  },
  bottomPadding: {
    height: 140, // Extra padding for sticky sync button
  },
});
