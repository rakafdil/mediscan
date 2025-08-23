'use client'

import Image from 'next/image';
import { useEffect, useRef } from 'react'

const LandingPage = () => {
    return (
        <>
        <section>
            <div className="relative bg-gradient-to-b from-white to-blue-50 min-h-screen">
                {/* Hero Section */}
                <div className="container mx-auto px-4 pt-16 pb-8">
                    <div className="flex flex-col lg:flex-row items-center justify-between">
                        {/* Left Content */}
                        <div className="lg:w-1/2 mb-8 lg:mb-0">
                            <h1 className="text-4xl lg:text-5xl font-bold text-gray-800 mb-6 leading-tight">
                                Scan Now for<br />
                                Better Health
                            </h1>
                            <p className="text-gray-600 text-lg mb-8 leading-relaxed">
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

                        {/* Right Image - Main Hero Image */}
                        <div className="lg:w-1/2 flex justify-center">
                            <img src="../assets/Section1.png" alt="Hero Image" className="w-150 h-150 max-w-md lg:max-w-lg h-auto" />
                        </div>
                    </div>
                </div>

                {/* Features Section */}
                <div className="container mx-auto px-4 py-16">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Smart Health Scanning */}
                        <div className="bg-white rounded-xl shadow-lg p-8 text-center hover:shadow-xl transition-shadow duration-300">
                            <img className="w-30 h-30 flex items-center justify-center mx-auto mb-6 p-4" src="../assets/health.png" alt="Smart Icon"/>
                            <h3 className="text-xl font-bold text-gray-800 mb-4">Smart Health Scanning</h3>
                            <p className="text-gray-600 leading-relaxed">
                                Scan your symptoms anytime, anywhere. The smarter you are, the better you can take care of yourself.
                            </p>
                        </div>

                        {/* Medical Articles */}
                        <div className="bg-white rounded-xl shadow-lg p-8 text-center hover:shadow-xl transition-shadow duration-300">
                            <img className="w-30 h-30 flex items-center justify-center mx-auto mb-6 p-4" src="../assets/Articles.png" alt="Article Icon"/>
                            <h3 className="text-xl font-bold text-gray-800 mb-4">Medical Articles</h3>
                            <p className="text-gray-600 leading-relaxed">
                                Discover the latest articles about your condition. The more you know, the healthier you stay.
                            </p>
                        </div>

                        {/* Hospitals */}
                        <div className="bg-white rounded-xl shadow-lg p-8 text-center hover:shadow-xl transition-shadow duration-300">
                            <img className="w-30 h-30 flex items-center justify-center mx-auto mb-6 p-4" src="../assets/hospitals.png" alt="Hospitals Icon"/>
                            <h3 className="text-xl font-bold text-gray-800 mb-4">Hospitals</h3>
                            <p className="text-gray-600 leading-relaxed">
                                Locate hospitals in your area and connect with professionals to validate your condition.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
        </>
    );
}

export default LandingPage;