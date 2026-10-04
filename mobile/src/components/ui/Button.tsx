import {
  ActivityIndicator,
  Animated,
  Pressable,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useRef, type ReactNode } from 'react';

import { colors, fonts, motion, radii, spacing } from '@/theme/tokens';
import { Text } from './Text';

export type ButtonVariant = 'primary' | 'pastel' | 'outline';

export type ButtonProps = {
  label: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  /** Pastel fill for the `pastel` variant. Defaults to butter. */
  color?: string;
  loading?: boolean;
  disabled?: boolean;
  icon?: ReactNode;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
};

/**
 * Primary CTA (ink, ~56h) and pastel/outline CTA (~52h) per spec §8,
 * with a subtle 130ms press scale (spec §16).
 */
export function Button({
  label,
  onPress,
  variant = 'primary',
  color,
  loading = false,
  disabled = false,
  icon,
  fullWidth = true,
  style,
}: ButtonProps) {
  const scale = useRef(new Animated.Value(1)).current;

  const pressIn = () => {
    Animated.timing(scale, {
      toValue: 0.98,
      duration: motion.press,
      useNativeDriver: true,
    }).start();
  };

  const pressOut = () => {
    Animated.timing(scale, {
      toValue: 1,
      duration: motion.press,
      useNativeDriver: true,
    }).start();
  };

  const isPrimary = variant === 'primary';
  const fill =
    variant === 'primary'
      ? colors.ink
      : variant === 'pastel'
        ? (color ?? colors.butter)
        : 'transparent';

  const textColor = isPrimary ? colors.onInk : colors.ink;
  const inactive = disabled || loading;

  return (
    <Animated.View
      style={[fullWidth && styles.fullWidth, { transform: [{ scale }] }, style]}
    >
      <Pressable
        onPress={onPress}
        disabled={inactive}
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ disabled: inactive, busy: loading }}
        onPressIn={pressIn}
        onPressOut={pressOut}
        style={[
          styles.base,
          isPrimary ? styles.primaryHeight : styles.secondaryHeight,
          { backgroundColor: fill },
          variant === 'outline' && styles.outline,
          inactive && styles.disabled,
        ]}
      >
        {loading ? (
          <ActivityIndicator size="small" color={textColor} />
        ) : (
          icon
        )}
        <Text
          variant="bodyLarge"
          weight="semibold"
          color={textColor}
          style={isPrimary ? styles.primaryLabel : styles.secondaryLabel}
        >
          {label}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  fullWidth: {
    alignSelf: 'stretch',
  },
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: spacing.lg,
  },
  primaryHeight: {
    minHeight: 56,
    borderRadius: radii.button,
  },
  secondaryHeight: {
    minHeight: 52,
    borderRadius: radii.button,
  },
  outline: {
    borderWidth: 1.5,
    borderColor: colors.ink,
  },
  disabled: {
    opacity: 0.45,
  },
  primaryLabel: {
    fontSize: 16,
    lineHeight: 20,
    fontFamily: fonts.semibold,
  },
  secondaryLabel: {
    fontSize: 15,
    lineHeight: 19,
    fontFamily: fonts.semibold,
  },
});
