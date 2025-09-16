import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');
    if (!query) {
        return NextResponse.json({ success: false, error: 'Missing query parameter' }, { status: 400 });
    }
    try {
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`;
        const res = await fetch(url, {
            headers: {
                'User-Agent': 'mediscan/1.0 (contact@yourdomain.example)'
            }
        });
        if (!res.ok) {
            return NextResponse.json({ success: false, error: 'Nominatim error', status: res.status }, { status: 500 });
        }
        const data = await res.json();
        if (!Array.isArray(data) || data.length === 0) {
            return NextResponse.json({ success: true, data: null });
        }
        const first = data[0];
        const lat = parseFloat(first.lat);
        const lng = parseFloat(first.lon);
        if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
            return NextResponse.json({ success: true, data: null });
        }
        return NextResponse.json({ success: true, data: { lat, lng } });
    } catch (err) {
        return NextResponse.json({ success: false, error: 'Server error', details: err instanceof Error ? err.message : err }, { status: 500 });
    }
}
