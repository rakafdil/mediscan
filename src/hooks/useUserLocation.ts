// app/map/hooks/useLocation.ts
'use client';

import { useState, useEffect } from 'react';

export interface UserLocation {
    lat: number;
    lng: number;
    accuracy?: number;
}

interface Province { id: string; name: string; }
interface Regency { id: string; name: string; }

export interface UseLocationReturn {
    // lokasi user
    userLocation: UserLocation | null;
    isGettingLocation: boolean;
    locationError: string | null;
    getUserLocation: () => void;
    clearLocationError: () => void;

    // data wilayah
    provinces: Province[];
    regencies: Regency[];
    selectedProvince: string;
    selectedRegency: string;
    setSelectedProvince: (id: string) => void;
    setSelectedRegency: (id: string) => void;
}

export const useLocation = (): UseLocationReturn => {
    // state untuk geolocation
    const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
    const [isGettingLocation, setIsGettingLocation] = useState(false);
    const [locationError, setLocationError] = useState<string | null>(null);

    // state untuk wilayah
    const [provinces, setProvinces] = useState<Province[]>([]);
    const [regencies, setRegencies] = useState<Regency[]>([]);
    const [selectedProvince, setSelectedProvince] = useState('');
    const [selectedRegency, setSelectedRegency] = useState('');

    // ambil provinsi
    useEffect(() => {
        fetch('https://www.emsifa.com/api-wilayah-indonesia/api/provinces.json')
            .then((res) => res.json())
            .then(setProvinces)
            .catch(() => setProvinces([]));
    }, []);

    // ambil kabupaten saat provinsi dipilih
    useEffect(() => {
        if (selectedProvince) {
            fetch(`https://www.emsifa.com/api-wilayah-indonesia/api/regencies/${selectedProvince}.json`)
                .then((res) => res.json())
                .then(setRegencies)
                .catch(() => setRegencies([]));
        } else {
            setRegencies([]);
        }
    }, [selectedProvince]);

    // fungsi ambil lokasi user
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
            maximumAge: 300000, // 5 menit cache
        };

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const location: UserLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                    accuracy: position.coords.accuracy,
                };
                setUserLocation(location);
                setIsGettingLocation(false);
                setLocationError(null);
            },
            (error) => {
                let errorMessage = 'Failed to get location';
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        errorMessage =
                            'Location permission denied. Please enable location access in your browser';
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

    const clearLocationError = () => {
        setLocationError(null);
    };

    return {
        // lokasi user
        userLocation,
        isGettingLocation,
        locationError,
        getUserLocation,
        clearLocationError,

        // data wilayah
        provinces,
        regencies,
        selectedProvince,
        selectedRegency,
        setSelectedProvince,
        setSelectedRegency,
    };
};
