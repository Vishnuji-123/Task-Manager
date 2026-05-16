import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { Project, Team, UserProfile, subscribeToTeams, getAllUsers, createTeam, Task, subscribeToTasks } from '../lib/db';
import { db } from '../lib/firebase';
import { ArrowLeft, Clock, Activity, Briefcase, Plus, Check, LayoutDashboard, Users, CheckSquare, X } from 'lucide-react';
import { format } from 'date-fns';

const card = {
  background: 'var(--bg-surface)',
  border: '1px solid var(--border)',
  borderRadius: '12px',
  padding: '24px',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 14px',
  borderRadius: '8px',
  border: '1px solid var(--border-bright)',
  background: 'var(--bg-base)',
  color: 'var(--text-primary)',
  fontFamily: "'Outfit', sans-serif",
  fontSize: '13px',
  outline: 'none',
  transition: 'border-color 0.2s',
  boxSizing: 'border-box',
};

export function ProjectDetails() {
  const { id } = useParams<{ id: string }>();
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'teams'>('overview');
  const [isCreatingTeam, setIsCreatingTeam] = useState(false);
  const [newTeamTitle, setNewTeamTitle] = useState('');
  const [newTeamDesc, setNewTeamDesc] = useState('');
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [showCreateTeam, setShowCreateTeam] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchProject = async () => {
      const docRef = doc(db, 'projects', id);
      try {
        const snap = await getDoc(docRef);
        if (snap.exists()) setProject({ id: snap.id, ...snap.data() } as Project);
      } catch (error) {
        console.error('Error fetching project', error);
      }
      setLoading(false);
    };
    fetchProject();
    getAllUsers().then(u => setUsers(u));
    const unsubTeams = subscribeToTeams(id, data => setTeams(data));
    const unsubTasks = subscribeToTasks(id, data => setTasks(data));
    return () => { unsubTeams(); unsubTasks(); };
  }, [id]);

  const toggleUserSelection = (userId: string) => {
    setSelectedUserIds(prev =>
      prev.includes(userId) ? prev.filter(uid => uid !== userId) : [...prev, userId]
    );
  };

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !newTeamTitle) return;
    setIsCreatingTeam(true);
    await createTeam(id, newTeamTitle, newTeamDesc, selectedUserIds);
    setNewTeamTitle(''); setNewTeamDesc(''); setSelectedUserIds([]);
    setShowCreateTeam(false); setIsCreatingTeam(false);
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: '12px' }}>
      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--gold)', animation: 'pulse-gold 1.4s ease infinite' }} />
      <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: '14px', color: 'var(--text-muted)' }}>Loading project...</span>
    </div>
  );

  if (!project) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <p style={{ fontFamily: "'Outfit', sans-serif", color: '#ef4444', fontSize: '14px' }}>Project not found or access denied.</p>
    </div>
  );

  const availableUsers = users.filter(u => (!u.assignedProjectId || u.assignedProjectId === id) && u.id !== project.ownerId);
  const projectMembersCount = users.filter(u => u.assignedProjectId === id).length;
  const completedTasksCount = tasks.filter(t => t.status === 'Done').length;

  const tabs: { key: 'overview' | 'teams'; label: string; icon: any }[] = [
    { key: 'overview', label: 'Overview', icon: LayoutDashboard },
    { key: 'teams', label: 'Teams', icon: Briefcase },
  ];

  const stats = [
    { label: 'Total Teams', value: teams.length, icon: Briefcase, color: 'var(--gold)', bg: 'rgba(212,168,67,0.08)' },
    { label: 'Assigned Members', value: projectMembersCount, icon: Users, color: '#2dd4bf', bg: 'rgba(45,212,191,0.08)' },
    { label: 'Total Tasks', value: tasks.length, icon: CheckSquare, color: '#a78bfa', bg: 'rgba(167,139,250,0.08)' },
    { label: 'Completed Tasks', value: completedTasksCount, icon: Check, color: '#34d399', bg: 'rgba(52,211,153,0.08)' },
  ];

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '40px 24px' }}>

      {/* Back */}
      <button
        onClick={() => navigate('/dashboard')}
        style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginBottom: '32px',
          fontFamily: "'Outfit', sans-serif", fontSize: '13px', color: 'var(--text-muted)',
          transition: 'color 0.2s',
        }}
        onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-primary)')}
        onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
      >
        <ArrowLeft style={{ width: '14px', height: '14px' }} />
        Back to Dashboard
      </button>

      {/* Header */}
      <div style={{ marginBottom: '36px', paddingBottom: '32px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>
        <div>
          <p style={{ fontFamily: "'Space Mono', monospace", fontSize: '10px', color: 'var(--gold)', letterSpacing: '0.12em', marginBottom: '10px' }}>PROJECT</p>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '38px', fontWeight: 400, color: 'var(--text-primary)', margin: '0 0 10px', lineHeight: 1.15 }}>{project.title}</h1>
          {project.description && (
            <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: '14px', color: 'var(--text-muted)', margin: '0 0 14px', maxWidth: '600px', lineHeight: 1.6 }}>{project.description}</p>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontFamily: "'Space Mono', monospace", fontSize: '10px', color: 'var(--text-faint)', letterSpacing: '0.06em' }}>
              <Clock style={{ width: '11px', height: '11px' }} />
              Created {project.createdAt?.toDate ? format(project.createdAt.toDate(), 'MMM d, yyyy') : ''}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontFamily: "'Space Mono', monospace", fontSize: '10px', letterSpacing: '0.06em' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#34d399', display: 'inline-block' }} />
              <span style={{ color: '#34d399' }}>Active</span>
            </span>
          </div>
        </div>
        {profile?.role === 'admin' && (
          <button style={{
            padding: '8px 16px', borderRadius: '8px',
            border: '1px solid var(--border-bright)', background: 'var(--bg-elevated)',
            color: 'var(--text-muted)', fontFamily: "'Outfit', sans-serif",
            fontSize: '12px', cursor: 'pointer', transition: 'all 0.2s', flexShrink: 0,
          }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--gold-dim)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-primary)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border-bright)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)'; }}
          >
            Project Settings
          </button>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '4px', borderBottom: '1px solid var(--border)', marginBottom: '32px' }}>
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              display: 'flex', alignItems: 'center', gap: '7px',
              padding: '10px 16px', background: 'none', border: 'none', cursor: 'pointer',
              fontFamily: "'Outfit', sans-serif", fontSize: '13px', fontWeight: 500,
              color: activeTab === tab.key ? 'var(--gold)' : 'var(--text-muted)',
              borderBottom: activeTab === tab.key ? '2px solid var(--gold)' : '2px solid transparent',
              marginBottom: '-1px', transition: 'color 0.2s',
            }}
          >
            <tab.icon style={{ width: '14px', height: '14px' }} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
          {stats.map((stat, i) => (
            <div key={i} style={{ ...card, display: 'flex', alignItems: 'center', gap: '16px', transition: 'border-color 0.2s, box-shadow 0.2s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border-bright)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 24px rgba(0,0,0,0.3)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLDivElement).style.boxShadow = 'none'; }}
            >
              <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: stat.bg, border: `1px solid ${stat.color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <stat.icon style={{ width: '18px', height: '18px', color: stat.color }} />
              </div>
              <div>
                <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: '11px', color: 'var(--text-muted)', margin: '0 0 4px', letterSpacing: '0.02em' }}>{stat.label}</p>
                <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '30px', fontWeight: 700, color: 'var(--text-primary)', margin: 0, lineHeight: 1 }}>{stat.value}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Teams Tab */}
      {activeTab === 'teams' && (
        <div style={{ display: 'grid', gridTemplateColumns: showCreateTeam ? '1fr 320px' : '1fr', gap: '24px', alignItems: 'start' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '22px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Teams</p>
              {profile?.role === 'admin' && !showCreateTeam && (
                <button
                  onClick={() => setShowCreateTeam(true)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    padding: '7px 14px', borderRadius: '8px',
                    border: '1px solid var(--gold-dim)', background: 'rgba(212,168,67,0.06)',
                    color: 'var(--gold)', fontFamily: "'Outfit', sans-serif",
                    fontSize: '12px', fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(212,168,67,0.12)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'rgba(212,168,67,0.06)')}
                >
                  <Plus style={{ width: '13px', height: '13px' }} /> New Team
                </button>
              )}
            </div>

            {teams.length === 0 ? (
              <div style={{ ...card, textAlign: 'center', padding: '60px 24px', borderStyle: 'dashed' }}>
                <Briefcase style={{ width: '36px', height: '36px', color: 'var(--text-faint)', margin: '0 auto 14px' }} />
                <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: '14px', color: 'var(--text-muted)', margin: 0 }}>No teams yet. Create the first one →</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '12px' }}>
                {teams.map(team => (
                  <div key={team.id} style={{ ...card, cursor: 'default', position: 'relative', overflow: 'hidden', transition: 'all 0.2s' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--gold-dim)'; (e.currentTarget as HTMLDivElement).style.background = 'var(--bg-elevated)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLDivElement).style.background = 'var(--bg-surface)'; }}
                  >
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg, var(--gold-dim), transparent)' }} />
                    <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '20px', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 8px', lineHeight: 1.2 }}>{team.title}</h3>
                    <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: '13px', color: 'var(--text-muted)', margin: '0 0 20px', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' } as any}>
                      {team.description || 'No description provided.'}
                    </p>
                    <div style={{ borderTop: '1px solid var(--border)', paddingTop: '14px' }}>
                      <button
                        onClick={() => navigate(`/dashboard/project/${id}/team/${team.id}`)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'Outfit', sans-serif", fontSize: '12px', color: 'var(--gold)', fontWeight: 500, padding: 0 }}
                      >
                        View Team →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Create Team Sidebar */}
          {profile?.role === 'admin' && showCreateTeam && (
            <div style={{ ...card, position: 'sticky', top: '88px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '6px', border: '1px solid var(--gold-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Plus style={{ width: '13px', height: '13px', color: 'var(--gold)' }} />
                  </div>
                  <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '20px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>New Team</h2>
                </div>
                <button onClick={() => setShowCreateTeam(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-faint)', padding: '4px' }}
                  onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-muted)')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-faint)')}
                >
                  <X style={{ width: '16px', height: '16px' }} />
                </button>
              </div>

              <form onSubmit={handleCreateTeam} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ fontFamily: "'Outfit', sans-serif", fontSize: '11px', color: 'var(--text-muted)', letterSpacing: '0.06em', display: 'block', marginBottom: '6px' }}>TEAM TITLE</label>
                  <input
                    type="text" value={newTeamTitle}
                    onChange={(e) => setNewTeamTitle(e.target.value)}
                    placeholder="e.g. Design Team"
                    required style={inputStyle}
                    onFocus={e => (e.currentTarget.style.borderColor = 'var(--gold-dim)')}
                    onBlur={e => (e.currentTarget.style.borderColor = 'var(--border-bright)')}
                  />
                </div>
                <div>
                  <label style={{ fontFamily: "'Outfit', sans-serif", fontSize: '11px', color: 'var(--text-muted)', letterSpacing: '0.06em', display: 'block', marginBottom: '6px' }}>DESCRIPTION</label>
                  <textarea
                    value={newTeamDesc} onChange={(e) => setNewTeamDesc(e.target.value)}
                    placeholder="Describe the team's focus..."
                    style={{ ...inputStyle, height: '80px', resize: 'none' }}
                    onFocus={e => (e.currentTarget.style.borderColor = 'var(--gold-dim)')}
                    onBlur={e => (e.currentTarget.style.borderColor = 'var(--border-bright)')}
                  />
                </div>

                <div>
                  <label style={{ fontFamily: "'Outfit', sans-serif", fontSize: '11px', color: 'var(--text-muted)', letterSpacing: '0.06em', display: 'block', marginBottom: '8px' }}>ASSIGN MEMBERS</label>
                  {availableUsers.length === 0 ? (
                    <div style={{ padding: '12px', borderRadius: '8px', background: 'var(--bg-base)', border: '1px solid var(--border)', fontFamily: "'Outfit', sans-serif", fontSize: '12px', color: 'var(--text-faint)', fontStyle: 'italic' }}>
                      No available users found.
                    </div>
                  ) : (
                    <div style={{ maxHeight: '160px', overflowY: 'auto', border: '1px solid var(--border)', borderRadius: '8px' }}>
                      {availableUsers.map(u => (
                        <div
                          key={u.id}
                          onClick={() => toggleUserSelection(u.id)}
                          style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            padding: '8px 12px', cursor: 'pointer',
                            background: selectedUserIds.includes(u.id) ? 'rgba(212,168,67,0.06)' : 'transparent',
                            borderBottom: '1px solid var(--border)', transition: 'background 0.15s',
                          }}
                        >
                          <div>
                            <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: '13px', color: 'var(--text-primary)', margin: '0 0 1px', fontWeight: 500 }}>{u.name}</p>
                            <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: '11px', color: 'var(--text-faint)', margin: 0 }}>{u.email}</p>
                          </div>
                          <div style={{
                            width: '16px', height: '16px', borderRadius: '4px', flexShrink: 0,
                            border: selectedUserIds.includes(u.id) ? '1px solid var(--gold)' : '1px solid var(--border-bright)',
                            background: selectedUserIds.includes(u.id) ? 'var(--gold)' : 'transparent',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}>
                            {selectedUserIds.includes(u.id) && <Check style={{ width: '10px', height: '10px', color: '#08080f' }} />}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: '10px', color: 'var(--text-faint)', marginTop: '6px' }}>Users assigned to other projects are not shown.</p>
                </div>

                <button
                  type="submit"
                  disabled={isCreatingTeam || !newTeamTitle}
                  style={{
                    padding: '11px',
                    borderRadius: '8px',
                    border: '1px solid ' + (!newTeamTitle || isCreatingTeam ? 'var(--border)' : 'var(--gold)'),
                    background: !newTeamTitle || isCreatingTeam ? 'var(--bg-elevated)' : 'var(--gold)',
                    color: !newTeamTitle || isCreatingTeam ? 'var(--text-faint)' : '#08080f',
                    fontFamily: "'Outfit', sans-serif", fontSize: '13px', fontWeight: 600,
                    cursor: !newTeamTitle || isCreatingTeam ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  {isCreatingTeam ? 'Creating...' : 'Create Team'}
                </button>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
