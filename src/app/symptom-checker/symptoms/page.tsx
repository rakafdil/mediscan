
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import DiagnosisFlow from './symptoms';

export default async function Render() {
    const supabase = createClient();
    const session = (await supabase).auth.getSession();

    if (!session) {
        redirect('/login')
    }

    return (
        <>
            <DiagnosisFlow />
        </>
    )

}