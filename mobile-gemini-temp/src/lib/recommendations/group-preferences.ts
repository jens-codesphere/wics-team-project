export type MemberProfile = {
  budget: number | null
  interests: string[] | null
  transportation: string | null
}

export type WeightedInterest = {
  name: string
  memberCount: number
  memberShare: number
}

export type GroupPreferences = {
  budget: number
  interests: WeightedInterest[]
  memberCount: number
}

function normalizeInterest(value: string) {
  return value.trim().toLowerCase()
}

export function buildGroupPreferences(
  members: MemberProfile[],
  groupBudget: number | null
): GroupPreferences {
  const interestCounts = new Map<string, number>()

  for (const member of members) {
    // A member should only count once for a given interest, even if their
    // profile accidentally contains duplicate tags.
    const uniqueInterests = new Set(
      (member.interests ?? [])
        .map(normalizeInterest)
        .filter(Boolean)
    )

    for (const interest of uniqueInterests) {
      interestCounts.set(interest, (interestCounts.get(interest) ?? 0) + 1)
    }
  }

  const memberCount = members.length
  const interests: WeightedInterest[] = [...interestCounts.entries()]
    .map(([name, count]) => ({
      name,
      memberCount: count,
      memberShare: memberCount > 0 ? count / memberCount : 0,
    }))
    .sort((a, b) =>
      b.memberShare - a.memberShare || a.name.localeCompare(b.name)
    )

  return {
    budget: groupBudget ?? 20,
    interests,
    memberCount,
  }
}
