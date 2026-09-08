import React, { useState, useMemo } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import {
  Plus, Eye, Wrench, ShieldAlert,
  Calendar, CheckCircle2, Clock,
  DollarSign, FileText, ArrowRight, Kanban, List, Trash2, Pencil
} from 'lucide-react';
import { MaintenanceRecord, TicketStatus, PriorityLevel } from '../types';
import { useMaintenanceStore } from '../store/useMaintenanceStore';
import { useAssetStore } from '../store/useAssetStore';
import { DataGrid } from '../components/common/DataGrid';
import { StatusBadge } from '../components/common/StatusBadge';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { SlideDrawer } from '../components/ui/SlideDrawer';
import { StatCard } from '../components/ui/StatCard';
import { useToastStore } from '../store/useToastStore';

const STATUSES: { key: TicketStatus; label: string; countColor: string }[] = [
  { key: 'Open', label: 'مفتوحة (Open)', countColor: 'text-amber-400' },
  { key: 'In Progress', label: 'قيد المعالجة (In Progress)', countColor: 'text-blue-400' },
  { key: 'Pending Parts', label: 'بانتظار قطع الغيار (Pending Parts)', countColor: 'text-purple-400' },
  { key: 'Resolved', label: 'تم الحل (Resolved)', countColor: 'text-emerald-400' },
  { key: 'Closed', label: 'مغلقة (Closed)', countColor: 'text-slate-400' },
];

const PRIORITIES: PriorityLevel[] = ['Low', 'Medium', 'High', 'Critical'];

export const MaintenancePage: React.FC = () => {
  const { records, selectedRecord, setSelectedRecord, createRecord, updateRecordStatus, updateRecord, deleteRecord } = useMaintenanceStore();
  const { assets } = useAssetStore();
  const { addToast } = useToastStore();
  const [formMode, setFormMode] = useState<'add' | 'edit' | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<MaintenanceRecord | null>(null);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [statusChangeTarget, setStatusChangeTarget] = useState<{ id: string; newStatus: TicketStatus; ticketNumber: string } | null>(null);
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');

  // Form State
  const [affectedAssetTag, setAffectedAssetTag] = useState(assets[0]?.assetNumber || '');
  const [location, setLocation] = useState('المستودع الرئيسي (HQ Warehouse Hub)');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [engineer, setEngineer] = useState('مهندس الدعم الفني المناوب');
  const [problem, setProblem] = useState('');
  const [cause, setCause] = useState('');
  const [solution, setSolution] = useState('');
  const [cost, setCost] = useState(0);
  const [status, setStatus] = useState<TicketStatus>('Open');
  const [priority, setPriority] = useState<PriorityLevel>('Medium');

  // Stats
  const stats = useMemo(() => ({
    total: records.length,
    open: records.filter(r => r.status === 'Open' || r.status === 'In Progress').length,
    critical: records.filter(r => r.priority === 'Critical').length,
    totalCost: records.reduce((sum, r) => sum + (r.cost ?? 0), 0),
  }), [records]);

  const resetForm = () => {
    setAffectedAssetTag(assets[0]?.assetNumber || '');
    setLocation('المستودع الرئيسي (HQ Warehouse Hub)');
    setDate(new Date().toISOString().split('T')[0]);
    setEngineer('مهندس الدعم الفني المناوب');
    setProblem('');
    setCause('');
    setSolution('');
    setCost(0);
    setStatus('Open');
    setPriority('Medium');
    setEditingId(null);
  };

  const populateForm = (record: MaintenanceRecord) => {
    setAffectedAssetTag(record.affectedAssetTag || '');
    setLocation(record.location || '');
    setDate(record.date);
    setEngineer(record.engineer);
    setProblem(record.problem);
    setCause(record.cause);
    setSolution(record.solution);
    setCost(record.cost ?? 0);
    setStatus(record.status);
    setPriority(record.priority ?? 'Medium');
    setEditingId(record.id);
  };

  const openAddModal = () => { resetForm(); setFormMode('add'); };
  const openEditModal = (record: MaintenanceRecord) => { populateForm(record); setFormMode('edit'); };
  const closeFormModal = () => { setFormMode(null); resetForm(); };

  const buildRecordPayload = () => ({
    affectedAssetTag: affectedAssetTag || 'AST-N/A',
    location,
    date,
    engineer: engineer || 'مهندس الدعم المناوب',
    problem,
    cause,
    solution,
    cost: Number(cost),
    status,
    priority,
    attachments: [] as string[],
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!problem) return;
    if (formMode === 'edit') {
      setShowSaveConfirm(true);
    } else {
      executeSave();
    }
  };

  const executeSave = async () => {
    setIsSaving(true);
    try {
      const payload = buildRecordPayload();
      if (formMode === 'edit' && editingId) {
        await updateRecord(editingId, payload);
        addToast({ tone: 'success', title: 'تم تحديث التذكرة', description: problem });
      } else {
        await createRecord(payload);
        addToast({ tone: 'success', title: 'تم إنشاء تذكرة الصيانة بنجاح', description: problem });
      }
      closeFormModal();
      setShowSaveConfirm(false);
    } catch (err: any) {
      addToast({
        tone: 'error',
        title: 'فشل حفظ التذكرة',
        description: err?.message || 'حدث خطأ أثناء حفظ التذكرة في قاعدة البيانات',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const requestStatusChange = (id: string, newStatus: TicketStatus, ticketNumber: string) => {
    setStatusChangeTarget({ id, newStatus, ticketNumber });
  };

  const confirmStatusChange = async () => {
    if (!statusChangeTarget) return;
    try {
      await updateRecordStatus(statusChangeTarget.id, statusChangeTarget.newStatus);
      addToast({ tone: 'success', title: 'تم تحديث الحالة', description: statusChangeTarget.ticketNumber });
      if (selectedRecord?.id === statusChangeTarget.id) setSelectedRecord(null);
    } catch (err: any) {
      addToast({
        tone: 'error',
        title: 'فشل تحديث الحالة',
        description: err?.message || 'تعذر تحديث الحالة في قاعدة البيانات',
      });
    } finally {
      setStatusChangeTarget(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteRecord(deleteTarget.id);
      addToast({ tone: 'info', title: 'تم حذف التذكرة', description: deleteTarget.ticketNumber });
    } catch (err: any) {
      addToast({
        tone: 'error',
        title: 'فشل حذف التذكرة',
        description: err?.message || 'تعذر الحذف من قاعدة البيانات',
      });
    } finally {
      setDeleteTarget(null);
    }
  };

  const columns: ColumnDef<MaintenanceRecord>[] = [
    {
      accessorKey: 'ticketNumber',
      header: 'رقم التذكرة',
      cell: ({ row }) => (
        <span className="font-bold text-blue-400 font-mono text-xs">{row.original.ticketNumber}</span>
      ),
    },
    {
      accessorKey: 'problem',
      header: 'المشكلة / العطل',
      cell: ({ row }) => (
        <div className="min-w-0">
          <div className="font-semibold text-slate-100 truncate max-w-[280px]">{row.original.problem}</div>
          <div className="text-xs text-slate-400">{row.original.location} · <span className="font-mono">{row.original.affectedAssetTag}</span></div>
        </div>
      ),
    },
    {
      accessorKey: 'priority',
      header: 'الأولوية',
      cell: ({ row }) => row.original.priority ? <StatusBadge status={row.original.priority} /> : null,
    },
    {
      accessorKey: 'status',
      header: 'حالة التذكرة',
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      accessorKey: 'engineer',
      header: 'المهندس المسؤول',
      cell: ({ row }) => <span className="text-xs text-slate-300">{row.original.engineer}</span>,
    },
    {
      accessorKey: 'cost',
      header: 'التكلفة ($)',
      cell: ({ row }) => <span className="font-semibold text-slate-200 font-mono">${(row.original.cost ?? 0).toLocaleString()}</span>,
    },
    {
      accessorKey: 'date',
      header: 'التاريخ',
      cell: ({ row }) => <span className="text-xs text-slate-400 font-mono">{row.original.date}</span>,
    },
    {
      id: 'actions',
      header: 'الإجراءات',
      cell: ({ row }) => (
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <Button variant="ghost" size="sm" onClick={() => setSelectedRecord(row.original)} icon={<Eye className="w-4 h-4 text-blue-400" />}>
            التفاصيل
          </Button>
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
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight">سجل وتذاكر الصيانة والدعم الفني (Maintenance)</h1>
          <p className="text-sm text-slate-400 mt-0.5">
            متابعة بلاغات الأعطال، الإصلاحات، سجل التوقف، وتكاليف الصيانة لأسطول الشركة
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View Mode Toggle */}
          <div className="flex items-center rounded-lg bg-slate-900 border border-slate-800 p-1">
            <button
              onClick={() => setViewMode('kanban')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                viewMode === 'kanban' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Kanban className="w-3.5 h-3.5" /> لوحة كانبان (Kanban)
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                viewMode === 'table' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <List className="w-3.5 h-3.5" /> جدول تفصيلي (Table)
            </button>
          </div>

          <Button variant="primary" onClick={openAddModal} icon={<Plus className="w-4 h-4" />}>
            تسجيل تذكرة صيانة (Log Ticket)
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="إجمالي التذاكر (Total)" value={stats.total} subtext="سجلات الصيانة المسجلة" icon={<Wrench className="w-5 h-5" />} variant="primary" />
        <StatCard title="تذاكر نشطة (Active)" value={stats.open} subtext="قيد المتابعة أو الإصلاح" icon={<Clock className="w-5 h-5" />} variant={stats.open > 0 ? 'warning' : 'success'} />
        <StatCard
          title="أولوية حرجة (Critical)"
          value={stats.critical}
          subtext={stats.critical > 0 ? 'تتطلب تدخلاً فورياً' : 'لا توجد حوادث حرجة'}
          icon={<ShieldAlert className="w-5 h-5" />}
          variant={stats.critical > 0 ? 'danger' : 'success'}
        />
        <StatCard title="إجمالي تكاليف الصيانة" value={`$${stats.totalCost.toLocaleString()}`} subtext="قطع الغيار وأجور الإصلاح" icon={<DollarSign className="w-5 h-5" />} variant="primary" />
      </div>

      {/* Kanban Board View */}
      {viewMode === 'kanban' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {STATUSES.map((col) => {
            const colRecords = records.filter(r => r.status === col.key);
            return (
              <div key={col.key} className="flex flex-col rounded-xl bg-slate-900/60 border border-slate-800 p-3 min-h-[500px]">
                {/* Column Header */}
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
                  <span className="font-bold text-xs text-slate-200">{col.label}</span>
                  <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-slate-800 ${col.countColor}`}>
                    {colRecords.length}
                  </span>
                </div>

                {/* Cards List */}
                <div className="space-y-3 flex-1 overflow-y-auto">
                  {colRecords.map((ticket) => (
                    <div
                      key={ticket.id}
                      onClick={() => setSelectedRecord(ticket)}
                      className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 hover:border-blue-500/50 transition-all cursor-pointer space-y-2 group shadow-sm text-right"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-blue-400">{ticket.ticketNumber}</span>
                        {ticket.priority && <StatusBadge status={ticket.priority} />}
                      </div>

                      <h4 className="text-xs font-semibold text-slate-200 line-clamp-2 group-hover:text-blue-300 transition-colors">
                        {ticket.problem}
                      </h4>

                      <div className="text-[11px] text-slate-400 space-y-1">
                        <div className="truncate">{ticket.location} {ticket.affectedAssetTag ? `(${ticket.affectedAssetTag})` : ''}</div>
                        <div className="flex items-center justify-between text-slate-500 font-mono text-[10px]">
                          <span>{ticket.engineer}</span>
                          <span>{ticket.date}</span>
                        </div>
                      </div>

                      {/* Status Transition Action Buttons */}
                      <div className="flex items-center gap-1 pt-2 border-t border-slate-900 justify-end" onClick={(e) => e.stopPropagation()}>
                        {col.key === 'Open' && (
                          <button
                            onClick={() => requestStatusChange(ticket.id, 'In Progress', ticket.ticketNumber)}
                            className="text-[10px] px-2 py-1 bg-blue-900/40 text-blue-300 hover:bg-blue-800/60 rounded flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            بدء المعالجة <ArrowRight className="w-2.5 h-2.5 rtl:rotate-180" />
                          </button>
                        )}
                        {col.key === 'In Progress' && (
                          <button
                            onClick={() => requestStatusChange(ticket.id, 'Resolved', ticket.ticketNumber)}
                            className="text-[10px] px-2 py-1 bg-emerald-900/40 text-emerald-300 hover:bg-emerald-800/60 rounded flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            حل التذكرة <CheckCircle2 className="w-2.5 h-2.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}

                  {colRecords.length === 0 && (
                    <div className="h-32 flex items-center justify-center text-xs text-slate-600 border border-dashed border-slate-800/60 rounded-lg">
                      لا توجد تذاكر حالياً
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* DataGrid Table View */
        <DataGrid
          columns={columns}
          data={records}
          searchPlaceholder="ابحث برقم التذكرة، وصف المشكلة، المهندس، أو رقم الأصل..."
          onRowClick={(rec) => setSelectedRecord(rec)}
          exportFileName="SIA_IT_Maintenance_Records"
          filters={[
            { columnId: 'status', label: 'الحالة', getValue: (record) => record.status },
            { columnId: 'priority', label: 'الأولوية', getValue: (record) => record.priority ?? 'Medium' },
          ]}
        />
      )}

      {/* Add / Edit Ticket Modal */}
      <Modal isOpen={formMode !== null} onClose={closeFormModal} title={formMode === 'edit' ? 'تعديل تذكرة الصيانة' : 'تسجيل تذكرة صيانة جديدة (Log Service Ticket)'}>
        <form onSubmit={handleFormSubmit} className="space-y-4 text-sm text-right">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-300 mb-1">الأصل المرتبط (Asset Tag)</label>
              <select
                value={affectedAssetTag} onChange={(e) => setAffectedAssetTag(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-blue-500"
              >
                {assets.map(a => (
                  <option key={a.id} value={a.assetNumber}>{a.assetNumber} - {a.deviceName}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-medium text-slate-300 mb-1">الموقع اللوجستي</label>
              <input
                type="text" placeholder="مثال: المستودع الرئيسي (HQ Warehouse Hub)"
                value={location} onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-300 mb-1">وصف العطل / المشكلة *</label>
            <input
              type="text" required placeholder="مثال: ارتفاع درجة حرارة المروحة وانطفاء تلقائي متكرر"
              value={problem} onChange={(e) => setProblem(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-300 mb-1">السبب الجذري المتوقع (Root Cause)</label>
              <input
                type="text" placeholder="مثال: تراكم الغبار وجفاف المعجون الحراري"
                value={cause} onChange={(e) => setCause(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-300 mb-1">الإجراء المتخذ / الحل المقترح</label>
              <input
                type="text" placeholder="مثال: تنظيف المشتت واستبدال مروحة التبريد"
                value={solution} onChange={(e) => setSolution(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-medium text-slate-300 mb-1">درجة الأولوية</label>
              <select
                value={priority} onChange={(e) => setPriority(e.target.value as PriorityLevel)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-blue-500"
              >
                {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="block font-medium text-slate-300 mb-1">الحالة</label>
              <select
                value={status} onChange={(e) => setStatus(e.target.value as TicketStatus)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-blue-500"
              >
                {STATUSES.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block font-medium text-slate-300 mb-1">المهندس المكلف</label>
              <input
                type="text" placeholder="مثال: مهندس كريم مصطفى"
                value={engineer} onChange={(e) => setEngineer(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-300 mb-1">تاريخ التسجيل</label>
              <input
                type="date" value={date} onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-300 mb-1">التكلفة ($ USD)</label>
              <input
                type="number" min={0} value={cost} onChange={(e) => setCost(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
            <Button variant="outline" onClick={closeFormModal} disabled={isSaving}>إلغاء</Button>
            <Button variant="primary" type="submit" disabled={isSaving}>
              {isSaving ? 'جاري الحفظ...' : formMode === 'edit' ? 'حفظ التعديلات' : 'حفظ وإنشاء التذكرة'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title="تأكيد الحذف"
        message={`هل أنت متأكد من حذف التذكرة "${deleteTarget?.ticketNumber}"؟ لا يمكن التراجع عن هذا الإجراء.`}
        confirmLabel="نعم، احذف"
        cancelLabel="إلغاء"
        variant="danger"
      />

      <ConfirmDialog
        isOpen={showSaveConfirm}
        onClose={() => setShowSaveConfirm(false)}
        onConfirm={executeSave}
        title="تأكيد التعديل"
        message={`هل تريد حفظ التعديلات على التذكرة "${problem}"؟`}
        confirmLabel="نعم، احفظ"
        cancelLabel="إلغاء"
        variant="warning"
      />

      <ConfirmDialog
        isOpen={!!statusChangeTarget}
        onClose={() => setStatusChangeTarget(null)}
        onConfirm={confirmStatusChange}
        title="تأكيد تغيير الحالة"
        message={`هل تريد تغيير حالة التذكرة "${statusChangeTarget?.ticketNumber}" إلى "${statusChangeTarget?.newStatus}"؟`}
        confirmLabel="نعم، تأكيد"
        cancelLabel="إلغاء"
        variant="warning"
      />

      {/* Ticket Details SlideDrawer */}
      <SlideDrawer
        isOpen={!!selectedRecord}
        onClose={() => setSelectedRecord(null)}
        title={selectedRecord?.ticketNumber || 'تفاصيل تذكرة الصيانة'}
        subtitle={selectedRecord?.problem}
      >
        {selectedRecord && (
          <div className="space-y-6 text-sm text-right">
            {/* Status & Priority */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <div>
                <span className="text-xs text-slate-500 block">حالة التذكرة</span>
                <StatusBadge status={selectedRecord.status} />
              </div>
              <div>
                <span className="text-xs text-slate-500 block">درجة الأولوية</span>
                {selectedRecord.priority && <StatusBadge status={selectedRecord.priority} />}
              </div>
            </div>

            {/* Asset Info */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">الأصل والموقع المتأثر</h4>
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs space-y-1">
                <div className="font-semibold text-slate-200">{selectedRecord.location}</div>
                {selectedRecord.affectedAssetTag && <div className="text-blue-400 font-mono">{selectedRecord.affectedAssetTag}</div>}
              </div>
            </div>

            {/* Problem & Solution */}
            <div className="space-y-3">
              <div>
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5" /> وصف المشكلة
                </h4>
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300 leading-relaxed">
                  {selectedRecord.problem}
                </div>
              </div>

              {selectedRecord.cause && (
                <div>
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">السبب الجذري (Root Cause)</h4>
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-amber-300/90 leading-relaxed">
                    {selectedRecord.cause}
                  </div>
                </div>
              )}

              {selectedRecord.solution && (
                <div>
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> الحل المنفذ
                  </h4>
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-emerald-300/90 leading-relaxed">
                    {selectedRecord.solution}
                  </div>
                </div>
              )}
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs">
              <div>
                <span className="text-slate-500 block">المهندس المسؤول</span>
                <span className="font-semibold text-slate-200">{selectedRecord.engineer}</span>
              </div>
              <div>
                <span className="text-slate-500 block">إجمالي التكلفة</span>
                <span className="font-mono font-bold text-blue-400">${(selectedRecord.cost ?? 0).toLocaleString()}</span>
              </div>
            </div>

            {/* Timeline */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" /> التسلسل الزمني للتذكرة
              </h4>
              <div className="relative border-r border-slate-800 mr-2 pr-4 space-y-4 text-xs">
                {selectedRecord.timeline && selectedRecord.timeline.length > 0 ? (
                  selectedRecord.timeline.map((event) => (
                    <div key={event.id} className="relative">
                      <div className="absolute -right-5.5 top-0.5 w-3 h-3 rounded-full bg-blue-500 ring-4 ring-slate-950"></div>
                      <div className="text-slate-200 font-semibold">{event.note}</div>
                      <div className="text-slate-500 font-mono text-[11px]">{event.author} · {event.timestamp ? new Date(event.timestamp).toLocaleString('ar-EG') : selectedRecord.date}</div>
                    </div>
                  ))
                ) : (
                  <div className="relative">
                    <div className="absolute -right-5.5 top-0.5 w-3 h-3 rounded-full bg-blue-500 ring-4 ring-slate-950"></div>
                    <div className="text-slate-200 font-semibold">تم إنشاء البلاغ وفتح التذكرة</div>
                    <div className="text-slate-500 font-mono text-[11px]">{selectedRecord.date}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Status Update Footer */}
            <div className="flex gap-2 pt-3 border-t border-slate-800">
              {selectedRecord.status !== 'Resolved' && selectedRecord.status !== 'Closed' && (
                <Button
                  variant="primary"
                  className="flex-1"
                  onClick={() => requestStatusChange(selectedRecord.id, 'Resolved', selectedRecord.ticketNumber)}
                  icon={<CheckCircle2 className="w-4 h-4" />}
                >
                  تعيين كـ "تم الحل"
                </Button>
              )}
              {selectedRecord.status === 'Open' && (
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => requestStatusChange(selectedRecord.id, 'In Progress', selectedRecord.ticketNumber)}
                >
                  بدء المعالجة
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => { openEditModal(selectedRecord); setSelectedRecord(null); }}
                icon={<Pencil className="w-4 h-4 text-amber-400" />}
              >
                تعديل
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setDeleteTarget(selectedRecord)}
                icon={<Trash2 className="w-4 h-4 text-rose-400" />}
              >
                حذف
              </Button>
            </div>
          </div>
        )}
      </SlideDrawer>
    </div>
  );
};
