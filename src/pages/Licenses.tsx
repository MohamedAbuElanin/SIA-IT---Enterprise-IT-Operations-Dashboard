import React, { useMemo } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { DollarSign, Users, AlertTriangle, Clock, XCircle, Eye } from 'lucide-react';
import { SoftwareLicense, LicenseCategory } from '../types';
import { useLicenseStore } from '../store/useLicenseStore';
import { DataGrid } from '../components/common/DataGrid';
import { StatusBadge } from '../components/common/StatusBadge';
import { StatCard } from '../components/ui/StatCard';
import { Card } from '../components/ui/Card';
import { SlideDrawer } from '../components/ui/SlideDrawer';
import { Button } from '../components/ui/Button';
import { ProgressBar } from '../components/ui/ProgressBar';

const CATEGORIES: Array<{ key: LicenseCategory | 'ALL'; label: string }> = [
  { key: 'ALL', label: 'All Categories' },
  { key: 'Windows', label: 'Windows OS' },
  { key: 'Office', label: 'Microsoft 365' },
  { key: 'AnyDesk', label: 'AnyDesk Remote' },
  { key: 'Adobe', label: 'Adobe Suite' },
  { key: 'ERP', label: 'ERP System' },
  { key: 'Antivirus', label: 'Antivirus Security' },
];

export const LicensesPage: React.FC = () => {
  const { licenses, selectedLicense, categoryFilter, statusFilter, setSelectedLicense, setCategoryFilter, setStatusFilter } = useLicenseStore();

  const filteredLicenses = useMemo(() => {
    return licenses.filter(l => {
      const matchesCat = categoryFilter === 'ALL' || l.category === categoryFilter;
      const matchesStatus = statusFilter === 'ALL' || l.status === statusFilter;
      return matchesCat && matchesStatus;
    });
  }, [licenses, categoryFilter, statusFilter]);

  const stats = useMemo(() => ({
    totalExpenditure: licenses.reduce((sum, l) => sum + l.costPerYearUSD, 0),
    expiringSoon: licenses.filter(l => l.status === 'Expiring Soon').length,
    expired: licenses.filter(l => l.status === 'Expired').length,
    totalSeats: licenses.reduce((sum, l) => sum + l.totalSeats, 0),
    usedSeats: licenses.reduce((sum, l) => sum + l.usedSeats, 0),
  }), [licenses]);

  const urgentLicenses = useMemo(() => {
    return licenses
      .filter(l => (l.daysUntilExpiry ?? 999) <= 60)
      .sort((a, b) => (a.daysUntilExpiry ?? 999) - (b.daysUntilExpiry ?? 999));
  }, [licenses]);

  const columns: ColumnDef<SoftwareLicense>[] = [
    {
      accessorKey: 'softwareName',
      header: 'Software & Publisher',
      cell: ({ row }) => (
        <div>
          <div className="font-semibold text-slate-100">{row.original.softwareName}</div>
          <div className="text-xs text-slate-400">{row.original.publisher}</div>
        </div>
      ),
    },
    {
      accessorKey: 'category',
      header: 'Category',
      cell: ({ row }) => (
        <span className="text-xs px-2 py-1 rounded-md bg-slate-800 text-slate-300 font-medium">
          {row.original.category}
        </span>
      ),
    },
    {
      accessorKey: 'licenseKey',
      header: 'License Key',
      cell: ({ row }) => (
        <span className="font-mono text-xs text-blue-400 select-all">{row.original.licenseKey}</span>
      ),
    },
    {
      accessorKey: 'purchaseType',
      header: 'Purchase Type',
      cell: ({ row }) => <span className="text-xs text-slate-300">{row.original.purchaseType}</span>,
    },
    {
      accessorKey: 'usedSeats',
      header: 'Seat Utilization',
      cell: ({ row }) => {
        const pct = Math.round((row.original.usedSeats / row.original.totalSeats) * 100);
        return (
          <div className="w-32 space-y-1">
            <div className="flex justify-between text-xs text-slate-300 font-mono">
              <span>{row.original.usedSeats}/{row.original.totalSeats}</span>
              <span className={`font-bold ${pct >= 100 ? 'text-rose-400' : pct >= 90 ? 'text-amber-400' : 'text-blue-400'}`}>{pct}%</span>
            </div>
            <ProgressBar value={pct} tone={pct >= 100 ? 'danger' : pct >= 90 ? 'warning' : 'primary'} />
          </div>
        );
      },
    },
    {
      accessorKey: 'costPerYearUSD',
      header: 'Annual Cost',
      cell: ({ row }) => (
        <span className="font-semibold text-slate-200 font-mono">${row.original.costPerYearUSD.toLocaleString()}/yr</span>
      ),
    },
    {
      accessorKey: 'expiryDate',
      header: 'Expiry Date',
      cell: ({ row }) => {
        const days = row.original.daysUntilExpiry;
        return (
          <div>
            <span className="text-xs font-mono text-slate-300">{row.original.expiryDate}</span>
            {days !== undefined && days <= 60 && (
              <div className={`text-[11px] font-bold mt-0.5 font-mono ${days <= 30 ? 'text-rose-400' : 'text-amber-400'}`}>
                {days}d remaining
              </div>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <Button
          variant="ghost" size="sm"
          onClick={(e) => { e.stopPropagation(); setSelectedLicense(row.original); }}
          icon={<Eye className="w-4 h-4 text-blue-400" />}
        >
          Details
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6 text-right">
      <div>
        <h1 className="text-2xl font-bold text-slate-100 tracking-tight">Software License Management</h1>
        <p className="text-sm text-slate-400 mt-0.5">
          متابعة اشتراكات البرمجيات المؤسسية، توزيع المقاعد، وتواريخ التجديد السنوية لشركة SIA
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Annual Expenditure"
          value={`$${stats.totalExpenditure.toLocaleString()}`}
          subtext={`${licenses.length} active license agreements`}
          icon={<DollarSign className="w-5 h-5" />}
          variant="primary"
        />
        <StatCard
          title="Expiring Soon"
          value={stats.expiringSoon}
          subtext="Within 60 days — renewal required"
          change={stats.expiringSoon > 0 ? 'Action Required' : 'All licenses valid'}
          changeType={stats.expiringSoon > 0 ? 'negative' : 'positive'}
          icon={<Clock className="w-5 h-5" />}
          variant={stats.expiringSoon > 0 ? 'warning' : 'success'}
        />
        <StatCard
          title="Seat Utilization"
          value={`${stats.usedSeats} / ${stats.totalSeats}`}
          subtext={`${Math.round((stats.usedSeats / stats.totalSeats) * 100)}% allocated`}
          icon={<Users className="w-5 h-5" />}
          variant="primary"
        />
        <StatCard
          title="Expired Licenses"
          value={stats.expired}
          subtext={stats.expired > 0 ? 'Immediate action required' : 'No expired licenses'}
          icon={<XCircle className="w-5 h-5" />}
          variant={stats.expired > 0 ? 'danger' : 'success'}
        />
      </div>

      {/* Urgent Expiry Warning Cards */}
      {urgentLicenses.length > 0 && (
        <div>
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2 font-mono">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            Renewal Alerts — Expiring Within 60 Days
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {urgentLicenses.map(lic => {
              const days = lic.daysUntilExpiry ?? 0;
              const isVeryUrgent = days <= 30;
              return (
                <Card
                  key={lic.id}
                  className={`p-4 border-r-4 cursor-pointer text-right ${isVeryUrgent ? 'border-r-rose-500 bg-rose-950/20' : 'border-r-amber-500 bg-amber-950/10'}`}
                  onClick={() => setSelectedLicense(lic)}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-slate-100 text-sm truncate">{lic.softwareName}</div>
                      <div className="text-xs text-slate-400">{lic.publisher}</div>
                    </div>
                    <div className={`text-xs font-bold px-2 py-1 rounded-lg font-mono ${
                      isVeryUrgent ? 'bg-rose-500/20 text-rose-300 border border-rose-800' : 'bg-amber-500/20 text-amber-300 border border-amber-800'
                    }`}>
                      {days}d left
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-400 mt-2">
                    <span>Expires: <strong className={`font-mono ${isVeryUrgent ? 'text-rose-400' : 'text-amber-400'}`}>{lic.expiryDate}</strong></span>
                    <span className="font-semibold text-slate-200 font-mono">${lic.costPerYearUSD.toLocaleString()}/yr</span>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <StatusBadge status={lic.status} />
                    <span className="text-xs text-slate-500 font-mono">{lic.usedSeats}/{lic.totalSeats} seats</span>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Category + Status Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider font-mono">Category:</span>
        {CATEGORIES.map(cat => (
          <button
            key={cat.key}
            onClick={() => setCategoryFilter(cat.key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              categoryFilter === cat.key ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-700'
            }`}
          >
            {cat.label}
          </button>
        ))}
        <div className="h-4 w-px bg-slate-700 mx-1" />
        <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider font-mono">Status:</span>
        {([
          { key: 'ALL', label: 'All' },
          { key: 'Active', label: 'Active' },
          { key: 'Expiring Soon', label: 'Expiring Soon' },
          { key: 'Expired', label: 'Expired' },
          { key: 'Over-Allocated', label: 'Over-Allocated' }
        ] as const).map(s => (
          <button
            key={s.key}
            onClick={() => setStatusFilter(s.key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              statusFilter === s.key ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-700'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      <DataGrid
        columns={columns}
        data={filteredLicenses}
        searchPlaceholder="Search by software name, publisher, or license key..."
        onRowClick={(lic) => setSelectedLicense(lic)}
        exportFileName="SIA_Software_Licenses"
      />

      <SlideDrawer
        isOpen={!!selectedLicense}
        onClose={() => setSelectedLicense(null)}
        title={selectedLicense?.softwareName || 'License Details'}
        subtitle={selectedLicense?.publisher}
      >
        {selectedLicense && (
          <div className="space-y-5 text-sm text-right">
            <div className="flex items-center gap-3">
              <StatusBadge status={selectedLicense.status} />
              {selectedLicense.daysUntilExpiry !== undefined && selectedLicense.daysUntilExpiry <= 60 && (
                <span className={`text-xs font-bold font-mono ${selectedLicense.daysUntilExpiry <= 30 ? 'text-rose-400' : 'text-amber-400'}`}>
                  ⚠ {selectedLicense.daysUntilExpiry}d until renewal
                </span>
              )}
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-xs text-slate-500 block mb-1 font-semibold font-mono">License Key / ID</span>
              <code className="text-sm font-mono text-blue-400 select-all break-all">{selectedLicense.licenseKey}</code>
            </div>

            <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs">
              <div><span className="text-slate-500 block">Category</span><span className="font-semibold text-slate-200">{selectedLicense.category}</span></div>
              <div><span className="text-slate-500 block">Purchase Type</span><span className="text-slate-200">{selectedLicense.purchaseType}</span></div>
              <div><span className="text-slate-500 block">Total Seats</span><span className="font-bold text-slate-100 font-mono">{selectedLicense.totalSeats}</span></div>
              <div><span className="text-slate-500 block">Used Seats</span><span className="font-bold text-blue-400 font-mono">{selectedLicense.usedSeats}</span></div>
              <div><span className="text-slate-500 block">Annual Cost</span><span className="font-bold text-emerald-400 font-mono">${selectedLicense.costPerYearUSD.toLocaleString()}</span></div>
              <div><span className="text-slate-500 block">Expiry Date</span><span className={`font-bold font-mono ${(selectedLicense.daysUntilExpiry ?? 999) <= 30 ? 'text-rose-400' : (selectedLicense.daysUntilExpiry ?? 999) <= 60 ? 'text-amber-400' : 'text-slate-200'}`}>{selectedLicense.expiryDate}</span></div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs">
              <div className="flex justify-between mb-2">
                <span className="text-slate-400 font-semibold">Seat Pool Utilization</span>
                <span className="font-bold text-slate-200 font-mono">{Math.round((selectedLicense.usedSeats / selectedLicense.totalSeats) * 100)}%</span>
              </div>
              <ProgressBar value={(selectedLicense.usedSeats / selectedLicense.totalSeats) * 100} />
              <div className="flex justify-between mt-1 text-slate-500 font-mono">
                <span>{selectedLicense.usedSeats} used</span>
                <span>{selectedLicense.totalSeats - selectedLicense.usedSeats} available</span>
              </div>
            </div>

            <div>
              <span className="text-xs text-slate-500 block mb-2 font-semibold">Assigned Departments</span>
              <div className="flex flex-wrap gap-1.5">
                {selectedLicense.assignedDepartments.map(dept => (
                  <span key={dept} className="text-xs px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300">
                    {dept}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </SlideDrawer>
    </div>
  );
};
