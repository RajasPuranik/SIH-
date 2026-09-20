import React from 'react';
import { RoleStatusBanner } from '../components/RoleStatusBanner';
import { GovtProcurementView } from '../components/PillarGovt/GovtProcurementView';
import { ROLE_THEME } from './roleTheme';

// APMC/Gate Officer view: dense-but-scannable, wraps the same
// GovtProcurementView used before (gate-duty status lives in the banner).
export const OfficerDashboard: React.FC = () => {
  const theme = ROLE_THEME.mandi_officer;
  return (
    <div className="space-y-6">
      <RoleStatusBanner />
      <div className={`rounded-2xl border p-1 sm:p-2 ${theme.panelClass}`}>
        <GovtProcurementView />
      </div>
    </div>
  );
};
