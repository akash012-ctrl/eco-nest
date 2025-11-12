import { BorderRadius, Shadows, Spacing } from "@/constants/theme";
import { useThemeColor } from "@/hooks/use-theme-color";
import { StyleSheet, View, type ViewProps } from "react-native";

export type CardProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
  elevated?: boolean;
  padding?: keyof typeof Spacing | number;
};

export function Card({
  style,
  lightColor,
  darkColor,
  elevated = false,
  padding = "cardPadding",
  ...otherProps
}: CardProps) {
  const backgroundColor = useThemeColor(
    { light: lightColor, dark: darkColor },
    "card"
  );

  const paddingValue = typeof padding === "number" ? padding : Spacing[padding];

  return (
    <View
      style={[
        styles.card,
        { backgroundColor, padding: paddingValue },
        elevated ? Shadows.cardElevated : Shadows.card,
        style,
      ]}
      {...otherProps}
    />
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.card,
  },
});
