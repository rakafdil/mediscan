import { createClient } from "@/app/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";


export async function GET(req: NextRequest) {
    const supabase = await createClient();

    const handleLogout = async () => {
        await supabase.auth.signOut()
        Promise.resolve().then(() => window.location.href = '/login')

    }

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (user) {
        handleLogout();
    }

    revalidatePath("/", "layout");
    return new NextResponse(null, {
        status: 302,
    });
}