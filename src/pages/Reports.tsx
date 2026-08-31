import React, { useState } from 'react';
import { FileBarChart, Download, FileText, ShieldCheck, Printer, Package, BookOpen, LayoutDashboard } from 'lucide-react';
import { useAssetStore } from '../store/useAssetStore';
import { useMaintenanceStore } from '../store/useMaintenanceStore';
import { useInventoryStore } from '../store/useInventoryStore';
import { useLicenseStore } from '../store/useLicenseStore';
import { useKBStore } from '../store/useKBStore';
import { generateAssetReportPDF, generateDataReportPDF, generateMaintenanceReportPDF } from '../utils/pdfExport';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useToastStore } from '../store/useToastStore';

export const ReportsPage: React.FC = () => {
  const { assets } = useAssetStore();
  const { records } = useMaintenanceStore();
  const { inventory } = useInventoryStore();
  const { licenses } = useLicenseStore();
  const { articles } = useKBStore();
  const { addToast } = useToastStore();

  const [reportType, setReportType] = useState<'asset' | 'inventory' | 'maintenance' | 'license' | 'knowledge' | 'summary'>('asset');
  const [preparedBy, setPreparedBy] = useState('محمد أبو العنين (مسؤول عمليات تقنية المعلومات - IT Operations Lead)');

  const handleDownloadPDF = () => {
    try {
      if (reportType === 'asset') {
        generateAssetReportPDF(assets, preparedBy);
      } else if (reportType === 'maintenance') {
        generateMaintenanceReportPDF(records, preparedBy);
      } else if (reportType === 'inventory') {
        generateDataReportPDF('Inventory Report', ['SKU', 'Item', 'Category', 'Stock', 'Status', 'Bin Location'], inventory.map((item) => [item.sku, item.name, item.category, item.quantityInStock, item.status, item.binLocation]), preparedBy, 'SIA_Inventory_Report');
      } else if (reportType === 'license') {
        generateDataReportPDF('Software License Report', ['Software', 'Category', 'Seats', 'Expiry Date', 'Status'], licenses.map((license) => [license.softwareName, license.category, `${license.usedSeats}/${license.totalSeats}`, license.expiryDate, license.status]), preparedBy, 'SIA_License_Report');
      } else if (reportType === 'knowledge') {
        generateDataReportPDF('Knowledge Base Report', ['Article', 'Title', 'Category', 'Time to Solve', 'Pinned'], articles.map((article) => [article.articleId, article.title, article.category, article.timeToSolve, article.isPinned ? 'Yes' : 'No']), preparedBy, 'SIA_Knowledge_Base_Report');
      } else {
        generateDataReportPDF('Dashboard Summary', ['Metric', 'Value', 'Status'], [
          ['Total Assets', assets.length, 'Tracked'],
          ['Working Devices', assets.filter((asset) => asset.status === 'Active').length, 'Operational'],
          ['Open Maintenance Tickets', records.filter((record) => !['Resolved', 'Closed'].includes(record.status)).length, 'Needs attention'],
          ['Inventory SKUs', inventory.length, 'Tracked'],
          ['Licenses Expiring', licenses.filter((license) => license.status === 'Expiring Soon').length, 'Renewal required'],
          ['Knowledge Articles', articles.length, 'Available'],
        ], preparedBy, 'SIA_Dashboard_Summary');
      }
      addToast({ tone: 'success', title: 'تم إنشاء وتنزيل تقرير PDF بنجاح', description: 'تم تصدير المستند الرسمي للطباعة والمراجعة.' });
    } catch {
      addToast({ tone: 'error', title: 'تعذر توليد التقرير', description: 'يرجى مراجعة البيانات والمحاولة مجدداً.' });
    }
  };

  return (
    <div className="space-y-6 text-right">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-slate-100 tracking-tight">توليد التقارير الرسمية والامتثال (Reports & Compliance)</h1>
        <p className="text-sm text-slate-400 mt-0.5">
          إنشاء وتصدير تقارير PDF الرسمية وسجلات الجرد الشاملة لتقديمها للإدارة التنفيذية والتدقيق
        </p>
      </div>

      {/* Main Report Builder Card */}
      <Card className="p-6 space-y-6 max-w-3xl">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
          <div className="p-2.5 rounded-xl bg-blue-600/10 text-blue-400 border border-blue-500/20">
            <FileBarChart className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-100">مُنشئ تقارير PDF للعمليات التشغيلية</h3>
            <p className="text-xs text-slate-400">حدد نوع التقرير والموقّع المسؤول لتصدير المستند المنسق جاهزاً للطباعة</p>
          </div>
        </div>

        <div className="space-y-4 text-sm">
          <div>
            <label className="block font-medium text-slate-300 mb-2">اختر تصنيف التقرير المطلوب</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setReportType('asset')}
                className={`p-3.5 rounded-xl border text-right flex flex-col justify-between transition-all cursor-pointer ${
                  reportType === 'asset'
                    ? 'bg-blue-950/40 border-blue-500 text-slate-100'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <FileText className="w-5 h-5 text-blue-400 mb-2" />
                <div>
                  <div className="font-semibold">تقرير جرد الأصول (Fleet Audit)</div>
                  <div className="text-[11px] text-slate-500">حصر كامل للأجهزة والماسحات والتقييم</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setReportType('inventory')}
                className={`p-3.5 rounded-xl border text-right flex flex-col justify-between transition-all cursor-pointer ${
                  reportType === 'inventory' ? 'bg-blue-950/40 border-blue-500 text-slate-100' : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <Package className="w-5 h-5 text-cyan-400 mb-2" />
                <div>
                  <div className="font-semibold">تقرير المخزون (Inventory)</div>
                  <div className="text-[11px] text-slate-500">مستويات القطع وحدود إعادة الطلب</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setReportType('maintenance')}
                className={`p-3.5 rounded-xl border text-right flex flex-col justify-between transition-all cursor-pointer ${
                  reportType === 'maintenance'
                    ? 'bg-blue-950/40 border-blue-500 text-slate-100'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <Printer className="w-5 h-5 text-amber-400 mb-2" />
                <div>
                  <div className="font-semibold">سجل الصيانة واتفاقية SLA</div>
                  <div className="text-[11px] text-slate-500">تذاكر الأعطال وتكاليف الإصلاحات</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setReportType('knowledge')}
                className={`p-3.5 rounded-xl border text-right flex flex-col justify-between transition-all cursor-pointer ${
                  reportType === 'knowledge' ? 'bg-blue-950/40 border-blue-500 text-slate-100' : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <BookOpen className="w-5 h-5 text-purple-400 mb-2" />
                <div>
                  <div className="font-semibold">قاعدة المعرفة (Knowledge Base)</div>
                  <div className="text-[11px] text-slate-500">حلول المشكلات وإجراءات التشغيل القياسية</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setReportType('license')}
                className={`p-3.5 rounded-xl border text-right flex flex-col justify-between transition-all cursor-pointer ${
                  reportType === 'license'
                    ? 'bg-blue-950/40 border-blue-500 text-slate-100'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <ShieldCheck className="w-5 h-5 text-emerald-400 mb-2" />
                <div>
                  <div className="font-semibold">تدقيق التراخيص (Licenses)</div>
                  <div className="text-[11px] text-slate-500">إنفاق التراخيص واستهلاك مقاعد البرمجيات</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setReportType('summary')}
                className={`p-3.5 rounded-xl border text-right flex flex-col justify-between transition-all cursor-pointer ${
                  reportType === 'summary' ? 'bg-blue-950/40 border-blue-500 text-slate-100' : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <LayoutDashboard className="w-5 h-5 text-rose-400 mb-2" />
                <div>
                  <div className="font-semibold">الملخص التنفيذي الشامل</div>
                  <div className="text-[11px] text-slate-500">مؤشرات الأداء التشغيلية للبنية التحتية</div>
                </div>
              </button>
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-300 mb-1">اسم ومسمى المُعد المسؤول (Prepared By)</label>
            <input
              type="text"
              value={preparedBy}
              onChange={(e) => setPreparedBy(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-blue-500 text-right"
            />
          </div>

          <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs text-slate-400">
              صيغة المستند: <strong className="text-slate-200">PDF Document (.pdf)</strong> مع جداول وترويسة مؤسسية رسمية
            </div>

            <Button variant="primary" size="lg" onClick={handleDownloadPDF} icon={<Download className="w-5 h-5" />}>
              تحميل التقرير الرسمي PDF
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
