import { supabase } from '@/lib/supabase'
import type { GroupPreferences } from './group-preferences'
import type { RankedPlace } from './rank'

export type RecommendationExplanation = {
  placeId: string
  explanation: string
}

export async function getRecommendationExplanations(
  preferences: GroupPreferences,
  places: RankedPlace[]
): Promise<Record<string, string>> {
  const topPlaces = places.slice(0, 3)
  if (topPlaces.length === 0) return {}

  const { data, error } = await supabase.functions.invoke('explain-recommendations', {
    body: {
      memberCount: preferences.memberCount,
      budget: preferences.budget,
      interests: preferences.interests.slice(0, 8),
      places: topPlaces.map((place) => ({
        id: place.id,
        name: place.name,
        address: place.address,
        categories: place.categories,
        score: place.recommendation.score,
        estimatedCost: place.estimatedCost,
        distanceMiles: place.distanceMiles,
        travelTimeMinutes: place.travelTimeMinutes,
        breakdown: place.recommendation.breakdown,
      })),
    },
  })

  if (error) throw error

  const explanations = (data?.explanations ?? []) as RecommendationExplanation[]
  return Object.fromEntries(
    explanations
      .filter(
        (item) =>
          typeof item.placeId === 'string' &&
          typeof item.explanation === 'string' &&
          item.explanation.trim().length > 0
      )
      .map((item) => [item.placeId, item.explanation.trim()])
  )
}
