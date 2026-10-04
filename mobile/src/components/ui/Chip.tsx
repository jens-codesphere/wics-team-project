import {
  Pressable,
  StyleSheet,
  Text as RNText,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { colors, fonts, radii } from '@/theme/tokens';

export type ChipProps = {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  /** Fill used when selected. Defaults to lavender. */
  color?: string;
  style?: StyleProp<ViewStyle>;
};

/**
 * Soft 36h chip for interests/preferences (spec §10).
 * Unselected: #EFEDE9 / #5F5B57. Selected: pastel (lavender) / ink.
 */
export function Chip({
  label,
  selected = false,
  onPress,
  color,
  style,
}: ChipProps) {
  const fill = selected ? (color ?? colors.lavender) : colors.chipBackground;
  const textColor = selected ? colors.ink : colors.chipText;

  const content = <RNText style={[styles.label, { color: textColor }]}>{label}</RNText>;

  if (!onPress) {
    return <View style={[styles.chip, { backgroundColor: fill }, style]}>{content}</View>;
  }

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      style={({ pressed }) => [
        styles.chip,
        { backgroundColor: fill },
        pressed && styles.pressed,
        style,
      ]}
    >
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    minHeight: 36,
    borderRadius: radii.chip,
    paddingHorizontal: 14,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  label: {
    fontFamily: fonts.semibold,
    fontSize: 13,
    lineHeight: 17,
  },
  pressed: {
    opacity: 0.8,
  },
});
