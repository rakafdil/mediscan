'use client'

import Image from 'next/image';
import { useEffect, useRef } from 'react'

const LandingPage = () => {
    return (
        <>
            <section>
                <div className="relative bg-gradient-to-b from-white to-blue-50 min-h-screen">
                    {/* Hero Section */}
                    {/* Wrapper utama tetap relative biar absolute bisa nempel */}
                    <div className="relative bg-gradient-to-b from-white to-blue-50 min-h-screen">
                        {/* Hero Section */}
                        <div className="container mx-auto px-4 pt-16 pb-8 relative z-10">
                            <div className="flex flex-col lg:flex-row items-center justify-between">
                                {/* Left Content */}
                                <div className="lg:w-1/2 relative -top-25">
                                    <h1 className="text-4xl lg:text-6xl font-bold text-gray-800 mb-8 leading-tight">
                                        Scan Now for<br />
                                        Better Health
                                    </h1>
                                    <p className="text-[#737373] text-lg mb-8 leading-relaxed">
                                        Scan your symptoms early and get<br />
                                        AI-powered insights
                                    </p>
                                    <div className="flex flex-col sm:flex-row gap-4">
                                        <a href="/symptom-checker">
                                            <button className="bg-[#628EF7] hover:bg-blue-600 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-300">
                                                Start Scan Now
                                            </button>
                                        </a>
                                        <button className="border-2 border-[#628EF7] hover:border-blue-800 text-[#628EF7] font-semibold py-3 px-8 rounded-lg transition-colors duration-300">
                                            Learn More
                                        </button>
                                    </div>
                                </div>

                                {/* Right Image */}
                                <div className="relative flex justify-center">
                                    <div className='absolute top-10 left-20 w-40 h-40 bg-blue-200 rounded-full z-0'></div>
                                    <img src="../assets/Section1.png" alt="Hero Image" className="w-[1050px] h-auto relative z-10" />
                                </div>
                            </div>
                        </div>

                        {/* Features Section di atas image */}
                        <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-full max-w-6xl z-20">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 px-4">
                                <a href='/symptom-checker'>
                                    <div className="bg-white rounded-xl shadow-lg p-8 text-left hover:shadow-xl transition-shadow duration-300">
                                        <img className="w-18 h-18 ml-1 mb-6" src="../assets/health.png" alt="Smart Icon" />
                                        <h3 className="text-xl font-bold text-gray-800 mb-4 after:content-[''] after:block after:w-12 after:h-[2px] after:bg-red-500 
                                            after:mt-2 after:scale-x-0 hover:after:scale-x-100 
                                            after:transition-transform after:duration-300">Smart Health Scanning</h3>
                                        <p className="text-gray-600 leading-relaxed">
                                            Scan your symptoms anytime, anywhere. The smarter you are, the better you can take care of yourself.
                                        </p>
                                    </div>
                                </a>

                                <a href='/article'>
                                    <div className="bg-white rounded-xl shadow-lg p-8 text-left hover:shadow-xl transition-shadow duration-300">
                                        <img className="w-18 h-18 ml-1 mb-6" src="../assets/Articles.png" alt="Article Icon" />
                                        <h3 className="text-xl font-bold text-gray-800 mb-4 after:content-[''] after:block after:w-12 after:h-[2px] after:bg-red-500 
                                            after:mt-2 after:scale-x-0 hover:after:scale-x-100 
                                            after:transition-transform after:duration-300">Medical Articles</h3>
                                        <p className="text-gray-600 leading-relaxed">
                                            Discover the latest articles about your condition. The more you know, the healthier you stay.
                                        </p>
                                    </div>
                                </a>

                                <a href='/hospital'>
                                    <div className="bg-white rounded-xl shadow-lg p-8 text-left hover:shadow-xl transition-shadow duration-300">
                                        <img className="w-18 h-18 ml-1 mb-6" src="../assets/hospitals.png" alt="Hospitals Icon" />
                                        <h3 className="text-xl font-bold text-gray-800 mb-4 after:content-[''] after:block after:w-12 after:h-[2px] after:bg-red-500 
                                            after:mt-2 after:scale-x-0 hover:after:scale-x-100
                                            after:transition-transform after:duration-300">Hospitals</h3>
                                        <p className="text-gray-600 leading-relaxed">
                                            Locate hospitals in your area and connect with professionals to validate your condition.
                                        </p>
                                    </div>
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Video Section */}
                    <div className="h-160 w-full flex items-center justify-between px-30 py-10">
                        {/* Left side - Text */}
                        <div className="max-w-md">
                            <div className='my-10 mt-5'>
                                <h2 className="text-4xl font-bold text-[#252B42] mb-3">
                                    How to Use Symptom Scan in 4 Easy Steps
                                </h2>
                            </div>
                            <div className='my-10'></div>
                            <p className="text-[#737373] text-sm mb-4">
                                Watch this quick video to learn how to scan your symptoms and get instant insights.
                            </p>
                            <div className='my-20'>
                                <a
                                    href="#"
                                    className="text-[#252B42] font-medium hover:underline flex items-center gap-1"
                                >
                                    Learn More
                                    <span>›</span>
                                </a>
                            </div>
                        </div>
                        <div className="w-40 h-40 mr-20 relative">
                            <img
                                src="/assets/element2.png"
                                alt="Background Shape"
                                className="absolute inset-0 w-full h-full object-cover"
                            />
                        </div>
                        {/* Right side - YouTube video */}
                        <div className="w-140 h-80 rounded-lg overflow-hidden shadow-md">
                            <iframe
                                src="https://www.youtube.com/embed/VIDEO_ID"
                                title="YouTube video player"
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                className="w-full h-full"
                            ></iframe>
                        </div>
                    </div>

                    <div className='h-200'></div>

                </div>
            </section>
        </>
    );
}

export default LandingPage;