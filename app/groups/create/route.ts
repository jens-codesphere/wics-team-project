import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    const supabase = await createClient()

    // Make sure the user is logged in
    const { data: claimsData } = await supabase.auth.getClaims()

    if (!claimsData?.claims) {
        return NextResponse.redirect(
            new URL('/login', request.url),
            { status: 302 }
        )
    }

    const userId = claimsData.claims.sub

    // Read the submitted form
    const formData = await request.formData()

    const name = String(formData.get('name') ?? '').trim()
    const budgetValue = String(
        formData.get('budget') ?? ''
    ).trim()

    // Validate group name
    if (!name) {
        return NextResponse.redirect(
            new URL('/groups?error=missing-name', request.url),
            { status: 303 }
        )
    }

    // Validate budget
    let budget: number | null = null

    if (budgetValue) {
        const parsedBudget = Number(budgetValue)

        if (!Number.isFinite(parsedBudget) || parsedBudget < 0) {
            return NextResponse.redirect(
                new URL('/groups?error=invalid-budget', request.url),
                { status: 303 }
            )
        }

        budget = parsedBudget
    }

    // Create the group
    const { data: group, error: groupError } = await supabase
        .from('groups')
        .insert({
            name,
            budget,
            created_by: userId,
        })
        .select('id, join_code')
        .single()

    if (groupError || !group) {
        console.error('Group creation error:', groupError)

        return NextResponse.redirect(
            new URL('/groups?error=group-create-failed', request.url),
            { status: 303 }
        )
    }

    // Add the creator as the first group member
    const { error: memberError } = await supabase
        .from('group_members')
        .insert({
            group_id: group.id,
            user_id: userId,
        })

    if (memberError) {
        console.error('Membership creation error:', memberError)

        // Clean up the group if membership creation fails
        await supabase
            .from('groups')
            .delete()
            .eq('id', group.id)

        return NextResponse.redirect(
            new URL('/groups?error=member-create-failed', request.url),
            { status: 303 }
        )
    }

    // Make sure /groups fetches the newly-created data
    revalidatePath('/groups')

    return NextResponse.redirect(
        new URL('/groups', request.url),
        { status: 303 }
    )
}