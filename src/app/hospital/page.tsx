"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function HeroSection() {
    const [counters, setCounters] = useState({
        hospitals: 0,
        isVisible: false
    });

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setCounters(prev => ({ ...prev, isVisible: true }));

                        let current = 0;
                        const target = 215977;
                        const increment = target / 100;
                        const timer = setInterval(() => {
                            current += increment;
                            if (current >= target) {
                                current = target;
                                clearInterval(timer);
                            }
                            setCounters(prev => ({
                                ...prev,
                                hospitals: Math.floor(current)
                            }));
                        }, 20);
                    }
                });
            },
            { threshold: 0.3 }
        );

        const boxSection = document.querySelector('#info-boxes');
        if (boxSection) {
            observer.observe(boxSection);
        }

        return () => observer.disconnect();
    }, []);

    return (
        <div className="min-h-screen flex flex-col">
            {/* Bagian Hero */}
            <section className="flex flex-col md:flex-row items-center justify-between px-8 md:px-16 lg:px-24 py-16">
                {/* Gambar utama */}
                <div className="w-full md:w-1/2 flex justify-center">
                    <Image
                        src="/assets/Pharmacist.png"
                        alt="Doctor Illustration"
                        width={900}
                        height={900}
                        className="object-contain"
                    />
                </div>

                {/* Teks Hero */}
                <div className="w-full md:w-1/2 mt-10 md:mt-0 text-center md:text-right font-montserrat">
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-snug">
                        Find Care Around <br /> the Corner
                    </h1>
                    <p className="text-gray-600 mt-2 text-lg">
                        Easily discover trusted hospitals and clinics just steps away from where you are
                    </p>
                    <Link href="/hospital/choose">
                        <button className="mt-6 px-6 py-3 rounded-lg bg-blue-500 text-white font-medium hover:bg-blue-600 transition">
                            Search Hospital
                        </button>
                    </Link>
                </div>
            </section>

            {/* Bagian Info Box dengan Efek */}
            <section
                id="info-boxes"
                className="grid grid-cols-1 md:grid-cols-3 gap-6 px-8 md:px-16 lg:px-24 pb-50 pt-10"
            >
                {/* Box 1 - Stars dengan animasi */}
                <div className={`bg-white shadow-md rounded-xl p-15 text-center hover:shadow-lg transition-all duration-700 transform ${counters.isVisible
                    ? 'translate-y-0 opacity-100'
                    : 'translate-y-10 opacity-0'
                    }`}
                    style={{ transitionDelay: '0ms' }}
                >
                    <div className="flex justify-center mb-3">
                        <span className="inline-block text-4xl">⭐⭐⭐⭐⭐</span>
                    </div>
                    <p className="text-gray-600">Finding the best hospitals in the nearest area</p>
                </div>

                {/* Box 2 - Counter dengan animasi */}
                <div className={`bg-white shadow-md rounded-xl p-15 text-center hover:shadow-lg transition-all duration-700 transform ${counters.isVisible
                    ? 'translate-y-0 opacity-100'
                    : 'translate-y-10 opacity-0'
                    }`}
                    style={{ transitionDelay: '200ms' }}
                >
                    <h3 className="text-4xl font-bold text-blue-600 font-montserrat mb-3">
                        {counters.hospitals.toLocaleString()} +
                    </h3>
                    <p className="text-gray-600">
                        Across the globe, thousands of hospitals are recognized among the best
                    </p>
                </div>

                {/* Box 3 - 24/7 dengan animasi berkedip */}
                <div className={`bg-white shadow-md rounded-xl p-15 text-center hover:shadow-lg transition-all duration-700 transform ${counters.isVisible
                    ? 'translate-y-0 opacity-100'
                    : 'translate-y-10 opacity-0'
                    }`}
                    style={{ transitionDelay: '400ms' }}
                >
                    <h3 className="text-4xl font-bold text-blue-600 font-montserrat mb-3">
                        <span className="inline-block">24/7</span>
                    </h3>
                    <p className="text-gray-600">
                        Thanks for all the services, no doubt it is the best hospital
                    </p>
                </div>
            </section>
        </div>
    );
}