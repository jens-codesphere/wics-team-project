import { useCallback, useState } from 'react';
import {
  Alert,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Plus, Users } from 'lucide-react-native';

import {
  Button,
  Card,
  EmptyState,
  ErrorState,
  GroupCard,
  Input,
  LoadingState,
  Screen,
  SectionHeader,
  Text,
} from '@/components/ui';
import { getMyGroups, joinGroup, type GroupSummary } from '@/lib/groups';
import { colors, radii, spacing } from '@/theme/tokens';

type LoadStatus = 'loading' | 'ready' | 'error';

const GROUP_ACCENTS = [colors.mint, colors.lavender, colors.butter, colors.powderBlue];

/**
 * Groups: real membership list, invite-code join, create entry point.
 */
export default function GroupsScreen() {
  const [groups, setGroups] = useState<GroupSummary[]>([]);
  const [status, setStatus] = useState<LoadStatus>('loading');
  const [refreshing, setRefreshing] = useState(false);
  const [code, setCode] = useState('');
  const [joining, setJoining] = useState(false);

  const load = useCallback(async () => {
    try {
      setGroups(await getMyGroups());
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

  async function join() {
    if (!code.trim()) {
      Alert.alert('Missing code', 'Enter a six-character invite code.');
      return;
    }

    try {
      setJoining(true);
      const id = await joinGroup(code);
      setCode('');
      router.push({ pathname: '/group/[id]', params: { id } });
    } catch (error) {
      Alert.alert(
        'Could not join group',
        error instanceof Error ? error.message : 'Something went wrong.'
      );
    } finally {
      setJoining(false);
    }
  }

  return (
    <Screen
      withTabBar
      contentStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={refresh}
          tintColor={colors.ink}
        />
      }
    >
      <View style={styles.intro}>
        <Text variant="h1" color={colors.ink}>
          Groups
        </Text>
        <Text variant="bodyLarge" color={colors.ink} style={styles.subtitle}>
          Your crews, your shared vibe, one decision everyone likes.
        </Text>
      </View>

      {/* Invite code */}
      <Card tone={colors.lavender} radius={radii.cardLarge} style={styles.joinCard}>
        <Text variant="cardTitle">Have an invite code?</Text>
        <View style={styles.joinRow}>
          <Input
            containerStyle={styles.codeInput}
            placeholder="ABC123"
            autoCapitalize="characters"
            autoCorrect={false}
            maxLength={6}
            value={code}
            onChangeText={(value) => setCode(value.toUpperCase())}
            accessibilityLabel="Invite code"
          />
          <Button
            label={joining ? 'Joining…' : 'Join'}
            variant="primary"
            fullWidth={false}
            disabled={joining}
            onPress={() => void join()}
            style={styles.joinButton}
          />
        </View>
        <Text variant="caption" color={colors.ink} style={styles.joinHint}>
          Ask a friend for their six-character group code.
        </Text>
      </Card>

      {/* Create */}
      <Button
        label="Create a group"
        variant="pastel"
        color={colors.mint}
        onPress={() => router.push('/group/create')}
        icon={<Plus size={18} color={colors.ink} strokeWidth={2} />}
      />

      {/* Existing groups */}
      <View style={styles.section}>
        <SectionHeader
          title="Existing groups"
          subtitle={
            groups.length > 0
              ? `${groups.length} ${groups.length === 1 ? 'group' : 'groups'}`
              : undefined
          }
        />

        {status === 'loading' ? (
          <LoadingState title="Loading your groups…" />
        ) : status === 'error' ? (
          <ErrorState
            title="Could not load your groups"
            message="We couldn't reach Outsy right now. Pull to refresh or try again."
            onRetry={() => void load()}
          />
        ) : groups.length === 0 ? (
          <EmptyState
            tone={colors.mint}
            icon={<Users size={30} color={colors.ink} strokeWidth={1.9} />}
            title="No groups yet"
            message="Create a group or join a friend's crew with an invite code."
            actionLabel="Create a group"
            onAction={() => router.push('/group/create')}
          />
        ) : (
          <View style={styles.groupList}>
            {groups.map((group, index) => (
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
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.lg,
  },
  intro: {
    gap: 6,
    paddingTop: spacing.xs,
  },
  subtitle: {
    color: colors.ink,
    opacity: 0.72,
  },
  joinCard: {
    gap: spacing.md,
  },
  joinRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'center',
  },
  codeInput: {
    flex: 1,
  },
  joinButton: {
    minWidth: 96,
    alignSelf: 'stretch',
  },
  joinHint: {
    color: colors.ink,
    opacity: 0.7,
  },
  section: {
    marginTop: spacing.md,
    gap: spacing.md,
  },
  groupList: {
    gap: spacing.sm,
  },
});
