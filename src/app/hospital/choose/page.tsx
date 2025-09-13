'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const ChooseHospital = () => {
    const router = useRouter();
    const [countries, setCountries] = useState<{ name: string; iso2: string }[]>([]);
    const [states, setStates] = useState<{ name: string; iso2: string }[]>([]);
    const [cities, setCities] = useState<{ name: string; iso2: string }[]>([]);

    const [selectedCountry, setSelectedCountry] = useState('');
    const [selectedState, setSelectedState] = useState('');
    const [selectedCity, setSelectedCity] = useState('');

    // Load countries on mount
    useEffect(() => {
        fetch('/api/regions?type=countries')
            .then((res) => res.json())
            .then((data) => setCountries(data))
            .catch((err) => console.error('Error loading countries:', err));
    }, []);

    // Load states when a country is selected
    useEffect(() => {
        if (!selectedCountry) return;
        setStates([]);
        setCities([]);
        setSelectedState('');
        setSelectedCity('');

        fetch(`/api/regions?type=states&country=${selectedCountry}`)
            .then((res) => res.json())
            .then((data) => setStates(data))
            .catch((err) => console.error('Error loading states:', err));
    }, [selectedCountry]);

    // Load cities when a state is selected
    useEffect(() => {
        if (!selectedCountry || !selectedState) return;
        setCities([]);
        setSelectedCity('');

        fetch(`/api/regions?type=cities&country=${selectedCountry}&state=${selectedState}`)
            .then((res) => res.json())
            .then((data) => setCities(data))
            .catch((err) => console.error('Error loading cities:', err));
    }, [selectedState, selectedCountry]);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!selectedCountry || !selectedState || !selectedCity) {
            alert('Silakan pilih lokasi lengkap (Country, State, dan City)');
            return;
        }
        const searchParams = new URLSearchParams({
            country: selectedCountry,
            state: selectedState,
            city: selectedCity,
        });
        router.push(`/hospital/map?${searchParams.toString()}`);
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
                    {/* Country */}
                    <select
                        className="w-full p-3 rounded-md border border-gray-300 bg-gray-200 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={selectedCountry}
                        onChange={(e) => setSelectedCountry(e.target.value)}
                    >
                        <option value="">Select Country</option>
                        {countries.map((c) => (
                            <option key={c.iso2} value={c.iso2}>
                                {c.name}
                            </option>
                        ))}
                    </select>

                    {/* State */}
                    <select
                        className="w-full p-3 rounded-md border border-gray-300 bg-gray-200 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={selectedState}
                        onChange={(e) => setSelectedState(e.target.value)}
                        disabled={!states.length}
                    >
                        <option value="">Select State</option>
                        {states.map((s) => (
                            <option key={s.iso2} value={s.iso2}>
                                {s.name}
                            </option>
                        ))}
                    </select>

                    {/* City */}
                    <select
                        className="w-full p-3 rounded-md border border-gray-300 bg-gray-200 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={selectedCity}
                        onChange={(e) => setSelectedCity(e.target.value)}
                        disabled={!cities.length}
                    >
                        <option value="">Select City</option>
                        {cities.map((c) => (
                            <option key={c.iso2} value={c.iso2}>
                                {c.name}
                            </option>
                        ))}
                    </select>

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

export default ChooseHospital;