import { useCallback, useEffect, useState } from 'react'
import { createClient } from '@/app/utils/supabase/client'
import { type User } from '@supabase/supabase-js'
import { ScanHistory } from '../app/account/types'
import { PredictionResult } from '@/app/symptom-checker/symptoms/types'

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

            const { data, error: fetchError } = await supabase
                .from("user_scan_history")
                .select(`
                    scan_id,
                    created_at,
                    age,
                    height,
                    weight,
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
                .eq("user_id", user.id)
                .order('created_at', { ascending: false })

            if (fetchError) {
                throw fetchError
            }

            console.log("data", data);

            if (data && data.length > 0) {
                const transformedData = data.map((scanEntry: any) => ({
                    scan_id: scanEntry.scan_id.toString(),
                    scan_timestamp: scanEntry.created_at,
                    // Ambil probability dari disease pertama atau rata-rata
                    probability: scanEntry.scan_history[0]?.probability || 0,
                    // Gabungkan semua precautions
                    precautions: scanEntry.scan_history
                        .map((sh: any) => sh.precaution?.precaution_text)
                        .filter((text: string) => text)
                        .join(', ') || '',
                    // Ubah menjadi array dari semua diseases
                    diseases: scanEntry.scan_history?.map((sh: any) => ({
                        disease_name: sh.disease?.disease_name || '',
                        probability: sh.probability || 0
                    })).filter((d: any) => d.disease_name) || [],
                    scan_history_symptoms: scanEntry.scan_history_symptoms?.map((symptomItem: any) => ({
                        symptom: {
                            symptom_name: symptomItem.symptom.symptom_name
                        }
                    })) || []
                }))

                console.log("transformedData", transformedData);
                setScanHistory(transformedData as ScanHistory[])
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
            console.log('Update scan history not implemented for new structure')
            return false
        } catch (err) {
            console.error('Error updating scan history:', err)
            setError('Failed to update scan history')
            return false
        }

    }, [user?.id, supabase])

    const addScanResult = useCallback(async (scanResult: PredictionResult, symptoms: string[]) => {
        if (!user?.id) return false

        try {
            setLoading(true)
            setError(null)

            // 1. Create a scan entry first
            const { data: scanData, error: scanError } = await supabase
                .from('scan')
                .insert({
                    user_id: user.id
                })
                .select('scan_id')
                .single()

            if (scanError) throw scanError
            const scanId = scanData.scan_id

            // 2. Create user_scan_history entry
            const { error: userScanError } = await supabase
                .from('user_scan_history')
                .insert({
                    scan_id: scanId,
                    user_id: user.id,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                    // TODO: Add age, height, weight from form data
                    // age: formData.age,
                    // height: formData.height,
                    // weight: formData.weight
                })

            if (userScanError) throw userScanError

            // 3. Process each result from the prediction
            for (const result of scanResult.result) {
                console.log("result", result);
                if (result.disease && result.disease.trim() !== "") {
                    // Handle disease
                    let diseaseId = null;
                    const { data: existingDisease } = await supabase
                        .from('disease')
                        .select('disease_id')
                        .eq('disease_name', result.disease)
                        .single();

                    if (existingDisease) {
                        diseaseId = existingDisease.disease_id;
                    } else {
                        const { data: newDisease, error: diseaseInsertError } = await supabase
                            .from('disease')
                            .insert({ disease_name: result.disease })
                            .select('disease_id')
                            .single();

                        if (diseaseInsertError) throw diseaseInsertError
                        diseaseId = newDisease?.disease_id;
                    }

                    // Handle precautions
                    let precautionId = null;
                    if (result.precautions) {
                        const precautions = Array.isArray(result.precautions)
                            ? result.precautions.join(', ')
                            : result.precautions || '';

                        const { data: existingPrecaution } = await supabase
                            .from('precaution')
                            .select('precaution_id')
                            .eq('precaution_text', precautions)
                            .single();

                        if (existingPrecaution) {
                            precautionId = existingPrecaution.precaution_id;
                        } else {
                            const { data: newPrecaution, error: precautionInsertError } = await supabase
                                .from('precaution')
                                .insert({ precaution_text: precautions })
                                .select('precaution_id')
                                .single();

                            if (precautionInsertError) throw precautionInsertError
                            precautionId = newPrecaution?.precaution_id;
                        }
                    }

                    // Insert to scan_history
                    const { error: scanHistoryError } = await supabase
                        .from('scan_history')
                        .insert({
                            scan_id: scanId,
                            disease_id: diseaseId,
                            probability: result.probability,
                            precaution_id: precautionId
                        });

                    if (scanHistoryError) throw scanHistoryError;
                }
            }

            // 4. Handle symptoms
            for (const symptomName of symptoms) {
                if (symptomName && symptomName.trim() !== "") {
                    let symptomId: string | null = null;

                    const { data: existingSymptom } = await supabase
                        .from('symptom')
                        .select('symptom_id')
                        .eq('symptom_name', symptomName.trim())
                        .single();

                    if (existingSymptom) {
                        symptomId = existingSymptom.symptom_id;
                    } else {
                        const { data: newSymptom, error: symptomInsertError } = await supabase
                            .from('symptom')
                            .insert({ symptom_name: symptomName.trim() })
                            .select('symptom_id')
                            .single();

                        if (symptomInsertError) throw symptomInsertError
                        symptomId = newSymptom?.symptom_id;
                        console.log("masok", symptomId);
                    }

                    if (symptomId) {
                        await supabase.from('scan_history_symptoms').insert({
                            scan_id: scanId,
                            symptom_id: symptomId
                        });
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

            // Delete in correct order due to foreign key constraints
            // 1. Delete scan_history_symptoms
            await supabase
                .from('scan_history_symptoms')
                .delete()
                .eq('scan_id', scanId)

            // 2. Delete scan_history
            await supabase
                .from('scan_history')
                .delete()
                .eq('scan_id', scanId)

            // 3. Delete user_scan_history
            await supabase
                .from('user_scan_history')
                .delete()
                .eq('scan_id', scanId)
                .eq('user_id', user.id)

            // 4. Delete scan
            const { error: scanError } = await supabase
                .from('scan')
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