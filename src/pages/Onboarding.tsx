import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { Shield, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export function Onboarding() {
  const { updateRole, profile } = useAuth();
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<'admin' | 'member' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!selectedRole) return;
    setIsSubmitting(true);
    try {
      await updateRole(selectedRole);
      navigate('/dashboard');
    } catch (e) {
      console.error(e);
      alert('Failed to update role.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight: 'calc(100vh - 64px)', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-base)', padding: '48px 24px', position: 'relative', overflow: 'hidden' }}>
      {/* Background glow */}
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '600px', height: '400px', background: 'radial-gradient(ellipse, rgba(212,168,67,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{ maxWidth: '460px', width: '100%', position: 'relative', zIndex: 1 }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ width: '48px', height: '48px', border: '1px solid var(--gold)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
            <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '18px', fontWeight: 700, color: 'var(--gold)' }}>E</span>
          </div>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '36px', fontWeight: 400, color: 'var(--text-primary)', margin: '0 0 12px', lineHeight: 1.15 }}>
            Welcome, <em style={{ fontStyle: 'italic', color: 'var(--gold)' }}>{profile?.name?.split(' ')[0]}</em>
          </h2>
          <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: '14px', color: 'var(--text-muted)', margin: 0, lineHeight: 1.6 }}>
            Select your role within the organization. This determines your permission levels across the platform.
          </p>
        </div>

        {/* Role options */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '28px' }}>
          {[
            { role: 'admin' as const, Icon: Shield, title: 'Administrator', desc: 'Manage projects, teams, assign tasks, and view full analytics.' },
            { role: 'member' as const, Icon: User, title: 'Team Member', desc: 'View assigned projects, update task progress, and collaborate.' },
          ].map(({ role, Icon, title, desc }) => {
            const isSelected = selectedRole === role;
            return (
              <div
                key={role}
                onClick={() => setSelectedRole(role)}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '16px',
                  padding: '20px',
                  borderRadius: '10px',
                  border: isSelected ? '1px solid var(--gold)' : '1px solid var(--border-bright)',
                  background: isSelected ? 'rgba(212,168,67,0.07)' : 'var(--bg-surface)',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                <div style={{
                  width: '38px', height: '38px', borderRadius: '8px', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: isSelected ? 'rgba(212,168,67,0.15)' : 'var(--bg-elevated)',
                  border: '1px solid ' + (isSelected ? 'var(--gold-dim)' : 'var(--border)'),
                }}>
                  <Icon style={{ width: '16px', height: '16px', color: isSelected ? 'var(--gold)' : 'var(--text-muted)' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: '15px', fontWeight: 600, color: isSelected ? 'var(--text-primary)' : 'var(--text-muted)', margin: '0 0 4px' }}>{title}</p>
                  <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: '13px', color: 'var(--text-faint)', margin: 0, lineHeight: 1.5 }}>{desc}</p>
                </div>
                <div style={{
                  width: '18px', height: '18px', borderRadius: '50%', flexShrink: 0, marginTop: '2px',
                  border: '1.5px solid ' + (isSelected ? 'var(--gold)' : 'var(--border-bright)'),
                  background: isSelected ? 'var(--gold)' : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {isSelected && <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#08080f' }} />}
                </div>
              </div>
            );
          })}
        </div>

        <button
          onClick={handleSubmit}
          disabled={!selectedRole || isSubmitting}
          style={{
            width: '100%',
            padding: '14px',
            borderRadius: '8px',
            border: '1px solid ' + (!selectedRole || isSubmitting ? 'var(--border)' : 'var(--gold)'),
            background: !selectedRole || isSubmitting ? 'var(--bg-elevated)' : 'var(--gold)',
            color: !selectedRole || isSubmitting ? 'var(--text-faint)' : '#08080f',
            fontFamily: "'Outfit', sans-serif",
            fontSize: '14px',
            fontWeight: 600,
            letterSpacing: '0.03em',
            cursor: !selectedRole || isSubmitting ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s',
          }}
        >
          {isSubmitting ? 'Setting up workspace...' : 'Complete Setup →'}
        </button>
      </motion.div>
    </div>
  );
}
