"use client";
import { useState } from "react";
import { createClient } from "@/app/utils/supabase/client";

export default function ForgotPasswordPage() {
    const supabase = createClient();
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/login/reset-password`,
        });

        if (error) {
            setMessage(error.message);
        } else {
            setMessage("Check your email for the reset link ✉️");
        }
        setLoading(false);
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen px-6">
            <h1 className="text-2xl font-bold mb-6">Forgot Password</h1>
            <form onSubmit={handleReset} className="flex flex-col gap-4 w-full max-w-sm">
                <input
                    type="email"
                    placeholder="Enter your email"
                    className="border p-2 rounded"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-700 text-white py-2 rounded"
                >
                    {loading ? "Sending..." : "Send Reset Link"}
                </button>
            </form>
            {message && <p className="mt-4 text-sm text-gray-700">{message}</p>}
        </div>
    );
}
