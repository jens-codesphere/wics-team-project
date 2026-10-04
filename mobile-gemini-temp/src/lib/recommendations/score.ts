export type RecommendationInput = {
    distanceMiles: number
    travelTimeMinutes: number
    estimatedCost: number
    groupBudget: number
    interestMatch: number
    availabilityMatch: number
}

export type RecommendationResult = {
    score: number
    breakdown: {
        distance: number
        travelTime: number
        budget: number
        interests: number
        availability: number
    }
}

function clamp(
    value: number,
    min = 0,
    max = 1
) {
    return Math.min(Math.max(value, min), max)
}

function scoreDistance(
    distanceMiles: number
) {
    return clamp(
        1 - distanceMiles / 10
    )
}

function scoreTravelTime(
    travelTimeMinutes: number
) {
    return clamp(
        1 - travelTimeMinutes / 60
    )
}

function scoreBudget(
    estimatedCost: number,
    groupBudget: number
) {
    if (groupBudget <= 0) {
        return 0.5
    }

    return clamp(
        groupBudget /
            Math.max(
                estimatedCost,
                groupBudget
            )
    )
}

export function calculateRecommendationScore(
    input: RecommendationInput
): RecommendationResult {
    const distance =
        scoreDistance(
            input.distanceMiles
        )

    const travelTime =
        scoreTravelTime(
            input.travelTimeMinutes
        )

    const budget =
        scoreBudget(
            input.estimatedCost,
            input.groupBudget
        )

    const interests =
        clamp(
            input.interestMatch
        )

    const availability =
        clamp(
            input.availabilityMatch
        )

    const score =
        distance * 0.30 +
        travelTime * 0.25 +
        budget * 0.20 +
        interests * 0.15 +
        availability * 0.10

    return {
        score: Number(
            (score * 100).toFixed(2)
        ),

        breakdown: {
            distance: Number(
                (distance * 100).toFixed(2)
            ),

            travelTime: Number(
                (travelTime * 100).toFixed(2)
            ),

            budget: Number(
                (budget * 100).toFixed(2)
            ),

            interests: Number(
                (interests * 100).toFixed(2)
            ),

            availability: Number(
                (availability * 100).toFixed(2)
            ),
        },
    }
}