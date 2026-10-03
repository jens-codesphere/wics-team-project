'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function ProfilePage() {
    const supabase = createClient()

    const [userId, setUserId] = useState('')
    const [displayName, setDisplayName] = useState('')
    const [budget, setBudget] = useState('')
    const [interests, setInterests] = useState('')
    const [transportation, setTransportation] = useState('')

    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [message, setMessage] = useState('')

    useEffect(() => {
        async function loadProfile() {
            const {
                data: { user },
            } = await supabase.auth.getUser()

            if (!user) {
                window.location.href = '/login'
                return
            }

            setUserId(user.id)

            const { data: profile, error } = await supabase
                .from('profiles')
                .select(
                    'display_name, budget, interests, transportation'
                )
                .eq('id', user.id)
                .single()

            if (error) {
                setMessage(error.message)
                setLoading(false)
                return
            }

            setDisplayName(profile.display_name)
            setBudget(
                profile.budget !== null
                    ? String(profile.budget)
                    : ''
            )
            setInterests(
                profile.interests
                    ? profile.interests.join(', ')
                    : ''
            )
            setTransportation(profile.transportation ?? '')

            setLoading(false)
        }

        loadProfile()
    }, [])

    async function handleSave(e: React.FormEvent) {
        e.preventDefault()

        setSaving(true)
        setMessage('')

        const interestsArray = interests
            .split(',')
            .map((interest) => interest.trim())
            .filter(Boolean)

        const { error } = await supabase
            .from('profiles')
            .update({
                display_name: displayName,
                budget: budget ? Number(budget) : null,
                interests: interestsArray,
                transportation: transportation || null,
            })
            .eq('id', userId)

        if (error) {
            setMessage(error.message)
            setSaving(false)
            return
        }

        setMessage('Profile saved successfully!')
        setSaving(false)
    }

    if (loading) {
        return (
            <main>
                <p>Loading profile...</p>
            </main>
        )
    }

    return (
        <main>
            <h1>My Profile</h1>

            <form onSubmit={handleSave}>
                <div>
                    <label htmlFor="displayName">
                        Display name
                    </label>

                    <input
                        id="displayName"
                        type="text"
                        value={displayName}
                        onChange={(e) =>
                            setDisplayName(e.target.value)
                        }
                        required
                    />
                </div>

                <div>
                    <label htmlFor="budget">
                        Budget per outing
                    </label>

                    <input
                        id="budget"
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="30"
                        value={budget}
                        onChange={(e) =>
                            setBudget(e.target.value)
                        }
                    />
                </div>

                <div>
                    <label htmlFor="interests">
                        Interests
                    </label>

                    <input
                        id="interests"
                        type="text"
                        placeholder="cafes, museums, music"
                        value={interests}
                        onChange={(e) =>
                            setInterests(e.target.value)
                        }
                    />

                    <p>
                        Separate interests with commas.
                    </p>
                </div>

                <div>
                    <label htmlFor="transportation">
                        Transportation
                    </label>

                    <select
                        id="transportation"
                        value={transportation}
                        onChange={(e) =>
                            setTransportation(e.target.value)
                        }
                    >
                        <option value="">
                            Select transportation
                        </option>

                        <option value="walking">
                            Walking
                        </option>

                        <option value="public_transit">
                            Public transit
                        </option>

                        <option value="driving">
                            Driving
                        </option>

                        <option value="rideshare">
                            Rideshare
                        </option>

                        <option value="any">
                            Any
                        </option>
                    </select>
                </div>

                <button type="submit" disabled={saving}>
                    {saving ? 'Saving...' : 'Save Profile'}
                </button>
            </form>

            {message && <p>{message}</p>}
        </main>
    )
}