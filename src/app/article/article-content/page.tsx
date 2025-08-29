"use client";

import { useState } from "react";

interface SearchResult {
    id: string;
    judul: string;
    isi: string;
    link: string;
    source: string;
}

export default function SearchPage() {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<SearchResult[]>([]);
    const [loading, setLoading] = useState(false);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;

    const handleSearch = async () => {
        if (!query.trim()) return;
        setLoading(true);
        setCurrentPage(1);

        try {
            const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
            const data = await res.json();
            setResults(data);
        } catch (err) {
            console.error("Search failed:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            handleSearch();
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
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Masukkan kata kunci..."
                        className="flex-grow border border-gray-300 rounded-lg px-4 py-2 max-w-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <button
                        onClick={handleSearch}
                        disabled={loading}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
                    >
                        {loading ? "Mencari..." : "Cari"}
                    </button>
                </div>

                {/* Results */}
                {loading && (
                    <p className="text-center text-gray-500">Sedang mencari...</p>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {currentResults.map((r) => (
                        <div
                            key={r.id}
                            className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition bg-white"
                        >
                            <div className="h-40 bg-gray-200 rounded mb-3"></div>
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

                {!loading && results.length === 0 && query && (
                    <p className="text-center text-gray-500 mt-8">
                        Tidak ada hasil untuk <span className="font-medium">{query}</span>.
                    </p>
                )}

                {!loading && !query && (
                    <p className="text-center text-gray-400 mt-8">
                        Masukkan kata kunci untuk memulai pencarian
                    </p>
                )}
            </div>
        </div>
    );
}
