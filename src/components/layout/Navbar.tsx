import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { useAuth } from '../../contexts/AuthContext';
import { LogIn, LayoutDashboard, LogOut, ChevronDown } from 'lucide-react';

export function Navbar() {
  const { user, profile, signInWithGoogle, logout } = useAuth();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const handleAuthAction = async () => {
    if (user) {
      if (profile?.role === 'unassigned') navigate('/onboarding');
      else navigate('/dashboard');
    } else {
      try { await signInWithGoogle(); navigate('/dashboard'); }
      catch (e) { console.error('Auth failed', e); }
    }
  };

  const handleLogout = async () => {
    await logout(); setShowMenu(false); navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 w-full" style={{
      backgroundColor: scrolled ? 'rgba(7,7,14,0.96)' : 'rgba(7,7,14,0.75)',
      borderBottom: `1px solid ${scrolled ? 'var(--border-bright)' : 'var(--border)'}`,
      backdropFilter: 'blur(20px)', transition: 'background-color 0.3s, border-color 0.3s',
    }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '68px' }}>

        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none', flexShrink: 0 }}>
          <div style={{ width: '34px', height: '34px', border: '1.5px solid var(--gold)', borderRadius: '7px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(212,168,67,0.07)', flexShrink: 0, boxShadow: '0 0 16px -4px rgba(212,168,67,0.3)' }}>
            <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '14px', fontWeight: 700, color: 'var(--gold)' }}>E</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '20px', fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '0.02em', lineHeight: 1 }}>
              Ethara <em style={{ color: 'var(--gold)', fontStyle: 'italic' }}>Tasks</em>
            </span>
            <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '8px', color: 'var(--text-faint)', letterSpacing: '0.12em' }}>WORKSPACE PLATFORM</span>
          </div>
        </Link>

        {/* Right side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {user ? (
            <>
              {profile?.name && (
                <div onClick={() => setShowMenu(!showMenu)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px 6px 8px', borderRadius: '100px', border: '1px solid var(--border-bright)', background: 'var(--bg-elevated)', cursor: 'pointer', position: 'relative', transition: 'all 0.2s' }}>
                  <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--gold-dim), var(--gold))', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: '11px', fontWeight: 700, color: '#08080f' }}>{profile.name.charAt(0).toUpperCase()}</span>
                  </div>
                  <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: '12px', color: 'var(--text-primary)', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{profile.name}</span>
                  <ChevronDown style={{ width: '12px', height: '12px', color: 'var(--text-muted)', transform: showMenu ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                  {showMenu && (
                    <div style={{ position: 'absolute', top: 'calc(100% + 8px)', right: 0, background: 'var(--bg-elevated)', border: '1px solid var(--border-bright)', borderRadius: 'var(--radius-md)', padding: '6px', minWidth: '160px', boxShadow: '0 16px 48px -8px rgba(0,0,0,0.6)' }}>
                      <button onClick={(e) => { e.stopPropagation(); handleAuthAction(); setShowMenu(false); }} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '8px', padding: '9px 12px', borderRadius: '7px', border: 'none', background: 'transparent', color: 'var(--text-primary)', fontSize: '13px', fontFamily: "'Outfit', sans-serif", cursor: 'pointer', textAlign: 'left' as const }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-surface)')} onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                        <LayoutDashboard style={{ width: '13px', height: '13px', color: 'var(--gold)' }} /> Dashboard
                      </button>
                      <div style={{ height: '1px', background: 'var(--border)', margin: '4px 8px' }} />
                      <button onClick={(e) => { e.stopPropagation(); handleLogout(); }} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '8px', padding: '9px 12px', borderRadius: '7px', border: 'none', background: 'transparent', color: '#ef4444', fontSize: '13px', fontFamily: "'Outfit', sans-serif", cursor: 'pointer', textAlign: 'left' as const }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.08)')} onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                        <LogOut style={{ width: '13px', height: '13px' }} /> Sign out
                      </button>
                    </div>
                  )}
                </div>
              )}
              <button className="btn-outline" onClick={handleAuthAction} style={{ padding: '9px 18px', fontSize: '12px' }}>
                <LayoutDashboard style={{ width: '12px', height: '12px' }} /> Dashboard
              </button>
            </>
          ) : (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '5px 12px', borderRadius: '100px', border: '1px solid var(--border-gold)', background: 'rgba(212,168,67,0.04)', fontFamily: "'Space Mono', monospace", fontSize: '9px', color: 'var(--gold)', letterSpacing: '0.1em' }}>
                <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'var(--gold)' }} className="pulse-gold" />
                EXCLUSIVE ACCESS
              </div>
              <button className="btn-primary" onClick={handleAuthAction}>
                <img src="https://www.google.com/favicon.ico" alt="" style={{ width: '13px', height: '13px' }} />
                Sign In
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
