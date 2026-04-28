export interface ScanHistory {
    scan_id: string
    scan_timestamp: string
    probability: number
    precautions?: string
    diseases?: {
        precaution: string,
        disease_name: string,
        probability: number
    }[]
    scan_history_symptoms?: { symptom: { symptom_name: string } }[]
}

export interface ProfileData {
    full_name: string | null
    username: string | null
    age: number | null
    updated_at?: string | null
    gender: string | null
    height: number | null
    weight: number | null
}

export interface LocationData {
    street: string | null
    city: string | null
    state: string | null
    country: string | null
    updated_at?: string | null
    lon: number | null
    lat: number | null
}

export interface HistoryData {
    name: string;
    description: string;
}
export interface MedicalHistoryData {
    allergies: HistoryData[]
    diseases: HistoryData[]
}

export interface CompleteProfile extends ProfileData, LocationData, MedicalHistoryData {
    scan_history: ScanHistory[]
}
