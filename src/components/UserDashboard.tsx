"use client";

import { Wallet, History, Send, FileText, Bell, LogOut, LayoutDashboard, Loader2, Save, AlertTriangle, Menu, X, CreditCard } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "./Toast";

export default function UserDashboard() {
    const router = useRouter();
    const { success, error, info } = useToast();
    const [user, setUser] = useState<any>(null);
    const [profile, setProfile] = useState<any>(null);
    const [credits, setCredits] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showProfileUpdate, setShowProfileUpdate] = useState(false);
    const [savingProfile, setSavingProfile] = useState(false);
    const [profileForm, setProfileForm] = useState({
        fullName: '', phone: '', biNumber: '', employer: '',
        address: '', emergencyContact: '', emergencyPhone: '', monthlySalary: ''
    });
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            // 1. Get authenticated user
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/login');
                return;
            }
            setUser(user);

            // 2. Get profile
            const { data: profileData } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();
            
            if (profileData?.role === 'admin') {
                router.push('/admin');
                return;
            }

            setProfile(profileData);

            // Check if profile needs mandatory update (admin-created user)
            if (profileData && profileData.profile_status === 'pending_update') {
                setProfileForm({
                    fullName: profileData.full_name || '',
                    phone: profileData.phone || '',
                    biNumber: profileData.bi_number || '',
                    employer: profileData.employer || '',
                    address: profileData.address || '',
                    emergencyContact: profileData.emergency_contact_name || '',
                    emergencyPhone: profileData.emergency_contact_phone || '',
                    monthlySalary: profileData.monthly_salary ? String(profileData.monthly_salary) : '0'
                });
                setShowProfileUpdate(true);
            }

            // 3. Get credit history
            const { data: creditData } = await supabase
                .from('credits')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });
            setCredits(creditData || []);

            setLoading(false);
        };

        loadData();
    }, [router]);

    const handleRequestCredit = async () => {
        const amount = prompt("Valor do crédito (Kz):", "15000");
        if (!amount || !user) return;

        const { error } = await supabase.from('credits').insert({
            user_id: user.id,
            amount: parseFloat(amount),
            term_months: 1,
            interest_rate: 35,
            status: 'pending'
        });

        if (error) {
            error("Erro ao enviar solicitação: " + error.message);
        } else {
            success(`Solicitação de ${amount} Kz enviada para análise!`);
            // Refresh credits list
            const { data } = await supabase
                .from('credits')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });
            setCredits(data || []);
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/');
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center' }}>
                <Loader2 size={48} className="animate-spin" style={{ color: 'var(--primary)' }} />
            </div>
        );
    }

    const displayName = profile?.full_name || user?.email?.split('@')[0] || 'Utilizador';
    const initials = displayName ? displayName.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() : 'U';

    // Calculate stats from real data
    const totalDebt = (credits as any[])
        .filter((c: any) => c.status === 'approved' || c.status === 'active')
        .reduce((sum: number, c: any) => sum + (c.amount || 0), 0);

    const stats = [
        { label: "Limite disponível", value: profile?.credit_limit ? `${Number(profile.credit_limit).toLocaleString()} Kz` : "60.000 Kz", color: "var(--tertiary)" },
        { label: "Em dívida", value: `${totalDebt.toLocaleString()} Kz`, color: "var(--accent)" },
        { label: "Créditos solicitados", value: `${credits.length}`, color: "var(--primary)" }
    ];

    const handleSaveProfile = async () => {
        if (!profileForm.fullName || !profileForm.biNumber || !profileForm.monthlySalary) {
            info('Preencha pelo menos: Nome, Nº BI e Salário.');
            return;
        }
        setSavingProfile(true);
        const { error } = await supabase.from('profiles').update({
            full_name: profileForm.fullName,
            phone: profileForm.phone || null,
            bi_number: profileForm.biNumber,
            employer: profileForm.employer || null,
            address: profileForm.address || null,
            emergency_contact_name: profileForm.emergencyContact || null,
            emergency_contact_phone: profileForm.emergencyPhone || null,
            monthly_salary: parseFloat(profileForm.monthlySalary) || 0,
            profile_status: 'active',
            kyc_status: 'pending'
        }).eq('id', user.id);
        setSavingProfile(false);
        if (error) {
            error('Erro ao guardar: ' + error.message);
        } else {
            setShowProfileUpdate(false);
            setProfile({ ...profile, profile_status: 'active' });
            success('Perfil actualizado com sucesso!');
        }
    };

    return (
        <>
             <div className="dashboard-layout" style={{ background: '#f8fafc' }}>
                {/* Mobile Header */}
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: '64px', background: 'white', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 1.5rem', zIndex: 60 }} className="lg:hidden">
                    <div style={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ width: 20, height: 20, background: 'var(--gradient-primary)', borderRadius: '50%' }}></div>
                        KwanzaCrédito
                    </div>
                    <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} style={{ background: 'none', border: 'none', color: 'var(--text-main)', cursor: 'pointer' }}>
                        {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>

                {/* Sidebar Overlay */}
                {isSidebarOpen && (
                    <div 
                        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 45, backdropFilter: 'blur(4px)' }} 
                        onClick={() => setIsSidebarOpen(false)}
                        className="lg:hidden"
                    />
                )}

                {/* Sidebar */}
                <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`} style={{ padding: '2rem' }}>
                    <div style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '3rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }} className="hidden lg:flex">
                        <div style={{ width: 24, height: 24, background: 'var(--gradient-primary)', borderRadius: '50%' }}></div>
                        Kwanza<span style={{ color: 'var(--primary)' }}>Crédito</span>
                    </div>

                    <nav style={{ display: 'grid', gap: '0.5rem' }}>
                        <SidebarItem icon={<LayoutDashboard size={20} />} label="Dashboard" active />
                        <SidebarItem icon={<Send size={20} />} label="Pedir Crédito" onClick={() => { handleRequestCredit(); setIsSidebarOpen(false); }} />
                        <SidebarItem icon={<History size={20} />} label="Histórico" />
                        <SidebarItem icon={<FileText size={20} />} label="Contratos" />
                        <SidebarItem icon={<Bell size={20} />} label="Notificações" />
                        <div style={{ marginTop: '2rem', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                            <SidebarItem
                                icon={<LogOut size={20} />}
                                label="Sair"
                                color="var(--accent)"
                                onClick={handleLogout}
                            />
                        </div>
                    </nav>
                </aside>

                {/* Main Content */}
                <main className="dashboard-content" style={{ marginTop: '64px' }}>
                    <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                        <div>
                            <h2 style={{ fontSize: '1.5rem' }}>Olá, {displayName}</h2>
                            <p style={{ color: '#666' }}>Bem-vindo ao seu painel financeiro.</p>
                        </div>
                        <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                            {initials}
                        </div>
                    </header>

                    {/* Stats Grid */}
                    <div className="stats-grid">
                        {stats.map((stat, i) => (
                            <div key={i} className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                <p style={{ color: '#64748b', fontSize: '0.875rem', fontWeight: '600' }}>{stat.label}</p>
                                <h3 style={{ fontSize: '1.75rem', color: stat.color, fontWeight: '900' }}>{stat.value}</h3>
                            </div>
                        ))}
                    </div>

                    {/* Active Credit Box */}
                    <div className="card glass" style={{ marginBottom: '2rem', background: 'var(--gradient-primary)', color: 'white', border: 'none', padding: '2rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <h4 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Precisa de capital rápido?</h4>
                                <p style={{ opacity: 0.9 }}>Solicite o seu crédito e receba na sua conta.</p>
                            </div>
                            <button
                                className="btn"
                                style={{ background: 'white', color: 'var(--primary)', padding: '0.75rem 1.5rem', borderRadius: '12px', fontWeight: 'bold' }}
                                onClick={handleRequestCredit}
                            >
                                Solicitar Crédito
                            </button>
                        </div>
                    </div>

                    {/* History Table */}
                    <div className="table-container">
                        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)' }}>
                            <h4 style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>Últimas atividades</h4>
                        </div>
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)', color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                        <th style={{ padding: '1rem 1.5rem' }}>Data</th>
                                        <th style={{ padding: '1rem 1.5rem' }}>Tipo</th>
                                        <th style={{ padding: '1rem 1.5rem' }}>Valor</th>
                                        <th style={{ padding: '1rem 1.5rem' }}>Status</th>
                                    </tr>
                                </thead>
                                <tbody style={{ fontSize: '0.875rem' }}>
                                    {credits.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} style={{ padding: '3rem 1.5rem', textAlign: 'center', color: '#94a3b8' }}>
                                                Nenhuma atividade registada.
                                            </td>
                                        </tr>
                                    ) : (
                                        credits.map((credit, i) => (
                                            <ActivityRow
                                                key={i}
                                                date={new Date(credit.created_at).toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                type="Solicitação de Crédito"
                                                amount={`${Number(credit.amount).toLocaleString()} Kz`}
                                                status={credit.status === 'approved' ? 'Aprovado' : credit.status === 'rejected' ? 'Rejeitado' : 'Pendente'}
                                            />
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </main>
            </div>

            {/* Modal de Actualização Obrigatória de Perfil */}
            {showProfileUpdate && (
                <div style={{
                    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000
                }}>
                    <div style={{
                        background: 'white', borderRadius: '24px', padding: '2.5rem',
                        width: '100%', maxWidth: '600px', boxShadow: '0 25px 50px rgba(0,0,0,0.2)',
                        maxHeight: '90vh', overflowY: 'auto'
                    }}>
                        {/* Header with warning */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                            <div style={{ padding: '0.75rem', background: '#fef3c7', borderRadius: '12px' }}>
                                <AlertTriangle size={28} color="#d97706" />
                            </div>
                            <div>
                                <h3 style={{ fontSize: '1.5rem', fontWeight: '900', color: '#0F172A' }}>Complete o seu Perfil</h3>
                                <p style={{ color: '#64748b', fontSize: '0.875rem' }}>É obrigatório preencher os dados em falta para continuar.</p>
                            </div>
                        </div>

                        <div style={{ padding: '1rem', background: '#fff7ed', borderRadius: '12px', marginBottom: '1.5rem', border: '1px solid #fed7aa', fontSize: '0.8rem', color: '#9a3412' }}>
                            A sua conta foi criada pelo administrador. Complete os campos abaixo para poder utilizar a plataforma.
                        </div>

                        <div style={{ display: 'grid', gap: '1.25rem' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem', color: '#0F172A' }}>Nome Completo *</label>
                                    <input type="text" className="input-field" value={profileForm.fullName}
                                        onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                                        style={{ padding: '0.85rem 1rem', borderRadius: '12px' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem', color: '#0F172A' }}>Telemóvel</label>
                                    <input type="text" className="input-field" placeholder="9xx xxx xxx" value={profileForm.phone}
                                        onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                                        style={{ padding: '0.85rem 1rem', borderRadius: '12px' }} />
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem', color: '#0F172A' }}>Nº do BI *</label>
                                    <input type="text" className="input-field" placeholder="000000000XX000" value={profileForm.biNumber}
                                        onChange={(e) => setProfileForm({ ...profileForm, biNumber: e.target.value })}
                                        style={{ padding: '0.85rem 1rem', borderRadius: '12px' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem', color: '#0F172A' }}>Salário Mensal (Kz) *</label>
                                    <input type="number" className="input-field" placeholder="Ex: 150000" value={profileForm.monthlySalary}
                                        onChange={(e) => setProfileForm({ ...profileForm, monthlySalary: e.target.value })}
                                        style={{ padding: '0.85rem 1rem', borderRadius: '12px' }} />
                                </div>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem', color: '#0F172A' }}>Empregador</label>
                                <input type="text" className="input-field" placeholder="Nome da empresa" value={profileForm.employer}
                                    onChange={(e) => setProfileForm({ ...profileForm, employer: e.target.value })}
                                    style={{ padding: '0.85rem 1rem', borderRadius: '12px' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem', color: '#0F172A' }}>Morada</label>
                                <input type="text" className="input-field" placeholder="Endereço completo" value={profileForm.address}
                                    onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                                    style={{ padding: '0.85rem 1rem', borderRadius: '12px' }} />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem', color: '#0F172A' }}>Contacto de Emergência</label>
                                    <input type="text" className="input-field" placeholder="Nome do familiar" value={profileForm.emergencyContact}
                                        onChange={(e) => setProfileForm({ ...profileForm, emergencyContact: e.target.value })}
                                        style={{ padding: '0.85rem 1rem', borderRadius: '12px' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem', color: '#0F172A' }}>Telefone Emergência</label>
                                    <input type="text" className="input-field" placeholder="9xx xxx xxx" value={profileForm.emergencyPhone}
                                        onChange={(e) => setProfileForm({ ...profileForm, emergencyPhone: e.target.value })}
                                        style={{ padding: '0.85rem 1rem', borderRadius: '12px' }} />
                                </div>
                            </div>
                        </div>

                        <button
                            className="btn btn-primary"
                            style={{ width: '100%', padding: '1rem', marginTop: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontSize: '1rem' }}
                            disabled={!profileForm.fullName || !profileForm.biNumber || !profileForm.monthlySalary || savingProfile}
                            onClick={handleSaveProfile}
                        >
                            {savingProfile ? <Loader2 size={20} className="animate-spin" /> : <><Save size={20} /> Guardar e Continuar</>}
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}

function SidebarItem({ icon, label, active = false, color, onClick }: { icon: any, label: string, active?: boolean, color?: string, onClick?: () => void }) {
    return (
        <div
            onClick={onClick}
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius)',
                background: active ? 'rgba(255, 107, 0, 0.1)' : 'transparent',
                color: color || (active ? 'var(--primary)' : '#666'),
                fontWeight: active ? 'bold' : 'normal',
                cursor: 'pointer',
                transition: 'all 0.2s'
            }}>
            {icon}
            <span>{label}</span>
        </div>
    );
}

function ActivityRow({ date, type, amount, status }: { date: string, type: string, amount: string, status: string }) {
    const statusColors: Record<string, { bg: string, color: string }> = {
        'Aprovado': { bg: 'rgba(0,135,81,0.1)', color: 'var(--tertiary)' },
        'Rejeitado': { bg: 'rgba(239,68,68,0.1)', color: '#ef4444' },
        'Pendente': { bg: 'rgba(245,158,11,0.1)', color: '#f59e0b' }
    };

    const colors = statusColors[status] || statusColors['Pendente'];

    return (
        <tr style={{ borderBottom: '1px solid var(--border)', fontSize: '0.875rem' }}>
            <td style={{ padding: '1rem 0' }}>{date}</td>
            <td>{type}</td>
            <td style={{ fontWeight: 'bold' }}>{amount}</td>
            <td>
                <span style={{
                    padding: '0.25rem 0.5rem',
                    borderRadius: '4px',
                    fontSize: '0.75rem',
                    background: colors.bg,
                    color: colors.color
                }}>
                    {status}
                </span>
            </td>
        </tr>
    );
}
