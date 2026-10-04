import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { colors, radii, spacing } from '@/theme/tokens';
import { Button } from './Button';
import { Text } from './Text';

export type EmptyStateProps = {
  icon?: ReactNode;
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
  actionColor?: string;
  tone?: string;
};

/** Empty state (spec §19): pastel circle, editorial copy, optional action. */
export function EmptyState({
  icon,
  title,
  message,
  actionLabel,
  onAction,
  actionColor,
  tone = colors.blush,
}: EmptyStateProps) {
  return (
    <View style={styles.container}>
      {icon ? (
        <View style={[styles.badge, { backgroundColor: tone }]}>
          <View pointerEvents="none">{icon}</View>
        </View>
      ) : null}
      <Text variant="cardTitle" center>
        {title}
      </Text>
      {message ? (
        <Text variant="body" muted center style={styles.message}>
          {message}
        </Text>
      ) : null}
      {actionLabel && onAction ? (
        <Button
          label={actionLabel}
          onPress={onAction}
          variant="pastel"
          color={actionColor ?? colors.butter}
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
    width: 72,
    height: 72,
    borderRadius: radii.pill,
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
