"use client"

import Image from 'next/image'
import Link from 'next/link'
import React, { useState } from 'react'
import CarouselSlide from './steps'
import { faChevronDown } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

const SistemPakarPage = () => {
    const [openFAQ, setOpenFAQ] = useState<number | null>(null);

    const faqData = [
        {
            question: "What is Mediscan Symptom Checker?",
            answer: "Mediscan Symptom Checker is an AI-powered tool that helps you understand your symptoms and provides preliminary health insights. It uses advanced technology to analyze your symptoms and suggest possible conditions."
        },
        {
            question: "How accurate is the AI diagnosis?",
            answer: "We use Google Gemini AI with advanced prompt engineering to provide the most accurate predictions possible. However, results may vary and should not replace professional medical advice. Always consult with a healthcare provider for proper diagnosis."
        },
        {
            question: "Is my health information secure?",
            answer: "Yes, we take your privacy seriously. All health information is encrypted and stored securely. We do not share your personal health data with third parties without your explicit consent."
        },
        {
            question: "Can I use this instead of seeing a doctor?",
            answer: "No, this tool is designed to provide preliminary insights only. It should never replace professional medical consultation. Always seek immediate medical attention for serious symptoms or emergencies."
        },
        {
            question: "Is the service free to use?",
            answer: "Yes, our basic symptom checking service is completely free. We believe everyone should have access to preliminary health insights regardless of their financial situation."
        }
    ];

    const toggleFAQ = (index: number) => {
        setOpenFAQ(openFAQ === index ? null : index);
    };

    return (
        <div className='px-5'>
            <header className="relative font-montserrat py-40 px-4 sm:px-8 lg:px-20 md:flex lg:justify-start justify-center">
                <div className="flex flex-col-reverse lg:flex-row items-center lg:items-end gap-8 lg:gap-0">
                    {/* Text Content */}
                    <div className="relative z-10 max-w-xl lg:ml-20 text-center lg:text-left">
                        <h1 className="font-bold text-3xl sm:text-4xl lg:text-6xl leading-tight text-[#252B42]">
                            Check Your Symptoms in Seconds
                        </h1>
                        <p className="text-[#737373] mt-4 lg:mt-5 text-sm sm:text-base lg:pr-16">
                            Scan your symptoms early and get AI-powered insights.
                        </p>
                        <Link href="/symptom-checker/symptoms/#" className="inline-block">
                            <button className="bg-[#628EF7] py-3 px-6 sm:px-8 lg:px-12 text-white font-semibold rounded-lg mt-6 cursor-pointer w-fit hover:scale-105 transition-all duration-200 text-sm sm:text-base">
                                Start Checking Now
                            </button>
                        </Link>
                    </div>

                    {/* Hero Image */}
                    <div className="relative w-full lg:absolute lg:top-0 lg:right-10 xl:right-40 lg:z-0 flex justify-center lg:justify-end">
                        <Image
                            src="/assets/symptom-hero.svg"
                            alt="Symptom Hero"
                            width={500}  // ini optional buat ratio aja
                            height={500}
                            priority
                            className="w-80 h-80 sm:w-96 sm:h-96 lg:w-[600px] lg:h-[600px] object-contain"
                        />
                    </div>
                </div>
            </header>

            <CarouselSlide />

            {/* Responsive FAQ Section */}
            <div className="flex flex-col items-center py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-10 bg-gray-50 my-20 lg:my-40">
                <div className="max-w-4xl w-full">
                    {/* FAQ Header */}
                    <div className="text-center mb-8 lg:mb-12">
                        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-800 mb-4">
                            Frequently Asked Questions
                        </h2>
                        <p className="text-lg sm:text-xl text-gray-600">
                            Everything you need to know about our symptom checker
                        </p>
                    </div>

                    {/* FAQ Items */}
                    <div className="space-y-3 sm:space-y-4">
                        {faqData.map((faq, index) => (
                            <div
                                key={index}
                                className="bg-white rounded-sm shadow-sm border border-l-4 border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-md"
                            >
                                <button
                                    onClick={() => toggleFAQ(index)}
                                    className="w-full px-4 sm:px-6 py-4 sm:py-5 text-left flex justify-between items-center hover:bg-gray-50 transition-colors duration-200"
                                >
                                    <span className="text-base sm:text-lg font-semibold text-gray-800 pr-4">
                                        {faq.question}
                                    </span>
                                    <FontAwesomeIcon
                                        icon={faChevronDown}
                                        className={`text-gray-500 transition-transform duration-300 flex-shrink-0 text-sm sm:text-base ${openFAQ === index ? 'rotate-180' : ''
                                            }`}
                                    />
                                </button>

                                {openFAQ === index && (
                                    <div className="px-4 sm:px-6 pb-4 sm:pb-5 border-t border-gray-100 bg-gradient-to-br from-[#F1F0FB] via-purple-50 to-blue-50">
                                        <div className="pt-4 text-gray-700 leading-relaxed animate-fadeIn text-sm sm:text-base">
                                            {faq.answer}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Contact Support */}
                    <div className="text-center mt-8 lg:mt-12 p-6 sm:p-8 bg-blue-50 rounded-xl border border-blue-200">
                        <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">
                            Still have questions?
                        </h3>
                        <p className="text-gray-600 mb-4 text-sm sm:text-base">
                            Our support team is here to help you get the most out of Mediscan
                        </p>
                        <a
                            href="mailto:alomany.tif@gmail.com"
                            className="inline-block bg-blue-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200 text-sm sm:text-base"
                        >
                            Contact Support
                        </a>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default SistemPakarPage