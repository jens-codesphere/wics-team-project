import { rankPlaces } from './rank'
import { mockPlaces } from './mock-places'

const groupBudget = 20

const rankedPlaces = rankPlaces(
    mockPlaces,
    groupBudget
)

console.log(
    '\n===== RECOMMENDATIONS =====\n'
)

for (const place of rankedPlaces) {
    console.log(
        `${place.name}: ${place.recommendation.score}`
    )

    console.log(
        place.recommendation.breakdown
    )

    console.log(
        '--------------------'
    )
}