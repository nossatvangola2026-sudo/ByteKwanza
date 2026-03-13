"use client";

import { ArrowRight, Shield, Zap, TrendingUp, CheckCircle2, PlayCircle, Star, Users, Clock, UserPlus, FileSearch, Wallet } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function LandingPage() {
  const [amount, setAmount] = useState(150000);
  const [months, setMonths] = useState(1);

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
      { name: "Rosa", amount: "180.000" }
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
        zIndex: 100,
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid var(--border)'
      }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '80px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.5rem', fontWeight: '800' }}>
            <div style={{
              width: 40, height: 40,
              background: 'orange',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
            }}>
              <TrendingUp size={24} />
            </div>
            <span>Kwanza<span style={{ color: 'var(--primary)' }}>Crédito</span></span>
          </div>

          <div style={{ display: 'flex', gap: '2.5rem', alignItems: 'center' }}>
            <Link href="#como-funciona" className="btn-ghost" style={{ fontWeight: '600' }}>Como funciona</Link>
            <Link href="#beneficios" className="btn-ghost" style={{ fontWeight: '600' }}>Benefícios</Link>
            <div style={{ display: 'flex', gap: '1rem', marginLeft: '1.5rem' }}>
              <button className="btn btn-outline" style={{ border: '1px solid #E5E7EB', color: '#374151', padding: '0.6rem 1.8rem', borderRadius: '12px' }}>Entrar</button>
              <button className="btn btn-primary" style={{ padding: '0.6rem 1.8rem', borderRadius: '12px' }}>Criar conta</button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{ padding: '5rem 0 8rem' }}>
        <div className="container" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '4rem', alignItems: 'center' }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="badge" style={{ marginBottom: '2.5rem', background: '#f0fdf4', color: '#16a34a', border: '1px solid #dcfce7' }}>
              <CheckCircle2 size={14} /> APROVADO EM MENOS DE 24H
            </div>
            <h1 style={{ fontSize: '5.5rem', lineHeight: '1.05', fontWeight: '950', marginBottom: '2.5rem', letterSpacing: '-0.04em', color: '#0F172A' }}>
              Microcrédito <br /> Rápido e Seguro <br /> para o trabalhador angolano
            </h1>
            <p style={{ fontSize: '1.25rem', color: '#475569', marginBottom: '3.5rem', maxWidth: '580px', lineHeight: '1.7' }}>
              Aceda a crédito de forma simples, rápida e transparente. Sem burocracia, sem filas. Tudo online e na palma da sua mão.
            </p>
            <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '5rem' }}>
              <button className="btn btn-primary" style={{ padding: '1.25rem 2.5rem', fontSize: '1.1rem', borderRadius: '16px' }}>
                Começar agora <ArrowRight size={20} />
              </button>
              <button className="btn btn-outline" style={{ padding: '1.25rem 2.5rem', fontSize: '1.1rem', borderRadius: '16px', color: '#ea580c', border: '1px solid #ea580c' }}>
                <PlayCircle size={20} /> Ver como funciona
              </button>
            </div>

            {/* Social Proof */}
            <div style={{ display: 'flex', gap: '4rem' }}>
              <div>
                <div style={{ fontSize: '2.25rem', fontWeight: '900' }}>5.000+</div>
                <div style={{ color: '#64748b', fontSize: '0.95rem', fontWeight: '500' }}>Clientes</div>
              </div>
              <div>
                <div style={{ fontSize: '2.25rem', fontWeight: '900' }}>98%</div>
                <div style={{ color: '#64748b', fontSize: '0.95rem', fontWeight: '500' }}>Aprovação</div>
              </div>
              <div>
                <div style={{ fontSize: '2.25rem', fontWeight: '900' }}>24h</div>
                <div style={{ color: '#64748b', fontSize: '0.95rem', fontWeight: '500' }}>Resposta</div>
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

            {/* Fixed Real-time Notifications - Moved to top-right corner to avoid overlap */}
            <motion.div
              key={lastApproval.name}
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              style={{
                position: 'fixed',
                top: '100px', // Below the sticky header
                right: '40px',
                background: 'white',
                padding: '1rem 1.5rem',
                borderRadius: '1.25rem',
                boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                zIndex: 200,
                border: '1px solid #f0fdf4',
                pointerEvents: 'none' // Don't block clicks
              }}
            >
              <div style={{ width: 36, height: 36, background: '#dcfce7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16a34a' }}>
                <CheckCircle2 size={20} />
              </div>
              <div>
                <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0F172A' }}>{lastApproval.amount} Kz</div>
                <div style={{ fontSize: '0.7rem', color: '#16a34a', fontWeight: '700' }}>Crédito para {lastApproval.name}</div>
              </div>
            </motion.div>

            <div className="card" style={{ padding: '3.5rem', borderRadius: '2.5rem', boxShadow: '0 30px 60px -15px rgba(0,0,0,0.2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '3rem' }}>
                <div style={{ width: 56, height: 56, background: '#fff7ed', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <TrendingUp color="var(--primary)" size={32} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: '900' }}>Simulador de Crédito</h3>
                  <p style={{ fontSize: '0.95rem', color: '#64748b' }}>Calcule o seu empréstimo ideal</p>
                </div>
              </div>

              <div style={{ marginBottom: '3rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', alignItems: 'flex-end' }}>
                  <span style={{ fontWeight: '700', color: '#0F172A' }}>Valor do empréstimo</span>
                  <span style={{ fontSize: '3rem', fontWeight: '950', color: '#ea580c', letterSpacing: '-0.02em' }}>
                    {amount.toLocaleString()} <span style={{ fontSize: '1.25rem', color: '#64748b', fontWeight: '700' }}>Kz</span>
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

              <button className="btn btn-primary" style={{ width: '100%', padding: '1.5rem', fontSize: '1.25rem', borderRadius: '20px' }}>
                Criar conta e solicitar <ArrowRight size={24} />
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Como Funciona Section (Restored to 4-step horizontal) */}
      <section id="como-funciona" style={{ padding: '8rem 0', background: '#F8FAFC' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '6rem' }}>
            <h2 style={{ fontSize: '3.5rem', fontWeight: '950', marginBottom: '1.5rem', letterSpacing: '-0.02em', color: '#0F172A' }}>Como Funciona</h2>
            <p style={{ color: '#64748b', fontSize: '1.25rem', fontWeight: '500' }}>Simples, rápido e transparente</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '2.5rem' }}>
            <StepCard number="1" icon={<UserPlus size={32} />} title="Registe-se" text="Crie a sua conta com um código de referência e complete o seu perfil." />
            <StepCard number="2" icon={<FileSearch size={32} />} title="Verificação KYC" text="Envie os seus documentos e complete a verificação facial." />
            <StepCard number="3" icon={<TrendingUp size={32} />} title="Simule o seu crédito" text="Use o nosso simulador para escolher o valor e o prazo ideal." />
            <StepCard number="4" icon={<Wallet size={32} />} title="Receba o dinheiro" text="Após a aprovação, o valor é depositado na sua conta." />
          </div>
        </div>
      </section>

      {/* Benefits Grid Section */}
      <section id="beneficios" style={{ padding: '10rem 0', background: 'white' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '6rem' }}>
            <h2 style={{ fontSize: '3.5rem', fontWeight: '950', marginBottom: '1.5rem', color: '#0F172A' }}>Porquê escolher o KwanzaCrédito?</h2>
            <p style={{ color: '#64748b', fontSize: '1.25rem', fontWeight: '500' }}>Atendimento humanizado e tecnologia de ponta para sua segurança.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2.5rem' }}>
            <MockFeature icon={<Clock size={32} />} title="Aprovação rápida" text="Resposta em até 24 horas após a análise completa." color="#fff7ed" />
            <MockFeature icon={<Shield size={32} />} title="100% Seguro" text="Os seus dados estão protegidos com criptografia de ponta." color="#f0fdf4" />
            <MockFeature icon={<Star size={32} />} title="Transparente" text="Sem taxas ocultas. Sabe exatamente quanto vai pagar." color="#fefce8" />
            <MockFeature icon={<Zap size={32} />} title="100% Digital" text="Todo o processo online, sem filas ou burocracia." color="#fef2f2" />
            <MockFeature icon={<Users size={32} />} title="Atendimento humano" text="Suporte dedicado para ajudar em todas as etapas." color="#faf5ff" />
            <MockFeature icon={<TrendingUp size={32} />} title="Limite crescente" text="Quanto mais usa, maior o seu limite de crédito." color="#ecfdf5" />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: '#0F172A', color: 'white', padding: '6rem 0 3rem' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.75rem', fontWeight: '900' }}>
              <TrendingUp size={32} color="#fb923c" />
              <span>Kwanza<span style={{ color: '#fb923c' }}>Crédito</span></span>
            </div>
            <div style={{ color: '#94a3b8', fontWeight: '500' }}>© 2026 KwanzaCrédito. Todos os direitos reservados.</div>
          </div>
          <div style={{ textAlign: 'center', borderTop: '1px solid #1e293b', paddingTop: '3rem', color: '#64748b', fontSize: '1rem', fontWeight: '500' }}>
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
