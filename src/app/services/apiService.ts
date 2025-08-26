import { DataValidate, PredictionResult } from '../symptom-checker/symptoms/types';

const isDevelopment = process.env.NODE_ENV === 'development';
const BASE_URL = isDevelopment
    ? 'http://localhost:3000'
    : process.env.NEXT_PUBLIC_API_URL;

export const validateSymptoms = async (gender: string, age: string, symptoms: string): Promise<DataValidate> => {
    const apiUrl = `${BASE_URL}/api/symptoms/validate`;
    console.log(`Calling API: ${apiUrl} in ${process.env.NODE_ENV} mode`);

    const res = await fetch(apiUrl, {
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
    const apiUrl = `${BASE_URL}/api/symptoms/predict`;
    console.log(`Calling API: ${apiUrl} in ${process.env.NODE_ENV} mode`);

    const res = await fetch(apiUrl, {
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