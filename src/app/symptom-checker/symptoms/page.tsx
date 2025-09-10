import { redirect } from 'next/navigation';
import { createClient } from '@/app/utils/supabase/server';
import DiagnosisFlow from './symptoms';

export default async function SymptomCheckerPage() {
    const supabase = await createClient();
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error || !session) {
        redirect('/login?error=auth_required&message=Please login to access symptom checker');
    }

    return <DiagnosisFlow />;
}