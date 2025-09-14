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
                        scan_precautions (
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
                const transformedData = data.scan_history.map((item: any) => ({
                    scan_id: item.scan_id,
                    scan_timestamp: item.scan_timestamp,
                    probability: item.probability,
                    disease: item.detected_disease?.[0] ? {
                        disease_name: item.detected_disease[0].disease_name
                    } : undefined,
                    precautions: item.detected_disease?.[0]?.scan_precautions?.[0]?.precaution?.precaution_text,
                    scan_history_symptoms: item.scan_history_symptoms?.map((symptomItem: any) => ({
                        symptom: {
                            symptom_name: symptomItem.symptom.symptom_name
                        }
                    }))
                }))
                setScanHistory(transformedData)
            } else {
                setScanHistory([])
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
        if (!user?.id) return false

        try {
            setLoading(true)
            setError(null)

            let diseaseId: string | null = null
            if (scanResult.disease?.disease_name) {
                const { data: existingDisease } = await supabase
                    .from('disease')
                    .select('disease_id')
                    .eq('disease_name', scanResult.disease.disease_name)
                    .single()

                if (existingDisease) {
                    diseaseId = existingDisease.disease_id
                } else {
                    const { data: newDisease, error: diseaseError } = await supabase
                        .from('disease')
                        .insert({ disease_name: scanResult.disease.disease_name })
                        .select('disease_id')
                        .single()

                    if (diseaseError) throw diseaseError
                    diseaseId = newDisease.disease_id
                }
            }

            let precautionId: string | null = null
            if (scanResult.precautions) {
                const { data: existingPrecaution } = await supabase
                    .from('precaution')
                    .select('precaution_id')
                    .eq('precaution_text', scanResult.precautions)
                    .single()

                if (existingPrecaution) {
                    precautionId = existingPrecaution.precaution_id
                } else {
                    const { data: newPrecaution, error: precautionError } = await supabase
                        .from('precaution')
                        .insert({ precaution_text: scanResult.precautions })
                        .select('precaution_id')
                        .single()

                    if (precautionError) throw precautionError
                    precautionId = newPrecaution.precaution_id
                }

                if (diseaseId && precautionId) {
                    const { error: linkError } = await supabase
                        .from('scan_precautions')
                        .insert({
                            disease_id: diseaseId,
                            precaution_id: precautionId
                        })

                    if (linkError && linkError.code !== '23505') {
                        throw linkError
                    }
                }
            }

            const { data: scanData, error: scanError } = await supabase
                .from('scan_history')
                .insert({
                    user_id: user.id,
                    scan_timestamp: scanResult.scan_timestamp,
                    probability: scanResult.probability,
                    detected_disease_id: diseaseId
                })
                .select('scan_id')
                .single()

            if (scanError) throw scanError

            if (scanResult.scan_history_symptoms && scanData) {
                for (const symptomItem of scanResult.scan_history_symptoms) {
                    let symptomId: string | null = null

                    const { data: existingSymptom } = await supabase
                        .from('symptom')
                        .select('symptom_id')
                        .eq('symptom_name', symptomItem.symptom.symptom_name)
                        .single()

                    if (existingSymptom) {
                        symptomId = existingSymptom.symptom_id
                    } else {
                        const { data: newSymptom, error: symptomError } = await supabase
                            .from('symptom')
                            .insert({ symptom_name: symptomItem.symptom.symptom_name })
                            .select('symptom_id')
                            .single()

                        if (symptomError) throw symptomError
                        symptomId = newSymptom.symptom_id
                    }

                    // 6. Link scan_id dengan symptom_id di scan_history_symptoms
                    if (symptomId) {
                        const { error: linkSymptomError } = await supabase
                            .from('scan_history_symptoms')
                            .insert({
                                scan_id: scanData.scan_id,
                                symptom_id: symptomId
                            })

                        if (linkSymptomError) throw linkSymptomError
                    }
                }
            }

            await fetchScanHistory()
            return true

        } catch (err) {
            console.error('Error adding scan result:', err)
            setError('Failed to add scan result: ' + (err as Error).message)
            return false
        } finally {
            setLoading(false)
        }
    }, [user?.id, supabase, fetchScanHistory])

    const removeScanResult = useCallback(async (scanId: string) => {
        if (!user?.id) return false

        try {
            setLoading(true)
            setError(null)

            const { error: symptomsError } = await supabase
                .from('scan_history_symptoms')
                .delete()
                .eq('scan_id', scanId)

            if (symptomsError) throw symptomsError

            const { error: scanError } = await supabase
                .from('scan_history')
                .delete()
                .eq('scan_id', scanId)
                .eq('user_id', user.id)

            if (scanError) throw scanError

            await fetchScanHistory()
            return true

        } catch (err) {
            console.error('Error removing scan result:', err)
            setError('Failed to remove scan result: ' + (err as Error).message)
            return false
        } finally {
            setLoading(false)
        }
    }, [user?.id, supabase, fetchScanHistory])

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