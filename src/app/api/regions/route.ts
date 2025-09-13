import { NextRequest, NextResponse } from 'next/server';

const config = {
    cUrl: 'https://api.countrystatecity.in/v1/countries',
    ckey: 'NHhvOEcyWk50N2Vna3VFTE00bFp3MjFKR0ZEOUhkZlg4RTk1MlJlaA==',
};

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'countries', 'states', 'cities'
    const countryCode = searchParams.get('country');
    const stateCode = searchParams.get('state');

    try {
        let url = config.cUrl;
        
        if (type === 'countries') {
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