"use client";

import { useState } from "react";
import { Camera, CreditCard, Users, Briefcase, ChevronRight, CheckCircle2, Shield } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function RegisterFlow() {
    const [step, setStep] = useState(0);
    const [formData, setFormData] = useState({
        referralCode: "",
        biFront: null,
        biBack: null,
        selfie: null,
        familyContacts: [
            { name: "", phone: "", relation: "" },
            { name: "", phone: "", relation: "" }
        ],
        bank: { name: "", iban: "", accountNumber: "" },
        employment: { company: "", salary: "", years: "" }
    });

    const steps = [
        { title: "Referência", icon: <Users size={20} /> },
        { title: "Identidade", icon: <CreditCard size={20} /> },
        { title: "Verificação", icon: <Camera size={20} /> },
        { title: "Contactos", icon: <Users size={20} /> },
        { title: "Dados bancários", icon: <CreditCard size={20} /> },
        { title: "Emprego", icon: <Briefcase size={20} /> }
    ];

    const next = () => setStep(step + 1);
    const prev = () => setStep(step - 1);

    return (
        <div className="container section-padding" style={{ maxWidth: '600px' }}>
            <div className="card glass" style={{ padding: '2rem' }}>
                {/* Progress Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', overflowX: 'auto', paddingBottom: '1rem' }}>
                    {steps.map((s, i) => (
                        <div key={i} style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '0.5rem',
                            color: i <= step ? 'var(--primary)' : '#888',
                            minWidth: '70px'
                        }}>
                            <div style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '50%',
                                background: i <= step ? 'var(--gradient-primary)' : 'var(--border)',
                                color: i <= step ? 'white' : '#888',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.3s ease'
                            }}>
                                {i < step ? <CheckCircle2 size={16} /> : s.icon}
                            </div>
                            <span style={{ fontSize: '0.75rem', fontWeight: i === step ? 'bold' : 'normal' }}>{s.title}</span>
                        </div>
                    ))}
                </div>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={step}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                    >
                        {step === 0 && (
                            <div className="step-content">
                                <h3 style={{ marginBottom: '1.5rem' }}>Código de convite</h3>
                                <p style={{ color: '#666', marginBottom: '1.5rem' }}>
                                    O KwanzaCrédito é uma rede exclusiva. Introduza o código de quem o convidou para começar.
                                </p>
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Referência</label>
                                    <input
                                        type="text"
                                        placeholder="Ex: ABX921"
                                        style={{
                                            width: '100%',
                                            padding: '1rem',
                                            borderRadius: 'var(--radius)',
                                            border: '1px solid var(--border)',
                                            fontSize: '1rem'
                                        }}
                                        value={formData.referralCode}
                                        onChange={(e) => setFormData({ ...formData, referralCode: e.target.value })}
                                    />
                                </div>
                            </div>
                        )}

                        {step === 1 && (
                            <div className="step-content">
                                <h3 style={{ marginBottom: '1.5rem' }}>Bilhete de Identidade (BI)</h3>
                                <div style={{ display: 'grid', gap: '1rem' }}>
                                    <FileUpload label="Frente do BI" />
                                    <FileUpload label="Verso do BI" />
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="step-content">
                                <h3 style={{ marginBottom: '1.5rem' }}>Reconhecimento facial</h3>
                                <div style={{ padding: '2rem', border: '2px dashed var(--border)', borderRadius: 'var(--radius)', textAlign: 'center' }}>
                                    <Camera size={48} color="var(--primary)" style={{ marginBottom: '1rem' }} />
                                    <p>Tire uma fotografia segurando o seu BI próximo do rosto.</p>
                                    <button className="btn btn-primary" style={{ marginTop: '1rem' }}>Abrir câmara</button>
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="step-content">
                                <h3 style={{ marginBottom: '1.5rem' }}>Contactos familiares</h3>
                                <p style={{ color: '#666', marginBottom: '1.5rem' }}>Selecione 2 contactos de confiança.</p>
                                {[0, 1].map(i => (
                                    <div key={i} style={{ marginBottom: '1.5rem', padding: '1rem', background: 'rgba(0,0,0,0.02)', borderRadius: 'var(--radius)' }}>
                                        <p style={{ fontWeight: 'bold', marginBottom: '1rem' }}>Familiar {i + 1}</p>
                                        <div style={{ display: 'grid', gap: '1rem' }}>
                                            <input type="text" placeholder="Nome completo" className="input-field" />
                                            <input type="text" placeholder="Telemóvel" className="input-field" />
                                            <select className="input-field">
                                                <option>Grau de Parentesco</option>
                                                <option>Pai/Mãe</option>
                                                <option>Irmão/Irmã</option>
                                                <option>Cônjuge</option>
                                                <option>Outro</option>
                                            </select>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {step === 4 && (
                            <div className="step-content">
                                <h3 style={{ marginBottom: '1.5rem' }}>Dados bancários</h3>
                                <div style={{ display: 'grid', gap: '1.5rem' }}>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Banco</label>
                                        <select className="input-field">
                                            <option>Selecione o seu banco</option>
                                            <option>BAI</option>
                                            <option>BFA</option>
                                            <option>BIC</option>
                                            <option>BPC</option>
                                            <option>Standard Bank</option>
                                            <option>Atlântico</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>IBAN (AO06...)</label>
                                        <input type="text" placeholder="AO06 0000 0000 0000 0000 0" className="input-field" />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Número de conta</label>
                                        <input type="text" placeholder="00000000" className="input-field" />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Titular da conta</label>
                                        <input type="text" placeholder="O seu nome completo" className="input-field" />
                                    </div>
                                </div>
                            </div>
                        )}

                        {step === 5 && (
                            <div className="step-content">
                                <h3 style={{ marginBottom: '1.5rem' }}>Informação de Emprego</h3>
                                <div style={{ display: 'grid', gap: '1.5rem' }}>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Empresa</label>
                                        <input type="text" placeholder="Nome da empresa" className="input-field" />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Salário Mensal (Kz)</label>
                                        <input type="number" placeholder="Ex: 150000" className="input-field" />
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Tempo (anos)</label>
                                            <input type="number" placeholder="Ex: 2" className="input-field" />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Cargo</label>
                                            <input type="text" placeholder="Ex: Técnico" className="input-field" />
                                        </div>
                                    </div>
                                </div>
                                <div style={{ marginTop: '2rem', padding: '1rem', background: 'var(--tertiary)', color: 'white', borderRadius: 'var(--radius)', fontSize: '0.875rem' }}>
                                    <Shield size={16} /> As suas informações estão protegidas por criptografia de ponta a ponta.
                                </div>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>

                <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
                    {step > 0 && (
                        <button className="btn btn-outline" style={{ flex: 1 }} onClick={prev}>Voltar</button>
                    )}
                    <button className="btn btn-primary" style={{ flex: 2 }} onClick={next}>
                        {step === steps.length - 1 ? "Finalizar registo" : "Próximo passo"}
                    </button>
                </div>
            </div>
        </div>
    );
}

function FileUpload({ label }: { label: string }) {
    return (
        <div style={{ padding: '1.5rem', border: '1px solid var(--border)', borderRadius: 'var(--radius)', background: 'white' }}>
            <p style={{ fontWeight: 'bold', marginBottom: '1rem' }}>{label}</p>
            <input type="file" style={{ fontSize: '0.875rem' }} />
        </div>
    );
}
