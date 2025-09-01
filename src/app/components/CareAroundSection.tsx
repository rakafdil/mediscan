// components/CareAroundSection.jsx
'use client'

import Image from 'next/image';

const CareAroundSection = () => {
    return (
        <div className="relative py-12 sm:py-16 lg:py-20">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 items-center gap-8 sm:gap-12 lg:gap-16">
                    {/* Left Side - Title */}
                    <div className="text-center lg:text-left">
                        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-montserrat font-bold text-gray-800 leading-snug">
                            Care Around You
                        </h2>
                    </div>

                    {/* Center - Image */}
                    <div className="flex justify-center">
                        <Image
                            src="/assets/section4.png"
                            alt="Care Around You"
                            width={400}
                            height={300}
                            className="w-full max-w-xs sm:max-w-sm lg:max-w-md object-contain"
                        />
                    </div>

                    {/* Right Side - Description */}
                    <div className="text-center font-montserrat lg:text-left">
                        <p className="text-gray-600 text-base sm:text-lg leading-relaxed mb-4">
                            Locate hospitals in your area and connect with trusted healthcare professionals to validate your condition.
                        </p>

                        <a
                            href="/hospital"
                            className="inline-flex items-center px-5 py-3 border border-[#252B42] text-[#252B42] font-semibold rounded-xl hover:bg-[#252B42] hover:text-white transition duration-300 gap-2"
                        >
                            Find Hospitals Near You
                            <span className="text-lg">›</span>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CareAroundSection;