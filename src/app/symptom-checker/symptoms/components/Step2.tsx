import React from 'react';
import { StepContainer, BackButton } from './CommonComponents';
import EditableList from './EditableList';
import { FormData } from '../types';
import * as apiService from '@/app/api/symptoms/apiService';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faArrowRight } from '@fortawesome/free-solid-svg-icons';

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
                formData.symptoms,
                formData.histories,
                formData.location
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
                formData.result_validate.symptoms,
                formData.histories,
                formData.location
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
        <div className='flex items-center flex-col gap-8 pb-20 w-full max-w-6xl mx-auto px-4'>
            <StepContainer
                className='w-full bg-white shadow-lg rounded-2xl p-8 animate-fadeInUp'
            >
                <div className="flex items-center justify-center gap-3 mb-4">
                    <h2 className="text-3xl font-bold text-gray-800">Describe Your Symptoms</h2>
                </div>

                <div className="space-y-6">
                    <div className="relative">
                        <textarea
                            placeholder="Please describe what symptoms you're experiencing in detail. For example: 'I have a headache that started this morning, along with a mild fever and fatigue...'"
                            value={formData.symptoms}
                            onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
                            className="w-full p-6 border-2 border-gray-200 rounded-xl min-h-[200px] text-lg leading-relaxed resize-none focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-300 shadow-sm"
                            rows={8}
                        />
                        <div className="absolute bottom-4 right-4 text-sm text-gray-400">
                            {formData.symptoms.length}/500 characters
                        </div>
                    </div>

                    <button
                        onClick={validateSymptoms}
                        disabled={loading || !formData.symptoms.trim()}
                        className={`w-full py-4 px-8 rounded-xl font-semibold text-xl flex items-center justify-center gap-3 transition-all duration-300 transform ${loading || !formData.symptoms.trim()
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-green-500 text-white hover:bg-green-600 hover:scale-105 shadow-lg hover:shadow-xl'
                            }`}
                    >
                        {loading ? (
                            <>
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                                Analyzing Symptoms...
                            </>
                        ) : (
                            <>
                                <FontAwesomeIcon icon={faSearch} />
                                Analyze Symptoms
                            </>
                        )}
                    </button>
                </div>
            </StepContainer>

            {formData.result_validate.response_for_user && (
                <StepContainer
                    className='w-full bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-8 animate-fadeInUp delay-100'
                >
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                        <h3 className="text-xl font-semibold text-blue-800">AI Analysis Result</h3>
                    </div>
                    <div className="bg-white rounded-lg p-6 shadow-sm border border-blue-100">
                        <p className="text-gray-700 leading-relaxed text-lg">
                            {formData.result_validate.response_for_user}
                        </p>
                    </div>
                </StepContainer>
            )}

            {formData.result_validate.symptoms.length > 0 && (
                <StepContainer
                    className='w-full rounded-2xl animate-fadeInUp delay-200'
                    title='Identified Symptoms'
                    titleClassName='text-3xl font-bold text-gray-800 text-center'
                >
                    <EditableList
                        items={formData.result_validate.symptoms}
                        onAdd={(item) => setFormData(prev => ({
                            ...prev,
                            result_validate: {
                                ...prev.result_validate,
                                symptoms: [...prev.result_validate.symptoms, item]
                            }
                        }))}
                        onUpdate={(index, newValue) => setFormData(prev => ({
                            ...prev,
                            result_validate: {
                                ...prev.result_validate,
                                symptoms: prev.result_validate.symptoms.map((sym, idx) =>
                                    idx === index ? newValue : sym
                                )
                            }
                        }))}
                        onDelete={(index) => setFormData(prev => ({
                            ...prev,
                            result_validate: {
                                ...prev.result_validate,
                                symptoms: prev.result_validate.symptoms.filter((_, idx) => idx !== index)
                            }
                        }))}
                        placeholder="Enter additional symptom"
                        addButtonText="Add Symptom"
                        emptyStateTitle="No symptoms identified yet"
                        emptyStateSubtitle="Analyze your description first to identify symptoms"
                        showConfirmDelete={true}
                    />
                </StepContainer>
            )}

            <div className="flex justify-between items-center w-full max-w-2xl gap-6 mt-8">
                <BackButton
                    onClick={onBack}
                />

                <button
                    onClick={predictDisease}
                    disabled={loading || formData.result_validate.symptoms.length === 0}
                    className={`flex-1 max-w-xs py-4 px-8 rounded-xl font-semibold text-xl flex items-center justify-center gap-3 transition-all duration-300 transform ${loading || formData.result_validate.symptoms.length === 0
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-indigo-500 text-white hover:bg-indigo-600 hover:scale-105 shadow-lg hover:shadow-xl'
                        }`}
                >
                    {loading ? (
                        <>
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                            Processing...
                        </>
                    ) : (
                        <>
                            Get Diagnosis
                            <FontAwesomeIcon icon={faArrowRight} />
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

export default Step2;