import { redirect } from 'next/navigation';
import { createClient } from '@/app/utils/supabase/server';
import DiagnosisFlow from './symptoms';

export default async function SymptomCheckerPage() {
    const supabase = await createClient()

    const {
        data: { user },
        error
    } = await supabase.auth.getUser()

    if (error || !user) {
        redirect('/login?error=auth_required&message=Please login to access symptom checker');
    }

    return <DiagnosisFlow user={user} />;
}