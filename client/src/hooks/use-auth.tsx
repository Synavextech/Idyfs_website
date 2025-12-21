
import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { LoginData, RegisterData, Profile } from "@shared/schema";
import { User } from "@supabase/supabase-js";

type AuthContextType = {
    user: User | null; // Supabase Auth User
    profile: Profile | null; // Public Profile
    isLoading: boolean;
    error: Error | null;
    loginMutation: {
        mutateAsync: (credentials: LoginData) => Promise<void>;
        isPending: boolean;
    };
    logoutMutation: {
        mutateAsync: () => Promise<void>;
        isPending: boolean;
    };
    registerMutation: {
        mutateAsync: (credentials: RegisterData) => Promise<void>;
        isPending: boolean;
    };
};

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const { toast } = useToast();
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        // Initial Session Check
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
            if (session?.user) {
                fetchProfile(session.user.id);
            } else {
                setIsLoading(false);
            }
        });

        // Listen for changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
            if (session?.user) {
                fetchProfile(session.user.id);
            } else {
                setProfile(null);
                setIsLoading(false);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const fetchProfile = async (userId: string) => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (error) {
                console.error("Profile fetch error:", error);
                // Don't set error state here to avoid blocking UI if profile missing (race condition)
            } else {
                setProfile(data as Profile); // Type assertion assuming schema match
            }
        } catch (err: any) {
            console.error("Profile fetch exception:", err);
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (credentials: LoginData) => {
        const { error } = await supabase.auth.signInWithPassword({
            email: credentials.email,
            password: credentials.password,
        });
        if (error) throw error;
        toast({ title: "Welcome back!", description: "Successfully logged in." });
    };

    const register = async (credentials: RegisterData) => {
        const { data, error } = await supabase.auth.signUp({
            email: credentials.email,
            password: credentials.password,
            options: {
                data: {
                    full_name: credentials.name,
                    // If plan provided, we might want to store it in metadata to trigger subscription creation logic later?
                    // For now, handle_new_user trigger only expects full_name/avatar
                }
            }
        });
        if (error) throw error;
        // If plan is provided, we might need to handle subscription creation here via apiRequest or RPC?
        // But for now let's stick to auth.

        toast({ title: "Registration successful!", description: "Please check your email if confirmation is improved." });
        // If auto-confirm is on (dev), they are logged in.
    };

    const logout = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        toast({ title: "Logged out", description: "See you next time!" });
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                profile,
                isLoading,
                error,

                loginMutation: { mutateAsync: login, isPending: isLoading },
                logoutMutation: { mutateAsync: logout, isPending: isLoading },
                registerMutation: { mutateAsync: register, isPending: isLoading },
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
