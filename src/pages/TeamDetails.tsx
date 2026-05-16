import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { doc, getDoc, Timestamp, deleteDoc } from 'firebase/firestore';
import { Team, TeamMember, UserProfile, subscribeToTeamMembers, getAllUsers, updateMemberRole, updateTeamInfo, addTeamMember, removeTeamMember, Task, createTask, subscribeToTasks, updateTask } from '../lib/db';
import { db } from '../lib/firebase';
import { ArrowLeft, Clock, Activity, CheckCircle2, Users, Edit2, Plus, X, Trash2, LayoutDashboard } from 'lucide-react';
import { format } from 'date-fns';

const card: React.CSSProperties = {
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

const selectStyle: React.CSSProperties = {
  ...inputStyle,
  cursor: 'pointer',
};

const labelStyle: React.CSSProperties = {
  fontFamily: "'Outfit', sans-serif",
  fontSize: '11px',
  color: 'var(--text-muted)',
  letterSpacing: '0.06em',
  display: 'block',
  marginBottom: '6px',
};

const statusColors: Record<string, { bg: string; color: string }> = {
  'Done':        { bg: 'rgba(52,211,153,0.1)',   color: '#34d399' },
  'In Progress': { bg: 'rgba(212,168,67,0.1)',   color: 'var(--gold)' },
  'To Do':       { bg: 'rgba(255,255,255,0.04)', color: 'var(--text-muted)' },
};

const priorityColors: Record<string, { bg: string; color: string; border: string }> = {
  'Urgent': { bg: 'rgba(239,68,68,0.08)',   color: '#f87171', border: 'rgba(239,68,68,0.2)' },
  'High':   { bg: 'rgba(251,146,60,0.08)',  color: '#fb923c', border: 'rgba(251,146,60,0.2)' },
  'Medium': { bg: 'rgba(212,168,67,0.08)',  color: 'var(--gold)', border: 'rgba(212,168,67,0.2)' },
  'Low':    { bg: 'rgba(255,255,255,0.04)', color: 'var(--text-faint)', border: 'var(--border)' },
};

const roleColors: Record<string, { bg: string; color: string }> = {
  'admin': { bg: 'rgba(167,139,250,0.1)', color: '#a78bfa' },
  'PL':    { bg: 'rgba(99,102,241,0.1)',  color: '#818cf8' },
  'QL':    { bg: 'rgba(45,212,191,0.1)',  color: '#2dd4bf' },
  'QR':    { bg: 'rgba(52,211,153,0.1)',  color: '#34d399' },
  'Tasker':{ bg: 'rgba(255,255,255,0.04)', color: 'var(--text-muted)' },
};

export function TeamDetails() {
  const { projectId, teamId } = useParams<{ projectId: string; teamId: string }>();
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [team, setTeam] = useState<Team | null>(null);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [isSavingInfo, setIsSavingInfo] = useState(false);

  const [isAddingMembers, setIsAddingMembers] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<Task['priority']>('Medium');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');
  const [newTaskAssigneeId, setNewTaskAssigneeId] = useState('');
  const [isSubmittingTask, setIsSubmittingTask] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'members' | 'tasks'>('overview');

  useEffect(() => {
    if (!projectId || !teamId) return;
    const fetchTeam = async () => {
      try {
        const snap = await getDoc(doc(db, 'projects', projectId, 'teams', teamId));
        if (snap.exists()) {
          const t = { id: snap.id, ...snap.data() } as Team;
          setTeam(t); setEditTitle(t.title); setEditDesc(t.description || '');
        }
      } catch (error) { console.error('Error fetching team', error); }
      setLoading(false);
    };
    fetchTeam();
    getAllUsers().then(u => setUsers(u));
    const unsubMembers = subscribeToTeamMembers(projectId, teamId, m => setMembers(m));
    const unsubTasks = subscribeToTasks(projectId, allTasks => {
      setTasks(allTasks.filter(t => t.teamId === teamId));
    });
    return () => { unsubMembers(); unsubTasks(); };
  }, [projectId, teamId]);

  const handleRoleChange = async (userId: string, newRole: 'admin' | 'Tasker' | 'QR' | 'QL' | 'PL') => {
    if (!projectId || !teamId) return;
    await updateMemberRole(projectId, teamId, userId, newRole);
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId || !teamId || !profile || !newTaskTitle.trim()) return;
    setIsSubmittingTask(true);
    try {
      await createTask({
        projectId, teamId, title: newTaskTitle, description: newTaskDesc,
        status: 'To Do', priority: newTaskPriority, creatorId: profile.id,
        assigneeId: newTaskAssigneeId || undefined,
        dueDate: newTaskDueDate ? Timestamp.fromDate(new Date(newTaskDueDate)) : undefined
      });
      setNewTaskTitle(''); setNewTaskDesc(''); setNewTaskPriority('Medium');
      setNewTaskDueDate(''); setNewTaskAssigneeId(''); setIsCreatingTask(false);
    } catch (error: any) { alert('Error creating task: ' + error?.message); }
    finally { setIsSubmittingTask(false); }
  };

  const handleUpdateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId || !editingTask || !editingTask.title.trim()) return;
    setIsSubmittingTask(true);
    try {
      const dataToUpdate: any = {
        title: editingTask.title, description: editingTask.description,
        priority: editingTask.priority, status: editingTask.status,
      };
      if (editingTask.dueDate) {
        dataToUpdate.dueDate = typeof editingTask.dueDate === 'string'
          ? Timestamp.fromDate(new Date(editingTask.dueDate)) : editingTask.dueDate;
      } else { dataToUpdate.dueDate = null; }
      dataToUpdate.assigneeId = editingTask.assigneeId || null;
      await updateTask(projectId, editingTask.id, dataToUpdate);
      setEditingTask(null);
    } catch (error: any) { alert('Error updating task: ' + error?.message); }
    finally { setIsSubmittingTask(false); }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!projectId) return;
    if (confirm('Are you sure you want to delete this task?')) {
      try { await deleteDoc(doc(db, 'projects', projectId, 'tasks', taskId)); }
      catch (err: any) { alert('Error deleting task: ' + err?.message); }
    }
  };

  const handleSaveInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId || !teamId || !editTitle.trim()) return;
    setIsSavingInfo(true);
    await updateTeamInfo(projectId, teamId, editTitle, editDesc);
    setTeam(prev => prev ? { ...prev, title: editTitle, description: editDesc } : null);
    setIsSavingInfo(false); setIsEditingInfo(false);
  };

  const handleRemoveMember = async (userId: string) => {
    if (!projectId || !teamId) return;
    if (confirm('Are you sure you want to remove this member?')) {
      await removeTeamMember(projectId, teamId, userId, true);
    }
  };

  const handleAddMember = async (userId: string) => {
    if (!projectId || !teamId) return;
    await addTeamMember(projectId, teamId, userId, 'Tasker');
    setSearchTerm('');
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: '12px' }}>
      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--gold)', animation: 'pulse-gold 1.4s ease infinite' }} />
      <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: '14px', color: 'var(--text-muted)' }}>Loading team...</span>
    </div>
  );

  if (!team) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <p style={{ fontFamily: "'Outfit', sans-serif", color: '#ef4444', fontSize: '14px' }}>Team not found or access denied.</p>
    </div>
  );

  const availableUsersToAdd = users.filter(u =>
    !members.some(m => m.userId === u.id) &&
    (!u.assignedProjectId || u.assignedProjectId === projectId)
  );
  const filteredUsers = availableUsersToAdd.filter(u =>
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const teamMembersCount = members.length;
  const completedTasksCount = tasks.filter(t => t.status === 'Done').length;

  const tabs = [
    { key: 'overview' as const, label: 'Overview', icon: LayoutDashboard },
    { key: 'members' as const, label: 'Members', icon: Users },
    { key: 'tasks' as const, label: 'Task Board', icon: Clock },
  ];

  const overviewStats = [
    { label: 'Total Members', value: teamMembersCount, icon: Users, color: '#2dd4bf', bg: 'rgba(45,212,191,0.08)' },
    { label: 'Total Tasks', value: tasks.length, icon: Activity, color: 'var(--gold)', bg: 'rgba(212,168,67,0.08)' },
    { label: 'Completed', value: completedTasksCount, icon: CheckCircle2, color: '#34d399', bg: 'rgba(52,211,153,0.08)' },
  ];

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '40px 24px' }}>

      {/* Back */}
      <button
        onClick={() => profile?.role === 'admin' ? navigate(`/dashboard/project/${projectId}`) : navigate('/dashboard')}
        style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginBottom: '32px',
          fontFamily: "'Outfit', sans-serif", fontSize: '13px', color: 'var(--text-muted)', transition: 'color 0.2s',
        }}
        onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-primary)')}
        onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
      >
        <ArrowLeft style={{ width: '14px', height: '14px' }} />
        Back to {profile?.role === 'admin' ? 'Project' : 'Dashboard'}
      </button>

      {/* Header Card */}
      <div style={{ ...card, marginBottom: '32px' }}>
        {isEditingInfo ? (
          <form onSubmit={handleSaveInfo} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={labelStyle}>TEAM TITLE</label>
              <input value={editTitle} onChange={e => setEditTitle(e.target.value)} required style={inputStyle}
                onFocus={e => (e.currentTarget.style.borderColor = 'var(--gold-dim)')}
                onBlur={e => (e.currentTarget.style.borderColor = 'var(--border-bright)')} />
            </div>
            <div>
              <label style={labelStyle}>DESCRIPTION</label>
              <textarea value={editDesc} onChange={e => setEditDesc(e.target.value)}
                style={{ ...inputStyle, height: '80px', resize: 'none' }}
                onFocus={e => (e.currentTarget.style.borderColor = 'var(--gold-dim)')}
                onBlur={e => (e.currentTarget.style.borderColor = 'var(--border-bright)')} />
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="submit" disabled={isSavingInfo} style={{
                padding: '9px 20px', borderRadius: '8px', border: '1px solid var(--gold)',
                background: 'var(--gold)', color: '#08080f',
                fontFamily: "'Outfit', sans-serif", fontSize: '13px', fontWeight: 600, cursor: 'pointer',
              }}>{isSavingInfo ? 'Saving...' : 'Save'}</button>
              <button type="button" onClick={() => setIsEditingInfo(false)} style={{
                padding: '9px 20px', borderRadius: '8px', border: '1px solid var(--border-bright)',
                background: 'transparent', color: 'var(--text-muted)',
                fontFamily: "'Outfit', sans-serif", fontSize: '13px', cursor: 'pointer',
              }}>Cancel</button>
            </div>
          </form>
        ) : (
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>
            <div>
              <p style={{ fontFamily: "'Space Mono', monospace", fontSize: '10px', color: 'var(--gold)', letterSpacing: '0.12em', margin: '0 0 10px' }}>TEAM</p>
              <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '34px', fontWeight: 400, color: 'var(--text-primary)', margin: '0 0 8px', lineHeight: 1.2 }}>{team.title}</h1>
              {team.description && (
                <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: '14px', color: 'var(--text-muted)', margin: 0, lineHeight: 1.6, maxWidth: '600px' }}>{team.description}</p>
              )}
            </div>
            {profile?.role === 'admin' && (
              <button
                onClick={() => setIsEditingInfo(true)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '7px 14px', borderRadius: '8px',
                  border: '1px solid var(--border-bright)', background: 'transparent',
                  color: 'var(--text-muted)', fontFamily: "'Outfit', sans-serif",
                  fontSize: '12px', cursor: 'pointer', transition: 'all 0.2s', flexShrink: 0,
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--gold-dim)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--gold)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border-bright)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)'; }}
              >
                <Edit2 style={{ width: '13px', height: '13px' }} /> Edit Team
              </button>
            )}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '4px', borderBottom: '1px solid var(--border)', marginBottom: '32px' }}>
        {tabs.map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
            display: 'flex', alignItems: 'center', gap: '7px',
            padding: '10px 16px', background: 'none', border: 'none', cursor: 'pointer',
            fontFamily: "'Outfit', sans-serif", fontSize: '13px', fontWeight: 500,
            color: activeTab === tab.key ? 'var(--gold)' : 'var(--text-muted)',
            borderBottom: activeTab === tab.key ? '2px solid var(--gold)' : '2px solid transparent',
            marginBottom: '-1px', transition: 'color 0.2s',
          }}>
            <tab.icon style={{ width: '14px', height: '14px' }} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview */}
      {activeTab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', maxWidth: '700px' }}>
          {overviewStats.map((stat, i) => (
            <div key={i} style={{ ...card, display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: stat.bg, border: `1px solid ${stat.color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <stat.icon style={{ width: '18px', height: '18px', color: stat.color }} />
              </div>
              <div>
                <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: '11px', color: 'var(--text-muted)', margin: '0 0 4px' }}>{stat.label}</p>
                <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '30px', fontWeight: 700, color: 'var(--text-primary)', margin: 0, lineHeight: 1 }}>{stat.value}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Members */}
      {activeTab === 'members' && (
        <div style={{ display: 'grid', gridTemplateColumns: isAddingMembers ? '1fr 300px' : '1fr', gap: '24px', alignItems: 'start' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '22px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Team Members</p>
              {profile?.role === 'admin' && !isAddingMembers && (
                <button onClick={() => setIsAddingMembers(true)} style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '7px 14px', borderRadius: '8px',
                  border: '1px solid var(--gold-dim)', background: 'rgba(212,168,67,0.06)',
                  color: 'var(--gold)', fontFamily: "'Outfit', sans-serif",
                  fontSize: '12px', fontWeight: 500, cursor: 'pointer',
                }}>
                  <Plus style={{ width: '13px', height: '13px' }} /> Add Member
                </button>
              )}
            </div>

            <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
              {members.length === 0 ? (
                <div style={{ padding: '48px', textAlign: 'center', fontFamily: "'Outfit', sans-serif", fontSize: '14px', color: 'var(--text-faint)', fontStyle: 'italic' }}>
                  No members in this team yet.
                </div>
              ) : (
                <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                  {members.map((member, i) => {
                    const userProfile = users.find(u => u.id === member.userId);
                    const rc = roleColors[member.role] || roleColors['Tasker'];
                    return (
                      <li key={member.userId} style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '14px 20px',
                        borderBottom: i < members.length - 1 ? '1px solid var(--border)' : 'none',
                        transition: 'background 0.15s',
                      }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-elevated)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{
                            width: '34px', height: '34px', borderRadius: '50%',
                            background: 'rgba(212,168,67,0.1)', border: '1px solid var(--gold-dim)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontFamily: "'Outfit', sans-serif", fontSize: '13px', fontWeight: 600,
                            color: 'var(--gold)', flexShrink: 0,
                          }}>
                            {userProfile?.name?.charAt(0).toUpperCase() || '?'}
                          </div>
                          <div>
                            <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: '13px', color: 'var(--text-primary)', margin: '0 0 2px', fontWeight: 500 }}>
                              {userProfile?.name || 'Unknown User'}
                            </p>
                            <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: '11px', color: 'var(--text-faint)', margin: 0 }}>
                              {userProfile?.email || 'N/A'}
                            </p>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          {profile?.role === 'admin' ? (
                            <>
                              <select
                                value={member.role}
                                onChange={(e) => handleRoleChange(member.userId, e.target.value as any)}
                                style={{
                                  padding: '5px 10px', borderRadius: '6px',
                                  border: '1px solid var(--border-bright)', background: 'var(--bg-base)',
                                  color: 'var(--text-muted)', fontFamily: "'Outfit', sans-serif",
                                  fontSize: '12px', cursor: 'pointer', outline: 'none',
                                }}
                              >
                                <option value="Tasker">Tasker</option>
                                <option value="QR">Quality Reviewer (QR)</option>
                                <option value="QL">Quality Lead (QL)</option>
                                <option value="PL">Project Lead (PL)</option>
                                <option value="admin">Admin</option>
                              </select>
                              <button
                                onClick={() => handleRemoveMember(member.userId)}
                                title="Remove from team"
                                style={{
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  width: '30px', height: '30px', borderRadius: '7px',
                                  border: '1px solid rgba(239,68,68,0.2)', background: 'rgba(239,68,68,0.06)',
                                  color: '#f87171', cursor: 'pointer', transition: 'all 0.2s',
                                }}
                                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.12)')}
                                onMouseLeave={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.06)')}
                              >
                                <Trash2 style={{ width: '13px', height: '13px' }} />
                              </button>
                            </>
                          ) : (
                            <span style={{
                              padding: '3px 10px', borderRadius: '100px',
                              background: rc.bg, color: rc.color,
                              fontFamily: "'Space Mono', monospace", fontSize: '9px', letterSpacing: '0.08em',
                            }}>
                              {member.role === 'admin' ? 'ADMIN' : member.role}
                            </span>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>

          {/* Add Members Sidebar */}
          {profile?.role === 'admin' && isAddingMembers && (
            <div style={{ ...card, position: 'sticky', top: '88px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '20px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Add Member</h3>
                <button onClick={() => setIsAddingMembers(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-faint)', padding: '4px' }}>
                  <X style={{ width: '16px', height: '16px' }} />
                </button>
              </div>
              <input
                type="text" placeholder="Search by name or email..."
                value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                style={{ ...inputStyle, marginBottom: '12px' }}
                onFocus={e => (e.currentTarget.style.borderColor = 'var(--gold-dim)')}
                onBlur={e => (e.currentTarget.style.borderColor = 'var(--border-bright)')}
              />
              <div style={{ maxHeight: '256px', overflowY: 'auto', border: '1px solid var(--border)', borderRadius: '8px' }}>
                {filteredUsers.length === 0 ? (
                  <div style={{ padding: '16px', textAlign: 'center', fontFamily: "'Outfit', sans-serif", fontSize: '13px', color: 'var(--text-faint)', fontStyle: 'italic' }}>
                    No available users found.
                  </div>
                ) : filteredUsers.map(u => (
                  <div key={u.id} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '10px 12px', borderBottom: '1px solid var(--border)', transition: 'background 0.15s',
                  }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-elevated)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <div>
                      <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: '13px', color: 'var(--text-primary)', margin: '0 0 1px', fontWeight: 500 }}>{u.name}</p>
                      <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: '11px', color: 'var(--text-faint)', margin: 0 }}>{u.email}</p>
                    </div>
                    <button onClick={() => handleAddMember(u.id)} style={{
                      width: '28px', height: '28px', borderRadius: '7px', flexShrink: 0,
                      border: '1px solid var(--gold-dim)', background: 'rgba(212,168,67,0.06)',
                      color: 'var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                    }}>
                      <Plus style={{ width: '13px', height: '13px' }} />
                    </button>
                  </div>
                ))}
              </div>
              <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: '10px', color: 'var(--text-faint)', marginTop: '8px' }}>Only users unassigned or assigned to this project are shown.</p>
            </div>
          )}
        </div>
      )}

      {/* Task Board */}
      {activeTab === 'tasks' && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '22px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Task Board</p>
            {profile?.role === 'admin' && !isCreatingTask && (
              <button onClick={() => { setIsCreatingTask(true); setEditingTask(null); }} style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '8px 16px', borderRadius: '8px',
                border: '1px solid var(--gold)', background: 'var(--gold)',
                color: '#08080f', fontFamily: "'Outfit', sans-serif",
                fontSize: '13px', fontWeight: 600, cursor: 'pointer',
              }}>
                <Plus style={{ width: '14px', height: '14px' }} /> Add Task
              </button>
            )}
          </div>

          {/* Create Task Form */}
          {isCreatingTask && (
            <div style={{ ...card, marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '22px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Create New Task</h3>
                <button onClick={() => setIsCreatingTask(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-faint)', padding: '4px' }}>
                  <X style={{ width: '16px', height: '16px' }} />
                </button>
              </div>
              <form onSubmit={handleCreateTask}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                  <div>
                    <label style={labelStyle}>TASK TITLE</label>
                    <input type="text" value={newTaskTitle} onChange={(e) => setNewTaskTitle(e.target.value)} required style={inputStyle}
                      onFocus={e => (e.currentTarget.style.borderColor = 'var(--gold-dim)')}
                      onBlur={e => (e.currentTarget.style.borderColor = 'var(--border-bright)')} />
                  </div>
                  <div>
                    <label style={labelStyle}>PRIORITY</label>
                    <select value={newTaskPriority} onChange={(e) => setNewTaskPriority(e.target.value as any)} style={selectStyle}
                      onFocus={e => (e.currentTarget.style.borderColor = 'var(--gold-dim)')}
                      onBlur={e => (e.currentTarget.style.borderColor = 'var(--border-bright)')}>
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Urgent">Urgent</option>
                    </select>
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={labelStyle}>DESCRIPTION</label>
                    <textarea value={newTaskDesc} onChange={(e) => setNewTaskDesc(e.target.value)}
                      style={{ ...inputStyle, height: '80px', resize: 'none' }}
                      onFocus={e => (e.currentTarget.style.borderColor = 'var(--gold-dim)')}
                      onBlur={e => (e.currentTarget.style.borderColor = 'var(--border-bright)')} />
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={labelStyle}>DUE DATE</label>
                    <input type="date" value={newTaskDueDate} onChange={(e) => setNewTaskDueDate(e.target.value)} style={{ ...selectStyle, colorScheme: 'dark' }}
                      onFocus={e => (e.currentTarget.style.borderColor = 'var(--gold-dim)')}
                      onBlur={e => (e.currentTarget.style.borderColor = 'var(--border-bright)')} />
                  </div>
                  {profile?.role === 'admin' && (
                    <div style={{ gridColumn: '1 / -1' }}>
                      <label style={labelStyle}>ASSIGN TO</label>
                      <select value={newTaskAssigneeId} onChange={(e) => setNewTaskAssigneeId(e.target.value)} style={selectStyle}
                        onFocus={e => (e.currentTarget.style.borderColor = 'var(--gold-dim)')}
                        onBlur={e => (e.currentTarget.style.borderColor = 'var(--border-bright)')}>
                        <option value="">Unassigned</option>
                        {members.map(m => {
                          const u = users.find(user => user.id === m.userId);
                          return <option key={m.userId} value={m.userId}>{u?.name || u?.email || m.userId}</option>;
                        })}
                      </select>
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button type="submit" disabled={isSubmittingTask || !newTaskTitle} style={{
                    padding: '9px 24px', borderRadius: '8px',
                    border: '1px solid ' + (!newTaskTitle || isSubmittingTask ? 'var(--border)' : 'var(--gold)'),
                    background: !newTaskTitle || isSubmittingTask ? 'var(--bg-elevated)' : 'var(--gold)',
                    color: !newTaskTitle || isSubmittingTask ? 'var(--text-faint)' : '#08080f',
                    fontFamily: "'Outfit', sans-serif", fontSize: '13px', fontWeight: 600,
                    cursor: !newTaskTitle || isSubmittingTask ? 'not-allowed' : 'pointer',
                  }}>
                    {isSubmittingTask ? 'Creating...' : 'Create Task'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Edit Task Form */}
          {editingTask && (
            <div style={{ ...card, marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '22px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Edit Task</h3>
                <button onClick={() => setEditingTask(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-faint)', padding: '4px' }}>
                  <X style={{ width: '16px', height: '16px' }} />
                </button>
              </div>
              <form onSubmit={handleUpdateTask}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                  <div>
                    <label style={labelStyle}>TASK TITLE</label>
                    <input type="text" value={editingTask.title} onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })} required style={inputStyle}
                      onFocus={e => (e.currentTarget.style.borderColor = 'var(--gold-dim)')}
                      onBlur={e => (e.currentTarget.style.borderColor = 'var(--border-bright)')} />
                  </div>
                  <div>
                    <label style={labelStyle}>PRIORITY</label>
                    <select value={editingTask.priority} onChange={(e) => setEditingTask({ ...editingTask, priority: e.target.value as any })} style={selectStyle}
                      onFocus={e => (e.currentTarget.style.borderColor = 'var(--gold-dim)')}
                      onBlur={e => (e.currentTarget.style.borderColor = 'var(--border-bright)')}>
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Urgent">Urgent</option>
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>STATUS</label>
                    <select value={editingTask.status} onChange={(e) => setEditingTask({ ...editingTask, status: e.target.value as any })} style={selectStyle}
                      onFocus={e => (e.currentTarget.style.borderColor = 'var(--gold-dim)')}
                      onBlur={e => (e.currentTarget.style.borderColor = 'var(--border-bright)')}>
                      <option value="To Do">To Do</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Done">Done</option>
                    </select>
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={labelStyle}>DESCRIPTION</label>
                    <textarea value={editingTask.description || ''} onChange={(e) => setEditingTask({ ...editingTask, description: e.target.value })}
                      style={{ ...inputStyle, height: '80px', resize: 'none' }}
                      onFocus={e => (e.currentTarget.style.borderColor = 'var(--gold-dim)')}
                      onBlur={e => (e.currentTarget.style.borderColor = 'var(--border-bright)')} />
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={labelStyle}>DUE DATE</label>
                    <input type="date" style={{ ...selectStyle, colorScheme: 'dark' }}
                      value={editingTask.dueDate
                        ? (typeof editingTask.dueDate === 'string'
                          ? editingTask.dueDate.split('T')[0]
                          : (editingTask.dueDate.toDate
                            ? format(editingTask.dueDate.toDate(), 'yyyy-MM-dd')
                            : format(new Date(editingTask.dueDate), 'yyyy-MM-dd')))
                        : ''}
                      onChange={(e) => setEditingTask({ ...editingTask, dueDate: e.target.value })}
                      onFocus={e => (e.currentTarget.style.borderColor = 'var(--gold-dim)')}
                      onBlur={e => (e.currentTarget.style.borderColor = 'var(--border-bright)')} />
                  </div>
                  {profile?.role === 'admin' && (
                    <div style={{ gridColumn: '1 / -1' }}>
                      <label style={labelStyle}>ASSIGN TO</label>
                      <select value={editingTask.assigneeId || ''} onChange={(e) => setEditingTask({ ...editingTask, assigneeId: e.target.value })} style={selectStyle}
                        onFocus={e => (e.currentTarget.style.borderColor = 'var(--gold-dim)')}
                        onBlur={e => (e.currentTarget.style.borderColor = 'var(--border-bright)')}>
                        <option value="">Unassigned</option>
                        {members.map(m => {
                          const u = users.find(user => user.id === m.userId);
                          return <option key={m.userId} value={m.userId}>{u?.name || u?.email || m.userId}</option>;
                        })}
                      </select>
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '4px' }}>
                  {profile?.role === 'admin' && (
                    <button type="button" onClick={() => { handleDeleteTask(editingTask.id); setEditingTask(null); }} style={{
                      display: 'flex', alignItems: 'center', gap: '6px',
                      padding: '8px 14px', borderRadius: '8px',
                      border: '1px solid rgba(239,68,68,0.2)', background: 'rgba(239,68,68,0.06)',
                      color: '#f87171', fontFamily: "'Outfit', sans-serif", fontSize: '13px', cursor: 'pointer',
                    }}>
                      <Trash2 style={{ width: '13px', height: '13px' }} /> Delete
                    </button>
                  )}
                  <div style={{ display: 'flex', gap: '10px', marginLeft: 'auto' }}>
                    <button type="button" onClick={() => setEditingTask(null)} style={{
                      padding: '8px 18px', borderRadius: '8px',
                      border: '1px solid var(--border-bright)', background: 'transparent',
                      color: 'var(--text-muted)', fontFamily: "'Outfit', sans-serif", fontSize: '13px', cursor: 'pointer',
                    }}>Cancel</button>
                    <button type="submit" disabled={isSubmittingTask || !editingTask.title} style={{
                      padding: '8px 18px', borderRadius: '8px',
                      border: '1px solid var(--gold)', background: 'var(--gold)',
                      color: '#08080f', fontFamily: "'Outfit', sans-serif", fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                    }}>{isSubmittingTask ? 'Saving...' : 'Save Changes'}</button>
                  </div>
                </div>
              </form>
            </div>
          )}

          {/* Kanban Columns */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            {[
              { title: 'To Do', icon: Clock, accentColor: 'var(--text-faint)' },
              { title: 'In Progress', icon: Activity, accentColor: 'var(--gold)' },
              { title: 'Done', icon: CheckCircle2, accentColor: '#34d399' },
            ].map((col, i) => {
              const colTasks = tasks.filter(t => t.status === col.title);
              return (
                <div key={i} style={{
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border)',
                  borderTop: `2px solid ${col.accentColor}`,
                  borderRadius: '12px', padding: '16px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <col.icon style={{ width: '14px', height: '14px', color: col.accentColor }} />
                      <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>{col.title}</span>
                    </div>
                    <span style={{
                      padding: '2px 8px', borderRadius: '100px',
                      background: 'var(--bg-surface)', border: '1px solid var(--border)',
                      fontFamily: "'Space Mono', monospace", fontSize: '10px', color: 'var(--text-faint)',
                    }}>{colTasks.length}</span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', minHeight: '160px' }}>
                    {colTasks.length === 0 ? (
                      <div style={{
                        border: '1px dashed var(--border)', borderRadius: '8px',
                        padding: '24px', textAlign: 'center',
                        fontFamily: "'Outfit', sans-serif", fontSize: '12px', color: 'var(--text-faint)',
                      }}>
                        No tasks
                      </div>
                    ) : colTasks.map(t => {
                      const pc = priorityColors[t.priority || 'Medium'] || priorityColors['Medium'];
                      return (
                        <div key={t.id} style={{
                          background: 'var(--bg-surface)', border: '1px solid var(--border)',
                          borderRadius: '10px', padding: '14px',
                          cursor: 'pointer', transition: 'all 0.2s',
                        }}
                          onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border-bright)'; (e.currentTarget as HTMLDivElement).style.background = 'var(--bg-elevated)'; }}
                          onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLDivElement).style.background = 'var(--bg-surface)'; }}
                        >
                          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px', marginBottom: '10px' }}>
                            <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: '13px', color: 'var(--text-primary)', fontWeight: 500, margin: 0, lineHeight: 1.4 }}>{t.title}</p>
                            {profile?.role === 'admin' && (
                              <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); setEditingTask(t); setIsCreatingTask(false); }}
                                style={{
                                  background: 'none', border: 'none', cursor: 'pointer', flexShrink: 0,
                                  color: 'var(--text-faint)', padding: '2px', transition: 'color 0.2s',
                                }}
                                onMouseEnter={e => (e.currentTarget.style.color = 'var(--gold)')}
                                onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-faint)')}
                              >
                                <Edit2 style={{ width: '12px', height: '12px' }} />
                              </button>
                            )}
                          </div>
                          {t.description && (
                            <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: '11px', color: 'var(--text-muted)', margin: '0 0 10px', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' } as any}>
                              {t.description}
                            </p>
                          )}
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span style={{
                              padding: '2px 8px', borderRadius: '100px',
                              background: pc.bg, border: `1px solid ${pc.border}`,
                              color: pc.color, fontFamily: "'Space Mono', monospace",
                              fontSize: '9px', letterSpacing: '0.08em',
                            }}>
                              {(t.priority || 'MEDIUM').toUpperCase()}
                            </span>
                            {t.assigneeId && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <div style={{
                                  width: '22px', height: '22px', borderRadius: '50%',
                                  background: 'rgba(212,168,67,0.1)', border: '1px solid var(--gold-dim)',
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  fontFamily: "'Outfit', sans-serif", fontSize: '10px', fontWeight: 600, color: 'var(--gold)',
                                }}>
                                  {users.find(u => u.id === t.assigneeId)?.name?.charAt(0).toUpperCase() || '?'}
                                </div>
                                <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: '11px', color: 'var(--text-muted)', maxWidth: '70px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {users.find(u => u.id === t.assigneeId)?.name?.split(' ')[0]}
                                </span>
                              </div>
                            )}
                          </div>
                          {t.dueDate && (
                            <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                              <Clock style={{ width: '10px', height: '10px', color: 'var(--text-faint)' }} />
                              <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '9px', color: 'var(--text-faint)' }}>
                                {format(t.dueDate.toDate ? t.dueDate.toDate() : new Date(t.dueDate), 'MMM d, yyyy')}
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
