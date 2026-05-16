import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { CheckCircle2, Clock, Calendar, Briefcase, Users, Component, ClipboardList, ArrowRight } from 'lucide-react';
import { Project, Team, Task, subscribeToAssignedTasks, updateTask } from '../lib/db';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { format } from 'date-fns';

const card = {
  background: 'var(--bg-surface)',
  border: '1px solid var(--border)',
  borderRadius: '10px',
  padding: '24px',
};

const statusColors: Record<string, { bg: string; color: string }> = {
  'Done':        { bg: 'rgba(45,212,191,0.1)',  color: '#2dd4bf' },
  'In Progress': { bg: 'rgba(212,168,67,0.1)',   color: 'var(--gold)' },
  'To Do':       { bg: 'rgba(255,255,255,0.04)', color: 'var(--text-muted)' },
};

const priorityColors: Record<string, { bg: string; color: string }> = {
  'Urgent': { bg: 'rgba(239,68,68,0.1)',   color: '#ef4444' },
  'High':   { bg: 'rgba(251,146,60,0.1)',  color: '#fb923c' },
  'Medium': { bg: 'rgba(212,168,67,0.1)',  color: 'var(--gold)' },
  'Low':    { bg: 'rgba(255,255,255,0.04)', color: 'var(--text-muted)' },
};

export function MemberDashboard() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;
    const fetchData = async () => {
      try {
        if (!profile.assignedProjectId) { setLoading(false); return; }
        const projSnap = await getDoc(doc(db, 'projects', profile.assignedProjectId));
        if (projSnap.exists()) setProject({ id: projSnap.id, ...projSnap.data() } as Project);
        const teamsSnap = await getDocs(collection(db, 'projects', profile.assignedProjectId, 'teams'));
        const userTeams: Team[] = [];
        for (const tDoc of teamsSnap.docs) {
          const memberSnap = await getDoc(doc(db, 'projects', profile.assignedProjectId, 'teams', tDoc.id, 'members', profile.id));
          if (memberSnap.exists()) userTeams.push({ id: tDoc.id, ...tDoc.data() } as Team);
        }
        setTeams(userTeams);
      } catch (err) {
        console.error('Error fetching member dashboard data', err);
      }
      setLoading(false);
    };
    fetchData();

    let unsubTasks: (() => void) | undefined;
    if (profile?.assignedProjectId && profile?.id) {
      unsubTasks = subscribeToAssignedTasks(profile.assignedProjectId, profile.id, (t) => setTasks(t));
    }
    return () => { if (unsubTasks) unsubTasks(); };
  }, [profile]);

  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null);

  const handleStatusChange = async (taskId: string, newStatus: Task['status']) => {
    if (!profile?.assignedProjectId) return;
    setUpdatingTaskId(taskId);
    try {
      await updateTask(profile.assignedProjectId, taskId, { status: newStatus });
    } catch (err: any) {
      alert('Error updating task status: ' + err?.message);
    } finally {
      setUpdatingTaskId(null);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: '12px' }}>
        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--gold)', animation: 'pulse-gold 1.4s ease infinite' }} />
        <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: '14px', color: 'var(--text-muted)' }}>Loading your workspace...</span>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '40px 24px' }}>
      {/* Header */}
      <div style={{ marginBottom: '40px', borderBottom: '1px solid var(--border)', paddingBottom: '32px' }}>
        <p style={{ fontFamily: "'Space Mono', monospace", fontSize: '10px', color: 'var(--gold)', letterSpacing: '0.12em', marginBottom: '10px' }}>MEMBER WORKSPACE</p>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '40px', fontWeight: 400, color: 'var(--text-primary)', margin: '0 0 8px', lineHeight: 1.15 }}>
          Welcome back, <em style={{ fontStyle: 'italic', color: 'var(--gold)' }}>{profile?.name?.split(' ')[0]}</em>
        </h1>
        <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: '14px', color: 'var(--text-muted)', margin: 0 }}>Here's your work overview.</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px', marginBottom: '48px', maxWidth: '600px' }}>
        {[
          { label: 'Pending Tasks', value: tasks.filter(t => t.status === 'To Do' || t.status === 'In Progress').length, icon: Clock, color: 'var(--gold)' },
          { label: 'Completed', value: tasks.filter(t => t.status === 'Done').length, icon: CheckCircle2, color: '#2dd4bf' },
          { label: 'With Deadlines', value: tasks.filter(t => t.dueDate && t.status !== 'Done').length, icon: Calendar, color: '#a78bfa' },
        ].map((stat, i) => (
          <div key={i} style={{ ...card, display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', border: '1px solid var(--border-bright)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <stat.icon style={{ width: '14px', height: '14px', color: stat.color }} />
            </div>
            <div>
              <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: '11px', color: 'var(--text-muted)', margin: '0 0 2px' }}>{stat.label}</p>
              <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '26px', fontWeight: 700, color: 'var(--text-primary)', margin: 0, lineHeight: 1 }}>{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Workspace */}
      <div>
        <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '22px', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 20px' }}>Your Assigned Workspace</p>

        {!project ? (
          <div style={{ ...card, textAlign: 'center', padding: '64px 24px', borderStyle: 'dashed' }}>
            <Briefcase style={{ width: '40px', height: '40px', color: 'var(--text-faint)', margin: '0 auto 16px' }} />
            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '22px', color: 'var(--text-muted)', margin: '0 0 8px' }}>Not assigned to any project</p>
            <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: '13px', color: 'var(--text-faint)', margin: 0 }}>When an Admin adds you to a team, it will appear here.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            {/* Project banner */}
            <div style={{ ...card, display: 'flex', alignItems: 'center', gap: '16px', borderLeft: '3px solid var(--gold)' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '8px', border: '1px solid var(--gold-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Briefcase style={{ width: '16px', height: '16px', color: 'var(--gold)' }} />
              </div>
              <div>
                <p style={{ fontFamily: "'Space Mono', monospace", fontSize: '9px', color: 'var(--gold)', letterSpacing: '0.12em', margin: '0 0 4px' }}>CURRENT PROJECT</p>
                <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '22px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>{project.title}</p>
              </div>
            </div>

            {/* Teams */}
            {teams.length > 0 && (
              <div>
                <p style={{ fontFamily: "'Space Mono', monospace", fontSize: '9px', color: 'var(--text-muted)', letterSpacing: '0.12em', margin: '0 0 16px' }}>YOUR TEAMS</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '12px' }}>
                  {teams.map(team => (
                    <div
                      key={team.id}
                      style={{ ...card, cursor: 'pointer', transition: 'all 0.2s' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--gold-dim)'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border)'; }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                        <Component style={{ width: '14px', height: '14px', color: 'var(--text-faint)' }} />
                        <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', margin: 0, lineHeight: 1.2 }}>{team.title}</h3>
                      </div>
                      <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: '12px', color: 'var(--text-muted)', margin: '0 0 16px', lineHeight: 1.5 }}>{team.description}</p>
                      <div style={{ borderTop: '1px solid var(--border)', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <button
                          onClick={() => navigate(`/dashboard/project/${project.id}/team/${team.id}`)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontFamily: "'Outfit', sans-serif", fontSize: '12px', color: 'var(--gold)', fontWeight: 500, padding: 0 }}
                        >
                          Go to Team <ArrowRight style={{ width: '11px', height: '11px' }} />
                        </button>
                        <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '9px', color: 'var(--text-faint)' }}>
                          {team.createdAt?.toDate ? format(team.createdAt.toDate(), 'MMM d') : ''}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tasks */}
            <div>
              <p style={{ fontFamily: "'Space Mono', monospace", fontSize: '9px', color: 'var(--text-muted)', letterSpacing: '0.12em', margin: '0 0 16px' }}>MY ASSIGNED TASKS</p>
              <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                      {['Task', 'Status', 'Priority', 'Due Date'].map(h => (
                        <th key={h} style={{ padding: '12px 20px', textAlign: 'left', fontFamily: "'Space Mono', monospace", fontSize: '9px', color: 'var(--text-faint)', letterSpacing: '0.1em', fontWeight: 400 }}>{h.toUpperCase()}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {tasks.length === 0 ? (
                      <tr>
                        <td colSpan={4} style={{ padding: '32px', textAlign: 'center', fontFamily: "'Outfit', sans-serif", fontSize: '13px', color: 'var(--text-faint)', fontStyle: 'italic' }}>No tasks assigned to you yet.</td>
                      </tr>
                    ) : tasks.map((task, i) => {
                      const sc = statusColors[task.status] || statusColors['To Do'];
                      const pc = priorityColors[task.priority || 'Medium'] || priorityColors['Medium'];
                      return (
                        <tr key={task.id} style={{ borderBottom: i < tasks.length - 1 ? '1px solid var(--border)' : 'none', transition: 'background 0.15s' }}
                          onMouseEnter={e => { (e.currentTarget as HTMLTableRowElement).style.background = 'var(--bg-elevated)'; }}
                          onMouseLeave={e => { (e.currentTarget as HTMLTableRowElement).style.background = 'transparent'; }}
                        >
                          <td style={{ padding: '14px 20px' }}>
                            <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: '13px', color: 'var(--text-primary)', fontWeight: 500, margin: '0 0 2px' }}>{task.title}</p>
                            {task.teamId && (
                              <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: '11px', color: 'var(--text-faint)', margin: 0 }}>
                                {teams.find(t => t.id === task.teamId)?.title || ''}
                              </p>
                            )}
                          </td>
                          <td style={{ padding: '14px 20px' }}>
                            <select
                              value={task.status}
                              onChange={(e) => handleStatusChange(task.id, e.target.value as Task['status'])}
                              disabled={updatingTaskId === task.id}
                              style={{
                                padding: '4px 10px', borderRadius: '100px', border: 'none',
                                background: sc.bg, color: sc.color,
                                fontFamily: "'Space Mono', monospace", fontSize: '10px',
                                cursor: 'pointer', outline: 'none', letterSpacing: '0.05em',
                                opacity: updatingTaskId === task.id ? 0.5 : 1,
                              }}
                            >
                              <option value="To Do">To Do</option>
                              <option value="In Progress">In Progress</option>
                              <option value="Done">Done</option>
                            </select>
                          </td>
                          <td style={{ padding: '14px 20px' }}>
                            <span style={{ padding: '3px 10px', borderRadius: '100px', background: pc.bg, color: pc.color, fontFamily: "'Space Mono', monospace", fontSize: '9px', letterSpacing: '0.08em' }}>
                              {(task.priority || 'Medium').toUpperCase()}
                            </span>
                          </td>
                          <td style={{ padding: '14px 20px' }}>
                            {task.dueDate ? (
                              <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '10px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Clock style={{ width: '10px', height: '10px' }} />
                                {format(task.dueDate.toDate ? task.dueDate.toDate() : new Date(task.dueDate), 'MMM d, yyyy')}
                              </span>
                            ) : <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '10px', color: 'var(--text-faint)' }}>—</span>}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
