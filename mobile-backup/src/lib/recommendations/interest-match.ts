export function calculateInterestMatch(
    groupInterests: string[],
    placeCategories: string[]
): number {
    if (groupInterests.length === 0) {
        return 0.5
    }

    const normalizedGroupInterests =
        groupInterests.map((interest) =>
            interest.trim().toLowerCase()
        )

    const normalizedPlaceCategories =
        placeCategories.map((category) =>
            category.trim().toLowerCase()
        )

    const matchingInterests =
        normalizedGroupInterests.filter(
            (interest) =>
                normalizedPlaceCategories.includes(
                    interest
                )
        )

    return Math.min(
        matchingInterests.length /
            normalizedGroupInterests.length,
        1
    )
}