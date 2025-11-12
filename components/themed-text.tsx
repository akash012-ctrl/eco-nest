import { StyleSheet, Text, type TextProps } from "react-native";

import { Typography } from "@/constants/theme";
import { useThemeColor } from "@/hooks/use-theme-color";

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?:
    | "default"
    | "title"
    | "defaultSemiBold"
    | "subtitle"
    | "link"
    | "h1"
    | "h2"
    | "h3"
    | "h4"
    | "body"
    | "bodyLarge"
    | "bodySmall"
    | "caption"
    | "button"
    | "label";
  variant?: "primary" | "secondary" | "tertiary";
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = "default",
  variant = "primary",
  ...rest
}: ThemedTextProps) {
  const colorKey =
    variant === "secondary"
      ? "textSecondary"
      : variant === "tertiary"
        ? "textTertiary"
        : "text";
  const color = useThemeColor({ light: lightColor, dark: darkColor }, colorKey);

  return (
    <Text
      style={[
        { color },
        type === "default" ? styles.default : undefined,
        type === "title" ? styles.title : undefined,
        type === "defaultSemiBold" ? styles.defaultSemiBold : undefined,
        type === "subtitle" ? styles.subtitle : undefined,
        type === "link" ? styles.link : undefined,
        type === "h1" ? styles.h1 : undefined,
        type === "h2" ? styles.h2 : undefined,
        type === "h3" ? styles.h3 : undefined,
        type === "h4" ? styles.h4 : undefined,
        type === "body" ? styles.body : undefined,
        type === "bodyLarge" ? styles.bodyLarge : undefined,
        type === "bodySmall" ? styles.bodySmall : undefined,
        type === "caption" ? styles.caption : undefined,
        type === "button" ? styles.button : undefined,
        type === "label" ? styles.label : undefined,
        style,
      ]}
      allowFontScaling={true}
      maxFontSizeMultiplier={2}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    fontSize: Typography.fontSize.base,
    lineHeight: 24,
  },
  defaultSemiBold: {
    fontSize: Typography.fontSize.base,
    lineHeight: 24,
    fontWeight: Typography.fontWeight.semibold,
  },
  title: {
    fontSize: 32,
    fontWeight: Typography.fontWeight.bold,
    lineHeight: 32,
  },
  subtitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
  },
  link: {
    lineHeight: 30,
    fontSize: Typography.fontSize.base,
    color: "#0a7ea4",
  },
  h1: Typography.styles.h1,
  h2: Typography.styles.h2,
  h3: Typography.styles.h3,
  h4: Typography.styles.h4,
  body: Typography.styles.body,
  bodyLarge: Typography.styles.bodyLarge,
  bodySmall: Typography.styles.bodySmall,
  caption: Typography.styles.caption,
  button: Typography.styles.button,
  label: Typography.styles.label,
});
