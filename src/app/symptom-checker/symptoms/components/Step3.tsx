import React, { useState } from 'react';
import { StepContainer, BackButton, NextButton } from './CommonComponents';
import { FormData, Disease } from '../types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';

interface Step3Props {
    formData: FormData;
    onNext: () => void;
    onBack: () => void;
}

interface DiagnosisCardProps {
    probability: number;
    disease: string;
    description: string;
    precautions: string[] | string;
    index: number;
    isOpen: boolean;
    onToggle: () => void;
}

const DiagnosisCard: React.FC<DiagnosisCardProps> = ({
    probability,
    disease,
    description,
    precautions,
    index,
    isOpen,
    onToggle
}) => {
    // Parse precautions if it's a string
    const parsedPrecautions = typeof precautions === 'string'
        ? JSON.parse(precautions)
        : precautions;

    // Calculate percentage and colors
    const percentage = (probability * 100).toFixed(2);

    let barColor = 'bg-green-500';
    let textColor = 'text-green-600';
    let bgColor = 'bg-green-50';
    let borderColor = 'border-green-200';

    if (probability >= 0.75) {
        barColor = 'bg-red-500';
        textColor = 'text-red-600';
        bgColor = 'bg-red-50';
        borderColor = 'border-red-200';
    } else if (probability >= 0.5) {
        barColor = 'bg-yellow-500';
        textColor = 'text-yellow-600';
        bgColor = 'bg-yellow-50';
        borderColor = 'border-yellow-200';
    } else if (probability >= 0.25) {
        barColor = 'bg-blue-500';
        textColor = 'text-blue-600';
        bgColor = 'bg-blue-50';
        borderColor = 'border-blue-200';
    }

    return (
        <div className={`w-full mb-4 border-2 ${bgColor} ${borderColor} rounded-xl shadow-sm transition-all duration-300 hover:shadow-md justify-center`}>
            <button
                onClick={onToggle}
                className={`w-full text-left px-6 py-5 hover:opacity-80 transition-all duration-300 rounded-t-xl ${!isOpen ? 'rounded-b-xl' : ''} flex justify-between items-center`}
            >
                <div className="flex flex-col pr-4 w-[90%]">
                    <div className="flex justify-between gap-3 mb-2 w-full">
                        <span className="text-lg font-semibold text-gray-800 truncate">
                            {disease}
                        </span>
                        <span className={`text-2xl font-bold ${textColor}`}>
                            {percentage}%
                        </span>
                    </div>

                    <div className="bg-white rounded-full h-3 mt-2 shadow-inner w-full">
                        <div
                            className={`${barColor} h-3 rounded-full transition-all duration-500 ease-out`}
                            style={{ width: `${percentage}%` }}
                        ></div>
                    </div>
                </div>

                <FontAwesomeIcon
                    icon={faChevronDown}
                    className={`transform transition-transform duration-300 text-gray-600 ${isOpen ? 'rotate-180' : ''}`}
                />
            </button>

            {isOpen && (
                <div className="px-6 py-5 bg-white border-t-2 border-gray-100 rounded-b-xl animate-fadeIn">
                    <div className="space-y-4">
                        <div>
                            <p className="text-sm font-semibold text-gray-600 mb-1">Probability:</p>
                            <p className={`text-lg font-bold ${textColor}`}>{percentage}%</p>
                        </div>

                        <div>
                            <p className="text-sm font-semibold text-gray-600 mb-2">Description:</p>
                            <p className="text-gray-700 leading-relaxed">{description}</p>
                        </div>

                        {parsedPrecautions && parsedPrecautions.length > 0 && (
                            <div>
                                <p className="text-sm font-semibold text-gray-600 mb-2 flex items-center gap-2">
                                    <FontAwesomeIcon icon={faExclamationTriangle} className="text-orange-500" />
                                    Recommended Actions:
                                </p>
                                <ul className="space-y-2">
                                    {parsedPrecautions.map((precaution: string, idx: number) =>
                                        precaution && (
                                            <li
                                                key={idx}
                                                className="flex items-start gap-3 text-gray-700"
                                            >
                                                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                                                <span className="leading-relaxed">{precaution}</span>
                                            </li>
                                        )
                                    )}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

const Step3: React.FC<Step3Props> = ({ formData, onNext, onBack }) => {
    const [openCardIndex, setOpenCardIndex] = useState<number | null>(null);

    const handleCardToggle = (index: number) => {
        setOpenCardIndex(openCardIndex === index ? null : index);
    };
    return (
        <div className='flex items-center flex-col gap-8 pb-20 w-full max-w-4xl mx-auto px-4'>
            <StepContainer
                className='w-full bg-white shadow-lg rounded-2xl p-8 animate-fadeInUp'
                title="Diagnosis Results"
                titleClassName='text-3xl font-bold mb-8 text-gray-800 text-center'
            >
                {/* Patient Info Summary */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 mb-8 border border-blue-200">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">Patient Information</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <span className="font-medium text-gray-600">Gender:</span>
                            <span className="ml-2 text-gray-800">{formData.gender}</span>
                        </div>
                        <div>
                            <span className="font-medium text-gray-600">Age:</span>
                            <span className="ml-2 text-gray-800">{formData.age} years old</span>
                        </div>
                    </div>
                </div>

                {/* Diagnosis Results */}
                <div className="space-y-4">
                    <h3 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center gap-3">
                        Possible Conditions
                    </h3>

                    <p className="text-lg font-semibold text-gray-800 mb-0.2">Selected Symptoms</p>
                    {formData.result_validate.symptoms
                        .filter(item => item.trim() !== "")
                        .map((symptom, index) => (
                            <span
                                key={index}
                                className="inline-block bg-blue-100 text-blue-800 text-sm font-medium mr-2 px-2.5 py-0.5 rounded-full">
                                {symptom}
                            </span>
                        ))
                    }

                    {formData.result_prediction?.result && formData.result_prediction.result.length > 0 ? (
                        <div className="space-y-3">
                            {formData.result_prediction.result.filter(item => item.disease.trim() !== "").map((disease: Disease, index: number) => (
                                <DiagnosisCard
                                    key={index}
                                    probability={disease.probability}
                                    disease={disease.disease}
                                    description={disease.description}
                                    precautions={disease.precautions}
                                    index={index}
                                    isOpen={openCardIndex === index}
                                    onToggle={() => handleCardToggle(index)}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                            <FontAwesomeIcon icon={faExclamationTriangle} className="text-gray-400 text-4xl mb-4" />
                            <p className="text-xl text-gray-500 font-medium">No diagnosis results available</p>
                            <p className="text-gray-400 mt-2">Please complete the previous steps to get diagnosis</p>
                        </div>
                    )}
                </div>

                {/* Disclaimer */}
                <div className="mt-8 p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800 leading-relaxed">
                        <strong>Important:</strong> This diagnosis is for informational purposes only and should not replace professional medical advice.
                        Please consult with a healthcare provider for proper diagnosis and treatment.
                    </p>
                </div>
            </StepContainer>

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center w-full gap-6 mt-8">
                <BackButton
                    onClick={onBack}
                />
                <NextButton
                    onClick={onNext}
                />
            </div>
        </div>
    );
};

export default Step3;