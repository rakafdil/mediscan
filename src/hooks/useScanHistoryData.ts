import { useCallback, useEffect, useState } from 'react'
import { createClient } from '@/app/utils/supabase/client'
import { type User } from '@supabase/supabase-js'
import { ScanHistory } from '../app/account/types'

export const useScanHistoryData = (user: User | null) => {
    const [scanHistory, setScanHistory] = useState<ScanHistory[]>()
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const supabase = createClient()

    const fetchScanHistory = useCallback(async () => {
        if (!user?.id) return

        try {
            setLoading(true)
            setError(null)

            const { data, error: fetchError, status } = await supabase
                .from("user")
                .select(`
                    id,
                    full_name,
                    scan_history (
                    scan_id,
                    scan_timestamp,
                    probability,
                    detected_disease:disease!scan_history_detected_disease_id_fkey (
                        disease_name,
                        disease_precautions (
                        precaution:precaution_id (
                            precaution_text
                        )
                        )
                    ),
                    scan_history_symptoms (
                        symptom:symptom_id (
                        symptom_name
                        )
                    )
                    )
                `)
                .eq("id", user.id)
                .single()


            if (fetchError && status !== 406) {
                throw fetchError
            }

            if (data?.scan_history) {
                console.log("DATA RESULT ===>", data)
                setScanHistory(data.scan_history || [])
            } else {
                setScanHistory({
                    scan_history: []
                })
            }


        } catch (err) {
            console.error('Error loading scan history:', err)
            setError('Failed to load scan history')
        } finally {
            setLoading(false)
        }

    }, [user?.id, supabase])

    useEffect(() => {
        fetchScanHistory()
    }, [fetchScanHistory])

    const updateScanHistory = useCallback(async (newScanHistory: ScanHistory[]) => {
        if (!user?.id) return false

        try {
            const { error: updateError } = await supabase
                .from('user')
                .update({
                    scan_history: newScanHistory,
                    updated_at: new Date().toISOString()
                })
                .eq('id', user.id)

            if (updateError) throw updateError

            // setScanHistory(newScanHistory)
            return true
        } catch (err) {
            console.error('Error updating scan history:', err)
            setError('Failed to update scan history')
            return false
        }

    }, [user?.id, supabase])

    const addScanResult = useCallback(async (scanResult: ScanHistory) => {
        const newHistory = [...scanHistory, scanResult]
        const success = await updateScanHistory(newHistory)
        return success
    }, [scanHistory, updateScanHistory])

    const removeScanResult = useCallback(async (index: number) => {
        const newHistory = scanHistory.filter((_, i) => i !== index)
        const success = await updateScanHistory(newHistory)
        return success
    }, [scanHistory, updateScanHistory])

    return {
        scanHistory,
        setScanHistory,
        loading,
        error,
        refetch: fetchScanHistory,
        updateScanHistory,
        addScanResult,
        removeScanResult
    }
}