import React, { useState, useEffect } from 'react';
import { StepContainer, BackButton, NextButton } from './CommonComponents';
import { Disease } from '../types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faNewspaper, faHospital, faSearch, faExternalLinkAlt, faSpinner } from '@fortawesome/free-solid-svg-icons';

interface Step4Props {
    onNext: () => void;
    onBack: () => void;
    result: Disease[] | undefined;
    setStep: React.Dispatch<React.SetStateAction<number>>;
}

interface SearchResult {
    id: string;
    judul: string;
    isi: string;
    link: string;
    source: string;
}

const Step4: React.FC<Step4Props> = ({ onNext, onBack, result, setStep }) => {
    const [isArticle, setIsArticle] = useState(true);
    const [selectedDisease, setSelectedDisease] = useState<string>('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [loadingArticle, setLoadingArticle] = useState(false);

    // Initialize with the first disease if available
    useEffect(() => {
        if (result && result.length > 0 && !selectedDisease) {
            setSelectedDisease(result[0].disease);
            handleSearch(result[0].disease);
        }
    }, [result]);

    const handleSearch = async (disease: string) => {
        if (!disease) return;

        setSelectedDisease(disease);
        setLoadingArticle(true);
        setResults([]);

        try {
            const res = await fetch(`/api/search?q=${encodeURIComponent(disease)}`);
            if (!res.ok) throw new Error('Search failed');
            const data = await res.json();
            setResults(data || []);
        } catch (err) {
            console.error("Search failed:", err);
            setResults([]);
        } finally {
            setLoadingArticle(false);
        }
    };

    const handleTabSwitch = (isArticleTab: boolean) => {
        setIsArticle(isArticleTab);
        setStep(isArticleTab ? 4 : 5);
    };

    const truncateText = (text: string, maxLength: number) => {
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    };

    return (
        <div className='flex items-center flex-col gap-8 pb-20 w-full max-w-7xl mx-auto px-4'>
            {/* Tab Navigation */}
            <div className='flex flex-row w-full max-w-4xl bg-gray-100 rounded-2xl p-2 shadow-inner'>
                <button
                    className={`flex-1 py-4 px-6 rounded-xl font-semibold text-xl transition-all duration-300 flex items-center justify-center gap-3 ${isArticle
                        ? 'bg-white text-blue-600 shadow-md'
                        : 'text-gray-600 hover:text-gray-800'
                        }`}
                    onClick={() => handleTabSwitch(true)}
                >
                    <FontAwesomeIcon icon={faNewspaper} />
                    Articles
                </button>
                <button
                    className={`flex-1 py-4 px-6 rounded-xl font-semibold text-xl transition-all duration-300 flex items-center justify-center gap-3 ${!isArticle
                        ? 'bg-white text-blue-600 shadow-md'
                        : 'text-gray-600 hover:text-gray-800'
                        }`}
                    onClick={() => handleTabSwitch(false)}
                >
                    <FontAwesomeIcon icon={faHospital} />
                    Hospitals
                </button>
            </div>

            {isArticle ? (
                <div className='w-full flex gap-8'>
                    {/* Disease Selection Sidebar */}
                    <StepContainer
                        className='w-1/3 bg-white shadow-lg rounded-2xl p-6'
                        title='Select Disease'
                        titleClassName='text-xl font-bold mb-6 text-gray-800'
                    >
                        <div className='space-y-3'>
                            {result && result.filter(item => item.disease.trim() !== "").length > 0 ? (
                                result.filter(item => item.disease.trim() !== "").map((disease, index) => (
                                    <button
                                        key={disease.disease}
                                        onClick={() => handleSearch(disease.disease)}
                                        className={`w-full py-4 px-5 text-left rounded-xl font-medium transition-all duration-300 transform hover:scale-105 ${selectedDisease === disease.disease
                                            ? 'bg-blue-500 text-white shadow-lg'
                                            : 'bg-gray-50 text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="truncate">{disease.disease}</span>
                                            <span className={`text-sm ${selectedDisease === disease.disease ? 'text-blue-100' : 'text-gray-500'
                                                }`}>
                                                {(disease.probability * 100).toFixed(0)}%
                                            </span>
                                        </div>
                                    </button>
                                ))
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    <FontAwesomeIcon icon={faSearch} className="text-3xl mb-4" />
                                    <p>No diseases available</p>
                                    <p className="text-sm">Complete diagnosis first</p>
                                </div>
                            )}
                        </div>
                    </StepContainer>

                    {/* Articles Content */}
                    <StepContainer
                        className='flex-1 bg-white shadow-lg rounded-2xl p-6'
                        title={`Articles about ${selectedDisease || 'Selected Disease'}`}
                        titleClassName='text-xl font-bold mb-6 text-gray-800 flex items-center gap-3'
                    >
                        {loadingArticle ? (
                            <div className="flex flex-col items-center justify-center py-16">
                                <FontAwesomeIcon
                                    icon={faSpinner}
                                    className="text-4xl text-blue-500 animate-spin mb-4"
                                />
                                <p className="text-gray-600 font-medium">Searching for articles...</p>
                            </div>
                        ) : results.length > 0 ? (
                            <div className='space-y-4 max-h-96 overflow-y-auto'>
                                {results.map((article, index) => (
                                    <div
                                        key={article.id || index}
                                        className="bg-gray-50 rounded-xl p-5 border border-gray-200 hover:shadow-md transition-all duration-300 hover:border-blue-200"
                                    >
                                        <div className="flex justify-between items-start gap-4">
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-lg text-gray-800 mb-2 leading-tight">
                                                    {article.judul}
                                                </h3>
                                                <p className="text-gray-600 text-sm mb-3 leading-relaxed">
                                                    {truncateText(article.isi, 150)}
                                                </p>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded-full">
                                                        {article.source}
                                                    </span>
                                                    <a
                                                        href={article.link}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center gap-2 text-blue-500 hover:text-blue-600 font-medium text-sm transition-colors duration-200"
                                                    >
                                                        Read More
                                                        <FontAwesomeIcon icon={faExternalLinkAlt} className="text-xs" />
                                                    </a>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : selectedDisease ? (
                            <div className="text-center py-16">
                                <FontAwesomeIcon icon={faNewspaper} className="text-4xl text-gray-400 mb-4" />
                                <p className="text-gray-600 font-medium">No articles found</p>
                                <p className="text-gray-500 text-sm">Try selecting a different disease</p>
                            </div>
                        ) : (
                            <div className="text-center py-16">
                                <FontAwesomeIcon icon={faSearch} className="text-4xl text-gray-400 mb-4" />
                                <p className="text-gray-600 font-medium">Select a disease to view articles</p>
                            </div>
                        )}
                    </StepContainer>
                </div>
            ) : (
                <StepContainer
                    className='w-full bg-white shadow-lg rounded-2xl p-8'
                    title='Nearby Hospitals'
                    titleClassName='text-2xl font-bold mb-8 text-gray-800 text-center flex items-center justify-center gap-3'
                >
                    <div className="text-center py-16">
                        <FontAwesomeIcon icon={faHospital} className="text-6xl text-blue-500 mb-6" />
                        <h3 className="text-2xl font-bold text-gray-800 mb-4">Hospital Directory</h3>
                        <p className="text-gray-600 text-lg">
                            Find nearby hospitals and medical facilities for your condition
                        </p>
                        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                            <p className="text-yellow-800 font-medium">
                                🚧 Hospital directory feature coming soon!
                            </p>
                        </div>
                    </div>
                </StepContainer>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center w-full gap-6 mt-8">
                <BackButton onClick={onBack} />
                <NextButton onClick={onNext} />
            </div>
        </div>
    );
};

export default Step4;