"use client";

import { Wallet, History, Send, FileText, Bell, LogOut, LayoutDashboard } from "lucide-react";
import { motion } from "framer-motion";

export default function UserDashboard() {
    const stats = [
        { label: "Limite disponível", value: "60.000 Kz", color: "var(--tertiary)" },
        { label: "Em dívida", value: "0 Kz", color: "var(--accent)" },
        { label: "Bónus de referência", value: "2.500 Kz", color: "var(--primary)" }
    ];

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: '#f0f2f5' }}>
            {/* Sidebar */}
            <aside style={{ width: '280px', background: 'white', padding: '2rem', borderRight: '1px solid var(--border)' }}>
                <div style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '3rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ width: 24, height: 24, background: 'var(--gradient-primary)', borderRadius: '50%' }}></div>
                    Kwanza<span style={{ color: 'var(--primary)' }}>Crédito</span>
                </div>

                <nav style={{ display: 'grid', gap: '0.5rem' }}>
                    <SidebarItem icon={<LayoutDashboard size={20} />} label="Dashboard" active />
                    <SidebarItem icon={<Send size={20} />} label="Pedir Crédito" />
                    <SidebarItem icon={<History size={20} />} label="Histórico" />
                    <SidebarItem icon={<FileText size={20} />} label="Contratos" />
                    <SidebarItem icon={<Bell size={20} />} label="Notificações" />
                    <div style={{ marginTop: '2rem', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                        <SidebarItem icon={<LogOut size={20} />} label="Sair" color="var(--accent)" />
                    </div>
                </nav>
            </aside>

            {/* Main Content */}
            <main style={{ flex: 1, padding: '2rem' }}>
                <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <div>
                        <h2 style={{ fontSize: '1.5rem' }}>Olá, João Manuel</h2>
                        <p style={{ color: '#666' }}>Bem-vindo ao seu painel financeiro.</p>
                    </div>
                    <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        JM
                    </div>
                </header>

                {/* Stats Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
                    {stats.map((stat, i) => (
                        <div key={i} className="card" style={{ padding: '1.5rem' }}>
                            <p style={{ color: '#666', fontSize: '0.875rem', marginBottom: '0.5rem' }}>{stat.label}</p>
                            <h3 style={{ fontSize: '1.5rem', color: stat.color }}>{stat.value}</h3>
                        </div>
                    ))}
                </div>

                {/* Active Credit Box */}
                <div className="card glass" style={{ marginBottom: '2rem', background: 'var(--gradient-primary)', color: 'white', border: 'none' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h4 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Precisa de capital rápido?</h4>
                            <p style={{ opacity: 0.9 }}>Receba até 60.000 Kz na sua conta em minutos.</p>
                        </div>
                        <button className="btn" style={{ background: 'white', color: 'var(--primary)' }}>
                            Pedir Crédito
                        </button>
                    </div>
                </div>

                {/* History Table */}
                <div className="card" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h4 style={{ fontSize: '1.125rem' }}>Últimas atividades</h4>
                        <button style={{ color: 'var(--primary)', fontSize: '0.875rem', fontWeight: 'bold' }}>Ver tudo</button>
                    </div>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)', color: '#666', fontSize: '0.875rem' }}>
                                <th style={{ padding: '1rem 0' }}>Data</th>
                                <th>Tipo</th>
                                <th>Valor</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            <ActivityRow date="13 Mar, 2026" type="Recebimento de Bónus" amount="+2.500 Kz" status="Concluído" />
                            <ActivityRow date="12 Mar, 2026" type="Verificação de Identidade" amount="---" status="Verificado" />
                        </tbody>
                    </table>
                </div>
            </main>
        </div>
    );
}

function SidebarItem({ icon, label, active = false, color }: { icon: any, label: string, active?: boolean, color?: string }) {
    return (
        <div style={{
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
                    background: status === 'Concluído' || status === 'Verificado' ? 'rgba(0,135,81,0.1)' : 'rgba(0,0,0,0.05)',
                    color: status === 'Concluído' || status === 'Verificado' ? 'var(--tertiary)' : '#666'
                }}>
                    {status}
                </span>
            </td>
        </tr>
    );
}
