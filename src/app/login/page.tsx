'use client';

import { Suspense } from 'react';
import LoginPageContent from './LoginPageContent';
import Loading from '../components/Loading';

export default function LoginPage() {
    return (
        <Suspense fallback={
            <Loading />
        }>
            <LoginPageContent />
        </Suspense>
    );
}
