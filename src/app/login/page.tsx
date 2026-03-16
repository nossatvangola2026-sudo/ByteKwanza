"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { TrendingUp, Mail, Lock, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [view, setView] = useState<"login" | "forgot">("login");
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setMessage("");

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            setError(error.message === "Invalid login credentials" ? "Credenciais inválidas. Verifique o seu email e password." : error.message);
            setLoading(false);
        } else {
            // Check roles and redirect
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', user.id)
                    .single();
                
                if (profile?.role === 'admin') {
                    router.push("/admin");
                } else {
                    router.push("/dashboard");
                }
            } else {
                router.push("/dashboard");
            }
        }
    };

    const handleForgotPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setMessage("");

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password`,
        });

        if (error) {
            setError(error.message);
            setLoading(false);
        } else {
            setMessage("Link de recuperação enviado! Verifique o seu email.");
            setLoading(false);
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
                    <h2 style={{ fontSize: '2rem', fontWeight: '900', color: '#0F172A', marginBottom: '0.5rem' }}>
                        {view === "login" ? "Bem-vindo de volta" : "Recuperar Password"}
                    </h2>
                    <p style={{ color: '#64748b' }}>
                        {view === "login" ? "Aceda à sua conta para gerir o seu crédito." : "Introduza o seu email para receber um link de redefinição."}
                    </p>
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

                {view === "login" ? (
                    <form onSubmit={handleLogin} style={{ display: 'grid', gap: '1.5rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#0F172A' }}>Email</label>
                            <div style={{ position: 'relative' }}>
                                <Mail style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} size={20} />
                                <input
                                    type="email"
                                    required
                                    placeholder="exemplo@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    style={{ width: '100%', padding: '1rem 1rem 1rem 3.5rem', borderRadius: '16px', border: '1px solid #E2E8F0', fontSize: '1rem' }}
                                />
                            </div>
                        </div>

                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                <label style={{ fontWeight: '600', color: '#0F172A' }}>Password</label>
                                <button
                                    type="button"
                                    onClick={() => setView("forgot")}
                                    style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '0.875rem', fontWeight: '600', cursor: 'pointer' }}
                                >
                                    Esqueceu-se?
                                </button>
                            </div>
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

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn btn-primary"
                            style={{ padding: '1.25rem', borderRadius: '16px', fontSize: '1.1rem', marginTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                        >
                            {loading ? <Loader2 size={24} className="animate-spin" /> : <>Entrar <ArrowRight size={20} /></>}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleForgotPassword} style={{ display: 'grid', gap: '1.5rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#0F172A' }}>Email</label>
                            <div style={{ position: 'relative' }}>
                                <Mail style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} size={20} />
                                <input
                                    type="email"
                                    required
                                    placeholder="exemplo@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
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
                            {loading ? <Loader2 size={24} className="animate-spin" /> : <>Enviar Link <ArrowRight size={20} /></>}
                        </button>

                        <button
                            type="button"
                            onClick={() => setView("login")}
                            style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '0.875rem', fontWeight: '600', cursor: 'pointer', marginTop: '0.5rem' }}
                        >
                            Voltar ao login
                        </button>
                    </form>
                )}

                <div style={{ textAlign: 'center', marginTop: '2.5rem', color: '#64748b' }}>
                    Não tem uma conta? <Link href="/register" style={{ color: 'var(--primary)', fontWeight: '700', textDecoration: 'none' }}>Registe-se aqui</Link>
                </div>
            </motion.div>
        </div>
    );
}
