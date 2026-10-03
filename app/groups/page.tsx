import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function GroupsPage() {
    const supabase = await createClient()

    const { data: claimsData } = await supabase.auth.getClaims()

    if (!claimsData?.claims) {
        redirect('/login')
    }

    const userId = claimsData.claims.sub

    const { data: memberships, error } = await supabase
        .from('group_members')
        .select(`
            group_id,
            groups (
                id,
                name,
                budget,
                created_by
            )
        `)
        .eq('user_id', userId)

    if (error) {
        return (
            <main>
                <h1>My Groups</h1>
                <p>{error.message}</p>
            </main>
        )
    }

    return (
        <main>
            <h1>My Groups</h1>

            {memberships.length === 0 ? (
                <p>You haven't joined any groups yet.</p>
            ) : (
                <ul>
                    {memberships.map((membership) => {
                        const group = membership.groups

                        if (!group || Array.isArray(group)) {
                            return null
                        }

                        return (
                            <li key={group.id}>
                                <strong>{group.name}</strong>

                                <span>
                                    {' '}
                                    — Budget:{' '}
                                    {group.budget !== null
                                        ? `$${group.budget}`
                                        : 'Not set'}
                                </span>
                            </li>
                        )
                    })}
                </ul>
            )}

            <hr />

            <h2>Create a Group</h2>

            <form action="/groups/create" method="post">
                <div>
                    <label htmlFor="name">
                        Group name
                    </label>

                    <input
                        id="name"
                        name="name"
                        type="text"
                        placeholder="Weekend Adventure"
                        required
                    />
                </div>

                <div>
                    <label htmlFor="budget">
                        Group budget
                    </label>

                    <input
                        id="budget"
                        name="budget"
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="30"
                    />
                </div>

                <button type="submit">
                    Create Group
                </button>
            </form>
        </main>
    )
}