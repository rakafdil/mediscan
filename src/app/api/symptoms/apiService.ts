import { MedicalHistoryData } from '@/app/account/types';
import { DataValidate, PredictionResult, Symptom } from '../../symptom-checker/symptoms/types';

export const validateSymptoms = async (
    gender: string,
    age: string,
    height: string,
    weight: string,
    symptoms: string,              
    histories: MedicalHistoryData,
    location: string,
    weather: string
): Promise<DataValidate> => {
    const res = await fetch("/api/symptoms/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            gender, age, height, weight,
            histories, location, symptoms, weather
        }),
    });

    if (!res.ok) throw new Error('Failed to validate symptoms');
    return res.json();
};

export const predictDisease = async (
    gender: string,
    age: string,
    height: string,
    weight: string,
    symptoms: Symptom[],          
    histories: MedicalHistoryData,
    location: string,
    weather: string
): Promise<PredictionResult> => {
    const res = await fetch("/api/symptoms/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            gender, age, height, weight,
            symptoms, histories, location, weather
        }),
    });

    if (!res.ok) throw new Error('Failed to predict disease');
    return res.json();
};