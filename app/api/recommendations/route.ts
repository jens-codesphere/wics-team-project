import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { rankPlaces } from '@/lib/recommendations/rank'
import { mockPlaces } from '@/lib/recommendations/mock-places'

export async function GET() {
    const supabase =
        await createClient()

    const { data: claimsData } =
        await supabase.auth.getClaims()

    if (!claimsData?.claims) {
        return NextResponse.json(
            {
                error: 'Not authenticated',
            },
            {
                status: 401,
            }
        )
    }

    const userId =
        claimsData.claims.sub

    const { data: profile, error } =
        await supabase
            .from('profiles')
            .select(
                'budget, interests, transportation'
            )
            .eq('id', userId)
            .single()

    if (error) {
        return NextResponse.json(
            {
                error:
                    'Could not load user profile',
            },
            {
                status: 500,
            }
        )
    }

    const groupBudget =
        profile.budget ?? 20

    const rankedPlaces =
        rankPlaces(
            mockPlaces,
            groupBudget
        )

    return NextResponse.json({
        recommendations:
            rankedPlaces,
    })
}