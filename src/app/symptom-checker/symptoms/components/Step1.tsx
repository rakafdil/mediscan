import React, { useEffect, useState } from 'react';
import { StepContainer } from './CommonComponents';
import { FormData } from '../types';
import EditableList from './EditableList';
import { useSearchLocationData } from '@/hooks/useSearchLocation';

interface Step1Props {
    formData: FormData;
    setFormData: React.Dispatch<React.SetStateAction<FormData>>;
    onNext: () => void;
}

const Step1: React.FC<Step1Props> = ({
    formData,
    setFormData,
    onNext
}) => {
    const [countries, setCountries] = useState<{ name: string; iso2: string }[]>([]);
    const [states, setStates] = useState<{ name: string; iso2: string }[]>([]);
    const [cities, setCities] = useState<{ name: string; iso2: string }[]>([]);

    // Initialize state from profile data
    const [selectedCountry, setSelectedCountry] = useState(formData.location.country || '');
    const [selectedState, setSelectedState] = useState(formData.location.state || '');
    const [selectedCity, setSelectedCity] = useState(formData.location.city || '');

    const searchCoor = useSearchLocationData();

    const [locating, setLocating] = useState(false);
    const [locError, setLocError] = useState<string | null>(null);

    const handleUseMyLocation = () => {
        if (!navigator.geolocation) {
            setLocError("Geolocation is not supported by your browser");
            return;
        }
        setLocating(true);
        setLocError(null);
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;

                // Reverse geocode via Nominatim untuk dapat nama lokasi
                try {
                    const res = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&accept-language=en`,
                        { headers: { 'User-Agent': 'MediScan/1.0' } }
                    );
                    const data = await res.json();
                    const addr = data.address ?? {};

                    const country = addr.country ?? '';
                    const state = addr.state ?? addr.province ?? addr.region ?? '';
                    const city = addr.city ?? addr.town ?? addr.village ?? addr.county ?? '';

                    setSelectedCountry(country);
                    setSelectedState(state);
                    setSelectedCity(city);

                    setFormData(prev => ({
                        ...prev,
                        location: {
                            ...prev.location,
                            country,
                            state,
                            city,
                            lat: latitude,
                            lon: longitude,
                        }
                    }));
                } catch {
                    // Koordinat tetap tersimpan walau reverse geocode gagal
                    setFormData(prev => ({
                        ...prev,
                        location: { ...prev.location, lat: latitude, lon: longitude }
                    }));
                    setLocError("Got coordinates but couldn't resolve location name");
                } finally {
                    setLocating(false);
                }
            },
            (err) => {
                setLocating(false);
                setLocError(
                    err.code === 1 ? "Location permission denied" :
                        err.code === 2 ? "Location unavailable" :
                            "Location request timed out"
                );
            },
            { timeout: 10000, maximumAge: 60000 }
        );
    };
    useEffect(() => {
        fetch('/api/regions?type=countries')
            .then((res) => res.json())
            .then((data) => setCountries(Array.isArray(data) ? data : []))
            .catch((err) => {
                console.error('Error loading countries:', err);
                setCountries([]);
            });
    }, []);

    useEffect(() => {
        if (formData.location.country) {
            setSelectedCountry(formData.location.country);
        }
        if (formData.location.state) {
            setSelectedState(formData.location.state);
        }
        if (formData.location.city) {
            setSelectedCity(formData.location.city);
        }
    }, [formData.location]);

    useEffect(() => {
        if (!selectedCountry) return;
        fetch(`/api/regions?type=states&country=${selectedCountry}`)
            .then((res) => res.json())
            .then((data) => setStates(Array.isArray(data) ? data : []))
            .catch(() => setStates([]));
    }, [selectedCountry]);

    useEffect(() => {
        if (!selectedCountry || !selectedState) return;
        fetch(`/api/regions?type=cities&country=${selectedCountry}&state=${selectedState}`)
            .then((res) => res.json())
            .then((data) => setCities(Array.isArray(data) ? data : []))
            .catch(() => setCities([]));
    }, [selectedCountry, selectedState]);


    const handleCountryChange = (value: string) => {
        setSelectedCountry(value);
        setFormData(prev => ({
            ...prev,
            location: {
                ...prev.location,
                country: value,
                state: '',
                city: ''
            }
        }));
        setTimeout(() => {
            if (value) setCoordinates();
        }, 200);
    };

    const handleStateChange = (value: string) => {
        setSelectedState(value);
        setFormData(prev => ({
            ...prev,
            location: {
                ...prev.location,
                state: value,
                city: ''
            }
        }));
        setTimeout(() => {
            if (value) setCoordinates();
        }, 200);
    };

    const handleCityChange = (value: string) => {
        setSelectedCity(value);
        setFormData(prev => ({
            ...prev,
            location: {
                ...prev.location,
                city: value
            }
        }));
        setTimeout(() => {
            if (value) setCoordinates();
        }, 200);
    };

    const setCoordinates = async () => {
        const { latitude, longitude } = await searchCoor.getCoordinates(
            formData.location.country || '',
            formData.location.state || '',
            formData.location.city || ''
        )
        setFormData((prev) => ({
            ...prev,
            location: {
                ...prev.location,
                lat: latitude,
                lon: longitude
            }
        }))
    }

    return (
        <div className="flex flex-col items-center pb-20">
            <StepContainer className="flex flex-col items-center max-w-7xl w-full md:w-[80%]"
                title="Biodata"
                titleClassName="text-xl md:text-2xl font-bold"
            >
                <div className="flex flex-col items-center justify-center px-9 pb-20 gap-10 w-full">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
                        <div>
                            <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-2">
                                Age
                            </label>
                            <input
                                type="number"
                                id="age"
                                name="age"
                                required={true}
                                value={formData.age}
                                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                                min={0}
                                placeholder="Insert here"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Gender
                            </label>
                            <div className="flex flex-row gap-4 w-full">
                                <div className="flex-1">
                                    <input
                                        type="radio"
                                        id="male"
                                        name="gender"
                                        value="Male"
                                        checked={formData.gender === "Male"}
                                        onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                                        className="hidden peer/male"
                                        required
                                    />
                                    <label
                                        htmlFor="male"
                                        className="px-4 py-3 w-full border-2 font-medium text-sm border-gray-300 text-gray-600 rounded-lg cursor-pointer
                                        peer-checked/male:bg-blue-500 peer-checked/male:border-blue-500
                                        peer-checked/male:text-white transition flex items-center justify-center hover:bg-blue-200"
                                    >
                                        Male
                                    </label>
                                </div>
                                <div className="flex-1">
                                    <input
                                        type="radio"
                                        id="female"
                                        name="gender"
                                        value="Female"
                                        checked={formData.gender === "Female"}
                                        onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                                        className="hidden peer/female"
                                        required
                                    />
                                    <label
                                        htmlFor="female"
                                        className="px-4 py-3 w-full border-2 font-medium text-sm border-gray-300 text-gray-600 rounded-lg cursor-pointer
                                        peer-checked/female:bg-blue-500 peer-checked/female:border-blue-500
                                        peer-checked/female:text-white transition flex items-center justify-center hover:bg-blue-200"
                                    >
                                        Female
                                    </label>
                                </div>
                            </div>
                        </div>
                        <div>
                            <label htmlFor="weight" className="block text-sm font-medium text-gray-700 mb-2">
                                Weight
                            </label>
                            <div className="flex items-center gap-3 w-full">
                                <input
                                    type="number"
                                    id="weight"
                                    name="weight"
                                    required={true}
                                    value={formData.weight}
                                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                                    min={0}
                                    placeholder="Insert here"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                />
                                <span className="font-bold text-sm text-gray-800">kg</span>
                            </div>
                        </div>
                        <div>
                            <label htmlFor="height" className="block text-sm font-medium text-gray-700 mb-2">
                                Height
                            </label>
                            <div className="flex items-center gap-3 w-full">
                                <input
                                    type="number"
                                    id="height"
                                    name="height"
                                    required={true}
                                    value={formData.height}
                                    onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                                    min={0}
                                    placeholder="Insert here"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                />
                                <span className="font-bold text-sm text-gray-800">cm</span>
                            </div>
                        </div>
                    </div>
                </div>
            </StepContainer>

            <StepContainer
                className="flex flex-col items-center w-full md:w-[80%] pb-10"
                title="Location"
                titleClassName="text-xl md:text-2xl font-bold"
            >
                <div className="space-y-6 w-full">
                    {/* Tombol Use My Location */}
                    <div className="flex flex-col items-center gap-2">
                        <button
                            type="button"
                            onClick={handleUseMyLocation}
                            disabled={locating}
                            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-300 border-2
                    ${locating
                                    ? 'border-gray-300 text-gray-400 cursor-not-allowed'
                                    : 'border-blue-400 text-blue-600 hover:bg-blue-50 hover:scale-105 cursor-pointer'
                                }`}
                        >
                            {locating ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400" />
                                    Detecting location...
                                </>
                            ) : (
                                <>
                                    📍 Use My Location
                                </>
                            )}
                        </button>
                        {locError && (
                            <p className="text-sm text-red-500">{locError}</p>
                        )}
                        {formData.location.lat && formData.location.lon && (
                            <p className="text-xs text-gray-400">
                                📌 {formData.location.lat.toFixed(4)}, {formData.location.lon.toFixed(4)}
                                {formData.location.city && ` — ${formData.location.city}`}
                            </p>
                        )}
                    </div>

                    <div className="flex items-center gap-4 text-gray-400 text-sm">
                        <div className="flex-1 h-px bg-gray-200" />
                        <span>or select manually</span>
                        <div className="flex-1 h-px bg-gray-200" />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
                        <div>
                            <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-2">
                                Country
                            </label>
                            <select
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                value={formData.location.country || ''}
                                onChange={(e) => handleCountryChange(e.target.value)}
                                disabled={false}
                            >
                                <option className="bg-white" value="">
                                    {!selectedCountry && "Select Country"}
                                </option>
                                {countries.map((c, index) => (
                                    <option className="bg-white font-josefin" key={index} value={c.iso2}>
                                        {c.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-2">
                                State/Province
                            </label>
                            <select
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors disabled:text-gray-300"
                                value={formData.location.state || ''}
                                onChange={(e) => handleStateChange(e.target.value)}
                                disabled={formData.location.country === ""}
                            >
                                <option className="bg-white" value="">
                                    Select State/Province
                                </option>
                                {states.map((s, index) => (
                                    <option className="bg-white font-josefin" key={index} value={s.iso2}>
                                        {s.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                                City
                            </label>
                            <select
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors disabled:text-gray-300"
                                value={selectedCity}
                                disabled={cities.length === 0 || formData.location.country === "" || formData.location.state === ""}
                                onChange={(e) => handleCityChange(e.target.value)}
                            >
                                <option className="bg-white" value="">
                                    Select City
                                </option>
                                {cities.map((c, index) => (
                                    <option className="bg-white font-josefin" key={index} value={c.iso2}>
                                        {c.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            </StepContainer>

            <StepContainer
                className="flex flex-col items-center w-full md:w-[80%] pb-10 px-2 md:px-0"
                title="Disease History"
                titleClassName="text-xl md:text-2xl font-bold"
            >
                <EditableList
                    variant="history"
                    items={formData.histories.diseases || []}
                    onAdd={(item) => setFormData(prev => ({
                        ...prev,
                        histories: {
                            ...prev.histories,
                            diseases: [...(prev.histories.diseases || []), item]
                        }
                    }))}
                    onUpdate={(index, newValue) => setFormData(prev => ({
                        ...prev,
                        histories: {
                            ...prev.histories,
                            diseases: (prev.histories.diseases || []).map((hst, idx) =>
                                idx === index ? newValue : hst)
                        }
                    }))}
                    onDelete={(index) => setFormData(prev => ({
                        ...prev,
                        histories: {
                            ...prev.histories,
                            diseases: (prev.histories.diseases || []).filter((_, idx) => idx !== index)
                        }
                    }))}
                    placeholder="Enter disease"
                    addButtonText="Add Disease"
                    emptyStateTitle="No disease history added yet"
                    emptyStateSubtitle="Click the button below to add your first entry"
                    showConfirmDelete={true}
                />
            </StepContainer>

            <StepContainer
                className="flex flex-col items-center w-full md:w-[80%] pb-10 px-2 md:px-0"
                title="Allergy History"
                titleClassName="text-xl md:text-2xl font-bold"
            >
                <EditableList
                    variant="history"
                    items={formData.histories.allergies || []}
                    onAdd={(item) => setFormData(prev => ({
                        ...prev,
                        histories: {
                            ...prev.histories,
                            allergies: [...(prev.histories.allergies || []), item]
                        }
                    }))}
                    onUpdate={(index, newValue) => setFormData(prev => ({
                        ...prev,
                        histories: {
                            ...prev.histories,
                            allergies: (prev.histories.allergies || []).map((hst, idx) =>
                                idx === index ? newValue : hst)
                        }
                    }))}
                    onDelete={(index) => setFormData(prev => ({
                        ...prev,
                        histories: {
                            ...prev.histories,
                            allergies: (prev.histories.allergies || []).filter((_, idx) => idx !== index)
                        }
                    }))}
                    placeholder="Enter allergy"
                    addButtonText="Add Allergy"
                    emptyStateTitle="No allergy history added yet"
                    emptyStateSubtitle="Click the button below to add your first entry"
                    showConfirmDelete={true}
                />
            </StepContainer>

            <button
                type="submit"
                disabled={!formData.age || !formData.gender}
                className={`cursor-pointer w-full md:w-[80%] text-xl font-bold py-3 px-4 rounded-lg transition
                    ${formData.age && formData.gender
                        ? "bg-blue-500 text-white cursor-pointer hover:bg-blue-600 hover:scale-105 shadow-lg hover:shadow-xl"
                        : "bg-gray-400 text-white !cursor-not-allowed"
                    }`}
                onClick={onNext}
            >
                Next
            </button>
        </div>
    );
};

export default Step1;