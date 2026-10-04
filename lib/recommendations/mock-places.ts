import type { PlaceCandidate } from './rank'

export const mockPlaces: PlaceCandidate[] = [
    {
        id: 'place-1',
        name: 'The Yard',
        address: 'Newark, NJ',
        category: 'food',
        estimatedCost: 15,
        distanceMiles: 1.2,
        travelTimeMinutes: 8,
        interestMatch: 0.9,
        availabilityMatch: 1,
    },

    {
        id: 'place-2',
        name: 'Branch Brook Park',
        address: 'Newark, NJ',
        category: 'parks',
        estimatedCost: 5,
        distanceMiles: 2.5,
        travelTimeMinutes: 14,
        interestMatch: 0.7,
        availabilityMatch: 1,
    },

    {
        id: 'place-3',
        name: 'Local Music Venue',
        address: 'Newark, NJ',
        category: 'entertainment',
        estimatedCost: 18,
        distanceMiles: 1.8,
        travelTimeMinutes: 11,
        interestMatch: 1,
        availabilityMatch: 0.8,
    },

    {
        id: 'place-4',
        name: 'Campus Café',
        address: 'Newark, NJ',
        category: 'cafes',
        estimatedCost: 8,
        distanceMiles: 0.5,
        travelTimeMinutes: 4,
        interestMatch: 0.6,
        availabilityMatch: 1,
    },

    {
        id: 'place-5',
        name: 'Entertainment Center',
        address: 'Newark, NJ',
        category: 'entertainment',
        estimatedCost: 25,
        distanceMiles: 3.5,
        travelTimeMinutes: 20,
        interestMatch: 0.9,
        availabilityMatch: 0.9,
    },
]