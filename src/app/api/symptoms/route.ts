import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const body = await req.json();
    const { umur, gender } = body;

    // Bisa pakai DB/logic lain di sini
    return NextResponse.json({
        success: true,
        message: "Data diterima!",
        data: { umur, gender },
    });
}

export async function GET() {
    return NextResponse.json({
        success: true,
        message: "Ini contoh GET dari /api/symptoms",
    });
}
