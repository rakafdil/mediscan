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
        setCoordinates()
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
        setCoordinates()
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
        setCoordinates()
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
        <div className='flex flex-col items-center pb-20'>
            <StepContainer
                className='flex flex-col items-center max-w-7xl w-[80%]'
            >
                <div className="flex flex-col md:flex-col items-center justify-center pb-20 gap-10 w-full">

                    <div className="flex flex-row md:gap-20">
                        <div className='flex flex-col items-center w-full md:w-70'>
                            <label htmlFor="age" className="font-bold text-xl md:text-2xl text-gray-800 mb-4">
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
                                className="w-full md:w-56 h-14 md:h-16 px-4 md:px-6 text-lg md:text-2xl border-2 border-gray-400 rounded-lg focus:outline-none focus:border-blue-500"
                            />
                        </div>

                        <div className="flex flex-col items-center w-full md:w-70">
                            <label className="font-bold text-xl md:text-2xl text-gray-800 mb-4">
                                Gender
                            </label>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center w-full">
                                {/* Male */}
                                <div className='flex-1'>
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
                                        className="px-6 py-3 w-full h-14 md:h-16 border-2 font-medium text-lg md:text-2xl border-gray-400 text-gray-600 rounded-lg cursor-pointer
                                      peer-checked/male:bg-blue-500 peer-checked/male:border-blue-500
                                      peer-checked/male:text-white transition flex items-center justify-center hover:bg-blue-200"
                                    >
                                        Male
                                    </label>
                                </div>
                                {/* Female */}
                                <div className='flex-1'>
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
                                        className="px-6 py-3 w-full h-14 md:h-16 border-2 font-medium text-lg md:text-2xl border-gray-400 text-gray-600 rounded-lg cursor-pointer
                                      peer-checked/female:bg-blue-500 peer-checked/female:border-blue-500
                                      peer-checked/female:text-white transition flex items-center justify-center hover:bg-blue-200"
                                    >
                                        Female
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-row md:gap-20">
                        <div className='flex flex-col items-center w-full md:w-70'>
                            <label htmlFor="weight" className="font-bold text-xl md:text-2xl text-gray-800 mb-4">
                                Weight
                            </label>
                            <div className="flex items-center gap-3">
                                <input
                                    type="number"
                                    id="weight"
                                    name="weight"
                                    required={true}
                                    value={formData.weight}
                                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                                    min={0}
                                    placeholder="Insert here"
                                    className="w-full md:w-56 h-14 md:h-16 px-4 md:px-6 text-lg md:text-2xl border-2 border-gray-400 rounded-lg focus:outline-none focus:border-blue-500"
                                />
                                <span className='font-bold text-xl md:text-2xl text-gray-800'>kg</span>
                            </div>
                        </div>
                        <div className='flex flex-col items-center w-full md:w-70'>
                            <label htmlFor="height" className="font-bold text-xl md:text-2xl text-gray-800 mb-4">
                                Height
                            </label>
                            <div className="flex items-center gap-3">
                                <input
                                    type="number"
                                    id="height"
                                    name="height"
                                    required={true}
                                    value={formData.height}
                                    onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                                    min={0}
                                    placeholder="Insert here"
                                    className="w-full md:w-56 h-14 md:h-16 px-4 md:px-6 text-lg md:text-2xl border-2 border-gray-400 rounded-lg focus:outline-none focus:border-blue-500"
                                />
                                <span className='font-bold text-xl md:text-2xl text-gray-800'>cm</span>
                            </div>
                        </div>
                    </div>
                </div>
            </StepContainer>


            <StepContainer
                className='flex flex-col items-center w-[90%] md:w-[80%] pb-10'
                title='Location'
                titleClassName='text-xl md:text-2xl font-bold'
            >
                <div className="space-y-6">
                    {/* <div>
                        <label htmlFor="street" className="block text-sm font-medium text-gray-700 mb-2">
                            Street Address
                        </label>
                        <textarea
                            id="street"
                            rows={3}
                            value={formData.location.street || ''}
                            onChange={(e) => setFormData(prev => ({
                                ...prev,
                                location: {
                                    ...prev.location,
                                    street: formData.location.street
                                }
                            }))}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none"
                            placeholder="Enter your street address"
                        />
                    </div> */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
                        <div>
                            <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-2">
                                Country
                            </label>
                            <select
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                value={formData.location.country || ''}
                                onChange={(e) => handleCountryChange(e.target.value)}
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
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                value={formData.location.state || ''}
                                onChange={(e) => handleStateChange(e.target.value)}
                            >
                                <option className="bg-white" value="">
                                    {!selectedState && "Select State/Province"}
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
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                value={selectedCity}
                                disabled={cities.length === 0}
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
                className='flex flex-col items-center w-[90%] md:w-[80%] pb-10'
                title='Disease History'
                titleClassName='text-xl md:text-2xl font-bold'
            >
                <EditableList
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
                className='flex flex-col items-center w-[90%] md:w-[80%] pb-10'
                title='Allergy History'
                titleClassName='text-xl md:text-2xl font-bold'
            >
                <EditableList
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
                className={`w-[80%] text-xl font-bold py-3 px-4 rounded-lg transition 
      ${formData.age && formData.gender
                        ? "bg-blue-500 text-white cursor-pointer hover:bg-blue-600 hover:scale-105 shadow-lg hover:shadow-xl"
                        : "bg-gray-400 text-white cursor-not-allowed"
                    }`}
                onClick={onNext}
            >
                Next
            </button>
        </div>

    );
};

export default Step1;