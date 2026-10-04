# Backend checkpoint before Figma

New migration: `20261004120000_voting_final_plans.sql`
New function: `functions/generate-itinerary/index.ts`
Updated function: `functions/explain-recommendations/index.ts` (low thinking latency)

Deploy:
`npx supabase db push`
`npx supabase functions deploy explain-recommendations`
`npx supabase functions deploy generate-itinerary`

`GEMINI_API_KEY` must already exist as a Supabase secret.
