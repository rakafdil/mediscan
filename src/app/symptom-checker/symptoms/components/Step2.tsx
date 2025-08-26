// Step2.tsx
import React from 'react';
import { StepContainer, BackButton } from './CommonComponents';
import SymptomList from './SymptomList';
import { FormData } from '../types';
import * as apiService from '@/app/api/symptoms/apiService';

interface Step2Props {
    formData: FormData;
    setFormData: React.Dispatch<React.SetStateAction<FormData>>;
    onNext: () => void;
    onBack: () => void;
    loading: boolean;
    setLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

const Step2: React.FC<Step2Props> = ({
    formData,
    setFormData,
    onNext,
    onBack,
    loading,
    setLoading
}) => {
    const validateSymptoms = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const data = await apiService.validateSymptoms(
                formData.gender,
                formData.age,
                formData.symptoms
            );

            setFormData((prev) => ({
                ...prev,
                result_validate: {
                    ...prev.result_validate,
                    response_for_user: data.response_for_user,
                    symptoms: [...prev.result_validate.symptoms, ...data.symptoms],
                    symptoms_related: data.symptoms_related
                }
            }));
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const predictDisease = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const data = await apiService.predictDisease(
                formData.gender,
                formData.age,
                formData.result_validate.symptoms
            );

            setFormData((prev) => ({
                ...prev,
                result_prediction: data
            }));

            onNext();
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <StepContainer title="Input Gejala">
            <textarea
                placeholder="Type what happened to you..."
                value={formData.symptoms}
                onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
                className="w-full p-2 mb-3 border rounded min-h-[150px]"
            />
            <div className="flex justify-between">
                <button
                    onClick={validateSymptoms}
                    disabled={loading}
                    className="w-full py-2 bg-green-500 text-white rounded cursor-pointer"
                >
                    {loading ? "Menganalisa..." : "Analisa"}
                </button>
            </div>

            <SymptomList formData={formData} setFormData={setFormData} />

            <div className="flex justify-between">
                <BackButton onClick={onBack} />
                <button
                    onClick={predictDisease}
                    className="px-4 py-2 bg-indigo-500 text-white rounded cursor-pointer"
                >
                    Next
                </button>
            </div>
        </StepContainer>
    );
};

export default Step2;