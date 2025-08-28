"use client"

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

type Direction = "left" | "right";

const slides = [
    {
        step: 1,
        title: "Tell Us Your Age and Gender",
        description: "Your age and gender can influence health outcomes. Sharing this helps us personalize and improve the accuracy of your diagnosis.",
    },
    {
        step: 2,
        title: "Describe or Add Your Symptoms",
        description: "List your symptoms in as much detail as possible. The more specific you are, the better we can analyze your condition.",
    },
    {
        step: 3,
        title: "Result Of Your Symptoms",
        description: "Get an instant health insight based on your symptoms. This is not a final medical judgment, but a helpful first step to understand your condition.",
    },
    {
        step: 4,
        title: "Articles Related to Your Symptoms",
        description: "Read trusted medical articles that match your symptoms. Stay informed with reliable resources to better understand your health.",
    },
    {
        step: 5,
        title: "Nearby Hospitals For Further Diagnosis",
        description: "Find the closest hospitals and healthcare facilities where you can consult professionals for accurate diagnosis and treatment.",
    }
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
        <div className="flex items-center justify-center h-96 p-20 mt-80 mb-40 overflow-hidden">
            <div className="flex items-center gap-8 max-w-7xl w-full">

                {/* Left Card */}
                <div
                    className={`bg-white rounded-2xl p-8 shadow-sm border border-[#A3A3A3] transition-all duration-500 ease-in-out transform w-96 z-0
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
                    className={`bg-white rounded-2xl p-8 shadow-sm border border-[#A3A3A3] transition-all duration-500 ease-in-out transform w-120 z-10
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
                    className={`bg-white rounded-2xl p-8 shadow-sm border border-[#A3A3A3] transition-all duration-500 ease-in-out transform w-96 z-0
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