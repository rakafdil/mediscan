'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { validateEmail, validatePassword, validateName } from '@/utils/auth/validation'
import { mapAuthErrorMessage } from '@/utils/auth/errors'

export async function login(formData: FormData) {
    const supabase = await createClient();

    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    const errors: string[] = [];
    if (!email) errors.push('Email is required');
    else if (!validateEmail(email)) errors.push('Please enter a valid email address');

    if (!password) errors.push('Password is required');
    else if (password.length < 6) errors.push('Password must be at least 6 characters long');

    if (errors.length > 0) {
        const msg = encodeURIComponent(errors.join(', '));
        redirect(`/login?error=validation&message=${msg}`);
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
        redirect(`/login?error=${mapAuthErrorMessage(error.message)}`);
    }

    revalidatePath('/', 'layout');
    revalidatePath('/account', 'page');
    revalidatePath('/symptom-checker/symptoms', 'page');
    redirect('/');
}

export async function signup(formData: FormData) {
    const supabase = await createClient();

    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;
    const name = formData.get('name') as string;

    const errors: string[] = [];

    if (!email) errors.push('Email is required');
    else if (!validateEmail(email)) errors.push('Please enter a valid email address');

    if (!name) errors.push('Full name is required');
    else if (!validateName(name)) errors.push('Name must be at least 2 characters and contain only letters and spaces');

    if (!password) errors.push('Password is required');
    else {
        const { isValid, errors: pwErrors } = validatePassword(password);
        if (!isValid) errors.push(...pwErrors);
    }

    if (!confirmPassword) errors.push('Please confirm your password');
    else if (password !== confirmPassword) errors.push('Passwords do not match');

    if (errors.length > 0) {
        const msg = encodeURIComponent(errors.join(', '));
        redirect(`/login?error=validation&message=${msg}`);
    }

    const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: name.trim(),
                display_name: name.trim(),
            }
        }
    });

    if (error) {
        redirect(`/login?error=${mapAuthErrorMessage(error.message)}`);
    }

    revalidatePath('/profile', 'layout');
    redirect('/login?success=check_email');
}
