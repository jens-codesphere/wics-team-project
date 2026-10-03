import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    const supabase = await createClient()

    const { data: claimsData } = await supabase.auth.getClaims()

    if (claimsData?.claims) {
        await supabase.auth.signOut()
    }

    revalidatePath('/', 'layout')

    return NextResponse.redirect(
        new URL('/login', request.url),
        { status: 302 }
    )
}