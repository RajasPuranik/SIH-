import React from 'react';
import { RoleStatusBanner } from '../components/RoleStatusBanner';
import { CropStockExchangeView } from '../components/PillarMarket/CropStockExchangeView';
import { ROLE_THEME } from './roleTheme';

// Corporate Buyer view: wraps the same CropStockExchangeView used before
// (escrow balance/GSTIN live in the banner); analytics-forward shell.
export const BuyerDashboard: React.FC = () => {
  const theme = ROLE_THEME.corporate_buyer;
  return (
    <div className="space-y-6">
      <RoleStatusBanner />
      <div className={`rounded-2xl border p-1 sm:p-2 ${theme.panelClass}`}>
        <CropStockExchangeView />
      </div>
    </div>
  );
};
