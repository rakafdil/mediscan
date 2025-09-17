"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/app/utils/supabase/client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-regular-svg-icons";

export default function ResetPasswordPage() {
    const supabase = createClient();
    const [showPassword, setShowPassword] = useState(false);
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");

    useEffect(() => {
        const { data: authListener } = supabase.auth.onAuthStateChange(
            async (event) => {
                if (event === "PASSWORD_RECOVERY") {
                    // You can handle something here if needed
                }
            }
        );

        return () => {
            authListener?.subscription.unsubscribe();
        };
    }, [supabase]);

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        const { data, error } = await supabase.auth.updateUser({ password });

        if (error) {
            setMessage(error.message);
        } else {
            await supabase.auth.signOut();
            setMessage("Password updated successfully. Please log in again");
            Promise.resolve().then(() => window.location.href = '/login')
        }
    };


    return (
        <div className="flex flex-col items-center justify-center min-h-screen px-6">
            <h1 className="text-2xl font-bold mb-6">Reset Your Password</h1>
            <form onSubmit={handleUpdate} className="relative flex flex-col gap-4 w-full max-w-sm">
                <div className="relative w-full">
                    <input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        required
                        className="block w-full pl-4 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                        placeholder="Enter your new password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors duration-200"
                        tabIndex={-1}
                    >
                        <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                    </button>
                </div>
                <button
                    type="submit"
                    className="bg-green-600 hover:bg-green-700 text-white py-2 rounded"
                >
                    Update Password
                </button>
            </form>
            {message && <p className="mt-4 text-sm text-gray-700">{message}</p>}
        </div>
    );
}