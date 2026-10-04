const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

type Interest = { name: string; memberShare: number }
type Place = {
  id: string
  name: string
  address: string
  categories: string[]
  score: number
  estimatedCost: number
  distanceMiles: number
  travelTimeMinutes: number
  breakdown: {
    distance: number
    travelTime: number
    budget: number
    interests: number
    availability: number
  }
}

type RequestBody = {
  memberCount: number
  budget: number
  interests: Interest[]
  places: Place[]
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405)
  }

  const apiKey = Deno.env.get('GEMINI_API_KEY')
  if (!apiKey) {
    return json({ error: 'GEMINI_API_KEY is not configured' }, 500)
  }

  try {
    const body = (await req.json()) as RequestBody

    if (!Array.isArray(body.places) || body.places.length === 0) {
      return json({ explanations: [] })
    }

    const places = body.places.slice(0, 3)
    const prompt = `You explain outing recommendations for a student group-planning app.\n\nThe ranking and all factual values below were already computed by deterministic application code. Do NOT rerank the places, change numbers, infer missing facts, claim live availability, or invent venue details. Explain only from the supplied facts.\n\nGroup size: ${body.memberCount}\nBudget per person: $${body.budget.toFixed(2)}\nConsensus interests: ${body.interests.length ? body.interests.map((i) => `${i.name} (${Math.round(i.memberShare * 100)}% of members)`).join(', ') : 'none selected'}\n\nRanked places:\n${places.map((p, index) => `${index + 1}. ID=${p.id}; ${p.name}; categories=${p.categories.join(', ')}; score=${p.score}%; estimated cost=$${p.estimatedCost.toFixed(2)}; distance=${p.distanceMiles.toFixed(1)} miles; travel=${p.travelTimeMinutes} minutes; scoring breakdown: distance=${p.breakdown.distance}%, travel=${p.breakdown.travelTime}%, budget=${p.breakdown.budget}%, interests=${p.breakdown.interests}%, availability=${p.breakdown.availability}%`).join('\n')}\n\nFor each place, write one friendly 1-2 sentence explanation (maximum 55 words) of why it fits this group. Mention the strongest supplied tradeoffs or advantages. Do not say that Gemini chose or ranked the place.`

    const response = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: 'object',
              properties: {
                explanations: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      placeId: { type: 'string' },
                      explanation: { type: 'string' },
                    },
                    required: ['placeId', 'explanation'],
                  },
                },
              },
              required: ['explanations'],
            },
            thinkingConfig: { thinkingLevel: 'low' },
            maxOutputTokens: 500,
          },
        }),
      }
    )

    const data = await response.json()
    if (!response.ok) {
      console.error('Gemini error', data)
      return json({ error: data?.error?.message ?? 'Gemini request failed' }, 502)
    }

    const text = data?.candidates?.[0]?.content?.parts
      ?.map((part: { text?: string }) => part.text ?? '')
      .join('')

    if (!text) {
      return json({ error: 'Gemini returned no explanation text' }, 502)
    }

    const parsed = JSON.parse(text)
    const allowedIds = new Set(places.map((place) => place.id))
    const explanations = Array.isArray(parsed.explanations)
      ? parsed.explanations
          .filter((item: unknown): item is { placeId: string; explanation: string } => {
            if (!item || typeof item !== 'object') return false
            const candidate = item as Record<string, unknown>
            return (
              typeof candidate.placeId === 'string' &&
              allowedIds.has(candidate.placeId) &&
              typeof candidate.explanation === 'string'
            )
          })
          .map((item: { placeId: string; explanation: string }) => ({
            placeId: item.placeId,
            explanation: item.explanation.trim(),
          }))
      : []

    return json({ explanations })
  } catch (error) {
    console.error(error)
    return json(
      { error: error instanceof Error ? error.message : 'Unexpected server error' },
      500
    )
  }
})
