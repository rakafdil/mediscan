'use client';

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
                image: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511',
            },
            {
                id: '2',
                judul: 'The Benefits of Regular Exercise',
                isi: 'Regular physical activity can boost your mood, improve cardiovascular health, and increase energy levels.',
                link: '#',
                image: 'https://images.unsplash.com/photo-1558611848-73f7eb4001a1',
            },
            {
                id: '3',
                judul: 'Healthy Eating Habits for Busy People',
                isi: 'Simple strategies to maintain proper nutrition even with a hectic schedule and limited time for meal prep.',
                link: '#',
                image: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe',
            },
        ],
        brain: [
            {
                id: '4',
                judul: 'Boosting Brain Health Through Meditation',
                isi: 'Regular meditation practice can improve memory, reduce stress, and enhance cognitive function.',
                link: '#',
                image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773',
            },
            {
                id: '5',
                judul: 'Foods That Support Brain Function',
                isi: 'Discover which nutrients and foods can help maintain cognitive health and prevent mental decline.',
                link: '#',
                image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd',
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
        <div className="min-h-screen bg-gradient-to-b from-white to-blue-50">
            {/* Header */}
            <div className="container mx-auto px-6 py-16 flex flex-col lg:flex-row items-center justify-between gap-16">
                <img
                    src="/assets/HumanArticle.png"
                    alt="Human body illustration"
                    className="w-200 h-200"
                />

                <div className="flex-1 max-w-md text-center lg:text-left font-montserrat">
                    <h1 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
                        Find Health
                        <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                            Insights Instantly
                        </span>
                    </h1>
                    <p className="text-gray-600 mb-10 leading-relaxed text-lg">
                        Quickly explore trusted articles tailored to your symptoms and get
                        the information you need about your health.
                    </p>

                    {/* Category Buttons */}
                    <div className="flex gap-3 mb-8 justify-center lg:justify-start">
                        <button
                            onClick={() => setSelectedCategory('general')}
                            className={`px-4 py-2 rounded-lg font-medium transition-all ${selectedCategory === 'general'
                                    ? 'bg-blue-500 text-white shadow-lg'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            General Health
                        </button>
                        <button
                            onClick={() => setSelectedCategory('brain')}
                            className={`px-4 py-2 rounded-lg font-medium transition-all ${selectedCategory === 'brain'
                                    ? 'bg-blue-500 text-white shadow-lg'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            Brain Health
                        </button>
                    </div>

                    <a href="/article/article-content">
                        <button className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold py-4 px-10 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105">
                            Start Exploring Now →
                        </button>
                    </a>
                </div>
            </div>

            {/* Articles */}
            <div className="container mx-auto px-6 py-16 bg-white/50 backdrop-blur-sm">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold font-montserrat text-gray-900 mb-4">
                        Featured {selectedCategory === 'general' ? 'Health' : 'Brain Health'} Articles
                    </h2>
                    <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-indigo-600 mx-auto rounded-full"></div>
                </div>

                <div className="flex items-center justify-center gap-8">
                    {/* Prev */}
                    <button
                        onClick={prevSlide}
                        className="p-4 bg-white rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 disabled:opacity-40 hover:scale-110 border border-gray-100"
                        disabled={articles.length <= 1}
                    >
                        <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>

                    {/* Article Card */}
                    {articles.length > 0 && (
                        <div className="w-96 transition-all duration-500 transform hover:scale-105">
                            <div className="bg-white rounded-2xl shadow-2xl p-8 h-96 flex flex-col border border-gray-100 hover:border-blue-200 transition-all duration-300">
                                <div className="w-full h-48 rounded-xl mb-6 overflow-hidden relative">
                                    <img
                                        src={articles[currentSlide].image}
                                        alt={articles[currentSlide].judul}
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute top-3 right-3">
                                        <span className="bg-white/90 backdrop-blur-sm text-blue-600 text-xs font-medium px-2 py-1 rounded-full">
                                            Article {currentSlide + 1} of {articles.length}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center mb-3">
                                        <span className="text-xs text-blue-600 font-semibold bg-blue-50 px-2 py-1 rounded-full">
                                            Health Article
                                        </span>
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2 leading-snug">
                                        {articles[currentSlide].judul}
                                    </h3>
                                    <p className="text-gray-600 line-clamp-3 leading-relaxed">
                                        {articles[currentSlide].isi}
                                    </p>
                                    <div className="mt-4">
                                        <a
                                            href={articles[currentSlide].link}
                                            className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center transition-colors"
                                        >
                                            Read more →
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Next */}
                    <button
                        onClick={nextSlide}
                        className="p-4 bg-white rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 disabled:opacity-40 hover:scale-110 border border-gray-100"
                        disabled={articles.length <= 1}
                    >
                        <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>

                {/* Indicators */}
                <div className="flex justify-center mt-8 gap-2">
                    {articles.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentSlide(index)}
                            className={`w-3 h-3 rounded-full transition-all duration-300 ${index === currentSlide
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
