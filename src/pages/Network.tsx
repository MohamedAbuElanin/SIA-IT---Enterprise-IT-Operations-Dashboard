import React, { useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Radio, Server } from 'lucide-react';
import { NetworkDevice } from '../types';
import initialNetwork from '../data/network.json';
import { DataGrid } from '../components/common/DataGrid';
import { StatusBadge } from '../components/common/StatusBadge';
import { Card } from '../components/ui/Card';

export const NetworkPage: React.FC = () => {
  const [devices] = useState<NetworkDevice[]>((initialNetwork as NetworkDevice[]) || []);

  const columns: ColumnDef<NetworkDevice>[] = [
    {
      accessorKey: 'name',
      header: 'اسم الرابط / الجهاز (Device Name)',
      cell: ({ row }) => (
        <div>
          <div className="font-semibold text-slate-100">{row.original.name}</div>
          <div className="text-xs text-slate-400">{row.original.location}</div>
        </div>
      ),
    },
    {
      accessorKey: 'type',
      header: 'نوع الجهاز (Type)',
      cell: ({ row }) => <span className="text-xs text-blue-400 font-semibold">{row.original.type}</span>,
    },
    {
      accessorKey: 'ipAddress',
      header: 'عنوان IP Address',
      cell: ({ row }) => <span className="font-mono text-xs text-slate-300">{row.original.ipAddress}</span>,
    },
    {
      accessorKey: 'latencyMs',
      header: 'زمن الاستجابة (Ping)',
      cell: ({ row }) => (
        <span className={`font-mono text-xs font-semibold ${row.original.latencyMs > 50 ? 'text-amber-400' : 'text-emerald-400'}`}>
          {row.original.latencyMs} ms
        </span>
      ),
    },
    {
      accessorKey: 'bandwidthMbps',
      header: 'معدل النقل (Throughput)',
      cell: ({ row }) => <span className="text-xs font-semibold text-slate-200 font-mono">{row.original.bandwidthMbps} Mbps</span>,
    },
    {
      accessorKey: 'packetLossPct',
      header: 'فقدان الحزم (Packet Loss)',
      cell: ({ row }) => (
        <span className={`text-xs font-semibold font-mono ${row.original.packetLossPct > 5 ? 'text-rose-400' : 'text-slate-400'}`}>
          {row.original.packetLossPct}%
        </span>
      ),
    },
    {
      accessorKey: 'status',
      header: 'الحالة التشغيلية',
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
  ];

  return (
    <div className="space-y-6 text-right">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-slate-100 tracking-tight">البنية التحتية والشبكة الإقليمية (Network Topology)</h1>
        <p className="text-sm text-slate-400 mt-0.5">
          مراقبة سويتشات مراكز البيانات الرئيسية، أنفاق IPsec VPN الإقليمية، ونقاط وصول Wi-Fi بالمستودعات
        </p>
      </div>

      {/* Visual Network Hub Topology Grid */}
      {devices.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {devices.slice(0, 3).map((dev) => (
            <Card key={dev.id} className="p-4 space-y-3 bg-gradient-to-br from-slate-900 to-blue-950/30 border-blue-900/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Server className="w-5 h-5 text-blue-400" />
                  <h3 className="font-bold text-slate-100 text-sm">{dev.name}</h3>
                </div>
                <StatusBadge status={dev.status} />
              </div>
              <p className="text-xs text-slate-400">{dev.location} | {dev.bandwidthMbps} Mbps</p>
              <div className="pt-2 border-t border-slate-800 text-xs flex justify-between text-slate-300">
                <span>{dev.type}</span>
                <span className="font-mono text-blue-400">{dev.ipAddress}</span>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Network DataGrid */}
      <DataGrid
        columns={columns}
        data={devices}
        searchPlaceholder="ابحث باسم الرابط، الموقع، أو عنوان IP..."
        exportFileName="SIA_Network_Devices_Status"
      />
    </div>
  );
};
