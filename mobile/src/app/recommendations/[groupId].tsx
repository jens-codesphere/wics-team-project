import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { Share, StyleSheet, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import {
  Clock,
  MapPin,
  Navigation,
  Share2,
  Sparkles,
  Wallet,
} from 'lucide-react-native';

import {
  Button,
  Card,
  Chip,
  EmptyState,
  ErrorState,
  LoadingState,
  Screen,
  SectionHeader,
  Text,
} from '@/components/ui';
import { getGroupRecommendationBundle } from '@/lib/recommendations/group-recommendations';
import { getRecommendationExplanations } from '@/lib/recommendations/gemini-explanations';
import type { GroupPreferences } from '@/lib/recommendations/group-preferences';
import type { RankedPlace } from '@/lib/recommendations/rank';
import { colors, radii, spacing } from '@/theme/tokens';

type LoadStatus = 'loading' | 'ready' | 'error';

type BreakdownKey = keyof RankedPlace['recommendation']['breakdown'];

/** Approved rank palette: #1 powder blue, #2 mint, #3 soft lilac. */
const RANK_TONES = [colors.powderBlue, colors.mint, colors.lilac];

const BREAKDOWN_ITEMS: Array<[string, BreakdownKey]> = [
  ['Distance', 'distance'],
  ['Travel', 'travelTime'],
  ['Budget', 'budget'],
  ['Interests', 'interests'],
  ['Availability', 'availability'],
];

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

/** Scores carry two decimals in the engine — round for display only. */
function whole(value: number): number {
  return Math.round(value);
}

/**
 * Recommendations: real deterministic rankings, group consensus, and Gemini
 * explanations for the top three. Ranking and explanation loading logic are
 * unchanged from the working build — this pass only restyles presentation.
 */
export default function RecommendationsScreen() {
  const { groupId } = useLocalSearchParams<{ groupId: string }>();
  const [places, setPlaces] = useState<RankedPlace[]>([]);
  const [preferences, setPreferences] = useState<GroupPreferences | null>(null);
  const [explanations, setExplanations] = useState<Record<string, string>>({});
  const [aiLoading, setAiLoading] = useState(false);
  const [status, setStatus] = useState<LoadStatus>('loading');
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;

    async function loadRecommendations() {
      if (!groupId) {
        setStatus('ready');
        return;
      }

      setStatus('loading');
      setExplanations({});

      try {
        const result = await getGroupRecommendationBundle(groupId);
        if (!active) return;

        setPlaces(result.places);
        setPreferences(result.preferences);
        setStatus('ready');

        if (result.places.length === 0) return;

        // Gemini explains the top three only — it never changes ranking.
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
      } catch (error) {
        console.error(error);
        if (active) setStatus('error');
      }
    }

    void loadRecommendations();

    return () => {
      active = false;
    };
  }, [groupId, reloadKey]);

  const retry = useCallback(() => setReloadKey((key) => key + 1), []);

  const topPlace = places[0];

  async function shareTopPick() {
    if (!topPlace) return;

    try {
      await Share.share({
        message:
          `Our top Outsy pick: ${topPlace.name} ` +
          `(${whole(topPlace.recommendation.score)}% match for the group). ` +
          `${topPlace.address} · about ${topPlace.distanceMiles.toFixed(1)} mi / ` +
          `${topPlace.travelTimeMinutes} min · est. $${topPlace.estimatedCost.toFixed(2)}.`,
      });
    } catch {
      // Sharing was dismissed — nothing to surface.
    }
  }

  if (status === 'loading') {
    return (
      <Screen showBack>
        <LoadingState
          title="Finding your best matches…"
          subtitle="Ranking every spot against your group's vibe."
        />
      </Screen>
    );
  }

  if (status === 'error') {
    return (
      <Screen showBack>
        <ErrorState
          title="Could not load recommendations"
          message="We couldn't reach Outsy right now. Check your connection and try again."
          onRetry={retry}
        />
      </Screen>
    );
  }

  return (
    <Screen
      showBack
      contentStyle={styles.content}
      footer={
        topPlace ? (
          <Button
            label="Share the top pick"
            onPress={() => void shareTopPick()}
            icon={<Share2 size={18} color={colors.onInk} strokeWidth={1.9} />}
          />
        ) : undefined
      }
    >
      <View style={styles.intro}>
        <Text variant="h1" color={colors.ink}>
          Recommendations
        </Text>
        <Text variant="bodyLarge" color={colors.ink} style={styles.subtitle}>
          Ranked for your crew by distance, travel time, budget, interests and
          availability.
        </Text>
      </View>

      {preferences && (
        <Card tone={colors.mint} radius={radii.cardLarge}>
          <Text variant="micro" color={colors.ink} style={styles.eyebrow}>
            GROUP CONSENSUS
          </Text>
          <Text variant="cardTitle" color={colors.ink}>
            {preferences.memberCount}{' '}
            {preferences.memberCount === 1 ? 'member' : 'members'} · $
            {preferences.budget.toFixed(2)} per person
          </Text>
          {preferences.interests.length === 0 ? (
            <Text variant="caption" color={colors.ink}>
              No interests selected yet — members can add theirs from their
              profile.
            </Text>
          ) : (
            <View style={styles.chips}>
              {preferences.interests.slice(0, 5).map((interest) => (
                <Chip
                  key={interest.name}
                  label={`${capitalize(interest.name)} ${whole(
                    interest.memberShare * 100
                  )}%`}
                  selected
                  color={colors.surface}
                />
              ))}
            </View>
          )}
        </Card>
      )}

      {places.length === 0 ? (
        <EmptyState
          tone={colors.powderBlue}
          icon={<Sparkles size={30} color={colors.ink} strokeWidth={1.9} />}
          title="No recommendations yet"
          message="Once your group has members and interests, ranked spots will show up here."
          actionLabel="Back to group"
          onAction={() => {
            if (router.canGoBack()) router.back();
            else router.replace('/groups');
          }}
        />
      ) : (
        <>
          <SectionHeader
            title="Ranked matches"
            subtitle={`${places.length} spots scored for this group`}
          />
          <View style={styles.list}>
            {places.map((place, index) => (
              <PlaceCard
                key={place.id}
                place={place}
                index={index}
                explanation={explanations[place.id]}
                aiLoading={aiLoading}
              />
            ))}
          </View>
        </>
      )}
    </Screen>
  );
}

function PlaceCard({
  place,
  index,
  explanation,
  aiLoading,
}: {
  place: RankedPlace;
  index: number;
  explanation?: string;
  aiLoading: boolean;
}) {
  const tone = index < RANK_TONES.length ? RANK_TONES[index] : colors.surface;
  const onPastel = tone !== colors.surface;
  // Pastel cards use white sub-surfaces; white cards use the soft chip fill.
  const softFill = onPastel ? colors.surface : colors.chipBackground;
  const showExplanation = index < 3;

  return (
    <Card
      tone={tone}
      radius={radii.cardLarge}
      elevated={!onPastel}
      style={styles.placeCard}
    >
      <View style={styles.placeHeader}>
        <View style={styles.placeTitles}>
          {index === 0 ? (
            <View style={styles.recommended}>
              <Sparkles size={13} color={colors.ink} strokeWidth={2} />
              <Text variant="micro" color={colors.ink}>
                RECOMMENDED
              </Text>
            </View>
          ) : (
            <Text
              variant="micro"
              color={colors.ink}
              style={styles.rank}
            >{`#${index + 1} MATCH`}</Text>
          )}
          <Text variant="h3" color={colors.ink}>
            {place.name}
          </Text>
        </View>

        <View style={[styles.scorePill, { backgroundColor: softFill }]}>
          <Text variant="cardTitle" color={colors.ink}>
            {whole(place.recommendation.score)}%
          </Text>
          <Text variant="micro" color={colors.textSecondary}>
            MATCH
          </Text>
        </View>
      </View>

      {place.categories.length > 0 ? (
        <View style={styles.chips}>
          {place.categories.slice(0, 4).map((category) => (
            <Chip
              key={category}
              label={capitalize(category)}
              selected
              color={softFill}
            />
          ))}
        </View>
      ) : null}

      {/* Factual metadata the app already has — nothing invented. */}
      <View style={[styles.metaBox, { backgroundColor: softFill }]}>
        {place.address ? (
          <View style={styles.metaRow}>
            <MapPin size={16} color={colors.ink} strokeWidth={1.9} />
            <Text variant="body" color={colors.ink} style={styles.metaText}>
              {place.address}
            </Text>
          </View>
        ) : null}
        <View style={styles.statRow}>
          <MetaIcon
            icon={<Wallet size={15} color={colors.ink} strokeWidth={1.9} />}
            label="EST. COST"
            value={`$${place.estimatedCost.toFixed(2)}`}
          />
          <MetaIcon
            icon={<Navigation size={15} color={colors.ink} strokeWidth={1.9} />}
            label="DISTANCE"
            value={`${place.distanceMiles.toFixed(1)} mi`}
          />
          <MetaIcon
            icon={<Clock size={15} color={colors.ink} strokeWidth={1.9} />}
            label="TRAVEL"
            value={`${place.travelTimeMinutes} min`}
          />
        </View>
      </View>

      {/* Gemini is supporting content — the card works without it. */}
      {showExplanation ? (
        <View style={[styles.aiBox, { backgroundColor: softFill }]}>
          <View style={styles.aiHeader}>
            <Sparkles size={15} color={colors.ink} strokeWidth={1.9} />
            <Text variant="label" color={colors.ink}>
              Why it fits your group
            </Text>
          </View>
          <Text variant="body" color={colors.ink} style={styles.aiText}>
            {explanation ??
              (aiLoading
                ? 'Gemini is writing an explanation for this match…'
                : 'AI explanation is unavailable right now — your match score is still calculated the same way.')}
          </Text>
        </View>
      ) : null}

      <View style={styles.breakdown}>
        <Text
          variant="micro"
          color={colors.ink}
          style={[styles.eyebrow, styles.breakdownTitle]}
        >
          HOW WE SCORED IT
        </Text>
        <View style={styles.breakdownRow}>
          {BREAKDOWN_ITEMS.map(([label, key]) => (
            <View
              key={label}
              style={[styles.breakdownPill, { backgroundColor: softFill }]}
            >
              <Text variant="caption" color={colors.textSecondary}>
                {label}
              </Text>
              <Text variant="label" color={colors.ink}>
                {whole(place.recommendation.breakdown[key])}%
              </Text>
            </View>
          ))}
        </View>
      </View>
    </Card>
  );
}

function MetaIcon({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.metaStat}>
      <View style={styles.metaStatLabel}>
        <View pointerEvents="none">{icon}</View>
        <Text variant="micro" color={colors.textSecondary}>
          {label}
        </Text>
      </View>
      <Text variant="label" color={colors.ink} numberOfLines={1}>
        {value}
      </Text>
    </View>
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
  eyebrow: {
    letterSpacing: 1.2,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  list: {
    gap: spacing.sm,
  },
  placeCard: {
    gap: spacing.md,
  },
  placeHeader: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  placeTitles: {
    flex: 1,
    gap: 8,
  },
  recommended: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    backgroundColor: colors.butter,
    borderRadius: radii.pill,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  rank: {
    letterSpacing: 1.2,
    opacity: 0.6,
  },
  scorePill: {
    alignItems: 'center',
    gap: 2,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: radii.pill,
    minWidth: 78,
    flexShrink: 0,
  },
  metaBox: {
    borderRadius: 20,
    padding: 14,
    gap: 12,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  metaText: {
    flex: 1,
  },
  statRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  metaStat: {
    flex: 1,
    gap: 4,
  },
  metaStatLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  aiBox: {
    borderRadius: 20,
    padding: 14,
    gap: 8,
  },
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  aiText: {
    lineHeight: 22,
  },
  breakdown: {
    gap: 8,
  },
  breakdownTitle: {
    opacity: 0.6,
  },
  breakdownRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  breakdownPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 7,
    paddingHorizontal: 11,
    borderRadius: 14,
  },
});
