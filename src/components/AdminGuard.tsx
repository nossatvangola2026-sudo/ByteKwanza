"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Loader2 } from "lucide-react";

export default function AdminGuard({ children }: { children: React.ReactNode }) {
    const [authorized, setAuthorized] = useState(false);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const checkAdmin = async () => {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                router.push("/login");
                return;
            }

            const { data: profile, error } = await supabase
                .from("profiles")
                .select("role")
                .eq("id", user.id)
                .single();

            if (error || !profile || profile.role !== "admin") {
                console.warn("Acesso negado: Utilizador não é administrador.");
                router.push("/dashboard");
                return;
            }

            setAuthorized(true);
            setLoading(false);
        };

        checkAdmin();
    }, [router]);

    if (loading) {
        return (
            <div style={{ 
                height: "100vh", 
                width: "100vw", 
                display: "flex", 
                flexDirection: "column",
                alignItems: "center", 
                justifyContent: "center",
                background: "#f8fafc",
                gap: "1rem"
            }}>
                <Loader2 size={48} className="animate-spin" style={{ color: "var(--primary)" }} />
                <p style={{ color: "#64748b", fontWeight: "500" }}>A verificar permissões...</p>
            </div>
        );
    }

    return authorized ? <>{children}</> : null;
}
