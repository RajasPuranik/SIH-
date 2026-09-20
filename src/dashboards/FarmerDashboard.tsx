import React from 'react';
import { RoleStatusBanner } from '../components/RoleStatusBanner';
import { GovtProcurementView } from '../components/PillarGovt/GovtProcurementView';
import { MandiCongestionHeatmap } from '../components/MandiCongestionHeatmap';
import { ROLE_THEME } from './roleTheme';

// Kissan view: large, touch-friendly, DBT status front-and-center.
// Wraps the same GovtProcurementView + MandiCongestionHeatmap used before —
// no data/logic changes, only a role-tinted shell and spacing tuned for
// mobile-first rural use.
export const FarmerDashboard: React.FC = () => {
  const theme = ROLE_THEME.farmer;
  return (
    <div className="space-y-6">
      <RoleStatusBanner />
      <div className={`rounded-2xl border p-1 sm:p-2 ${theme.panelClass}`}>
        <div className="space-y-6">
          <GovtProcurementView />
          <MandiCongestionHeatmap />
        </div>
      </div>
    </div>
  );
};
