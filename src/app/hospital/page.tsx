// app/page.tsx (atau komponen HeroSection.tsx)
"use client";

import Image from "next/image";

export default function HeroSection() {
    return (
        <div className="bg-[#FAFAF8] min-h-screen flex flex-col">
            {/* Bagian Hero */}
            <section className="flex flex-col md:flex-row items-center justify-between px-8 md:px-16 lg:px-24 py-16">
                {/* Gambar utama */}
                <div className="w-full md:w-1/2 flex justify-center">
                    <Image
                        src="/assets/Pharmacist.png" // ganti dengan file kamu di /public
                        alt="Doctor Illustration"
                        width={900}
                        height={900}
                        className="object-contain"
                    />
                </div>

                {/* Teks Hero */}
                <div className="w-full md:w-1/2 mt-8 md:mt-0 text-center md:text-left">
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-snug">
                        Find Care Around <br /> the Corner
                    </h1>
                    <p className="text-gray-600 mt-4 text-lg">
                        Easily discover trusted hospitals and clinics just steps away from where you are
                    </p>
                    <a href="/hospital/choose">
                    <button className="mt-6 px-6 py-3 rounded-lg bg-blue-500 text-white font-medium hover:bg-blue-600 transition">
                        Start Checking Now
                    </button>
                    </a>
                </div>
            </section>

            {/* Bagian Info Box */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-6 px-8 md:px-16 lg:px-24 pb-16">
                <div className="bg-white shadow-md rounded-xl p-6 text-center hover:shadow-lg transition">
                    <div className="flex justify-center mb-3">
                        ⭐⭐⭐⭐⭐
                    </div>
                    <p className="text-gray-600">Finding the best hospitals in the nearest area</p>
                </div>

                <div className="bg-white shadow-md rounded-xl p-6 text-center hover:shadow-lg transition">
                    <h3 className="text-2xl font-bold text-blue-600">3.155 +</h3>
                    <p className="text-gray-600">
                        More than 3,155 good hospitals in Indonesia are already registered
                    </p>
                </div>

                <div className="bg-white shadow-md rounded-xl p-6 text-center hover:shadow-lg transition">
                    <h3 className="text-2xl font-bold text-blue-600">24/7</h3>
                    <p className="text-gray-600">
                        Thanks for all the services, no doubt it is the best hospital
                    </p>
                </div>
            </section>
        </div>
    );
}
