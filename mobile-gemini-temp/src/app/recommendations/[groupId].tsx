import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';

import { getGroupRecommendationBundle } from '@/lib/recommendations/group-recommendations';
import { getRecommendationExplanations } from '@/lib/recommendations/gemini-explanations';
import type { GroupPreferences } from '@/lib/recommendations/group-preferences';
import type { RankedPlace } from '@/lib/recommendations/rank';

export default function RecommendationsScreen() {
  const { groupId } = useLocalSearchParams<{ groupId: string }>();
  const [places, setPlaces] = useState<RankedPlace[]>([]);
  const [loading, setLoading] = useState(true);
  const [preferences, setPreferences] = useState<GroupPreferences | null>(null);
  const [explanations, setExplanations] = useState<Record<string, string>>({});
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadRecommendations() {
      if (!groupId) {
        setLoading(false);
        return;
      }

      try {
        const result = await getGroupRecommendationBundle(groupId);
        if (active) {
          setPlaces(result.places);
          setPreferences(result.preferences);
          setAiLoading(true);
          getRecommendationExplanations(result.preferences, result.places)
            .then((nextExplanations) => {
              if (active) setExplanations(nextExplanations);
            })
            .catch((aiError) => {
              // Recommendations still work if Gemini is unavailable.
              console.warn('Gemini explanations unavailable', aiError);
            })
            .finally(() => {
              if (active) setAiLoading(false);
            });
        }
      } catch (error) {
        console.error(error);
        if (active) {
          Alert.alert(
            'Could not load recommendations',
            error instanceof Error ? error.message : 'Something went wrong.'
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadRecommendations();

    return () => {
      active = false;
    };
  }, [groupId]);

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" />
        <Text>Finding your best matches…</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Recommendations</Text>

        {preferences && (
          <View style={styles.consensusCard}>
            <Text style={styles.consensusTitle}>Group consensus</Text>
            <Text style={styles.meta}>
              {preferences.memberCount} member{preferences.memberCount === 1 ? '' : 's'} · ${preferences.budget.toFixed(2)} budget/person
            </Text>
            <Text style={styles.meta}>
              {preferences.interests.length === 0
                ? 'No interests selected yet'
                : preferences.interests.slice(0, 5).map((interest) =>
                    `${interest.name} ${Math.round(interest.memberShare * 100)}%`
                  ).join(' · ')}
            </Text>
          </View>
        )}

        {places.length === 0 ? (
          <Text style={styles.empty}>No recommendations are available yet.</Text>
        ) : (
          places.map((place, index) => (
            <View key={place.id} style={styles.card}>
              <Text style={styles.rank}>#{index + 1}</Text>
              <Text style={styles.name}>{place.name}</Text>
              <Text style={styles.meta}>{place.categories.join(' • ')}</Text>
              <Text style={styles.meta}>{place.address}</Text>
              <Text style={styles.score}>{place.recommendation.score}% match</Text>
              <Text style={styles.meta}>
                ${place.estimatedCost.toFixed(2)} • {place.distanceMiles.toFixed(1)} mi • {place.travelTimeMinutes} min
              </Text>
              {index < 3 && (
                <View style={styles.aiBox}>
                  <Text style={styles.aiTitle}>Why this fits your group</Text>
                  <Text style={styles.aiText}>
                    {explanations[place.id] ??
                      (aiLoading
                        ? 'Gemini is explaining this match…'
                        : 'AI explanation is unavailable right now. Your recommendation score is still calculated normally.')}
                  </Text>
                </View>
              )}
              <View style={styles.breakdown}>
                <Text>Distance {place.recommendation.breakdown.distance}%</Text>
                <Text>Travel {place.recommendation.breakdown.travelTime}%</Text>
                <Text>Budget {place.recommendation.breakdown.budget}%</Text>
                <Text>Interests {place.recommendation.breakdown.interests}%</Text>
                <Text>Availability {place.recommendation.breakdown.availability}%</Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  content: { padding: 24, gap: 16 },
  title: { fontSize: 30, fontWeight: '700' },
  empty: { opacity: 0.65 },
  card: { borderWidth: 1, borderColor: '#e5e5e5', borderRadius: 16, padding: 18, gap: 6 },
  rank: { fontSize: 12, fontWeight: '700', opacity: 0.5 },
  name: { fontSize: 20, fontWeight: '700' },
  score: { fontSize: 18, fontWeight: '700', marginTop: 6 },
  meta: { opacity: 0.65 },
  breakdown: { marginTop: 8, gap: 3 },
  consensusCard: { borderWidth: 1, borderColor: '#e5e5e5', borderRadius: 16, padding: 16, gap: 5 },
  consensusTitle: { fontSize: 17, fontWeight: '700' },
  aiBox: { marginTop: 10, padding: 12, borderRadius: 12, backgroundColor: '#f4f4f5', gap: 4 },
  aiTitle: { fontSize: 14, fontWeight: '700' },
  aiText: { lineHeight: 20, opacity: 0.8 },
});
