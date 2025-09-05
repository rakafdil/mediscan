'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

const chooseHospital = () => {
    const router = useRouter();
    const [selectedProvinsi, setSelectedProvinsi] = useState('');
    const [selectedKabupaten, setSelectedKabupaten] = useState('');
    const [selectedKota, setSelectedKota] = useState('');

    const dataKabupaten: Record<string, string[]> = {
        jawa_barat: ['Bandung', 'Bogor'],
        jawa_tengah: ['Semarang', 'Solo'],
        jawa_timur: ['Surabaya', 'Malang'],
        dki_jakarta: ['Jakarta Pusat', 'Jakarta Selatan'],
        di_yogyakarta: ['Sleman', 'Bantul'],
    };

    const dataKota: Record<string, string[]> = {
        Bandung: ['Bandung Kota', 'Cimahi', 'Lembang'],
        Bekasi: ['Bekasi Kota', 'Cikarang', 'Tambun'],
        Bogor: ['Bogor Kota', 'Cibinong', 'Cisarua'],
        Cianjur: ['Cianjur Kota', 'Cugenang', 'Sukaluyu'],
        Cirebon: ['Cirebon Kota', 'Sumber', 'Arjawinangun'],
        Semarang: ['Semarang Kota', 'Ungaran', 'Ambarawa'],
        Solo: ['Solo Kota', 'Laweyan', 'Banjarsari'],
        Magelang: ['Magelang Kota', 'Mertoyudan', 'Secang'],
        Pekalongan: ['Pekalongan Kota', 'Kajen', 'Wonopringgo'],
        Tegal: ['Tegal Kota', 'Slawi', 'Adiwerna'],
        Surabaya: ['Surabaya Pusat', 'Surabaya Timur', 'Surabaya Selatan'],
        Malang: ['Malang Kota', 'Kepanjen', 'Turen'],
        Sidoarjo: ['Sidoarjo Kota', 'Waru', 'Taman'],
        Kediri: ['Kediri Kota', 'Pare', 'Ngasem'],
        Jember: ['Jember Kota', 'Patrang', 'Sumbersari'],
        'Jakarta Pusat': ['Menteng', 'Tanah Abang', 'Kemayoran'],
        'Jakarta Barat': ['Grogol', 'Kalideres', 'Cengkareng'],
        'Jakarta Timur': ['Cakung', 'Duren Sawit', 'Jatinegara'],
        'Jakarta Selatan': ['Kebayoran Baru', 'Pasar Minggu', 'Tebet'],
        'Jakarta Utara': ['Koja', 'Kelapa Gading', 'Pademangan'],
        Sleman: ['Depok', 'Ngaglik', 'Mlati'],
        Bantul: ['Bantul Kota', 'Pundong', 'Srandakan'],
        'Gunung Kidul': ['Wonosari', 'Playen', 'Semanu'],
        'Kulon Progo': ['Wates', 'Sentolo', 'Pengasih'],
        'Yogyakarta Kota': ['Gondokusuman', 'Jetis', 'Danurejan'],
    };

    const handleProvinsiChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const provinsi = e.target.value;
        setSelectedProvinsi(provinsi);
        setSelectedKabupaten('');
        setSelectedKota('');
    };

    const handleKabupatenChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const kabupaten = e.target.value;
        setSelectedKabupaten(kabupaten);
        setSelectedKota('');
    };

    const handleKotaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedKota(e.target.value);
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!selectedProvinsi || !selectedKabupaten || !selectedKota) {
            alert('Silakan pilih lokasi lengkap (Provinsi, Kabupaten, dan Kota)');
            return;
        }

        const searchParams = new URLSearchParams({
            provinsi: selectedProvinsi,
            kabupaten: selectedKabupaten,
            kota: selectedKota,
        });

        router.push(`/hospital/map?${searchParams.toString()}`);
    };

    const getKabupatenOptions = () => {
        if (!selectedProvinsi) return [];
        return dataKabupaten[selectedProvinsi] || [];
    };

    const getKotaOptions = () => {
        if (!selectedKabupaten) return [];
        return dataKota[selectedKabupaten] || [];
    };

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="w-full max-w-md p-2 font-montserrat">
                <h1 className="text-5xl font-bold text-center text-gray-800 mb-4">
                    Share Your Location
                </h1>
                <p className="text-center text-gray-500 mb-8 text-sm">
                    By adding your detailed location, we can help you quickly discover the nearest hospitals around you
                </p>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <select
                        className="w-full p-3 rounded-md border border-gray-300 bg-gray-200 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={selectedProvinsi}
                        onChange={handleProvinsiChange}
                    >
                        <option value="">Province</option>
                        <option value="jawa_barat">Jawa Barat</option>
                        <option value="jawa_tengah">Jawa Tengah</option>
                        <option value="jawa_timur">Jawa Timur</option>
                        <option value="dki_jakarta">DKI Jakarta</option>
                        <option value="di_yogyakarta">DI Yogyakarta</option>
                    </select>

                    <select
                        className="w-full p-3 rounded-md border border-gray-300 bg-gray-200 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={selectedKabupaten}
                        onChange={handleKabupatenChange}
                    >
                        <option value="">Regency</option>
                        {getKabupatenOptions().map((kabupaten) => (
                            <option key={kabupaten} value={kabupaten}>
                                {kabupaten}
                            </option>
                        ))}
                    </select>

                    <select
                        className="w-full p-3 rounded-md border border-gray-300 bg-gray-200 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={selectedKota}
                        onChange={handleKotaChange}
                    >
                        <option value="">City</option>
                        {getKotaOptions().map((kota) => (
                            <option key={kota} value={kota}>
                                {kota}
                            </option>
                        ))}
                    </select>

                    {/* Tambahan button Telusuri */}
                    <button
                        type="submit"
                        className="w-full py-4 px-6 rounded-lg font-medium text-base transition duration-200 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 text-white hover:bg-blue-700 focus:ring-blue-500"
                        style={{ backgroundColor: '#499BE8' }}
                        onMouseEnter={(e) =>
                            ((e.target as HTMLButtonElement).style.backgroundColor = '#3a7bc8')
                        }
                        onMouseLeave={(e) =>
                            ((e.target as HTMLButtonElement).style.backgroundColor = '#499BE8')
                        }
                    >
                        Telusuri
                    </button>
                </form>
            </div>
        </div>
    );
};

export default chooseHospital;