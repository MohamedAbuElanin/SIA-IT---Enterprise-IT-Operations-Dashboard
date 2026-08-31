import React from 'react';
import { Badge } from '../ui/Badge';
import { AssetStatus, TicketStatus, ServerStatus, LicenseStatus, NetworkStatus } from '../../types';

interface StatusBadgeProps {
  status: AssetStatus | TicketStatus | ServerStatus | LicenseStatus | NetworkStatus | string;
}

const statusMap: Record<string, { label: string; variant: 'success' | 'warning' | 'danger' | 'primary' | 'neutral'; pulse?: boolean }> = {
  // Success / Online
  Active: { label: 'Active', variant: 'success', pulse: true },
  Healthy: { label: 'Healthy', variant: 'success', pulse: true },
  Online: { label: 'Online', variant: 'success', pulse: true },
  'In Stock': { label: 'In Stock', variant: 'success', pulse: true },
  Resolved: { label: 'Resolved', variant: 'success' },
  Closed: { label: 'Closed', variant: 'neutral' },

  // Warning / In Progress
  'In Repair': { label: 'In Repair', variant: 'warning' },
  'In Progress': { label: 'In Progress', variant: 'warning' },
  Warning: { label: 'Warning', variant: 'warning' },
  Degraded: { label: 'Degraded', variant: 'warning' },
  'Low Stock': { label: 'Low Stock', variant: 'warning' },
  'Expiring Soon': { label: 'Expiring Soon', variant: 'warning' },
  'Pending Parts': { label: 'Pending Parts', variant: 'warning' },
  'Over-Allocated': { label: 'Over-Allocated', variant: 'warning' },

  // Danger / Offline / Critical
  Critical: { label: 'Critical', variant: 'danger', pulse: true },
  Offline: { label: 'Offline', variant: 'danger', pulse: true },
  Expired: { label: 'Expired', variant: 'danger', pulse: true },
  'Out of Stock': { label: 'Out of Stock', variant: 'danger', pulse: true },
  Decommissioned: { label: 'Decommissioned', variant: 'danger' },

  // Primary / Info
  'Spare Stock': { label: 'Spare Stock', variant: 'primary' },
  Open: { label: 'Open', variant: 'primary' },
  'Pending Audit': { label: 'Pending Audit', variant: 'primary' },
  Maintenance: { label: 'Maintenance', variant: 'warning' },
  'On Order': { label: 'On Order', variant: 'primary' },

  // Priority Levels
  High: { label: 'High', variant: 'warning' },
  Medium: { label: 'Medium', variant: 'primary' },
  Low: { label: 'Low', variant: 'neutral' },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const item = statusMap[status];
  if (item) {
    return <Badge variant={item.variant} pulse={item.pulse} className="font-mono text-[11px] font-semibold">{item.label}</Badge>;
  }
  return <Badge variant="neutral" className="font-mono text-[11px] font-semibold">{status}</Badge>;
};
