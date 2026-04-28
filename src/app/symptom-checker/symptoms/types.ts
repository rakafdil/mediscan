import { LocationData, MedicalHistoryData } from '@/app/account/types';
import { DailyWeatherFactors } from '@/hooks/getWeatherFactors';

export interface Symptom {
    name: string;
    duration: string;
    severity: string;
    description: string;  
}

export interface DataValidate {
    response_for_user: string;
    symptoms: Symptom[];         
    symptoms_related: boolean;
    user_language: string;
}

export interface UserComplication {
    gender: string;
    age: string;
    height: string;
    weight: string;
    symptoms: Symptom[];         
    histories: MedicalHistoryData;
    location: string;
    weather: DailyWeatherFactors;
}

export interface Disease {
    disease: string;
    probability: number;
    description: string;
    reasoning: string;     
    precautions: string[];
    first_aid: string;      
}

export interface PredictionResult {
    result: Disease[];
    scan_timestamp: string;
}

export interface ValidateResult {
    response_for_user: string;
    symptoms: Symptom[];
    symptoms_related: boolean;
    user_language: string;
}

export interface FormData {
    gender: string;
    age: string;
    height: string;
    weight: string;
    symptoms: Symptom[];
    histories: MedicalHistoryData;
    location: LocationData;
    weather: string;
    result_validate: ValidateResult;
    result_prediction: PredictionResult | null;
}