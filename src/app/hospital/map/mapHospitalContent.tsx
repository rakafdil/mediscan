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

const PetaRumahSakitPage = () => {
    const searchParams = useSearchParams();
    const router = useRouter();
    const mapRef = useRef<any>(null);
    const [isMapLoaded, setIsMapLoaded] = useState(false);
    const [mapError, setMapError] = useState<string | null>(null);
    const [hospitals, setHospitals] = useState<Hospital[]>([]);
    const [isLoadingHospitals, setIsLoadingHospitals] = useState(false);

    const provinsi = searchParams.get('provinsi') || '';
    const kabupaten = searchParams.get('kabupaten') || '';
    const kota = searchParams.get('kota') || '';

    // Koordinat untuk setiap kota/wilayah
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
                        setMapError('Gagal memuat library peta');
                        console.error('Failed to load Leaflet');
                    };
                    document.head.appendChild(leafletJS);
                } else {
                    setIsMapLoaded(true);
                }
            } catch (error) {
                console.error('Error loading Leaflet:', error);
                setMapError('Gagal memuat library peta');
            }
        };

        loadLeaflet();
    }, []);

    // Fetch hospitals from API
    const fetchHospitals = async (centerLat: number, centerLng: number): Promise<Hospital[]> => {
        try {
            setIsLoadingHospitals(true);

            const response = await fetch(
                `/api/hospitals?lat=${centerLat}&lng=${centerLng}&kota=${encodeURIComponent(kota)}`
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
    }, [isMapLoaded, kota]);

    const initializeMap = async () => {
        const coordinates = locationCoordinates[kota];
        if (!coordinates) {
            setMapError(`Koordinat untuk ${kota} tidak ditemukan`);
            return;
        }

        const mapElement = document.getElementById('map');
        if (!mapElement) {
            setMapError('Element peta tidak ditemukan');
            return;
        }

        try {
            if (mapRef.current) mapRef.current.remove();

            const map = window.L.map('map').setView([coordinates.lat, coordinates.lng], 13);
            mapRef.current = map;

            window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors',
                maxZoom: 19
            }).addTo(map);

            // Marker lokasi pengguna
            const locationIcon = window.L.divIcon({
                html: '<div style="background-color: #3b82f6; color: white; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3);">📍</div>',
                className: 'custom-location-marker',
                iconSize: [30, 30],
                iconAnchor: [15, 15]
            });

            window.L.marker([coordinates.lat, coordinates.lng], { icon: locationIcon })
                .addTo(map)
                .bindPopup(`<b>📍 Lokasi Anda</b><br/>${kota}, ${kabupaten}`);

            // Fetch rumah sakit
            const hospitalsList = await fetchHospitals(coordinates.lat, coordinates.lng);
            setHospitals(hospitalsList);

            // Marker rumah sakit
            const hospitalIcon = window.L.divIcon({
                html: '<div style="background-color: #ef4444; color: white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">🏥</div>',
                className: 'custom-hospital-marker',
                iconSize: [28, 28],
                iconAnchor: [14, 14]
            });

            hospitalsList.forEach(hospital => {
                const marker = window.L.marker([hospital.lat, hospital.lng], { icon: hospitalIcon })
                    .addTo(map)
                    .bindPopup(`
                        <div style="min-width: 200px;">
                            <b>🏥 ${hospital.name}</b><br/>
                            <span style="color: #666; font-size: 0.9em;">📍 ${hospital.address}</span><br/>
                            ${hospital.distance ? `<span style="color: #3b82f6; font-size: 0.9em;">🚗 ${hospital.distance}</span><br/>` : ''}
                            ${hospital.phone ? `<span style="color: #059669; font-size: 0.9em;">📞 ${hospital.phone}</span><br/>` : ''}
                            ${hospital.hospitalType ? `<span style="color: #7c3aed; font-size: 0.9em;">🏷️ ${hospital.hospitalType}</span>` : ''}
                        </div>
                    `);
            });

        } catch (error) {
            console.error('Error initializing map:', error);
            setMapError('Gagal menginisialisasi peta');
        }
    };

    const handleBackToSearch = () => {
        router.push('/hospital');
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
            `}</style>

            <div className="container mx-auto p-5">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-md p-4 mb-4">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div>
                            <h1 className="text-xl font-bold text-gray-800">
                                🗺️ Peta Rumah Sakit
                            </h1>
                            <p className="text-gray-600 mt-1">
                                {kota}, {kabupaten} - {provinsi?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </p>
                        </div>
                        <button
                            onClick={handleBackToSearch}
                            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-200 flex items-center gap-2"
                        >
                            ← Ubah Lokasi
                        </button>
                    </div>
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
                                    <p className="text-gray-600">Memuat peta...</p>
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
                                        🔄 Coba Lagi
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
                            <p className="text-gray-600">Mencari rumah sakit terdekat...</p>
                        </div>
                    </div>
                ) : hospitals.length > 0 && (
                    <div className="bg-white rounded-lg shadow-md p-4 mb-4">
                        <h3 className="text-lg font-semibold text-gray-800 mb-3">
                            🏥 Rumah Sakit Ditemukan ({hospitals.length})
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
                        <p className="text-gray-600 mb-2">Tidak ada rumah sakit ditemukan</p>
                        <p className="text-sm text-gray-500">Coba ubah lokasi atau cek koneksi internet Anda</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PetaRumahSakitPage;