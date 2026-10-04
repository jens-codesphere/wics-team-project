import type { WeightedInterest } from './group-preferences'

const CATEGORY_ALIASES: Record<string, string[]> = {
  cafe: ['cafe', 'cafes', 'coffee'],
  cafes: ['cafe', 'cafes', 'coffee'],
  coffee: ['cafe', 'cafes', 'coffee'],
  food: ['food', 'restaurant', 'restaurants', 'dining'],
  restaurant: ['food', 'restaurant', 'restaurants', 'dining'],
  restaurants: ['food', 'restaurant', 'restaurants', 'dining'],
  park: ['park', 'parks', 'outdoors', 'nature'],
  parks: ['park', 'parks', 'outdoors', 'nature'],
  outdoors: ['park', 'parks', 'outdoors', 'nature'],
  nature: ['park', 'parks', 'outdoors', 'nature'],
  game: ['game', 'games', 'entertainment'],
  games: ['game', 'games', 'entertainment'],
  music: ['music', 'entertainment'],
}

function normalize(value: string) {
  return value.trim().toLowerCase()
}

function matchesCategory(interest: string, categories: Set<string>) {
  const normalized = normalize(interest)
  const aliases = CATEGORY_ALIASES[normalized] ?? [normalized]
  return aliases.some((alias) => categories.has(alias))
}

/**
 * Returns a 0..1 group-consensus interest score.
 * Each interest is weighted by the share of group members who selected it,
 * so an interest shared by everyone contributes more than a one-person niche.
 */
export function calculateInterestMatch(
  groupInterests: WeightedInterest[],
  placeCategories: string[]
): number {
  if (groupInterests.length === 0) return 0.5

  const categories = new Set(placeCategories.map(normalize))
  const totalWeight = groupInterests.reduce(
    (sum, interest) => sum + interest.memberShare,
    0
  )

  if (totalWeight <= 0) return 0.5

  const matchedWeight = groupInterests.reduce(
    (sum, interest) =>
      sum + (matchesCategory(interest.name, categories) ? interest.memberShare : 0),
    0
  )

  return Math.min(matchedWeight / totalWeight, 1)
}
