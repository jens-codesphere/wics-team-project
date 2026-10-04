export type MemberProfile = {
    budget: number | null
    interests: string[] | null
    transportation: string | null
}

export type GroupPreferences = {
    budget: number
    interests: string[]
}

export function buildGroupPreferences(
    members: MemberProfile[],
    groupBudget: number | null
): GroupPreferences {
    const interestCounts =
        new Map<string, number>()

    for (const member of members) {
        for (const interest of member.interests ?? []) {
            const normalized =
                interest.trim().toLowerCase()

            if (!normalized) continue

            interestCounts.set(
                normalized,
                (interestCounts.get(normalized) ?? 0) + 1
            )
        }
    }

    const interests =
        [...interestCounts.entries()]
            .sort((a, b) => b[1] - a[1])
            .map(([interest]) => interest)

    return {
        budget: groupBudget ?? 20,
        interests,
    }
}