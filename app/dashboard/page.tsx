import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
    const supabase = await createClient()

    const { data: claimsData } = await supabase.auth.getClaims()

    if (!claimsData?.claims) {
        redirect('/login')
    }

    const email = claimsData.claims.email

    return (
    <main>
        <h1>Dashboard</h1>

        <p>
            Welcome back!
        </p>

        <p>
            Logged in as: {email}</p>

        <form action="/auth/signout" method="post">
            <button type="submit">
                Log out
            </button>
        </form>
    </main>
)
}