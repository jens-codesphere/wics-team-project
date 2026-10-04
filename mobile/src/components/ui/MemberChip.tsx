import { StyleSheet, View } from 'react-native';

import { colors, radii, spacing } from '@/theme/tokens';
import { Text } from './Text';

export type MemberChipProps = {
  name: string;
  interests?: string[];
  transportation?: string | null;
  /** Pastel accent for the avatar. Defaults to blush. */
  accent?: string;
};

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Group member row: pastel avatar with initials, name, interests,
 * transportation — all bound to real profile data.
 */
export function MemberChip({
  name,
  interests = [],
  transportation,
  accent = colors.peach,
}: MemberChipProps) {
  const detail = [
    interests.length > 0 ? interests.join(' · ') : null,
    transportation ?? null,
  ]
    .filter(Boolean)
    .join('  •  ');

  return (
    <View style={styles.row}>
      <View style={[styles.avatar, { backgroundColor: accent }]}>
        <Text variant="label" color={colors.ink}>
          {initials(name)}
        </Text>
      </View>
      <View style={styles.body}>
        <Text variant="bodyLarge" weight="semibold" numberOfLines={1}>
          {name}
        </Text>
        {detail ? (
          <Text variant="caption" muted numberOfLines={2}>
            {detail}
          </Text>
        ) : (
          <Text variant="caption" muted>
            No interests yet
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    padding: 14,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    flex: 1,
    gap: 2,
  },
});
