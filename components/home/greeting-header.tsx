import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { BorderRadius, Spacing, Typography } from "@/constants/theme";
import { useAuth } from "@/contexts/auth-context";
import { useDemoMode } from "@/contexts/demo-mode-context";
import { useThemeColor } from "@/hooks/use-theme-color";
import { StyleSheet, View } from "react-native";

export function GreetingHeader() {
  const { user } = useAuth();
  const { isDemoMode } = useDemoMode();
  const warningColor = useThemeColor({}, "warning");

  const displayName = isDemoMode ? "Demo User" : user?.displayName || "Guest";
  const greeting = getGreeting();

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="h3" variant="secondary" style={styles.greeting}>
        {greeting}
      </ThemedText>
      <View style={styles.nameRow}>
        <ThemedText type="h2" style={styles.name}>
          {displayName}
        </ThemedText>
        {isDemoMode && (
          <View style={[styles.demoBadge, { backgroundColor: warningColor }]}>
            <ThemedText type="caption" style={styles.demoText}>
              Demo
            </ThemedText>
          </View>
        )}
      </View>
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
    paddingHorizontal: Spacing.screenPadding,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  greeting: {
    marginBottom: Spacing.xs,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  name: {
    // Inherits from h2 type
  },
  demoBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  demoText: {
    fontWeight: Typography.fontWeight.semibold,
    color: "#FFFFFF",
  },
});
