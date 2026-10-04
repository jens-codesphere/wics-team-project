import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { rankPlaces } from '@/lib/recommendations/rank'
import { mockPlaces } from '@/lib/recommendations/mock-places'

export default async function RecommendationsPage() {
    const supabase = await createClient()

    const { data: claimsData } =
        await supabase.auth.getClaims()

    if (!claimsData?.claims) {
        redirect('/login')
    }

    const userId = claimsData.claims.sub

    const { data: profile, error } =
        await supabase
            .from('profiles')
            .select('budget')
            .eq('id', userId)
            .single()

    if (error) {
        return (
            <main>
                <h1>Recommendations</h1>
                <p>
                    Could not load your profile.
                </p>
                <p>{error.message}</p>
            </main>
        )
    }

    const groupBudget =
        profile?.budget ?? 20

    const rankedPlaces =
        rankPlaces(
            mockPlaces,
            groupBudget
        )

    return (
        <main>
            <h1>
                Recommendations
            </h1>

            <p>
                Mock recommendation
                engine
            </p>

            <p>
                Budget: $
                {groupBudget}
            </p>

            <hr />

            {rankedPlaces.map(
                (place) => (
                    <article
                        key={place.id}
                    >
                        <h2>
                            {place.name}
                        </h2>

                        <p>
                            {
                                place.address
                            }
                        </p>

                        <p>
                            Category:{' '}
                            {
                                place.category
                            }
                        </p>

                        <p>
                            Recommendation
                            score:{' '}
                            <strong>
                                {
                                    place
                                        .recommendation
                                        .score
                                }
                            </strong>
                        </p>

                        <p>
                            Estimated cost:
                            {' '}
                            $
                            {
                                place.estimatedCost
                            }
                        </p>

                        <p>
                            Distance:{' '}
                            {
                                place.distanceMiles
                            } miles
                        </p>

                        <p>
                            Travel time:{' '}
                            {
                                place.travelTimeMinutes
                            } minutes
                        </p>

                        <details>
                            <summary>
                                Score breakdown
                            </summary>

                            <ul>
                                <li>
                                    Distance:{' '}
                                    {
                                        place
                                            .recommendation
                                            .breakdown
                                            .distance
                                    }
                                </li>

                                <li>
                                    Travel time:{' '}
                                    {
                                        place
                                            .recommendation
                                            .breakdown
                                            .travelTime
                                    }
                                </li>

                                <li>
                                    Budget:{' '}
                                    {
                                        place
                                            .recommendation
                                            .breakdown
                                            .budget
                                    }
                                </li>

                                <li>
                                    Interests:{' '}
                                    {
                                        place
                                            .recommendation
                                            .breakdown
                                            .interests
                                    }
                                </li>

                                <li>
                                    Availability:{' '}
                                    {
                                        place
                                            .recommendation
                                            .breakdown
                                            .availability
                                    }
                                </li>
                            </ul>
                        </details>

                        <hr />
                    </article>
                )
            )}
        </main>
    )
}