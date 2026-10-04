import { Text as RNText, type TextProps as RNTextProps } from 'react-native';

import {
  colors,
  fonts,
  typography,
  type FontWeightName,
  type TypographyVariant,
} from '@/theme/tokens';

export type TextProps = RNTextProps & {
  /** Type-scale variant from the design tokens. Defaults to `body`. */
  variant?: TypographyVariant;
  /** Optional weight override (maps to the loaded Manrope family). */
  weight?: FontWeightName;
  color?: string;
  muted?: boolean;
  center?: boolean;
};

/**
 * Outsy text primitive. Always renders one of the tokenized Manrope
 * variants so screens never hardcode font sizes or weights.
 */
export function Text({
  variant = 'body',
  weight,
  color,
  muted,
  center,
  style,
  ...rest
}: TextProps) {
  return (
    <RNText
      style={[
        typography[variant],
        weight ? { fontFamily: fonts[weight] } : null,
        color ? { color } : muted ? { color: colors.textSecondary } : null,
        center ? { textAlign: 'center' } : null,
        style,
      ]}
      {...rest}
    />
  );
}
