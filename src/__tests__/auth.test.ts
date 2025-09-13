import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextResponse } from "next/server";

const { mockSupabase, createClient } = vi.hoisted(() => {
    const mockSupabase = {
        auth: {
            exchangeCodeForSession: vi.fn(),
            verifyOtp: vi.fn(),
            getUser: vi.fn(),
            signOut: vi.fn(),
        },
    };
    return {
        mockSupabase,
        createClient: vi.fn(() => mockSupabase),
    };
});


// ganti import supaya handler pakai mock
vi.mock("@/app/utils/supabase/server", () => ({
    createClient,
}));

// import handler yang mau dites
import * as callback from "../app/api/auth/callback/route";
import * as confirm from "../app/api/auth/confirm/route";
import * as signout from "../app/api/auth/signout/route";

describe("Auth Routes", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    // === CALLBACK TESTS ===
    describe("callback.ts", () => {
        it("redirects to next path if code is valid", async () => {
            mockSupabase.auth.exchangeCodeForSession.mockResolvedValueOnce({ error: null });

            const req = new Request("http://localhost/api/auth/callback?code=123&next=/dashboard");
            const res = await callback.GET(req);

            expect(res).toBeInstanceOf(NextResponse);
            expect(res.headers.get("location")).toBe("http://localhost/dashboard");
        });

        it("redirects to error if no code or error returned", async () => {
            mockSupabase.auth.exchangeCodeForSession.mockResolvedValueOnce({ error: new Error("invalid") });

            const req = new Request("http://localhost/api/auth/callback?code=123");
            const res = await callback.GET(req);

            expect(res.headers.get("location")).toBe("http://localhost/auth/auth-code-error");
        });
    });

    // === CONFIRM TESTS ===
    describe("confirm.ts", () => {
        it("redirects to /account if token is valid", async () => {
            mockSupabase.auth.verifyOtp.mockResolvedValueOnce({ error: null });

            const req = new Request("http://localhost/api/auth/confirm?token_hash=abc&type=email");
            const res = await confirm.GET(req as any);

            expect(res.headers.get("location")).toContain("/account");
        });

        it("redirects to /error if verification fails", async () => {
            mockSupabase.auth.verifyOtp.mockResolvedValueOnce({ error: new Error("invalid") });

            const req = new Request("http://localhost/api/auth/confirm?token_hash=abc&type=email");
            const res = await confirm.GET(req as any);

            expect(res.headers.get("location")).toContain("/error");
        });
    });

    // === SIGNOUT TESTS ===
    describe("signout.ts", () => {
        it("signs out user and redirects to /login", async () => {
            mockSupabase.auth.getUser.mockResolvedValueOnce({ data: { user: { id: "123" } } });
            mockSupabase.auth.signOut.mockResolvedValueOnce({});

            const req = new Request("http://localhost/api/auth/signout", { method: "POST" });
            const res = await signout.POST(req as any);

            expect(mockSupabase.auth.signOut).toHaveBeenCalled();
            expect(res.headers.get("location")).toBe("http://localhost/login");
        });

        it("redirects to /login even if no user", async () => {
            mockSupabase.auth.getUser.mockResolvedValueOnce({ data: { user: null } });

            const req = new Request("http://localhost/api/auth/signout", { method: "POST" });
            const res = await signout.POST(req as any);

            expect(mockSupabase.auth.signOut).not.toHaveBeenCalled();
            expect(res.headers.get("location")).toBe("http://localhost/login");
        });
    });
});
