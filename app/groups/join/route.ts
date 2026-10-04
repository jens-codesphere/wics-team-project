import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    const supabase = await createClient()

    const { data: claimsData } = await supabase.auth.getClaims()

    if (!claimsData?.claims) {
        return NextResponse.redirect(
            new URL('/login', request.url),
            { status: 302 }
        )
    }

    const formData = await request.formData()

    const joinCode = String(
        formData.get('joinCode') ?? ''
    )
        .trim()
        .toUpperCase()

    if (!joinCode || joinCode.length !== 6) {
        return NextResponse.redirect(
            new URL('/groups?error=invalid-join-code', request.url),
            { status: 303 }
        )
    }

    const { error: joinError } = await supabase.rpc(
        'join_group_by_code',
        {
            join_code_input: joinCode,
        }
    )

    if (joinError) {
        console.error('Join group error:', joinError)

        if (
            joinError.message
                .toLowerCase()
                .includes('group not found')
        ) {
            return NextResponse.redirect(
                new URL(
                    '/groups?error=group-not-found',
                    request.url
                ),
                { status: 303 }
            )
        }

        if (joinError.code === '23505') {
            return NextResponse.redirect(
                new URL(
                    '/groups?error=already-member',
                    request.url
                ),
                { status: 303 }
            )
        }

        return NextResponse.redirect(
            new URL(
                '/groups?error=join-failed',
                request.url
            ),
            { status: 303 }
        )
    }

    revalidatePath('/groups')

    return NextResponse.redirect(
        new URL('/groups', request.url),
        { status: 303 }
    )
}