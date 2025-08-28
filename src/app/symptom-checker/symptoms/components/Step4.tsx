import React, { useState } from 'react';
import { StepContainer, BackButton, NextButton } from './CommonComponents';
import { Disease } from '../types';

interface Step4Props {
    onNext: () => void;
    onBack: () => void;
    result: Disease[] | undefined;
}

const Step4: React.FC<Step4Props> = ({ onNext, onBack, result }) => {
    const [isArticle, setIsArticle] = useState(true);
    const [disease, isDisease] = useState(result?.[0]?.disease ?? '')

    return (
        <div className='flex items-center flex-col gap-8 pb-20 w-full max-w-6xl mx-auto px-4'>
            <div className='flex flex-row w-full justify-between'>
                <button
                    className={`text-3xl font-bold text-gray-800 text-center w-[50%] ${isArticle && 'border-b-3 border-blue-300'}`}
                    onClick={() => setIsArticle(true)}
                >
                    Articles
                </button>
                <button
                    className={`text-3xl font-bold text-gray-800 text-center w-[50%] ${!isArticle && 'border-b-3 border-blue-300'}`}
                    onClick={() => setIsArticle(false)}
                >
                    Hospitals
                </button>
            </div>
            {isArticle ? (
                <StepContainer
                    className='w-full rounded-2xl p-8 animate-fadeInUp bg-blue-100'
                >
                    <div className='flex flex-col'>
                        <div>
                            {result?.map((res) => (
                                <button key={res.disease}>
                                    {res.disease}
                                </button>
                            ))}
                        </div>
                    </div>
                </StepContainer>
            ) :
                (
                    <StepContainer
                        className='w-full rounded-2xl p-8 animate-fadeInUp'
                    >
                        <p className="mb-4">
                            hosp
                        </p>
                    </StepContainer>
                )
            }
            <div className="flex justify-between">
                <BackButton onClick={onBack} />
                <NextButton onClick={onNext} />
            </div>
        </div>
    );
};

export default Step4;