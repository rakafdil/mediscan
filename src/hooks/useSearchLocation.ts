import { useState } from 'react';

export const useSearchLocationData = () => {
    const getCoordinates = async (country: string, state: string, city: string) => {
        try {
            if (state === "" && city === "") {
                const countryResponse = await fetch(`/api/regions?type=coordinates&country=${country}`);
                const countryData = await countryResponse.json();
                return {
                    country,
                    state: null,
                    city: null,
                    cityName: null,
                    latitude: countryData.latitude,
                    longitude: countryData.longitude,
                };
            }
            if (city === "") {
                const stateResponse = await fetch(`/api/regions?type=coordinates&country=${country}&state=${state}`);
                const stateData = await stateResponse.json();
                return {
                    country,
                    state,
                    city: null,
                    cityName: null,
                    latitude: stateData.latitude,
                    longitude: stateData.longitude,
                };
            }

            const cityResponse = await fetch(
                `/api/regions?type=coordinates&country=${country}&state=${state}&city=${encodeURIComponent(city)}`
            );
            const coords = await cityResponse.json();
            console.log(coords)

            return {
                country,
                state,
                city,
                latitude: coords.latitude,
                longitude: coords.longitude,
            };
        } catch (error) {
            console.error('Error getting coordinates:', error);
            throw error;
        }
    };

    return {
        getCoordinates
    };
};