import { ThemedText } from "@/components/themed-text";
import { BorderRadius, Spacing, Typography } from "@/constants/theme";
import { useThemeColor } from "@/hooks/use-theme-color";
import { StyleSheet, View } from "react-native";

export type BadgeProps = {
  count: number;
  variant?: "primary" | "secondary" | "error" | "warning";
  size?: "sm" | "md";
};

export function Badge({ count, variant = "primary", size = "md" }: BadgeProps) {
  const backgroundColor = useThemeColor(
    {},
    variant === "primary"
      ? "accent"
      : variant === "secondary"
        ? "secondary"
        : variant === "error"
          ? "error"
          : "warning"
  );

  const textColor =
    variant === "primary" || variant === "error" ? "#FFFFFF" : "#000000";

  const sizeStyle = size === "sm" ? styles.badgeSm : styles.badgeMd;
  const textSizeStyle = size === "sm" ? styles.textSm : styles.textMd;

  if (count === 0) return null;

  return (
    <View style={[styles.badge, sizeStyle, { backgroundColor }]}>
      <ThemedText
        style={[styles.text, textSizeStyle, { color: textColor }]}
        lightColor={textColor}
        darkColor={textColor}
      >
        {count > 99 ? "99+" : count}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: BorderRadius.badge,
    justifyContent: "center",
    alignItems: "center",
    minWidth: 20,
  },
  badgeSm: {
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
    minWidth: 16,
  },
  badgeMd: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  text: {
    fontWeight: Typography.fontWeight.semibold,
  },
  textSm: {
    fontSize: Typography.fontSize.xs,
    lineHeight: 14,
  },
  textMd: {
    fontSize: Typography.fontSize.sm,
    lineHeight: 16,
  },
});
