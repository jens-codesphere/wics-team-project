export type Recommendation = {
    placeId: string
    name: string
    address: string | null
    category: string
    score: number
    estimatedCost: number
    distanceMiles: number
    travelTimeMinutes: number
    breakdown: {
        distance: number
        travelTime: number
        budget: number
        interests: number
        availability: number
    }
}