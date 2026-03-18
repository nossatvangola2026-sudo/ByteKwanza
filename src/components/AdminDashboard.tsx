"use client";

import { Users, FileCheck, Landmark, BarChart3, Settings, LogOut, Check, X, AlertCircle, Shield, Bell, CreditCard, Building2, Gavel, Cpu, Palette, Plus, Trash2, Save, Wand2, Loader2, Upload, UserPlus, ArrowRight, CheckCircle2 } from "lucide-react";
import { useState, useEffect } from "react";
import React from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

interface UserProfile {
    role: string;
    is_super_admin: boolean;
}

interface User {
    id: number;
    realId: string;
    name: string;
    email: string;
    referralCode: string;
    joined: string;
    status: string;
}

interface KycItem {
    id: number;
    name: string;
    date: string;
    salary: string;
    risk: string;
    riskColor: string;
}

interface CreditRequest {
    id: string;
    name: string;
    date: string;
    amount: string;
    status: string;
}

function generateReferralCode() {
    return 'REF-' + Math.random().toString(36).substring(2, 8).toUpperCase();
}

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState('kyc');
    const [activeSubTab, setActiveSubTab] = useState('credit');
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState([
        { label: "Total Emprestado", value: "0 Kz", color: "var(--primary)" },
        { label: "Total Recebido", value: "0 Kz", color: "var(--tertiary)" },
        { label: "Em Atraso", value: "0 Kz", color: "var(--accent)" },
        { label: "Lucro Estimado", value: "0 Kz", color: "var(--primary)" }
    ]);

    const router = useRouter();
    const [auditLog, setAuditLog] = useState<string[]>([]);
    const [kycQueue, setKycQueue] = useState<KycItem[]>([]);
    const [creditRequests, setCreditRequests] = useState<CreditRequest[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [showAddUserModal, setShowAddUserModal] = useState(false);
    const [savingUser, setSavingUser] = useState(false);
    const [newUserForm, setNewUserForm] = useState({
        fullName: '', email: '', phone: '', bank: '',
        referralCode: generateReferralCode()
    });
    const [currentUserProfile, setCurrentUserProfile] = useState<UserProfile | null>(null);

    const [rules, setRules] = useState([
        { id: 1, condition: "SE salário < 100.000", action: "ENTÃO crédito máximo = 30.000" },
        { id: 2, condition: "SE cliente atrasou 2 vezes", action: "ENTÃO bloquear crédito" }
    ]);

    const [banks, setBanks] = useState(["BAI", "BFA", "BIC", "BPC", "Standard Bank", "Banco Atlântico"]);
    const [paymentMethods, setPaymentMethods] = useState([
        { name: "Multicaixa Express", active: true },
        { name: "Transferência Bancária", active: true },
        { name: "Unitel Money", active: true },
        { name: "Afrimoney", active: false }
    ]);

    // Fetch real data from Supabase
    useEffect(() => {
        const fetchData = async () => {
            // Check current user role
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('role, is_super_admin')
                    .eq('id', user.id)
                    .single();
                
                if (!profile || profile.role !== 'admin') {
                    router.push('/');
                    return;
                }
                setCurrentUserProfile(profile);
            } else {
                router.push('/login');
                return;
            }

            // Fetch profiles (for KYC queue and users list)
            const { data: profiles } = await supabase
                .from('profiles')
                .select('*')
                .order('created_at', { ascending: false });

            if (profiles) {
                // KYC queue: profiles that are not yet verified
                const pendingKyc = (profiles as any[])
                    .filter((p: any) => p.kyc_status !== 'verified')
                    .map((p: any, i: number) => ({
                        id: i + 1,
                        name: p.full_name || p.email || 'Sem nome',
                        date: new Date(p.created_at).toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }),
                        salary: p.monthly_salary ? `${Number(p.monthly_salary).toLocaleString()} Kz` : 'N/A',
                        risk: p.monthly_salary && p.monthly_salary > 150000 ? 'Baixo' : 'Médio',
                        riskColor: p.monthly_salary && p.monthly_salary > 150000 ? '#10b981' : '#f59e0b'
                    }));
                setKycQueue(pendingKyc);

                // All users
                const allUsers = (profiles as any[]).map((p: any, i: number) => ({
                    id: i + 1,
                    realId: p.id, // Keep the real UUID for deletion
                    name: p.full_name || 'Sem nome',
                    email: p.email || 'N/A',
                    referralCode: p.referral_code || '',
                    joined: new Date(p.created_at).toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', year: 'numeric' }),
                    status: p.profile_status === 'pending_update' ? 'Actualização Pendente' : p.kyc_status === 'verified' ? 'Ativo' : 'Pendente'
                }));
                setUsers(allUsers);
            }

            // Fetch credits
            const { data: credits } = await supabase
                .from('credits')
                .select('*, profiles(full_name)')
                .order('created_at', { ascending: false });

            if (credits) {
                const pending = (credits as any[])
                    .filter((c: any) => c.status === 'pending')
                    .map((c: any) => ({
                        id: c.id,
                        name: c.profiles?.full_name || 'Utilizador',
                        date: new Date(c.created_at).toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }),
                        amount: `${Number(c.amount).toLocaleString()} Kz`,
                        status: 'Pendente'
                    }));
                setCreditRequests(pending);

                // Calculate real stats
                const totalLent = (credits as any[])
                    .filter((c: any) => c.status === 'approved' || c.status === 'active')
                    .reduce((sum: number, c: any) => sum + (c.amount || 0), 0);
                const totalReceived = (credits as any[])
                    .filter((c: any) => c.status === 'paid')
                    .reduce((sum: number, c: any) => sum + (c.amount || 0), 0);
                const overdue = (credits as any[])
                    .filter((c: any) => c.status === 'overdue')
                    .reduce((sum: number, c: any) => sum + (c.amount || 0), 0);

                setStats([
                    { label: "Total Emprestado", value: `${totalLent.toLocaleString()} Kz`, color: "var(--primary)" },
                    { label: "Total Recebido", value: `${totalReceived.toLocaleString()} Kz`, color: "var(--tertiary)" },
                    { label: "Em Atraso", value: `${overdue.toLocaleString()} Kz`, color: "var(--accent)" },
                    { label: "Utilizadores", value: `${profiles?.length || 0}`, color: "var(--primary)" }
                ]);
            }

            setLoading(false);
        };

        fetchData();
    }, [router]);

    const handleAction = async (user: string, action: 'approved' | 'rejected', type: 'kyc' | 'credit') => {
        setAuditLog(prev => [...prev, `${type.toUpperCase()}: ${user} foi ${action === 'approved' ? 'aprovado' : 'rejeitado'}`]);
        alert(`${user}: ${action === 'approved' ? 'Aprovado' : 'Rejeitado'} com sucesso!`);

        if (type === 'kyc') {
            setKycQueue(prev => prev.filter(item => item.name !== user));
        } else {
            setCreditRequests(prev => prev.filter(item => item.name !== user));
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/');
    };

    const handleDeleteUser = async (userId: string, userName: string) => {
        if (!window.confirm(`Tem certeza que deseja excluir o utilizador ${userName}? Esta ação não pode ser desfeita.`)) {
            return;
        }

        const { error } = await supabase
            .from('profiles')
            .delete()
            .eq('id', userId);

        if (error) {
            alert('Erro ao excluir utilizador: ' + error.message);
        } else {
            alert('Utilizador excluído com sucesso!');
            setUsers(prev => prev.filter(u => u.realId !== userId));
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center' }}>
                <Loader2 size={48} className="animate-spin" style={{ color: 'var(--primary)' }} />
            </div>
        );
    }

    return (
        <>
            <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>
                {/* Sidebar */}
                <aside style={{ width: '280px', background: '#1e293b', padding: '2rem', color: 'white' }}>
                    <div style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '3rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ width: 24, height: 24, background: 'var(--gradient-primary)', borderRadius: '50%' }}></div>
                        Painel<span style={{ color: 'var(--primary)' }}>Admin</span>
                    </div>

                    <nav style={{ display: 'grid', gap: '0.5rem' }}>
                        <AdminSidebarItem icon={<BarChart3 size={20} />} label="Visão Geral" onClick={() => setActiveTab('overview')} active={activeTab === 'overview'} />
                        <AdminSidebarItem icon={<FileCheck size={20} />} label="Validação KYC" onClick={() => setActiveTab('kyc')} active={activeTab === 'kyc'} />
                        <AdminSidebarItem icon={<Landmark size={20} />} label="Gestão de Créditos" onClick={() => setActiveTab('credits')} active={activeTab === 'credits'} />
                        <AdminSidebarItem icon={<Users size={20} />} label="Utilizadores" onClick={() => setActiveTab('users')} active={activeTab === 'users'} />
                        <AdminSidebarItem icon={<Settings size={20} />} label="Definições" onClick={() => setActiveTab('settings')} active={activeTab === 'settings'} />
                        <AdminSidebarItem icon={<Wand2 size={20} />} label="Regras de Negócio" onClick={() => setActiveTab('rules')} active={activeTab === 'rules'} />
                        <div style={{ marginTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem' }}>
                            <AdminSidebarItem
                                icon={<LogOut size={20} />}
                                label="Terminar Sessão"
                                color="#ef4444"
                                onClick={() => handleLogout()}
                            />
                        </div>
                    </nav>
                </aside>

                {/* Main content */}
                <main style={{ flex: 1, padding: '2rem' }}>
                    <header style={{ marginBottom: '2rem' }}>
                        <h2 style={{ fontSize: '1.75rem', color: '#1e293b' }}>Gestão de Operações</h2>
                        <p style={{ color: '#64748b' }}>Controle de riscos e validação de microcrédito.</p>
                    </header>

                    {/* Financial Overview Card */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
                        {stats.map((stat, i) => (
                            <div key={i} className="card" style={{ padding: '1.5rem', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
                                <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '0.5rem' }}>{stat.label}</p>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: stat.color }}>{stat.value}</h3>
                            </div>
                        ))}
                    </div>

                    {/* Content Area */}
                    <div className="card" style={{ padding: '0', overflow: 'hidden', background: 'white' }}>
                        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)' }}>
                            <h4 style={{ fontSize: '1.125rem' }}>
                                {activeTab === 'overview' && 'Resumo de Atividades'}
                                {activeTab === 'kyc' && 'Fila de validação de documentos'}
                                {activeTab === 'credits' && 'Pedidos de crédito pendentes'}
                                {activeTab === 'users' && 'Gestão de Utilizadores'}
                                {activeTab === 'settings' && 'Definições da Plataforma'}
                                {activeTab === 'rules' && 'Configuração de Regras'}
                            </h4>
                        </div>

                        <div style={{ overflowX: 'auto' }}>
                            {activeTab === 'overview' && (
                                <div style={{ padding: '2rem' }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '2rem' }}>
                                        <div style={{ padding: '1.5rem', background: '#f8fafc', borderRadius: '12px' }}>
                                            <h5 style={{ marginBottom: '1rem', fontWeight: 'bold' }}>Alertas de Risco</h5>
                                            <p style={{ fontSize: '0.875rem', color: '#64748b' }}>Nenhum alerta crítico detetado nas últimas 24h.</p>
                                        </div>
                                        <div style={{ padding: '1.5rem', background: '#f8fafc', borderRadius: '12px' }}>
                                            <h5 style={{ marginBottom: '1rem', fontWeight: 'bold' }}>Log de Auditoria</h5>
                                            <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
                                                {auditLog.length === 0 ? "Sem ações recentes." : auditLog.slice(-3).map((log, i) => (
                                                    <div key={i} style={{ marginBottom: '0.5rem' }}>• {log}</div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'kyc' && (
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead style={{ background: '#f1f5f9' }}>
                                        <tr style={{ textAlign: 'left', color: '#64748b', fontSize: '0.875rem' }}>
                                            <th style={{ padding: '1rem 1.5rem' }}>Utilizador</th>
                                            <th>Data Submissão</th>
                                            <th>Salário Declarado</th>
                                            <th>Risco</th>
                                            <th style={{ textAlign: 'right', paddingRight: '1.5rem' }}>Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {kycQueue.map(item => (
                                            <AdminActionRow
                                                key={item.id}
                                                name={item.name}
                                                date={item.date}
                                                salary={item.salary}
                                                risk={item.risk}
                                                riskColor={item.riskColor}
                                                onApprove={() => handleAction(item.name, "approved", "kyc")}
                                                onReject={() => handleAction(item.name, "rejected", "kyc")}
                                            />
                                        ))}
                                        {kycQueue.length === 0 && <tr><td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: '#888' }}>Fila vazia.</td></tr>}
                                    </tbody>
                                </table>
                            )}

                            {activeTab === 'credits' && (
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead style={{ background: '#f1f5f9' }}>
                                        <tr style={{ textAlign: 'left', color: '#64748b', fontSize: '0.875rem' }}>
                                            <th style={{ padding: '1rem 1.5rem' }}>Solicitante</th>
                                            <th>Data</th>
                                            <th>Valor</th>
                                            <th>Status</th>
                                            <th style={{ textAlign: 'right', paddingRight: '1.5rem' }}>Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {creditRequests.map(item => (
                                            <tr key={item.id} style={{ borderBottom: '1px solid var(--border)', background: 'white', fontSize: '0.875rem' }}>
                                                <td style={{ padding: '1.25rem 1.5rem', fontWeight: 'bold' }}>{item.name}</td>
                                                <td style={{ color: '#64748b' }}>{item.date}</td>
                                                <td>{item.amount}</td>
                                                <td>{item.status}</td>
                                                <td style={{ textAlign: 'right', paddingRight: '1.5rem' }}>
                                                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                                        <button onClick={() => handleAction(item.name, "approved", "credit")} style={{ padding: '0.4rem', border: '1px solid #10b981', color: '#10b981', background: 'transparent', borderRadius: '4px', cursor: 'pointer' }}><Check size={16} /></button>
                                                        <button onClick={() => handleAction(item.name, "rejected", "credit")} style={{ padding: '0.4rem', border: '1px solid #ef4444', color: '#ef4444', background: 'transparent', borderRadius: '4px', cursor: 'pointer' }}><X size={16} /></button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        {creditRequests.length === 0 && <tr><td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: '#888' }}>Não há pedidos pendentes.</td></tr>}
                                    </tbody>
                                </table>
                            )}

                            {activeTab === 'users' && (
                                <div style={{ padding: '0' }}>
                                    {/* Actions bar */}
                                    <div style={{ padding: '1.5rem', display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border)', justifyContent: 'flex-end' }}>
                                        <button
                                            className="btn btn-outline"
                                            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.2rem', fontSize: '0.875rem' }}
                                            onClick={() => {
                                                const input = document.createElement('input');
                                                input.type = 'file';
                                                input.accept = '.csv,.xlsx,.xls';
                                                input.onchange = async (e: Event) => {
                                                    const target = e.target as HTMLInputElement;
                                                    const file = target.files?.[0];
                                                    if (!file) return;
                                                    const text = await file.text();
                                                    const lines = text.split('\n').filter((l: string) => l.trim());
                                                    if (lines.length < 2) { alert('Ficheiro vazio ou sem dados.'); return; }
                                                    const headers = lines[0].split(',').map((h: string) => h.trim().toLowerCase());
                                                    const nameIdx = headers.findIndex((h: string) => h.includes('nome'));
                                                    const emailIdx = headers.findIndex((h: string) => h.includes('email'));
                                                    const phoneIdx = headers.findIndex((h: string) => h.includes('telem') || h.includes('phone') || h.includes('telefone'));
                                                    if (nameIdx === -1 || emailIdx === -1) {
                                                        alert('O ficheiro deve ter colunas "Nome" e "Email".');
                                                        return;
                                                    }
                                                    let imported = 0;
                                                    for (let i = 1; i < lines.length; i++) {
                                                        const cols = lines[i].split(',').map((c: string) => c.trim());
                                                        const name = cols[nameIdx] || '';
                                                        const email = cols[emailIdx] || '';
                                                        const phone = phoneIdx !== -1 ? cols[phoneIdx] : '';
                                                        if (!name || !email) continue;
                                                        const { error } = await supabase.from('profiles').upsert({
                                                            email,
                                                            full_name: name,
                                                            phone: phone || null,
                                                            referral_code: generateReferralCode(),
                                                            profile_status: 'pending_update',
                                                            created_by_admin: true
                                                        }, { onConflict: 'email' });
                                                        if (!error) imported++;
                                                    }
                                                    alert(`${imported} utilizador(es) importado(s) com sucesso!`);
                                                    window.location.reload();
                                                };
                                                input.click();
                                            }}
                                        >
                                            <Upload size={16} /> Importar Excel/CSV
                                        </button>
                                        <button
                                            className="btn btn-primary"
                                            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.2rem', fontSize: '0.875rem' }}
                                            onClick={() => {
                                                setNewUserForm({ fullName: '', email: '', phone: '', bank: '', referralCode: generateReferralCode() });
                                                setShowAddUserModal(true);
                                            }}
                                        >
                                            <UserPlus size={16} /> Adicionar Utilizador
                                        </button>
                                    </div>
                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                        <thead style={{ background: '#f1f5f9' }}>
                                            <tr style={{ textAlign: 'left', color: '#64748b', fontSize: '0.875rem' }}>
                                                <th style={{ padding: '1rem 1.5rem' }}>Nome</th>
                                                <th>Email</th>
                                                <th>Cód. Referência</th>
                                                <th>Data Registo</th>
                                                <th>Estado</th>
                                                {currentUserProfile?.is_super_admin && <th style={{ textAlign: 'right', paddingRight: '1.5rem' }}>Ações</th>}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {users.map(user => (
                                                <tr key={user.id} style={{ borderBottom: '1px solid var(--border)', background: 'white', fontSize: '0.875rem' }}>
                                                    <td style={{ padding: '1.25rem 1.5rem', fontWeight: 'bold' }}>{user.name}</td>
                                                    <td style={{ color: '#64748b' }}>{user.email}</td>
                                                    <td><span style={{ fontFamily: 'monospace', background: '#f1f5f9', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem' }}>{user.referralCode || '---'}</span></td>
                                                    <td>{user.joined}</td>
                                                    <td>
                                                        <span style={{
                                                            padding: '0.25rem 0.5rem',
                                                            borderRadius: '4px',
                                                            background: user.status === 'Ativo' ? '#dcfce7' : user.status === 'Actualização Pendente' ? '#fef3c7' : '#f1f5f9',
                                                            color: user.status === 'Ativo' ? '#16a34a' : user.status === 'Actualização Pendente' ? '#d97706' : '#64748b',
                                                            fontSize: '0.75rem',
                                                            fontWeight: '600'
                                                        }}>
                                                            {user.status}
                                                        </span>
                                                    </td>
                                                    {currentUserProfile?.is_super_admin && (
                                                        <td style={{ textAlign: 'right', paddingRight: '1.5rem' }}>
                                                            <button 
                                                                onClick={() => handleDeleteUser(user.realId, user.name)}
                                                                style={{ color: '#ef4444', background: 'transparent', border: 'none', cursor: 'pointer' }}
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </td>
                                                    )}
                                                </tr>
                                            ))}
                                            {users.length === 0 && <tr><td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: '#888' }}>Nenhum utilizador registado.</td></tr>}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {activeTab === 'rules' && (
                                <div style={{ padding: '2rem' }}>
                                    <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <h5 style={{ fontWeight: 'bold', fontSize: '1.25rem' }}>Configuração de Regras Dinâmicas</h5>
                                            <p style={{ color: '#64748b', fontSize: '0.875rem' }}>Crie lógica condicional sem código.</p>
                                        </div>
                                        <button
                                            className="btn btn-primary"
                                            style={{ padding: '0.75rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                                            onClick={() => {
                                                const condition = prompt('Condição (SE ...):', 'SE salário < ');
                                                if (!condition) return;
                                                const action = prompt('Ação (ENTÃO ...):', 'ENTÃO ');
                                                if (!action) return;
                                                setRules(prev => [...prev, {
                                                    id: Date.now(),
                                                    condition: condition.startsWith('SE') ? condition : `SE ${condition}`,
                                                    action: action.startsWith('ENTÃO') ? action : `ENTÃO ${action}`
                                                }]);
                                            }}
                                        >
                                            <Plus size={18} /> Nova Regra
                                        </button>
                                    </div>
                                    <div style={{ display: 'grid', gap: '1rem' }}>
                                        {rules.map(rule => (
                                            <div key={rule.id} style={{ padding: '1.5rem', border: '1px solid var(--border)', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
                                                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                                    <div style={{ padding: '0.5rem', background: '#3b82f6', color: 'white', borderRadius: '8px' }}><Cpu size={20} /></div>
                                                    <div>
                                                        <span style={{ fontWeight: 'bold', color: '#1e293b' }}>{rule.condition}</span>
                                                        <ArrowRight size={16} style={{ margin: '0 1rem', color: '#94a3b8' }} />
                                                        <span style={{ color: '#059669', fontWeight: '600' }}>{rule.action}</span>
                                                    </div>
                                                </div>
                                                <button
                                                    style={{ color: '#ef4444', background: 'transparent', border: 'none', cursor: 'pointer' }}
                                                    onClick={() => setRules(prev => prev.filter(r => r.id !== rule.id))}
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        ))}
                                        {rules.length === 0 && (
                                            <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
                                                <Cpu size={48} style={{ marginBottom: '1rem', opacity: 0.3 }} />
                                                <p>Nenhuma regra configurada. Clique em &quot;Nova Regra&quot; para começar.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {activeTab === 'settings' && (
                                <div style={{ display: 'flex', minHeight: '600px' }}>
                                    {/* Sub-menu lateral das definições */}
                                    <div style={{ width: '240px', borderRight: '1px solid var(--border)', padding: '1.5rem', background: '#f1f5f9' }}>
                                        <h6 style={{ textTransform: 'uppercase', fontSize: '0.75rem', color: '#64748b', marginBottom: '1rem', fontWeight: 'bold' }}>Categorias</h6>
                                        <div style={{ display: 'grid', gap: '0.25rem' }}>
                                            <SettingsSubItem label="Crédito" active={activeSubTab === 'credit'} onClick={() => setActiveSubTab('credit')} icon={<CreditCard size={16} />} />
                                            <SettingsSubItem label="Multas/Atrasos" active={activeSubTab === 'fines'} onClick={() => setActiveSubTab('fines')} icon={<AlertCircle size={16} />} />
                                            <SettingsSubItem label="Utilizadores" active={activeSubTab === 'user_settings'} onClick={() => setActiveSubTab('user_settings')} icon={<Users size={16} />} />
                                            <SettingsSubItem label="KYC Verificação" active={activeSubTab === 'kyc_settings'} onClick={() => setActiveSubTab('kyc_settings')} icon={<Shield size={16} />} />
                                            <SettingsSubItem label="Bancos" active={activeSubTab === 'banks'} onClick={() => setActiveSubTab('banks')} icon={<Building2 size={16} />} />
                                            <SettingsSubItem label="Pagamentos" active={activeSubTab === 'payments'} onClick={() => setActiveSubTab('payments')} icon={<CreditCard size={16} />} />
                                            <SettingsSubItem label="Notificações" active={activeSubTab === 'notifications'} onClick={() => setActiveSubTab('notifications')} icon={<Bell size={16} />} />
                                            <SettingsSubItem label="Score Risco" active={activeSubTab === 'score'} onClick={() => setActiveSubTab('score')} icon={<BarChart3 size={16} />} />
                                            <SettingsSubItem label="Referências" active={activeSubTab === 'referrals'} onClick={() => setActiveSubTab('referrals')} icon={<Users size={16} />} />
                                            <SettingsSubItem label="Segurança" active={activeSubTab === 'security'} onClick={() => setActiveSubTab('security')} icon={<Shield size={16} />} />
                                            <SettingsSubItem label="Contratos" active={activeSubTab === 'contracts'} onClick={() => setActiveSubTab('contracts')} icon={<Gavel size={16} />} />
                                            <SettingsSubItem label="Sistema" active={activeSubTab === 'system'} onClick={() => setActiveSubTab('system')} icon={<Cpu size={16} />} />
                                            <SettingsSubItem label="Simulador" active={activeSubTab === 'sim_settings'} onClick={() => setActiveSubTab('sim_settings')} icon={<Plus size={16} />} />
                                            <SettingsSubItem label="Marca/Design" active={activeSubTab === 'branding'} onClick={() => setActiveSubTab('branding')} icon={<Palette size={16} />} />
                                        </div>
                                    </div>

                                    {/* Área de edição de cada sub-tab */}
                                    <div style={{ flex: 1, padding: '2rem' }}>
                                        {activeSubTab === 'credit' && (
                                            <div style={{ maxWidth: '600px' }}>
                                                <h5 style={{ marginBottom: '1.5rem', fontWeight: 'bold' }}>Definições de Crédito</h5>
                                                <div style={{ display: 'grid', gap: '1.5rem' }}>
                                                    <InputGroup label="Percentagem máxima sobre salário" subLabel="Ex: 40%" defaultValue="40%" />
                                                    <InputGroup label="Valor mínimo de crédito" subLabel="Ex: 10.000 Kz" defaultValue="10.000" />
                                                    <InputGroup label="Valor máximo de crédito" subLabel="Ex: 500.000 Kz" defaultValue="500.000" />
                                                    <div>
                                                        <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem' }}>Prazos Disponíveis</label>
                                                        <div style={{ display: 'flex', gap: '1rem' }}>
                                                            <CheckboxItem label="30 dias" checked />
                                                            <CheckboxItem label="60 dias" checked />
                                                            <CheckboxItem label="90 dias" />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {activeSubTab === 'banks' && (
                                            <div style={{ maxWidth: '600px' }}>
                                                <h5 style={{ marginBottom: '1.5rem', fontWeight: 'bold' }}>Bancos Aceites</h5>
                                                <div style={{ display: 'grid', gap: '1rem', marginBottom: '2rem' }}>
                                                    {banks.map((bank, i) => (
                                                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid var(--border)' }}>
                                                            <span>{bank}</span>
                                                            <button onClick={() => setBanks(banks.filter(b => b !== bank))} style={{ color: '#ef4444', background: 'transparent', border: 'none', cursor: 'pointer' }}><Trash2 size={16} /></button>
                                                        </div>
                                                    ))}
                                                </div>
                                                <button className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }} onClick={() => {
                                                    const b = prompt("Nome do Banco:");
                                                    if (b) setBanks([...banks, b]);
                                                }}><Plus size={18} /> Adicionar Banco</button>
                                            </div>
                                        )}

                                        {activeSubTab === 'branding' && (
                                            <div style={{ maxWidth: '600px' }}>
                                                <h5 style={{ marginBottom: '1.5rem', fontWeight: 'bold' }}>Personalização da Plataforma</h5>
                                                <div style={{ display: 'grid', gap: '1.5rem' }}>
                                                    <InputGroup label="Nome da Empresa" defaultValue="KwanzaCrédito" />
                                                    <InputGroup label="Mensagem da Landing Page" defaultValue="Onde os seus projetos ganham vida." />
                                                    <div>
                                                        <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem' }}>Cor Principal</label>
                                                        <input type="color" defaultValue="#FE6B00" style={{ width: '100px', height: '40px', padding: '4px', borderRadius: '8px' }} />
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {activeSubTab === 'fines' && (
                                            <div style={{ maxWidth: '600px' }}>
                                                <h5 style={{ marginBottom: '1.5rem', fontWeight: 'bold' }}>💰 Definições de Multas e Atrasos</h5>
                                                <div style={{ display: 'grid', gap: '1.5rem' }}>
                                                    <InputGroup label="Multa por atraso (Taxa Fixa)" subLabel="Ex: 5%" defaultValue="5%" />
                                                    <InputGroup label="Juros diário por atraso" subLabel="Ex: 1% ao dia" defaultValue="1%" />
                                                    <InputGroup label="Dias de tolerância" subLabel="Ex: 3 dias" defaultValue="3" />
                                                    <CheckboxItem label="Bloquear novo crédito se houver atraso ativo" checked />
                                                </div>
                                            </div>
                                        )}

                                        {activeSubTab === 'user_settings' && (
                                            <div style={{ maxWidth: '600px' }}>
                                                <h5 style={{ marginBottom: '1.5rem', fontWeight: 'bold' }}>👤 Definições de Utilizador</h5>
                                                <div style={{ display: 'grid', gap: '1.5rem' }}>
                                                    <CheckboxItem label="Aprovação automática de cadastro" />
                                                    <CheckboxItem label="Cadastro permitido apenas por referência" checked />
                                                    <InputGroup label="Número mínimo de contactos familiares" defaultValue="2" />
                                                    <div>
                                                        <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem' }}>Documentos Obrigatórios</label>
                                                        <div style={{ display: 'grid', gap: '0.5rem' }}>
                                                            <CheckboxItem label="BI frente" checked />
                                                            <CheckboxItem label="BI verso" checked />
                                                            <CheckboxItem label="Selfie com documento" checked />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {activeSubTab === 'kyc_settings' && (
                                            <div style={{ maxWidth: '600px' }}>
                                                <h5 style={{ marginBottom: '1.5rem', fontWeight: 'bold' }}>🪪 Definições de KYC (Verificação)</h5>
                                                <div style={{ display: 'grid', gap: '1.5rem' }}>
                                                    <InputGroup label="Nível de verificação obrigatório" defaultValue="Nível 2" />
                                                    <InputGroup label="Score mínimo para aprovação" defaultValue="650" />
                                                    <CheckboxItem label="Aprovação manual obrigatória por admin" checked />
                                                    <CheckboxItem label="Permitir edição de dados após verificação" />
                                                </div>
                                            </div>
                                        )}

                                        {activeSubTab === 'payments' && (
                                            <div style={{ maxWidth: '600px' }}>
                                                <h5 style={{ marginBottom: '1.5rem', fontWeight: 'bold' }}>💳 Métodos de Pagamento</h5>
                                                <div style={{ display: 'grid', gap: '1rem' }}>
                                                    {paymentMethods.map((method, i) => (
                                                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid var(--border)' }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                                {method.active ? <CheckCircle2 size={18} color="#10b981" /> : <X size={18} color="#ef4444" />}
                                                                <span style={{ fontWeight: '500' }}>{method.name}</span>
                                                            </div>
                                                            <button
                                                                className={`btn ${method.active ? 'btn-outline' : 'btn-primary'}`}
                                                                style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}
                                                                onClick={() => {
                                                                    const newMethods = [...paymentMethods];
                                                                    newMethods[i].active = !newMethods[i].active;
                                                                    setPaymentMethods(newMethods);
                                                                }}
                                                            >
                                                                {method.active ? "Desativar" : "Ativar"}
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {activeSubTab === 'notifications' && (
                                            <div style={{ maxWidth: '600px' }}>
                                                <h5 style={{ marginBottom: '1.5rem', fontWeight: 'bold' }}>🔔 Notificações</h5>
                                                <div style={{ display: 'grid', gap: '1.5rem' }}>
                                                    <NotificationConfig label="Crédito aprovado" defaultText="Seu crédito de {valor} Kz foi aprovado. Prazo: {data}." />
                                                    <NotificationConfig label="Crédito rejeitado" defaultText="Infelizmente o seu pedido de crédito foi recusado." />
                                                    <NotificationConfig label="Lembrete de pagamento" defaultText="Faltam 3 dias para o vencimento do seu crédito." />
                                                    <NotificationConfig label="Pagamento recebido" defaultText="Confirmamos a receção do seu pagamento de {valor} Kz." />
                                                </div>
                                            </div>
                                        )}

                                        {activeSubTab === 'score' && (
                                            <div style={{ maxWidth: '600px' }}>
                                                <h5 style={{ marginBottom: '1.5rem', fontWeight: 'bold' }}>📊 Score de Crédito</h5>
                                                <div style={{ display: 'grid', gap: '1.5rem' }}>
                                                    <InputGroup label="Pontuação por tempo de trabalho (Anual)" defaultValue="50 pts" />
                                                    <InputGroup label="Pontuação por salário (> 100k)" defaultValue="100 pts" />
                                                    <InputGroup label="Penalização por atraso" defaultValue="-150 pts" />
                                                    <InputGroup label="Limite de risco aceitável (Score)" defaultValue="400" />
                                                </div>
                                            </div>
                                        )}

                                        {activeSubTab === 'referrals' && (
                                            <div style={{ maxWidth: '600px' }}>
                                                <h5 style={{ marginBottom: '1.5rem', fontWeight: 'bold' }}>🎁 Sistema de Referências</h5>
                                                <div style={{ display: 'grid', gap: '1.5rem' }}>
                                                    <InputGroup label="Bónus por referência" defaultValue="1.000 Kz" />
                                                    <InputGroup label="Número máximo de convites" defaultValue="10" />
                                                    <CheckboxItem label="Código de referência automático ao registar" checked />
                                                    <InputGroup label="Comissão por indicação (%)" defaultValue="2%" />
                                                </div>
                                            </div>
                                        )}

                                        {activeSubTab === 'security' && (
                                            <div style={{ maxWidth: '600px' }}>
                                                <h5 style={{ marginBottom: '1.5rem', fontWeight: 'bold' }}>🛡 Segurança do Sistema</h5>
                                                <div style={{ display: 'grid', gap: '1.5rem' }}>
                                                    <CheckboxItem label="Ativar 2FA para administradores" checked />
                                                    <InputGroup label="Limite de tentativas de login" defaultValue="5" />
                                                    <InputGroup label="Sessão automática expirada (minutos)" defaultValue="30" />
                                                    <CheckboxItem label="Manter registo detalhado de atividades (logs)" checked />
                                                </div>
                                            </div>
                                        )}

                                        {activeSubTab === 'contracts' && (
                                            <div style={{ maxWidth: '600px' }}>
                                                <h5 style={{ marginBottom: '1.5rem', fontWeight: 'bold' }}>🧾 Contratos e Termos</h5>
                                                <div style={{ display: 'grid', gap: '1.5rem' }}>
                                                    <div>
                                                        <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem' }}>Termos de Crédito</label>
                                                        <textarea className="input-field" style={{ height: '100px', padding: '0.75rem', width: '100%' }} defaultValue="Termos e condições padrão para microcrédito..." />
                                                    </div>
                                                    <div>
                                                        <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem' }}>Política de Privacidade</label>
                                                        <textarea className="input-field" style={{ height: '100px', padding: '0.75rem', width: '100%' }} defaultValue="Privacidade dos dados assegurada conforme a Lei angolana..." />
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {activeSubTab === 'system' && (
                                            <div style={{ maxWidth: '600px' }}>
                                                <h5 style={{ marginBottom: '1.5rem', fontWeight: 'bold' }}>📈 Limites do Sistema</h5>
                                                <div style={{ display: 'grid', gap: '1.5rem' }}>
                                                    <InputGroup label="Máximo de crédito acumulado por utilizador" defaultValue="1.000.000 Kz" />
                                                    <InputGroup label="Número máximo de créditos ativos" defaultValue="1" />
                                                    <InputGroup label="Máximo de créditos por mês (Global)" defaultValue="500" />
                                                </div>
                                            </div>
                                        )}

                                        {activeSubTab === 'sim_settings' && (
                                            <div style={{ maxWidth: '600px' }}>
                                                <h5 style={{ marginBottom: '1.5rem', fontWeight: 'bold' }}>🧮 Simulador de Crédito</h5>
                                                <div style={{ display: 'grid', gap: '1.5rem' }}>
                                                    <InputGroup label="Fórmula de Cálculo Juros" defaultValue="VALOR * (1 + TAXA)" />
                                                    <InputGroup label="Arredondamento" defaultValue="0 casas decimais" />
                                                    <CheckboxItem label="Mostrar simulação na Landing Page" checked />
                                                </div>
                                            </div>
                                        )}

                                        <div style={{ marginTop: '3rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end' }}>
                                            <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }} onClick={() => alert("Definições guardadas com sucesso!")}>
                                                <Save size={18} /> Guardar Alterações
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>

            {/* Modal de cadastro de utilizador */}
            {showAddUserModal && (
                <div style={{
                    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }} onClick={() => setShowAddUserModal(false)}>
                    <div onClick={(e) => e.stopPropagation()} style={{
                        background: 'white', borderRadius: '24px', padding: '2.5rem',
                        width: '100%', maxWidth: '520px', boxShadow: '0 25px 50px rgba(0,0,0,0.15)',
                        maxHeight: '90vh', overflowY: 'auto'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                            <div>
                                <h3 style={{ fontSize: '1.5rem', fontWeight: '900', color: '#0F172A' }}>Novo Utilizador</h3>
                                <p style={{ color: '#64748b', fontSize: '0.875rem' }}>Cadastro pelo administrador</p>
                            </div>
                            <button onClick={() => setShowAddUserModal(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1.5rem', color: '#94a3b8' }}>&times;</button>
                        </div>

                        {/* Referral Code auto-generated */}
                        <div style={{ padding: '1rem', background: '#f0fdf4', borderRadius: '12px', marginBottom: '1.5rem', border: '1px solid #dcfce7' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <p style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: '600', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Código de Referência (auto)</p>
                                    <p style={{ fontSize: '1.25rem', fontWeight: '900', fontFamily: 'monospace', color: '#0F172A' }}>{newUserForm.referralCode}</p>
                                </div>
                                <button
                                    className="btn btn-outline"
                                    style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}
                                    onClick={() => setNewUserForm({ ...newUserForm, referralCode: generateReferralCode() })}
                                >
                                    Gerar novo
                                </button>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gap: '1.25rem' }}>
                            <div>
                                <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem', color: '#0F172A' }}>Nome Completo *</label>
                                <input
                                    type="text"
                                    className="input-field"
                                    placeholder="Ex: António Silva"
                                    value={newUserForm.fullName}
                                    onChange={(e) => setNewUserForm({ ...newUserForm, fullName: e.target.value })}
                                    style={{ padding: '0.85rem 1rem', borderRadius: '12px' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem', color: '#0F172A' }}>Email *</label>
                                <input
                                    type="email"
                                    className="input-field"
                                    placeholder="exemplo@email.com"
                                    value={newUserForm.email}
                                    onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                                    style={{ padding: '0.85rem 1rem', borderRadius: '12px' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem', color: '#0F172A' }}>Telemóvel</label>
                                <input
                                    type="text"
                                    className="input-field"
                                    placeholder="9xx xxx xxx"
                                    value={newUserForm.phone}
                                    onChange={(e) => setNewUserForm({ ...newUserForm, phone: e.target.value })}
                                    style={{ padding: '0.85rem 1rem', borderRadius: '12px' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem', color: '#0F172A' }}>Banco</label>
                                <select
                                    className="input-field"
                                    value={newUserForm.bank}
                                    onChange={(e) => setNewUserForm({ ...newUserForm, bank: e.target.value })}
                                    style={{ padding: '0.85rem 1rem', borderRadius: '12px' }}
                                >
                                    <option value="">Selecione o banco</option>
                                    {banks.map((b, i) => <option key={i} value={b}>{b}</option>)}
                                </select>
                            </div>
                        </div>

                        <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#fef3c7', borderRadius: '12px', border: '1px solid #fde68a', fontSize: '0.8rem', color: '#92400e' }}>
                            <strong>Nota:</strong> O utilizador será marcado como &quot;Actualização Pendente&quot;. Ao aceder ao sistema, será obrigado a completar os restantes dados (BI, contactos familiares, emprego).
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                            <button className="btn btn-outline" style={{ flex: 1, padding: '0.85rem' }} onClick={() => setShowAddUserModal(false)}>Cancelar</button>
                            <button
                                className="btn btn-primary"
                                style={{ flex: 2, padding: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                                disabled={!newUserForm.fullName || !newUserForm.email || savingUser}
                                onClick={async () => {
                                    setSavingUser(true);
                                    const { error } = await supabase.from('profiles').insert({
                                        full_name: newUserForm.fullName,
                                        email: newUserForm.email,
                                        phone: newUserForm.phone || null,
                                        bank_name: newUserForm.bank || null,
                                        referral_code: newUserForm.referralCode,
                                        profile_status: 'pending_update',
                                        created_by_admin: true
                                    });
                                    setSavingUser(false);
                                    if (error) {
                                        alert('Erro: ' + error.message);
                                    } else {
                                        alert(`${newUserForm.fullName} registado com sucesso!\nCódigo: ${newUserForm.referralCode}`);
                                        setShowAddUserModal(false);
                                        window.location.reload();
                                    }
                                }}
                            >
                                {savingUser ? <Loader2 size={18} className="animate-spin" /> : <><UserPlus size={18} /> Registar Utilizador</>}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}


interface AdminSidebarItemProps {
    icon: React.ReactNode;
    label: string;
    active?: boolean;
    color?: string;
    onClick: () => void;
}

function AdminSidebarItem({ icon, label, active = false, color, onClick }: AdminSidebarItemProps) {
    return (
        <div
            onClick={onClick}
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius)',
                background: active ? 'var(--primary)' : 'transparent',
                color: color || (active ? 'white' : '#94a3b8'),
                fontWeight: active ? 'bold' : 'normal',
                cursor: 'pointer',
                transition: 'all 0.2s'
            }}
        >
            {icon}
            <span>{label}</span>
        </div>
    );
}

interface AdminActionRowProps {
    name: string;
    date: string;
    salary: string;
    risk: string;
    riskColor: string;
    onApprove: () => void;
    onReject: () => void;
}

function AdminActionRow({ name, date, salary, risk, riskColor, onApprove, onReject }: AdminActionRowProps) {
    return (
        <tr style={{ borderBottom: '1px solid var(--border)', background: 'white', fontSize: '0.875rem' }}>
            <td style={{ padding: '1.25rem 1.5rem', fontWeight: 'bold' }}>{name}</td>
            <td style={{ color: '#64748b' }}>{date}</td>
            <td>{salary}</td>
            <td>
                <span style={{ color: riskColor, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <AlertCircle size={14} /> {risk}
                </span>
            </td>
            <td style={{ textAlign: 'right', paddingRight: '1.5rem' }}>
                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                    <button onClick={onApprove} className="btn" style={{ padding: '0.4rem', border: '1px solid #10b981', color: '#10b981', borderRadius: '4px' }}>
                        <Check size={16} />
                    </button>
                    <button onClick={onReject} className="btn" style={{ padding: '0.4rem', border: '1px solid #ef4444', color: '#ef4444', borderRadius: '4px' }}>
                        <X size={16} />
                    </button>
                </div>
            </td>
        </tr>
    );
}

interface SettingsSubItemProps {
    label: string;
    active: boolean;
    onClick: () => void;
    icon: React.ReactNode;
}

function SettingsSubItem({ label, active, onClick, icon }: SettingsSubItemProps) {
    return (
        <div
            onClick={onClick}
            style={{
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '0.875rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                background: active ? 'white' : 'transparent',
                color: active ? 'var(--primary)' : '#64748b',
                fontWeight: active ? '600' : 'normal',
                boxShadow: active ? '0 2px 4px rgba(0,0,0,0.05)' : 'none'
            }}
        >
            {icon}
            {label}
        </div>
    );
}

interface InputGroupProps {
    label: string;
    subLabel?: string;
    defaultValue: string;
}

function InputGroup({ label, subLabel, defaultValue }: InputGroupProps) {
    return (
        <div>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem' }}>{label}</label>
            <input type="text" defaultValue={defaultValue} className="input-field" style={{ padding: '0.75rem' }} />
            {subLabel && <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem' }}>{subLabel}</p>}
        </div>
    );
}

interface CheckboxItemProps {
    label: string;
    checked?: boolean;
}

function CheckboxItem({ label, checked = false }: CheckboxItemProps) {
    return (
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
            <input type="checkbox" defaultChecked={checked} />
            <span style={{ fontSize: '0.875rem' }}>{label}</span>
        </label>
    );
}

interface NotificationConfigProps {
    label: string;
    defaultText: string;
}

function NotificationConfig({ label, defaultText }: NotificationConfigProps) {
    return (
        <div style={{ padding: '1.25rem', border: '1px solid var(--border)', borderRadius: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <span style={{ fontWeight: 'bold' }}>{label}</span>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.75rem', background: '#e2e8f0', padding: '0.2rem 0.4rem', borderRadius: '4px' }}>SMS</span>
                    <span style={{ fontSize: '0.75rem', background: '#e2e8f0', padding: '0.2rem 0.4rem', borderRadius: '4px' }}>Email</span>
                    <span style={{ fontSize: '0.75rem', background: '#e2e8f0', padding: '0.2rem 0.4rem', borderRadius: '4px' }}>Push</span>
                </div>
            </div>
            <textarea className="input-field" style={{ height: '80px', padding: '0.75rem', fontSize: '0.875rem' }} defaultValue={defaultText} />
        </div>
    );
}

