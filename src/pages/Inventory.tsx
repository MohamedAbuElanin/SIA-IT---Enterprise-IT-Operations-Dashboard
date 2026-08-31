import React, { useState, useMemo } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import {
  Plus, Minus, ShieldAlert, Monitor, Laptop, Printer, Keyboard, MousePointer2,
  Wifi, Server, Camera, Package, LayoutGrid, Pencil, Trash2
} from 'lucide-react';
import { InventoryItem, InventoryCategory } from '../types';
import { useInventoryStore } from '../store/useInventoryStore';
import { DataGrid } from '../components/common/DataGrid';
import { StatusBadge } from '../components/common/StatusBadge';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { Card } from '../components/ui/Card';
import { StatCard } from '../components/ui/StatCard';
import { useToastStore } from '../store/useToastStore';
import { getInventoryCategoryImage } from '../utils/deviceImages';

const CATEGORIES: { label: InventoryCategory; icon: React.ReactNode }[] = [
  { label: 'PC', icon: <Monitor className="w-4 h-4" /> },
  { label: 'Laptop', icon: <Laptop className="w-4 h-4" /> },
  { label: 'Monitor', icon: <Monitor className="w-4 h-4" /> },
  { label: 'Printer', icon: <Printer className="w-4 h-4" /> },
  { label: 'Keyboard', icon: <Keyboard className="w-4 h-4" /> },
  { label: 'Mouse', icon: <MousePointer2 className="w-4 h-4" /> },
  { label: 'UPS', icon: <Package className="w-4 h-4" /> },
  { label: 'Router', icon: <Wifi className="w-4 h-4" /> },
  { label: 'Switch', icon: <LayoutGrid className="w-4 h-4" /> },
  { label: 'Access Point', icon: <Wifi className="w-4 h-4" /> },
  { label: 'Server', icon: <Server className="w-4 h-4" /> },
  { label: 'Camera', icon: <Camera className="w-4 h-4" /> },
  { label: 'DVR', icon: <Camera className="w-4 h-4" /> },
];

export const InventoryPage: React.FC = () => {
  const { inventory, updateStock, addItem, updateItem, deleteItem } = useInventoryStore();
  const { addToast } = useToastStore();
  const [formMode, setFormMode] = useState<'add' | 'edit' | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<InventoryItem | null>(null);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [activeCategory, setActiveCategory] = useState<InventoryCategory | 'ALL'>('ALL');

  // Form state
  const [sku, setSku] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState<InventoryCategory>('PC');
  const [quantity, setQuantity] = useState(1);
  const [minThreshold, setMinThreshold] = useState(2);
  const [unitCostUSD, setUnitCostUSD] = useState(500);
  const [binLocation, setBinLocation] = useState('IT Store - Shelf A1');
  const [compatibleModels, setCompatibleModels] = useState('');

  // Filtered data
  const filteredInventory = useMemo(() => {
    if (activeCategory === 'ALL') return inventory;
    return inventory.filter(i => i.category === activeCategory);
  }, [inventory, activeCategory]);

  // Stats
  const stats = useMemo(() => ({
    totalItems: inventory.length,
    totalCategories: new Set(inventory.map(i => i.category)).size,
    lowStockCount: inventory.filter(i => i.status === 'Low Stock' || i.status === 'Out of Stock').length,
    totalValue: inventory.reduce((sum, i) => sum + i.quantityInStock * i.unitCostUSD, 0),
  }), [inventory]);

  const resetForm = () => {
    setSku('');
    setName('');
    setCategory('PC');
    setQuantity(1);
    setMinThreshold(2);
    setUnitCostUSD(500);
    setBinLocation('IT Store - Shelf A1');
    setCompatibleModels('');
    setEditingId(null);
  };

  const populateForm = (item: InventoryItem) => {
    setSku(item.sku);
    setName(item.name);
    setCategory(item.category);
    setQuantity(item.quantityInStock);
    setMinThreshold(item.minThreshold);
    setUnitCostUSD(item.unitCostUSD);
    setBinLocation(item.binLocation);
    setCompatibleModels(item.compatibleModels.join(', '));
    setEditingId(item.id);
  };

  const openAddModal = () => { resetForm(); setFormMode('add'); };
  const openEditModal = (item: InventoryItem) => { populateForm(item); setFormMode('edit'); };
  const closeFormModal = () => { setFormMode(null); resetForm(); };

  const buildItemPayload = (): Omit<InventoryItem, 'id'> => {
    const qty = Number(quantity);
    const min = Number(minThreshold);
    let status: InventoryItem['status'] = 'In Stock';
    if (qty === 0) status = 'Out of Stock';
    else if (qty <= min) status = 'Low Stock';
    return {
      sku, name, category,
      quantityInStock: qty,
      minThreshold: min,
      unitCostUSD: Number(unitCostUSD),
      binLocation,
      compatibleModels: compatibleModels.split(',').map(m => m.trim()).filter(Boolean),
      status,
      lastRestocked: new Date().toISOString().split('T')[0],
    };
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sku || !name) return;
    if (formMode === 'edit') {
      setShowSaveConfirm(true);
    } else {
      executeSave();
    }
  };

  const executeSave = () => {
    const payload = buildItemPayload();
    if (formMode === 'edit' && editingId) {
      updateItem(editingId, payload);
      addToast({ tone: 'success', title: 'تم تحديث الصنف', description: `${name} (${sku})` });
    } else {
      addItem(payload);
      addToast({ tone: 'success', title: 'Inventory Item Added', description: `${name} (${sku})` });
    }
    closeFormModal();
    setShowSaveConfirm(false);
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    deleteItem(deleteTarget.id);
    addToast({ tone: 'info', title: 'تم حذف الصنف', description: deleteTarget.sku });
    setDeleteTarget(null);
  };

  const columns: ColumnDef<InventoryItem>[] = [
    {
      accessorKey: 'sku',
      header: 'SKU Code',
      cell: ({ row }) => <span className="font-bold text-blue-400 font-mono text-xs">{row.original.sku}</span>,
    },
    {
      accessorKey: 'name',
      header: 'Item & Location',
      cell: ({ row }) => (
        <div>
          <div className="font-semibold text-slate-100">{row.original.name}</div>
          <div className="text-xs text-slate-400">Bin: {row.original.binLocation}</div>
        </div>
      ),
    },
    {
      accessorKey: 'category',
      header: 'Category',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <img
            src={getInventoryCategoryImage(row.original.category)}
            alt={row.original.category}
            className="w-8 h-8 rounded-md object-cover border border-slate-700"
          />
          <span className="text-xs px-2 py-1 rounded-md bg-slate-800 text-slate-300 font-medium">
            {row.original.category}
          </span>
        </div>
      ),
    },
    {
      accessorKey: 'quantityInStock',
      header: 'Stock Level',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="space-y-0.5">
            <span className={`font-bold text-sm block font-mono ${
              row.original.quantityInStock === 0 ? 'text-rose-400' :
              row.original.quantityInStock <= row.original.minThreshold ? 'text-amber-400' : 'text-slate-100'
            }`}>
              {row.original.quantityInStock} units
            </span>
            <span className="text-xs text-slate-500 font-mono">Min: {row.original.minThreshold}</span>
          </div>
          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => updateStock(row.original.id, -1)}
              className="p-1.5 rounded-md bg-slate-800 hover:bg-rose-900 text-slate-300 hover:text-rose-300 transition-colors cursor-pointer"
              title="خصم وحدة"
            >
              <Minus className="w-3 h-3" />
            </button>
            <button
              onClick={() => updateStock(row.original.id, 1)}
              className="p-1.5 rounded-md bg-slate-800 hover:bg-emerald-900 text-slate-300 hover:text-emerald-300 transition-colors cursor-pointer"
              title="إضافة وحدة"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'unitCostUSD',
      header: 'Unit Cost',
      cell: ({ row }) => <span className="font-semibold text-slate-200 font-mono">${row.original.unitCostUSD.toLocaleString()}</span>,
    },
    {
      id: 'totalValue',
      header: 'Total Value',
      cell: ({ row }) => (
        <span className="font-semibold text-blue-400 font-mono">
          ${(row.original.quantityInStock * row.original.unitCostUSD).toLocaleString()}
        </span>
      ),
    },
    {
      accessorKey: 'lastRestocked',
      header: 'Last Restocked',
      cell: ({ row }) => <span className="text-xs text-slate-400 font-mono">{row.original.lastRestocked}</span>,
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
          <Button variant="ghost" size="sm" onClick={() => openEditModal(row.original)} icon={<Pencil className="w-4 h-4 text-amber-400" />}>
            <span className="sr-only">Edit</span>
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(row.original)} icon={<Trash2 className="w-4 h-4 text-rose-400" />}>
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
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight">IT Inventory & Spare Parts</h1>
          <p className="text-sm text-slate-400 mt-0.5">
            تتبع مخزون قطع غيار وأجهزة ومعدات تقنية المعلومات عبر كافة مستودعات وفروع الشركة
          </p>
        </div>
        <Button variant="primary" onClick={openAddModal} icon={<Plus className="w-4 h-4" />}>
          Add Inventory Item
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total SKUs" value={stats.totalItems} subtext="Across all categories" icon={<Package className="w-5 h-5" />} variant="primary" />
        <StatCard title="Categories" value={stats.totalCategories} subtext="Equipment types tracked" icon={<LayoutGrid className="w-5 h-5" />} variant="primary" />
        <StatCard
          title="Low / Out of Stock"
          value={stats.lowStockCount}
          subtext={stats.lowStockCount > 0 ? 'Requires reorder' : 'All stock adequate'}
          icon={<ShieldAlert className="w-5 h-5" />}
          variant={stats.lowStockCount > 0 ? 'warning' : 'success'}
        />
        <StatCard
          title="Inventory Valuation"
          value={`$${stats.totalValue.toLocaleString()}`}
          subtext="Current stock valuation"
          icon={<Monitor className="w-5 h-5" />}
          variant="primary"
        />
      </div>

      {/* Low Stock Alert */}
      {stats.lowStockCount > 0 && (
        <Card className="bg-amber-950/30 border-amber-800/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-amber-200">Reorder Alert</h4>
              <p className="text-xs text-amber-400/90">
                يوجد {stats.lowStockCount} صنف وصل أو اقترب من الحد الأدنى للمخزون. يُوصى ببدء إجراءات الشراء والتوريد فوراً.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Category Tabs */}
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={() => setActiveCategory('ALL')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
            activeCategory === 'ALL' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-700'
          }`}
        >
          All Categories ({inventory.length})
        </button>
        {CATEGORIES.map(({ label, icon }) => {
          const count = inventory.filter(i => i.category === label).length;
          if (count === 0) return null;
          return (
            <button
              key={label}
              onClick={() => setActiveCategory(label)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                activeCategory === label ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-700'
              }`}
            >
              {icon}
              {label} ({count})
            </button>
          );
        })}
      </div>

      {/* Inventory DataGrid */}
      <DataGrid
        columns={columns}
        data={filteredInventory}
        searchPlaceholder="Search by SKU, item name, category, bin location..."
        exportFileName="SIA_IT_Inventory"
        filters={[
          { columnId: 'category', label: 'Category', getValue: (item) => item.category },
          { columnId: 'status', label: 'Status', getValue: (item) => item.status },
        ]}
      />

      {/* Add / Edit Item Modal */}
      <Modal isOpen={formMode !== null} onClose={closeFormModal} title={formMode === 'edit' ? 'تعديل الصنف' : 'Add Inventory Item'}>
        <form onSubmit={handleFormSubmit} className="space-y-4 text-sm text-right">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-300 mb-1">SKU Code *</label>
              <input
                type="text" required placeholder="e.g. IT-INV-PC-007"
                value={sku} onChange={(e) => setSku(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-300 mb-1">Item Name *</label>
              <input
                type="text" required placeholder="e.g. Dell OptiPlex 7010 SFF PC"
                value={name} onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-300 mb-1">Category</label>
              <select
                value={category} onChange={(e) => setCategory(e.target.value as InventoryCategory)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-blue-500"
              >
                {CATEGORIES.map(c => <option key={c.label} value={c.label}>{c.label}</option>)}
              </select>
              <div className="mt-2 rounded-lg overflow-hidden border border-slate-800 bg-slate-950 h-24">
                <img src={getInventoryCategoryImage(category)} alt={category} className="w-full h-full object-cover" />
              </div>
              <p className="text-[10px] text-slate-500 mt-1">معاينة مباشرة للفئة: {category}</p>
            </div>
            <div>
              <label className="block font-medium text-slate-300 mb-1">Bin Location</label>
              <input
                type="text" placeholder="e.g. IT Store - Shelf A1"
                value={binLocation} onChange={(e) => setBinLocation(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-medium text-slate-300 mb-1">Stock Quantity</label>
              <input
                type="number" min={0} value={quantity} onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-300 mb-1">Min Threshold</label>
              <input
                type="number" min={0} value={minThreshold} onChange={(e) => setMinThreshold(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-300 mb-1">Unit Cost ($ USD)</label>
              <input
                type="number" min={0} value={unitCostUSD} onChange={(e) => setUnitCostUSD(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-300 mb-1">Compatible Models (comma-separated)</label>
            <input
              type="text" placeholder="e.g. Dell OptiPlex 7010, Dell OptiPlex 7020"
              value={compatibleModels} onChange={(e) => setCompatibleModels(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
            <Button variant="outline" onClick={closeFormModal}>إلغاء</Button>
            <Button variant="primary" type="submit">{formMode === 'edit' ? 'حفظ التعديلات' : 'Save Item'}</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title="تأكيد الحذف"
        message={`هل أنت متأكد من حذف "${deleteTarget?.name}" (${deleteTarget?.sku})؟ لا يمكن التراجع عن هذا الإجراء.`}
        confirmLabel="نعم، احذف"
        cancelLabel="إلغاء"
        variant="danger"
      />

      <ConfirmDialog
        isOpen={showSaveConfirm}
        onClose={() => setShowSaveConfirm(false)}
        onConfirm={executeSave}
        title="تأكيد التعديل"
        message={`هل تريد حفظ التعديلات على "${name}" (${sku})؟`}
        confirmLabel="نعم، احفظ"
        cancelLabel="إلغاء"
        variant="warning"
      />
    </div>
  );
};
