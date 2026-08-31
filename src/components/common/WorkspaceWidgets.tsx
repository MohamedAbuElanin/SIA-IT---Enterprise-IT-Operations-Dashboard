import React, { useState, type DragEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Boxes, FileBarChart, HardDrive, KeyRound, Plus, Wrench } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { useToastStore } from '../../store/useToastStore';

interface WorkspaceItem {
  id: string;
  title: string;
  description: string;
  route: string;
  icon: React.ReactNode;
}

const defaultItems: WorkspaceItem[] = [
  { id: 'asset', title: 'Register Asset', description: 'إضافة جهاز أو عتاد جديد إلى الأسطول', route: '/assets', icon: <HardDrive className="w-4 h-4" /> },
  { id: 'maintenance', title: 'Log Maintenance', description: 'إنشاء تذكرة خدمة وفحص عتاد جديد', route: '/maintenance', icon: <Wrench className="w-4 h-4" /> },
  { id: 'inventory', title: 'Manage Inventory', description: 'مراجعة مستويات المخزون وحدود إعادة الطلب', route: '/inventory', icon: <Boxes className="w-4 h-4" /> },
  { id: 'knowledge', title: 'Knowledge Base', description: 'استعراض حلول المشكلات وإجراءات التشغيل', route: '/kb', icon: <BookOpen className="w-4 h-4" /> },
  { id: 'license', title: 'Review Licenses', description: 'التحقق من مواعيد تجديد التراخيص البرمجية', route: '/licenses', icon: <KeyRound className="w-4 h-4" /> },
  { id: 'report', title: 'Generate Report', description: 'تصدير تقرير PDF رسمي للعمليات والامتثال', route: '/reports', icon: <FileBarChart className="w-4 h-4" /> },
];

export const WorkspaceWidgets: React.FC = () => {
  const [items, setItems] = useState(defaultItems);
  const [pinned, setPinned] = useState<string[]>(['asset', 'maintenance', 'license']);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const navigate = useNavigate();
  const { addToast } = useToastStore();

  const handleDrop = (targetId: string) => {
    if (!draggedId || draggedId === targetId) return;
    setItems((current) => {
      const sourceIndex = current.findIndex((item) => item.id === draggedId);
      const targetIndex = current.findIndex((item) => item.id === targetId);
      const next = [...current];
      const [moved] = next.splice(sourceIndex, 1);
      next.splice(targetIndex, 0, moved);
      return next;
    });
    setDraggedId(null);
  };

  const togglePin = (id: string) => {
    setPinned((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
    const item = items.find((entry) => entry.id === id);
    if (item) addToast({ tone: 'info', title: pinned.includes(id) ? 'تم إلغاء التثبيت' : 'تم تثبيت البطاقة في المقدمة', description: item.title });
  };

  return (
    <Card className="space-y-4 text-right">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-100">Quick Actions & Pinned Widgets</h2>
          <p className="text-xs text-slate-400">يمكنك سحب وإفلات البطاقات لتخصيص مساحة العمل وسرعة الوصول.</p>
        </div>
        <span className="text-xs font-semibold text-blue-400 font-mono">{pinned.length} Pinned</span>
      </div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
        {[...items.filter((item) => pinned.includes(item.id)), ...items.filter((item) => !pinned.includes(item.id))].map((item) => (
          <div key={item.id} draggable onDragStart={() => setDraggedId(item.id)} onDragOver={(event: DragEvent<HTMLDivElement>) => event.preventDefault()} onDrop={() => handleDrop(item.id)} className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-950/50 p-3 transition-colors hover:border-slate-700 cursor-grab active:cursor-grabbing">
            <div className="rounded-lg bg-blue-500/10 p-2 text-blue-400 shrink-0">{item.icon}</div>
            <button type="button" onClick={() => navigate(item.route)} className="min-w-0 flex-1 text-right cursor-pointer">
              <p className="text-sm font-semibold text-slate-200 font-mono">{item.title}</p>
              <p className="truncate text-xs text-slate-500">{item.description}</p>
            </button>
            <Button variant={pinned.includes(item.id) ? 'primary' : 'ghost'} size="sm" onClick={() => togglePin(item.id)} icon={<Plus className="w-3.5 h-3.5" />}><span className="sr-only">Toggle Pin</span></Button>
          </div>
        ))}
      </div>
    </Card>
  );
};
