import Link from 'next/link'
import React from 'react'

const SistemPakarPage = () => {
    return (
        <div className='px-5'>
            <div className="px-4 md:px-8 lg:px-20 py-8">
                <header className="text-center mb-10 pb-6 border-b-2 border-blue-500">
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-2">Pengecekan Gejala Kesehatan</h1>
                    <p className="text-gray-600">Dapatkan informasi awal tentang kondisi kesehatan Anda berdasarkan gejala yang
                        dialami</p>
                </header>
            </div>

            <div className="flex flex-col lg:flex-row items-start justify-between gap-10 mb-12">

                <div className="flex-1 bg-white rounded-xl shadow-md p-6">
                    <h2 className="text-2xl font-semibold text-blue-600 border-b-2 border-gray-200 pb-3 mb-4">Cara Menggunakan
                        Sistem Ini</h2>
                    <ol className="list-decimal list-inside space-y-3 text-gray-700">
                        <li className="hover:scale-105 transition-all duration-300">Pastikan Anda telah daftar dan masuk
                            ke sistem, jika belum Anda dapat mendaftar terlebih dahulu.
                        </li>
                        <li className="hover:scale-105 transition-all duration-300">Tekan tombol {"Mulai Diagnosa"} di sebelah untuk melanjutkan pengecekan.</li>
                        <li className="hover:scale-105 transition-all duration-300">Masukkan informasi diri Anda yang telah
                            diminta oleh sistem (usia, jenis kelamin, riwayat
                            kesehatan).</li>
                        <li className="hover:scale-105 transition-all duration-300">Masukkan gejala-gejala yang Anda alami
                            dengan detail untuk hasil yang lebih akurat.</li>
                        <li className="hover:scale-105 transition-all duration-300">Sistem akan menampilkan kondisi-kondisi yang
                            mungkin terjadi pada Anda beserta tingkat
                            kemungkinannya.</li>
                        <li className="hover:scale-105 transition-all duration-300">Riwayat pengecekan Anda akan tersimpan dan
                            dapat dilihat kembali kapan saja.</li>
                    </ol>
                </div>

                <div className="flex-shrink-0 flex flex-col items-center self-center bg-blue-50 rounded-xl shadow-md p-6">


                    <Link href="/disease-prediction/symptoms/#" className="inline-block">
                        <div
                            className="w-44 h-44 md:w-48 md:h-48 bg-blue-500 rounded-full flex flex-col items-center justify-center text-white font-bold transition-all duration-300 shadow-lg hover:bg-blue-600 hover:scale-110">
                            <div className="text-4xl mb-2">📱</div>
                            <div>TEKAN DI SINI</div>
                            <div>UNTUK DIAGNOSA</div>
                        </div>
                    </Link>

                    <p className="mt-4 text-center text-gray-600">Pengecekan ini hanya membutuhkan waktu sekitar 3-5 menit</p>
                </div>
            </div>

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

            </div>

        </div>
    )
}

export default SistemPakarPage