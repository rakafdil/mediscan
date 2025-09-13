// app/map/components/HospitalList.tsx

import React from 'react';
import { Hospital } from '@/hooks/useHospitals';

interface HospitalListProps {
    hospitals: Hospital[];
    isLoadingHospitals: boolean;
    useRealLocation: boolean;
}

const HospitalList: React.FC<HospitalListProps> = ({
    hospitals,
    isLoadingHospitals,
    useRealLocation
}) => {
    if (isLoadingHospitals) {
        return (
            <div className="bg-white rounded-lg shadow-md p-6 mb-4">
                <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mr-3"></div>
                    <p className="text-gray-600">Searching for nearby hospitals...</p>
                </div>
            </div>
        );
    }

    if (hospitals.length === 0) {
        return (
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
                <div className="text-gray-400 text-4xl mb-4">🏥</div>
                <p className="text-gray-600 mb-2">No hospitals found</p>
                <p className="text-sm text-gray-500">Try changing the location or check your internet connection</p>
            </div>
        );
    }

    return (
        <div className="bg-[#ffffff] rounded-lg shadow-md p-4 mb-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <img
                    src="/assets/HopitalMap.png"
                    alt="Hospital"
                    style={{ width: '90px', height: '90px' }}
                />
                Hospitals Found ({hospitals.length})
                {useRealLocation && (
                    <span className="text-sm text-green-600 ml-2 flex items-center gap-1">
                        <img
                            src="/assets/Vector.png"
                            alt="Location"
                            style={{ width: '16px', height: '16px' }}
                        />
                        Based on GPS location
                    </span>
                )}
            </h3>
            <div className="grid gap-3 max-h-150 overflow-y-auto px-4">
                {hospitals.map((hospital) => (
                    <a
                        key={hospital.id}
                        href={hospital.mapsByName}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block border-l-4 border-blue-500 bg-gray-50 p-4 rounded-r hover:bg-blue-50 transition"
                    >
                        <div className="flex justify-between items-start mb-2">
                            <h4 className="font-medium text-gray-800">{hospital.name}</h4>
                            {hospital.rating && (
                                <span className="text-sm text-yellow-600 bg-yellow-50 px-2 py-1 rounded">
                                    ⭐ {hospital.rating}
                                </span>
                            )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                            📍 {hospital.address}
                        </p>
                        <div className="flex items-center justify-between flex-wrap gap-2">
                            {hospital.distance && (
                                <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                                    🚗 {hospital.distance}
                                </span>
                            )}
                            {hospital.hospitalType && (
                                <span className="text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded">
                                    🏷️ {hospital.hospitalType}
                                </span>
                            )}
                            {hospital.phone && (
                                <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                                    📞 {hospital.phone}
                                </span>
                            )}
                            {hospital.isOpen !== undefined && (
                                <span
                                    className={`text-xs px-2 py-1 rounded-full font-medium ${hospital.isOpen
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-red-100 text-red-800'
                                        }`}
                                >
                                    {hospital.isOpen ? '🟢 Buka' : '🔴 Tutup'}
                                </span>
                            )}
                        </div>
                    </a>
                ))}
            </div>
        </div>
    );
};

export default HospitalList;