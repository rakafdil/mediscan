"use client"

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

type Direction = "left" | "right";

const slides = [
    {
        step: 1,
        title: "Share Your Basic Info",
        description:
            "Provide details like age, gender, location, height, and weight. This helps us calculate your BMI and adjust for your local weather, making your health check more accurate and personalized.",
    },
    {
        step: 2,
        title: "Add Your Symptoms",
        description:
            "Describe what you’re experiencing as clearly as possible. The more specific your symptoms, the better we can analyze your condition.",
    },
    {
        step: 3,
        title: "See Your Health Results",
        description:
            "Get instant insights based on your symptoms. This isn’t a final medical decision, but a helpful first step toward understanding your health.",
    },
    {
        step: 4,
        title: "Read Helpful Articles",
        description:
            "Access trusted medical articles related to your symptoms. Stay informed with reliable information to better understand your condition.",
    },
    {
        step: 5,
        title: "Find Nearby Hospitals",
        description:
            "Discover hospitals and healthcare facilities near you where professionals can provide accurate diagnosis and treatment.",
    },
];

export default function CarouselSlide() {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [direction, setDirection] = useState<Direction>("right");
    const [contentTransitioning, setContentTransitioning] = useState(false);
    const [displayedContent, setDisplayedContent] = useState(0);

    const nextSlide = () => {
        if (isTransitioning) return;
        setDirection("right");
        setIsTransitioning(true);
        setContentTransitioning(true);

        setTimeout(() => {
            setDisplayedContent((currentSlide + 1) % slides.length);
        }, 320);

        setCurrentSlide((prev) => (prev + 1) % slides.length);

        setTimeout(() => {
            setIsTransitioning(false);
            setTimeout(() => setContentTransitioning(false), 320);
        }, 500);
    };

    const prevSlide = () => {
        if (isTransitioning) return;
        setDirection("left");
        setIsTransitioning(true);
        setContentTransitioning(true);

        setTimeout(() => {
            setDisplayedContent((currentSlide - 1 + slides.length) % slides.length);
        }, 320);

        setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

        setTimeout(() => {
            setIsTransitioning(false);
            setTimeout(() => setContentTransitioning(false), 320);
        }, 500);
    };

    const currentContentData = slides[displayedContent];
    const prevContentData = slides[(displayedContent - 1 + slides.length) % slides.length];
    const nextContentData = slides[(displayedContent + 1) % slides.length];

    return (
        <div className="flex items-center justify-center min-h-[60vh] px-4 sm:px-10 md:px-20 mt-10 sm:mt-30 lg:mt-30 overflow-hidden">
            <div className="flex flex-col lg:flex-row items-center gap-6 lg:gap-8 max-w-7xl w-full">

                {/* Left Card */}
                <div
                    className={`cursor-pointer bg-white rounded-2xl p-8 shadow-sm border border-[#A3A3A3] transition-all duration-500 ease-in-out transform w-96 z-0
                ${isTransitioning
                            ? direction === "right"
                                ? "scale-70 shadow-lg translate-x-[130%] opacity-0"
                                : "scale-70 shadow-lg translate-x-[130%] opacity-0"
                            : "scale-70 shadow-sm relative blur-[2.5px]"
                        }`}
                    onClick={prevSlide}
                >

                    <div className={`text-center transition-all duration-500 ease-in-out ${isTransitioning ? 'opacity-80' : 'opacity-100'
                        }`}>
                        <div className={`w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto transition-all duration-500 ease-in-out mb-5 ${isTransitioning ? 'scale-110 shadow-lg' : 'scale-100'}`}>
                            <span className="text-white font-semibold">{prevContentData.step}</span>
                        </div>
                        <h2 className="text-3xl font-medium text-gray-900 mb-4">
                            {prevContentData.title}
                        </h2>
                        <p className="text-gray-600 leading-relaxed tracking-wider">
                            {prevContentData.description}
                        </p>
                    </div>
                </div>

                {/* Left Arrow */}
                <button
                    onClick={prevSlide}
                    disabled={isTransitioning}
                    className={`p-2 rounded-full transition-all duration-300 ease-in-out ${isTransitioning
                        ? 'opacity-50 cursor-not-allowed'
                        : 'hover:bg-gray-100 hover:scale-110'
                        } cursor-pointer`}
                    aria-label="Previous slide"
                >
                    <ChevronLeft className="w-6 h-6 text-gray-400" />
                </button>

                {/* Main Card */}
                <div
                    className={`bg-white rounded-2xl p-8 shadow-sm border border-[#A3A3A3] transition-all duration-500 ease-in-out transform sm:w-120 z-10
                ${isTransitioning
                            ? direction === "right"
                                ? "scale-70 shadow-lg opacity-0"
                                : "scale-70 shadow-lg opacity-0"
                            : "scale-110 shadow-sm relative"
                        }`}
                >

                    <div className={`text-center transition-all duration-500 ease-in-out 
    ${contentTransitioning ? 'opacity-80' : 'opacity-100'}`}
                    >
                        {/* Step Indicator */}
                        <div className={`w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto transition-all duration-500 ease-in-out mb-5 ${isTransitioning ? 'scale-110 shadow-lg' : 'scale-100'}`}>
                            <span className="text-white font-semibold">{currentContentData.step}</span>
                        </div>
                        <h2 className="text-3xl font-medium text-gray-900 mb-4">
                            {currentContentData.title}
                        </h2>
                        <p className="text-gray-600 leading-relaxed tracking-wider">
                            {currentContentData.description}
                        </p>
                    </div>
                </div>

                {/* Right Arrow */}
                <button
                    onClick={nextSlide}
                    disabled={isTransitioning}
                    className={`p-2 rounded-full transition-all duration-300 ease-in-out ${isTransitioning
                        ? 'opacity-50 cursor-not-allowed'
                        : 'hover:bg-gray-100 hover:scale-110'
                        } cursor-pointer`}
                    aria-label="Next slide"
                >
                    <ChevronRight className="w-6 h-6 text-gray-400" />
                </button>

                {/* Right Card */}
                <div
                    className={`cursor-pointer bg-white rounded-2xl p-8 shadow-sm border border-[#A3A3A3] transition-all duration-500 ease-in-out transform w-96 z-0
                ${isTransitioning
                            ? direction === "right"
                                ? "scale-70 blur-[0px] -translate-x-[130%] opacity-0"
                                : "scale-70 blur-[0px] -translate-x-[130%] opacity-0"
                            : "scale-70 shadow-sm relative blur-[2.5px]"
                        }`}
                    onClick={nextSlide}
                >

                    <div className={`text-center transition-all duration-500 ease-in-out ${contentTransitioning ? 'opacity-80' : 'opacity-100'
                        }`}>
                        <div className={`w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto transition-all duration-500 ease-in-out mb-5 ${isTransitioning ? 'scale-110 shadow-lg' : 'scale-100'}`}>
                            <span className="text-white font-semibold">{nextContentData.step}</span>
                        </div>
                        <h2 className="text-3xl font-medium text-gray-900 mb-4">
                            {nextContentData.title}
                        </h2>
                        <p className="text-gray-600 leading-relaxed tracking-wider">
                            {nextContentData.description}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}