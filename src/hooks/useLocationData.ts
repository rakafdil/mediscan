import { useCallback, useEffect, useState } from 'react';
import { createClient } from '@/app/utils/supabase/client';
import { type User } from '@supabase/supabase-js';
import { LocationData } from '../app/account/types';
import { useSearchLocationData } from './useSearchLocation';

export const useLocationData = (user: User | null) => {
    const [locationData, setLocationData] = useState<LocationData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const supabase = createClient();

    const fetchLocationData = useCallback(async () => {
        if (!user?.id) return;

        try {
            setLoading(true);
            setError(null);

            const { data, error: fetchError, status } = await supabase
                .from("user")
                .select(`
                    id,
                    user_location(
                        location(*)
                    )
                `)
                .eq("id", user.id)
                .single();

            if (fetchError && status !== 406) {
                throw fetchError;
            }

            const location = data?.user_location?.[0]?.location;

            if (location) {
                setLocationData({
                    street: location.street,
                    city: location.city,
                    state: location.state,
                    country: location.country,
                    lon: location.lon,
                    lat: location.lat,
                    updated_at: location.updated_at
                });
            } else {
                setLocationData(null);
            }

        } catch (err: any) {
            console.error('Error loading location data:', err);
            setError('Failed to load location data: ' + err.message);
        } finally {
            setLoading(false);
        }

    }, [user?.id, supabase]);

    useEffect(() => {
        fetchLocationData();
    }, [fetchLocationData]);

    const updateLocationData = useCallback(async (updates: Partial<LocationData>) => {
        if (!user?.id) {
            setError("User not authenticated.");
            return false;
        }

        setLoading(true);
        setError(null);

        try {
            const { data: userLocationData, error: userLocationError } = await supabase
                .from('user_location')
                .select('location_id')
                .eq('user_id', user.id)
                .single();

            if (userLocationError && userLocationError.code !== 'PGRST116') {
                throw userLocationError;
            }

            const locationId = userLocationData?.location_id;

            if (!updates.country) {
                updates.lat = null;
                updates.lon = null;
            } else if (!updates.state || !updates.city) {
                const countryResponse = await fetch(`/api/regions?type=coordinates&country=${updates.country}`);
                const countryData = await countryResponse.json();
                updates.lat = countryData.latitude;
                updates.lon = countryData.longitude;
            } else if (!updates.city) {
                const stateResponse = await fetch(`/api/regions?type=coordinates&country=${updates.country}&state=${updates.state}`);
                const stateData = await stateResponse.json();
                updates.lat = stateData.latitude;
                updates.lon = stateData.longitude;
            } else {
                const cityResponse = await fetch(
                    `/api/regions?type=coordinates&country=${updates.country}&state=${updates.state}&city=${updates.city}`
                );
                const coords = await cityResponse.json();
                updates.lat = coords.latitude;
                updates.lon = coords.longitude;
            }

            if (locationId) {
                const { error: updateError } = await supabase
                    .from('location')
                    .update({
                        ...updates,
                        updated_at: new Date().toISOString()
                    })
                    .eq('location_id', locationId);

                if (updateError) throw updateError;

            } else {
                const { data: newLocation, error: insertLocationError } = await supabase
                    .from('location')
                    .insert({
                        ...updates,
                        updated_at: new Date().toISOString()
                    })
                    .select('location_id')
                    .single();

                if (insertLocationError) throw insertLocationError;
                if (!newLocation) throw new Error("Failed to create new location entry.");

                const newLocationId = newLocation.location_id;

                const { error: insertUserLocationError } = await supabase
                    .from('user_location')
                    .insert({
                        user_id: user.id,
                        location_id: newLocationId
                    });

                if (insertUserLocationError) throw insertUserLocationError;
            }

            await fetchLocationData();
            return true;

        } catch (err: any) {
            console.error("Error updating location data:", err);
            setError("Failed to update location data: " + err.message);
            return false;
        } finally {
            setLoading(false);
        }
    }, [user?.id, supabase, fetchLocationData]);


    return {
        locationData,
        loading,
        error,
        setLocationData,
        refetch: fetchLocationData,
        updateLocationData
    };
}

