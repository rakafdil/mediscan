import { NextResponse } from "next/server";

interface SearchResult {
    id: string;
    judul: string;
    isi: string;
    link: string;
    source: string;
    image?: string; // tambahkan field untuk gambar
}

interface GoogleSearchItem {
    title?: string;
    snippet?: string;
    link: string;
    pagemap?: {
        cse_image?: { src?: string }[];
        thumbnail?: { src?: string }[];
    };
}

interface GoogleSearchResponse {
    items?: GoogleSearchItem[];
    error?: {
        code: number;
        message: string;
    };
}

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const keyword = searchParams.get("q")?.trim() || "";

    if (!keyword) {
        return NextResponse.json(
            { error: "Search keyword is required" },
            { status: 400 }
        );
    }

    if (keyword.length > 200) {
        return NextResponse.json(
            { error: "Search keyword too long (max 200 characters)" },
            { status: 400 }
        );
    }

    try {
        const results = await searchWithGoogleAPI(keyword);
        return NextResponse.json({
            results,
            total: results.length,
            keyword,
        });
    } catch (error) {
        console.error("Search error:", error);

        const errorMessage =
            error instanceof Error ? error.message : "Unknown error occurred";

        return NextResponse.json(
            { error: "Search failed", details: errorMessage },
            { status: 500 }
        );
    }
}

async function searchWithGoogleAPI(keyword: string): Promise<SearchResult[]> {
    const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
    const GOOGLE_CSE_ID = process.env.GOOGLE_CSE_ID;

    if (!GOOGLE_API_KEY || !GOOGLE_CSE_ID) {
        throw new Error(
            "Google API credentials not configured. Please set GOOGLE_API_KEY and GOOGLE_CSE_ID environment variables."
        );
    }

    const searchUrl = new URL("https://www.googleapis.com/customsearch/v1");
    searchUrl.searchParams.append("key", GOOGLE_API_KEY);
    searchUrl.searchParams.append("cx", GOOGLE_CSE_ID);
    searchUrl.searchParams.append("q", keyword);
    searchUrl.searchParams.append("num", "10");
    searchUrl.searchParams.append("safe", "active");

    try {
        const res = await fetch(searchUrl.toString(), {
            method: "GET",
            headers: {
                Accept: "application/json",
                "User-Agent": "NextJS-Search-App/1.0",
            },
            signal: AbortSignal.timeout(10000),
        });

        if (!res.ok) {
            const errorText = await res.text();
            throw new Error(`Google API error (${res.status}): ${errorText}`);
        }

        const data: GoogleSearchResponse = await res.json();

        if (data.error) {
            throw new Error(
                `Google API error: ${data.error.message} (Code: ${data.error.code})`
            );
        }

        if (!data.items || data.items.length === 0) {
            console.log(`No search results found for keyword: "${keyword}"`);
            return [];
        }

        return data.items.map((item: GoogleSearchItem, index: number) => {
            const image =
                item.pagemap?.cse_image?.[0]?.src ||
                item.pagemap?.thumbnail?.[0]?.src ||
                undefined;

            return {
                id: `google-${Date.now()}-${index}`,
                judul: item.title?.trim() || "Tidak ada judul",
                isi: item.snippet?.trim() || "Tidak ada deskripsi",
                link: item.link,
                source: "google-custom-search",
                image, // sertakan gambar kalau ada
            };
        });
    } catch (error) {
        if (error instanceof Error) {
            if (error.name === "AbortError") {
                throw new Error("Search request timeout - please try again");
            }
            if (error.message.includes("fetch")) {
                throw new Error("Network error - unable to reach Google API");
            }
        }
        throw error;
    }
}
