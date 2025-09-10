'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

interface Article {
    id: string;
    judul: string;
    isi: string;
    link: string;
    image: string;
}

const HealthInsightsDashboard = () => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [selectedCategory, setSelectedCategory] = useState<'general' | 'brain'>('general');

    // Dummy data artikel
    const dummyArticles: Record<string, Article[]> = {
        general: [
            {
                id: '1',
                judul: '10 Tips for Better Sleep Quality',
                isi: 'Getting quality sleep is essential for overall health. Learn about sleep hygiene practices that can improve your rest.',
                link: '#',
                image: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=400',
            },
            {
                id: '2',
                judul: 'The Benefits of Regular Exercise',
                isi: 'Regular physical activity can boost your mood, improve cardiovascular health, and increase energy levels.',
                link: '#',
                image: 'https://images.unsplash.com/photo-1558611848-73f7eb4001a1?w=400',
            },
            {
                id: '3',
                judul: 'Healthy Eating Habits for Busy People',
                isi: 'Simple strategies to maintain proper nutrition even with a hectic schedule and limited time for meal prep.',
                link: '#',
                image: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400',
            },
        ],
        brain: [
            {
                id: '4',
                judul: 'Boosting Brain Health Through Meditation',
                isi: 'Regular meditation practice can improve memory, reduce stress, and enhance cognitive function.',
                link: '#',
                image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400',
            },
            {
                id: '5',
                judul: 'Foods That Support Brain Function',
                isi: 'Discover which nutrients and foods can help maintain cognitive health and prevent mental decline.',
                link: '#',
                image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400',
            },
        ],
    };

    const articles = dummyArticles[selectedCategory] || [];

    const nextSlide = () => {
        if (articles.length > 0) {
            setCurrentSlide((prev) => (prev + 1) % articles.length);
        }
    };

    const prevSlide = () => {
        if (articles.length > 0) {
            setCurrentSlide((prev) => (prev - 1 + articles.length) % articles.length);
        }
    };

    // Auto slide
    useEffect(() => {
        const interval = setInterval(nextSlide, 4000);
        return () => clearInterval(interval);
    }, [selectedCategory]);

    useEffect(() => {
        setCurrentSlide(0);
    }, [selectedCategory]);

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

                <div className="flex-1 w-full max-w-2xl text-center lg:text-left font-sans">
                    <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 sm:mb-6 leading-tight">
                        Find Health
                        <br />
                        <span className="text-transparent bg-clip-text bg-[#6B8FC4]">
                            Insights Instantly
                        </span>
                    </h1>
                    <p className="text-sm sm:text-base lg:text-lg text-gray-600 mb-6 sm:mb-8 lg:mb-10 leading-relaxed">
                        Quickly explore trusted articles tailored to your symptoms and get
                        the information you need about your health.
                    </p>

                    {/* Category Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3 mb-6 sm:mb-8 justify-center lg:justify-start">
                        <button
                            onClick={() => setSelectedCategory('general')}
                            className={`px-4 py-2 sm:px-6 sm:py-3 rounded-lg font-medium transition-all text-sm sm:text-base ${selectedCategory === 'general'
                                ? 'bg-[#217BFF] text-white shadow-lg'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            General Health
                        </button>
                        <button
                            onClick={() => setSelectedCategory('brain')}
                            className={`px-4 py-2 sm:px-6 sm:py-3 rounded-lg font-medium transition-all text-sm sm:text-base ${selectedCategory === 'brain'
                                ? 'bg-blue-500 text-white shadow-lg'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            Brain Health
                        </button>
                    </div>

                    <Link href="/article/article-content" className="inline-block w-full sm:w-auto">
                        <button className="w-full sm:w-auto bg-[#6B8FC4] hover:from-blue-600 hover:to-indigo-700 text-white font-semibold py-3 sm:py-4 px-8 sm:px-10 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 text-sm sm:text-base">
                            Start Exploring Now →
                        </button>
                    </Link>
                </div>
            </div>

            {/* Articles */}
            <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 lg:py-16 backdrop-blur-sm">
                <div className="text-center mb-8 sm:mb-12">
                    <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold font-sans text-gray-900 mb-4">
                        Featured {selectedCategory === 'general' ? 'Health' : 'Brain Health'} Articles
                    </h2>
                    <div className="w-16 sm:w-24 h-1 bg-[#6B8FC4] mx-auto rounded-full"></div>
                </div>

                <div className="flex flex-col lg:flex-row items-center justify-center gap-4 lg:gap-8">
                    {/* Desktop Navigation Buttons */}
                    <button
                        onClick={prevSlide}
                        className="hidden lg:block p-3 sm:p-4 bg-white rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 disabled:opacity-40 hover:scale-110 border border-gray-100"
                        disabled={articles.length <= 1}
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

                    {/* Article Card */}
                    {articles.length > 0 && (
                        <div className="w-full max-w-sm sm:max-w-md lg:max-w-lg xl:max-w-xl transition-all duration-500 transform hover:scale-105">
                            <div className="bg-white rounded-2xl shadow-2xl p-4 sm:p-6 lg:p-8 min-h-96 sm:min-h-112 lg:min-h-136 flex flex-col border border-gray-100 hover:border-blue-200 transition-all duration-300">
                                <div className="w-full h-40 sm:h-48 lg:h-60 rounded-xl mb-4 sm:mb-6 overflow-hidden relative">
                                    <img
                                        src={articles[currentSlide].image}
                                        alt={articles[currentSlide].judul}
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute top-2 sm:top-3 right-2 sm:right-3">
                                        <span className="bg-white/90 backdrop-blur-sm text-blue-600 text-xs font-medium px-2 py-1 rounded-full">
                                            Article {currentSlide + 1} of {articles.length}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center mb-3">
                                        <span className="text-xs text-[#217BFF] font-semibold bg-blue-50 px-2 py-1 rounded-full">
                                            Health Article
                                        </span>
                                    </div>
                                    <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 line-clamp-2 leading-snug">
                                        {articles[currentSlide].judul}
                                    </h3>
                                    <p className="text-sm sm:text-base text-gray-600 line-clamp-3 leading-relaxed mb-4">
                                        {articles[currentSlide].isi}
                                    </p>
                                    <div className="mt-auto">
                                        <a
                                            href={articles[currentSlide].link}
                                            className="text-[#217BFF] hover:text-blue-700 font-medium text-sm flex items-center transition-colors"
                                        >
                                            Read more →
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <button
                        onClick={nextSlide}
                        className="hidden lg:block p-3 sm:p-4 bg-white rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 disabled:opacity-40 hover:scale-110 border border-gray-100"
                        disabled={articles.length <= 1}
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

                {/* Mobile Navigation */}
                <div className="flex lg:hidden justify-center gap-4 mt-6">
                    <button
                        onClick={prevSlide}
                        className="p-3 bg-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-40 border border-gray-100"
                        disabled={articles.length <= 1}
                        aria-label="Previous slide"
                    >
                        <svg
                            className="w-5 h-5 text-gray-600"
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
                    <button
                        onClick={nextSlide}
                        className="p-3 bg-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-40 border border-gray-100"
                        disabled={articles.length <= 1}
                        aria-label="Next slide"
                    >
                        <svg
                            className="w-5 h-5 text-gray-600"
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

                {/* Indicators */}
                <div className="flex justify-center mt-6 sm:mt-8 gap-2">
                    {articles.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentSlide(index)}
                            className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all duration-300 ${index === currentSlide
                                ? 'bg-blue-500 scale-125'
                                : 'bg-gray-300 hover:bg-gray-400'
                                }`}
                        >
                            <span className="sr-only">Slide {index + 1}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default HealthInsightsDashboard;