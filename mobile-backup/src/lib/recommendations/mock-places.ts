import type {
    PlaceCandidate,
} from './rank'

export const mockPlaces:
    PlaceCandidate[] = [
        {
            id: 'place-1',
            name: 'The Yard',
            address: 'Newark, NJ',
            categories: [
                'food',
                'restaurant',
            ],
            estimatedCost: 15,
            distanceMiles: 1.2,
            travelTimeMinutes: 8,
            interestMatch: 0,
            availabilityMatch: 1,
        },

        {
            id: 'place-2',
            name: 'Branch Brook Park',
            address: 'Newark, NJ',
            categories: [
                'parks',
                'outdoors',
                'nature',
            ],
            estimatedCost: 5,
            distanceMiles: 2.5,
            travelTimeMinutes: 14,
            interestMatch: 0,
            availabilityMatch: 1,
        },

        {
            id: 'place-3',
            name: 'Local Music Venue',
            address: 'Newark, NJ',
            categories: [
                'music',
                'entertainment',
            ],
            estimatedCost: 18,
            distanceMiles: 1.8,
            travelTimeMinutes: 11,
            interestMatch: 0,
            availabilityMatch: 0.8,
        },

        {
            id: 'place-4',
            name: 'Campus Café',
            address: 'Newark, NJ',
            categories: [
                'cafes',
                'coffee',
                'food',
            ],
            estimatedCost: 8,
            distanceMiles: 0.5,
            travelTimeMinutes: 4,
            interestMatch: 0,
            availabilityMatch: 1,
        },

        {
            id: 'place-5',
            name: 'Entertainment Center',
            address: 'Newark, NJ',
            categories: [
                'entertainment',
                'games',
            ],
            estimatedCost: 25,
            distanceMiles: 3.5,
            travelTimeMinutes: 20,
            interestMatch: 0,
            availabilityMatch: 0.9,
        },
    ]