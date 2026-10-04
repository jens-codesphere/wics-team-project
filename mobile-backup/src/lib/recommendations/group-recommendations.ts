import { supabase } from '@/lib/supabase'

import {
    buildGroupPreferences,
    type MemberProfile,
} from './group-preferences'

import {
    calculateInterestMatch,
} from './interest-match'

import { mockPlaces } from './mock-places'

import {
    rankPlaces,
    type PlaceCandidate,
} from './rank'

type MembershipRow = {
    user_id: string
}

type ProfileRow = {
    id: string
    budget: number | null
    interests: string[] | null
    transportation: string | null
}

export async function getGroupRecommendations(
    groupId: string
) {
    // 1. Load group

    const {
        data: group,
        error: groupError,
    } = await supabase
        .from('groups')
        .select('id, name, budget')
        .eq('id', groupId)
        .single()

    if (groupError) {
        throw groupError
    }

    // 2. Load members

    const {
        data: memberships,
        error: membershipError,
    } = await supabase
        .from('group_members')
        .select('user_id')
        .eq('group_id', groupId)

    if (membershipError) {
        throw membershipError
    }

    const membershipRows =
        (memberships ?? []) as MembershipRow[]

    const userIds =
        membershipRows.map(
            (membership) =>
                membership.user_id
        )

    if (userIds.length === 0) {
        return []
    }

    // 3. Load member profiles

    const {
        data: profiles,
        error: profilesError,
    } = await supabase
        .from('profiles')
        .select(
            'id, budget, interests, transportation'
        )
        .in('id', userIds)

    if (profilesError) {
        throw profilesError
    }

    const profileRows =
        (profiles ?? []) as ProfileRow[]

    // 4. Build group preferences

    const memberProfiles:
        MemberProfile[] =
        profileRows.map(
            (profile) => ({
                budget:
                    profile.budget,

                interests:
                    profile.interests,

                transportation:
                    profile.transportation,
            })
        )

    const groupPreferences =
        buildGroupPreferences(
            memberProfiles,
            group.budget
        )

    // 5. Calculate group interest fit

    const candidates:
        PlaceCandidate[] =
        mockPlaces.map(
            (place) => ({
                ...place,

                interestMatch:
                    calculateInterestMatch(
                        groupPreferences.interests,
                        place.categories
                    ),
            })
        )

    // 6. Rank

    return rankPlaces(
        candidates,
        groupPreferences.budget
    )
}