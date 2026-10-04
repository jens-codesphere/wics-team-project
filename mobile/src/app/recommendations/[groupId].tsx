import {
    useEffect,
    useState,
} from 'react'

import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native'

import { useLocalSearchParams } from 'expo-router'

import {
    getGroupRecommendations,
} from '@/lib/recommendations/group-recommendations'

import type {
    RankedPlace,
} from '@/lib/recommendations/rank'

export default function RecommendationsScreen() {
    const { groupId } =
        useLocalSearchParams<{
            groupId: string
        }>()

    const [
        recommendations,
        setRecommendations,
    ] = useState<RankedPlace[]>([])

    const [loading, setLoading] =
        useState(true)

    const [error, setError] =
        useState<string | null>(null)

    useEffect(() => {
        if (!groupId) {
            return
        }

        loadRecommendations()
    }, [groupId])

    async function loadRecommendations() {
        try {
            setLoading(true)
            setError(null)

            const results =
                await getGroupRecommendations(
                    groupId
                )

            setRecommendations(results)
        } catch (caughtError) {
            console.error(caughtError)

            setError(
                caughtError instanceof Error
                    ? caughtError.message
                    : 'Could not generate recommendations.'
            )
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" />

                <Text>
                    Finding the best places
                    for your group...
                </Text>
            </View>
        )
    }

    if (error) {
        return (
            <View style={styles.center}>
                <Text style={styles.error}>
                    {error}
                </Text>
            </View>
        )
    }

    return (
        <ScrollView
            contentContainerStyle={
                styles.container
            }
        >
            <Text style={styles.title}>
                Your Matches
            </Text>

            <Text style={styles.subtitle}>
                Ranked for your group
            </Text>

            {recommendations.map(
                (place, index) => (
                    <View
                        key={place.id}
                        style={styles.card}
                    >
                        <Text style={styles.rank}>
                            #{index + 1}
                        </Text>

                        <Text
                            style={
                                styles.placeName
                            }
                        >
                            {place.name}
                        </Text>

                        <Text>
                            {place.address}
                        </Text>

                        <Text>
                            {place.categories.join(
                                ' • '
                            )}
                        </Text>

                        <Text
                            style={
                                styles.score
                            }
                        >
                            {
                                place
                                    .recommendation
                                    .score
                            }
                            % match
                        </Text>

                        <Text>
                            Estimated cost: $
                            {
                                place
                                    .estimatedCost
                            }
                        </Text>

                        <Text>
                            Distance:{' '}
                            {
                                place
                                    .distanceMiles
                            }{' '}
                            miles
                        </Text>

                        <Text>
                            Travel time:{' '}
                            {
                                place
                                    .travelTimeMinutes
                            }{' '}
                            min
                        </Text>

                        <View
                            style={
                                styles.breakdown
                            }
                        >
                            <Text>
                                Distance:{' '}
                                {
                                    place
                                        .recommendation
                                        .breakdown
                                        .distance
                                }
                            </Text>

                            <Text>
                                Travel:{' '}
                                {
                                    place
                                        .recommendation
                                        .breakdown
                                        .travelTime
                                }
                            </Text>

                            <Text>
                                Budget:{' '}
                                {
                                    place
                                        .recommendation
                                        .breakdown
                                        .budget
                                }
                            </Text>

                            <Text>
                                Interests:{' '}
                                {
                                    place
                                        .recommendation
                                        .breakdown
                                        .interests
                                }
                            </Text>

                            <Text>
                                Availability:{' '}
                                {
                                    place
                                        .recommendation
                                        .breakdown
                                        .availability
                                }
                            </Text>
                        </View>
                    </View>
                )
            )}
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
        gap: 16,
    },

    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 12,
        padding: 24,
    },

    title: {
        fontSize: 30,
        fontWeight: '700',
    },

    subtitle: {
        fontSize: 16,
    },

    card: {
        padding: 18,
        borderWidth: 1,
        borderColor: '#dddddd',
        borderRadius: 16,
        gap: 6,
    },

    rank: {
        fontWeight: '700',
    },

    placeName: {
        fontSize: 22,
        fontWeight: '700',
    },

    score: {
        fontSize: 20,
        fontWeight: '700',
        marginVertical: 6,
    },

    breakdown: {
        marginTop: 10,
        gap: 3,
    },

    error: {
        textAlign: 'center',
    },
})