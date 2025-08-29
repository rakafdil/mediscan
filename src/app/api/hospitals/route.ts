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
    mapsByName: string;
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
const fetchHospitalsFromOverpass = async (centerLat: number, centerLng: number, kota: string, useRealLocation: boolean): Promise<Hospital[]> => {
    try {
        // Adjust search radius based on location type
        // Real GPS location: smaller radius for more precise results
        // City coordinates: larger radius to cover more area
        const searchRadius = useRealLocation ? 3000 : 5000; // 3km vs 5km
        
        // Simplified Overpass API query
        const overpassQuery = `
            [out:json][timeout:25];
            (
                node["amenity"="hospital"](around:${searchRadius},${centerLat},${centerLng});
                node["amenity"="clinic"](around:${searchRadius},${centerLat},${centerLng});
                node["healthcare"="hospital"](around:${searchRadius},${centerLat},${centerLng});
                node["healthcare"="clinic"](around:${searchRadius},${centerLat},${centerLng});
                way["amenity"="hospital"](around:${searchRadius},${centerLat},${centerLng});
                way["amenity"="clinic"](around:${searchRadius},${centerLat},${centerLng});
                way["healthcare"="hospital"](around:${searchRadius},${centerLat},${centerLng});
                way["healthcare"="clinic"](around:${searchRadius},${centerLat},${centerLng});
            );
            out center body;
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
        const seenNames = new Set<string>(); // To avoid duplicates

        data.elements.forEach((element: any, index: number) => {
            const tags = element.tags || {};
            
            // Get coordinates based on element type
            let lat, lng;
            if (element.type === 'node') {
                lat = element.lat;
                lng = element.lon;
            } else if (element.type === 'way' && element.center) {
                lat = element.center.lat;
                lng = element.center.lon;
            } else {
                return; // Skip if no valid coordinates
            }

            const hospitalName = tags.name ||
                tags['name:id'] ||
                tags['name:en'] ||
                (tags.amenity === 'hospital' ? 'Rumah Sakit' : 'Klinik') + ` #${index + 1}`;

            // Skip duplicates based on name and proximity
            const nameKey = hospitalName.toLowerCase();
            if (seenNames.has(nameKey)) {
                return;
            }

            // Check if there's a very close hospital with similar name (within 100m)
            const isDuplicate = hospitals.some(existing => {
                const distance = calculateDistance(lat, lng, existing.lat, existing.lng);
                return distance < 0.1 && existing.name.toLowerCase().includes(nameKey.substring(0, 10));
            });

            if (isDuplicate) {
                return;
            }

            seenNames.add(nameKey);

            // Build address
            const addressParts = [];
            if (tags['addr:street'] && tags['addr:housenumber']) {
                addressParts.push(`${tags['addr:street']} No. ${tags['addr:housenumber']}`);
            } else if (tags['addr:street']) {
                addressParts.push(tags['addr:street']);
            }
            
            if (tags['addr:city'] || tags['addr:village']) {
                addressParts.push(tags['addr:city'] || tags['addr:village']);
            } else if (!useRealLocation) {
                addressParts.push(kota);
            }

            const address = addressParts.join(', ') || 
                (useRealLocation ? `Lokasi sekitar GPS Anda` : `Lokasi di ${kota}`);

            // Calculate distance from user's position
            const distance = calculateDistance(centerLat, centerLng, lat, lng);

            // Determine hospital type with more detail
            let hospitalType = 'Fasilitas Kesehatan';
            if (tags.amenity === 'hospital' || tags.healthcare === 'hospital') {
                hospitalType = 'Rumah Sakit';
                if (tags.healthcare === 'hospital' && tags['healthcare:speciality']) {
                    hospitalType += ` (${tags['healthcare:speciality']})`;
                }
            } else if (tags.amenity === 'clinic' || tags.healthcare === 'clinic') {
                hospitalType = 'Klinik';
            }

            // Try to determine if it's open (basic heuristic)
            let isOpen;
            if (tags.opening_hours) {
                // Simple check for 24/7
                isOpen = tags.opening_hours.includes('24/7') || tags.opening_hours.includes('24 hours');
            }

            hospitals.push({
                id: element.id || Date.now() + index,
                name: hospitalName,
                address: address,
                lat: lat,
                lng: lng,
                distance: `${distance.toFixed(1)} km`,
                phone: tags.phone || tags.contact?.phone,
                website: tags.website || tags.contact?.website,
                hospitalType: hospitalType,
                isOpen: isOpen,
                rating: tags.rating ? parseFloat(tags.rating) : undefined,
                mapsByName: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(hospitalName + " " + address)}`
            });
        });

        // Sort by distance and limit results
        hospitals.sort((a, b) => {
            const distA = parseFloat(a.distance?.split(' ')[0] || '999');
            const distB = parseFloat(b.distance?.split(' ')[0] || '999');
            return distA - distB;
        });

        // Return more results for real location (user wants nearby), fewer for city search
        const maxResults = useRealLocation ? 15 : 20;
        return hospitals.slice(0, maxResults);

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
        const useRealLocation = searchParams.get('useRealLocation') === 'true';

        if (!lat || !lng) {
            return NextResponse.json(
                { 
                    success: false,
                    error: 'Latitude dan longitude diperlukan' 
                },
                { status: 400 }
            );
        }

        const centerLat = parseFloat(lat);
        const centerLng = parseFloat(lng);

        if (isNaN(centerLat) || isNaN(centerLng)) {
            return NextResponse.json(
                { 
                    success: false,
                    error: 'Latitude dan longitude harus berupa angka yang valid' 
                },
                { status: 400 }
            );
        }

        // Validate coordinates range
        if (centerLat < -90 || centerLat > 90 || centerLng < -180 || centerLng > 180) {
            return NextResponse.json(
                { 
                    success: false,
                    error: 'Koordinat tidak valid' 
                },
                { status: 400 }
            );
        }

        console.log(`Searching hospitals near ${centerLat}, ${centerLng} for ${kota} (Real location: ${useRealLocation})`);

        // Try to fetch from Overpass API first
        let hospitals = await fetchHospitalsFromOverpass(centerLat, centerLng, kota, useRealLocation);

        // If no hospitals found from API, use fallback data
        if (hospitals.length === 0) {
            console.log('Using fallback data as no hospitals found from API');
        }

        return NextResponse.json({
            success: true,
            data: hospitals,
            total: hospitals.length,
            locationMethod: useRealLocation ? 'gps' : 'city_coordinates',
            searchRadius: useRealLocation ? '3km' : '5km',
            coordinates: {
                lat: centerLat,
                lng: centerLng
            }
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
        
        return NextResponse.json({
            success: true,
            locationMethod: 'fallback',
            note: 'API error occurred',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}