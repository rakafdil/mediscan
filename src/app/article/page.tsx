'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

interface SearchResult {
    id: string;
    judul: string;
    isi: string;
    source: string;
    link?: string;
}

export default function SearchPage() {
    const searchParams = useSearchParams();
    const query = searchParams.get('q') || '';

    const [results, setResults] = useState<SearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState(query);

    const performSearch = async (term: string) => {
        if (!term.trim()) {
            setResults([]);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`/api/search?q=${encodeURIComponent(term)}`);

            if (!response.ok) {
                throw new Error('Failed to fetch results');
            }

            const data = await response.json();
            setResults(data);
        } catch (err) {
            console.error('Search error:', err);
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (query) {
            performSearch(query);
        }
    }, [query]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchTerm.trim()) {
            // Update URL without full page reload
            window.history.pushState({}, '', `?q=${encodeURIComponent(searchTerm)}`);
            performSearch(searchTerm);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4 max-w-4xl">
                <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">Search</h1>

                {/* Search Form */}
                <form onSubmit={handleSubmit} className="mb-8 text-black">
                    <div className="flex shadow-sm rounded-md">
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Cari informasi kesehatan..."
                            className="flex-1 border border-gray-300 p-4 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-blue-600 text-white px-6 py-4 rounded-r-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                        >
                            {loading ? 'Mencari...' : 'Cari'}
                        </button>
                    </div>
                </form>

                {/* Results */}
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                )}

                {loading && (
                    <div className="flex justify-center my-8">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                )}

                {!loading && results.length > 0 && (
                    <div>
                        <h2 className="text-xl font-semibold mb-4 text-gray-700">
                            Hasil Pencarian untuk &quot;{query}&quot;
                        </h2>

                        <div className="space-y-6">
                            {results.map((result) => (
                                <div key={result.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                                    <h3 className="text-lg font-semibold text-blue-800 mb-2">{result.judul}</h3>
                                    <p className="text-black mb-3">{result.isi}</p>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-black capitalize">Sumber: {result.source}</span>
                                        {result.link && (
                                            <a
                                                href={result.link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-black hover:text-blue-800 text-sm"
                                            >
                                                Buka Link
                                            </a>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {!loading && results.length === 0 && query && (
                    <div className="text-center py-12">
                        <p className="text-black text-lg">Tidak ada hasil ditemukan untuk &quot;{query}&quot;</p>
                    </div>
                )}

                {!loading && !query && (
                    <div className="text-center py-12">
                        <p className="text-black text-lg">Masukkan kata kunci untuk mencari informasi kesehatan</p>
                    </div>
                )}
            </div>
        </div>
    );
}