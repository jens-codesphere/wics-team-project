import { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Pressable,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    View,
    } from 'react-native';
    import { router } from 'expo-router';

    import { createGroup } from '@/lib/groups';

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
            Alert.alert(
            'Invalid budget',
            'Enter a valid non-negative budget.'
            );
            return;
        }
        }

        try {
        setLoading(true);

        const groupId = await createGroup(
            trimmedName,
            parsedBudget
        );

        router.replace({
            pathname: '/group/[id]',
            params: { id: groupId },
        });
        } catch (error) {
        console.error(error);

        Alert.alert(
            'Could not create group',
            error instanceof Error
            ? error.message
            : 'Something went wrong.'
        );
        } finally {
        setLoading(false);
        }
    }

    return (
        <SafeAreaView style={styles.container}>
        <Text style={styles.title}>Create a group</Text>

        <Text style={styles.label}>Group name</Text>

        <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Saturday crew"
            autoCapitalize="sentences"
        />

        <Text style={styles.label}>
            Group budget per person
        </Text>

        <TextInput
            style={styles.input}
            value={budget}
            onChangeText={setBudget}
            placeholder="20"
            keyboardType="decimal-pad"
        />

        <Text style={styles.help}>
            Leave this blank to use the default recommendation budget.
        </Text>

        <Pressable
            style={[
            styles.button,
            loading && styles.buttonDisabled,
            ]}
            onPress={handleCreate}
            disabled={loading}
        >
            {loading ? (
            <ActivityIndicator />
            ) : (
            <Text style={styles.buttonText}>
                Create group
            </Text>
            )}
        </Pressable>
        </SafeAreaView>
    );
    }

    const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 24,
        gap: 12,
    },

    title: {
        fontSize: 30,
        fontWeight: '700',
        marginBottom: 16,
    },

    label: {
        fontSize: 15,
        fontWeight: '600',
    },

    input: {
        borderWidth: 1,
        borderColor: '#cccccc',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 16,
    },

    help: {
        fontSize: 13,
        opacity: 0.65,
    },

    button: {
        marginTop: 20,
        paddingVertical: 16,
        borderRadius: 12,
        backgroundColor: '#111111',
        alignItems: 'center',
    },

    buttonDisabled: {
        opacity: 0.5,
    },

    buttonText: {
        color: '#ffffff',
        fontWeight: '700',
        fontSize: 16,
    },
});