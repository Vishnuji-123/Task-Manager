import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { Project, subscribeToProjects, createProject, Team, subscribeToAllTeams } from '../lib/db';
import { Briefcase, Activity, CheckCircle2, AlertCircle, Plus, Users, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';

export function AdminDashboard() {
  const { profile, user } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingTeams, setLoadingTeams] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [showCreatePanel, setShowCreatePanel] = useState(false);

  useEffect(() => {
    const unsub = subscribeToProjects((data) => { setProjects(data); setLoading(false); });
    const unsubTeams = subscribeToAllTeams((data) => { setTeams(data); setLoadingTeams(false); });
    return () => { unsub(); unsubTeams(); };
  }, [user?.uid]);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !user) return;
    setIsCreating(true);
    await createProject({ title: newTitle, description: newDesc, ownerId: user.uid });
    setNewTitle(''); setNewDesc(''); setIsCreating(false); setShowCreatePanel(false);
  };

  if (loading || loadingTeams) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: '12px' }}>
        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--gold)' }} className="pulse-gold" />
        <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: '14px', color: 'var(--text-muted)' }}>Loading workspace...</span>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '44px 24px' }}>

      {/* ── Page Header with action button ── */}
      <div style={{ marginBottom: '44px', borderBottom: '1px solid var(--border)', paddingBottom: '36px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
        <div>
          <div className="eyebrow">ADMIN WORKSPACE</div>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '42px', fontWeight: 400, color: 'var(--text-primary)', margin: '0 0 8px', lineHeight: 1.1 }}>
            Welcome back, <em style={{ fontStyle: 'italic', color: 'var(--gold)' }}>{profile?.name?.split(' ')[0]}</em>
          </h1>
          <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: '14px', color: 'var(--text-muted)', margin: 0 }}>
            Manage projects, track tasks, and monitor team productivity.
          </p>
        </div>

        {/* Primary action — top-right of header */}
        <button className="btn-primary" onClick={() => setShowCreatePanel(true)} style={{ flexShrink: 0, alignSelf: 'flex-end' }}>
          <Plus style={{ width: '14px', height: '14px' }} />
          New Project
        </button>
      </div>

      {/* ── Stats row ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '52px', maxWidth: '560px' }}>
        {[
          { label: 'Active Projects', value: projects.length, icon: Briefcase, color: 'var(--gold)' },
          { label: 'Total Teams', value: teams.length, icon: Users, color: '#2dd4bf' },
        ].map((stat, i) => (
          <div key={i} className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '10px', border: '1px solid var(--border-bright)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: 'var(--bg-elevated)' }}>
              <stat.icon style={{ width: '17px', height: '17px', color: stat.color }} />
            </div>
            <div>
              <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: '12px', color: 'var(--text-muted)', margin: '0 0 3px' }}>{stat.label}</p>
              <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '30px', fontWeight: 700, color: 'var(--text-primary)', margin: 0, lineHeight: 1 }}>{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Projects grid ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '24px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Projects</h2>
        {/* Secondary add button inline with section title */}
        <button className="btn-ghost" onClick={() => setShowCreatePanel(true)}>
          <Plus style={{ width: '12px', height: '12px' }} />
          Add project
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '72px 24px', borderStyle: 'dashed', borderColor: 'var(--border-bright)' }}>
          <div style={{ width: '52px', height: '52px', borderRadius: '12px', border: '1px solid var(--border-bright)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', background: 'var(--bg-elevated)' }}>
            <Briefcase style={{ width: '22px', height: '22px', color: 'var(--text-faint)' }} />
          </div>
          <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '22px', color: 'var(--text-muted)', margin: '0 0 8px' }}>No projects yet</p>
          <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: '13px', color: 'var(--text-faint)', margin: '0 0 28px' }}>Create your first project to get your team started.</p>
          <button className="btn-primary" onClick={() => setShowCreatePanel(true)} style={{ margin: '0 auto' }}>
            <Plus style={{ width: '13px', height: '13px' }} />
            Create First Project
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px' }}>
          {projects.map(proj => (
            <div key={proj.id} onClick={() => navigate(`/dashboard/project/${proj.id}`)}
              className="card" style={{ cursor: 'pointer', position: 'relative', overflow: 'hidden', paddingTop: '28px' }}
              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border-gold)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border)'; }}
            >
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg, var(--gold-dim), var(--gold), transparent)' }} />
              <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '21px', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 8px', lineHeight: 1.2 }}>{proj.title}</h3>
              <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: '13px', color: 'var(--text-muted)', margin: '0 0 22px', lineHeight: 1.6, display: '-webkit-box' as any, WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as any, overflow: 'hidden' }}>
                {proj.description || 'No description provided.'}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
                <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '10px', color: 'var(--text-faint)' }}>
                  {proj.createdAt?.toDate ? format(proj.createdAt.toDate(), 'MMM d, yyyy') : 'Recently'}
                </span>
                <ArrowRight style={{ width: '13px', height: '13px', color: 'var(--gold-dim)' }} />
              </div>
            </div>
          ))}
          {/* Inline "add project" card at end of grid */}
          <div onClick={() => setShowCreatePanel(true)}
            style={{ border: '1px dashed var(--border-bright)', borderRadius: '10px', padding: '24px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px', minHeight: '160px', transition: 'all 0.2s' }}
            onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--gold-dim)'; (e.currentTarget as HTMLDivElement).style.background = 'var(--bg-elevated)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border-bright)'; (e.currentTarget as HTMLDivElement).style.background = 'transparent'; }}
          >
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', border: '1px solid var(--border-bright)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Plus style={{ width: '16px', height: '16px', color: 'var(--text-faint)' }} />
            </div>
            <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: '13px', color: 'var(--text-faint)' }}>New project</span>
          </div>
        </div>
      )}

      {/* ── Create project modal/overlay ── */}
      {showCreatePanel && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}
          onClick={() => setShowCreatePanel(false)}
        >
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(7,7,14,0.8)', backdropFilter: 'blur(8px)' }} />
          <div style={{ position: 'relative', width: '100%', maxWidth: '440px', background: 'var(--bg-elevated)', border: '1px solid var(--border-gold)', borderRadius: '16px', padding: '32px', boxShadow: '0 40px 80px -16px rgba(0,0,0,0.8)' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Modal header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '8px', border: '1px solid var(--border-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(212,168,67,0.07)' }}>
                <Plus style={{ width: '16px', height: '16px', color: 'var(--gold)' }} />
              </div>
              <div>
                <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '22px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>New Project</h2>
                <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: '12px', color: 'var(--text-faint)', margin: 0 }}>Fill in the details below</p>
              </div>
            </div>

            <form onSubmit={handleCreateProject} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div>
                <label style={{ fontFamily: "'Outfit', sans-serif", fontSize: '11px', color: 'var(--text-muted)', letterSpacing: '0.08em', display: 'block', marginBottom: '7px' }}>PROJECT TITLE *</label>
                <input className="input" type="text" value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="e.g. Q3 Marketing Campaign" required />
              </div>
              <div>
                <label style={{ fontFamily: "'Outfit', sans-serif", fontSize: '11px', color: 'var(--text-muted)', letterSpacing: '0.08em', display: 'block', marginBottom: '7px' }}>DESCRIPTION</label>
                <textarea className="input" value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder="Describe the project goal..." style={{ height: '100px', resize: 'none' }} />
              </div>

              {/* Modal buttons — two side-by-side, cancel left, create right */}
              <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                <button type="button" className="btn-ghost" onClick={() => setShowCreatePanel(false)} style={{ flex: 1 }}>
                  Cancel
                </button>
                <button type="submit" disabled={isCreating || !newTitle} className="btn-primary"
                  style={{ flex: 2, opacity: (!newTitle || isCreating) ? 0.5 : 1, cursor: (!newTitle || isCreating) ? 'not-allowed' : 'pointer' }}
                >
                  {isCreating ? 'Creating...' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
