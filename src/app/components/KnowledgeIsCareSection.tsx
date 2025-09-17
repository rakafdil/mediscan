// components/KnowledgeIsCareSection.jsx
'use client'

import Image from 'next/image';

const KnowledgeIsCareSection = () => {
    return (
        <div className="relative py-12 sm:py-16 lg:py-20">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-10 lg:gap-16">
                    {/* Left Side - Content */}
                    <div className="font-montserrat text-center lg:text-left">
                        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#6B8FC4] mb-4 sm:mb-6 leading-tight">
                            Knowledge is Care
                        </h2>
                        <p className="text-gray-600 text-base sm:text-lg leading-relaxed max-w-md mx-auto lg:mx-0 mb-6">
                            The more you know about your condition, the better you can take care of yourself
                        </p>

                        <a
                            href="/article"
                            className="inline-flex items-center px-5 py-3 border border-[#252B42] text-[#252B42] font-semibold rounded-xl hover:bg-[#252B42] hover:text-white transition duration-300 gap-2"
                        >
                            Learn More
                            <span className="text-lg">›</span>
                        </a>
                    </div>

                    {/* Right Side - Image */}
                    <div className="flex justify-center lg:justify-end">
                        <Image
                            src="/assets/Section 5.svg"
                            alt="Knowledge is Care"
                            width={400}
                            height={300}
                            className="w-full max-w-sm sm:max-w-md lg:max-w-lg object-contain"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default KnowledgeIsCareSection;