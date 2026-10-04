import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors, layout, radii, shadows, spacing } from '@/theme/tokens';

export type CardProps = {
  children: ReactNode;
  /** Pastel (or surface) background fill. Defaults to white surface. */
  tone?: string;
  onPress?: () => void;
  radius?: number;
  padding?: number;
  elevated?: boolean;
  style?: StyleProp<ViewStyle>;
};

/**
 * The primary structural motif (spec §9): oversized radius, generous
 * padding, pastel fills, very subtle shadows.
 */
export function Card({
  children,
  tone = colors.surface,
  onPress,
  radius = radii.card,
  padding = layout.cardPadding,
  elevated = false,
  style,
}: CardProps) {
  const base = [
    styles.card,
    { backgroundColor: tone, borderRadius: radius, padding },
    elevated ? shadows.soft : null,
    style,
  ];

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        style={({ pressed }) => [...base, pressed && styles.pressed]}
      >
        {children}
      </Pressable>
    );
  }

  return <View style={base}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.sm,
  },
  pressed: {
    opacity: 0.92,
    transform: [{ scale: 0.99 }],
  },
});
