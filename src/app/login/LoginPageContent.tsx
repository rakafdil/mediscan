'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { login, signup } from './actions';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash, faEnvelope, faLock, faUser, faStethoscope, faExclamationTriangle, faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import Link from 'next/link';
import { createClient } from '@/app/utils/supabase/client';
import { Button } from '@/app/components/ui/button';
import { CircleAlert, LoaderCircle } from "lucide-react";

export default function LoginPageContent() {
    const [isLogin, setIsLogin] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isGoogleLoading, setIsGoogleLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const searchParams = useSearchParams();
    const next = searchParams.get("next");

    useEffect(() => {
        setError(searchParams.get('error'));
    }, [searchParams]);

    const message = searchParams.get('message');
    const success = searchParams.get('success');

    const supabase = createClient();

    const loginWithGoogle = async () => {
        setIsGoogleLoading(true);
        setError(null);

        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: "google",
                options: {
                    redirectTo: `${window.location.origin}/api/auth/callback${next ? `?next=${encodeURIComponent(next)}` : ""
                        }`,
                },
            });

            if (error) {
                throw error;
            }
        } catch (error) {
            setError("There was an error logging in with Google. Please try again.");
            console.error("Error loging in with Google:", error);
            setIsGoogleLoading(false);
        }
    };

    useEffect(() => {
        if (error || success) {
            setIsLoading(false);
        }
    }, [error, success]);

    const getErrorMessage = (error: string | null) => {
        switch (error) {
            case 'invalid_credentials':
                return 'Invalid email or password. Please try again.';
            case 'email_not_confirmed':
                return 'Please check your email and click the confirmation link.';
            case 'user_exists':
                return 'An account with this email already exists. Please sign in instead.';
            case 'password_too_short':
                return 'Password must be at least 6 characters long.';
            case 'validation':
                return message ? decodeURIComponent(message) : 'Please check your input and try again.';
            case 'auth_error':
                return 'Authentication failed. Please try again.';
            case 'unexpected_error':
                return 'An unexpected error occurred. Please try again later.';
            default:
                return null;
        }
    };

    const getSuccessMessage = (success: string | null) => {
        switch (success) {
            case 'check_email':
                return 'Please check your email for a confirmation link to complete your registration.';
            default:
                return null;
        }
    };

    const handleSubmit = async (formData: FormData) => {
        setIsLoading(true);
        console.log(isLoading);
        try {
            if (isLogin) {
                await login(formData);
                Promise.resolve().then(() => window.location.href = '/');
            } else {
                await signup(formData);
                Promise.resolve().then(() => window.location.href = '/account');
            }
        } catch (error) {
            console.error('Authentication error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 py-40">
            <div className="w-full max-w-md">

                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500 rounded-full mb-4">
                        <FontAwesomeIcon icon={faStethoscope} className="text-white text-2xl" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-800">MediScan</h1>
                    <p className="text-gray-600 mt-2">
                        {isLogin ? 'Welcome back! Please sign in to your account' : 'Create your account to get started'}
                    </p>
                </div>

                {/* Main Form Container */}
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                    {/* Tab Navigation */}
                    <div className="flex bg-gray-50 border-b border-gray-200">
                        <button
                            type="button"
                            onClick={() => setIsLogin(true)}
                            className={`flex-1 py-4 text-center font-semibold transition-all duration-300 ${isLogin
                                ? 'bg-white text-blue-600 border-b-2 border-blue-500'
                                : 'text-gray-600 hover:text-gray-800'
                                }`}
                        >
                            Sign In
                        </button>
                        <button
                            type="button"
                            onClick={() => setIsLogin(false)}
                            className={`flex-1 py-4 text-center font-semibold transition-all duration-300 ${!isLogin
                                ? 'bg-white text-blue-600 border-b-2 border-blue-500'
                                : 'text-gray-600 hover:text-gray-800'
                                }`}
                        >
                            Sign Up
                        </button>
                    </div>

                    {/* Form Content */}
                    <div className="p-8">
                        {getErrorMessage(error) && (
                            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
                                <FontAwesomeIcon icon={faExclamationTriangle} className="text-red-500" />
                                <p className="text-red-700 text-sm">{getErrorMessage(error)}</p>
                            </div>
                        )}

                        {getSuccessMessage(success) && (
                            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
                                <FontAwesomeIcon icon={faCheckCircle} className="text-green-500" />
                                <p className="text-green-700 text-sm">{getSuccessMessage(success)}</p>
                            </div>
                        )}
                        <form action={handleSubmit} className="space-y-6">
                            {/* Name Field (Sign Up Only) */}
                            {!isLogin && (
                                <div className="space-y-2">
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                        Full Name
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <FontAwesomeIcon icon={faUser} className="text-gray-400" />
                                        </div>
                                        <input
                                            id="name"
                                            name="name"
                                            type="text"
                                            required={!isLogin}
                                            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                                            placeholder="Enter your full name"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Email Field */}
                            <div className="space-y-2">
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <FontAwesomeIcon icon={faEnvelope} className="text-gray-400" />
                                    </div>
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        required
                                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                                        placeholder="Enter your email"
                                    />
                                </div>
                            </div>

                            {/* Password Field */}
                            <div className="space-y-2">
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                    Password
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <FontAwesomeIcon icon={faLock} className="text-gray-400" />
                                    </div>
                                    <input
                                        id="password"
                                        name="password"
                                        type={showPassword ? "text" : "password"}
                                        required
                                        className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                                        placeholder="Enter your password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors duration-200"
                                    >
                                        <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                                    </button>
                                </div>
                            </div>

                            {/* Confirm Password (Sign Up Only) */}
                            {!isLogin && (
                                <div className="space-y-2">
                                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                                        Confirm Password
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <FontAwesomeIcon icon={faLock} className="text-gray-400" />
                                        </div>
                                        <input
                                            id="confirmPassword"
                                            name="confirmPassword"
                                            type="password"
                                            required={!isLogin}
                                            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                                            placeholder="Confirm your password"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Remember Me / Forgot Password */}
                            {isLogin && (
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <input
                                            id="remember"
                                            name="remember"
                                            type="checkbox"
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        />
                                        <label htmlFor="remember" className="ml-2 block text-sm text-gray-700">
                                            Remember me
                                        </label>
                                    </div>
                                    <Link href="/forgot-password" className="text-sm text-blue-600 hover:text-blue-500 font-medium">
                                        Forgot password?
                                    </Link>
                                </div>
                            )}

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={isLoading}
                                className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white transition-all duration-300 transform ${isLoading
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-blue-600 hover:bg-blue-700 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                                    }`}
                            >
                                {isLoading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        {isLogin ? 'Signing in...' : 'Creating account...'}
                                    </>
                                ) : (
                                    isLogin ? 'Sign In' : 'Create Account'
                                )}
                            </button>

                            {/* Terms and Privacy (Sign Up Only) */}
                            {!isLogin && (
                                <p className="text-xs text-gray-600 text-center">
                                    By creating an account, you agree to our{' '}
                                    <Link href="/terms" className="text-blue-600 hover:text-blue-500 font-medium">
                                        Terms of Service
                                    </Link>{' '}
                                    and{' '}
                                    <Link href="/privacy" className="text-blue-600 hover:text-blue-500 font-medium">
                                        Privacy Policy
                                    </Link>
                                </p>
                            )}
                        </form>
                        <span className='flex justify-center pt-10'>
                            Or With
                        </span>
                        <Button
                            variant="outline"
                            className="w-full mt-10 hover:bg-gray-300"
                            onClick={loginWithGoogle}
                            disabled={isGoogleLoading}
                        >
                            {isGoogleLoading ? (
                                <LoaderCircle className="animate-spin size-5" />
                            ) : (
                                <GoogleIcon />
                            )}
                            <span className="ml-2">Login with Google</span>
                        </Button>
                    </div>
                </div>

            </div>
        </div>
    );
}

const GoogleIcon = () => (
    <svg
        aria-hidden="true"
        focusable="false"
        role="img"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 48 48"
        className="size-5"
    >
        <path
            fill="#fbc02d"
            d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12 s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20 s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
        />
        <path
            fill="#e53935"
            d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039 l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
        />
        <path
            fill="#4caf50"
            d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36 c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
        />
        <path
            fill="#1565c0"
            d="M43.611,20.083L43.595,20L42,20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571 c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
        />
    </svg>
);