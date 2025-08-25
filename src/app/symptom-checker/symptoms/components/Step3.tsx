// Step3.tsx
import React from 'react';
import { StepContainer, BackButton, NextButton } from './CommonComponents';
import { FormData } from '../types';

interface Step3Props {
    formData: FormData;
    onNext: () => void;
    onBack: () => void;
}

const Step3: React.FC<Step3Props> = ({ formData, onNext, onBack }) => {
    return (
        <StepContainer title="Hasil Diagnosis">
            <p>
                <b>Gender:</b> {formData.gender}
            </p>
            <p>
                <b>Age:</b> {formData.age}
            </p>
            <p>
                <b>Hasil:</b>
            </p>

            {formData.result_prediction ? (
                <pre className="bg-gray-100 p-3 mt-4 rounded text-sm whitespace-pre-wrap">
                    {formData.result_prediction.description}
                </pre>
            ) : (
                <p className="mt-4 text-red-500">Tidak ada hasil</p>
            )}

            <div className="flex justify-between mt-4">
                <BackButton onClick={onBack} />
                <NextButton onClick={onNext} />
            </div>
        </StepContainer>
    );
};

export default Step3;