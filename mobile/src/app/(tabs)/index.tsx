import { useCallback, useState, type ReactNode } from 'react';
import {
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Sparkles, Plus, User, Users, Vote } from 'lucide-react-native';

import {
  Button,
  EmptyState,
  ErrorState,
  GroupCard,
  IconButton,
  LoadingState,
  Screen,
  SectionHeader,
  Text,
} from '@/components/ui';
import { getMyGroups, type GroupSummary } from '@/lib/groups';
import { supabase } from '@/lib/supabase';
import { brand, colors, layout, radii, spacing } from '@/theme/tokens';

type LoadStatus = 'loading' | 'ready' | 'error';

const GROUP_ACCENTS = [colors.mint, colors.lavender, colors.butter];

async function fetchDisplayName(): Promise<string | null> {
  try {
    const { data: authData } = await supabase.auth.getUser();
    const user = authData.user;
    if (!user) return null;

    const { data } = await supabase
      .from('profiles')
      .select('display_name')
      .eq('id', user.id)
      .single();

    return data?.display_name ?? null;
  } catch {
    // The greeting is decoration — never block the screen on it.
    return null;
  }
}

/**
 * Home: welcoming hero, real groups, clear Create / Join entry points.
 * No individual-recommendation flow exists in the backend, so none is shown.
 */
export default function HomeScreen() {
  const [groups, setGroups] = useState<GroupSummary[]>([]);
  const [status, setStatus] = useState<LoadStatus>('loading');
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const [groupList, name] = await Promise.all([
        getMyGroups(),
        fetchDisplayName(),
      ]);
      setGroups(groupList);
      setDisplayName(name);
      setStatus('ready');
    } catch (error) {
      console.error(error);
      setStatus('error');
    } finally {
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load])
  );

  const refresh = useCallback(() => {
    setRefreshing(true);
    void load();
  }, [load]);

  const header = (
    <View style={styles.headerRow}>
      <Text variant="h2" weight="bold" color={colors.ink}>
        {brand.name}
      </Text>
      <IconButton
        name="profile"
        variant="soft"
        accessibilityLabel="Open profile"
        onPress={() => router.push('/profile')}
      />
    </View>
  );

  return (
    <Screen
      header={header}
      withTabBar
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={refresh}
          tintColor={colors.ink}
        />
      }
    >
      {/* Hero */}
      <View style={[styles.hero, { backgroundColor: colors.blush }]}>
        <Text variant="micro" color={colors.ink} style={styles.eyebrow}>
          {displayName
            ? `GOOD TO SEE YOU, ${displayName.toUpperCase()}`
            : "LET'S FIND YOUR NEXT SPOT"}
        </Text>

        <Text variant="display" color={colors.ink}>
          Where should we go{' '}
          <Text variant="display" weight="bold">
            today?
          </Text>
        </Text>

        <Text variant="bodyLarge" color={colors.ink} style={styles.heroSubtitle}>
          Create a group, blend everyone's vibe, and let Outsy rank the spots
          you'll all enjoy.
        </Text>

        <View style={styles.heroActions}>
          <Button
            label="Create group"
            onPress={() => router.push('/group/create')}
            icon={<Plus size={18} color={colors.onInk} strokeWidth={2} />}
          />
          <Button
            label="Join with a code"
            variant="pastel"
            color={colors.surface}
            onPress={() => router.push('/groups')}
            icon={<User size={17} color={colors.ink} strokeWidth={1.9} />}
          />
        </View>
      </View>

      {/* Groups */}
      <View style={styles.section}>
        <SectionHeader
          title="Your groups"
          subtitle="Pick up where you left off"
          actionLabel={groups.length > 0 ? 'See all' : undefined}
          onAction={groups.length > 0 ? () => router.push('/groups') : undefined}
        />

        {status === 'loading' ? (
          <LoadingState
            title="Loading your groups…"
            subtitle="Fetching your crews from Outsy."
          />
        ) : status === 'error' ? (
          <ErrorState
            title="Could not load your groups"
            message="Your groups live on the server — check your connection and try again."
            onRetry={() => void load()}
          />
        ) : groups.length === 0 ? (
          <EmptyState
            tone={colors.powderBlue}
            icon={<Users size={30} color={colors.ink} strokeWidth={1.9} />}
            title="No groups yet"
            message="Start a crew with your friends — one invite code and you're in."
            actionLabel="Create your first group"
            onAction={() => router.push('/group/create')}
          />
        ) : (
          <View style={styles.groupList}>
            {groups.slice(0, 3).map((group, index) => (
              <GroupCard
                key={group.id}
                group={group}
                tone={GROUP_ACCENTS[index % GROUP_ACCENTS.length]}
                onPress={() =>
                  router.push({
                    pathname: '/group/[id]',
                    params: { id: group.id },
                  })
                }
              />
            ))}
          </View>
        )}
      </View>

      {/* How it works */}
      <View style={styles.section}>
        <SectionHeader title="How Outsy works" />
        <View style={styles.steps}>
          <StepCard
            tone={colors.mint}
            icon={<Users size={20} color={colors.ink} strokeWidth={1.9} />}
            label="Create your crew"
          />
          <StepCard
            tone={colors.powderBlue}
            icon={<Sparkles size={20} color={colors.ink} strokeWidth={1.9} />}
            label="Get ranked matches"
          />
          <StepCard
            tone={colors.lavender}
            icon={<Vote size={20} color={colors.ink} strokeWidth={1.9} />}
            label="Vote, then lock it in"
          />
        </View>
      </View>
    </Screen>
  );
}

function StepCard({
  tone,
  icon,
  label,
}: {
  tone: string;
  icon: ReactNode;
  label: string;
}) {
  return (
    <View style={[styles.step, { backgroundColor: tone }]}>
      <View style={styles.stepIcon}>
        <View pointerEvents="none">{icon}</View>
      </View>
      <Text variant="micro" color={colors.ink} style={styles.stepLabel}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 56,
    paddingTop: 4,
    paddingBottom: 4,
  },
  hero: {
    borderRadius: radii.hero,
    padding: spacing.lg,
    gap: spacing.md,
  },
  eyebrow: {
    letterSpacing: 1.2,
  },
  heroSubtitle: {
    color: colors.ink,
    opacity: 0.72,
  },
  heroActions: {
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  section: {
    marginTop: layout.sectionGap,
    gap: spacing.md,
  },
  groupList: {
    gap: spacing.sm,
  },
  steps: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  step: {
    flex: 1,
    borderRadius: 22,
    padding: 14,
    gap: 10,
    minHeight: 108,
  },
  stepIcon: {
    width: 36,
    height: 36,
    borderRadius: radii.pill,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepLabel: {
    letterSpacing: 0.3,
  },
});
