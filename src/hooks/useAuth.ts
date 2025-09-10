import { useEffect, useState } from 'react';
import { createClient } from '@/app/utils/supabase/client';
import type { User } from '@supabase/supabase-js';

interface Profile {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
    username: string | null;
}

interface AuthState {
    user: User | null;
    profile: Profile | null;
    isLoggedIn: boolean;
    loading: boolean;
}

export function useAuth() {
    const [state, setState] = useState<AuthState>({
        user: null,
        profile: null,
        isLoggedIn: false,
        loading: true,
    });

    const supabase = createClient();

    useEffect(() => {
        const getSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();

            if (session?.user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', session.user.id)
                    .single();

                setState({
                    user: session.user,
                    profile,
                    isLoggedIn: true,
                    loading: false,
                });
            } else {
                setState({
                    user: null,
                    profile: null,
                    isLoggedIn: false,
                    loading: false,
                });
            }
        };

        getSession();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                if (event === 'SIGNED_IN' && session?.user) {
                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('*')
                        .eq('id', session.user.id)
                        .single();

                    setState({
                        user: session.user,
                        profile,
                        isLoggedIn: true,
                        loading: false,
                    });
                } else if (event === 'SIGNED_OUT') {
                    setState({
                        user: null,
                        profile: null,
                        isLoggedIn: false,
                        loading: false,
                    });
                }
            }
        );

        return () => subscription.unsubscribe();
    }, []);

    return state;
}