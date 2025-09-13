import { useCallback, useEffect, useState } from 'react'
import { createClient } from '@/app/utils/supabase/client'
import { type User } from '@supabase/supabase-js'
import { LocationData } from '../app/account/types'

export const useLocationData = (user: User | null) => {
    const [locationData, setLocationData] = useState<LocationData>({
        street: null,
        city: null,
        state: null,
        country: null,
        lon: null,
        lat: null
    })

    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const supabase = createClient()

    const fetchLocationData = useCallback(async () => {
        if (!user?.id) return

        try {
            setLoading(true)
            setError(null)

            const { data, error: fetchError, status } = await supabase
                .from("user")
                .select(`
                    id,
                    full_name,
                    location:location!location_location_id_fkey (
                        country,
                        state,
                        city,
                        street,
                        lon,
                        lat
                    )
                `)
                .eq("id", (await supabase.auth.getUser()).data.user?.id)
                .single()
            console.log(data, fetchError, status);
            if (fetchError && status !== 406) {
                throw fetchError
            }

            if (data?.location) {
                setLocationData({
                    street: data.location.street,
                    city: data.location.city,
                    state: data.location.state,
                    country: data.location.country,
                    lon: data.location.lon,
                    lat: data.location.lat
                })
            } else {
                setLocationData(null) // atau kasih default value
            }

        } catch (err) {
            console.error('Error loading location data:', err)
            setError('Failed to load location data')
        } finally {
            setLoading(false)
        }

    }, [user?.id, supabase])

    useEffect(() => {
        fetchLocationData()
    }, [fetchLocationData])

    const updateLocationData = useCallback(async (updates: Partial<LocationData>) => {
        if (!user?.id) return false

        try {
            const { error: updateError } = await supabase
                .from('location')
                .update({
                    ...updates,
                    updated_at: new Date().toISOString()
                })
                .eq('id', user.id)

            if (updateError) throw updateError

            setLocationData(prev => ({ ...prev, ...updates }))
            return true
        } catch (err) {
            console.error('Error updating location data:', err)
            setError('Failed to update location data')
            return false
        }
    }, [user?.id, supabase])

    return {
        locationData,
        setLocationData,
        loading,
        error,
        refetch: fetchLocationData,
        updateLocationData
    }
}