import { createClient } from '@/app/utils/supabase/server'
import HistoryPageDetail from './[id]/page'


export default async function HistoryPage() {

    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    return (
        <div className="container mx-auto p-4">
            <HistoryPageDetail user={user} />
        </div>
    )
}