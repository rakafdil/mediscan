import { NextRequest, NextResponse } from 'next/server';

const config = {
    cUrl: 'https://api.countrystatecity.in/v1/countries',
    ckey: 'NHhvOEcyWk50N2Vna3VFTE00bFp3MjFKR0ZEOUhkZlg4RTk1MlJlaA==',
};

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'countries', 'states', 'cities', 'coordinates'
    const countryCode = searchParams.get('country');
    const stateCode = searchParams.get('state');
    const cityName = searchParams.get('city');

    try {
        let url = config.cUrl;

        if (type === 'coordinates') {
            // Return coordinates based on location hierarchy
            if (countryCode && stateCode && cityName) {
                // Get city coordinates
                url = `${config.cUrl}/${countryCode}/states/${stateCode}/cities`;
                const response = await fetch(url, {
                    headers: { 'X-CSCAPI-KEY': config.ckey }
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const cities = await response.json();
                const city = cities.find((c: any) => c.name.toLowerCase() === cityName.toLowerCase());

                if (city) {
                    return NextResponse.json({
                        type: 'city',
                        name: city.name,
                        country: countryCode,
                        state: stateCode,
                        latitude: parseFloat(city.latitude),
                        longitude: parseFloat(city.longitude)
                    });
                } else {
                    return NextResponse.json(
                        { error: 'City not found' },
                        { status: 404 }
                    );
                }
            } else if (countryCode && stateCode) {
                // Get state coordinates
                url = `${config.cUrl}/${countryCode}/states/${stateCode}`;
                const response = await fetch(url, {
                    headers: { 'X-CSCAPI-KEY': config.ckey }
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const state = await response.json();
                return NextResponse.json({
                    type: 'state',
                    name: state.name,
                    country: countryCode,
                    latitude: parseFloat(state.latitude),
                    longitude: parseFloat(state.longitude)
                });
            } else if (countryCode) {
                // Get country coordinates
                url = `${config.cUrl}/${countryCode}`;
                const response = await fetch(url, {
                    headers: { 'X-CSCAPI-KEY': config.ckey }
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const country = await response.json();
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
        } else if (type === 'countries') {
            url = config.cUrl;
        } else if (type === 'states' && countryCode) {
            url = `${config.cUrl}/${countryCode}/states`;
        } else if (type === 'cities' && countryCode && stateCode) {
            url = `${config.cUrl}/${countryCode}/states/${stateCode}/cities`;
        } else {
            return NextResponse.json(
                { error: 'Invalid parameters' },
                { status: 400 }
            );
        }

        // For non-coordinate requests, return the original data
        const response = await fetch(url, {
            headers: { 'X-CSCAPI-KEY': config.ckey }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        return NextResponse.json(data);
    } catch (error) {
        console.error(`Error loading ${type}:`, error);
        return NextResponse.json(
            { error: `Failed to load ${type}` },
            { status: 500 }
        );
    }
}