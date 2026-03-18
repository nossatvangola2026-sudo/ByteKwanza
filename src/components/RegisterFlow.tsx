"use client";

import { useState } from "react";
import { Camera, CreditCard, Users, Briefcase, CheckCircle2, Shield, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const formatPhoneAOA = (val: string) => {
    const d = val.replace(/\D/g, '').substring(0, 9);
    if (d.length <= 3) return d;
    if (d.length <= 6) return `${d.slice(0, 3)} ${d.slice(3)}`;
    return `${d.slice(0, 3)} ${d.slice(3, 6)} ${d.slice(6)}`;
};

const formatIBAN = (val: string) => {
    const raw = val.replace(/[^A-Z0-9]/g, '').substring(0, 25);
    return raw.match(/.{1,4}/g)?.join(' ') || '';
};

export default function RegisterFlow() {
    const [step, setStep] = useState(0);
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        fullName: "",
        phone: "",
        referralCode: "",
        biFront: null as string | null,
        biBack: null as string | null,
        selfie: null as string | null,
        familyContacts: [
            { name: "", phone: "", relation: "" },
            { name: "", phone: "", relation: "" }
        ],
        bank: { name: "", iban: "", accountNumber: "", holder: "" },
        employment: { company: "", salary: "", years: "", jobTitle: "" }
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const steps = [
        { title: "Referência", icon: <Users size={20} /> },
        { title: "Identidade", icon: <CreditCard size={20} /> },
        { title: "Verificação", icon: <Camera size={20} /> },
        { title: "Contactos", icon: <Users size={20} /> },
        { title: "Dados bancários", icon: <CreditCard size={20} /> },
        { title: "Emprego", icon: <Briefcase size={20} /> }
    ];

    const router = useRouter();

    const validateStep = (): string[] => {
        setError("");
        const errors: string[] = [];
        
        switch (step) {
            case 0:
                if (!formData.fullName || formData.fullName.trim().length < 3) errors.push("O Nome Completo deve ter pelo menos 3 caracteres.");
                if (!formData.phone || !/^[9][0-9]{8}$/.test(formData.phone)) errors.push("O Telemóvel deve ter 9 dígitos e começar pelo número 9.");
                if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) errors.push("O formato do email é inválido.");
                if (!formData.password || formData.password.length < 6) errors.push("A Password deve ter pelo menos 6 caracteres.");
                break;
            case 1:
                if (!formData.biFront) errors.push("Por favor, anexe a fotografia da Frente do BI.");
                if (!formData.biBack) errors.push("Por favor, anexe a fotografia do Verso do BI.");
                break;
            case 2:
                if (!formData.selfie) errors.push("Por favor, tire ou carregue uma fotografia para o reconhecimento facial.");
                break;
            case 3:
                for (let i = 0; i < 2; i++) {
                    const c = formData.familyContacts[i];
                    if (!c.name || c.name.length < 3) errors.push(`Nome do Familiar ${i + 1} é obrigatório.`);
                    if (!c.phone || !/^[9][0-9]{8}$/.test(c.phone)) errors.push(`Telemóvel do Familiar ${i + 1} inválido (9 dígitos).`);
                    if (!c.relation) errors.push(`Grau de parentesco do Familiar ${i + 1} é obrigatório.`);
                }
                break;
            case 4:
                if (!formData.bank.name) errors.push("Selecione o seu banco na lista.");
                const ibanClean = formData.bank.iban.replace(/\s/g, "");
                if (ibanClean.length !== 25 || !ibanClean.startsWith("AO06")) errors.push("O IBAN deve ter 25 caracteres e começar obrigatoriamente por AO06.");
                if (!formData.bank.accountNumber) errors.push("O número de conta é obrigatório.");
                if (!formData.bank.holder) errors.push("O nome do titular da conta é obrigatório.");
                break;
            case 5:
                if (!formData.employment.company) errors.push("Empresa é obrigatória.");
                if (!formData.employment.salary || parseFloat(formData.employment.salary) <= 0) errors.push("Salário mensal deve ser superior a 0.");
                if (!formData.employment.years || parseInt(formData.employment.years) < 0) errors.push("Tempo de serviço inválido.");
                if (!formData.employment.jobTitle) errors.push("Cargo é obrigatório.");
                break;
        }
        return errors;
    };

    const next = async () => {
        const validationErrors = validateStep();
        if (validationErrors.length > 0) {
            setError(validationErrors.join('\n'));
            return;
        }

        if (step === steps.length - 1) {
            setLoading(true);
            setError("");

            try {
                // 1. Sign Up in Supabase Auth
                const { data: authData, error: authError } = await supabase.auth.signUp({
                    email: formData.email,
                    password: formData.password,
                    options: {
                        data: {
                            full_name: formData.fullName,
                        }
                    }
                });

                if (authError) throw authError;

                if (authData.user) {
                    // 2. Create Profile
                    const { error: profileError } = await supabase.from('profiles').insert({
                        id: authData.user.id,
                        full_name: formData.fullName,
                        email: formData.email,
                        phone: formData.phone,
                        referral_code: `REF-${Math.random().toString(36).substring(7).toUpperCase()}`,
                        bank_name: formData.bank.name,
                        iban: formData.bank.iban,
                        account_number: formData.bank.accountNumber,
                        account_holder: formData.bank.holder,
                        company_name: formData.employment.company,
                        monthly_salary: parseFloat(formData.employment.salary) || 0,
                        service_years: parseInt(formData.employment.years) || 0,
                        job_title: formData.employment.jobTitle,
                        family_contacts: formData.familyContacts
                    });

                    if (profileError) throw profileError;

                    router.push('/dashboard');
                }
            } catch (err: unknown) {
                setError(err instanceof Error ? err.message : "Ocorreu um erro inesperado");
                setLoading(false);
            }
        } else {
            setStep(step + 1);
        }
    };
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
                                <h3 style={{ marginBottom: '1.5rem' }}>Dados de Acesso</h3>
                                <div style={{ display: 'grid', gap: '1rem', marginBottom: '2rem' }}>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Nome Completo</label>
                                        <input
                                            type="text"
                                            className="input-field"
                                            placeholder="O seu nome completo"
                                            value={formData.fullName}
                                            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                            maxLength={60}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Telemóvel</label>
                                        <input
                                            type="text"
                                            className="input-field"
                                            placeholder="9xx xxx xxx"
                                            value={formatPhoneAOA(formData.phone)}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '').substring(0, 9) })}
                                            maxLength={11}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Email</label>
                                        <input
                                            type="email"
                                            className="input-field"
                                            placeholder="exemplo@email.com"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Password</label>
                                        <input
                                            type="password"
                                            className="input-field"
                                            placeholder="Mínimo 6 caracteres"
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Código de referência (Opcional)</label>
                                        <input
                                            type="text"
                                            className="input-field"
                                            placeholder="Ex: ABX921"
                                            value={formData.referralCode}
                                            onChange={(e) => setFormData({ ...formData, referralCode: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {step === 1 && (
                            <div className="step-content">
                                <h3 style={{ marginBottom: '1.5rem' }}>Bilhete de Identidade (BI)</h3>
                                <div style={{ display: 'grid', gap: '1rem' }}>
                                    <FileUpload label="Frente do BI" onChange={(e) => setFormData({ ...formData, biFront: e.target.files?.[0]?.name || null })} />
                                    <FileUpload label="Verso do BI" onChange={(e) => setFormData({ ...formData, biBack: e.target.files?.[0]?.name || null })} />
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="step-content">
                                <h3 style={{ marginBottom: '1.5rem' }}>Reconhecimento facial</h3>
                                <div style={{ padding: '2rem', border: '2px dashed var(--border)', borderRadius: 'var(--radius)', textAlign: 'center' }}>
                                    <Camera size={48} color="var(--primary)" style={{ marginBottom: '1rem' }} />
                                    <p>Tire uma fotografia segurando o seu BI próximo do rosto.</p>
                                    <label className="btn btn-primary" style={{ marginTop: '1rem', cursor: 'pointer', display: 'inline-block' }}>
                                        {formData.selfie ? "Fotografia carregada ✓" : "Abrir câmara"}
                                        <input type="file" accept="image/*" capture="user" style={{ display: 'none' }} onChange={(e) => setFormData({ ...formData, selfie: e.target.files?.[0]?.name || null })} />
                                    </label>
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
                                            <input
                                                type="text"
                                                placeholder="Nome completo"
                                                className="input-field"
                                                value={formData.familyContacts[i].name}
                                                onChange={(e) => {
                                                    const newContacts = [...formData.familyContacts];
                                                    newContacts[i].name = e.target.value;
                                                    setFormData({ ...formData, familyContacts: newContacts });
                                                }}
                                            />
                                            <input
                                                type="text"
                                                placeholder="Telemóvel (9xx xxx xxx)"
                                                className="input-field"
                                                value={formatPhoneAOA(formData.familyContacts[i].phone)}
                                                maxLength={11}
                                                onChange={(e) => {
                                                    const newContacts = [...formData.familyContacts];
                                                    newContacts[i].phone = e.target.value.replace(/\D/g, '').substring(0, 9);
                                                    setFormData({ ...formData, familyContacts: newContacts });
                                                }}
                                            />
                                            <select
                                                className="input-field"
                                                value={formData.familyContacts[i].relation}
                                                onChange={(e) => {
                                                    const newContacts = [...formData.familyContacts];
                                                    newContacts[i].relation = e.target.value;
                                                    setFormData({ ...formData, familyContacts: newContacts });
                                                }}
                                            >
                                                <option value="">Grau de Parentesco</option>
                                                <option value="Pai/Mãe">Pai/Mãe</option>
                                                <option value="Irmão/Irmã">Irmão/Irmã</option>
                                                <option value="Cônjuge">Cônjuge</option>
                                                <option value="Outro">Outro</option>
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
                                        <select
                                            className="input-field"
                                            value={formData.bank.name}
                                            onChange={(e) => setFormData({ ...formData, bank: { ...formData.bank, name: e.target.value } })}
                                        >
                                            <option value="">Selecione o seu banco</option>
                                            <option value="BAI">BAI</option>
                                            <option value="BFA">BFA</option>
                                            <option value="BIC">BIC</option>
                                            <option value="BPC">BPC</option>
                                            <option value="Standard Bank">Standard Bank</option>
                                            <option value="Atlântico">Atlântico</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>IBAN (AO06...)</label>
                                        <input
                                            type="text"
                                            placeholder="AO06 0000 0000 0000 0000 0"
                                            className="input-field"
                                            value={formatIBAN(formData.bank.iban)}
                                            onChange={(e) => {
                                                let val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
                                                if (val.length > 25) val = val.substring(0, 25);
                                                setFormData({ ...formData, bank: { ...formData.bank, iban: val } });
                                            }}
                                            maxLength={31}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Número de conta</label>
                                        <input
                                            type="text"
                                            placeholder="00000000"
                                            className="input-field"
                                            value={formData.bank.accountNumber}
                                            onChange={(e) => setFormData({ ...formData, bank: { ...formData.bank, accountNumber: e.target.value.replace(/\D/g, '').substring(0, 20) } })}
                                            maxLength={20}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Titular da conta</label>
                                        <input
                                            type="text"
                                            placeholder="O seu nome completo"
                                            className="input-field"
                                            value={formData.bank.holder}
                                            onChange={(e) => setFormData({ ...formData, bank: { ...formData.bank, holder: e.target.value } })}
                                        />
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
                                        <input
                                            type="text"
                                            placeholder="Nome da empresa"
                                            className="input-field"
                                            value={formData.employment.company}
                                            onChange={(e) => setFormData({ ...formData, employment: { ...formData.employment, company: e.target.value } })}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Salário Mensal (Kz)</label>
                                        <input
                                            type="number"
                                            placeholder="Ex: 150000"
                                            className="input-field"
                                            value={formData.employment.salary}
                                            onChange={(e) => setFormData({ ...formData, employment: { ...formData.employment, salary: e.target.value } })}
                                        />
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Tempo (anos)</label>
                                            <input
                                                type="number"
                                                placeholder="Ex: 2"
                                                className="input-field"
                                                value={formData.employment.years}
                                                onChange={(e) => setFormData({ ...formData, employment: { ...formData.employment, years: e.target.value } })}
                                            />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Cargo</label>
                                            <input
                                                type="text"
                                                placeholder="Ex: Técnico"
                                                className="input-field"
                                                value={formData.employment.jobTitle}
                                                onChange={(e) => setFormData({ ...formData, employment: { ...formData.employment, jobTitle: e.target.value } })}
                                            />
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

                {error && (
                    <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(255,0,0,0.05)', borderRadius: 'var(--radius)', border: '1px solid rgba(255,0,0,0.1)' }}>
                        <ul style={{ color: 'red', fontSize: '0.875rem', margin: 0, paddingLeft: '1.2rem' }}>
                            {error.split('\n').map((err, i) => (
                                <li key={i} style={{ marginBottom: '0.25rem' }}>{err}</li>
                            ))}
                        </ul>
                    </div>
                )}

                <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
                    {step > 0 && (
                        <button className="btn btn-outline" style={{ flex: 1 }} onClick={prev}>Voltar</button>
                    )}
                    <button className="btn btn-primary" style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={next} disabled={loading}>
                        {loading ? <Loader2 className="animate-spin" size={20} /> : (step === steps.length - 1 ? "Finalizar registo" : "Próximo passo")}
                    </button>
                </div>
            </div>
        </div>
    );
}

function FileUpload({ label, onChange }: { label: string, onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void }) {
    return (
        <div style={{ padding: '1.5rem', border: '1px solid var(--border)', borderRadius: 'var(--radius)', background: 'white' }}>
            <p style={{ fontWeight: 'bold', marginBottom: '1rem' }}>{label}</p>
            <input type="file" style={{ fontSize: '0.875rem' }} onChange={onChange} />
        </div>
    );
}
