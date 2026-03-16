"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { TrendingUp, Lock, ArrowRight, Loader2 } from "lucide-react";

export default function ResetPasswordPage() {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const router = useRouter();

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError("As passwords não coincidem.");
            return;
        }

        setLoading(true);
        setError("");
        setMessage("");

        const { error } = await supabase.auth.updateUser({
            password: password
        });

        if (error) {
            setError(error.message);
            setLoading(false);
        } else {
            setMessage("Senha alterada com sucesso! Redirecionando...");
            setTimeout(() => {
                router.push("/login");
            }, 2000);
        }
    };

    return (
        <div style={{ background: '#F8FAFC', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card"
                style={{ width: '100%', maxWidth: '450px', padding: '3rem', borderRadius: '2.5rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.08)' }}
            >
                <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', fontSize: '1.5rem', fontWeight: '800', marginBottom: '1.5rem' }}>
                        <div style={{ width: 40, height: 40, background: 'orange', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                            <TrendingUp size={24} />
                        </div>
                        <span>Kwanza<span style={{ color: 'var(--primary)' }}>Crédito</span></span>
                    </div>
                    <h2 style={{ fontSize: '2rem', fontWeight: '900', color: '#0F172A', marginBottom: '0.5rem' }}>Nova Password</h2>
                    <p style={{ color: '#64748b' }}>Defina a sua nova senha de acesso.</p>
                </div>

                {error && (
                    <div style={{ background: '#fef2f2', color: '#ef4444', padding: '1rem', borderRadius: '12px', marginBottom: '2rem', fontSize: '0.875rem', fontWeight: '500', border: '1px solid #fee2e2' }}>
                        {error}
                    </div>
                )}

                {message && (
                    <div style={{ background: '#f0fdf4', color: '#16a34a', padding: '1rem', borderRadius: '12px', marginBottom: '2rem', fontSize: '0.875rem', fontWeight: '500', border: '1px solid #dcfce7' }}>
                        {message}
                    </div>
                )}

                <form onSubmit={handleReset} style={{ display: 'grid', gap: '1.5rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#0F172A' }}>Nova Password</label>
                        <div style={{ position: 'relative' }}>
                            <Lock style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} size={20} />
                            <input
                                type="password"
                                required
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                style={{ width: '100%', padding: '1rem 1rem 1rem 3.5rem', borderRadius: '16px', border: '1px solid #E2E8F0', fontSize: '1rem' }}
                            />
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#0F172A' }}>Confirmar Password</label>
                        <div style={{ position: 'relative' }}>
                            <Lock style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} size={20} />
                            <input
                                type="password"
                                required
                                placeholder="••••••••"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                style={{ width: '100%', padding: '1rem 1rem 1rem 3.5rem', borderRadius: '16px', border: '1px solid #E2E8F0', fontSize: '1rem' }}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn btn-primary"
                        style={{ padding: '1.25rem', borderRadius: '16px', fontSize: '1.1rem', marginTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                    >
                        {loading ? <Loader2 size={24} className="animate-spin" /> : <>Atualizar Senha <ArrowRight size={20} /></>}
                    </button>
                </form>
            </motion.div>
        </div>
    );
}
