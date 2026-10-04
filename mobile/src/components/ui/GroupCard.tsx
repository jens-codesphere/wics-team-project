import { StyleSheet, View } from 'react-native';
import { ChevronRight } from 'lucide-react-native';

import { colors, layout, radii, spacing } from '@/theme/tokens';
import type { GroupSummary } from '@/lib/groups';
import { Card } from './Card';
import { Text } from './Text';

export type GroupCardProps = {
  group: GroupSummary;
  onPress?: () => void;
  /** Pastel accent for the card. Defaults to mint (groups). */
  tone?: string;
  memberCount?: number;
};

function budgetLabel(budget: number | null): string {
  if (budget === null) return 'Default budget';
  return `$${Number(budget).toFixed(0)} / person`;
}

/**
 * Reusable group card (Mint family) bound to real group data:
 * name, invite code, budget, optional member count.
 */
export function GroupCard({
  group,
  onPress,
  tone = colors.mint,
  memberCount,
}: GroupCardProps) {
  return (
    <Card tone={tone} onPress={onPress} radius={radii.card} padding={layout.cardPadding}>
      <View style={styles.topRow}>
        <Text variant="cardTitle" style={styles.name} numberOfLines={1}>
          {group.name}
        </Text>
        <View style={styles.chevron}>
          <ChevronRight size={18} color={colors.ink} strokeWidth={2} />
        </View>
      </View>

      <View style={styles.pills}>
        {group.join_code ? (
          <View style={styles.pill}>
            <Text variant="micro" color={colors.ink} style={styles.code}>
              {group.join_code}
            </Text>
          </View>
        ) : null}
        <View style={styles.pill}>
          <Text variant="micro" color={colors.ink}>
            {budgetLabel(group.budget)}
          </Text>
        </View>
        {typeof memberCount === 'number' ? (
          <View style={styles.pill}>
            <Text variant="micro" color={colors.ink}>
              {memberCount} {memberCount === 1 ? 'member' : 'members'}
            </Text>
          </View>
        ) : null}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  name: {
    flex: 1,
  },
  chevron: {
    width: 36,
    height: 36,
    borderRadius: radii.pill,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pill: {
    backgroundColor: colors.surface,
    borderRadius: radii.pill,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  code: {
    letterSpacing: 1.5,
  },
});
