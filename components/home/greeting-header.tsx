import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useAuth } from "@/contexts/auth-context";
import { useDemoMode } from "@/contexts/demo-mode-context";
import { StyleSheet } from "react-native";

export function GreetingHeader() {
  const { user } = useAuth();
  const { isDemoMode } = useDemoMode();

  const displayName = isDemoMode ? "Demo User" : user?.displayName || "Guest";
  const greeting = getGreeting();

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.greeting}>
        {greeting}
      </ThemedText>
      <ThemedView style={styles.nameRow}>
        <ThemedText type="subtitle" style={styles.name}>
          {displayName}
        </ThemedText>
        {isDemoMode && (
          <ThemedView style={styles.demoBadge}>
            <ThemedText style={styles.demoText}>Demo</ThemedText>
          </ThemedView>
        )}
      </ThemedView>
    </ThemedView>
  );
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  greeting: {
    fontSize: 24,
    marginBottom: 4,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  name: {
    fontSize: 28,
  },
  demoBadge: {
    backgroundColor: "#FFA500",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  demoText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
