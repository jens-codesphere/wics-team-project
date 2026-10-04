import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { colors, radii, spacing } from '@/theme/tokens';
import { Text } from './Text';

export type LoadingStateProps = {
  title?: string;
  subtitle?: string;
};

/** Polished loading state shared by every data screen (spec §19). */
export function LoadingState({
  title = 'One moment…',
  subtitle,
}: LoadingStateProps) {
  return (
    <View style={styles.container} accessibilityRole="progressbar">
      <View style={styles.badge}>
        <ActivityIndicator color={colors.ink} />
      </View>
      <Text variant="cardTitle" center>
        {title}
      </Text>
      {subtitle ? (
        <Text variant="body" muted center>
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.display,
    paddingHorizontal: spacing.xl,
  },
  badge: {
    width: 56,
    height: 56,
    borderRadius: radii.pill,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
});
