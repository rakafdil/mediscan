'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

// Validation schemas
interface LoginData {
    email: string;
    password: string;
}

interface SignupData {
    email: string;
    password: string;
    name?: string;
    confirmPassword?: string;
}

// Validation functions
function validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function validatePassword(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (password.length < 8) {
        errors.push('Password must be at least 8 characters long');
    }
    if (!/(?=.*[a-z])/.test(password)) {
        errors.push('Password must contain at least one lowercase letter');
    }
    if (!/(?=.*[A-Z])/.test(password)) {
        errors.push('Password must contain at least one uppercase letter');
    }
    if (!/(?=.*\d)/.test(password)) {
        errors.push('Password must contain at least one number');
    }
    if (!/(?=.*[@$!%*?&])/.test(password)) {
        errors.push('Password must contain at least one special character (@$!%*?&)');
    }

    return {
        isValid: errors.length === 0,
        errors
    };
}

function validateName(name: string): boolean {
    return name.trim().length >= 2 && /^[a-zA-Z\s]+$/.test(name.trim());
}

// Error handling function
function handleAuthError(error: { message?: string }): never {
    console.error('Auth error:', error);

    // Map specific Supabase errors to user-friendly messages
    if (error.message?.includes('Invalid login credentials')) {
        redirect('/login?error=invalid_credentials');
    } else if (error.message?.includes('Email not confirmed')) {
        redirect('/login?error=email_not_confirmed');
    } else if (error.message?.includes('User already registered')) {
        redirect('/login?error=user_exists');
    } else if (error.message?.includes('Password should be at least 6 characters')) {
        redirect('/login?error=password_too_short');
    } else {
        redirect('/login?error=auth_error');
    }
}
export async function login(formData: FormData) {
    const supabase = await createClient();

    // Extract and validate input data
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    // Validation
    const errors: string[] = [];

    if (!email) {
        errors.push('Email is required');
    } else if (!validateEmail(email)) {
        errors.push('Please enter a valid email address');
    }

    if (!password) {
        errors.push('Password is required');
    } else if (password.length < 6) {
        errors.push('Password must be at least 6 characters long');
    }

    if (errors.length > 0) {
        const errorMessage = encodeURIComponent(errors.join(', '));
        redirect(`/login?error=validation&message=${errorMessage}`);
    }

    const data: LoginData = {
        email: email.toLowerCase().trim(),
        password,
    };

    const { error } = await supabase.auth.signInWithPassword(data);

    if (error) {
        handleAuthError(error);
    }

    // Success - revalidate and redirect
    revalidatePath('/', 'layout');
    redirect('/account');
}

export async function signup(formData: FormData) {
    const supabase = await createClient();

    // Extract input data
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;
    const name = formData.get('name') as string;

    // Validation
    const errors: string[] = [];

    // Email validation
    if (!email) {
        errors.push('Email is required');
    } else if (!validateEmail(email)) {
        errors.push('Please enter a valid email address');
    }

    // Name validation
    if (!name) {
        errors.push('Full name is required');
    } else if (!validateName(name)) {
        errors.push('Name must be at least 2 characters and contain only letters and spaces');
    }

    // Password validation
    if (!password) {
        errors.push('Password is required');
    } else {
        const passwordValidation = validatePassword(password);
        if (!passwordValidation.isValid) {
            errors.push(...passwordValidation.errors);
        }
    }

    // Confirm password validation
    if (!confirmPassword) {
        errors.push('Please confirm your password');
    } else if (password !== confirmPassword) {
        errors.push('Passwords do not match');
    }

    if (errors.length > 0) {
        const errorMessage = encodeURIComponent(errors.join(', '));
        redirect(`/login?error=validation&message=${errorMessage}`);
    }

    const data: SignupData = {
        email: email.toLowerCase().trim(),
        password,
        name: name.trim(),
    };

    const { error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
            data: {
                full_name: data.name,
                display_name: data.name,
            }
        }
    });

    if (error) {
        handleAuthError(error);
    }

    revalidatePath('/profile', 'layout');
    redirect('/login?success=check_email');

}

// Additional utility function for logout
export async function logout() {
    const supabase = await createClient();

    try {
        const { error } = await supabase.auth.signOut();

        if (error) {
            console.error('Logout error:', error);
        }

        revalidatePath('/', 'layout');
        redirect('/');
    } catch (error) {
        console.error('Unexpected error during logout:', error);
        redirect('/');
    }
}