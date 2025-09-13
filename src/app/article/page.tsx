'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

interface Article {
    id: string;
    judul: string;
    isi: string;
    link: string;
    image?: string;
}

const ARTICLES_PER_SLIDE = 3; // Tampilkan 3 artikel per slide

const HealthInsightsDashboard = () => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [selectedCategory, setSelectedCategory] = useState<'general' | 'brain'>('general');
    const [articles, setArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchArticles = async (category: string) => {
        setLoading(true);
        const keyword = category === 'general' ? 'health' : 'brain health';
        try {
            const res = await fetch(`/api/search?q=${encodeURIComponent(keyword)}`);
            const data: Article[] = await res.json();
            setArticles(data);
            setCurrentSlide(0);
        } catch (err) {
            console.error("Failed to fetch articles:", err);
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

    // Auto slide
    useEffect(() => {
        const interval = setInterval(nextSlide, 4000);
        return () => clearInterval(interval);
    }, [articles]);

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
                        <button className="w-full sm:w-auto bg-[#6B8FC4] hover:from-blue-600 hover:to-indigo-700 text-white font-semibold font-montserrat py-3 sm:py-4 px-8 sm:px-10 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 text-sm sm:text-base">
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

                {loading ? (
                    <div className="text-center text-gray-500 py-10">Loading articles...</div>
                ) : articles.length === 0 ? (
                    <div className="text-center text-gray-500 py-10">No articles found.</div>
                ) : (
                    <div className="flex flex-col lg:flex-row items-center justify-center gap-4 lg:gap-8">
                        {/* Prev Button */}
                        <button
                            onClick={prevSlide}
                            className="hidden lg:block p-3 sm:p-4 bg-white rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 disabled:opacity-40 hover:scale-110 border border-gray-100"
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
                                        key={idx}
                                        className="bg-white rounded-2xl shadow-2xl p-4 sm:p-6 lg:p-8 flex flex-col border border-gray-100 hover:border-blue-200 transition-all duration-300"
                                    >
                                        <div className="w-full h-40 sm:h-48 lg:h-56 rounded-xl mb-4 sm:mb-6 overflow-hidden">
                                            {article.image ? (
                                                <img
                                                    src={article.image}
                                                    alt={article.judul}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500">
                                                    <img
                                                        src={"https://nbhc.ca/sites/default/files/styles/article/public/default_images/news-default-image%402x_0.png?itok=B4jML1jF"}
                                                        alt="No image available"
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                        <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                                            {article.judul}
                                        </h3>
                                        <p className="text-sm sm:text-base text-gray-600 line-clamp-3 mb-4">
                                            {article.isi}
                                        </p>
                                        <Link
                                            href={article.link}
                                            className="text-[#217BFF] hover:text-blue-700 font-medium text-sm flex items-center transition-colors"
                                        >
                                            Read more →
                                        </Link>
                                    </div>
                                ))}
                        </div>

                        {/* Next Button */}
                        <button
                            onClick={nextSlide}
                            className="hidden lg:block p-3 sm:p-4 bg-white rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 disabled:opacity-40 hover:scale-110 border border-gray-100"
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
                )}

                {/* Indicators */}
                <div className="flex justify-center mt-6 sm:mt-8 gap-2">
                    {Array.from({ length: Math.ceil(articles.length / ARTICLES_PER_SLIDE) }).map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentSlide(index * ARTICLES_PER_SLIDE)}
                            className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all duration-300 ${index === Math.floor(currentSlide / ARTICLES_PER_SLIDE)
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
