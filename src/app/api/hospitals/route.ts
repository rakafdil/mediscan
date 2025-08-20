import { NextRequest, NextResponse } from 'next/server';

interface Hospital {
    id: number;
    name: string;
    address: string;
    lat: number;
    lng: number;
    rating?: number;
    isOpen?: boolean;
    distance?: string;
    phone?: string;
    website?: string;
    hospitalType?: string;
}

// Calculate distance between two coordinates
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

// Fetch hospitals from OpenStreetMap Overpass API
const fetchHospitalsFromOverpass = async (centerLat: number, centerLng: number, kota: string): Promise<Hospital[]> => {
    try {
        // Overpass API query untuk mencari rumah sakit dalam radius 5km
        const overpassQuery = `
            [out:json][timeout:25];
            (
            node["amenity"="hospital"](around:5000,${centerLat},${centerLng});
            way["amenity"="hospital"](around:5000,${centerLat},${centerLng});
            relation["amenity"="hospital"](around:5000,${centerLat},${centerLng});
            node["amenity"="clinic"](around:5000,${centerLat},${centerLng});
            way["amenity"="clinic"](around:5000,${centerLat},${centerLng});
            node["healthcare"="hospital"](around:5000,${centerLat},${centerLng});
            way["healthcare"="hospital"](around:5000,${centerLat},${centerLng});
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
        const hospitals: Hospital[] = [];

        data.elements.forEach((element: any, index: number) => {
            let lat: number, lng: number;

            // Handle different OSM element types
            if (element.type === 'node') {
                lat = element.lat;
                lng = element.lon;
            } else if (element.type === 'way' && element.geometry) {
                // Use center of way
                const coords = element.geometry;
                lat = coords.reduce((sum: number, coord: any) => sum + coord.lat, 0) / coords.length;
                lng = coords.reduce((sum: number, coord: any) => sum + coord.lon, 0) / coords.length;
            } else {
                return; // Skip if no coordinates
            }

            const tags = element.tags || {};
            
            const hospitalName = tags.name ||
                tags['name:id'] ||
                tags['name:en'] ||
                (tags.amenity === 'hospital' ? 'Rumah Sakit' : 'Klinik') + ` #${index + 1}`;

            const address = [
                tags['addr:street'] && tags['addr:housenumber'] ?
                    `${tags['addr:street']} No. ${tags['addr:housenumber']}` :
                    tags['addr:street'],
                tags['addr:city'] || tags['addr:village'] || kota
            ].filter(Boolean).join(', ');

            // Calculate distance
            const distance = calculateDistance(centerLat, centerLng, lat, lng);

            hospitals.push({
                id: element.id || index + 1,
                name: hospitalName,
                address: address || `${kota}`,
                lat: lat,
                lng: lng,
                rating: undefined, // OSM doesn't have ratings
                isOpen: tags.opening_hours ? undefined : undefined, // We could parse opening_hours
                distance: `${distance.toFixed(1)} km`,
                phone: tags.phone,
                website: tags.website,
                hospitalType: tags.amenity === 'hospital' ? 'Hospital' :
                    tags.amenity === 'clinic' ? 'Clinic' :
                        tags.healthcare || 'Medical Facility'
            });
        });

        // Sort by distance and limit to 20 results
        hospitals.sort((a, b) => {
            const distA = parseFloat(a.distance?.split(' ')[0] || '999');
            const distB = parseFloat(b.distance?.split(' ')[0] || '999');
            return distA - distB;
        });

        return hospitals.slice(0, 20);

    } catch (error) {
        console.error('Error fetching hospitals from Overpass API:', error);
        throw error;
    }
};

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const lat = searchParams.get('lat');
        const lng = searchParams.get('lng');
        const kota = searchParams.get('kota') || '';

        if (!lat || !lng) {
            return NextResponse.json(
                { error: 'Latitude dan longitude diperlukan' },
                { status: 400 }
            );
        }

        const centerLat = parseFloat(lat);
        const centerLng = parseFloat(lng);

        if (isNaN(centerLat) || isNaN(centerLng)) {
            return NextResponse.json(
                { error: 'Latitude dan longitude harus berupa angka yang valid' },
                { status: 400 }
            );
        }

        const hospitals = await fetchHospitalsFromOverpass(centerLat, centerLng, kota);

        return NextResponse.json({
            success: true,
            data: hospitals,
            total: hospitals.length
        });

    } catch (error) {
        console.error('Error in hospitals API:', error);
        return NextResponse.json(
            { 
                error: 'Gagal mengambil data rumah sakit', 
                details: error instanceof Error ? error.message : 'Unknown error' 
            },
            { status: 500 }
        );
    }
}