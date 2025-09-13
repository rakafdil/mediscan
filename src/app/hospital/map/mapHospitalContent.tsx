'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useLocation } from '@/hooks/useUserLocation';
import { useHospitals } from '@/hooks/useHospitals';
import HospitalList from '@/app/components/HospitalList';

// Helper to fetch coordinates using Nominatim (OpenStreetMap)
async function fetchCoordinates(query: string): Promise<{ lat: number; lng: number } | null> {
    try {
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`;
        const res = await fetch(url, {
            headers: {
                // Provide a User-Agent per Nominatim usage policy; adjust as appropriate for your app
                'User-Agent': 'mediscan/1.0 (contact@yourdomain.example)'
            }
        });
        if (!res.ok) {
            console.error('fetchCoordinates: non-ok response', res.status);
            return null;
        }
        const data = await res.json();
        if (!Array.isArray(data) || data.length === 0) return null;
        const first = data[0];
        const lat = parseFloat(first.lat);
        const lng = parseFloat(first.lon);
        if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
        return { lat, lng };
    } catch (err) {
        console.error('fetchCoordinates error:', err);
        return null;
    }
}

// Helper to get location names from API
async function getLocationNames(countryCode: string, stateCode: string, cityCode: string) {
    try {
        // Fetch country name
        const countryRes = await fetch(`/api/regions?type=countries`);
        const countries = await countryRes.json();
        const country = countries.find((c: any) => c.iso2 === countryCode);
        
        // Fetch state name
        const stateRes = await fetch(`/api/regions?type=states&country=${countryCode}`);
        const states = await stateRes.json();
        const state = states.find((s: any) => s.iso2 === stateCode);
        
        // Fetch city name
        const cityRes = await fetch(`/api/regions?type=cities&country=${countryCode}&state=${stateCode}`);
        const cities = await cityRes.json();
        const city = cities.find((c: any) => c.name === decodeURIComponent(cityCode));
        
        return {
            countryName: country?.name || countryCode,
            stateName: state?.name || stateCode,
            cityName: city?.name || decodeURIComponent(cityCode)
        };
    } catch (error) {
        console.error('Error fetching location names:', error);
        return {
            countryName: countryCode,
            stateName: stateCode,
            cityName: decodeURIComponent(cityCode)
        };
    }
}

const MapHospitalContent = () => {
    const searchParams = useSearchParams();
    const router = useRouter();
    const mapRef = useRef<any>(null);

    const [isMapLoaded, setIsMapLoaded] = useState(false);
    const [mapError, setMapError] = useState<string | null>(null);
    const [useRealLocation, setUseRealLocation] = useState(false);
    const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);
    const [locationNames, setLocationNames] = useState<{
        countryName: string;
        stateName: string;
        cityName: string;
    }>({ countryName: '', stateName: '', cityName: '' });

    // Get parameters from URL - sesuai dengan yang dikirim choose.tsx
    const country = searchParams.get('country') || '';
    const state = searchParams.get('state') || '';
    const city = searchParams.get('city') || '';

    const {
        userLocation,
        isGettingLocation,
        locationError,
        getUserLocation,
        clearLocationError,
    } = useLocation();

    const {
        hospitals,
        isLoadingHospitals,
        hospitalsError,
        fetchHospitals,
        clearHospitalsError,
    } = useHospitals();

    // Fetch location names when parameters change
    useEffect(() => {
        if (country && state && city) {
            getLocationNames(country, state, city).then(setLocationNames);
        }
    }, [country, state, city]);

    // Load Leaflet
    useEffect(() => {
        const loadLeaflet = async () => {
            if (!document.querySelector('link[href*="leaflet.css"]')) {
                const leafletCSS = document.createElement('link');
                leafletCSS.rel = 'stylesheet';
                leafletCSS.href =
                    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.css';
                document.head.appendChild(leafletCSS);
            }

            if (!window.L) {
                const leafletJS = document.createElement('script');
                leafletJS.src =
                    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.js';
                leafletJS.onload = () => setIsMapLoaded(true);
                leafletJS.onerror = () => setMapError('Failed to load map library');
                document.head.appendChild(leafletJS);
            } else {
                setIsMapLoaded(true);
            }
        };
        loadLeaflet();
    }, []);

    // Fetch koordinat jika bukan GPS
    useEffect(() => {
        const loadCoordinates = async () => {
            if (!useRealLocation && locationNames.cityName) {
                const query = `${locationNames.cityName}, ${locationNames.stateName}, ${locationNames.countryName}`;
                const coords = await fetchCoordinates(query);
                if (coords) {
                    setCoordinates(coords);
                } else {
                    setMapError(`Coordinates for ${query} not found`);
                }
            }
        };
        loadCoordinates();
    }, [locationNames, useRealLocation]);

    // Initialize map
    useEffect(() => {
        if (isMapLoaded && (coordinates || (useRealLocation && userLocation)) && window.L) {
            initializeMap();
        }
    }, [isMapLoaded, coordinates, userLocation, useRealLocation]);

    const initializeMap = async () => {
        let coords: { lat: number; lng: number } | null = null;
        let locationLabel = '';

        if (useRealLocation && userLocation) {
            coords = { lat: userLocation.lat, lng: userLocation.lng };
            locationLabel = `Lokasi GPS Anda${userLocation.accuracy ? ` (±${Math.round(userLocation.accuracy)}m)` : ''
                }`;
        } else if (coordinates) {
            coords = coordinates;
            locationLabel = `${locationNames.cityName}, ${locationNames.stateName}`;
        }

        if (!coords) {
            setMapError('Coordinates not available');
            return;
        }

        const mapElement = document.getElementById('map');
        if (!mapElement) {
            setMapError('Map element not found');
            return;
        }

        try {
            if (mapRef.current) mapRef.current.remove();

            const map = window.L.map('map').setView(
                [coords.lat, coords.lng],
                useRealLocation ? 15 : 13
            );
            mapRef.current = map;

            window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors',
                maxZoom: 19,
            }).addTo(map);

            // marker lokasi
            const locationIcon = window.L.divIcon({
                html: `<img src="/assets/Vector.png" style="width:25px; height:30px;" />`,
                className: 'custom-location-marker',
                iconSize: [30, 30],
                iconAnchor: [15, 15],
            });

            window.L.marker([coords.lat, coords.lng], { icon: locationIcon })
                .addTo(map)
                .bindPopup(`<b>${useRealLocation ? '🎯' : '📍'} ${locationLabel}</b>`);

            // circle akurasi
            if (useRealLocation && userLocation?.accuracy) {
                window.L.circle([coords.lat, coords.lng], {
                    radius: userLocation.accuracy,
                    color: '#10b981',
                    fillColor: '#10b981',
                    fillOpacity: 0.1,
                    weight: 2,
                }).addTo(map);
            }

            // fetch hospital - menggunakan nama kota untuk pencarian
            await fetchHospitals(coords.lat, coords.lng, locationNames.cityName, useRealLocation);
        } catch (err) {
            console.error('Error initializing map:', err);
            setMapError('Error initializing map');
        }
    };

    // Add hospital markers when hospitals data changes
    useEffect(() => {
        if (mapRef.current && hospitals.length > 0 && window.L) {
            const hospitalIcon = window.L.divIcon({
                html: `<img src="/assets/HopitalMap.png" alt="Hospital" style="width:50px; height:50px;" />`,
                className: 'custom-hospital-marker',
                iconSize: [28, 28],
                iconAnchor: [14, 14]
            });

            hospitals.forEach(hospital => {
                const marker = window.L.marker([hospital.lat, hospital.lng], { icon: hospitalIcon })
                    .addTo(mapRef.current)
                    .bindPopup(`
                        <div style="min-width: 200px;">
                        <div style="display: flex; align-items: center; gap: 6px;">
                            <img src="/assets/HopitalMap.png" alt="Hospital" style="width: 40px; height: 40px;" />
                            <b>${hospital.name}</b>
                        </div>
                        
                        <div style="display: flex; align-items: center; gap: 6px; margin-top: 4px;">
                            <img src="/assets/Vector.png" alt="Address" style="width: 15px; height: 20px;" />
                            <span style="color: #666; font-size: 0.9em;">${hospital.address}</span>
                        </div>

                        ${hospital.distance ? `
                            <div style="color: #3b82f6; font-size: 0.9em; margin-top: 4px;">
                            🚗 ${hospital.distance}
                            </div>` : ''}

                        ${hospital.phone ? `
                            <div style="color: #059669; font-size: 0.9em; margin-top: 4px;">
                            📞 ${hospital.phone}
                            </div>` : ''}

                        ${hospital.hospitalType ? `
                            <div style="color: #7c3aed; font-size: 0.9em; margin-top: 4px;">
                            🏷️ ${hospital.hospitalType}
                            </div>` : ''}
                        </div>
                    `);
            });
        }
    }, [hospitals]);

    const handleBackToSearch = () => {
        router.push('/hospital/choose');
    };

    const retryInitialization = () => {
        setMapError(null);
        setIsMapLoaded(false);
        clearHospitalsError();
        clearLocationError();

        // Reload the page after a short delay
        setTimeout(() => {
            window.location.reload();
        }, 500);
    };

    const toggleLocationMode = () => {
        if (useRealLocation) {
            // Switch back to city coordinates
            setUseRealLocation(false);
        } else {
            // Get real location
            getUserLocation();
        }
    };

    // Update useRealLocation when userLocation is obtained
    useEffect(() => {
        if (userLocation) {
            setUseRealLocation(true);
        }
    }, [userLocation]);

    return (
        <div className="min-h-screen">
            {/* Leaflet CSS fix */}
            <style jsx global>{`
                .leaflet-container {
                    height: 100%;
                    width: 100%;
                    z-index: 1;
                }
                .custom-location-marker, .custom-hospital-marker {
                    background: transparent !important;
                    border: none !important;
                }
                @keyframes pulse {
                    0% {
                        box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
                    }
                    70% {
                        box-shadow: 0 0 0 10px rgba(16, 185, 129, 0);
                    }
                    100% {
                        box-shadow: 0 0 0 0 rgba(16, 185, 129, 0);
                    }
                }
            `}</style>

            <div className="container mx-auto p-5">
                {/* Header */}
                <div className="bg-[#5C7598] rounded-lg shadow-md p-6 mb-4 flex flex-col items-center text-center gap-6">
                    {/* Judul */}
                    <h1 className="text-5xl font-bold text-white font-montserrat">
                        Hospitals Map
                    </h1>

                    {/* Lokasi */}
                    <p className="text-white">
                        {useRealLocation && userLocation
                            ? `Lokasi GPS Anda${userLocation.accuracy ? ` (±${Math.round(userLocation.accuracy)}m)` : ''}`
                            : `${locationNames.cityName}, ${locationNames.stateName} - ${locationNames.countryName}`
                        }
                    </p>

                    {/* Tombol */}
                    <div className="flex gap-4 justify-center font-montserrat">
                        <button
                            onClick={toggleLocationMode}
                            disabled={isGettingLocation}
                            className={`px-6 py-2 rounded-full transition duration-200 flex items-center gap-2 shadow-lg shadow-blue-400/50 bg-[#628EF7] text-white font-medium hover:scale-105 ${isGettingLocation ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                        >
                            {isGettingLocation ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    Search...
                                </>
                            ) : useRealLocation ? (
                                <>🎯 GPS Active</>
                            ) : (
                                <>📍 Use GPS</>
                            )}
                        </button>

                        <button
                            onClick={handleBackToSearch}
                            className="px-6 py-2 rounded-full transition duration-200 flex items-center gap-2 shadow-lg shadow-blue-400/50 bg-[#628EF7] text-white font-medium hover:scale-105"
                        >
                            ← Change Location
                        </button>
                    </div>

                    {/* Location Error */}
                    {locationError && (
                        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg w-full text-center">
                            <p className="text-red-600 text-sm">⚠️ {locationError}</p>
                        </div>
                    )}

                    {/* Hospitals Error */}
                    {hospitalsError && (
                        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg w-full text-center">
                            <p className="text-red-600 text-sm">⚠️ {hospitalsError}</p>
                        </div>
                    )}
                </div>

                {/* Map Container */}
                <div className="bg-white rounded-lg shadow-md overflow-hidden mb-4">
                    <div
                        id="map"
                        className="w-full h-96 md:h-[500px] lg:h-[600px]"
                        style={{ minHeight: '400px' }}
                    >
                        {!isMapLoaded ? (
                            <div className="flex items-center justify-center h-full bg-gray-100">
                                <div className="text-center">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                                    <p className="text-gray-600">Loading map...</p>
                                </div>
                            </div>
                        ) : mapError ? (
                            <div className="flex items-center justify-center h-full bg-red-50">
                                <div className="text-center p-6">
                                    <div className="text-red-500 text-4xl mb-4">⚠️</div>
                                    <p className="text-red-600 font-semibold text-lg mb-2">Error</p>
                                    <p className="text-red-500 text-sm mb-4 max-w-md">
                                        {mapError}
                                    </p>
                                    <button
                                        onClick={retryInitialization}
                                        className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition duration-200"
                                    >
                                        🔄 Try Again
                                    </button>
                                </div>
                            </div>
                        ) : null}
                    </div>
                </div>

                {/* Hospital List Component */}
                <HospitalList
                    hospitals={hospitals}
                    isLoadingHospitals={isLoadingHospitals}
                    useRealLocation={useRealLocation}
                />
            </div>
        </div>
    );
};

export default MapHospitalContent;