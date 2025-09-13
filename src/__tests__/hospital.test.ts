import { expect, test, vi, beforeEach, afterEach } from "vitest";
import { GET } from "../app/api/hospitals/route";
import { NextResponse } from "next/server";

beforeEach(() => {
    vi.resetAllMocks();
});

afterEach(() => {
    vi.restoreAllMocks();
    globalThis.fetch = fetch;
});

test("GET should return error if lat/lng missing", async () => {
    const req = new Request("http://localhost/api/hospitals?kota=Jakarta");
    const res = (await GET(req)) as NextResponse;

    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json).toEqual({
        success: false,
        error: "Latitude dan longitude diperlukan",
    });
});

test("GET should return error if lat/lng invalid number", async () => {
    const req = new Request("http://localhost/api/hospitals?lat=abc&lng=def");
    const res = (await GET(req)) as NextResponse;

    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json).toEqual({
        success: false,
        error: "Latitude dan longitude harus berupa angka yang valid",
    });
});

test("GET should return hospitals from mocked Overpass API", async () => {
    // mock fetch response dari Overpass API
    global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
            elements: [
                {
                    type: "node",
                    id: 1,
                    lat: -6.2,
                    lon: 106.8,
                    tags: {
                        name: "RS Testing",
                        amenity: "hospital",
                        "addr:street": "Jalan Testing",
                        "addr:city": "Jakarta",
                    },
                },
            ],
        }),
    }) as any;

    const req = new Request(
        "http://localhost/api/hospitals?lat=-6.2&lng=106.8&kota=Jakarta&useRealLocation=true"
    );
    const res = (await GET(req)) as NextResponse;

    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.total).toBe(1);
    expect(json.data[0]).toMatchObject({
        name: "RS Testing",
        hospitalType: "Rumah Sakit",
        address: expect.stringContaining("Jalan Testing"),
    });
});

test("GET should return empty data if Overpass API returns empty elements", async () => {
    global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ elements: [] }),
    }) as any;

    const req = new Request(
        "http://localhost/api/hospitals?lat=-6.2&lng=106.8&kota=Jakarta"
    );
    const res = (await GET(req)) as NextResponse;

    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.total).toBe(0);
    expect(json.data).toEqual([]);
});