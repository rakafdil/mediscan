import React from 'react';
import { StepContainer, BackButton } from './CommonComponents';

interface Step5Props {
    onBack: () => void;
}

const Step5: React.FC<Step5Props> = ({ onBack }) => {
    return (
        <StepContainer title="Rumah Sakit Terdekat">
            <ul className="list-disc pl-6">
                <li>RSUD Kota Malang</li>
                <li>RS Saiful Anwar</li>
                <li>RS Hermina</li>
            </ul>
            <BackButton onClick={onBack} />
        </StepContainer>
    );
};

export default Step5;