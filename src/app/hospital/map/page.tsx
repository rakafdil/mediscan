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
}

const Map = () => {
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

    // Generate sample hospitals data based on location
    const generateSampleHospitals = (centerLat: number, centerLng: number): Hospital[] => {
        const hospitalNames = [
            'RS Umum Daerah',
            'RS Swasta Medika',
            'Klinik 24 Jam',
            'RS Ibu dan Anak',
            'RS Jantung',
            'Klinik Pratama',
            'RS Ortopedi',
            'Puskesmas'
        ];

        const hospitals: Hospital[] = [];
        
        for (let i = 0; i < 6; i++) {
            const offsetLat = (Math.random() - 0.5) * 0.02; // Random offset within ~1km
            const offsetLng = (Math.random() - 0.5) * 0.02;
            
            hospitals.push({
                id: i + 1,
                name: hospitalNames[i],
                address: `Jl. Kesehatan No. ${Math.floor(Math.random() * 999) + 1}, ${kota}`,
                lat: centerLat + offsetLat,
                lng: centerLng + offsetLng,
                rating: Math.round((Math.random() * 2 + 3) * 10) / 10, // 3.0 - 5.0
                isOpen: Math.random() > 0.3, // 70% chance of being open
                distance: `${(Math.random() * 3 + 0.1).toFixed(1)} km`
            });
        }

        return hospitals;
    };

    // Initialize map when Leaflet is loaded
    useEffect(() => {
        if (isMapLoaded && kota && window.L) {
            initializeMap();
        }
    }, [isMapLoaded, kota]);

    const initializeMap = () => {
        const coordinates = locationCoordinates[kota];
        
        if (!coordinates) {
            setMapError(`Koordinat untuk ${kota} tidak ditemukan`);
            console.warn(`Koordinat untuk ${kota} tidak ditemukan`);
            return;
        }

        const mapElement = document.getElementById('map');
        if (!mapElement) {
            setMapError('Element peta tidak ditemukan');
            return;
        }

        try {
            // Clear any existing map
            if (mapRef.current) {
                mapRef.current.remove();
            }

            // Initialize Leaflet map
            const map = window.L.map('map').setView([coordinates.lat, coordinates.lng], 13);
            mapRef.current = map;

            // Add OpenStreetMap tiles
            window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                maxZoom: 19
            }).addTo(map);

            // Custom location icon (red marker)
            const locationIcon = window.L.divIcon({
                className: 'custom-location-marker',
                html: `<div style="
                    background: #ef4444; 
                    width: 24px; 
                    height: 24px; 
                    border-radius: 50%; 
                    border: 3px solid white; 
                    box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                ">
                    <div style="width: 8px; height: 8px; background: white; border-radius: 50%;"></div>
                </div>`,
                iconSize: [24, 24],
                iconAnchor: [12, 12]
            });

            // Add marker for selected location
            window.L.marker([coordinates.lat, coordinates.lng], { icon: locationIcon })
                .addTo(map)
                .bindPopup(`<b>${kota}</b><br>${kabupaten}`)
                .openPopup();

            // Generate and add hospital markers
            setIsLoadingHospitals(true);
            const sampleHospitals = generateSampleHospitals(coordinates.lat, coordinates.lng);
            setHospitals(sampleHospitals);

            // Custom hospital icon (green marker)
            const hospitalIcon = window.L.divIcon({
                className: 'custom-hospital-marker',
                html: `<div style="
                    background: #059669; 
                    width: 20px; 
                    height: 20px; 
                    border-radius: 50%; 
                    border: 2px solid white; 
                    box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                ">
                    <div style="width: 6px; height: 6px; background: white; border-radius: 50%;"></div>
                </div>`,
                iconSize: [20, 20],
                iconAnchor: [10, 10]
            });

            sampleHospitals.forEach((hospital) => {
                const marker = window.L.marker([hospital.lat, hospital.lng], { icon: hospitalIcon })
                    .addTo(map);

                const popupContent = `
                    <div style="padding: 8px; max-width: 200px; font-family: system-ui, sans-serif;">
                        <h3 style="margin: 0 0 8px 0; color: #333; font-size: 14px; font-weight: 600;">
                            ${hospital.name}
                        </h3>
                        <p style="margin: 0 0 4px 0; color: #666; font-size: 12px; line-height: 1.3;">
                            ${hospital.address}
                        </p>
                        ${hospital.rating ? 
                            `<p style="margin: 4px 0; color: #f59e0b; font-size: 12px;">
                                ⭐ ${hospital.rating}
                            </p>` : ''
                        }
                        ${hospital.isOpen !== undefined ? 
                            `<p style="margin: 4px 0; color: ${hospital.isOpen ? '#059669' : '#dc2626'}; font-size: 12px; font-weight: 500;">
                                ${hospital.isOpen ? '🟢 Buka sekarang' : '🔴 Tutup sekarang'}
                            </p>` : ''
                        }
                        ${hospital.distance ? 
                            `<p style="margin: 4px 0 0 0; color: #6b7280; font-size: 11px;">
                                📍 ${hospital.distance} dari lokasi Anda
                            </p>` : ''
                        }
                    </div>
                `;

                marker.bindPopup(popupContent);
            });

            setIsLoadingHospitals(false);

        } catch (error) {
            console.error('Error initializing map:', error);
            setMapError('Gagal menginisialisasi peta');
            setIsLoadingHospitals(false);
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
                                    <div className="flex items-center justify-between">
                                        {hospital.distance && (
                                            <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                                                🚗 {hospital.distance}
                                            </span>
                                        )}
                                        {hospital.isOpen !== undefined && (
                                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                                                hospital.isOpen 
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
            </div>
        </div>
    );
};

export default Map;