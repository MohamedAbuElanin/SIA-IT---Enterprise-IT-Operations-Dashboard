import React from 'react';
import {
  HardDrive,
  Server,
  Wrench,
  Activity,
  RefreshCw,
  CheckCircle2,
  Inbox,
  Radio,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { StatCard } from '../components/ui/StatCard';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { StatusBadge } from '../components/common/StatusBadge';
import { useAssetStore } from '../store/useAssetStore';
import { useServerStore } from '../store/useServerStore';
import { useMaintenanceStore } from '../store/useMaintenanceStore';
import { OperationalInsights } from '../components/common/OperationalInsights';
import { WorkspaceWidgets } from '../components/common/WorkspaceWidgets';
import { ProgressBar } from '../components/ui/ProgressBar';

export const DashboardPage: React.FC = () => {
  const { assets } = useAssetStore();
  const { servers } = useServerStore();
  const { records, updateRecordStatus } = useMaintenanceStore();

  const totalAssets = assets.length;
  const activeAssets = assets.filter((a) => a.status === 'Active').length;

  const totalServers = servers.length;
  const healthyServers = servers.filter((s) => s.status === 'Healthy').length;

  const openTickets = records.filter((t) => t.status === 'Open' || t.status === 'In Progress').length;
  const criticalTickets = records.filter((t) => t.priority === 'Critical').length;

  // Group assets dynamically by location
  const locationStats = React.useMemo(() => {
    const map = new Map<string, { total: number; active: number; categories: Record<string, number> }>();
    assets.forEach((asset) => {
      const loc = asset.location || 'غير محدد';
      const curr = map.get(loc) || { total: 0, active: 0, categories: {} };
      curr.total += 1;
      if (asset.status === 'Active') curr.active += 1;
      curr.categories[asset.deviceType] = (curr.categories[asset.deviceType] || 0) + 1;
      map.set(loc, curr);
    });
    return Array.from(map.entries()).map(([location, stat]) => ({
      location,
      ...stat,
    }));
  }, [assets]);

  return (
    <div className="space-y-6 text-right">
      {/* Page Title & Quick Action Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight">SIA IT Operations Dashboard</h1>
          <p className="text-sm text-slate-400 mt-0.5">
            المراقبة الفورية لصحة البنية التحتية والقياس اللوجستي لقطاع سلاسل إمداد قطع غيار السيارات
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" icon={<RefreshCw className="w-4 h-4" />}>
            تحديث البيانات
          </Button>
        </div>
      </div>

      {/* KPI Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Asset Fleet"
          value={`${activeAssets} / ${totalAssets}`}
          subtext="الأجهزة والعتاد التشغيلي"
          change={totalAssets > 0 ? `${activeAssets} نشط` : 'لا توجد أجهزة'}
          changeType="positive"
          icon={<HardDrive className="w-5 h-5" />}
          variant="primary"
        />

        <StatCard
          title="Server Health & Clusters"
          value={`${healthyServers} / ${totalServers} Online`}
          subtext="خوادم قواعد البيانات والخدمات"
          change={totalServers > 0 ? `${healthyServers} سليم` : 'لا توجد خوادم'}
          changeType={healthyServers === totalServers && totalServers > 0 ? 'positive' : 'neutral'}
          icon={<Server className="w-5 h-5" />}
          variant="success"
        />

        <StatCard
          title="Active Maintenance Incidents"
          value={openTickets}
          subtext={`${criticalTickets} أولوية حرجة`}
          change={criticalTickets > 0 ? 'يتطلب إجراءً فورياً' : 'مستقر'}
          changeType={criticalTickets > 0 ? 'negative' : 'positive'}
          icon={<Wrench className="w-5 h-5" />}
          variant={criticalTickets > 0 ? 'danger' : 'warning'}
        />

        <StatCard
          title="Network Status"
          value={totalServers > 0 ? 'Connected' : 'Ready'}
          subtext="جاهزية الربط والشبكة"
          change="مستقر"
          changeType="positive"
          icon={<Activity className="w-5 h-5" />}
          variant="primary"
        />
      </div>

      <WorkspaceWidgets />
      <OperationalInsights />

      {/* Real-time Telemetry Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Network Throughput Area Chart */}
        <Card className="lg:col-span-2 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-100">معدل نقل بيانات الشبكة (Network Throughput)</h3>
              <p className="text-xs text-slate-400">مراقبة حركة البيانات المباشرة للروابط الرئيسية</p>
            </div>
          </div>

          <div className="h-64 w-full flex items-center justify-center bg-slate-950/40 rounded-xl border border-slate-800/60">
            <div className="text-center text-slate-500 space-y-2">
              <Radio className="w-8 h-8 mx-auto opacity-40 text-slate-400" />
              <p className="text-xs">يتم تسجيل وعرض حركة النقل فور اتصال أجهزة الشبكة والروابط الحية.</p>
            </div>
          </div>
        </Card>

        {/* Server Nodes Quick Resource Dials */}
        <Card className="flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-100 mb-1">Server Resource Monitors</h3>
            <p className="text-xs text-slate-400 mb-4">مراقبة استهلاك المعالج والذاكرة للخوادم</p>

            {servers.length > 0 ? (
              <div className="space-y-4">
                {servers.map((srv) => (
                  <div key={srv.id} className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-slate-200 font-mono">{srv.name}</span>
                      <StatusBadge status={srv.status} />
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                        <span>CPU ({srv.cpuUsagePct}%)</span>
                        <span>RAM ({srv.ramUsagePct}%)</span>
                      </div>
                      <ProgressBar value={srv.cpuUsagePct} tone={srv.cpuUsagePct > 80 ? 'danger' : 'primary'} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center text-slate-500 space-y-2">
                <Server className="w-8 h-8 mx-auto opacity-30" />
                <p className="text-xs">لا توجد خوادم مسجلة في الوقت الحالي.</p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Active Incidents & Warehouse Logistics Status Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Incidents Stream */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-100">Active Incidents Queue</h3>
              <p className="text-xs text-slate-400">تذاكر الصيانة ومشكلات العتاد المفتوحة</p>
            </div>
          </div>

          {records.length > 0 ? (
            <div className="space-y-3">
              {records.slice(0, 4).map((ticket) => (
                <div
                  key={ticket.id}
                  className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start justify-between gap-4"
                >
                  <div className="space-y-1 flex-1 text-right">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-blue-400 font-mono">{ticket.ticketNumber}</span>
                      {ticket.priority && <StatusBadge status={ticket.priority} />}
                      <StatusBadge status={ticket.status} />
                    </div>
                    <h4 className="text-sm font-semibold text-slate-200">{ticket.problem}</h4>
                    <p className="text-xs text-slate-400 line-clamp-1">{ticket.cause || ticket.solution}</p>
                  </div>

                  {ticket.status !== 'Resolved' && ticket.status !== 'Closed' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateRecordStatus(ticket.id, 'Resolved')}
                      icon={<CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                    >
                      حل التذكرة
                    </Button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-slate-500 space-y-2">
              <Inbox className="w-8 h-8 mx-auto opacity-30" />
              <p className="text-xs">لا توجد تذاكر صيانة أو بلاغات مفتوحة حالياً.</p>
            </div>
          )}
        </Card>

        {/* Warehouse Hub Fleet Status Overview */}
        <Card>
          <div className="mb-4">
            <h3 className="text-base font-bold text-slate-100">Warehouse Hub Fleet Status</h3>
            <p className="text-xs text-slate-400">توزيع وجاهزية العتاد والأجهزة التشغيلية حسب المركز اللوجستي</p>
          </div>

          {locationStats.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {locationStats.map((loc) => (
                <div key={loc.location} className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                  <p className="text-xs font-semibold text-slate-400 font-mono">{loc.location}</p>
                  <p className="text-xl font-bold text-blue-400">{loc.total} أجهزة مسجلة</p>
                  <p className="text-[11px] text-emerald-400 font-semibold">{loc.active} أجهزة بحالة نشطة</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-slate-500 space-y-2">
              <HardDrive className="w-8 h-8 mx-auto opacity-30" />
              <p className="text-xs">لا توجد أجهزة مسندة لمراكز لوجستية حالياً.</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};
