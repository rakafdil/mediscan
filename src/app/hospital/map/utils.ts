// Types
export interface Hospital {
    id: string;
    place_id: string;
    name: string;
    address: string;
    distance: string;
    rating: number;
    capacity: string;
    availability?: {
        status: 'high' | 'medium' | 'low' | 'full';
        percentage: number;
    };
    lat: number;
    lng: number;
}

export interface LocationData {
    name: string;
    lat: number;
    lng: number;
}

export interface AppState {
    centerLat: number | null;
    centerLng: number | null;
    currentRadius: number;
    selectedLocation: string;
    hospitals: Hospital[];
    loading: boolean;
    error: string | null;
    showLocationSelector: boolean;
    stats: {
        total_hospitals: number;
        average_rating: number;
        total_available_beds: number;
        occupancy_rate: number;
    } | null;
}

// Constants
export const CONFIG = {
    DEFAULT_RADIUS: 10,
    DEFAULT_ZOOM: 13,
    USER_ZOOM: 14,
    API_ENDPOINTS: {
        NEARBY_HOSPITALS: '/api/rumah-sakit/nearby',
        HOSPITAL_STATS: '/api/rumah-sakit/stats'
    }
};

export const LOCATION_DATA: Record<string, LocationData> = {
    jawa_barat: { name: "Jawa Barat", lat: -6.9147, lng: 107.6098 },
    jawa_tengah: { name: "Jawa Tengah", lat: -7.0051, lng: 110.4381 },
    jawa_timur: { name: "Jawa Timur", lat: -7.2575, lng: 112.7521 },
    dki_jakarta: { name: "DKI Jakarta", lat: -6.2088, lng: 106.8456 },
    di_yogyakarta: { name: "DI Yogyakarta", lat: -7.7971, lng: 110.3688 }
};

export const dataKabupaten: Record<string, LocationData[]> = {
    jawa_barat: [
        { name: 'Bandung', lat: -6.90389, lng: 107.61861 },
        { name: 'Bekasi', lat: -6.2349, lng: 106.9896 },
        { name: 'Bogor', lat: -6.595, lng: 106.8166 },
        { name: 'Cianjur', lat: -6.8222, lng: 107.1424 },
        { name: 'Cirebon', lat: -6.732, lng: 108.552 }
    ],
    jawa_tengah: [
        { name: 'Semarang', lat: -6.9667, lng: 110.4167 },
        { name: 'Solo', lat: -7.5667, lng: 110.8167 },
        { name: 'Magelang', lat: -7.4818, lng: 110.2177 },
        { name: 'Pekalongan', lat: -6.8833, lng: 109.667 },
        { name: 'Tegal', lat: -6.869, lng: 109.1256 }
    ],
    jawa_timur: [
        { name: 'Surabaya', lat: -7.25, lng: 112.75 },
        { name: 'Malang', lat: -7.9819, lng: 112.6265 },
        { name: 'Sidoarjo', lat: -7.45, lng: 112.717 },
        { name: 'Kediri', lat: -7.8166, lng: 112.0111 },
        { name: 'Jember', lat: -8.1737, lng: 113.7004 }
    ],
    dki_jakarta: [
        { name: 'Jakarta Pusat', lat: -6.1865, lng: 106.8341 },
        { name: 'Jakarta Barat', lat: -6.1683, lng: 106.7589 },
        { name: 'Jakarta Timur', lat: -6.2251, lng: 106.9004 },
        { name: 'Jakarta Selatan', lat: -6.2666, lng: 106.8133 },
        { name: 'Jakarta Utara', lat: -6.138, lng: 106.8827 }
    ],
    di_yogyakarta: [
        { name: 'Sleman', lat: -7.7167, lng: 110.3667 },
        { name: 'Bantul', lat: -7.8886, lng: 110.3282 },
        { name: 'Gunung Kidul', lat: -7.9949, lng: 110.6177 },
        { name: 'Kulon Progo', lat: -7.8244, lng: 110.1644 },
        { name: 'Yogyakarta Kota', lat: -7.8014, lng: 110.3649 }
    ]
};

export const dataKota: Record<string, Record<string, LocationData[]>> = {
    'jawa_barat': {
        'Bandung': [
            { name: 'Bandung Kota', lat: -6.9147, lng: 107.6098 },
            { name: 'Cimahi', lat: -6.8728, lng: 107.5429 },
            { name: 'Lembang', lat: -6.8181, lng: 107.6155 }
        ],
        'Bekasi': [
            { name: 'Bekasi Kota', lat: -6.2383, lng: 106.9756 },
            { name: 'Cikarang', lat: -6.3066, lng: 107.1722 },
            { name: 'Tambun', lat: -6.2574, lng: 107.0505 }
        ],
        'Bogor': [
            { name: 'Bogor Kota', lat: -6.595, lng: 106.8166 },
            { name: 'Cibinong', lat: -6.4859, lng: 106.8543 },
            { name: 'Cisarua', lat: -6.6705, lng: 106.9328 }
        ]
    },
    'jawa_tengah': {
        'Semarang': [
            { name: 'Semarang Kota', lat: -6.9667, lng: 110.4167 },
            { name: 'Ungaran', lat: -7.1397, lng: 110.4066 },
            { name: 'Ambarawa', lat: -7.2603, lng: 110.4031 }
        ],
        'Solo': [
            { name: 'Solo Kota', lat: -7.5667, lng: 110.8167 },
            { name: 'Laweyan', lat: -7.5691, lng: 110.7969 },
            { name: 'Banjarsari', lat: -7.5587, lng: 110.8221 }
        ]
    },
    'jawa_timur': {
        'Surabaya': [
            { name: 'Surabaya Pusat', lat: -7.2575, lng: 112.7521 },
            { name: 'Surabaya Timur', lat: -7.275, lng: 112.787 },
            { name: 'Surabaya Selatan', lat: -7.321, lng: 112.730 }
        ],
        'Malang': [
            { name: 'Malang Kota', lat: -7.9819, lng: 112.6265 },
            { name: 'Kepanjen', lat: -8.1317, lng: 112.5666 },
            { name: 'Turen', lat: -8.1762, lng: 112.7086 }
        ]
    }
};

// Utility functions
export const getAvailabilityInfo = (availability?: Hospital['availability']) => {
    if (!availability) {
        return { class: 'bg-gray-400', color: '#95a5a6', text: 'Tidak diketahui' };
    }

    const statusMap = {
        high: { class: 'bg-green-500', color: '#27ae60', text: `Tersedia (${availability.percentage}%)` },
        medium: { class: 'bg-yellow-500', color: '#f39c12', text: `Terbatas (${availability.percentage}%)` },
        low: { class: 'bg-orange-500', color: '#e67e22', text: `Sedikit (${availability.percentage}%)` },
        full: { class: 'bg-red-500', color: '#e74c3c', text: 'Penuh (0%)' }
    };

    return statusMap[availability.status] || { class: 'bg-gray-400', color: '#95a5a6', text: 'Tidak diketahui' };
};

export const formatDistance = (distance: string | number): string => {
    return parseFloat(distance.toString()).toFixed(1);
};