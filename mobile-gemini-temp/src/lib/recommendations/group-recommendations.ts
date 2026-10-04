import { supabase } from '@/lib/supabase'
import {
  buildGroupPreferences,
  type GroupPreferences,
  type MemberProfile,
} from './group-preferences'
import { calculateInterestMatch } from './interest-match'
import { mockPlaces } from './mock-places'
import { rankPlaces, type PlaceCandidate } from './rank'

type MembershipRow = { user_id: string }
type ProfileRow = {
  id: string
  budget: number | null
  interests: string[] | null
  transportation: string | null
}

export async function getGroupRecommendationContext(
  groupId: string
): Promise<GroupPreferences> {
  const { data: group, error: groupError } = await supabase
    .from('groups')
    .select('id, budget')
    .eq('id', groupId)
    .single()

  if (groupError) throw groupError

  const { data: memberships, error: membershipError } = await supabase
    .from('group_members')
    .select('user_id')
    .eq('group_id', groupId)

  if (membershipError) throw membershipError

  const userIds = ((memberships ?? []) as MembershipRow[]).map(
    (membership) => membership.user_id
  )

  if (userIds.length === 0) {
    return buildGroupPreferences([], group.budget)
  }

  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('id, budget, interests, transportation')
    .in('id', userIds)

  if (profilesError) throw profilesError

  const memberProfiles: MemberProfile[] = ((profiles ?? []) as ProfileRow[]).map(
    (profile) => ({
      budget: profile.budget,
      interests: profile.interests,
      transportation: profile.transportation,
    })
  )

  return buildGroupPreferences(memberProfiles, group.budget)
}

export async function getGroupRecommendations(groupId: string) {
  const groupPreferences = await getGroupRecommendationContext(groupId)

  const candidates: PlaceCandidate[] = mockPlaces.map((place) => ({
    ...place,
    interestMatch: calculateInterestMatch(
      groupPreferences.interests,
      place.categories
    ),
  }))

  return rankPlaces(candidates, groupPreferences.budget)
}

export async function getGroupRecommendationBundle(groupId: string) {
  const preferences = await getGroupRecommendationContext(groupId)
  const candidates: PlaceCandidate[] = mockPlaces.map((place) => ({
    ...place,
    interestMatch: calculateInterestMatch(preferences.interests, place.categories),
  }))

  return {
    preferences,
    places: rankPlaces(candidates, preferences.budget),
  }
}
