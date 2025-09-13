// app/map/data/locationCoordinates.ts

export interface LocationCoordinates {
    [key: string]: {
        lat: number;
        lng: number;
    };
}

export const locationCoordinates: LocationCoordinates = {
    // Jawa Barat
    'Bandung Kota': { lat: -6.9175, lng: 107.6191 },
    'Cimahi': { lat: -6.8722, lng: 107.5420 },
    'Lembang': { lat: -6.8112, lng: 107.6162 },
    'Bekasi Kota': { lat: -6.2383, lng: 106.9756 },
    'Cikarang': { lat: -6.2614, lng: 107.1533 },
    'Tambun': { lat: -6.2643, lng: 107.0640 },
    'Bogor Kota': { lat: -6.5971, lng: 106.8060 },
    'Cibinong': { lat: -6.4818, lng: 106.8540 },
    'Cisarua': { lat: -6.6974, lng: 106.9537 },

    // Jawa Tengah
    'Semarang Kota': { lat: -6.9667, lng: 110.4167 },
    'Ungaran': { lat: -7.1397, lng: 110.4058 },
    'Ambarawa': { lat: -7.2651, lng: 110.4042 },
    'Solo Kota': { lat: -7.5697, lng: 110.8281 },
    'Laweyan': { lat: -7.5563, lng: 110.8008 },
    'Banjarsari': { lat: -7.5488, lng: 110.8317 },

    // Jawa Timur
    'Surabaya Pusat': { lat: -7.2459, lng: 112.7378 },
    'Surabaya Timur': { lat: -7.3297, lng: 112.8014 },
    'Surabaya Selatan': { lat: -7.3191, lng: 112.7278 },
    'Malang Kota': { lat: -7.9797, lng: 112.6304 },
    'Kepanjen': { lat: -8.1301, lng: 112.5728 },
    'Turen': { lat: -8.1687, lng: 112.7055 },

    // DKI Jakarta
    'Menteng': { lat: -6.1944, lng: 106.8229 },
    'Tanah Abang': { lat: -6.1867, lng: 106.8130 },
    'Kemayoran': { lat: -6.1678, lng: 106.8456 },
    'Grogol': { lat: -6.1617, lng: 106.7897 },
    'Kalideres': { lat: -6.1378, lng: 106.7008 },
    'Cengkareng': { lat: -6.1378, lng: 106.7361 },
    'Kebayoran Baru': { lat: -6.2297, lng: 106.7975 },
    'Pasar Minggu': { lat: -6.2854, lng: 106.8419 },
    'Tebet': { lat: -6.2297, lng: 106.8608 },

    // DI Yogyakarta
    'Depok': { lat: -7.7628, lng: 110.4317 },
    'Ngaglik': { lat: -7.7375, lng: 110.3653 },
    'Mlati': { lat: -7.7297, lng: 110.3650 },
    'Bantul Kota': { lat: -7.8753, lng: 110.3392 },
    'Pundong': { lat: -7.9344, lng: 110.3406 },
    'Srandakan': { lat: -7.9397, lng: 110.2503 },
    'Gondokusuman': { lat: -7.7828, lng: 110.3667 },
    'Jetis': { lat: -7.7956, lng: 110.3592 },
    'Danurejan': { lat: -7.8017, lng: 110.3658 },
};