import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import CarouselSlide from './steps'

const SistemPakarPage = () => {
    return (
        <div className='px-5'>

            <header className="relative font-montserrat pt-40 px-20">
                <div className="relative z-10 max-w-xl ml-20">
                    <h1 className="font-bold text-6xl/20 text-[#252B42]">
                        Check Your Symptoms in Seconds
                    </h1>
                    <p className="pr-70 text-[#737373] mt-5">
                        Scan your symptoms early and get AI-powered insights.
                    </p>
                    <Link href="/disease-prediction/symptoms/#" className="inline-block">
                        <button
                            className="bg-[#628EF7] py-3 px-30 text-white font-semibold rounded-lg mt-6 cursor-pointer w-fit">
                            Start Checking Now
                        </button>
                    </Link>
                </div>

                <Image
                    src="/assets/symptom-hero.svg"
                    alt="Symptom Hero"
                    width={700}
                    height={700}
                    priority
                    className="absolute top-15 right-40 z-0"
                />
            </header>

            <CarouselSlide />

            <h1>TES</h1>

            {/* 
            <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-2xl font-semibold text-blue-600 border-b-2 border-gray-200 pb-3 mb-4">Riwayat Pengecekan
                </h2>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr>
                                <th className="py-3 px-4 text-center  bg-gray-50 text-gray-700 border-b-2 border-gray-200">
                                    Tanggal
                                </th>
                                <th className="py-3 px-4 text-center  bg-gray-50 text-gray-700 border-b-2 border-gray-200">Waktu
                                </th>
                                <th className="py-3 px-4 text-center  bg-gray-50 text-gray-700 border-b-2 border-gray-200">
                                    Detail
                                </th>
                            </tr>
                        </thead>
                        <tbody>

                            <tr className="hover:bg-blue-50 transition-colors duration-200">
                                <td className="py-3 px-4 border-b border-gray-200 text-center">
                                    17-08-2025
                                </td>
                                <td className="py-3 px-4 border-b border-gray-200 text-center">
                                    11:31pm
                                </td>
                                <td className="py-3 px-4 border-b border-gray-200 text-center">
                                    <a href="{{ route('sistem-pakar.history', ['history_id' => $session->id_session]) }}"
                                        className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded text-sm transition-colors duration-200">
                                        Lihat Detail
                                    </a>
                                </td>
                            </tr>

                            <tr>
                                <td colSpan={3} className="text-center py-6 text-gray-500">
                                    Belum ada riwayat pemeriksaan.
                                </td>
                            </tr>

                        </tbody>
                    </table>
                </div>

            </div> */}

        </div>
    )
}

export default SistemPakarPage