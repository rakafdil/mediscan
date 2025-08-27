export interface DataValidate {
    response_for_user: string;
    symptoms: string[];
    symptoms_related: boolean;
}
export interface Disease {
    disease: string;
    probability: number;
    description: string;
    precautions: string[];
}

export interface PredictionResult {
    result: Disease[];
}

export interface ValidateResult {
    response_for_user: string;
    symptoms: string[];
    symptoms_related: boolean;
}

export interface FormData {
    gender: string;
    age: string;
    symptoms: string;
    histories: string[];
    location: string;
    result_validate: ValidateResult;
    result_prediction: PredictionResult | null;
}

export interface UserComplication {
    gender: string
    age: string
    symptoms: string
    histories: string
    location: string
}