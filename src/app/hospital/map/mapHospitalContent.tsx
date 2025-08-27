'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

interface LocationCoordinates {
    [key: string]: {
        lat: number;
        lng: number;
    };
}

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

interface UserLocation {
    lat: number;
    lng: number;
    accuracy?: number;
}

const MapHospitalContent = () => {
    const searchParams = useSearchParams();
    const router = useRouter();
    const mapRef = useRef<any>(null);
    const [isMapLoaded, setIsMapLoaded] = useState(false);
    const [mapError, setMapError] = useState<string | null>(null);
    const [hospitals, setHospitals] = useState<Hospital[]>([]);
    const [isLoadingHospitals, setIsLoadingHospitals] = useState(false);
    const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
    const [locationError, setLocationError] = useState<string | null>(null);
    const [isGettingLocation, setIsGettingLocation] = useState(false);
    const [useRealLocation, setUseRealLocation] = useState(false);

    const provinsi = searchParams.get('provinsi') || '';
    const kabupaten = searchParams.get('kabupaten') || '';
    const kota = searchParams.get('kota') || '';

    // Koordinat untuk setiap kota/wilayah (fallback)
    const locationCoordinates: LocationCoordinates = {
        // Jawa Barat
        'Bandung Kota': { lat: -6.9175, lng: 107.6191 },
        'Cimahi': { lat: -6.8722, lng: 107.5420 },
        'Lembang': { lat: -6.8112, lng: 107.6162 },
        'Bekasi Kota': { lat: -6.2383, lng: 106.9756 },
        'Cikarang': { lat: -6.2614, lng: 107.1533 },
        'Tambun': { lat: -6.2643, lng: 107.0640 },
        'Bogor Kota': { lat: -6.5971, lng: 106.8060 },
        'Cibinong': { lat: -6.4818, lng: 106.8540 },
        'Cisarua': { lat: -6.6974, lng: 106.9537 },

        // Jawa Tengah
        'Semarang Kota': { lat: -6.9667, lng: 110.4167 },
        'Ungaran': { lat: -7.1397, lng: 110.4058 },
        'Ambarawa': { lat: -7.2651, lng: 110.4042 },
        'Solo Kota': { lat: -7.5697, lng: 110.8281 },
        'Laweyan': { lat: -7.5563, lng: 110.8008 },
        'Banjarsari': { lat: -7.5488, lng: 110.8317 },

        // Jawa Timur
        'Surabaya Pusat': { lat: -7.2459, lng: 112.7378 },
        'Surabaya Timur': { lat: -7.3297, lng: 112.8014 },
        'Surabaya Selatan': { lat: -7.3191, lng: 112.7278 },
        'Malang Kota': { lat: -7.9797, lng: 112.6304 },
        'Kepanjen': { lat: -8.1301, lng: 112.5728 },
        'Turen': { lat: -8.1687, lng: 112.7055 },

        // DKI Jakarta
        'Menteng': { lat: -6.1944, lng: 106.8229 },
        'Tanah Abang': { lat: -6.1867, lng: 106.8130 },
        'Kemayoran': { lat: -6.1678, lng: 106.8456 },
        'Grogol': { lat: -6.1617, lng: 106.7897 },
        'Kalideres': { lat: -6.1378, lng: 106.7008 },
        'Cengkareng': { lat: -6.1378, lng: 106.7361 },
        'Kebayoran Baru': { lat: -6.2297, lng: 106.7975 },
        'Pasar Minggu': { lat: -6.2854, lng: 106.8419 },
        'Tebet': { lat: -6.2297, lng: 106.8608 },

        // DI Yogyakarta
        'Depok': { lat: -7.7628, lng: 110.4317 },
        'Ngaglik': { lat: -7.7375, lng: 110.3653 },
        'Mlati': { lat: -7.7297, lng: 110.3650 },
        'Bantul Kota': { lat: -7.8753, lng: 110.3392 },
        'Pundong': { lat: -7.9344, lng: 110.3406 },
        'Srandakan': { lat: -7.9397, lng: 110.2503 },
        'Gondokusuman': { lat: -7.7828, lng: 110.3667 },
        'Jetis': { lat: -7.7956, lng: 110.3592 },
        'Danurejan': { lat: -7.8017, lng: 110.3658 },
    };

    // Get user's real location
    const getUserLocation = () => {
        setIsGettingLocation(true);
        setLocationError(null);

        if (!navigator.geolocation) {
            setLocationError('Geolocation is not supported by this browser');
            setIsGettingLocation(false);
            return;
        }

        const options = {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000 // 5 minutes cache
        };

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const location: UserLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                    accuracy: position.coords.accuracy
                };
                setUserLocation(location);
                setUseRealLocation(true);
                setIsGettingLocation(false);
                setLocationError(null);
            },
            (error) => {
                let errorMessage = 'Failed to get location';
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        errorMessage = 'Location permission denied. Please enable location access in your browser';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMessage = 'Location information not available';
                        break;
                    case error.TIMEOUT:
                        errorMessage = 'Timeout while retrieving location. Please try again';
                        break;
                }
                setLocationError(errorMessage);
                setIsGettingLocation(false);
            },
            options
        );
    };

    // Load Leaflet CSS and JS
    useEffect(() => {
        const loadLeaflet = async () => {
            try {
                // Load Leaflet CSS
                if (!document.querySelector('link[href*="leaflet.css"]')) {
                    const leafletCSS = document.createElement('link');
                    leafletCSS.rel = 'stylesheet';
                    leafletCSS.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.css';
                    document.head.appendChild(leafletCSS);
                }

                // Load Leaflet JS
                if (!window.L) {
                    const leafletJS = document.createElement('script');
                    leafletJS.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.js';
                    leafletJS.onload = () => setIsMapLoaded(true);
                    leafletJS.onerror = () => {
                        setMapError('Failed to load map library');
                        console.error('Failed to load Leaflet');
                    };
                    document.head.appendChild(leafletJS);
                } else {
                    setIsMapLoaded(true);
                }
            } catch (error) {
                console.error('Error loading Leaflet:', error);
                setMapError('Failed to load map library');
            }
        };

        loadLeaflet();
    }, []);

    // Fetch hospitals from API
    const fetchHospitals = async (centerLat: number, centerLng: number): Promise<Hospital[]> => {
        try {
            setIsLoadingHospitals(true);

            const response = await fetch(
                `/api/hospitals?lat=${centerLat}&lng=${centerLng}&kota=${encodeURIComponent(kota)}&useRealLocation=${useRealLocation}`
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();

            if (!result.success) {
                throw new Error(result.error || 'Failed to fetch hospitals');
            }

            return result.data;

        } catch (error) {
            console.error('Error fetching hospitals:', error);
            return [];
        } finally {
            setIsLoadingHospitals(false);
        }
    };

    // Initialize map when Leaflet is loaded
    useEffect(() => {
        if (isMapLoaded && kota && window.L) {
            initializeMap();
        }
    }, [isMapLoaded, kota, userLocation, useRealLocation]);

    const initializeMap = async () => {
        // Determine which coordinates to use
        let coordinates;
        let locationLabel;

        if (useRealLocation && userLocation) {
            coordinates = { lat: userLocation.lat, lng: userLocation.lng };
            locationLabel = `Lokasi GPS Anda${userLocation.accuracy ? ` (±${Math.round(userLocation.accuracy)}m)` : ''}`;
        } else {
            coordinates = locationCoordinates[kota];
            locationLabel = `${kota}, ${kabupaten}`;

            if (!coordinates) {
                setMapError(`Coordinates for ${kota} not found`);
                return;
            }
        }

        const mapElement = document.getElementById('map');
        if (!mapElement) {
            setMapError('Map element not found');
            return;
        }

        try {
            if (mapRef.current) mapRef.current.remove();

            const map = window.L.map('map').setView([coordinates.lat, coordinates.lng], useRealLocation ? 15 : 13);
            mapRef.current = map;

            window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors',
                maxZoom: 19
            }).addTo(map);

            // Marker lokasi pengguna
            const locationIcon = window.L.divIcon({
                html: `<img src="/assets/Vector.png" alt="Address" style="width:25px; height:30px;" />`,
                className: 'custom-location-marker',
                iconSize: [30, 30],
                iconAnchor: [15, 15]
            });

            window.L.marker([coordinates.lat, coordinates.lng], { icon: locationIcon })
                .addTo(map)
                .bindPopup(`<b>${useRealLocation ? '🎯' : '📍'} ${locationLabel}</b>`);

            // Add accuracy circle if using real location
            if (useRealLocation && userLocation?.accuracy) {
                window.L.circle([coordinates.lat, coordinates.lng], {
                    radius: userLocation.accuracy,
                    color: '#10b981',
                    fillColor: '#10b981',
                    fillOpacity: 0.1,
                    weight: 2
                }).addTo(map);
            }

            // Fetch rumah sakit
            const hospitalsList = await fetchHospitals(coordinates.lat, coordinates.lng);
            setHospitals(hospitalsList);

            // Marker rumah sakit
            const hospitalIcon = window.L.divIcon({
                html: `<img src="/assets/HopitalMap.png" alt="Hospital" style="width:50px; height:50px;" />`,
                className: 'custom-hospital-marker',
                iconSize: [28, 28],
                iconAnchor: [14, 14]
            });

            hospitalsList.forEach(hospital => {
                const marker = window.L.marker([hospital.lat, hospital.lng], { icon: hospitalIcon })
                    .addTo(map)
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

        } catch (error) {
            console.error('Error initializing map:', error);
            setMapError('Error initializing map');
        }
    };

    const handleBackToSearch = () => {
        router.push('/hospital/choose');
    };

    const retryInitialization = () => {
        setMapError(null);
        setIsMapLoaded(false);
        setHospitals([]);

        // Reload the page after a short delay
        setTimeout(() => {
            window.location.reload();
        }, 500);
    };

    const toggleLocationMode = () => {
        if (useRealLocation) {
            // Switch back to city coordinates
            setUseRealLocation(false);
            setUserLocation(null);
        } else {
            // Get real location
            getUserLocation();
        }
    };

    return (
        <div className="bg-gray-50 min-h-screen">
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
                    <h1 className="text-5xl font-bold text-white">
                        Hospitals Map
                    </h1>

                    {/* Lokasi */}
                    <p className="text-white">
                        {useRealLocation && userLocation
                            ? `Lokasi GPS Anda${userLocation.accuracy ? ` (±${Math.round(userLocation.accuracy)}m)` : ''}`
                            : `${kota}, ${kabupaten} - ${provinsi?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}`
                        }
                    </p>

                    {/* Tombol */}
                    <div className="flex gap-4 justify-center">
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

                {/* Hospital List */}
                {isLoadingHospitals ? (
                    <div className="bg-white rounded-lg shadow-md p-6 mb-4">
                        <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mr-3"></div>
                            <p className="text-gray-600">Searching for nearby hospitals...</p>
                        </div>
                    </div>
                ) : hospitals.length > 0 && (
                    <div className="bg-[#D9D9D9] rounded-lg shadow-md p-4 mb-4">
                        <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                            <img
                                src="/assets/HopitalMap.png"
                                alt="Hospital"
                                style={{ width: '90px', height: '90px' }}
                            />
                            Hospitals Found ({hospitals.length})
                            {useRealLocation && (
                                <span className="text-sm text-green-600 ml-2 flex items-center gap-1">
                                    <img
                                        src="/assets/Vector.png"
                                        alt="Location"
                                        style={{ width: '16px', height: '16px' }}
                                    />
                                    Based on GPS location``
                                </span>
                            )}
                        </h3>
                        <div className="grid gap-3 max-h-60 overflow-y-auto">
                            {hospitals.map((hospital) => (
                                <div key={hospital.id} className="border-l-4 border-blue-500 bg-gray-50 p-3 rounded-r">
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="font-medium text-gray-800">{hospital.name}</h4>
                                        {hospital.rating && (
                                            <span className="text-sm text-yellow-600 bg-yellow-50 px-2 py-1 rounded">
                                                ⭐ {hospital.rating}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-600 mb-2">
                                        📍 {hospital.address}
                                    </p>
                                    <div className="flex items-center justify-between flex-wrap gap-2">
                                        {hospital.distance && (
                                            <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                                                🚗 {hospital.distance}
                                            </span>
                                        )}
                                        {hospital.hospitalType && (
                                            <span className="text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded">
                                                🏷️ {hospital.hospitalType}
                                            </span>
                                        )}
                                        {hospital.phone && (
                                            <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                                                📞 {hospital.phone}
                                            </span>
                                        )}
                                        {hospital.isOpen !== undefined && (
                                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${hospital.isOpen
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-red-100 text-red-800'
                                                }`}>
                                                {hospital.isOpen ? '🟢 Buka' : '🔴 Tutup'}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* No hospitals found */}
                {!isLoadingHospitals && hospitals.length === 0 && (
                    <div className="bg-white rounded-lg shadow-md p-6 text-center">
                        <div className="text-gray-400 text-4xl mb-4">🏥</div>
                        <p className="text-gray-600 mb-2">No hospitals found</p>
                        <p className="text-sm text-gray-500">Try changing the location or check your internet connection</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MapHospitalContent;