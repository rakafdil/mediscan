import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');

    if (!lat || !lng) {
        return NextResponse.json(
            { error: 'Latitude and longitude are required' },
            { status: 400 }
        );
    }

    try {
        // Overpass API query untuk mencari rumah sakit dalam radius 5km
        const overpassQuery = `
        [out:json][timeout:25];
        (
        node["amenity"="hospital"](around:5000,${lat},${lng});
        way["amenity"="hospital"](around:5000,${lat},${lng});
        relation["amenity"="hospital"](around:5000,${lat},${lng});
        node["amenity"="clinic"](around:5000,${lat},${lng});
        way["amenity"="clinic"](around:5000,${lat},${lng});
        node["healthcare"="hospital"](around:5000,${lat},${lng});
        way["healthcare"="hospital"](around:5000,${lat},${lng});
        );
        out geom;
    `;

        const response = await fetch('https://overpass-api.de/api/interpreter', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: overpassQuery
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // Process the data and return it
        const hospitals = data.elements.map((element: any, index: number) => {
            // Processing logic here (similar to what's in the frontend)
            return {
                id: element.id || index + 1,
                name: element.tags?.name || `Hospital ${index + 1}`,
                // ... other properties
            };
        });

        return NextResponse.json(hospitals);
    } catch (error) {
        console.error('Error fetching hospitals:', error);
        return NextResponse.json(
            { error: 'Failed to fetch hospitals' },
            { status: 500 }
        );
    }
}