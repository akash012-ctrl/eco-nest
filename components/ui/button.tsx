import { ThemedText } from "@/components/themed-text";
import { BorderRadius, Shadows, Spacing, Typography } from "@/constants/theme";
import { useThemeColor } from "@/hooks/use-theme-color";
import {
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  type TouchableOpacityProps,
} from "react-native";

export type ButtonProps = TouchableOpacityProps & {
  title: string;
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  fullWidth?: boolean;
};

export function Button({
  title,
  variant = "primary",
  size = "md",
  loading = false,
  fullWidth = false,
  disabled,
  style,
  ...otherProps
}: ButtonProps) {
  const primaryBg = useThemeColor({}, "buttonPrimary");
  const primaryText = useThemeColor({}, "buttonPrimaryText");
  const secondaryBg = useThemeColor({}, "buttonSecondary");
  const secondaryText = useThemeColor({}, "buttonSecondaryText");
  const accentColor = useThemeColor({}, "accent");

  const backgroundColor =
    variant === "primary"
      ? primaryBg
      : variant === "secondary"
        ? secondaryBg
        : "transparent";

  const textColor =
    variant === "primary"
      ? primaryText
      : variant === "secondary"
        ? secondaryText
        : accentColor;

  const sizeStyle =
    size === "sm"
      ? styles.buttonSm
      : size === "lg"
        ? styles.buttonLg
        : styles.buttonMd;

  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      style={[
        styles.button,
        sizeStyle,
        { backgroundColor },
        variant !== "ghost" && Shadows.button,
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        style,
      ]}
      disabled={isDisabled}
      activeOpacity={0.7}
      {...otherProps}
    >
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <ThemedText
          type="button"
          style={[styles.text, { color: textColor }]}
          lightColor={textColor}
          darkColor={textColor}
        >
          {title}
        </ThemedText>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: BorderRadius.button,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
  },
  buttonSm: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    minHeight: 36,
  },
  buttonMd: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    minHeight: 44,
  },
  buttonLg: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    minHeight: 52,
  },
  fullWidth: {
    width: "100%",
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
  },
});
