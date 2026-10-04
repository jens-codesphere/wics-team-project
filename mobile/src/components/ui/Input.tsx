import { useState } from 'react';
import {
  StyleSheet,
  TextInput,
  View,
  type TextInputProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { colors, fonts, radii } from '@/theme/tokens';
import { Text } from './Text';

export type InputProps = TextInputProps & {
  label?: string;
  hint?: string;
  containerStyle?: StyleProp<ViewStyle>;
};

/**
 * Soft filled input (spec §11): 56h, #EFEDE9 fill, radius 18, no border;
 * focused state flips to white surface with a 1.5 ink border.
 */
export function Input({ label, hint, containerStyle, style, ...rest }: InputProps) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={[styles.container, containerStyle]}>
      {label ? (
        <Text variant="label" color={colors.ink} style={styles.label}>
          {label}
        </Text>
      ) : null}
      <TextInput
        placeholderTextColor={colors.chipText}
        onFocus={(event) => {
          setFocused(true);
          rest.onFocus?.(event);
        }}
        onBlur={(event) => {
          setFocused(false);
          rest.onBlur?.(event);
        }}
        {...rest}
        style={[styles.input, focused && styles.focused, style]}
      />
      {hint ? (
        <Text variant="caption" muted>
          {hint}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  label: {
    marginLeft: 4,
  },
  input: {
    minHeight: 56,
    borderRadius: radii.input,
    backgroundColor: colors.inputBackground,
    paddingHorizontal: 18,
    paddingVertical: 14,
    fontSize: 15,
    fontFamily: fonts.regular,
    color: colors.ink,
    borderWidth: 0,
  },
  focused: {
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.ink,
    paddingHorizontal: 16.5,
  },
});
