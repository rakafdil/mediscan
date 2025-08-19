"use client";

import React, { useEffect, useRef, useState } from 'react';
import {
    Hospital, LocationData, AppState, CONFIG, LOCATION_DATA,
    dataKabupaten, dataKota, getAvailabilityInfo, formatDistance
} from './utils';

// Success Alert Component
const SuccessAlert: React.FC<{ message: string; onClose: () => void }> = ({ message, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 5000);

        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            <i className="fas fa-check-circle mr-2"></i> {message}
        </div>
    );
};

// Map Component
const MapComponent: React.FC<{
    center: [number, number];
    hospitals: Hospital[];
    userLocation?: [number, number];
    userAccuracy?: number;
    onMapReady?: (map: any) => void;
}> = ({ center, hospitals, userLocation, userAccuracy, onMapReady }) => {
    const mapRef = useRef<any>(null);
    const [map, setMap] = useState<any>(null);
    const [L, setL] = useState<any>(null);

    useEffect(() => {
        if (typeof window !== 'undefined' && !L) {
            import('leaflet').then((leaflet) => {
                setL(leaflet.default);

                if (!mapRef.current) {
                    const mapInstance = leaflet.default.map('hospital-map').setView(center, CONFIG.DEFAULT_ZOOM);

                    leaflet.default.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    }).addTo(mapInstance);

                    mapRef.current = mapInstance;
                    setMap(mapInstance);
                    onMapReady?.(mapInstance);
                }
            });
        }

        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
        };
    }, []);

    useEffect(() => {
        if (map && L) {
            map.setView(center, CONFIG.DEFAULT_ZOOM);
        }
    }, [center, map, L]);

    useEffect(() => {
        if (map && L) {
            // Clear existing markers except tile layer
            map.eachLayer((layer: any) => {
                if (layer instanceof L.Marker || layer instanceof L.Circle) {
                    map.removeLayer(layer);
                }
            });

            // Add hospital markers
            hospitals.forEach((hospital) => {
                const availabilityInfo = getAvailabilityInfo(hospital.availability);

                const hospitalIcon = L.divIcon({
                    className: 'hospital-marker',
                    html: '<i class="fas fa-hospital"></i>',
                    iconSize: [32, 32],
                    iconAnchor: [16, 16],
                    popupAnchor: [0, -16]
                });

                const marker = L.marker([hospital.lat, hospital.lng], {
                    icon: hospitalIcon,
                    title: hospital.name
                }).addTo(map);

                const popupContent = `
          <div class="max-w-xs">
            <div class="flex items-center mb-2">
              <span class="w-3 h-3 rounded-full mr-2" style="background-color: ${availabilityInfo.color}"></span>
              <h3 class="font-bold">${hospital.name}</h3>
            </div>
            <p class="mb-1"><strong>📍 Alamat:</strong> ${hospital.address}</p>
            <p class="mb-1"><strong>📏 Jarak:</strong> ${hospital.distance} km</p>
            <p class="mb-1"><strong>🏥 Kapasitas:</strong> ${hospital.capacity}</p>
            <p class="mb-1"><strong>⭐ Rating:</strong> ${hospital.rating}</p>
            <p class="mb-3" style="color: ${availabilityInfo.color};">
              <strong>🛏 Ketersediaan:</strong> ${availabilityInfo.text}
            </p>
            <div class="text-center">
              <button onclick="window.showHospitalDetail('${hospital.id}')" 
                      class="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600">
                <i class="fas fa-info-circle"></i> Lihat Detail
              </button>
            </div>
          </div>
        `;

                marker.bindPopup(popupContent);
            });

            // Add user location marker if available
            if (userLocation) {
                const userIcon = L.divIcon({
                    className: 'user-marker',
                    html: '<i class="fas fa-user"></i>',
                    iconSize: [40, 40],
                    iconAnchor: [20, 20],
                    popupAnchor: [0, -20]
                });

                const userMarker = L.marker(userLocation, {
                    icon: userIcon,
                    zIndexOffset: 1000
                }).addTo(map);

                const popupContent = `
          <div class="text-center">
            <strong>📍 Lokasi Anda</strong><br>
            <small>Lat: ${userLocation[0].toFixed(6)}</small><br>
            <small>Lng: ${userLocation[1].toFixed(6)}</small><br>
            ${userAccuracy ? `<small>Akurasi: ~${Math.round(userAccuracy)}m</small>` : ''}
          </div>
        `;

                userMarker.bindPopup(popupContent).openPopup();

                // Add accuracy circle if accuracy > 50m
                if (userAccuracy && userAccuracy > 50) {
                    L.circle(userLocation, {
                        radius: userAccuracy,
                        color: '#e74c3c',
                        fillColor: '#e74c3c',
                        fillOpacity: 0.1,
                        weight: 2,
                        dashArray: '5, 5'
                    }).addTo(map);
                }
            }
        }
    }, [map, L, hospitals, userLocation, userAccuracy]);

    return <div id="hospital-map" className="w-full h-96 mb-4 border border-gray-300 relative z-10" />;
};

// Main Component
const Peta: React.FC = () => {
    const [state, setState] = useState<AppState>({
        centerLat: null,
        centerLng: null,
        currentRadius: CONFIG.DEFAULT_RADIUS,
        selectedLocation: 'Memuat lokasi...',
        hospitals: [],
        loading: false,
        error: null,
        showLocationSelector: false,
        stats: null
    });

    const [selectedProvinsi, setSelectedProvinsi] = useState('');
    const [selectedKabupaten, setSelectedKabupaten] = useState('');
    const [selectedKota, setSelectedKota] = useState('');
    const [userLocation, setUserLocation] = useState<[number, number] | undefined>();
    const [userAccuracy, setUserAccuracy] = useState<number | undefined>();
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [buttonStates, setButtonStates] = useState({
        getUserLocation: { text: 'Gunakan Lokasi Saya', loading: false, disabled: false },
        refreshData: { text: 'Refresh Data', loading: false, disabled: false }
    });

    // Global function for hospital detail
    useEffect(() => {
        (window as any).showHospitalDetail = (hospitalId: string) => {
            // Navigate to hospital detail page
            window.location.href = `/rumah-sakit/${hospitalId}`;
        };
    }, []);

    // Initialize location from URL or get user location
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const provinsi = urlParams.get('provinsi');
        const kabupaten = urlParams.get('kabupaten');
        const kota = urlParams.get('kota');

        if (provinsi && LOCATION_DATA[provinsi]) {
            let location = LOCATION_DATA[provinsi];
            let locationName = location.name;

            // Check for kota parameter
            if (kota && kabupaten && dataKota[provinsi] && dataKota[provinsi][kabupaten]) {
                const kotaData = dataKota[provinsi][kabupaten].find(k => k.name === kota);
                if (kotaData) {
                    location = kotaData;
                    locationName = `${kota}, ${kabupaten}, ${locationName}`;
                }
            }
            // Check for kabupaten parameter only
            else if (kabupaten && dataKabupaten[provinsi]) {
                const kabupatenData = dataKabupaten[provinsi].find(k => k.name === kabupaten);
                if (kabupatenData) {
                    location = kabupatenData;
                    locationName = `${kabupaten}, ${locationName}`;
                }
            }

            setState(prev => ({
                ...prev,
                centerLat: location.lat,
                centerLng: location.lng,
                selectedLocation: locationName
            }));
            loadNearbyHospitals(location.lat, location.lng);
        } else {
            getUserLocation();
        }
    }, []);

    const updateButtonState = (buttonKey: keyof typeof buttonStates, updates: Partial<typeof buttonStates.getUserLocation>) => {
        setButtonStates(prev => ({
            ...prev,
            [buttonKey]: { ...prev[buttonKey], ...updates }
        }));
    };

    const getUserLocation = () => {
        updateButtonState('getUserLocation', {
            text: 'Mencari lokasi...',
            loading: true,
            disabled: true
        });

        setState(prev => ({ ...prev, selectedLocation: 'Mencari lokasi...' }));

        if (!navigator.geolocation) {
            setState(prev => ({
                ...prev,
                error: 'Geolocation tidak didukung oleh browser ini',
                showLocationSelector: true,
                selectedLocation: 'Silakan pilih lokasi'
            }));
            updateButtonState('getUserLocation', {
                text: 'Gunakan Lokasi Saya',
                loading: false,
                disabled: false
            });
            return;
        }

        const options = {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000
        };

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude, accuracy } = position.coords;

                console.log('Location obtained:', { latitude, longitude, accuracy });

                setState(prev => ({
                    ...prev,
                    centerLat: latitude,
                    centerLng: longitude,
                    selectedLocation: `Lokasi Anda (±${Math.round(accuracy)}m akurasi)`,
                    error: null,
                    showLocationSelector: false
                }));

                setUserLocation([latitude, longitude]);
                setUserAccuracy(accuracy);

                updateButtonState('getUserLocation', {
                    text: 'Lokasi Ditemukan',
                    loading: false,
                    disabled: false
                });

                setSuccessMessage('Lokasi Anda berhasil ditemukan!');
                loadNearbyHospitals(latitude, longitude);

                // Reset button after 3 seconds
                setTimeout(() => {
                    updateButtonState('getUserLocation', {
                        text: 'Gunakan Lokasi Saya'
                    });
                }, 3000);
            },
            (error) => {
                console.error('Geolocation error:', error);

                let errorMessage = 'Gagal mendapatkan lokasi';
                let userFriendlyMessage = '';

                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        errorMessage = "Akses lokasi ditolak oleh pengguna";
                        userFriendlyMessage = "Silakan izinkan akses lokasi di browser Anda atau pilih lokasi secara manual";
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMessage = "Informasi lokasi tidak tersedia";
                        userFriendlyMessage = "Tidak dapat menentukan lokasi Anda. Coba lagi atau pilih lokasi manual";
                        break;
                    case error.TIMEOUT:
                        errorMessage = "Timeout mencari lokasi";
                        userFriendlyMessage = "Pencarian lokasi memakan waktu terlalu lama. Coba lagi atau pilih lokasi manual";
                        break;
                    default:
                        errorMessage = "Error tidak dikenal dalam pencarian lokasi";
                        userFriendlyMessage = "Terjadi kesalahan. Silakan coba lagi atau pilih lokasi manual";
                        break;
                }

                setState(prev => ({
                    ...prev,
                    error: errorMessage,
                    showLocationSelector: true,
                    selectedLocation: 'Silakan pilih lokasi secara manual'
                }));

                updateButtonState('getUserLocation', {
                    text: 'Gunakan Lokasi Saya',
                    loading: false,
                    disabled: false
                });

                // Show user-friendly alert
                setTimeout(() => {
                    alert(userFriendlyMessage);
                }, 1000);
            },
            options
        );
    };

    const loadNearbyHospitals = async (lat: number, lng: number) => {
        setState(prev => ({ ...prev, loading: true, error: null }));

        try {
            // Since we can't make real API calls in this demo, we'll use mock data
            // In a real implementation, uncomment the following lines:
            /*
            const response = await fetch(
              `${CONFIG.API_ENDPOINTS.NEARBY_HOSPITALS}?lat=${lat}&lng=${lng}&radius=${state.currentRadius}&limit=20`,
              {
                method: 'GET',
                headers: {
                  'Content-Type': 'application/json',
                  'Accept': 'application/json'
                }
              }
            );
      
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
      
            const data = await response.json();
      
            if (data.success && data.results) {
              const hospitals = data.results.map((hospital: any) => ({
                id: hospital.id,
                place_id: hospital.place_id,
                name: hospital.name,
                address: hospital.vicinity,
                distance: formatDistance(hospital.distance),
                rating: hospital.rating,
                capacity: hospital.kapasitas,
                availability: hospital.availability,
                lat: hospital.geometry.location.lat,
                lng: hospital.geometry.location.lng
              }));
      
              hospitals.sort((a: Hospital, b: Hospital) =>
                parseFloat(a.distance) - parseFloat(b.distance)
              );
      
              setState(prev => ({
                ...prev,
                hospitals,
                loading: false
              }));
      
              loadStats(lat, lng);
              setSuccessMessage(`Ditemukan ${hospitals.length} rumah sakit dalam radius ${state.currentRadius} km`);
            } else {
              throw new Error(data.message || 'Gagal memuat data rumah sakit');
            }
            */

            // Mock data for demo
            await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call delay

            const mockHospitals: Hospital[] = [
                {
                    id: '1',
                    place_id: 'mock1',
                    name: 'RS Umum Jakarta',
                    address: 'Jl. Sudirman No. 1, Jakarta',
                    distance: '1.2',
                    rating: 4.5,
                    capacity: '300 beds',
                    availability: { status: 'high', percentage: 80 },
                    lat: lat + 0.01,
                    lng: lng + 0.01
                },
                {
                    id: '2',
                    place_id: 'mock2',
                    name: 'RS Medika Prima',
                    address: 'Jl. Gatot Subroto No. 15, Jakarta',
                    distance: '2.1',
                    rating: 4.2,
                    capacity: '250 beds',
                    availability: { status: 'medium', percentage: 45 },
                    lat: lat - 0.01,
                    lng: lng - 0.01
                },
                {
                    id: '3',
                    place_id: 'mock3',
                    name: 'RS Siloam Hospital',
                    address: 'Jl. MH Thamrin No. 28, Jakarta',
                    distance: '3.5',
                    rating: 4.8,
                    capacity: '400 beds',
                    availability: { status: 'low', percentage: 15 },
                    lat: lat + 0.02,
                    lng: lng - 0.01
                },
                {
                    id: '4',
                    place_id: 'mock4',
                    name: 'RSUD Jakarta',
                    address: 'Jl. Rasuna Said No. 45, Jakarta',
                    distance: '4.2',
                    rating: 4.0,
                    capacity: '180 beds',
                    availability: { status: 'full', percentage: 0 },
                    lat: lat - 0.02,
                    lng: lng + 0.02
                },
                {
                    id: '5',
                    place_id: 'mock5',
                    name: 'RS Hermina',
                    address: 'Jl. Kemang Raya No. 12, Jakarta',
                    distance: '5.1',
                    rating: 4.3,
                    capacity: '220 beds',
                    availability: { status: 'medium', percentage: 60 },
                    lat: lat + 0.03,
                    lng: lng + 0.01
                }
            ];

            setState(prev => ({
                ...prev,
                hospitals: mockHospitals,
                loading: false,
                stats: {
                    total_hospitals: 5,
                    average_rating: 4.4,
                    total_available_beds: 450,
                    occupancy_rate: 65
                }
            }));

            setSuccessMessage(`Ditemukan ${mockHospitals.length} rumah sakit dalam radius ${state.currentRadius} km`);

        } catch (error) {
            console.error('Error fetching hospital data:', error);
            setState(prev => ({
                ...prev,
                loading: false,
                error: `Gagal memuat data rumah sakit: ${(error as Error).message}`
            }));
        }
    };

    const loadStats = async (lat: number, lng: number) => {
        try {
            // Real API call would be:
            /*
            const response = await fetch(
              `${CONFIG.API_ENDPOINTS.HOSPITAL_STATS}?lat=${lat}&lng=${lng}&radius=${state.currentRadius}`,
              {
                method: 'GET',
                headers: {
                  'Content-Type': 'application/json',
                  'Accept': 'application/json'
                }
              }
            );
      
            const data = await response.json();
      
            if (data.success && data.stats) {
              setState(prev => ({ ...prev, stats: data.stats }));
            }
            */
        } catch (error) {
            console.error('Error loading hospital stats:', error);
        }
    };

    const handleLocationChange = (provinsiKey: string, kabupatenName?: string, kotaName?: string) => {
        let location = LOCATION_DATA[provinsiKey];
        let locationName = location.name;

        if (kotaName && kabupatenName && dataKota[provinsiKey] && dataKota[provinsiKey][kabupatenName]) {
            const kotaData = dataKota[provinsiKey][kabupatenName].find(k => k.name === kotaName);
            if (kotaData) {
                location = kotaData;
                locationName = `${kotaName}, ${kabupatenName}, ${locationName}`;
            }
        } else if (kabupatenName && dataKabupaten[provinsiKey]) {
            const kabupatenData = dataKabupaten[provinsiKey].find(k => k.name === kabupatenName);
            if (kabupatenData) {
                location = kabupatenData;
                locationName = `${kabupatenName}, ${locationName}`;
            }
        }

        setState(prev => ({
            ...prev,
            centerLat: location.lat,
            centerLng: location.lng,
            selectedLocation: locationName,
            showLocationSelector: false
        }));

        setUserLocation(undefined);
        setUserAccuracy(undefined);
        loadNearbyHospitals(location.lat, location.lng);
    };

    const refreshData = () => {
        updateButtonState('refreshData', {
            text: 'Memuat...',
            loading: true,
            disabled: true
        });

        if (state.centerLat && state.centerLng) {
            loadNearbyHospitals(state.centerLat, state.centerLng);
        }

        setTimeout(() => {
            updateButtonState('refreshData', {
                text: 'Refresh Data',
                loading: false,
                disabled: false
            });
        }, 2000);
    };

    const showDetail = (hospitalId: string) => {
        window.location.href = `/rumah-sakit/${hospitalId}`;
    };

    return (
        <div className="bg-gray-50 min-h-screen">
            {/* Include external styles */}
            <link
                rel="stylesheet"
                href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"
            />
            <link
                rel="stylesheet"
                href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
            />

            <div className="container mx-auto px-4 py-5 max-w-6xl">
                <h2 className="text-2xl font-bold text-center my-5 text-black">Peta Ketersediaan Rumah Sakit</h2>
                <p className="text-center text-black">
                    Lokasi: <span className="font-medium">{state.selectedLocation}</span>
                </p>

                {/* Success Message */}
                {successMessage && (
                    <SuccessAlert
                        message={successMessage}
                        onClose={() => setSuccessMessage(null)}
                    />
                )}

                {/* Location Selector */}
                {state.showLocationSelector && (
                    <div className="flex justify-center my-5 gap-2 flex-wrap">
                        <select
                            title="Pilih Provinsi"
                            value={selectedProvinsi}
                            onChange={(e) => {
                                setSelectedProvinsi(e.target.value);
                                setSelectedKabupaten('');
                                setSelectedKota('');
                            }}
                            className="px-3 py-2 border rounded"
                        >
                            <option value="">Pilih Provinsi</option>
                            {Object.entries(LOCATION_DATA).map(([key, data]) => (
                                <option key={key} value={key}>{data.name}</option>
                            ))}
                        </select>

                        <select
                            title="Pilih Kabupaten/Kota"
                            value={selectedKabupaten}
                            onChange={(e) => {
                                setSelectedKabupaten(e.target.value);
                                setSelectedKota('');
                            }}
                            className="px-3 py-2 border rounded"
                            disabled={!selectedProvinsi}
                        >
                            <option value="">Pilih Kabupaten/Kota</option>
                            {selectedProvinsi && dataKabupaten[selectedProvinsi]?.map((kabupaten) => (
                                <option key={kabupaten.name} value={kabupaten.name}>
                                    {kabupaten.name}
                                </option>
                            ))}
                        </select>

                        <select
                            title="Pilih Kecamatan/Kota"
                            value={selectedKota}
                            onChange={(e) => setSelectedKota(e.target.value)}
                            className="px-3 py-2 border rounded"
                            disabled={!selectedKabupaten || !dataKota[selectedProvinsi]?.[selectedKabupaten]}
                        >
                            <option value="">Pilih Kecamatan/Kota</option>
                            {selectedKabupaten && dataKota[selectedProvinsi]?.[selectedKabupaten]?.map((kota) => (
                                <option key={kota.name} value={kota.name}>
                                    {kota.name}
                                </option>
                            ))}
                        </select>

                        <button
                            onClick={() => handleLocationChange(selectedProvinsi, selectedKabupaten, selectedKota)}
                            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                            disabled={!selectedProvinsi}
                        >
                            <i className="fas fa-map-marker-alt mr-1"></i> Terapkan Lokasi
                        </button>
                    </div>
                )}

                {/* Map */}
                {state.centerLat && state.centerLng && (
                    <MapComponent
                        center={[state.centerLat, state.centerLng]}
                        hospitals={state.hospitals}
                        userLocation={userLocation}
                        userAccuracy={userAccuracy}
                    />
                )}

                {/* Control Buttons */}
                <div className="flex justify-center my-3 gap-2">
                    <button
                        onClick={getUserLocation}
                        className={`px-4 py-2 rounded text-white ${buttonStates.getUserLocation.loading || buttonStates.getUserLocation.disabled
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-blue-500 hover:bg-blue-600'
                            }`}
                        disabled={buttonStates.getUserLocation.disabled}
                    >
                        <i className={`fas ${buttonStates.getUserLocation.loading ? 'fa-spinner fa-spin' : 'fa-location-dot'} mr-1`}></i>
                        {buttonStates.getUserLocation.text}
                    </button>

                    {!state.showLocationSelector && (
                        <button
                            onClick={refreshData}
                            className={`px-4 py-2 rounded text-white ${buttonStates.refreshData.loading || buttonStates.refreshData.disabled
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-blue-500 hover:bg-blue-600'
                                }`}
                            disabled={buttonStates.refreshData.disabled}
                        >
                            <i className={`fas ${buttonStates.refreshData.loading ? 'fa-spinner fa-spin' : 'fa-refresh'} mr-1`}></i>
                            {buttonStates.refreshData.text}
                        </button>
                    )}

                    <button
                        onClick={() => {
                            setState(prev => ({ ...prev, showLocationSelector: true }));
                            setUserLocation(undefined);
                            setUserAccuracy(undefined);
                            setState(prev => ({ ...prev, selectedLocation: 'Silakan pilih lokasi' }));
                        }}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                    >
                        <i className="fas fa-map-marker-alt mr-1"></i> Pilih Lokasi Lain
                    </button>
                </div>

                {/* Statistics */}
                {state.stats && (
                    <div className="bg-white p-4 rounded-lg my-5 shadow">
                        <h4 className="text-center font-bold mb-3 text-black">Statistik Area</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <div className="bg-white p-4 rounded-lg shadow text-center">
                                <div className="text-2xl font-bold text-black">{state.stats.total_hospitals}</div>
                                <div className="text-xs text-black mt-1">Total Rumah Sakit</div>
                            </div>
                            <div className="bg-white p-4 rounded-lg shadow text-center">
                                <div className="text-2xl font-bold text-black">{state.stats.average_rating}</div>
                                <div className="text-xs text-black mt-1">Rating Rata-rata</div>
                            </div>
                            <div className="bg-white p-4 rounded-lg shadow text-center">
                                <div className="text-2xl font-bold text-black">{state.stats.total_available_beds}</div>
                                <div className="text-xs text-black mt-1">Tempat Tidur Tersedia</div>
                            </div>
                            <div className="bg-white p-4 rounded-lg shadow text-center">
                                <div className="text-2xl font-bold text-black">{state.stats.occupancy_rate}%</div>
                                <div className="text-xs text-black mt-1">Tingkat Okupansi</div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Hospital List */}
                <h3 className="text-lg font-bold text-center my-5 text-black">
                    Rekomendasi Berdasarkan Jarak dan Ketersediaan
                </h3>

                <div className="w-full overflow-x-auto">
                    <table className="w-full bg-white rounded-lg shadow">
                        <thead>
                            <tr className="bg-gray-50">
                                <th className="px-4 py-3 text-left text-black">Nama Rumah Sakit</th>
                                <th className="px-4 py-3 text-left text-black">Jarak dari Anda</th>
                                <th className="px-4 py-3 text-left text-black">Kapasitas</th>
                                <th className="px-4 py-3 text-left text-black">Rating</th>
                                <th className="px-4 py-3 text-left text-black"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {state.loading ? (
                                <tr>
                                    <td colSpan={5} className="px-4 py-5 text-center">
                                        <i className="fas fa-spinner fa-spin mr-2"></i> Memuat data rumah sakit...
                                    </td>
                                </tr>
                            ) : state.error ? (
                                <tr>
                                    <td colSpan={5} className="px-4 py-5 text-center text-red-500">
                                        <i className="fas fa-exclamation-triangle mr-2"></i> {state.error}
                                    </td>
                                </tr>
                            ) : state.hospitals.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-4 py-5 text-center">
                                        <i className="fas fa-hospital text-4xl text-gray-400 mb-3"></i><br />
                                        <strong>Tidak ada rumah sakit ditemukan</strong><br />
                                        <span className="text-gray-500">Coba perluas radius pencarian atau ubah lokasi</span>
                                    </td>
                                </tr>
                            ) : (
                                state.hospitals.map((hospital) => {
                                    const availabilityInfo = getAvailabilityInfo(hospital.availability);

                                    return (
                                        <tr key={hospital.id} className="border-b hover:bg-gray-50">
                                            <td className="px-4 py-3">
                                                <div className="flex items-center">
                                                    <span
                                                        className={`w-3 h-3 rounded-full mr-2 ${availabilityInfo.text === 'high' ? 'bg-green-500' : availabilityInfo.text === 'medium' ? 'bg-yellow-500' : availabilityInfo.text === 'low' ? 'bg-orange-500' : 'bg-red-500'}`}
                                                    ></span>
                                                    <div>
                                                        <div className="font-medium">{hospital.name}</div>
                                                        <div className="text-sm text-gray-500">{hospital.address}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="font-bold text-gray-800">{hospital.distance} km</span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div>
                                                    <div>{hospital.capacity}</div>
                                                    <small className={`${availabilityInfo.text === 'high' ? 'text-green-600' : availabilityInfo.text === 'medium' ? 'text-yellow-600' : availabilityInfo.text === 'low' ? 'text-orange-600' : 'text-red-600'}`}>
                                                        {availabilityInfo.text}
                                                    </small>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center">
                                                    <i className="fas fa-star text-yellow-500 mr-1"></i>
                                                    {hospital.rating}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <button
                                                    onClick={() => showDetail(hospital.id)}
                                                    className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 text-sm"
                                                >
                                                    <i className="fas fa-info-circle"></i> Detail
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Peta;