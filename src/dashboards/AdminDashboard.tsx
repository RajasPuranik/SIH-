import React from 'react';
import { RoleStatusBanner } from '../components/RoleStatusBanner';
import { AdminView } from '../components/Admin/AdminView';
import { ROLE_THEME } from './roleTheme';

// Admin "control panel" view: wraps the same AdminView used before,
// slate control-panel shell to distinguish it from the other roles.
export const AdminDashboard: React.FC = () => {
  const theme = ROLE_THEME.admin;
  return (
    <div className="space-y-6">
      <RoleStatusBanner />
      <div className={`rounded-2xl border p-1 sm:p-2 ${theme.panelClass}`}>
        <AdminView />
      </div>
    </div>
  );
};
