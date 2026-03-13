"use client";

import { Users, FileCheck, Landmark, BarChart3, Settings, LogOut, Check, X, AlertCircle } from "lucide-react";
import { useState } from "react";

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState('kyc');

    const stats = [
        { label: "Total Emprestado", value: "2.450.000 Kz", color: "var(--primary)" },
        { label: "Total Recebido", value: "1.120.000 Kz", color: "var(--tertiary)" },
        { label: "Em Atraso", value: "450.000 Kz", color: "var(--accent)" },
        { label: "Lucro Estimado", value: "320.000 Kz", color: "var(--primary)" }
    ];

    return (
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
                    <AdminSidebarItem icon={<Settings size={20} />} label="Definições" />
                    <div style={{ marginTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem' }}>
                        <AdminSidebarItem icon={<LogOut size={20} />} label="Terminar Sessão" color="#ef4444" />
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
                <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
                    <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', background: 'white' }}>
                        <h4 style={{ fontSize: '1.125rem' }}>
                            {activeTab === 'kyc' ? 'Fila de validação de documentos' : 'Pedidos de crédito pendentes'}
                        </h4>
                    </div>

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
                            <AdminActionRow
                                name="António Gouveia"
                                date="13 Mar, 08:45"
                                salary="250.000 Kz"
                                risk="Baixo"
                                riskColor="#10b981"
                            />
                            <AdminActionRow
                                name="Maria dos Santos"
                                date="13 Mar, 09:12"
                                salary="120.000 Kz"
                                risk="Médio"
                                riskColor="#f59e0b"
                            />
                        </tbody>
                    </table>
                </div>
            </main>
        </div>
    );
}

function AdminSidebarItem({ icon, label, active = false, color, onClick }: any) {
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

function AdminActionRow({ name, date, salary, risk, riskColor }: any) {
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
                    <button className="btn" style={{ padding: '0.4rem', border: '1px solid #10b981', color: '#10b981', borderRadius: '4px' }}>
                        <Check size={16} />
                    </button>
                    <button className="btn" style={{ padding: '0.4rem', border: '1px solid #ef4444', color: '#ef4444', borderRadius: '4px' }}>
                        <X size={16} />
                    </button>
                </div>
            </td>
        </tr>
    );
}
