import { useCallback, useMemo, useState } from 'react';
import {
  RefreshControl,
  Share,
  StyleSheet,
  View,
} from 'react-native';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { Share2, Sparkles } from 'lucide-react-native';

import {
  Button,
  Card,
  Chip,
  EmptyState,
  ErrorState,
  LoadingState,
  MemberChip,
  Screen,
  SectionHeader,
  Text,
} from '@/components/ui';
import {
  getGroup,
  getGroupMembers,
  type GroupMember,
  type GroupSummary,
} from '@/lib/groups';
import { buildGroupPreferences } from '@/lib/recommendations/group-preferences';
import { colors, layout, radii, spacing } from '@/theme/tokens';

type LoadStatus = 'loading' | 'ready' | 'error';

const MEMBER_ACCENTS = [colors.peach, colors.blush, colors.mint, colors.lilac];

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function budgetValue(budget: number | null): { value: string; caption: string } {
  if (budget === null) {
    return { value: 'Default', caption: 'no budget set' };
  }
  return { value: `$${Math.round(Number(budget))}`, caption: 'per person' };
}

/**
 * Group detail: name, invite code, budget, members and the combined
 * "group vibe" aggregated from real member interests.
 */
export default function GroupLobbyScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const [group, setGroup] = useState<GroupSummary | null>(null);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [status, setStatus] = useState<LoadStatus>('loading');
  const [refreshing, setRefreshing] = useState(false);

  const loadGroup = useCallback(async () => {
    if (!id) return;

    try {
      const [groupData, memberData] = await Promise.all([
        getGroup(id),
        getGroupMembers(id),
      ]);
      setGroup(groupData);
      setMembers(memberData);
      setStatus('ready');
    } catch (error) {
      console.error(error);
      setStatus('error');
    } finally {
      setRefreshing(false);
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      void loadGroup();
    }, [loadGroup])
  );

  const preferences = useMemo(() => {
    if (!group) return null;
    return buildGroupPreferences(
      members.map((member) => ({
        budget: member.budget,
        interests: member.interests,
        transportation: member.transportation,
      })),
      group.budget
    );
  }, [group, members]);

  async function shareInvite() {
    if (!group?.join_code) return;

    try {
      await Share.share({
        message: `Join my Outsy group "${group.name}" — enter code ${group.join_code} in Outsy.`,
      });
    } catch {
      // Sharing was dismissed — nothing to surface.
    }
  }

  if (status === 'loading') {
    return (
      <Screen showBack title="Group">
        <LoadingState title="Opening your group…" />
      </Screen>
    );
  }

  if (status === 'error') {
    return (
      <Screen showBack title="Group">
        <ErrorState
          title="Could not load this group"
          message="We couldn't reach Outsy right now. Check your connection and try again."
          onRetry={() => void loadGroup()}
        />
      </Screen>
    );
  }

  if (!group) {
    return (
      <Screen showBack title="Group">
        <EmptyState
          tone={colors.blush}
          title="Group not found"
          message="This group may have been removed, or the link is out of date."
          actionLabel="Back to groups"
          onAction={() => router.replace('/groups')}
        />
      </Screen>
    );
  }

  const budget = budgetValue(group.budget);
  const interests = preferences?.interests ?? [];

  return (
    <Screen
      showBack
      footer={
        <Button
          label="Find our outing"
          onPress={() =>
            router.push({
              pathname: '/recommendations/[groupId]',
              params: { groupId: group.id },
            })
          }
          icon={<Sparkles size={18} color={colors.onInk} strokeWidth={1.9} />}
        />
      }
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            void loadGroup();
          }}
          tintColor={colors.ink}
        />
      }
    >
      {/* Hero: name + invite code */}
      <Card tone={colors.mint} radius={radii.cardLarge} style={styles.hero}>
        <Text variant="micro" color={colors.ink} style={styles.eyebrow}>
          YOUR GROUP
        </Text>
        <Text variant="h2" color={colors.ink}>
          {group.name}
        </Text>

        <View style={styles.codeBox}>
          <Text
            variant="micro"
            color={colors.textSecondary}
            style={styles.codeLabel}
          >
            INVITE CODE
          </Text>
          <Text variant="h2" color={colors.ink} style={styles.code}>
            {group.join_code ?? '------'}
          </Text>
        </View>

        {group.join_code ? (
          <Button
            label="Share invite"
            variant="pastel"
            color={colors.surface}
            onPress={() => void shareInvite()}
            icon={<Share2 size={17} color={colors.ink} strokeWidth={1.9} />}
          />
        ) : (
          <Text variant="caption" color={colors.ink} center style={styles.noCode}>
            This group has no invite code yet.
          </Text>
        )}
      </Card>

      {/* Stats */}
      <View style={styles.stats}>
        <StatTile label="Members" value={`${members.length}`} caption="people" />
        <StatTile label="Budget" value={budget.value} caption={budget.caption} />
        <StatTile label="Vibe" value={`${interests.length}`} caption="interests" />
      </View>

      {/* Group vibe */}
      <View style={styles.section}>
        <SectionHeader
          title="Your group's vibe"
          subtitle="Combined from everyone's interests"
        />
        {interests.length === 0 ? (
          <Card tone={colors.chipBackground} radius={radii.card}>
            <Text variant="body" color={colors.chipText}>
              No interests yet. Members can add theirs from their profile, and
              they'll show up here.
            </Text>
          </Card>
        ) : (
          <View style={styles.chips}>
            {interests.slice(0, 12).map((interest) => (
              <Chip
                key={interest.name}
                label={capitalize(interest.name)}
                selected
                color={colors.lavender}
              />
            ))}
          </View>
        )}
      </View>

      {/* Members */}
      <View style={styles.section}>
        <SectionHeader
          title="Members"
          subtitle={`${members.length} ${members.length === 1 ? 'person' : 'people'}`}
        />
        {members.length === 0 ? (
          <Card tone={colors.chipBackground} radius={radii.card}>
            <Text variant="body" color={colors.chipText}>
              Nobody has joined yet — share your invite code to get the crew
              together.
            </Text>
          </Card>
        ) : (
          <View style={styles.memberList}>
            {members.map((member, index) => (
              <MemberChip
                key={member.id}
                name={member.displayName}
                interests={member.interests}
                transportation={member.transportation}
                accent={MEMBER_ACCENTS[index % MEMBER_ACCENTS.length]}
              />
            ))}
          </View>
        )}
      </View>
    </Screen>
  );
}

function StatTile({
  label,
  value,
  caption,
}: {
  label: string;
  value: string;
  caption: string;
}) {
  return (
    <View style={styles.statTile}>
      <Text variant="micro" color={colors.textSecondary} style={styles.statLabel}>
        {label.toUpperCase()}
      </Text>
      <Text variant="cardTitle" color={colors.ink} numberOfLines={1}>
        {value}
      </Text>
      <Text variant="caption" color={colors.textSecondary} numberOfLines={1}>
        {caption}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    gap: spacing.md,
  },
  eyebrow: {
    letterSpacing: 1.2,
  },
  codeBox: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
    gap: 4,
  },
  codeLabel: {
    letterSpacing: 1.4,
  },
  code: {
    letterSpacing: 6,
  },
  noCode: {
    color: colors.ink,
    opacity: 0.7,
  },
  stats: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  statTile: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    padding: 14,
    gap: 4,
    minHeight: 96,
  },
  statLabel: {
    letterSpacing: 0.8,
  },
  section: {
    marginTop: layout.sectionGap,
    gap: spacing.md,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  memberList: {
    gap: spacing.sm,
  },
});
