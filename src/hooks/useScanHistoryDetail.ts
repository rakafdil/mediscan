import { useCallback, useState } from 'react'
import { createClient } from '@/app/utils/supabase/client'
import { type User } from '@supabase/supabase-js'
import { ScanHistory } from '../app/account/types'

interface ScanHistoryDetail extends ScanHistory {
    age?: number
    gender?: string
    height?: number
    weight?: number
}

export const useScanHistoryDetail = (user: User | null) => {
    const [scanDetail, setScanDetail] = useState<ScanHistoryDetail | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const supabase = createClient()

    const fetchScanDetail = useCallback(async (scanId: string) => {
        if (!user?.id || !scanId) return null

        try {
            setLoading(true)
            setError(null)

            const { data, error: fetchError } = await supabase
                .from("user_scan_history")
                .select(`
                    scan_id,
                    created_at,
                    age,
                    height,
                    weight,
                    gender,
                    scan_history (
                        probability,
                        disease (
                            disease_name
                        ),
                        precaution (
                            precaution_text
                        )
                    ),
                    scan_history_symptoms (
                        symptom (
                            symptom_name
                        )
                    )
                `)
                .eq("scan_id", scanId)
                .eq("user_id", user.id)
                .single()

            if (fetchError) {
                throw fetchError
            }

            if (data) {
                const transformedData = {
                    scan_id: data.scan_id.toString(),
                    scan_timestamp: data.created_at,
                    age: data.age,
                    height: data.height,
                    weight: data.weight,
                    gender: data.gender,
                    probability: data.scan_history[0]?.probability || 0,
                    diseases: data.scan_history?.map((sh: any) => ({
                        disease_name: sh.disease?.disease_name || '',
                        probability: sh.probability || 0,
                        precaution: sh.precaution?.precaution_text || ''
                    })).filter((d: any) => d.disease_name) || [],
                    scan_history_symptoms: data.scan_history_symptoms?.map((symptomItem: any) => ({
                        symptom: {
                            symptom_name: symptomItem.symptom.symptom_name
                        }
                    })) || []
                }

                setScanDetail(transformedData)
                return transformedData
            }

            return null

        } catch (err) {
            console.error('Error loading scan detail:', err)
            setError('Failed to load scan detail')
            return null
        } finally {
            setLoading(false)
        }
    }, [user?.id, supabase])

    return {
        scanDetail,
        loading,
        error,
        fetchScanDetail
    }
}