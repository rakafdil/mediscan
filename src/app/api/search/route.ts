import { NextResponse } from "next/server";

interface SearchResult {
    id: string;
    judul: string;
    isi: string;
    link: string;
    source: string;
    image?: string; // optional
}

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const keyword = searchParams.get("q") || "";

    if (!keyword) {
        return NextResponse.json([], { status: 200 });
    }

    try {
        const results = await searchWithWikipedia(keyword);
        return NextResponse.json(results);
    } catch (error) {
        console.error("Search error:", error);
        return NextResponse.json([], { status: 200 });
    }
}

async function searchWithWikipedia(keyword: string): Promise<SearchResult[]> {
    // Tambahkan kata kunci health secara paksa pada query agar hasil relevan
    const healthQuery = `${keyword} AND (health OR medicine OR medical OR treatment OR hospital)`;

    const searchRes = await fetch(
        `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(
            healthQuery
        )}&format=json&origin=*`
    );
    if (!searchRes.ok) throw new Error(`Wikipedia search returned status: ${searchRes.status}`);
    const searchData = await searchRes.json();

    const results: SearchResult[] = [];

    const pageIds = searchData.query.search.map((item: any) => item.pageid).join("|");
    if (!pageIds) return [];

    // Ambil gambar thumbnail
    const imageRes = await fetch(
        `https://en.wikipedia.org/w/api.php?action=query&pageids=${pageIds}&prop=pageimages&piprop=thumbnail&pithumbsize=300&format=json&origin=*`
    );
    if (!imageRes.ok) throw new Error(`Wikipedia images returned status: ${imageRes.status}`);
    const imageData = await imageRes.json();

    const healthKeywords = [
        "health", "medicine", "medical", "wellness", "care", "clinic", "hospital", "doctor", "nurse",
        "disease", "infection", "virus", "bacteria", "cancer", "diabetes", "stroke", "obesity", "asthma",
        "allergy", "cardiovascular", "respiratory", "mental health", "depression", "anxiety",
        "neurology", "psychiatry", "treatment", "surgery", "therapy", "rehabilitation", "vaccine"
    ];

    for (const [index, item] of searchData.query.search.entries()) {
        const page = imageData.query.pages[item.pageid];

        const textToCheck = (item.title + " " + item.snippet).toLowerCase();
        const isHealthRelated = healthKeywords.some((kw) => textToCheck.includes(kw));

        if (!isHealthRelated) continue; // skip jika bukan kesehatan

        results.push({
            id: `wikipedia-${index}-${Date.now()}`,
            judul: item.title,
            isi: item.snippet.replace(/<\/?[^>]+(>|$)/g, ""),
            link: `https://en.wikipedia.org/wiki/${encodeURIComponent(item.title)}`,
            source: "Wikipedia",
            image: page?.thumbnail?.source,
        });
    }

    return results;
}
