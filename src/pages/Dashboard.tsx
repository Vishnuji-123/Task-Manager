import React from 'react';
import { Routes, Route } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { AdminDashboard } from './AdminDashboard';
import { MemberDashboard } from './MemberDashboard';
import { ProjectDetails } from './ProjectDetails';
import { TeamDetails } from './TeamDetails';

export function Dashboard() {
  const { profile } = useAuth();

  return (
    <div style={{ minHeight: 'calc(100vh - 64px)', backgroundColor: 'var(--bg-base)' }}>
      <Routes>
        <Route path="/" element={profile?.role === 'admin' ? <AdminDashboard /> : <MemberDashboard />} />
        <Route path="/project/:id" element={<ProjectDetails />} />
        <Route path="/project/:projectId/team/:teamId" element={<TeamDetails />} />
      </Routes>
    </div>
  );
}
