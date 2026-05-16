import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';
import { CheckCircle2, Shield, Users, BarChart3, ArrowRight, Lock, Zap, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router';

const C = { maxWidth: '1280px', margin: '0 auto', padding: '0 1.5rem' };

export function LandingPage() {
  const { signInWithGoogle, user } = useAuth();
  const navigate = useNavigate();

  const handleSignIn = async () => {
    if (user) { navigate('/dashboard'); return; }
    try { await signInWithGoogle(); navigate('/onboarding'); }
    catch (err) { console.error(err); }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', flexDirection: 'column', backgroundColor: 'var(--bg-base)', color: 'var(--text-primary)', overflowX: 'hidden' }}>

      {/* ═══════════════ HERO ═══════════════ */}
      <section style={{ position: 'relative', paddingTop: '110px', paddingBottom: '140px', overflow: 'hidden' }}>
        {/* Bg grid */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 0, backgroundImage: `linear-gradient(rgba(212,168,67,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(212,168,67,0.035) 1px, transparent 1px)`, backgroundSize: '64px 64px' }} />
        {/* Radial glow */}
        <div style={{ position: 'absolute', top: '-300px', left: '50%', transform: 'translateX(-50%)', width: '900px', height: '700px', zIndex: 0, background: 'radial-gradient(ellipse at center, rgba(212,168,67,0.09) 0%, transparent 68%)', pointerEvents: 'none' }} />
        {/* Bottom fade */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '200px', background: 'linear-gradient(to bottom, transparent, var(--bg-base))', zIndex: 1 }} />

        <div style={{ ...C, position: 'relative', zIndex: 2 }}>
          {/* Eyebrow pill */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} style={{ display: 'flex', justifyContent: 'center', marginBottom: '40px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '7px 18px', borderRadius: '100px', border: '1px solid var(--border-gold)', backgroundColor: 'rgba(212,168,67,0.06)', backdropFilter: 'blur(8px)' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--gold)' }} className="pulse-gold" />
              <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '10px', color: 'var(--gold)', letterSpacing: '0.14em' }}>EXCLUSIVE · ETHARA.AI WORKSPACE</span>
            </div>
          </motion.div>

          {/* Headline */}
          <motion.div initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.75, delay: 0.1 }} style={{ textAlign: 'center', maxWidth: '920px', margin: '0 auto' }}>
            <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(52px, 8.5vw, 96px)', fontWeight: 300, lineHeight: 1.02, color: 'var(--text-primary)', letterSpacing: '-0.025em' }}>
              Where Teams Move
              <br />
              <em style={{ fontStyle: 'italic', fontWeight: 400 }}>
                <span className="text-gold-gradient">With Precision.</span>
              </em>
            </h1>

            <p style={{ marginTop: '28px', fontFamily: "'Outfit', sans-serif", fontSize: '17px', lineHeight: 1.75, color: 'var(--text-muted)', maxWidth: '540px', marginLeft: 'auto', marginRight: 'auto' }}>
              The exclusive task management platform for Ethara.ai — enterprise-grade roles, seamless collaboration, and real-time project intelligence.
            </p>

            {/* ── BUTTON ROW: primary CTA left, secondary right, well-spaced ── */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.35 }}
              style={{ marginTop: '52px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}
            >
              <button className="btn-primary" onClick={handleSignIn} style={{ padding: '15px 36px', fontSize: '14px', gap: '10px' }}>
                <img src="https://www.google.com/favicon.ico" alt="" style={{ width: '15px', height: '15px' }} />
                Sign in with Google
                <ArrowRight style={{ width: '15px', height: '15px' }} />
              </button>

              <a href="#features" style={{ textDecoration: 'none' }}>
                <button className="btn-outline" style={{ padding: '14px 28px', fontSize: '13px' }}>
                  Explore features
                  <ChevronRight style={{ width: '13px', height: '13px' }} />
                </button>
              </a>
            </motion.div>

            {/* Trust line */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.55 }}
              style={{ marginTop: '28px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}
            >
              {[{ icon: Shield, label: 'Domain-restricted access' }, { icon: Zap, label: 'Real-time sync' }, { icon: CheckCircle2, label: 'Role-based security' }].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <item.icon style={{ width: '11px', height: '11px', color: 'var(--gold-dim)' }} />
                  <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: '11px', color: 'var(--text-faint)', letterSpacing: '0.03em' }}>{item.label}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Dashboard preview */}
          <motion.div initial={{ opacity: 0, y: 60 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.45 }} style={{ marginTop: '90px', maxWidth: '980px', margin: '90px auto 0' }}>
            <div style={{ border: '1px solid var(--border-gold)', borderRadius: '18px', background: 'var(--bg-surface)', padding: '3px', boxShadow: '0 40px 120px -20px rgba(0,0,0,0.85), 0 0 0 1px var(--border), inset 0 1px 0 rgba(255,255,255,0.04)' }}>
              {/* Window chrome */}
              <div style={{ background: 'var(--bg-elevated)', borderRadius: '15px 15px 0 0', padding: '13px 18px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ff5f57' }} />
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#febc2e' }} />
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#28c840' }} />
                <div style={{ flex: 1, marginLeft: '12px', display: 'flex', justifyContent: 'center' }}>
                  <div style={{ width: '220px', height: '22px', borderRadius: '5px', background: 'var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                    <Lock style={{ width: '8px', height: '8px', color: 'var(--text-faint)' }} />
                    <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '10px', color: 'var(--text-faint)' }}>ethara.ai/dashboard</span>
                  </div>
                </div>
              </div>
              {/* App body */}
              <div style={{ display: 'flex', height: '360px', borderRadius: '0 0 15px 15px', overflow: 'hidden' }}>
                {/* Sidebar */}
                <div style={{ width: '190px', background: 'var(--bg-surface)', borderRight: '1px solid var(--border)', padding: '22px 12px', flexShrink: 0 }}>
                  <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--gold)' }} />
                    <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '8px', color: 'var(--text-faint)', letterSpacing: '0.1em' }}>WORKSPACE</span>
                  </div>
                  {['Admin Hub', 'Projects', 'Team Directory', 'Analytics', 'Settings'].map((item, i) => (
                    <div key={item} style={{ padding: '9px 12px', borderRadius: '7px', marginBottom: '3px', background: i === 0 ? 'rgba(212,168,67,0.1)' : 'transparent', border: i === 0 ? '1px solid rgba(212,168,67,0.22)' : '1px solid transparent' }}>
                      <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: '12px', color: i === 0 ? 'var(--gold)' : 'var(--text-muted)', fontWeight: i === 0 ? 600 : 400 }}>{item}</span>
                    </div>
                  ))}
                </div>
                {/* Main */}
                <div style={{ flex: 1, padding: '28px', background: 'var(--bg-base)', overflowY: 'hidden' }}>
                  <div style={{ marginBottom: '22px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                    <div>
                      <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '24px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Admin Workspace</h3>
                      <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: '12px', color: 'var(--text-faint)', margin: '4px 0 0' }}>Real-time overview · 3 active projects</p>
                    </div>
                    {/* Button in mockup - positioned top-right as expected */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '7px 14px', borderRadius: '7px', background: 'linear-gradient(135deg, var(--gold-bright), var(--gold))', cursor: 'default' }}>
                      <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: '11px', fontWeight: 700, color: '#08080f', letterSpacing: '0.04em' }}>+ NEW PROJECT</span>
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                    {[
                      { label: 'Active Projects', val: '4', color: 'var(--gold)' },
                      { label: 'Total Teams', val: '12', color: '#2dd4bf' },
                      { label: 'Tasks Done', val: '87%', color: '#a78bfa' },
                    ].map(stat => (
                      <div key={stat.label} style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: '8px', padding: '14px' }}>
                        <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: '10px', color: 'var(--text-faint)', margin: '0 0 5px' }}>{stat.label}</p>
                        <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '28px', fontWeight: 700, color: stat.color, margin: 0, lineHeight: 1 }}>{stat.val}</p>
                      </div>
                    ))}
                  </div>
                  <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: '8px', padding: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                      <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: '12px', color: 'var(--text-primary)', fontWeight: 500 }}>Website Redesign</span>
                      <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '8px', color: 'var(--gold)', padding: '2px 8px', background: 'rgba(212,168,67,0.1)', borderRadius: '4px', letterSpacing: '0.08em' }}>ACTIVE</span>
                    </div>
                    <div className="progress-bar"><div className="progress-fill" style={{ width: '68%' }} /></div>
                    <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: '10px', color: 'var(--text-faint)', margin: '8px 0 0' }}>68% complete · 3 teams · 12 tasks</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════ FEATURES ═══════════════ */}
      <section id="features" style={{ padding: '130px 24px', backgroundColor: 'var(--bg-surface)', borderTop: '1px solid var(--border)' }}>
        <div style={C}>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ marginBottom: '80px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '24px' }}>
            <div>
              <div className="eyebrow">CAPABILITIES</div>
              <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(38px, 5vw, 62px)', fontWeight: 300, color: 'var(--text-primary)', lineHeight: 1.1 }}>
                Built for how<br />
                <em style={{ fontStyle: 'italic', color: 'var(--gold)' }}>elite teams</em> operate.
              </h2>
            </div>
            {/* CTA placed in section header — right aligned */}
            <button className="btn-primary" onClick={handleSignIn} style={{ alignSelf: 'flex-end', flexShrink: 0 }}>
              <img src="https://www.google.com/favicon.ico" alt="" style={{ width: '13px', height: '13px' }} />
              Get started free
            </button>
          </motion.div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: '2px' }}>
            {[
              { icon: Users, title: 'Team Collaboration', desc: 'Invite members to projects, assign tasks contextually, and communicate without leaving your workspace.', tag: '01', accent: 'var(--gold)' },
              { icon: Shield, title: 'Role-Based Access', desc: 'Enterprise-grade permission structures. Admins control access, members focus on execution without friction.', tag: '02', accent: '#2dd4bf' },
              { icon: BarChart3, title: 'Live Analytics', desc: 'Visualize team productivity in real-time. Monitor overdue tasks, project velocity, and status distributions.', tag: '03', accent: '#a78bfa' },
              { icon: Zap, title: 'Instant Updates', desc: 'Firestore-powered real-time sync means your team always sees the latest state — no refreshing needed.', tag: '04', accent: '#fb923c' },
            ].map((feature, i) => (
              <motion.div key={feature.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                style={{ padding: '44px 38px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-base)', position: 'relative', transition: 'border-color 0.3s, background-color 0.3s', cursor: 'default' }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border-bright)'; (e.currentTarget as HTMLDivElement).style.backgroundColor = 'var(--bg-elevated)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLDivElement).style.backgroundColor = 'var(--bg-base)'; }}
              >
                <span style={{ position: 'absolute', top: '28px', right: '28px', fontFamily: "'Space Mono', monospace", fontSize: '10px', color: 'var(--text-faint)', letterSpacing: '0.1em' }}>{feature.tag}</span>
                <div style={{ width: '44px', height: '44px', borderRadius: '10px', border: `1px solid rgba(${feature.accent === 'var(--gold)' ? '212,168,67' : feature.accent === '#2dd4bf' ? '45,212,191' : feature.accent === '#a78bfa' ? '167,139,250' : '251,146,60'},0.25)`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '22px' }}>
                  <feature.icon style={{ width: '20px', height: '20px', color: feature.accent }} />
                </div>
                <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '25px', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 12px' }}>{feature.title}</h3>
                <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: '14px', lineHeight: 1.75, color: 'var(--text-muted)', margin: 0 }}>{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ HOW IT WORKS ═══════════════ */}
      <section style={{ padding: '130px 24px', backgroundColor: 'var(--bg-base)', borderTop: '1px solid var(--border)' }}>
        <div style={C}>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ textAlign: 'center', marginBottom: '88px' }}>
            <div className="eyebrow" style={{ justifyContent: 'center' }}>WORKFLOW</div>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(36px, 5vw, 58px)', fontWeight: 300, color: 'var(--text-primary)' }}>
              From zero to<br /><em style={{ fontStyle: 'italic', color: 'var(--gold)' }}>full velocity.</em>
            </h2>
          </motion.div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 0 }}>
            {[
              { step: '01', title: 'Secure Login', desc: 'Sign in via company Google account' },
              { step: '02', title: 'Select Role', desc: 'Choose Admin or Member on first login' },
              { step: '03', title: 'Join Projects', desc: 'Create workspaces or join existing ones' },
              { step: '04', title: 'Manage Tasks', desc: 'Assign work, set priorities, collaborate' },
              { step: '05', title: 'Track Stats', desc: 'Monitor team velocity and project health' },
            ].map((item, i) => (
              <motion.div key={item.step} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                style={{ padding: '40px 28px', borderLeft: '1px solid var(--border)', position: 'relative' }}>
                <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '11px', color: 'var(--gold)', letterSpacing: '0.1em', marginBottom: '20px' }}>{item.step}</div>
                <div style={{ width: '1px', height: '48px', background: 'linear-gradient(180deg, var(--gold-dim), transparent)', marginBottom: '22px' }} />
                <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '21px', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 8px' }}>{item.title}</h3>
                <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: '13px', color: 'var(--text-muted)', margin: 0, lineHeight: 1.65 }}>{item.desc}</p>
              </motion.div>
            ))}
          </div>

          {/* CTA below steps */}
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ marginTop: '64px', display: 'flex', justifyContent: 'center' }}>
            <button className="btn-primary" onClick={handleSignIn} style={{ padding: '14px 36px', fontSize: '14px' }}>
              <img src="https://www.google.com/favicon.ico" alt="" style={{ width: '14px', height: '14px' }} />
              Start now — it's free
              <ArrowRight style={{ width: '14px', height: '14px' }} />
            </button>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════ SECURITY ═══════════════ */}
      <section style={{ padding: '130px 24px', backgroundColor: 'var(--bg-surface)', borderTop: '1px solid var(--border)' }}>
        <div style={{ ...C, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '72px', alignItems: 'center' }}>
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <div className="eyebrow">SECURITY</div>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(32px, 4vw, 54px)', fontWeight: 300, color: 'var(--text-primary)', margin: '0 0 24px', lineHeight: 1.12 }}>
              Enterprise-grade<br /><em style={{ fontStyle: 'italic', color: 'var(--gold)' }}>protection,</em> built in.
            </h2>
            <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: '15px', lineHeight: 1.75, color: 'var(--text-muted)', margin: '0 0 40px' }}>
              Your company's data is sensitive. Ethara Tasks is restricted exclusively to your organization's domain.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '40px' }}>
              {[
                { icon: Lock, text: 'Company-only access — @ethara.ai domains strictly enforced' },
                { icon: Shield, text: 'Role-based authorization prevents privilege escalation' },
                { icon: CheckCircle2, text: 'Isolated Firestore rules protect all project data' },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                  <div style={{ flexShrink: 0, width: '34px', height: '34px', borderRadius: '8px', border: '1px solid var(--border-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '1px', background: 'rgba(212,168,67,0.04)' }}>
                    <item.icon style={{ width: '14px', height: '14px', color: 'var(--gold)' }} />
                  </div>
                  <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.65 }}>{item.text}</span>
                </div>
              ))}
            </div>
            {/* Security section button - left aligned under content */}
            <button className="btn-outline" onClick={handleSignIn}>
              <img src="https://www.google.com/favicon.ico" alt="" style={{ width: '13px', height: '13px' }} />
              Access your workspace
              <ArrowRight style={{ width: '13px', height: '13px' }} />
            </button>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} style={{ border: '1px solid var(--border)', borderRadius: '14px', overflow: 'hidden', background: 'var(--bg-base)' }}>
            <div style={{ padding: '22px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--bg-elevated)' }}>
              <Lock style={{ width: '14px', height: '14px', color: 'var(--text-faint)' }} />
              <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '0.1em' }}>ACCESS VERIFICATION</span>
            </div>
            <div style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '16px 18px', borderRadius: '10px', border: '1px solid rgba(239,68,68,0.2)', background: 'rgba(239,68,68,0.06)', opacity: 0.65 }}>
                <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'rgba(239,68,68,0.15)', flexShrink: 0 }} />
                <div>
                  <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: '13px', color: '#f87171', fontWeight: 500, margin: 0 }}>john@gmail.com</p>
                  <p style={{ fontFamily: "'Space Mono', monospace", fontSize: '9px', color: 'rgba(239,68,68,0.6)', margin: '3px 0 0', letterSpacing: '0.06em' }}>DENIED · INVALID DOMAIN</p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '16px 18px', borderRadius: '10px', border: '1px solid rgba(212,168,67,0.3)', background: 'rgba(212,168,67,0.06)', position: 'relative' }}>
                <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'rgba(212,168,67,0.15)', flexShrink: 0 }} />
                <div>
                  <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: '13px', color: 'var(--gold)', fontWeight: 500, margin: 0 }}>jane@ethara.ai</p>
                  <p style={{ fontFamily: "'Space Mono', monospace", fontSize: '9px', color: 'var(--gold-dim)', margin: '3px 0 0', letterSpacing: '0.06em' }}>GRANTED · VERIFIED EMPLOYEE</p>
                </div>
                <CheckCircle2 style={{ position: 'absolute', right: '18px', width: '18px', height: '18px', color: 'var(--gold)' }} />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════ CTA BANNER ═══════════════ */}
      <section style={{ padding: '110px 24px', backgroundColor: 'var(--bg-base)', borderTop: '1px solid var(--border)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', bottom: '-250px', left: '50%', transform: 'translateX(-50%)', width: '700px', height: '500px', background: 'radial-gradient(ellipse at center, rgba(212,168,67,0.1) 0%, transparent 68%)', pointerEvents: 'none' }} />
        {/* Decorative lines */}
        <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '1px', height: '80px', background: 'linear-gradient(to bottom, transparent, var(--gold-dim))' }} />

        <div style={{ ...C, position: 'relative', textAlign: 'center' }}>
          <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <div className="eyebrow" style={{ justifyContent: 'center' }}>GET STARTED</div>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(44px, 6.5vw, 76px)', fontWeight: 300, color: 'var(--text-primary)', margin: '0 0 24px', lineHeight: 1.08 }}>
              Ready to operate<br />
              <em style={{ fontStyle: 'italic', fontWeight: 400 }}>
                <span className="text-gold-gradient">at full potential?</span>
              </em>
            </h2>
            <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: '16px', color: 'var(--text-muted)', margin: '0 0 52px', maxWidth: '440px', marginLeft: 'auto', marginRight: 'auto', lineHeight: 1.7 }}>
              Join your team. Sign in with your Ethara account and start collaborating.
            </p>

            {/* Two-button CTA stack — centered */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
              <button className="btn-primary" onClick={handleSignIn} style={{ padding: '17px 48px', fontSize: '15px', gap: '12px', boxShadow: '0 8px 40px -8px rgba(212,168,67,0.5)' }}>
                <img src="https://www.google.com/favicon.ico" alt="" style={{ width: '16px', height: '16px' }} />
                Sign in to Get Started
                <ArrowRight style={{ width: '16px', height: '16px' }} />
              </button>
              <p style={{ fontFamily: "'Space Mono', monospace", fontSize: '9px', color: 'var(--text-faint)', letterSpacing: '0.12em' }}>
                RESTRICTED TO @ETHARA.AI ACCOUNTS
              </p>
            </div>
          </motion.div>
        </div>
      </section>

    </div>
  );
}
