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
        // Simplified Overpass API query
        const overpassQuery = `
            [out:json][timeout:25];
            (
                node["amenity"="hospital"](around:5000,${centerLat},${centerLng});
                node["amenity"="clinic"](around:5000,${centerLat},${centerLng});
                node["healthcare"="hospital"](around:5000,${centerLat},${centerLng});
                node["healthcare"="clinic"](around:5000,${centerLat},${centerLng});
            );
            out body;
        `;

        // Encode the query properly
        const formData = new URLSearchParams();
        formData.append('data', overpassQuery);

        const response = await fetch('https://overpass-api.de/api/interpreter', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            },
            body: formData.toString()
        });

        if (!response.ok) {
            throw new Error(`Overpass API error! status: ${response.status}`);
        }

        const data = await response.json();
        
        // Check if we got any elements
        if (!data.elements || data.elements.length === 0) {
            console.log('No hospitals found in the area');
            return [];
        }

        const hospitals: Hospital[] = [];

        data.elements.forEach((element: any, index: number) => {
            // Only process nodes (not ways or relations for simplicity)
            if (element.type !== 'node') {
                return;
            }

            const tags = element.tags || {};
            
            const hospitalName = tags.name ||
                tags['name:id'] ||
                tags['name:en'] ||
                (tags.amenity === 'hospital' ? 'Rumah Sakit' : 'Klinik') + ` #${index + 1}`;

            // Build address
            const addressParts = [];
            if (tags['addr:street'] && tags['addr:housenumber']) {
                addressParts.push(`${tags['addr:street']} No. ${tags['addr:housenumber']}`);
            } else if (tags['addr:street']) {
                addressParts.push(tags['addr:street']);
            }
            
            if (tags['addr:city'] || tags['addr:village']) {
                addressParts.push(tags['addr:city'] || tags['addr:village']);
            } else {
                addressParts.push(kota);
            }

            const address = addressParts.join(', ') || `Lokasi di ${kota}`;

            // Calculate distance
            const distance = calculateDistance(centerLat, centerLng, element.lat, element.lon);

            hospitals.push({
                id: element.id || index + 1,
                name: hospitalName,
                address: address,
                lat: element.lat,
                lng: element.lon,
                distance: `${distance.toFixed(1)} km`,
                phone: tags.phone,
                website: tags.website,
                hospitalType: tags.amenity === 'hospital' ? 'Rumah Sakit' :
                    tags.amenity === 'clinic' ? 'Klinik' :
                    tags.healthcare || 'Fasilitas Kesehatan'
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
        // Return empty array instead of throwing to prevent API failure
        return [];
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

        // Try to fetch from Overpass API first
        let hospitals = await fetchHospitalsFromOverpass(centerLat, centerLng, kota);

        return NextResponse.json({
            success: true,
            data: hospitals,
            total: hospitals.length
        });

    } catch (error) {
        console.error('Error in hospitals API:', error);
        
        // Fallback to mock data in case of error
        const { searchParams } = new URL(request.url);
        const lat = searchParams.get('lat');
        const lng = searchParams.get('lng');
        const kota = searchParams.get('kota') || '';
        
        const centerLat = parseFloat(lat || '-6.2');
        const centerLng = parseFloat(lng || '106.8');
    }
}