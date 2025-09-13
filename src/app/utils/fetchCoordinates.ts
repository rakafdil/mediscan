export const fetchCoordinates = async (query: string) => {
    try {
        const res = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`
        );
        const data = await res.json();

        if (data.length > 0) {
            return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
        }
        return null;
    } catch (err) {
        console.error("Error fetching coordinates:", err);
        return null;
    }
};
