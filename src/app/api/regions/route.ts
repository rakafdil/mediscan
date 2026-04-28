import { NextRequest, NextResponse } from 'next/server';

const config = {
    cUrl: 'https://api.countrystatecity.in/v1/countries',
    ckey: process.env.location_api_key ?? '',
};

// Helper untuk fetch dengan error handling
async function fetchData(url: string) {
    const response = await fetch(url, {
        headers: { 'X-CSCAPI-KEY': config.ckey }
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
}

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'countries', 'states', 'cities', 'coordinates'
    const countryCode = searchParams.get('country');
    const stateCode = searchParams.get('state');
    const cityName = searchParams.get('city');

    try {
        if (type === 'coordinates') {
            // =========================
            // Handle coordinate requests
            // =========================
            if (countryCode && stateCode && cityName) {
                // Get city coordinates
                const url = `${config.cUrl}/${countryCode}/states/${stateCode}/cities`;
                const cities = await fetchData(url);

                const city = cities.find((c: any) => c.name.toLowerCase() === cityName.toLowerCase());

                if (!city) {
                    return NextResponse.json({ error: 'City not found' }, { status: 404 });
                }

                return NextResponse.json({
                    type: 'city',
                    name: city.name,
                    country: countryCode,
                    state: stateCode,
                    latitude: parseFloat(city.latitude),
                    longitude: parseFloat(city.longitude)
                });

            } else if (countryCode && stateCode) {
                // Get state coordinates
                const url = `${config.cUrl}/${countryCode}/states/${stateCode}`;
                const state = await fetchData(url);

                return NextResponse.json({
                    type: 'state',
                    name: state.name,
                    country: countryCode,
                    latitude: parseFloat(state.latitude),
                    longitude: parseFloat(state.longitude)
                });

            } else if (countryCode) {
                // Get country coordinates
                const url = `${config.cUrl}/${countryCode}`;
                const country = await fetchData(url);

                return NextResponse.json({
                    type: 'country',
                    name: country.name,
                    latitude: parseFloat(country.latitude),
                    longitude: parseFloat(country.longitude)
                });

            } else {
                return NextResponse.json(
                    { error: 'At least country code is required for coordinates' },
                    { status: 400 }
                );
            }
        } else {
            // ==============================
            // Handle list data (non-coordinate)
            // ==============================
            const endpoints: Record<string, (country?: string, state?: string) => string | null> = {
                countries: () => config.cUrl,
                states: (country) => country ? `${config.cUrl}/${country}/states` : null,
                cities: (country, state) =>
                    (country && state) ? `${config.cUrl}/${country}/states/${state}/cities` : null,
            };

            const urlBuilder = endpoints[type as keyof typeof endpoints];

            if (!urlBuilder) {
                return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
            }

            const url = urlBuilder(countryCode ?? undefined, stateCode ?? undefined);

            if (!url) {
                return NextResponse.json(
                    { error: 'Missing required parameters' },
                    { status: 400 }
                );
            }

            const data = await fetchData(url);
            return NextResponse.json(data);
        }
    } catch (error) {
        console.error(`Error loading ${type}:`, error);
        return NextResponse.json(
            { error: `Failed to load ${type}` },
            { status: 500 }
        );
    }
}
