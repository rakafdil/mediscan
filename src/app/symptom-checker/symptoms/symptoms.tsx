

"use client"
import React, { useState } from 'react';
import { FormData } from './types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import Step1 from './components/Step1';
import Step2 from './components/Step2';
import Step3 from './components/Step3';
import Step4 from './components/Step4';
import Link from 'next/link';

const stepName = [
    {
        step: 1,
        name: "Data Input"
    },
    {
        step: 2,
        name: "Symptoms"
    },
    {
        step: 3,
        name: "Result"
    },
    {
        step: 4,
        name: "Articles"
    },
    {
        step: 5,
        name: "Hospitals"
    },
]

const DiagnosisFlow: React.FC = () => {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState<FormData>({
        gender: "",
        age: "",
        symptoms: "",
        histories: [],
        location: "",
        result_validate: {
            response_for_user: "",
            symptoms: [],
            symptoms_related: false
        },
        result_prediction: {
            result: []
        }
    });

    const nextStep = () => setStep((prev) => prev + 1);
    const prevStep = () => setStep((prev) => prev - 1);

    const handleBack = () => {
        const hasData = formData.gender !== "" ||
            formData.age !== "" ||
            formData.symptoms !== "" ||
            formData.result_validate.symptoms.some(s => s !== "");

        if (hasData) {
            const confirmed = window.confirm(
                "You have unsaved changes. Are you sure you want to leave?"
            );
            if (!confirmed) {
                return;
            }
            else {
                window.location.href = '/symptom-checker';
            }
        }
        window.location.href = '/symptom-checker';
    };

    // Add this validation function
    const isStepAccessible = (targetStep: number) => {
        switch (targetStep) {
            case 1:
                return true;
            case 2:
                return formData.gender !== "" && formData.age !== "";
            case 3:
                return formData.result_prediction?.result &&
                    formData.result_prediction.result.length > 0;
            case 4:
                return formData.gender !== "" && formData.age !== "" &&
                    formData.symptoms !== "" &&
                    formData.result_validate.symptoms.some(s => s.trim() !== "") &&
                    formData.result_prediction?.result &&
                    formData.result_prediction.result.length > 0;
            case 5:
                return formData.gender !== "" && formData.age !== "" &&
                    formData.symptoms !== "" &&
                    formData.result_validate.symptoms.some(s => s.trim() !== "") &&
                    formData.result_prediction?.result &&
                    formData.result_prediction.result.length > 0;
            default:
                return false;
        }
    };

    const renderStep = () => {
        switch (step) {
            case 1:
                return (
                    <Step1
                        formData={formData}
                        setFormData={setFormData}
                        onNext={nextStep}
                    />
                );
            case 2:
                return (
                    <Step2
                        formData={formData}
                        setFormData={setFormData}
                        onNext={nextStep}
                        onBack={prevStep}
                        loading={loading}
                        setLoading={setLoading}
                    />
                );
            case 3:
                return (
                    <Step3
                        formData={formData}
                        onNext={nextStep}
                        onBack={prevStep}
                    />
                );
            default:
                return (
                    <Step4
                        onNext={nextStep}
                        onBack={prevStep}
                        setStep={setStep}
                        result={formData.result_prediction?.result}

                    />
                );
        }
    };

    return (
        <>
            <div className='flex flex-col items-center justify-center pt-18 gap-10 relative overflow-hidden'>
                <Link
                    href="#"
                    onClick={handleBack}
                    className="absolute top-8 left-8 p-2 rounded-full hover:bg-gray-100 transition-all duration-200 flex items-center align-center gap-2"
                >
                    <FontAwesomeIcon
                        icon={faArrowLeft}
                        className={`text-gray-600 md:text-4xl text-sm`}
                    />
                    <span className="text-gray-600 md:text-2xl text-sm mt-1">Back</span>
                </Link>
                <h1 className='md:text-6xl text-3xl font-bold text-gray-900 text-center'>
                    {stepName.find(item => item.step === step)?.name}
                </h1>
                <div className='flex flex-row md:min-h-[200px] min-h-[120px] xl:gap-30 md:gap-20 sm:gap-8 gap-4 relative overflow-hidden md:px-30 px-8'>
                    <div
                        style={{ width: `${(step) * 20}%` }}
                        className='h-2 bg-[#6AC2EA] absolute left-0 md:top-[28%] lg:top-[22%] top-[24%] transform -translate-y-1/2 transition-all duration-300 rounded-full z-0'
                    />
                    <div
                        className='h-2 w-full bg-[#628EF7] absolute left-0 md:top-[28%] lg:top-[22%] top-[24%] transform -translate-y-1/2 rounded-full z-[-1]'
                    />
                    {stepName.map((item) => (
                        <div
                            key={item.step}
                            className='flex flex-col items-center md:gap-3 gap-1 z-10 relative group'
                        >
                            <button
                                key={item.step}
                                disabled={!isStepAccessible(item.step)}
                                className={`flex justify-center items-center w-14 h-14 md:w-22 md:h-22 rounded-full md:text-2xl text-sm duration-200 relative
                ${step >= item.step
                                        ? 'bg-[#6AC2EA] hover:bg-[#ccebf9] hover:text-black text-white cursor-pointer'
                                        : isStepAccessible(item.step)
                                            ? 'bg-white border-[#628EF7] border-4 hover:bg-[#ccebf9] hover:text-white cursor-pointer'
                                            : 'bg-white border-[#628EF7] border-4 cursor-not-allowed'
                                    }
                                            `}
                                onClick={() => isStepAccessible(item.step) && setStep(item.step)}
                                // onClick={() => setStep(item.step)}
                                title={!isStepAccessible(item.step) ? "Complete previous steps first" : ""}
                            >
                                {item.step}
                            </button>

                            {/* Tooltip for locked steps */}
                            {!isStepAccessible(item.step) && (
                                <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-20">
                                    Complete previous steps first
                                </div>
                            )}

                            <span className={`md:text-2xl text-sm text-center ${!isStepAccessible(item.step) ? 'text-gray-400' : 'text-black'}`}>
                                {item.name}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
            {renderStep()}
        </>
    );
};

export default DiagnosisFlow;