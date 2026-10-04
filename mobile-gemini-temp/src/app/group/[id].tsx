import { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Pressable,
    RefreshControl,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    View,
    } from 'react-native';
    import {
    router,
    useFocusEffect,
    useLocalSearchParams,
    } from 'expo-router';

    import {
    getGroup,
    getGroupMembers,
    type GroupMember,
    type GroupSummary,
    } from '@/lib/groups';

    export default function GroupLobbyScreen() {
    const { id } = useLocalSearchParams<{
        id: string;
    }>();

    const [group, setGroup] =
        useState<GroupSummary | null>(null);

    const [members, setMembers] =
        useState<GroupMember[]>([]);

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadGroup = useCallback(async () => {
        if (!id) return;

        try {
        const [groupData, memberData] =
            await Promise.all([
            getGroup(id),
            getGroupMembers(id),
            ]);

        setGroup(groupData);
        setMembers(memberData);
        } catch (error) {
        console.error(error);

        Alert.alert(
            'Could not load group',
            error instanceof Error
            ? error.message
            : 'Something went wrong.'
        );
        } finally {
        setLoading(false);
        setRefreshing(false);
        }
    }, [id]);

    useFocusEffect(
        useCallback(() => {
        loadGroup();
        }, [loadGroup])
    );

    async function refresh() {
        setRefreshing(true);
        await loadGroup();
    }

    if (loading) {
        return (
        <SafeAreaView style={styles.center}>
            <ActivityIndicator size="large" />
        </SafeAreaView>
        );
    }

    if (!group) {
        return (
        <SafeAreaView style={styles.center}>
            <Text>Group not found.</Text>
        </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
        <ScrollView
            contentContainerStyle={styles.content}
            refreshControl={
            <RefreshControl
                refreshing={refreshing}
                onRefresh={refresh}
            />
            }
        >
            <Text style={styles.title}>
            {group.name}
            </Text>

            <View style={styles.codeCard}>
            <Text style={styles.smallLabel}>
                INVITE CODE
            </Text>

            <Text style={styles.code}>
                {group.join_code ?? '------'}
            </Text>

            <Text style={styles.help}>
                Share this code with your friends.
            </Text>
            </View>

            <View style={styles.section}>
            <Text style={styles.sectionTitle}>
                Group budget
            </Text>

            <Text style={styles.value}>
                {group.budget !== null
                ? `$${Number(group.budget).toFixed(2)} per person`
                : 'Using default budget'}
            </Text>
            </View>

            <View style={styles.section}>
            <Text style={styles.sectionTitle}>
                Members ({members.length})
            </Text>

            {members.map((member) => (
                <View
                key={member.id}
                style={styles.memberCard}
                >
                <Text style={styles.memberName}>
                    {member.displayName}
                </Text>

                {member.interests.length > 0 && (
                    <Text style={styles.memberDetails}>
                    {member.interests.join(' • ')}
                    </Text>
                )}

                {member.transportation && (
                    <Text style={styles.memberDetails}>
                    {member.transportation}
                    </Text>
                )}
                </View>
            ))}
            </View>

            <Pressable
            style={styles.primaryButton}
            onPress={() =>
                router.push({
                pathname:
                    '/recommendations/[groupId]',
                params: {
                    groupId: group.id,
                },
                })
            }
            >
            <Text style={styles.primaryButtonText}>
                Find our match
            </Text>
            </Pressable>
        </ScrollView>
        </SafeAreaView>
    );
    }

    const styles = StyleSheet.create({
    container: {
        flex: 1,
    },

    content: {
        padding: 24,
        gap: 20,
    },

    center: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },

    title: {
        fontSize: 30,
        fontWeight: '700',
    },

    codeCard: {
        borderWidth: 1,
        borderColor: '#dddddd',
        borderRadius: 16,
        padding: 20,
        alignItems: 'center',
    },

    smallLabel: {
        fontSize: 12,
        fontWeight: '700',
        opacity: 0.5,
    },

    code: {
        fontSize: 30,
        fontWeight: '800',
        letterSpacing: 6,
        marginVertical: 8,
    },

    help: {
        opacity: 0.6,
    },

    section: {
        gap: 10,
    },

    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
    },

    value: {
        fontSize: 16,
    },

    memberCard: {
        borderWidth: 1,
        borderColor: '#eeeeee',
        borderRadius: 12,
        padding: 14,
        gap: 4,
    },

    memberName: {
        fontWeight: '700',
        fontSize: 16,
    },

    memberDetails: {
        opacity: 0.65,
    },

    primaryButton: {
        backgroundColor: '#111111',
        paddingVertical: 17,
        borderRadius: 14,
        alignItems: 'center',
        marginTop: 10,
    },

    primaryButtonText: {
        color: '#ffffff',
        fontWeight: '700',
        fontSize: 16,
    },
});