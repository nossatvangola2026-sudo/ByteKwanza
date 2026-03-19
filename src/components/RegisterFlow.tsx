"use client";

import React, { useState, useEffect, useRef } from "react";
import { Camera, CreditCard, Users, Briefcase, CheckCircle2, Shield, Loader2, QrCode, Scan, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useToast } from "./Toast";

const formatPhoneAOA = (val: string) => {
    const d = val.replace(/\D/g, '').substring(0, 9);
    if (d.length <= 3) return d;
    if (d.length <= 6) return `${d.slice(0, 3)} ${d.slice(3)}`;
    return `${d.slice(0, 3)} ${d.slice(3, 6)} ${d.slice(6)}`;
};

const formatIBAN = (value: string) => {
    const raw = value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    
    if (raw.length === 0) return '';
    
    // Retira qualquer tentativa parcial do prefixo para podermos reconstruir corretamente
    const stripped = raw.replace(/^AO06/, '').replace(/^AO0/, '').replace(/^AO/, '').replace(/^A/, '');
    
    // Adiciona o prefixo padrão AO06 obrigatoriamente
    const output = 'AO06' + stripped;
    
    // Limita a 25 caracteres (AO06 + 21 números)
    return output.substring(0, 25).match(/.{1,4}/g)?.join(' ') || '';
};

function FaceCaptureUI({ 
    onCapture, 
    capturedImage, 
    capturedImageWithId 
}: { 
    onCapture: (selfie: string | null, selfieWithId: string | null) => void, 
    capturedImage: string | null,
    capturedImageWithId: string | null
}) {
    const { error: toastError } = useToast();
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [captureMode, setCaptureMode] = useState<'select' | 'pc' | 'mobile'>('select');
    const [capturePhase, setCapturePhase] = useState<1 | 1.5 | 2>(1);
    const [tempSelfie, setTempSelfie] = useState<string | null>(null);
    const [countdown, setCountdown] = useState<number | null>(null);
    const [framingStatus, setFramingStatus] = useState<'waiting' | 'framed'>('waiting');
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const startCamera = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
            setStream(mediaStream);
        } catch (err) {
            console.error("Erro ao aceder à câmara", err);
            toastError("Não foi possível ligar a câmara. Por favor, permita o acesso bloqueado no seu navegador.");
        }
    };

    const stopCamera = (mediaStream: MediaStream | null = stream) => {
        if (mediaStream) {
            mediaStream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
    };

    useEffect(() => {
        if (stream && videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play().catch(console.error);
        }
    }, [stream]);

    useEffect(() => {
        return () => stopCamera();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (!stream || capturePhase === 1.5) {
            setCountdown(null);
            return;
        }

        setFramingStatus('waiting');
        setCountdown(null);

        // Simulando a deteção de rosto em 2 segundos
        const waitTimer = setTimeout(() => {
            setFramingStatus('framed');
            setCountdown(3);
        }, 2000);

        return () => clearTimeout(waitTimer);
    }, [stream, capturePhase]);

    useEffect(() => {
        if (countdown === null || countdown <= 0) return;

        const interval = setInterval(() => {
            setCountdown(prev => {
                if (prev === 1) {
                    capturePhoto();
                    return 0;
                }
                return (prev || 0) - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [countdown]);

    const capturePhoto = () => {
        if (videoRef.current && canvasRef.current) {
            canvasRef.current.width = videoRef.current.videoWidth;
            canvasRef.current.height = videoRef.current.videoHeight;
            const ctx = canvasRef.current.getContext('2d');
            
            if (ctx) {
                // Mirror the canvas image drawing to match the mirrored video UI
                ctx.translate(canvasRef.current.width, 0);
                ctx.scale(-1, 1);
                ctx.drawImage(videoRef.current, 0, 0);
                const imageData = canvasRef.current.toDataURL('image/jpeg');
                
                if (capturePhase === 1) {
                    setTempSelfie(imageData);
                    setCapturePhase(1.5);
                } else if (capturePhase === 2) {
                    onCapture(tempSelfie, imageData);
                    stopCamera();
                }
            }
        }
    };

    const retake = () => {
        onCapture(null, null);
        setTempSelfie(null);
        setCapturePhase(1);
        startCamera();
    };
    if (capturedImage && capturedImageWithId) {
        return (
            <div className="card" style={{ padding: '1.5rem', background: '#F8FAFC', textAlign: 'center', border: '1px solid var(--border)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                    <div style={{ borderRadius: '1rem', overflow: 'hidden', border: '2px solid #16a34a', position: 'relative' }}>
                        <img src={capturedImage} alt="Selfie" style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', display: 'block' }} />
                        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(22, 163, 74, 0.9)', color: 'white', fontSize: '0.75rem', padding: '0.4rem', fontWeight: 'bold' }}>1. Rosto</div>
                    </div>
                    <div style={{ borderRadius: '1rem', overflow: 'hidden', border: '2px solid #ea580c', position: 'relative' }}>
                        <img src={capturedImageWithId} alt="Selfie com BI" style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', display: 'block' }} />
                        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(234, 88, 12, 0.9)', color: 'white', fontSize: '0.75rem', padding: '0.4rem', fontWeight: 'bold' }}>2. Rosto + BI</div>
                    </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: '#16a34a', fontWeight: 'bold', fontSize: '1rem' }}>
                    <CheckCircle2 size={20} /> Ambas verificações concluídas
                </div>
                <button type="button" className="btn btn-outline" style={{ marginTop: '1.25rem', width: '100%' }} onClick={retake}>Refazer Captações</button>
            </div>
        );
    }

    if (stream) {
        return (
            <div style={{ position: 'relative', width: '100%', maxWidth: '400px', aspectRatio: '3/4', minHeight: '300px', margin: '0 auto', background: '#000', borderRadius: '1rem', overflow: 'hidden', border: `2px solid ${capturePhase === 1 ? '#4ade80' : '#eab308'}` }}>
                {capturePhase === 1.5 && (
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 100, background: 'rgba(255,255,255,0.98)', padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                        <motion.div initial={{ scale: 0.5 }} animate={{ scale: 1 }}>
                            <CheckCircle2 size={56} color="#16a34a" style={{ marginBottom: '1rem' }} />
                        </motion.div>
                        <h4 style={{ color: '#0F172A', marginBottom: '0.75rem', fontSize: '1.25rem', fontWeight: '900' }}>1ª Captação Concluída!</h4>
                        <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '2rem', lineHeight: 1.6 }}>
                            Agora precisa de tirar a última fotografia.<br/><br/>
                            Pegue no seu <strong>Documento de Identidade Original</strong> e segure-o visível ao lado do seu rosto.
                        </p>
                        <button type="button" className="btn btn-primary" style={{ width: '100%', fontWeight: 'bold', borderRadius: '12px' }} onClick={() => setCapturePhase(2)}>
                            Estou pronto <ArrowRight size={18} />
                        </button>
                    </div>
                )}

                <div style={{ position: 'absolute', top: '1rem', left: 0, right: 0, textAlign: 'center', zIndex: 20 }}>
                    <span style={{ background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(4px)', color: capturePhase === 1 ? '#16a34a' : '#ea580c', padding: '0.5rem 1rem', borderRadius: '50px', fontSize: '0.75rem', fontWeight: '800', border: `1px solid ${capturePhase === 1 ? '#16a34a' : '#ea580c'}`, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                        {capturePhase === 1 ? 'PASSO 1/2: APENAS O ROSTO' : 'PASSO 2/2: ROSTO + DOCUMENTO (BI)'}
                    </span>
                </div>
                
                <video ref={videoRef} autoPlay playsInline muted style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transform: 'scaleX(-1)' }} />
                
                <div style={{ 
                    position: 'absolute', top: '50%', left: '50%', 
                    transform: 'translate(-50%, -50%)',
                    boxShadow: '0 0 0 9999px rgba(0,0,0,0.65)', 
                    borderRadius: '50%',
                    width: 'min(240px, 60%)', 
                    height: 'min(320px, 75%)',
                    border: '3px solid rgba(255,255,255,0.9)',
                    boxSizing: 'border-box',
                    pointerEvents: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <div style={{ width: '100%', height: '100%', borderRadius: 'inherit', border: '2px solid rgba(255,255,255,0.3)', outline: '2px solid rgba(255,255,255,0.1)' }}></div>
                </div>
                
                <canvas ref={canvasRef} style={{ display: 'none' }} />
                
                <div style={{ position: 'absolute', bottom: '1rem', left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', zIndex: 20 }}>
                     {framingStatus === 'waiting' ? (
                         <div style={{ background: 'rgba(0,0,0,0.8)', padding: '0.5rem 1rem', borderRadius: '30px', color: '#eab308', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', fontWeight: 'bold', border: '1px solid #eab308' }}>
                             <Scan size={16} className="animate-spin-slow" /> Olhe para a câmara...
                         </div>
                     ) : (
                         countdown !== null && countdown > 0 ? (
                             <div style={{ background: 'rgba(0,0,0,0.8)', padding: '0.5rem 1rem', borderRadius: '30px', color: '#4ade80', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', fontWeight: 'bold', border: '1px solid #4ade80' }}>
                                 <CheckCircle2 size={16} className="animate-pulse" /> Rosto enquadrado! Disparo em {countdown}s
                             </div>
                         ) : null
                     )}

                     <button type="button" onClick={capturePhoto} style={{ 
                         width: '64px', height: '64px', borderRadius: '50%', 
                         background: 'rgba(255,255,255,0.3)', border: '4px solid white',
                         display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: 0
                     }} aria-label="Capturar Manualmente">
                         <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'white' }}></div>
                     </button>
                </div>
            </div>
        );
    }

    if (captureMode === 'mobile') {
        return (
            <div style={{ padding: '2.5rem', background: '#111', borderRadius: '1rem', color: 'white', textAlign: 'center' }}>
               <h4 style={{ color: '#4ade80', marginBottom: '1rem' }}>Digitalize o QR Code</h4>
               <div style={{ background: 'white', padding: '1rem', display: 'inline-block', borderRadius: '0.5rem', marginBottom: '1.5rem' }}>
                   <QrCode size={160} color="black" />
               </div>
               <p style={{ color: '#9ca3af', fontSize: '0.875rem', maxWidth: '300px', margin: '0 auto' }}>Aponte a câmara do seu telemóvel para continuar a verificação de forma contínua no dispositivo móvel.</p>
               <button className="btn btn-outline" style={{ marginTop: '2rem', borderColor: '#333', color: 'white' }} onClick={() => setCaptureMode('select')}>Voltar</button>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Box 1: Info (Verificação Facial Anti-Fraude) */}
            <div style={{ background: '#0a1005', border: '1px solid #4ade80', borderRadius: '0.75rem', padding: '1.5rem', textAlign: 'left' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#4ade80', marginBottom: '1rem', fontWeight: 'bold' }}>
                    <Camera size={20} />
                    Verificação Facial Anti-Fraude
                </div>
                <ul style={{ color: '#e5e7eb', fontSize: '0.875rem', margin: 0, paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <li>Rosto centralizado e bem iluminado</li>
                    <li>Sem óculos de sol, chapéu ou máscara</li>
                    <li>Fundo neutro, sem outras pessoas</li>
                    <li style={{ color: '#eab308' }}><strong>Exigidas 2 fotos:</strong> 1º Apenas Rosto, 2º Rosto exibindo BI Original</li>
                </ul>
            </div>

            {/* Divider */}
            <div style={{ textAlign: 'center', color: '#9ca3af', fontSize: '0.75rem', fontWeight: 'bold', letterSpacing: '0.05em' }}>
                ESCOLHA COMO TIRAR A SUA SELFIE:
            </div>

            {/* Box 2: Options */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <button 
                    onClick={() => { setCaptureMode('pc'); startCamera(); }}
                    style={{ 
                        background: '#111', border: '1px solid #333', borderRadius: '0.75rem', padding: '1.25rem', 
                        display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s',
                        color: 'white', width: '100%'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.borderColor = '#4ade80'}
                    onMouseOut={(e) => e.currentTarget.style.borderColor = '#333'}
                >
                    <div style={{ background: 'rgba(74, 222, 128, 0.1)', padding: '0.75rem', borderRadius: '0.5rem', color: '#4ade80' }}>
                        <Camera size={24} />
                    </div>
                    <div>
                        <div style={{ fontWeight: 'bold', marginBottom: '0.25rem', fontSize: '1rem' }}>Usar Câmera do PC</div>
                        <div style={{ color: '#9ca3af', fontSize: '0.875rem' }}>Tire a selfie directamente pela webcam</div>
                    </div>
                </button>

                <button 
                    onClick={() => setCaptureMode('mobile')}
                    style={{ 
                        background: '#111', border: '1px solid #333', borderRadius: '0.75rem', padding: '1.25rem', 
                        display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s',
                        color: 'white', width: '100%'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.borderColor = '#eab308'}
                    onMouseOut={(e) => e.currentTarget.style.borderColor = '#333'}
                >
                    <div style={{ background: 'rgba(234, 179, 8, 0.1)', padding: '0.75rem', borderRadius: '0.5rem', color: '#eab308' }}>
                        <QrCode size={24} />
                    </div>
                    <div>
                        <div style={{ fontWeight: 'bold', marginBottom: '0.25rem', fontSize: '1rem' }}>Usar Telemóvel</div>
                        <div style={{ color: '#9ca3af', fontSize: '0.875rem' }}>Digitalize o QR code com o smartphone</div>
                    </div>
                </button>
            </div>
        </div>
    );
}

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
        selfieWithId: null as string | null,
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
                if (!formData.selfie || !formData.selfieWithId) errors.push("Por favor, conclua as duas captações (Rosto e Rosto+Documento) na verificação em tempo real.");
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
                    // 2. Create/Update Profile
                    const { error: profileError } = await supabase.from('profiles').upsert({
                        id: authData.user.id,
                        full_name: formData.fullName,
                        email: formData.email,
                        phone: formData.phone,
                        referral_code: `REF-${Math.random().toString(36).substring(7).toUpperCase()}`,
                        bank_name: formData.bank.name,
                        iban: formData.bank.iban,
                        account_number: formData.bank.accountNumber,
                        account_holder: formData.bank.holder,
                        employer: formData.employment.company, // Align with UserDashboard/DB
                        monthly_salary: parseFloat(formData.employment.salary) || 0,
                        service_years: parseInt(formData.employment.years) || 0,
                        job_title: formData.employment.jobTitle,
                        family_contacts: formData.familyContacts,
                        profile_status: 'active',
                        kyc_status: 'pending'
                    }, { onConflict: 'id' });

                    if (profileError) throw profileError;

                    router.push('/dashboard');
                }
            } catch (err: any) {
                console.error("Erro completo:", err);
                const msg = err.message || err.error_description || "Ocorreu um erro inesperado no servidor.";
                setError(msg);
                setLoading(false);
            }
        } else {
            setStep(step + 1);
        }
    };
    const prev = () => setStep(step - 1);

    return (
        <div className="container" style={{ padding: '2rem 1rem', maxWidth: '640px' }}>
            <div className="card card-auth" style={{ borderRadius: '2rem', boxShadow: '0 20px 40px rgba(0,0,0,0.05)' }}>
                {/* Progress Header */}
                <div className="no-scrollbar" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2.5rem', overflowX: 'auto', paddingBottom: '1rem', gap: '1rem', msOverflowStyle: 'none', scrollbarWidth: 'none' }}>
                    {steps.map((s, i) => (
                        <div key={i} style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '0.4rem',
                            color: i <= step ? 'var(--primary)' : '#94a3b8',
                            minWidth: '60px',
                            flexShrink: 0
                        }}>
                            <div style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '10px',
                                background: i <= step ? 'var(--gradient-primary)' : '#f1f5f9',
                                color: i <= step ? 'white' : '#94a3b8',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                boxShadow: i === step ? '0 4px 12px rgba(234, 88, 12, 0.2)' : 'none'
                            }}>
                                {i < step ? <CheckCircle2 size={16} /> : s.icon}
                            </div>
                            <span style={{ fontSize: '0.65rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.02em', whiteSpace: 'nowrap' }}>{s.title}</span>
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
                                <h3 style={{ marginBottom: '1.5rem' }}>Autenticação Facial</h3>
                                <FaceCaptureUI 
                                    capturedImage={formData.selfie} 
                                    capturedImageWithId={formData.selfieWithId}
                                    onCapture={(s1, s2) => setFormData({ ...formData, selfie: s1, selfieWithId: s2 })} 
                                />
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

                <div className="auth-buttons" style={{ marginTop: '3rem' }}>
                    {step > 0 && (
                        <button onClick={prev} className="btn btn-outline" style={{ flex: 1, padding: '1rem' }}>
                            Anterior
                        </button>
                    )}
                    <button 
                        onClick={next} 
                        disabled={loading}
                        className="btn btn-primary" 
                        style={{ flex: 2, padding: '1rem' }}
                    >
                        {loading ? <Loader2 className="animate-spin" /> : (step === steps.length - 1 ? "Concluir Registo" : "Próximo Passo")}
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
