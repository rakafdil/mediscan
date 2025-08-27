"use client"
import React, { useState } from 'react';
import { FormData } from './types';
import Step1 from './components/Step1';
import Step2 from './components/Step2';
import Step3 from './components/Step3';
import Step4 from './components/Step4';
import Step5 from './components/Step5';
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
        histories: [""],
        location: "",
        result_validate: {
            response_for_user: "",
            symptoms: [""],
            symptoms_related: false
        },
        result_prediction: {
            result: [
                {
                    disease: "",
                    probability: 0.0,
                    description: "",
                    precautions: [""]
                }
            ]
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
            case 4:
                return (
                    <Step4
                        onNext={nextStep}
                        onBack={prevStep}
                    />
                );
            case 5:
                return (
                    <Step5
                        onBack={prevStep}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <>
            <div className='flex flex-col items-center justify-center p-18 gap-10 relative'>
                <Link
                    href="#"
                    onClick={handleBack}
                    className="absolute top-8 left-8 p-2 rounded-full hover:bg-gray-100 transition-all duration-200 flex items-center gap-2"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-gray-600"
                    >
                        <path d="M19 12H5" />
                        <path d="M12 19l-7-7 7-7" />
                    </svg>
                    <span className="text-gray-600">Back</span>
                </Link>
                <h1 className='text-6xl font-bold text-gray-900'>
                    {stepName.find(item => item.step === step)?.name}
                </h1>
                <div className='flex flex-row gap-30 relative overflow-hidden px-30'>
                    <div
                        style={{ width: `${(step) * 20}%` }}
                        className='h-2 bg-[#6AC2EA] absolute left-0 top-[36%] transform -translate-y-1/2 transition-all duration-300 rounded-full z-0'
                    />
                    <div
                        className='h-2 w-full bg-[#628EF7] absolute left-0 top-[36%] transform -translate-y-1/2 rounded-full z-[-1]'
                    />
                    {stepName.map((item) => (
                        <div
                            key={item.step}
                            className='flex flex-col items-center gap-3 z-10'
                        >
                            <button
                                key={item.step}
                                className={`flex justify-center items-center w-22 h-22 rounded-full text-2xl duration-200 cursor-pointer
                                ${step >= item.step
                                        ? 'bg-[#6AC2EA] hover:bg-[#ccebf9] hover:text-black text-white'
                                        : 'bg-white border-[#628EF7] border-4 hover:bg-[#ccebf9] hover:text-white'
                                    }
                                `}
                                onClick={() => setStep(item.step)}
                            >
                                {item.step}
                            </button>
                            <span>
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