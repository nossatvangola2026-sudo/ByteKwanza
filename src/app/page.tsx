"use client";

import { ArrowRight, Shield, Zap, TrendingUp, CheckCircle2, PlayCircle, Star, Users, Clock, UserPlus, FileSearch, Wallet, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function LandingPage() {
  const [amount, setAmount] = useState(150000);
  const [months, setMonths] = useState(1);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Credit Calculation Logic
  const rate = months === 1 ? 0.35 : 0.45;
  const interest = amount * rate;
  const repayment = amount + interest;

  // State for Real-time Simulation
  const [lastApproval, setLastApproval] = useState({ name: "Kwanza", amount: "150.000" });

  useEffect(() => {
    const approvals = [
      { name: "Miguel", amount: "85.000" },
      { name: "Ana", amount: "220.000" },
      { name: "João", amount: "50.000" },
      { name: "Maria", amount: "350.000" },
      { name: "António", amount: "125.000" },
      { name: "Filomena", amount: "95.000" },
      { name: "Ricardo", amount: "410.000" },
      { name: "Isabel", amount: "15.000" },
      { name: "Domingos", amount: "280.000" },
      { name: "Teresa", amount: "65.000" },
      { name: "Paulo", amount: "500.000" },
      { name: "Rosa", amount: "180.000" },

      { name: "Carlos", amount: "140.000" },
      { name: "Helena", amount: "75.000" },
      { name: "Mateus", amount: "260.000" },
      { name: "Lúcia", amount: "90.000" },
      { name: "Pedro", amount: "310.000" },
      { name: "Sofia", amount: "45.000" },
      { name: "Manuel", amount: "170.000" },
      { name: "Carla", amount: "230.000" },
      { name: "Adriano", amount: "120.000" },
      { name: "Patrícia", amount: "360.000" }
    ];

    let timeoutId: NodeJS.Timeout;

    const showNext = () => {
      const randomApproval = approvals[Math.floor(Math.random() * approvals.length)];
      setLastApproval(randomApproval);

      // Random interval between 5 and 10 seconds
      const nextTime = Math.floor(Math.random() * (10000 - 5000 + 1)) + 5000;
      timeoutId = setTimeout(showNext, nextTime);
    };

    timeoutId = setTimeout(showNext, 5000);

    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <div style={{ background: 'var(--background)', minHeight: '100vh', color: 'var(--foreground)' }}>
      {/* Sticky Header */}
      <nav style={{
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid var(--border)',
        height: 'var(--header-height)'
      }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '100%' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.25rem', fontWeight: '800' }}>
            <div style={{
              width: 36, height: 36,
              background: 'orange',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
            }}>
              <TrendingUp size={20} />
            </div>
            <span>Kwanza<span style={{ color: 'var(--primary)' }}>Crédito</span></span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden-mobile" style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
            <Link href="#como-funciona" style={{ fontWeight: '600', color: '#475569' }}>Como funciona</Link>
            <Link href="#beneficios" style={{ fontWeight: '600', color: '#475569' }}>Benefícios</Link>
            <div style={{ display: 'flex', gap: '0.75rem', marginLeft: '1rem' }}>
              <Link href="/login" className="btn btn-outline" style={{ padding: '0.5rem 1.5rem', borderRadius: '10px' }}>Entrar</Link>
              <Link href="/register" className="btn btn-primary" style={{ padding: '0.5rem 1.5rem', borderRadius: '10px' }}>Criar conta</Link>
            </div>
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className="hidden-desktop" 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            style={{ padding: '0.5rem', color: '#1e293b' }}
          >
            {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              style={{
                position: 'absolute',
                top: 'var(--header-height)',
                left: 0,
                right: 0,
                background: 'white',
                borderBottom: '1px solid var(--border)',
                padding: '1.5rem',
                zIndex: 999,
                overflow: 'hidden'
              }}
            >
              <nav style={{ display: 'grid', gap: '1.25rem' }}>
                <Link href="#como-funciona" onClick={() => setIsMenuOpen(false)} style={{ fontSize: '1.1rem', fontWeight: '600', color: '#1e293b' }}>Como funciona</Link>
                <Link href="#beneficios" onClick={() => setIsMenuOpen(false)} style={{ fontSize: '1.1rem', fontWeight: '600', color: '#1e293b' }}>Benefícios</Link>
                <hr style={{ border: 'none', borderTop: '1px solid var(--border)' }} />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <Link href="/login" className="btn btn-outline" style={{ padding: '0.85rem', borderRadius: '12px' }}>Entrar</Link>
                  <Link href="/register" className="btn btn-primary" style={{ padding: '0.85rem', borderRadius: '12px' }}>Criar conta</Link>
                </div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Hero Section */}
      <section style={{ padding: '4rem 0 6rem' }}>
        <div className="container hero-grid">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="badge" style={{ display: 'inline-flex', marginBottom: '1.5rem', background: '#f0fdf4', color: '#16a34a', border: '1px solid #dcfce7', padding: '0.4rem 0.8rem', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '700' }}>
              <CheckCircle2 size={14} style={{ marginRight: '0.4rem' }} /> APROVADO EM MENOS DE 24H
            </div>
            <h1 className="hero-title">
              Microcrédito <br className="hidden-mobile" /> Rápido e Seguro <br className="hidden-mobile" /> para o trabalhador angolano
            </h1>
            <p className="hero-subtitle">
              Aceda a crédito de forma simples, rápida e transparente. Sem burocracia, sem filas. Tudo online e na palma da sua mão.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '1rem', marginBottom: '3rem' }}>
              <Link href="/register" className="btn btn-primary" style={{ padding: '1.1rem 2rem', fontSize: '1.05rem', borderRadius: '14px', flex: '1 1 auto', maxWidth: '280px' }}>
                Começar agora <ArrowRight size={20} />
              </Link>
              <Link href="#como-funciona" className="btn btn-outline" style={{ padding: '1.1rem 2rem', fontSize: '1.05rem', borderRadius: '14px', color: '#ea580c', border: '1px solid #ea580c', flex: '1 1 auto', maxWidth: '280px' }}>
                <PlayCircle size={20} /> Como funciona
              </Link>
            </div>

            {/* Social Proof */}
            <div className="social-proof-grid">
              <div>
                <div style={{ fontSize: '1.75rem', fontWeight: '900' }}>5.000+</div>
                <div style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: '500' }}>Clientes</div>
              </div>
              <div>
                <div style={{ fontSize: '1.75rem', fontWeight: '900' }}>98%</div>
                <div style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: '500' }}>Aprovação</div>
              </div>
              <div>
                <div style={{ fontSize: '1.75rem', fontWeight: '900' }}>24h</div>
                <div style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: '500' }}>Resposta</div>
              </div>
            </div>
          </motion.div>

          {/* Hero Visuals Redesigned */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            style={{ position: 'relative' }}
          >
            {/* The Large Orange Card Background from Mockup */}
            <div style={{
              position: 'absolute',
              top: '-15%',
              right: '-10%',
              width: '110%',
              height: '110%',
              background: 'linear-gradient(135deg, #f97316 0%, #fbbf24 100%)',
              borderRadius: '3rem',
              zIndex: -1,
              boxShadow: '0 40px 80px -20px rgba(249, 115, 22, 0.4)'
            }}></div>

            {/* Fixed Real-time Notifications - Adjusted for mobile */}
            <motion.div
              key={lastApproval.name}
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              style={{
                position: 'fixed',
                top: '80px',
                right: '20px',
                background: 'white',
                padding: '0.75rem 1rem',
                borderRadius: '1rem',
                boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                zIndex: 200,
                border: '1px solid #f0fdf4',
                pointerEvents: 'none'
              }}
            >
              <div style={{ width: 28, height: 28, background: '#dcfce7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16a34a' }}>
                <CheckCircle2 size={16} />
              </div>
              <div>
                <div style={{ fontSize: '0.9rem', fontWeight: '800', color: '#0F172A' }}>{lastApproval.amount} Kz</div>
                <div style={{ fontSize: '0.65rem', color: '#16a34a', fontWeight: '700' }}>Crédito para {lastApproval.name}</div>
              </div>
            </motion.div>

            <div className="card simulator-card" style={{ boxShadow: '0 30px 60px -15px rgba(0,0,0,0.2)' }}>
              <div className="simulator-header">
                <div style={{ width: 48, height: 48, background: '#fff7ed', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <TrendingUp color="var(--primary)" size={28} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: '900' }}>Simulador de Crédito</h3>
                  <p style={{ fontSize: '0.875rem', color: '#64748b' }}>Calcule o seu empréstimo ideal</p>
                </div>
              </div>

              <div style={{ marginBottom: '2.5rem' }}>
                <div className="simulator-value-row">
                  <span style={{ fontWeight: '700', color: '#0F172A', fontSize: '0.95rem' }}>Valor do empréstimo</span>
                  <span style={{ fontSize: 'clamp(1.5rem, 5vw, 3rem)', fontWeight: '950', color: '#ea580c', letterSpacing: '-0.02em' }}>
                    {amount.toLocaleString()} <span style={{ fontSize: '1rem', color: '#64748b', fontWeight: '700' }}>Kz</span>
                  </span>
                </div>
                <input
                  type="range"
                  min="10000"
                  max="500000"
                  step="5000"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  style={{ width: '100%', accentColor: '#ea580c', height: '10px', cursor: 'pointer' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: '#94a3b8', marginTop: '1rem', fontWeight: '600' }}>
                  <span>10.000 Kz</span>
                  <span>500.000 Kz</span>
                </div>
              </div>

              <div style={{ marginBottom: '3rem' }}>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button
                    onClick={() => setMonths(1)}
                    style={{
                      flex: 1,
                      background: months === 1 ? 'linear-gradient(to right, #f97316, #fbbf24)' : '#F8FAFC',
                      border: 'none',
                      color: months === 1 ? 'white' : '#64748b',
                      padding: '1.25rem',
                      borderRadius: '16px',
                      fontWeight: '700',
                      transition: 'all 0.2s',
                      boxShadow: months === 1 ? '0 10px 20px rgba(249, 115, 22, 0.2)' : 'none'
                    }}
                  >
                    1 Mês (35%)
                  </button>
                  <button
                    onClick={() => setMonths(2)}
                    disabled={amount < 200000}
                    style={{
                      flex: 1,
                      background: months === 2 ? 'linear-gradient(to right, #f97316, #fbbf24)' : '#F8FAFC',
                      border: 'none',
                      color: months === 2 ? 'white' : '#64748b',
                      padding: '1.25rem',
                      borderRadius: '16px',
                      fontWeight: '700',
                      opacity: amount < 200000 ? 0.4 : 1,
                      transition: 'all 0.2s',
                      boxShadow: months === 2 ? '0 10px 20px rgba(249, 115, 22, 0.2)' : 'none'
                    }}
                  >
                    2 Meses (45%)
                  </button>
                </div>
              </div>

              <div style={{ background: '#F8FAFC', borderRadius: '1.5rem', padding: '1.5rem 2rem', marginBottom: '3rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <span style={{ color: '#64748b', fontWeight: '600' }}>Juros</span>
                  <span style={{ fontWeight: '800', color: '#ea580c' }}>{interest.toLocaleString()} Kz</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.5rem', fontWeight: '950', borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
                  <span style={{ color: '#0F172A' }}>Total a pagar</span>
                  <span style={{ color: '#ea580c' }}>{repayment.toLocaleString()} Kz</span>
                </div>
              </div>

              <Link href="/register" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', padding: '1.5rem', fontSize: '1.25rem', borderRadius: '20px', textDecoration: 'none' }}>
                Criar conta e solicitar <ArrowRight size={24} style={{ marginLeft: '0.5rem' }} />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Como Funciona Section (Restored to 4-step horizontal) */}
      <section id="como-funciona" style={{ padding: '6rem 0', background: '#F8FAFC' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h2 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: '950', marginBottom: '1rem', letterSpacing: '-0.02em', color: '#0F172A' }}>Como Funciona</h2>
            <p style={{ color: '#64748b', fontSize: '1.1rem', fontWeight: '500' }}>Simples, rápido e transparente</p>
          </div>

          <div className="grid-responsive grid-responsive-2 lg:grid-responsive-4" style={{ gap: '2rem' }}>
            <StepCard number="1" icon={<UserPlus size={32} />} title="Registe-se" text="Crie a sua conta com um código de referência e complete o seu perfil." />
            <StepCard number="2" icon={<FileSearch size={32} />} title="Verificação KYC" text="Envie os seus documentos e complete a verificação facial." />
            <StepCard number="3" icon={<TrendingUp size={32} />} title="Simule o seu crédito" text="Use o nosso simulador para escolher o valor e o prazo ideal." />
            <StepCard number="4" icon={<Wallet size={32} />} title="Receba o dinheiro" text="Após a aprovação, o valor é depositado na sua conta." />
          </div>
        </div>
      </section>

      {/* Benefits Grid Section */}
      <section id="beneficios" style={{ padding: '6rem 0', background: 'white' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h2 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: '950', marginBottom: '1rem', color: '#0F172A' }}>Porquê o KwanzaCrédito?</h2>
            <p style={{ color: '#64748b', fontSize: '1.1rem', fontWeight: '500' }}>Atendimento humanizado e tecnologia de ponta.</p>
          </div>

          <div className="grid-responsive grid-responsive-2 lg:grid-responsive-3" style={{ gap: '2rem' }}>
            <MockFeature icon={<Clock size={32} />} title="Aprovação rápida" text="Resposta em menos de 24 horas após a análise completa." color="#fff7ed" />
            <MockFeature icon={<Shield size={32} />} title="100% Seguro" text="Os seus dados estão protegidos com criptografia de ponta." color="#f0fdf4" />
            <MockFeature icon={<Star size={32} />} title="Transparente" text="Sem taxas ocultas. Sabe exatamente quanto vai pagar." color="#fefce8" />
            <MockFeature icon={<Zap size={32} />} title="100% Digital" text="Todo o processo online, sem filas ou burocracia." color="#fef2f2" />
            <MockFeature icon={<Users size={32} />} title="Atendimento humano" text="Suporte dedicado para ajudar em todas as etapas." color="#faf5ff" />
            <MockFeature icon={<TrendingUp size={32} />} title="Limite crescente" text="Quanto mais usa, maior o seu limite de crédito." color="#ecfdf5" />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: '#0F172A', color: 'white', padding: '4rem 0 2rem' }}>
        <div className="container">
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center', gap: '2rem', marginBottom: '3rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.5rem', fontWeight: '900' }}>
              <TrendingUp size={28} color="#fb923c" />
              <span>Kwanza<span style={{ color: '#fb923c' }}>Crédito</span></span>
            </div>
            <div style={{ color: '#94a3b8', fontWeight: '500', textAlign: 'center' }}>© 2026 KwanzaCrédito. Todos os direitos reservados.</div>
          </div>
          <div style={{ textAlign: 'center', borderTop: '1px solid #1e293b', paddingTop: '2rem', color: '#64748b', fontSize: '0.875rem', fontWeight: '500' }}>
            Microcrédito rápido e seguro para o trabalhador angolano
          </div>
        </div>
      </footer>
    </div>
  );
}

function StepCard({ number, icon, title, text }: any) {
  return (
    <motion.div
      whileHover={{ y: -10 }}
      className="card"
      style={{ padding: '3rem 2rem', textAlign: 'center', position: 'relative', border: 'none', boxShadow: '0 20px 40px rgba(0,0,0,0.02)' }}
    >
      <div style={{
        position: 'absolute',
        top: '2rem',
        right: '2rem',
        width: 32, height: 32,
        background: '#f97316',
        color: 'white',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: '900',
        fontSize: '0.875rem'
      }}>
        {number}
      </div>
      <div style={{
        width: 80, height: 80,
        background: 'linear-gradient(135deg, #f97316 0%, #fbbf24 100%)',
        borderRadius: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '2rem',
        marginInline: 'auto',
        color: 'white',
        boxShadow: '0 10px 20px rgba(249, 115, 22, 0.2)'
      }}>
        {icon}
      </div>
      <h4 style={{ fontSize: '1.5rem', fontWeight: '900', marginBottom: '1.25rem', color: '#0F172A' }}>{title}</h4>
      <p style={{ color: '#64748b', lineHeight: '1.7', fontWeight: '500' }}>{text}</p>
    </motion.div>
  );
}

function MockFeature({ icon, title, text, color }: any) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="card"
      style={{ border: 'none', boxShadow: '0 4px 30px rgba(0,0,0,0.02)', textAlign: 'left', padding: '2.5rem' }}
    >
      <div style={{
        width: 64, height: 64,
        background: color,
        borderRadius: '18px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '1.75rem',
        color: '#0F172A'
      }}>
        {icon}
      </div>
      <h4 style={{ fontSize: '1.5rem', fontWeight: '900', marginBottom: '1.25rem', color: '#0F172A' }}>{title}</h4>
      <p style={{ color: '#64748b', lineHeight: '1.7', fontWeight: '500' }}>{text}</p>
    </motion.div>
  );
}
