import React, { useMemo } from 'react';
import {
  AlertTriangle, CheckCircle2, Cpu, Database, Globe2, HardDrive,
  MemoryStick, PackageCheck, RefreshCcw, Server, ShieldAlert,
  Ticket, Wrench, XCircle,
} from 'lucide-react';
import {
  Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer,
  Tooltip, XAxis, YAxis,
} from 'recharts';
import { Card } from '../ui/Card';
import { StatCard } from '../ui/StatCard';
import { useAssetStore } from '../../store/useAssetStore';
import { useLicenseStore } from '../../store/useLicenseStore';
import { useMaintenanceStore } from '../../store/useMaintenanceStore';
import { useServerStore } from '../../store/useServerStore';

const CHART_COLORS = ['#2563eb', '#22c55e', '#f59e0b', '#a855f7', '#06b6d4', '#f43f5e'];

const chartTooltip = {
  contentStyle: { backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', textAlign: 'right' as const, direction: 'rtl' as const },
  itemStyle: { color: '#e2e8f0', fontSize: '12px' },
  labelStyle: { color: '#94a3b8', fontSize: '12px' },
};

const getWarrantyExpiry = (warranty: string) => {
  const match = warranty.match(/20\d{2}-\d{2}-\d{2}/);
  return match ? new Date(`${match[0]}T00:00:00`) : null;
};

const monthArabicMap: Record<string, string> = {
  Jan: 'يناير', Feb: 'فبراير', Mar: 'مارس', Apr: 'أبريل', May: 'مايو', Jun: 'يونيو',
  Jul: 'يوليو', Aug: 'أغسطس', Sep: 'سبتمبر', Oct: 'أكتوبر', Nov: 'نوفمبر', Dec: 'ديسمبر'
};

export const OperationalInsights: React.FC = () => {
  const { assets } = useAssetStore();
  const { licenses } = useLicenseStore();
  const { records } = useMaintenanceStore();
  const { servers } = useServerStore();

  const data = useMemo(() => {
    const now = new Date();
    const warrantyExpiring = assets.filter((asset) => {
      const expiry = getWarrantyExpiry(asset.warranty || '');
      return expiry && expiry >= now && (expiry.getTime() - now.getTime()) / 86_400_000 <= 180;
    }).length;
    const assetsByCategory = Object.entries(
      assets.reduce<Record<string, number>>((acc, asset) => {
        if (asset.deviceType) {
          acc[asset.deviceType] = (acc[asset.deviceType] || 0) + 1;
        }
        return acc;
      }, {})
    ).map(([name, value]) => ({ name, value }));
    const assetsByDepartment = Object.entries(
      assets.reduce<Record<string, number>>((acc, asset) => {
        if (asset.department) {
          acc[asset.department] = (acc[asset.department] || 0) + 1;
        }
        return acc;
      }, {})
    ).map(([name, value]) => ({ name: name.replace('Engineering & ', ''), value }));
    const maintenancePerMonth = Object.entries(
      records.reduce<Record<string, number>>((acc, record) => {
        if (record.date) {
          const month = new Date(`${record.date}T00:00:00`).toLocaleString('en', { month: 'short' });
          const arMonth = monthArabicMap[month] || month;
          acc[arMonth] = (acc[arMonth] || 0) + 1;
        }
        return acc;
      }, {})
    ).map(([name, value]) => ({ name, value }));
    const licenseStatus = ['Active', 'Expiring Soon', 'Expired', 'Over-Allocated'].map((name) => ({
      name,
      value: licenses.filter((license) => license.status === name).length,
    })).filter((item) => item.value > 0);
    const warrantyStatus = [
      { name: 'Expiring in 180d', value: warrantyExpiring },
      { name: 'Covered', value: Math.max(assets.length - warrantyExpiring, 0) },
    ].filter((item) => item.value > 0);
    const storageUsage = servers.map((server) => ({ name: server.name.replace('SIA-', ''), value: server.diskUsagePct }));
    const healthyServers = servers.filter((server) => server.status === 'Healthy').length;
    const average = (field: 'cpuUsagePct' | 'ramUsagePct' | 'diskUsagePct') =>
      servers.length ? Math.round(servers.reduce((sum, server) => sum + (server[field] || 0), 0) / servers.length) : 0;

    return {
      warrantyExpiring,
      assetsByCategory,
      assetsByDepartment,
      maintenancePerMonth,
      licenseStatus,
      warrantyStatus,
      storageUsage,
      healthyServers,
      cpu: average('cpuUsagePct'),
      ram: average('ramUsagePct'),
      disk: average('diskUsagePct'),
      broken: assets.filter((asset) => asset.status === 'Decommissioned').length,
      underMaintenance: assets.filter((asset) => asset.status === 'In Repair').length,
      working: assets.filter((asset) => asset.status === 'Active').length,
      openTickets: records.filter((record) => !['Resolved', 'Closed'].includes(record.status)).length,
      licensesExpiring: licenses.filter((license) => license.status === 'Expiring Soon' || (license.daysUntilExpiry ?? 999) <= 60).length,
    };
  }, [assets, licenses, records, servers]);

  const pie = (chartData: { name: string; value: number }[]) => {
    if (chartData.length === 0) {
      return (
        <div className="h-full flex items-center justify-center text-xs text-slate-500">
          لا توجد بيانات متاحة حالياً
        </div>
      );
    }
    return (
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={chartData} dataKey="value" nameKey="name" innerRadius={42} outerRadius={72} paddingAngle={3}>
            {chartData.map((entry, index) => <Cell key={entry.name} fill={CHART_COLORS[index % CHART_COLORS.length]} />)}
          </Pie>
          <Tooltip {...chartTooltip} />
        </PieChart>
      </ResponsiveContainer>
    );
  };

  const stats = [
    ['Total Assets', assets.length, 'أجهزة وعتاد مسجل بالنظام', <HardDrive className="w-5 h-5" />, 'primary' as const],
    ['Active Devices', data.working, 'أجهزة نشطة ومسندة للعمل', <CheckCircle2 className="w-5 h-5" />, 'success' as const],
    ['Decommissioned', data.broken, 'أجهزة منسقة ومستبعدة', <XCircle className="w-5 h-5" />, 'danger' as const],
    ['In Repair', data.underMaintenance, 'أجهزة قيد الصيانة حالياً', <Wrench className="w-5 h-5" />, 'warning' as const],
    ['Open Tickets', data.openTickets, 'تذاكر صيانة تتطلب المتابعة', <Ticket className="w-5 h-5" />, 'warning' as const],
    ['Licenses Expiring', data.licensesExpiring, 'تراخيص تنتهي خلال 60 يوماً', <ShieldAlert className="w-5 h-5" />, 'warning' as const],
    ['Warranty Expiring', data.warrantyExpiring, 'ضمان ينتهي خلال 180 يوماً', <AlertTriangle className="w-5 h-5" />, 'warning' as const],
    ['Servers Health', `${data.healthyServers}/${servers.length} Healthy`, 'جاهزية السيرفرات الحيوية', <Server className="w-5 h-5" />, data.healthyServers === servers.length && servers.length > 0 ? 'success' as const : 'warning' as const],
    ['CPU Usage', `${data.cpu}%`, 'متوسط استهلاك المعالجات', <Cpu className="w-5 h-5" />, data.cpu > 80 ? 'warning' as const : 'primary' as const],
    ['RAM Usage', `${data.ram}%`, 'متوسط استهلاك الذاكرة', <MemoryStick className="w-5 h-5" />, data.ram > 80 ? 'warning' as const : 'primary' as const],
    ['Disk Usage', `${data.disk}%`, 'متوسط استهلاك وحدات التخزين', <Database className="w-5 h-5" />, data.disk > 80 ? 'warning' as const : 'primary' as const],
  ];

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-slate-100">Operations Overview</h2>
        <p className="text-xs text-slate-400 mt-0.5">تحليلات وإحصاءات فورية للبنية التحتية وسجلات التشغيل</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {stats.map(([title, value, subtext, icon, variant]) => (
          <StatCard key={String(title)} title={String(title)} value={value as string | number} subtext={String(subtext)} icon={icon as React.ReactNode} variant={variant as 'primary' | 'success' | 'warning' | 'danger'} />
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-sm font-bold text-slate-100 mb-4">الأصول حسب النوع (Assets by Category)</h3>
          <div className="h-64">{pie(data.assetsByCategory)}</div>
        </Card>
        <Card>
          <h3 className="text-sm font-bold text-slate-100 mb-4">الأصول حسب القسم (Assets by Department)</h3>
          <div className="h-64">
            {data.assetsByDepartment.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.assetsByDepartment} layout="vertical" margin={{ left: 12, right: 12 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                  <XAxis type="number" allowDecimals={false} stroke="#64748b" fontSize={11} />
                  <YAxis type="category" dataKey="name" width={140} stroke="#94a3b8" fontSize={10} />
                  <Tooltip {...chartTooltip} />
                  <Bar dataKey="value" name="Devices" fill="#2563eb" radius={[4, 0, 0, 4]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-500">
                لا توجد بيانات متاحة حالياً
              </div>
            )}
          </div>
        </Card>
        <Card>
          <h3 className="text-sm font-bold text-slate-100 mb-4">سجلات الصيانة شهرياً (Maintenance Records)</h3>
          <div className="h-64">
            {data.maintenancePerMonth.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.maintenancePerMonth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                  <YAxis allowDecimals={false} stroke="#64748b" fontSize={11} />
                  <Tooltip {...chartTooltip} />
                  <Bar dataKey="value" name="Tickets" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-500">
                لا توجد سجلات صيانة حالياً
              </div>
            )}
          </div>
        </Card>
        <Card>
          <h3 className="text-sm font-bold text-slate-100 mb-4">حالة التراخيص (License Status)</h3>
          <div className="h-64">{pie(data.licenseStatus)}</div>
        </Card>
        <Card>
          <h3 className="text-sm font-bold text-slate-100 mb-4">حالة الضمان (Warranty Status)</h3>
          <div className="h-64">{pie(data.warrantyStatus)}</div>
        </Card>
        <Card>
          <h3 className="text-sm font-bold text-slate-100 mb-4">استهلاك وحدات التخزين للخوادم (Server Storage Usage)</h3>
          <div className="h-64">
            {data.storageUsage.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.storageUsage}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={10} interval={0} />
                  <YAxis domain={[0, 100]} unit="%" stroke="#64748b" fontSize={11} />
                  <Tooltip {...chartTooltip} formatter={(value) => [`${value}%`, 'Disk Usage']} />
                  <Bar dataKey="value" name="Disk Usage" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-500">
                لا توجد خوادم مسجلة
              </div>
            )}
          </div>
        </Card>
      </div>
    </section>
  );
};
