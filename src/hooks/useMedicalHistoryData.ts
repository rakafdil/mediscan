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

    const addAllergy = useCallback(async (allergyName: string) => {
        if (!user?.id) return false;
        try {
            const { data: existingAllergy, error: selectError } = await supabase
                .from("allergy")
                .select("allergy_id, allergy_name")
                .eq("allergy_name", allergyName)
                .single();

            if (selectError && selectError.code !== "PGRST116") {
                throw selectError;
            }

            let allergyId: number;

            if (!existingAllergy) {
                const { data: newAllergy, error: insertError } = await supabase
                    .from("allergy")
                    .insert({ allergy_name: allergyName })
                    .select("allergy_id")
                    .single();

                if (insertError) throw insertError;
                allergyId = newAllergy.allergy_id;
            } else {
                allergyId = existingAllergy.allergy_id;
            }

            const { error: userAllergyError } = await supabase
                .from("user_allergies")
                .insert({
                    id: user.id,
                    allergy_id: allergyId,
                });

            if (userAllergyError) throw userAllergyError;

            setMedicalData(prev => ({
                ...prev,
                allergies: [...prev.allergies, allergyName],
            }));

            return true;
        } catch (err) {
            console.error("Error adding allergy:", err);
            setError("Failed to add allergy");
            return false;
        }
    }, [user?.id, supabase]);

    const removeAllergy = useCallback(async (allergyName: string) => {
        if (!user?.id) return false;
        try {
            const { data: allergyData } = await supabase
                .from("allergy")
                .select("allergy_id, allergy_name")
                .eq("allergy_name", allergyName)
                .single();

            const { error } = await supabase
                .from("user_allergies")
                .delete()
                .eq("id", user.id)
                .eq("allergy_id", allergyData?.allergy_id);

            if (error) throw error;

            if (allergyData?.allergy_name) {
                setMedicalData(prev => ({
                    ...prev,
                    allergies: prev.allergies.filter(a => a !== allergyData.allergy_name),
                }));
            }
        } catch (err) {
            console.error("Error removing allergy:", err);
            setError("Failed to remove allergy");
            return false;
        }
    }, [user?.id, supabase]);

    const addDisease = useCallback(async (diseaseName: string) => {
        if (!user?.id) return false;
        try {
            const { data: existingDisease, error: selectError } = await supabase
                .from("disease")
                .select("disease_id, disease_name")
                .eq("disease_name", diseaseName)
                .single();

            if (selectError && selectError.code !== "PGRST116") {
                throw selectError;
            }

            let diseaseId: number;

            if (!existingDisease) {
                // belum ada -> insert baru
                const { data: newDisease, error: insertError } = await supabase
                    .from("disease")
                    .insert({ disease_name: diseaseName })
                    .select("disease_id")
                    .single();

                if (insertError) throw insertError;
                diseaseId = newDisease.disease_id;
            } else {
                // udah ada
                diseaseId = existingDisease.disease_id;
            }

            // assign ke user
            const { error: userDiseaseError } = await supabase
                .from("user_disease_history")
                .insert({
                    id: user.id,
                    disease_id: diseaseId,
                });

            if (userDiseaseError) throw userDiseaseError;

            // update state
            setMedicalData(prev => ({
                ...prev,
                diseases: [...prev.diseases, diseaseName],
            }));

            return true;
        } catch (err) {
            console.error("Error adding disease:", err);
            setError("Failed to add disease");
            return false;
        }
    }, [user?.id, supabase]);

    const removeDisease = useCallback(async (diseaseName: string) => {
        if (!user?.id) return false;
        try {
            const { data: diseaseData } = await supabase
                .from("disease")
                .select("disease_id, disease_name")
                .eq("disease_name", diseaseName)
                .single();

            const { error } = await supabase
                .from("user_disease_history")
                .delete()
                .eq("id", user.id)
                .eq("disease_id", diseaseData?.disease_id);
            if (error) throw error;

            if (diseaseData?.disease_name) {
                setMedicalData(prev => ({
                    ...prev,
                    diseases: prev.diseases.filter(a => a !== diseaseData.disease_name),
                }));
            }
        } catch (err) {
            console.error("Error removing allergy:", err);
            setError("Failed to remove allergy");
            return false;
        }
    }, [user?.id, supabase]);


    return {
        medicalData,
        setMedicalData,
        loading,
        error,
        refetch: fetchMedicalData,
        addDisease,
        removeDisease,
        addAllergy,
        removeAllergy
    }
}
