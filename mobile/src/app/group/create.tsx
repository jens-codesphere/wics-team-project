import { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';

import { Button, Input, Screen, Text } from '@/components/ui';
import { createGroup } from '@/lib/groups';
import { colors, spacing } from '@/theme/tokens';

/**
 * Create group: same RPC flow as before, restyled with shared primitives.
 */
export default function CreateGroupScreen() {
  const [name, setName] = useState('');
  const [budget, setBudget] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleCreate() {
    const trimmedName = name.trim();

    if (!trimmedName) {
      Alert.alert('Missing name', 'Enter a name for your group.');
      return;
    }

    let parsedBudget: number | null = null;

    if (budget.trim()) {
      parsedBudget = Number(budget);

      if (!Number.isFinite(parsedBudget) || parsedBudget < 0) {
        Alert.alert('Invalid budget', 'Enter a valid non-negative budget.');
        return;
      }
    }

    try {
      setLoading(true);

      const groupId = await createGroup(trimmedName, parsedBudget);

      router.replace({
        pathname: '/group/[id]',
        params: { id: groupId },
      });
    } catch (error) {
      console.error(error);

      Alert.alert(
        'Could not create group',
        error instanceof Error ? error.message : 'Something went wrong.'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen
      showBack
      title="New group"
      footer={
        <Button
          label="Create group"
          onPress={() => void handleCreate()}
          loading={loading}
          disabled={loading}
        />
      }
    >
      <View style={styles.intro}>
        <Text variant="h1" color={colors.ink}>
          Create a group
        </Text>
        <Text variant="bodyLarge" color={colors.ink} style={styles.subtitle}>
          Name your crew and set an optional per-person budget.
        </Text>
      </View>

      <View style={styles.form}>
        <Input
          label="Group name"
          placeholder="Saturday crew"
          autoCapitalize="sentences"
          value={name}
          onChangeText={setName}
          containerStyle={styles.field}
        />

        <Input
          label="Group budget per person"
          placeholder="20"
          keyboardType="decimal-pad"
          value={budget}
          onChangeText={setBudget}
          hint="Leave this blank to use the default recommendation budget."
          containerStyle={styles.field}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  intro: {
    gap: 6,
    paddingTop: spacing.xs,
  },
  subtitle: {
    color: colors.ink,
    opacity: 0.72,
  },
  form: {
    marginTop: spacing.xxl,
    gap: spacing.lg,
  },
  field: {
    gap: 8,
  },
});
