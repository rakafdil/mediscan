'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

interface Article {
    id: string;
    judul: string;
    isi: string;
    link: string;
    image?: string;
    source: string;
}

interface SearchResponse {
    results: Article[];
    total: number;
    keyword: string;
}

interface SearchError {
    error: string;
    details?: string;
}

const ARTICLES_PER_SLIDE = 3;

const HealthInsightsDashboard = () => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [selectedCategory, setSelectedCategory] = useState<'general' | 'brain'>('general');
    const [articles, setArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchArticles = async (category: string) => {
        setLoading(true);
        setError(null);
        const keywords = {
            general: 'daily health tips vitamins nutrition healthy lifestyle',
            brain: 'brain health mental stress depression intelligence memory'
        };

        const keyword = keywords[category as keyof typeof keywords];

        try {
            const res = await fetch(`/api/search?q=${encodeURIComponent(keyword)}`);

            if (!res.ok) {
                const errorData: SearchError = await res.json();
                throw new Error(errorData.error || `HTTP error! status: ${res.status}`);
            }

            const data: SearchResponse = await res.json();

            if (data.results && Array.isArray(data.results)) {
                setArticles(data.results);
            } else {
                const resultArray = Array.isArray(data) ? data : [];
                setArticles(resultArray);
            }

            setCurrentSlide(0);
            setError(null);
        } catch (err) {
            console.error("Failed to fetch articles:", err);
            const errorMessage = err instanceof Error ? err.message : "Failed to load health articles";
            setError(errorMessage);
            setArticles([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchArticles(selectedCategory);
    }, [selectedCategory]);

    const nextSlide = () => {
        if (articles.length > 0) {
            setCurrentSlide((prev) => (prev + ARTICLES_PER_SLIDE) % articles.length);
        }
    };

    const prevSlide = () => {
        if (articles.length > 0) {
            setCurrentSlide((prev) => (prev - ARTICLES_PER_SLIDE + articles.length) % articles.length);
        }
    };

    useEffect(() => {
        if (articles.length > ARTICLES_PER_SLIDE && !loading && !error) {
            const interval = setInterval(nextSlide, 4000);
            return () => clearInterval(interval);
        }
    }, [articles, loading, error]);

    const handleRetry = () => {
        fetchArticles(selectedCategory);
    };

    const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
        const target = e.target as HTMLImageElement;
        target.src = "https://nbhc.ca/sites/default/files/styles/article/public/default_images/news-default-image%402x_0.png?itok=B4jML1jF";
    };

    return (
        <div className="min-h-screen">
            {/* Header */}
            <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-8 lg:py-1 flex flex-col lg:flex-row items-center justify-between gap-6 lg:gap-12">
                <div className="ww-full flex-shrink-0">
                    <img
                        src="/assets/HumanArticle.png"
                        alt="Human body illustration"
                        className="w-full h-auto"
                    />
                </div>

                <div className="flex-1 w-full max-w-2xl text-center lg:text-left">
                    <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 sm:mb-6 leading-tight font-montserrat">
                        Find Health
                        <br />
                        <span className="text-transparent bg-clip-text bg-[#6B8FC4]">
                            Insights Instantly
                        </span>
                    </h1>
                    <p className="text-sm sm:text-base lg:text-lg text-gray-600 mb-6 sm:mb-8 lg:mb-10 leading-relaxed font-montserrat">
                        Quickly explore trusted articles tailored to your symptoms and get
                        the information you need about your health.
                    </p>

                    <Link href="/article/article-content" className="inline-block w-full sm:w-auto">
                        <button className="cursor-pointer w-full sm:w-auto bg-[#6B8FC4] hover:from-blue-600 hover:to-indigo-700 text-white font-semibold font-montserrat py-3 sm:py-4 px-8 sm:px-10 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 text-sm sm:text-base">
                            Start Exploring Now →
                        </button>
                    </Link>
                </div>
            </div>

            {/* Articles */}
            <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 lg:py-16 backdrop-blur-sm">
                <div className="text-center mb-8 sm:mb-12">
                    <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold font-montserrat text-gray-900 mb-4">
                        Featured {selectedCategory === 'general' ? 'Health' : 'Brain Health'} Articles
                    </h2>
                    <div className="w-16 sm:w-24 h-1 bg-[#6B8FC4] mx-auto rounded-full"></div>
                </div>

                {/* Category Buttons */}
                <div className="flex flex-wrap justify-center gap-3 mb-8">
                    <button
                        onClick={() => setSelectedCategory('general')}
                        disabled={loading}
                        className={`px-4 py-2 sm:px-6 sm:py-3 rounded-lg font-medium transition-all text-sm sm:text-base disabled:opacity-50 ${selectedCategory === 'general'
                            ? 'bg-[#217BFF] text-white shadow-lg'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                    >
                        General Health
                    </button>
                    <button
                        onClick={() => setSelectedCategory('brain')}
                        disabled={loading}
                        className={`cursor-pointer px-4 py-2 sm:px-6 sm:py-3 rounded-lg font-medium transition-all text-sm sm:text-base disabled:opacity-50 ${selectedCategory === 'brain'
                            ? 'bg-blue-500 text-white shadow-lg'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                    >
                        Brain Health
                    </button>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-8 p-6 bg-red-50 border border-red-200 rounded-xl text-center">
                        <p className="text-red-700 mb-4">{error}</p>
                        <button
                            onClick={handleRetry}
                            className="cursor-pointer bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors"
                        >
                            Try Again
                        </button>
                    </div>
                )}

                {loading ? (
                    <div className="text-center text-gray-500 py-10">
                        <div className="inline-flex items-center">
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Loading articles...
                        </div>
                    </div>
                ) : articles.length === 0 && !error ? (
                    <div className="text-center text-gray-500 py-10">
                        <p>No articles found for {selectedCategory === 'general' ? 'general health' : 'brain health'}.</p>
                    </div>
                ) : !error && articles.length > 0 ? (
                    <div className="flex flex-col lg:flex-row items-center justify-center gap-4 lg:gap-8">
                        {/* Prev Button */}
                        <button
                            onClick={prevSlide}
                            className="hidden cursor-pointer lg:block p-3 sm:p-4 bg-white rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 disabled:opacity-40 hover:scale-110 border border-gray-100"
                            disabled={articles.length <= ARTICLES_PER_SLIDE}
                            aria-label="Previous slide"
                        >
                            <svg
                                className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                aria-hidden="true"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M15 19l-7-7 7-7"
                                />
                            </svg>
                        </button>

                        {/* Article Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 w-full max-w-6xl">
                            {articles
                                .slice(currentSlide, currentSlide + ARTICLES_PER_SLIDE)
                                .map((article, idx) => (
                                    <div
                                        key={`${article.id}-${idx}`}
                                        className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl p-4 sm:p-6 lg:p-8 flex flex-col border border-gray-100 hover:border-blue-200 transition-all duration-500 ease-out transform hover:-translate-y-3 hover:scale-105 cursor-pointer animate-fade-in-up"
                                        style={{
                                            animationDelay: `${idx * 150}ms`,
                                            animationFillMode: 'both'
                                        }}
                                    >
                                        <div className="w-full h-40 sm:h-48 lg:h-56 rounded-xl mb-4 sm:mb-6 overflow-hidden relative">
                                            <img
                                                src={article.image || "https://nbhc.ca/sites/default/files/styles/article/public/default_images/news-default-image%402x_0.png?itok=B4jML1jF"}
                                                alt={article.judul}
                                                className="w-full h-full object-cover transition-all duration-700 ease-out group-hover:scale-110 group-hover:brightness-110"
                                                onError={handleImageError}
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                        </div>
                                        <div className="flex flex-col flex-grow">
                                            <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-700 transition-colors duration-300">
                                                {article.judul}
                                            </h3>
                                            <p className="text-sm sm:text-base text-gray-600 line-clamp-3 mb-4 group-hover:text-gray-700 transition-colors duration-300">
                                                {article.isi}
                                            </p>
                                            <div className="mt-auto transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                                                <a
                                                    href={article.link}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-[#217BFF] hover:text-blue-700 font-medium text-sm flex items-center transition-all duration-300 group-hover:underline decoration-2 underline-offset-4"
                                                >
                                                    <span className="group-hover:translate-x-1 transition-transform duration-300">Read more</span>
                                                    <svg className="w-4 h-4 ml-1 transform group-hover:translate-x-2 group-hover:scale-110 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                    </svg>
                                                </a>
                                                <div className="text-xs text-gray-500 mt-2 opacity-70 group-hover:opacity-100 transition-opacity duration-300">
                                                    Source: {article.source}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                        </div>

                        {/* Next Button */}
                        <button
                            onClick={nextSlide}
                            className="hidden cursor-pointer lg:block p-3 sm:p-4 bg-white rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 disabled:opacity-40 hover:scale-110 border border-gray-100"
                            disabled={articles.length <= ARTICLES_PER_SLIDE}
                            aria-label="Next slide"
                        >
                            <svg
                                className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                aria-hidden="true"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 5l7 7-7 7"
                                />
                            </svg>
                        </button>
                    </div>
                ) : null}

                {/* Indicators */}
                {articles.length > ARTICLES_PER_SLIDE && !error && (
                    <div className="flex justify-center mt-6 sm:mt-8 gap-2">
                        {Array.from({ length: Math.ceil(articles.length / ARTICLES_PER_SLIDE) }).map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentSlide(index * ARTICLES_PER_SLIDE)}
                                className={`cursor-pointer w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all duration-300 ${index === Math.floor(currentSlide / ARTICLES_PER_SLIDE)
                                    ? 'bg-blue-500 scale-125'
                                    : 'bg-gray-300 hover:bg-gray-400'
                                    }`}
                            >
                                <span className="sr-only">Slide {index + 1}</span>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <style jsx>{`
                @keyframes fade-in-up {
                    0% {
                        opacity: 0;
                        transform: translateY(30px);
                    }
                    100% {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .animate-fade-in-up {
                    animation: fade-in-up 0.8s ease-out;
                }
            `}</style>
        </div>
    );
};

export default HealthInsightsDashboard;