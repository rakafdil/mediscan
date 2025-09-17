import { useCallback, useEffect, useState } from 'react'
import { createClient } from '@/app/utils/supabase/client'
import { type User } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'
import { ProfileData } from '../app/account/types'

export const useProfileData = (user: User | null) => {
    const [profileData, setProfileData] = useState<ProfileData>({
        full_name: null,
        username: null,
        age: null,
        gender: null,
        height: null,
        weight: null
    })

    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const supabase = createClient()

    const fetchProfileData = useCallback(async () => {
        if (!user?.id) return

        try {
            setLoading(true)
            setError(null)

            const { data, error: fetchError, status } = await supabase
                .from('user')
                .select('full_name, username, age, gender, height, weight')
                .eq('id', user.id)
                .single()

            if (fetchError && status !== 406) {
                throw fetchError
            }

            if (data) {
                setProfileData({
                    full_name: data.full_name || null,
                    username: data.username || null,
                    age: data.age || null,
                    gender: data.gender || null,
                    height: data.height || null,
                    weight: data.weight || null
                })
            }
        } catch (err) {
            console.error('Error loading profile data:', err)
            setError('Failed to load profile data')
            redirect('/login')
        } finally {
            setLoading(false)
        }
    }, [user?.id, supabase])

    useEffect(() => {
        fetchProfileData()
    }, [fetchProfileData])

    const updateProfileData = useCallback(async (updates: Partial<ProfileData>) => {
        if (!user?.id) return false

        try {
            const { error: updateError } = await supabase
                .from('user')
                .update({
                    ...updates,
                    updated_at: new Date().toISOString()
                })
                .eq('id', user.id)

            if (updateError) throw updateError

            setProfileData(prev => ({ ...prev, ...updates }))
            return true
        } catch (err) {
            console.error('Error updating profile data:', err)
            setError('Failed to update profile data')
            return false
        }
    }, [user?.id, supabase])

    return {
        profileData,
        setProfileData,
        loading,
        error,
        refetch: fetchProfileData,
        updateProfileData
    }
}
