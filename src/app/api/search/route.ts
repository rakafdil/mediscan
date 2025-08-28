import { NextResponse } from "next/server";

interface SearchResult {
    id: string;
    judul: string;
    isi: string;
    link: string;
    source: string;
}

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const keyword = searchParams.get("q") || "";

    if (!keyword) {
        return NextResponse.json([], { status: 200 });
    }

    try {
        const results = await searchWithGoogleAPI(keyword);
        return NextResponse.json(results);
    } catch (error) {
        console.error("Search error:", error);
        return NextResponse.json([], { status: 200 });
    }
}

async function searchWithGoogleAPI(keyword: string): Promise<SearchResult[]> {
    const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
    const GOOGLE_CSE_ID = process.env.GOOGLE_CSE_ID;

    if (!GOOGLE_API_KEY || !GOOGLE_CSE_ID) {
        throw new Error("Google API credentials not configured");
    }

    const res = await fetch(
        `https://www.googleapis.com/customsearch/v1?key=${GOOGLE_API_KEY}&cx=${GOOGLE_CSE_ID}&q=${encodeURIComponent(
            keyword
        )}&num=5`
    );

    if (!res.ok) {
        throw new Error(`Google API returned status: ${res.status}`);
    }

    const data = await res.json();

    return (
        data.items?.map((item: any, index: number) => ({
            id: `google-api-${index}-${Date.now()}`,
            judul: item.title || "No title",
            isi: item.snippet || "No description",
            link: item.link,
            source: "google-api",
        })) || []
    );
}
