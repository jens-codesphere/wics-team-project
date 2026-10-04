import {
    calculateRecommendationScore,
    type RecommendationInput,
    type RecommendationResult,
} from './score'

export type PlaceCandidate = {
    id: string
    name: string
    address: string
    category: string
    estimatedCost: number
    distanceMiles: number
    travelTimeMinutes: number
    interestMatch: number
    availabilityMatch: number
}

export type RankedPlace =
    PlaceCandidate & {
        recommendation:
            RecommendationResult
    }

export function rankPlaces(
    places: PlaceCandidate[],
    groupBudget: number
): RankedPlace[] {
    return places
        .map((place) => {
            const input: RecommendationInput = {
                distanceMiles:
                    place.distanceMiles,

                travelTimeMinutes:
                    place.travelTimeMinutes,

                estimatedCost:
                    place.estimatedCost,

                groupBudget,

                interestMatch:
                    place.interestMatch,

                availabilityMatch:
                    place.availabilityMatch,
            }

            return {
                ...place,

                recommendation:
                    calculateRecommendationScore(
                        input
                    ),
            }
        })
        .sort(
            (a, b) =>
                b.recommendation.score -
                a.recommendation.score
        )
}