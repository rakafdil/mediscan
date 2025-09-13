import { useCallback, useEffect, useState } from 'react'
import { createClient } from '@/app/utils/supabase/client'
import { type User } from '@supabase/supabase-js'
import { MedicalHistoryData } from '../app/account/types'

export const useMedicalHistoryData = (user: User | null) => {
    const [medicalData, setMedicalData] = useState<MedicalHistoryData>({
        allergies: [],
        diseases: []
    })
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const supabase = createClient()

    const fetchMedicalData = useCallback(async () => {
        if (!user?.id) return

        try {
            setLoading(true)
            setError(null)

            const { data, error: fetchError, status } = await supabase
                .from("user")
                .select(`
                    id,
                    full_name,
                    allergies:user_allergies (
                    allergy:allergy!user_allergies_allergy_id_fkey (
                        allergy_id,
                        allergy_name
                    )
                    ),
                    diseases:user_disease_history (
                    disease:disease!user_disease_history_disease_id_fkey (
                        disease_id,
                        disease_name
                    )
                    )
                `)
                .eq("id", user.id)
                .single()

            if (fetchError && status !== 406) {
                throw fetchError
            }

            if (data?.allergies && data?.diseases) {
                setMedicalData({
                    allergies: data.allergies.map((a: any) => a.allergy.allergy_name) || [],
                    diseases: data.diseases.map((a: any) => a.disease.disease_name) || [],
                })
            } else {
                setMedicalData({
                    allergies: [],
                    diseases: []
                })
            }

        } catch (err) {
            console.error('Error loading medical data:', err)
            setError('Failed to load medical data')
        } finally {
            setLoading(false)
        }
    }, [user?.id, supabase])

    useEffect(() => {
        fetchMedicalData()
    }, [fetchMedicalData])

    const updateMedicalData = useCallback(async (updates: Partial<MedicalHistoryData>) => {
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

            setMedicalData(prev => ({ ...prev, ...updates }))
            return true
        } catch (err) {
            console.error('Error updating medical data:', err)
            setError('Failed to update medical data')
            return false
        }
    }, [user?.id, supabase])

    const addDisease = useCallback((disease: string) => {
        setMedicalData(prev => ({
            ...prev,
            diseases: [...prev.diseases, disease]
        }))
    }, [])

    const removeDisease = useCallback((index: number) => {
        setMedicalData(prev => ({
            ...prev,
            diseases: prev.diseases.filter((_, i) => i !== index)
        }))
    }, [])

    const addAllergy = useCallback((allergy: string) => {
        setMedicalData(prev => ({
            ...prev,
            allergies: [...prev.allergies, allergy]
        }))
    }, [])

    const removeAllergy = useCallback((index: number) => {
        setMedicalData(prev => ({
            ...prev,
            allergies: prev.allergies.filter((_, i) => i !== index)
        }))
    }, [])

    return {
        medicalData,
        setMedicalData,
        loading,
        error,
        refetch: fetchMedicalData,
        updateMedicalData,
        addDisease,
        removeDisease,
        addAllergy,
        removeAllergy
    }
}
