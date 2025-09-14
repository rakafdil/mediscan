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

interface Hospital {
    id: number;
    name: string;
    address: string;
    lat: number;
    lng: number;
    rating?: number;
    isOpen?: boolean;
    distance?: string;
    phone?: string;
    website?: string;
    hospitalType?: string;
    mapsByCoords: string;
    mapsByName: string;
}

const Step4: React.FC<Step4Props> = ({ onNext, onBack, result, setStep }) => {
    const [isArticle, setIsArticle] = useState(true);
    const [selectedDisease, setSelectedDisease] = useState<string>('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [loadingArticle, setLoadingArticle] = useState(false);

    // hospital states
    const [loadingHospital, setLoadingHospital] = useState(false);
    const [hospitals, setHospitals] = useState<Hospital[]>([]);
    const [errorHospital, setErrorHospital] = useState<string | null>(null);

    useEffect(() => {
        if (result && result.length > 0 && !selectedDisease) {
            setSelectedDisease(result[0].disease);
            handleSearch(result[0].disease);
        }
    }, [result]);

    // fetch articles
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

    // fetch hospitals
    const fetchHospitals = () => {
        setLoadingHospital(true);
        setHospitals([]);
        setErrorHospital(null);

        if (!navigator.geolocation) {
            setErrorHospital("Geolocation is not supported by this browser.");
            setLoadingHospital(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                const { latitude, longitude } = pos.coords;
                try {
                    const res = await fetch(`/api/hospitals?lat=${latitude}&lng=${longitude}&useRealLocation=true`);
                    if (!res.ok) throw new Error('Failed to fetch hospitals');
                    const data = await res.json();
                    setHospitals(data.data || []);
                } catch (err: any) {
                    console.error("Hospital fetch error:", err);
                    setErrorHospital("Failed to fetch hospitals");
                } finally {
                    setLoadingHospital(false);
                }
            },
            (err) => {
                console.error("Geolocation error:", err);
                setErrorHospital("Unable to get your location.");
                setLoadingHospital(false);
            }
        );
    };

    const handleTabSwitch = (isArticleTab: boolean) => {
        setIsArticle(isArticleTab);
        setStep(isArticleTab ? 4 : 5);
        if (!isArticleTab && hospitals.length === 0 && !loadingHospital) {
            fetchHospitals();
        }
    };

    const truncateText = (text: string, maxLength: number) =>
        text.length > maxLength ? text.substring(0, maxLength) + '...' : text;

    return (
        <div className='flex items-center flex-col gap-8 pb-20 w-full max-w-7xl mx-auto px-4'>
            {/* Tabs */}
            <div className='flex flex-row w-full max-w-4xl bg-gray-100 rounded-2xl p-2 shadow-inner'>
                <button
                    className={`flex-1 py-4 px-6 rounded-xl font-semibold text-xl transition-all duration-300 flex items-center justify-center gap-3 ${isArticle ? 'bg-white text-blue-600 shadow-md' : 'text-gray-600 hover:text-gray-800'}`}
                    onClick={() => handleTabSwitch(true)}
                >
                    <FontAwesomeIcon icon={faNewspaper} /> Articles
                </button>
                <button
                    className={`flex-1 py-4 px-6 rounded-xl font-semibold text-xl transition-all duration-300 flex items-center justify-center gap-3 ${!isArticle ? 'bg-white text-blue-600 shadow-md' : 'text-gray-600 hover:text-gray-800'}`}
                    onClick={() => handleTabSwitch(false)}
                >
                    <FontAwesomeIcon icon={faHospital} /> Hospitals
                </button>
            </div>

            {isArticle ? (
                // === Articles ===
                <div className='w-full flex gap-8'>
                    {/* Disease Sidebar */}
                    <StepContainer className='w-1/3 bg-white shadow-lg rounded-2xl p-6' title='Select Disease'>
                        <div className='space-y-3'>
                            {result && result.filter(item => item.disease.trim() !== "").length > 0 ? (
                                result.filter(item => item.disease.trim() !== "").map((disease, index) => (
                                    <button
                                        key={disease.disease}
                                        onClick={() => handleSearch(disease.disease)}
                                        className={`w-full py-4 px-5 text-left rounded-xl font-medium transition-all duration-300 ${selectedDisease === disease.disease ? 'bg-blue-500 text-white' : 'bg-gray-50 text-gray-700 hover:bg-blue-50 hover:text-blue-600'}`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="truncate">{disease.disease}</span>
                                            <span className="text-sm">{(disease.probability * 100).toFixed(0)}%</span>
                                        </div>
                                    </button>
                                ))
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    <FontAwesomeIcon icon={faSearch} className="text-3xl mb-4" />
                                    <p>No diseases available</p>
                                </div>
                            )}
                        </div>
                    </StepContainer>

                    {/* Articles */}
                    <StepContainer className='flex-1 bg-white shadow-lg rounded-2xl p-6' title={`Articles about ${selectedDisease || 'Selected Disease'}`}>
                        {loadingArticle ? (
                            <div className="flex flex-col items-center py-16">
                                <FontAwesomeIcon icon={faSpinner} className="text-4xl text-blue-500 animate-spin mb-4" />
                                <p>Searching for articles...</p>
                            </div>
                        ) : results.length > 0 ? (
                            <div className='space-y-4 max-h-96 overflow-y-auto'>
                                {results.map((article, index) => (
                                    <div key={article.id || index} className="bg-gray-50 rounded-xl p-5 border hover:shadow-md transition">
                                        <h3 className="font-semibold text-lg">{article.judul}</h3>
                                        <p className="text-gray-600 text-sm mb-2">{truncateText(article.isi, 150)}</p>
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs bg-gray-200 px-2 py-1 rounded">{article.source}</span>
                                            <a href={article.link} target="_blank" rel="noopener noreferrer" className="text-blue-500 text-sm flex items-center gap-1">
                                                Read More <FontAwesomeIcon icon={faExternalLinkAlt} />
                                            </a>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-center text-gray-500 py-16">No articles found</p>
                        )}
                    </StepContainer>
                </div>
            ) : (
                // === Hospitals ===
                <StepContainer className='w-full bg-white shadow-lg rounded-2xl p-8' title='Nearby Hospitals'>
                    {loadingHospital ? (
                        <div className="flex flex-col items-center py-16">
                            <FontAwesomeIcon icon={faSpinner} className="text-4xl text-blue-500 animate-spin mb-4" />
                            <p>Searching for nearby hospitals...</p>
                        </div>
                    ) : errorHospital ? (
                        <p className="text-red-500 text-center">{errorHospital}</p>
                    ) : hospitals.length > 0 ? (
                        <div className="space-y-4 max-h-[500px] overflow-y-auto">
                            {hospitals.map(h => (
                                <a
                                    key={h.id}
                                    href={h.mapsByName}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block p-4 border rounded-lg bg-gray-50 hover:shadow-md transition cursor-pointer"
                                >
                                    <h3 className="font-bold text-lg text-blue-700">{h.name}</h3>
                                    <p className="text-gray-600">{h.address}</p>
                                    {h.distance && <p className="text-sm text-gray-500">📍 {h.distance}</p>}
                                    {h.phone && <p className="text-sm">📞 {h.phone}</p>}
                                    {h.website && (
                                        <span className="text-sm text-blue-500">🌐 Website</span>
                                    )}
                                    <p className="text-xs text-gray-500 mt-1">{h.hospitalType}</p>
                                </a>
                            ))}


                        </div>
                    ) : (
                        <p className="text-gray-600 text-center py-16">No hospitals found nearby</p>
                    )}
                </StepContainer>
            )}

            <div className="flex justify-between items-center w-full mt-8">
                <BackButton onClick={onBack} />
                <NextButton onClick={onNext} />
            </div>
        </div>
    );
};

export default Step4;