"use client";

import { useState } from "react";

interface SearchResult {
    id: string;
    judul: string;
    isi: string;
    link: string;
    source: string;
    image?: string;
}

interface SearchResponse {
    results: SearchResult[];
    total: number;
    keyword: string;
}

interface SearchError {
    error: string;
    details?: string;
}

export default function SearchPage() {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<SearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;

    const handleSearch = async () => {
        const trimmedQuery = query.trim();
        if (!trimmedQuery) {
            setError("Harap masukkan kata kunci pencarian");
            return;
        }

        // Validate query length
        if (trimmedQuery.length > 200) {
            setError("Kata kunci terlalu panjang (maksimal 200 karakter)");
            return;
        }

        setLoading(true);
        setCurrentPage(1);
        setError(null);

        try {
            const res = await fetch(`/api/search?q=${encodeURIComponent(trimmedQuery)}`);
            
            if (!res.ok) {
                const errorData: SearchError = await res.json();
                throw new Error(errorData.error || `HTTP error! status: ${res.status}`);
            }

            const data: SearchResponse = await res.json();
            
            // Handle the new API response structure
            if (data.results && Array.isArray(data.results)) {
                setResults(data.results);
                setError(null);
            } else {
                // Fallback for old API structure (if data is directly an array)
                const resultArray = Array.isArray(data) ? data : [];
                setResults(resultArray);
                setError(null);
            }

        } catch (err) {
            console.error("Search failed:", err);
            const errorMessage = err instanceof Error ? err.message : "Terjadi kesalahan saat mencari";
            setError(errorMessage);
            setResults([]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            handleSearch();
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setQuery(e.target.value);
        // Clear error when user starts typing
        if (error) {
            setError(null);
        }
    };

    // Pagination logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentResults = results.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(results.length / itemsPerPage);

    return (
        <div className="min-h-screen text-gray-800 p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <header className="text-center mb-8 font-montserrat">
                    <h1 className="text-3xl font-bold text-gray-900">Search</h1>
                </header>

                {/* Search Input */}
                <div className="flex gap-2 mb-6 justify-center">
                    <input
                        type="text"
                        value={query}
                        onChange={handleInputChange}
                        onKeyPress={handleKeyPress}
                        placeholder="Masukkan kata kunci..."
                        className="flex-grow border border-gray-300 rounded-lg px-4 py-2 max-w-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                        maxLength={200}
                    />
                    <button
                        onClick={handleSearch}
                        disabled={loading || !query.trim()}
                        className="bg-[#6B8FC4] hover:bg-[#217BFF] text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? "Searching.." : "Search"}
                    </button>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-700 text-center">{error}</p>
                    </div>
                )}

                {/* Results */}
                {loading && (
                    <p className="text-center text-gray-500">Searching...</p>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {currentResults.map((r) => (
                        <div
                            key={r.id}
                            className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition bg-white"
                        >
                            <img
                                src={r.image || "https://nbhc.ca/sites/default/files/styles/article/public/default_images/news-default-image%402x_0.png?itok=B4jML1jF"}
                                alt={r.judul}
                                className="w-full h-40 object-cover rounded mb-3"
                                onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.src = "https://nbhc.ca/sites/default/files/styles/article/public/default_images/news-default-image%402x_0.png?itok=B4jML1jF";
                                }}
                            />
                            <a
                                href={r.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block mb-1"
                            >
                                <h2 className="text-base font-semibold text-blue-700 hover:underline line-clamp-2">
                                    {r.judul}
                                </h2>
                            </a>
                            <p className="text-sm text-gray-700 mb-2 line-clamp-3">
                                {r.isi}
                            </p>
                            <div className="flex justify-between text-xs text-gray-500">
                                <span>{r.source}</span>
                                <a
                                    href={r.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:underline"
                                >
                                    Lihat sumber
                                </a>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Pagination */}
                {results.length > itemsPerPage && (
                    <div className="flex justify-center mt-6 gap-2">
                        <button
                            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                            disabled={currentPage === 1}
                            className="px-3 py-1 border rounded disabled:opacity-50"
                        >
                            &lt;
                        </button>
                        {Array.from({ length: totalPages }, (_, i) => (
                            <button
                                key={i + 1}
                                onClick={() => setCurrentPage(i + 1)}
                                className={`px-3 py-1 border rounded ${currentPage === i + 1
                                    ? "bg-blue-600 text-white"
                                    : "hover:bg-gray-100"
                                    }`}
                            >
                                {i + 1}
                            </button>
                        ))}
                        <button
                            onClick={() =>
                                setCurrentPage((p) => Math.min(p + 1, totalPages))
                            }
                            disabled={currentPage === totalPages}
                            className="px-3 py-1 border rounded disabled:opacity-50"
                        >
                            &gt;
                        </button>
                    </div>
                )}

                {results.length === 0 && query && !loading && !error && (
                    <p className="text-center text-gray-500 mt-8">
                        Tidak ada hasil untuk <span className="font-medium">{query}</span>.
                    </p>
                )}

                {!loading && !query && !error && (
                    <p className="text-center text-gray-400 mt-8">
                        Masukkan kata kunci untuk memulai pencarian
                    </p>
                )}
            </div>
        </div>
    );
}