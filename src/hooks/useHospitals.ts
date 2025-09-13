// app/map/hooks/useHospitals.ts

import { useState } from 'react';

export interface Hospital {
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

export interface UseHospitalsReturn {
    hospitals: Hospital[];
    isLoadingHospitals: boolean;
    hospitalsError: string | null;
    fetchHospitals: (centerLat: number, centerLng: number, kota: string, useRealLocation: boolean) => Promise<void>;
    clearHospitalsError: () => void;
}

export const useHospitals = (): UseHospitalsReturn => {
    const [hospitals, setHospitals] = useState<Hospital[]>([]);
    const [isLoadingHospitals, setIsLoadingHospitals] = useState(false);
    const [hospitalsError, setHospitalsError] = useState<string | null>(null);

    const fetchHospitals = async (
        centerLat: number, 
        centerLng: number, 
        kota: string, 
        useRealLocation: boolean
    ): Promise<void> => {
        try {
            setIsLoadingHospitals(true);
            setHospitalsError(null);

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

            setHospitals(result.data);

        } catch (error) {
            console.error('Error fetching hospitals:', error);
            setHospitalsError(error instanceof Error ? error.message : 'Failed to fetch hospitals');
            setHospitals([]);
        } finally {
            setIsLoadingHospitals(false);
        }
    };

    const clearHospitalsError = () => {
        setHospitalsError(null);
    };

    return {
        hospitals,
        isLoadingHospitals,
        hospitalsError,
        fetchHospitals,
        clearHospitalsError
    };
};