import React from 'react';
import { StepContainer, BackButton, NextButton } from './CommonComponents';

interface Step4Props {
    onNext: () => void;
    onBack: () => void;
}

const Step4: React.FC<Step4Props> = ({ onNext, onBack }) => {
    return (
        <StepContainer title="Artikel Kesehatan">
            <p className="mb-4">
                Banyak istirahat, minum air putih, dan konsumsi vitamin C dapat membantu
                pemulihan.
            </p>
            <div className="flex justify-between">
                <BackButton onClick={onBack} />
                <NextButton onClick={onNext} />
            </div>
        </StepContainer>
    );
};

export default Step4;