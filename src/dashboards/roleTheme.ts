import type { UserRole } from '../types';

export interface RoleTheme {
  label: string;
  badgeClass: string;
  panelClass: string;
  ringClass: string;
}

// Pure presentation tokens — mirrors the accent colors already used
// elsewhere in the app (Navbar, LoginPage) so every surface stays consistent.
export const ROLE_THEME: Record<UserRole, RoleTheme> = {
  farmer: {
    label: 'Kissan',
    badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    panelClass: 'bg-emerald-50/40 border-emerald-100',
    ringClass: 'ring-emerald-200',
  },
  mandi_officer: {
    label: 'Mandi Officer',
    badgeClass: 'bg-blue-50 text-blue-800 border-blue-200',
    panelClass: 'bg-blue-50/40 border-blue-100',
    ringClass: 'ring-blue-200',
  },
  corporate_buyer: {
    label: 'Corporate Buyer',
    badgeClass: 'bg-indigo-50 text-indigo-800 border-indigo-200',
    panelClass: 'bg-indigo-50/40 border-indigo-100',
    ringClass: 'ring-indigo-200',
  },
  admin: {
    label: 'Administrator',
    badgeClass: 'bg-slate-900 text-white border-slate-900',
    panelClass: 'bg-slate-50 border-slate-200',
    ringClass: 'ring-slate-300',
  },
  shipper: {
    label: 'Transporter',
    badgeClass: 'bg-orange-50 text-orange-800 border-orange-200',
    panelClass: 'bg-orange-50/40 border-orange-100',
    ringClass: 'ring-orange-200',
  },
};
