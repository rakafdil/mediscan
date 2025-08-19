import { NextResponse } from "next/server";
import * as cheerio from "cheerio";

// Type definitions untuk Cheerio
type CheerioAPI = ReturnType<typeof cheerio.load>;

interface SearchResult {
    id: string;
    judul: string;
    isi: string;
    source: string;
    link?: string;
}

interface SearchEngine {
    name: string;
    url: string;
    parser: (html: string) => SearchResult[];
}

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const keyword = searchParams.get("q") || "";

    if (!keyword) {
        return NextResponse.json({ error: "Query parameter required" }, { status: 400 });
    }

    try {
        // Coba Google API dulu
        const apiResults = await searchWithGoogleAPI(keyword);
        if (apiResults.length > 0) {
            return NextResponse.json(apiResults);
        }

        // Fallback ke scraping
        const scrapingResults = await searchWithScraping(keyword);
        return NextResponse.json(scrapingResults);

    } catch (error) {
        console.error('Search error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        return NextResponse.json({
            error: "Failed to fetch results",
            message: errorMessage
        }, { status: 500 });
    }
}

async function searchWithGoogleAPI(keyword: string): Promise<SearchResult[]> {
    try {
        const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
        const GOOGLE_CSE_ID = process.env.GOOGLE_CSE_ID;

        if (!GOOGLE_API_KEY || !GOOGLE_CSE_ID) {
            console.warn('Google API credentials not configured');
            return [];
        }

        const res = await fetch(
            `https://www.googleapis.com/customsearch/v1?key=${GOOGLE_API_KEY}&cx=${GOOGLE_CSE_ID}&q=${encodeURIComponent(keyword)}&num=5`
        );

        if (!res.ok) {
            throw new Error(`Google API returned status: ${res.status}`);
        }

        const data = await res.json();
        const results: SearchResult[] = data.items?.map((item: any, index: number) => ({
            id: `google-api-${index}-${Date.now()}`,
            judul: item.title || 'No title',
            isi: item.snippet || 'No description',
            link: item.link,
            source: 'google-api'
        })) || [];

        return results;

    } catch (error) {
        console.warn('Google API search failed');
        return [];
    }
}

async function searchWithScraping(keyword: string): Promise<SearchResult[]> {
    const engines: SearchEngine[] = [
        {
            name: 'brave',
            url: `https://search.brave.com/search?q=${encodeURIComponent(keyword)}`,
            parser: parseBraveResults
        },
        {
            name: 'google',
            url: `https://www.google.com/search?q=${encodeURIComponent(keyword)}`,
            parser: parseGoogleResults
        }
    ];

    for (const engine of engines) {
        try {
            const results = await tryScrapeEngine(engine, keyword);
            if (results.length > 0) {
                return results;
            }
        } catch (error) {
            console.warn(`${engine.name} scrape failed`);
            continue;
        }
    }

    return getMockResults(keyword);
}

async function tryScrapeEngine(engine: SearchEngine, keyword: string): Promise<SearchResult[]> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    try {
        const res = await fetch(engine.url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9',
                'Referer': 'https://www.google.com/'
            },
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!res.ok) {
            throw new Error(`HTTP ${res.status}`);
        }

        const html = await res.text();

        if (html.includes('captcha') || html.includes('verification')) {
            throw new Error('Blocked by CAPTCHA');
        }

        return engine.parser(html);

    } catch (error) {
        clearTimeout(timeoutId);
        throw error;
    }
}

function parseBraveResults(html: string): SearchResult[] {
    const $ = cheerio.load(html);
    const results: SearchResult[] = [];

    // Gunakan any untuk sementara untuk menghindari type errors
    $('.snippet, .sresult').each((index: number, el: any) => {
        const title = $(el).find('.title, h3').first().text().trim();
        const desc = $(el).find('.snippet-description, .description').first().text().trim();

        if (title && desc) {
            results.push({
                id: `brave-${Math.random().toString(36).substring(2, 9)}`,
                judul: title,
                isi: desc,
                source: 'brave'
            });
        }
    });

    return results;
}

function parseGoogleResults(html: string): SearchResult[] {
    const $ = cheerio.load(html);
    const results: SearchResult[] = [];

    // Gunakan any untuk element parameter
    $('.g, .tF2Cxc').each((index: number, el: any) => {
        const title = $(el).find('h3, .LC20lb').first().text().trim();
        const desc = $(el).find('.VwiC3b, .MUxGbd').first().text().trim();

        if (title && desc) {
            results.push({
                id: `google-${Math.random().toString(36).substring(2, 9)}`,
                judul: title,
                isi: desc,
                source: 'google'
            });
        }
    });

    return results;
}

function getMockResults(keyword: string): SearchResult[] {
    const mockData: SearchResult[] = [
        {
            id: "mock-1",
            judul: "Cara Mengatasi Demam Tinggi pada Anak",
            isi: "Demam tinggi pada anak dapat diatasi dengan kompres air hangat, pemberian parasetamol sesuai dosis, dan menjaga asupan cairan. Pantau suhu tubuh setiap 4 jam.",
            source: 'mock'
        },
        {
            id: "mock-2",
            judul: "Gejala Alergi Makanan dan Penanganannya",
            isi: "Alergi makanan ditandai dengan gatal-gatal, bengkak pada bibir, dan gangguan pencernaan. Hindari makanan pemicu dan konsultasi ke dokter untuk tes alergi.",
            source: 'mock'
        }
    ];

    if (!keyword.trim()) return mockData;

    const searchTerm = keyword.toLowerCase();
    return mockData.filter(item =>
        item.judul.toLowerCase().includes(searchTerm) ||
        item.isi.toLowerCase().includes(searchTerm)
    );
}