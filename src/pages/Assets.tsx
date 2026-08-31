import React, { useState, useMemo } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import {
  Plus, Eye, Trash2, Monitor, Tag,
  User, Calendar, Wrench, Shield, Cpu,
  CheckCircle2, Star, ImagePlus, Paperclip, QrCode, Pencil
} from 'lucide-react';
import { ITAsset, AssetStatus } from '../types';
import { useAssetStore } from '../store/useAssetStore';
import { DataGrid } from '../components/common/DataGrid';
import { StatusBadge } from '../components/common/StatusBadge';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { SlideDrawer } from '../components/ui/SlideDrawer';
import { StatCard } from '../components/ui/StatCard';
import { AssetQRCode } from '../components/common/AssetQRCode';
import { useToastStore } from '../store/useToastStore';
import { getDeviceImage } from '../utils/deviceImages';

const DEVICE_TYPES = ['PC', 'Laptop', 'Server', 'Barcode Scanner', 'Rugged Terminal', 'Printer', 'POS Terminal'] as const;
const DEPARTMENTS = [
  'Engineering & OEM Specs',
  'Warehouse & Receiving',
  'Outbound Logistics',
  'Inventory Management',
  'Sales Counter & POS',
  'IT Operations',
  'Finance & Accounting',
  'HR Operations'
];
const LOCATIONS = [
  'HQ Warehouse Hub',
  'Port Customs Logistics Terminal',
  'Regional Depot North',
  'Regional Depot South',
  'HQ Executive Suite',
  'Server Room'
];
const STATUSES: AssetStatus[] = ['Active', 'In Repair', 'Spare Stock', 'Decommissioned', 'Pending Audit'];

export const AssetsPage: React.FC = () => {
  const { assets, selectedAsset, setSelectedAsset, addAsset, updateAsset, deleteAsset, toggleFavorite } = useAssetStore();
  const { addToast } = useToastStore();
  const [formMode, setFormMode] = useState<'add' | 'edit' | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ITAsset | null>(null);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [customImage, setCustomImage] = useState<string | null>(null);

  // Form State - All 21 fields
  const [assetNumber, setAssetNumber] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [hostname, setHostname] = useState('');
  const [deviceName, setDeviceName] = useState('');
  const [deviceType, setDeviceType] = useState<ITAsset['deviceType']>('PC');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [cpu, setCpu] = useState('');
  const [ram, setRam] = useState('');
  const [storage, setStorage] = useState('');
  const [windowsVersion, setWindowsVersion] = useState('Windows 11 Pro 23H2');
  const [officeVersion, setOfficeVersion] = useState('Microsoft 365 Apps for Enterprise');
  const [warranty, setWarranty] = useState('');
  const [purchaseDate, setPurchaseDate] = useState('');
  const [vendor, setVendor] = useState('');
  const [department, setDepartment] = useState(DEPARTMENTS[0]);
  const [location, setLocation] = useState(LOCATIONS[0]);
  const [assignedEmployee, setAssignedEmployee] = useState('');
  const [status, setStatus] = useState<AssetStatus>('Active');
  const [notes, setNotes] = useState('');
  const [valueUSD, setValueUSD] = useState(1200);

  // Stats
  const stats = useMemo(() => ({
    total: assets.length,
    active: assets.filter(a => a.status === 'Active').length,
    inRepair: assets.filter(a => a.status === 'In Repair').length,
    totalValue: assets.reduce((sum, a) => sum + (a.valueUSD ?? 0), 0),
  }), [assets]);

  const resetForm = () => {
    setAssetNumber('');
    setSerialNumber('');
    setHostname('');
    setDeviceName('');
    setDeviceType('PC');
    setBrand('');
    setModel('');
    setCpu('');
    setRam('');
    setStorage('');
    setWindowsVersion('Windows 11 Pro 23H2');
    setOfficeVersion('Microsoft 365 Apps for Enterprise');
    setWarranty('');
    setPurchaseDate('');
    setVendor('');
    setDepartment(DEPARTMENTS[0]);
    setLocation(LOCATIONS[0]);
    setAssignedEmployee('');
    setStatus('Active');
    setNotes('');
    setValueUSD(1200);
    setCustomImage(null);
    setEditingId(null);
  };

  const populateForm = (asset: ITAsset) => {
    setAssetNumber(asset.assetNumber);
    setSerialNumber(asset.serialNumber);
    setHostname(asset.hostname);
    setDeviceName(asset.deviceName);
    setDeviceType(asset.deviceType);
    setBrand(asset.brand);
    setModel(asset.model);
    setCpu(asset.cpu);
    setRam(asset.ram);
    setStorage(asset.storage);
    setWindowsVersion(asset.windowsVersion);
    setOfficeVersion(asset.officeVersion);
    setWarranty(asset.warranty);
    setPurchaseDate(asset.purchaseDate);
    setVendor(asset.vendor);
    setDepartment(asset.department);
    setLocation(asset.location);
    setAssignedEmployee(asset.assignedEmployee);
    setStatus(asset.status);
    setNotes(asset.notes);
    setValueUSD(asset.valueUSD ?? 1200);
    setCustomImage(null);
    setEditingId(asset.id);
  };

  const openAddModal = () => {
    resetForm();
    setFormMode('add');
  };

  const openEditModal = (asset: ITAsset) => {
    populateForm(asset);
    setFormMode('edit');
  };

  const closeFormModal = () => {
    setFormMode(null);
    resetForm();
  };

  const buildAssetPayload = (): Omit<ITAsset, 'id'> => ({
    assetNumber,
    serialNumber: serialNumber || `SN-${Math.floor(100000 + Math.random() * 900000)}`,
    hostname: hostname || `SIA-${deviceType.toUpperCase().replace(/\s/g, '-')}-NEW`,
    deviceName,
    deviceType,
    brand,
    model,
    cpu,
    ram,
    storage,
    windowsVersion,
    officeVersion,
    warranty,
    purchaseDate,
    vendor,
    department,
    location,
    assignedEmployee,
    status,
    notes,
    deviceImage: customImage || getDeviceImage(deviceType),
    valueUSD: Number(valueUSD),
  });

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deviceName || !assetNumber) return;
    if (formMode === 'edit') {
      setShowSaveConfirm(true);
    } else {
      executeSave();
    }
  };

  const executeSave = () => {
    const payload = buildAssetPayload();
    if (formMode === 'edit' && editingId) {
      updateAsset(editingId, payload);
      addToast({ tone: 'success', title: 'تم تحديث الجهاز', description: `${deviceName} (${assetNumber})` });
    } else {
      addAsset(payload);
      addToast({ tone: 'success', title: 'Asset Registered Successfully', description: `${deviceName} (${assetNumber})` });
    }
    closeFormModal();
    setShowSaveConfirm(false);
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    deleteAsset(deleteTarget.id);
    addToast({ tone: 'info', title: 'تم حذف الجهاز', description: deleteTarget.assetNumber });
    setDeleteTarget(null);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setCustomImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  const previewImage = customImage || getDeviceImage(deviceType);

  const columns: ColumnDef<ITAsset>[] = [
    {
      id: 'favorite',
      header: '',
      cell: ({ row }) => (
        <button type="button" onClick={(event) => { event.stopPropagation(); toggleFavorite(row.original.id); addToast({ tone: 'success', title: row.original.isFavorite ? 'Removed from favorites' : 'Added to favorites', description: row.original.deviceName }); }} className="rounded p-1 text-slate-500 transition-colors hover:bg-slate-800 hover:text-amber-400" aria-label={`Toggle favorite for ${row.original.deviceName}`}>
          <Star className={`w-4 h-4 ${row.original.isFavorite ? 'fill-amber-400 text-amber-400' : ''}`} />
        </button>
      ),
    },
    {
      accessorKey: 'assetNumber',
      header: 'Asset Tag',
      cell: ({ row }) => (
        <span className="font-bold text-blue-400 font-mono text-xs">{row.original.assetNumber}</span>
      ),
    },
    {
      accessorKey: 'deviceName',
      header: 'Device & Model',
      cell: ({ row }) => (
        <div className="min-w-0">
          <div className="font-semibold text-slate-100 truncate max-w-[220px]">{row.original.deviceName}</div>
          <div className="text-xs text-slate-400">{row.original.brand} · {row.original.model}</div>
        </div>
      ),
    },
    {
      accessorKey: 'deviceType',
      header: 'Type',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <img
            src={row.original.deviceImage || getDeviceImage(row.original.deviceType)}
            alt={row.original.deviceType}
            className="w-8 h-8 rounded-md object-cover border border-slate-700"
          />
          <span className="text-xs px-2 py-1 rounded-md bg-slate-800 text-slate-300 font-medium">
            {row.original.deviceType}
          </span>
        </div>
      ),
    },
    {
      accessorKey: 'hostname',
      header: 'Hostname',
      cell: ({ row }) => <span className="font-mono text-xs text-slate-300">{row.original.hostname}</span>,
    },
    {
      accessorKey: 'department',
      header: 'Department',
      cell: ({ row }) => <span className="text-xs text-slate-300">{row.original.department}</span>,
    },
    {
      accessorKey: 'assignedEmployee',
      header: 'Assigned To',
      cell: ({ row }) => (
        <span className="text-xs text-slate-300">{row.original.assignedEmployee || '—'}</span>
      ),
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
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedAsset(row.original)}
            icon={<Eye className="w-4 h-4 text-blue-400" />}
          >
            Details
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => openEditModal(row.original)}
            icon={<Pencil className="w-4 h-4 text-amber-400" />}
          >
            <span className="sr-only">Edit</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDeleteTarget(row.original)}
            icon={<Trash2 className="w-4 h-4 text-rose-400" />}
          >
            <span className="sr-only">Delete</span>
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 text-right">
      {/* Title Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight">IT Asset Fleet Management</h1>
          <p className="text-sm text-slate-400 mt-0.5">
            تتبع دورة الحياة الكاملة لجميع أجهزة ومعدات الشركة عبر كافة الفروع والمستودعات
          </p>
        </div>
        <Button variant="primary" onClick={openAddModal} icon={<Plus className="w-4 h-4" />}>
          Register New Asset
        </Button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Assets"
          value={stats.total}
          subtext="مسجلة عبر كافة المواقع"
          icon={<Monitor className="w-5 h-5" />}
          variant="primary"
        />
        <StatCard
          title="Active Assets"
          value={stats.active}
          subtext={`${Math.round((stats.active / stats.total) * 100)}% of fleet operational`}
          icon={<CheckCircle2 className="w-5 h-5" />}
          variant="success"
        />
        <StatCard
          title="In Repair"
          value={stats.inRepair}
          subtext={stats.inRepair > 0 ? 'Requires attention' : 'All systems operational'}
          icon={<Wrench className="w-5 h-5" />}
          variant={stats.inRepair > 0 ? 'warning' : 'success'}
        />
        <StatCard
          title="Fleet Value"
          value={`$${stats.totalValue.toLocaleString()}`}
          subtext="Total asset valuation"
          icon={<Shield className="w-5 h-5" />}
          variant="primary"
        />
      </div>

      {/* TanStack Table Data Grid */}
      <DataGrid
        columns={columns}
        data={assets}
        searchPlaceholder="Search by asset tag, device name, hostname, department, or employee..."
        onRowClick={(asset) => setSelectedAsset(asset)}
        exportFileName="SIA_IT_Assets_Fleet"
        filters={[
          { columnId: 'deviceType', label: 'Type', getValue: (asset) => asset.deviceType },
          { columnId: 'status', label: 'Status', getValue: (asset) => asset.status },
          { columnId: 'location', label: 'Location', getValue: (asset) => asset.location },
        ]}
      />

      {/* Add / Edit Asset Modal */}
      <Modal isOpen={formMode !== null} onClose={closeFormModal} title={formMode === 'edit' ? 'تعديل الجهاز' : 'Register IT Asset'}>
        <form onSubmit={handleFormSubmit} className="space-y-5 text-sm text-right">
          {/* Section 1: Identification */}
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 pb-1 border-b border-slate-800 font-mono">
              Asset Identification
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-slate-300 mb-1">Asset Tag *</label>
                <input
                  type="text" required placeholder="e.g. AST-2026-007"
                  value={assetNumber} onChange={(e) => setAssetNumber(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-300 mb-1">Serial Number</label>
                <input
                  type="text" placeholder="e.g. SN-DL-1234567"
                  value={serialNumber} onChange={(e) => setSerialNumber(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-3">
              <div>
                <label className="block font-medium text-slate-300 mb-1">Device Name *</label>
                <input
                  type="text" required placeholder="e.g. Dell Precision 3660 Workstation"
                  value={deviceName} onChange={(e) => setDeviceName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-300 mb-1">Hostname</label>
                <input
                  type="text" placeholder="e.g. SIA-PC-HR-07"
                  value={hostname} onChange={(e) => setHostname(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Hardware Specs */}
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 pb-1 border-b border-slate-800 font-mono">
              Hardware Specifications
            </h3>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block font-medium text-slate-300 mb-1">Device Type</label>
                <select
                  value={deviceType} onChange={(e) => { setDeviceType(e.target.value as ITAsset['deviceType']); setCustomImage(null); }}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-blue-500"
                >
                  {DEVICE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <div className="mt-2 rounded-lg overflow-hidden border border-slate-800 bg-slate-950 h-24">
                  <img src={previewImage} alt={deviceType} className="w-full h-full object-cover" />
                </div>
                <p className="text-[10px] text-slate-500 mt-1">معاينة مباشرة لنوع الجهاز: {deviceType}</p>
              </div>
              <div>
                <label className="block font-medium text-slate-300 mb-1">Brand</label>
                <input
                  type="text" placeholder="e.g. Dell"
                  value={brand} onChange={(e) => setBrand(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-300 mb-1">Model</label>
                <input
                  type="text" placeholder="e.g. Precision 3660"
                  value={model} onChange={(e) => setModel(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 mt-3">
              <div>
                <label className="block font-medium text-slate-300 mb-1">CPU</label>
                <input
                  type="text" placeholder="e.g. Intel Core i7-13700K"
                  value={cpu} onChange={(e) => setCpu(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-blue-500 font-mono text-xs"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-300 mb-1">RAM</label>
                <input
                  type="text" placeholder="e.g. 32 GB DDR5"
                  value={ram} onChange={(e) => setRam(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-blue-500 font-mono text-xs"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-300 mb-1">Storage</label>
                <input
                  type="text" placeholder="e.g. 1 TB NVMe SSD"
                  value={storage} onChange={(e) => setStorage(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-blue-500 font-mono text-xs"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-3">
              <div>
                <label className="block font-medium text-slate-300 mb-1">Operating System</label>
                <input
                  type="text" placeholder="e.g. Windows 11 Pro 23H2"
                  value={windowsVersion} onChange={(e) => setWindowsVersion(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-blue-500 text-xs"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-300 mb-1">Office Suite</label>
                <input
                  type="text" placeholder="e.g. Microsoft 365 Apps"
                  value={officeVersion} onChange={(e) => setOfficeVersion(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-blue-500 text-xs"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Procurement */}
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 pb-1 border-b border-slate-800 font-mono">
              Procurement & Warranty
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-slate-300 mb-1">Vendor</label>
                <input
                  type="text" placeholder="e.g. Dell Technologies"
                  value={vendor} onChange={(e) => setVendor(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-300 mb-1">Purchase Date</label>
                <input
                  type="date"
                  value={purchaseDate} onChange={(e) => setPurchaseDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-3">
              <div>
                <label className="block font-medium text-slate-300 mb-1">Warranty Details</label>
                <input
                  type="text" placeholder="e.g. 3 Years ProSupport On-Site"
                  value={warranty} onChange={(e) => setWarranty(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-blue-500 text-xs"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-300 mb-1">Asset Value ($ USD)</label>
                <input
                  type="number" min={0}
                  value={valueUSD} onChange={(e) => setValueUSD(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Assignment */}
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 pb-1 border-b border-slate-800 font-mono">
              Assignment & Location
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-slate-300 mb-1">Department</label>
                <select
                  value={department} onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-blue-500"
                >
                  {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="block font-medium text-slate-300 mb-1">Location</label>
                <select
                  value={location} onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-blue-500"
                >
                  {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-3">
              <div>
                <label className="block font-medium text-slate-300 mb-1">Assigned Employee</label>
                <input
                  type="text" placeholder="e.g. Ahmed Samir"
                  value={assignedEmployee} onChange={(e) => setAssignedEmployee(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-300 mb-1">Status</label>
                <select
                  value={status} onChange={(e) => setStatus(e.target.value as AssetStatus)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-blue-500"
                >
                  {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div className="mt-3">
              <label className="block font-medium text-slate-300 mb-1">Notes</label>
              <textarea
                rows={2} placeholder="Any additional notes..."
                value={notes} onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
              <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-slate-700 bg-slate-950/40 px-3 py-2 text-xs text-slate-400 hover:border-blue-500">
                <ImagePlus className="w-4 h-4 text-blue-400" /> Device Image Upload
                <input type="file" accept="image/*" className="sr-only" onChange={handleImageUpload} />
              </label>
              <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-slate-700 bg-slate-950/40 px-3 py-2 text-xs text-slate-400 hover:border-blue-500">
                <Paperclip className="w-4 h-4 text-blue-400" /> Invoice Attachment
                <input type="file" className="sr-only" />
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
            <Button variant="outline" onClick={closeFormModal}>إلغاء</Button>
            <Button variant="primary" type="submit">{formMode === 'edit' ? 'حفظ التعديلات' : 'Save Asset'}</Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title="تأكيد الحذف"
        message={`هل أنت متأكد من حذف "${deleteTarget?.deviceName}" (${deleteTarget?.assetNumber})؟ لا يمكن التراجع عن هذا الإجراء.`}
        confirmLabel="نعم، احذف"
        cancelLabel="إلغاء"
        variant="danger"
      />

      {/* Edit Save Confirmation */}
      <ConfirmDialog
        isOpen={showSaveConfirm}
        onClose={() => setShowSaveConfirm(false)}
        onConfirm={executeSave}
        title="تأكيد التعديل"
        message={`هل تريد حفظ التعديلات على "${deviceName}" (${assetNumber})؟ سيتم تحديث جميع البيانات المدخلة.`}
        confirmLabel="نعم، احفظ"
        cancelLabel="إلغاء"
        variant="warning"
      />

      {/* Asset Detail SlideDrawer */}
      <SlideDrawer
        isOpen={!!selectedAsset}
        onClose={() => setSelectedAsset(null)}
        title={selectedAsset?.assetNumber || 'Asset Details'}
        subtitle={selectedAsset?.deviceName}
      >
        {selectedAsset && (
          <div className="space-y-5 text-sm text-right">
            {/* Device Image + Status */}
            {selectedAsset.deviceImage && (
              <div className="relative rounded-xl overflow-hidden h-40 bg-slate-900">
                <img
                  src={selectedAsset.deviceImage}
                  alt={selectedAsset.deviceName}
                  className="w-full h-full object-cover opacity-80"
                />
                <div className="absolute bottom-3 left-3">
                  <StatusBadge status={selectedAsset.status} />
                </div>
              </div>
            )}

            <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/60 p-3">
              <div>
                <p className="flex items-center gap-1.5 text-xs font-semibold text-slate-300"><QrCode className="w-3.5 h-3.5 text-blue-400" /> Asset QR Code</p>
                <p className="mt-1 text-[11px] text-slate-500">المعرف الرقمي للمسح الميداني والتدقيق اللوجستي.</p>
              </div>
              <AssetQRCode value={selectedAsset.assetNumber} />
            </div>

            {/* Identification */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 font-mono">
                <Tag className="w-3.5 h-3.5" /> Identification
              </h4>
              <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs">
                <div><span className="text-slate-500 block">Asset Tag</span><span className="font-mono font-bold text-blue-400">{selectedAsset.assetNumber}</span></div>
                <div><span className="text-slate-500 block">Serial Number</span><span className="font-mono text-slate-200">{selectedAsset.serialNumber}</span></div>
                <div><span className="text-slate-500 block">Hostname</span><span className="font-mono text-slate-200">{selectedAsset.hostname}</span></div>
                <div><span className="text-slate-500 block">Device Type</span><span className="font-semibold text-slate-200">{selectedAsset.deviceType}</span></div>
              </div>
            </div>

            {/* Hardware Specs */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 font-mono">
                <Cpu className="w-3.5 h-3.5" /> Hardware Specs
              </h4>
              <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs">
                <div><span className="text-slate-500 block">Brand</span><span className="font-semibold text-slate-200">{selectedAsset.brand}</span></div>
                <div><span className="text-slate-500 block">Model</span><span className="font-semibold text-slate-200">{selectedAsset.model}</span></div>
                <div className="col-span-2"><span className="text-slate-500 block">CPU</span><span className="text-slate-200 font-mono">{selectedAsset.cpu}</span></div>
                <div><span className="text-slate-500 block">RAM</span><span className="font-semibold text-emerald-400 font-mono">{selectedAsset.ram}</span></div>
                <div><span className="text-slate-500 block">Storage</span><span className="font-semibold text-emerald-400 font-mono">{selectedAsset.storage}</span></div>
                <div className="col-span-2"><span className="text-slate-500 block">OS</span><span className="text-slate-200">{selectedAsset.windowsVersion}</span></div>
                <div className="col-span-2"><span className="text-slate-500 block">Office</span><span className="text-slate-200">{selectedAsset.officeVersion}</span></div>
              </div>
            </div>

            {/* Assignment */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 font-mono">
                <User className="w-3.5 h-3.5" /> Assignment & Location
              </h4>
              <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs">
                <div className="col-span-2"><span className="text-slate-500 block">Assigned Employee</span><span className="font-semibold text-slate-200">{selectedAsset.assignedEmployee || '—'}</span></div>
                <div><span className="text-slate-500 block">Department</span><span className="text-slate-200">{selectedAsset.department}</span></div>
                <div><span className="text-slate-500 block">Location</span><span className="text-slate-200">{selectedAsset.location}</span></div>
              </div>
            </div>

            {/* Procurement */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 font-mono">
                <Calendar className="w-3.5 h-3.5" /> Procurement & Warranty
              </h4>
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs space-y-2">
                <div className="flex justify-between"><span className="text-slate-500">Vendor</span><span className="text-slate-200 font-semibold">{selectedAsset.vendor}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Purchase Date</span><span className="text-slate-200 font-mono">{selectedAsset.purchaseDate}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Warranty</span><span className="text-amber-400 font-medium">{selectedAsset.warranty}</span></div>
                <div className="flex justify-between border-t border-slate-800 pt-2"><span className="text-slate-500">Asset Value</span><span className="font-bold text-blue-400 font-mono">${(selectedAsset.valueUSD ?? 0).toLocaleString()}</span></div>
              </div>
            </div>

            {/* Notes */}
            {selectedAsset.notes && (
              <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800/80 text-xs">
                <span className="text-slate-500 block mb-1 font-semibold">Notes</span>
                <p className="text-slate-300 leading-relaxed">{selectedAsset.notes}</p>
              </div>
            )}

            <div className="flex gap-2 pt-2 border-t border-slate-800">
              <Button variant="outline" size="sm" onClick={() => { toggleFavorite(selectedAsset.id); addToast({ tone: 'success', title: selectedAsset.isFavorite ? 'Removed from favorites' : 'Added to favorites', description: selectedAsset.deviceName }); }} icon={<Star className={`w-4 h-4 ${selectedAsset.isFavorite ? 'fill-amber-400 text-amber-400' : ''}`} />}>
                {selectedAsset.isFavorite ? 'Unfavorite' : 'Favorite'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => { openEditModal(selectedAsset); setSelectedAsset(null); }}
                icon={<Pencil className="w-4 h-4 text-amber-400" />}
              >
                تعديل
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setDeleteTarget(selectedAsset)}
                icon={<Trash2 className="w-4 h-4 text-rose-400" />}
              >
                Delete Asset
              </Button>
            </div>
          </div>
        )}
      </SlideDrawer>
    </div>
  );
};
