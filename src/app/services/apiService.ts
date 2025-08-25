import { DataValidate, PredictionResult } from '../symptom-checker/symptoms/types';

export const validateSymptoms = async (gender: string, age: string, symptoms: string): Promise<DataValidate> => {
    const res = await fetch("/api/symptoms/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            gender,
            age,
            symptoms
        }),
    });

    if (!res.ok) {
        throw new Error('Failed to validate symptoms');
    }

    return res.json();
};

export const predictDisease = async (gender: string, age: string, symptoms: string[]): Promise<PredictionResult> => {
    const res = await fetch("/api/symptoms/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            gender,
            age,
            symptoms
        }),
    });

    if (!res.ok) {
        throw new Error('Failed to predict disease');
    }

    return res.json();
};