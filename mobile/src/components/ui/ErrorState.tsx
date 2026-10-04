import { StyleSheet, View } from 'react-native';
import { CircleAlert } from 'lucide-react-native';

import { colors, radii, spacing } from '@/theme/tokens';
import { Button } from './Button';
import { Text } from './Text';

export type ErrorStateProps = {
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryLabel?: string;
};

/** Error state (spec §19): never fabricates data — surfaces the failure. */
export function ErrorState({
  title = 'Something went wrong',
  message = 'We could not load this right now. Check your connection and try again.',
  onRetry,
  retryLabel = 'Try again',
}: ErrorStateProps) {
  return (
    <View style={styles.container}>
      <View style={styles.badge}>
        <CircleAlert size={30} color={colors.error} strokeWidth={1.9} />
      </View>
      <Text variant="cardTitle" center>
        {title}
      </Text>
      <Text variant="body" muted center style={styles.message}>
        {message}
      </Text>
      {onRetry ? (
        <Button
          label={retryLabel}
          onPress={onRetry}
          variant="outline"
          fullWidth={false}
          style={styles.action}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xxxl,
    paddingHorizontal: spacing.lg,
  },
  badge: {
    width: 64,
    height: 64,
    borderRadius: radii.pill,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  message: {
    maxWidth: 280,
  },
  action: {
    marginTop: spacing.sm,
  },
});
