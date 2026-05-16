import React from 'react';
import { Shield } from 'lucide-react';

export function Footer() {
  return (
    <footer style={{ borderTop: '1px solid var(--border)', backgroundColor: 'var(--bg-base)', padding: '48px 24px' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '28px', height: '28px', border: '1px solid var(--border-gold)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(212,168,67,0.05)' }}>
            <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '12px', fontWeight: 700, color: 'var(--gold-dim)' }}>E</span>
          </div>
          <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '17px', fontWeight: 600, color: 'var(--text-muted)' }}>
            Ethara <em style={{ fontStyle: 'italic', color: 'var(--gold-dim)' }}>Tasks</em>
          </span>
        </div>
        <div style={{ width: '1px', height: '28px', background: 'linear-gradient(to bottom, var(--border-bright), transparent)' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Shield style={{ width: '11px', height: '11px', color: 'var(--text-faint)' }} />
          <p style={{ fontFamily: "'Space Mono', monospace", fontSize: '10px', color: 'var(--text-faint)', letterSpacing: '0.1em', margin: 0, textAlign: 'center' }}>
            © {new Date().getFullYear()} ETHARA.AI · SECURE INTERNAL PLATFORM · RESTRICTED ACCESS
          </p>
        </div>
      </div>
    </footer>
  );
}
