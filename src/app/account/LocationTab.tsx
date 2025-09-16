import { useState, useEffect } from "react";
import { CompleteProfile } from "./types"

interface LocationTabProps {
    profile: CompleteProfile
    updateField: (field: keyof CompleteProfile, value: string | number | null) => void
}

const LocationTab: React.FC<LocationTabProps> = ({ profile, updateField }) => {
    const [countries, setCountries] = useState<{ name: string; iso2: string }[]>([]);
    const [states, setStates] = useState<{ name: string; iso2: string }[]>([]);
    const [cities, setCities] = useState<{ name: string; iso2: string }[]>([]);

    // Initialize state from profile data
    const [selectedCountry, setSelectedCountry] = useState(profile.country || '');
    const [selectedState, setSelectedState] = useState(profile.state || '');
    const [selectedCity, setSelectedCity] = useState(profile.city || '');

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
        if (profile.country) {
            setSelectedCountry(profile.country);
        }
        if (profile.state) {
            setSelectedState(profile.state);
        }
        if (profile.city) {
            setSelectedCity(profile.city);
        }
    }, [profile]);

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
        updateField('country', value || '');
    };

    const handleStateChange = (value: string) => {
        setSelectedState(value);
        updateField('state', value || '');
    };

    const handleCityChange = (value: string) => {
        setSelectedCity(value);
        updateField('city', value || '');
    };

    return (
        <div className="space-y-6">
            <div>
                <label htmlFor="street" className="block text-sm font-medium text-gray-700 mb-2">
                    Street Address
                </label>
                <textarea
                    id="street"
                    rows={3}
                    value={profile.street || ''}
                    onChange={(e) => updateField('street', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none"
                    placeholder="Enter your street address"
                />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
                <div>
                    <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-2">
                        Country
                    </label>
                    <select
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        value={selectedCountry}
                        onChange={(e) => handleCountryChange(e.target.value)}
                    >
                        <option className="bg-white" value="">
                            Select Country
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
                        value={selectedState}
                        disabled={states.length === 0}
                        onChange={(e) => handleStateChange(e.target.value)}
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
    )
}

export default LocationTab;