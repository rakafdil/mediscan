// components/TechBehindSection.jsx
'use client'

import Image from "next/image";

const TechBehindSection = () => {
    const techFeatures = [
        {
            icon: '/assets/symptom.png',
            title: 'Symptom Checker',
            description: 'Instantly analyze symptoms and provide comprehensive health insights'
        },
        {
            icon: '/assets/AIessentials.png',
            title: 'AI Driven Accuracy',
            description: 'Powered by Google Gemini for precise analysis and reliable interpretations'
        },
        {
            icon: '/assets/realtime.png',
            title: 'Real-Time Guidance',
            description: 'Receive immediate recommendations on what steps to take next'
        }
    ];

    return (
        <div className="relative min-h-screen py-12 sm:py-16 lg:py-20">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-12 sm:mb-16">
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-montserrat font-bold text-[#252B42] mb-4">
                        The Tech Behind <span className="text-[#6B8FC4]">mediScan</span>
                    </h2>
                    <p className="text-gray-600 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed px-4 sm:px-0">
                        MediScan is powered by Google Gemini AI and enhanced with<br className="hidden sm:block" />
                        advanced artificial engineering to deliver accurate, reliable health<br className="hidden sm:block" />
                        insights instantly.
                    </p>
                </div>

                {/* Tech Features */}
                <div className="relative max-w-6xl mx-auto">
                    <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 lg:gap-12">
                        {techFeatures.map((feature, index) => (
                            <div key={index} className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 text-center hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                                <Image
                                    src={feature.icon}
                                    alt={feature.title}
                                    className="mx-auto w-16 h-16 sm:w-20 sm:h-20 object-contain mb-4"
                                    height={200}
                                    width={200}
                                />
                                <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-4">
                                    {feature.title}
                                </h3>
                                <p className="text-gray-600 leading-relaxed text-sm">
                                    {feature.description.split('<br').map((part, i) => (
                                        <span key={i}>
                                            {part.replace(' className="hidden sm:block" />', '')}
                                            {i < feature.description.split('<br').length - 1 && <br className="hidden sm:block" />}
                                        </span>
                                    ))}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TechBehindSection;