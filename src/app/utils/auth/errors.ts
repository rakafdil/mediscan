export function mapAuthErrorMessage(message?: string): string {
    if (!message) return 'auth_error';
    if (message.includes('Invalid login credentials')) return 'invalid_credentials';
    if (message.includes('Email not confirmed')) return 'email_not_confirmed';
    if (message.includes('User already registered')) return 'user_exists';
    if (message.includes('Password should be at least 6 characters')) return 'password_too_short';
    return 'auth_error';
}
