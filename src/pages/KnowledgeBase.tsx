import React, { useMemo } from 'react';
import {
  BookOpen, Search, Star, Pin, Eye, Terminal, Clock,
  ChevronLeft, Stethoscope, Wrench, Zap, Copy, Check
} from 'lucide-react';
import { useKBStore } from '../store/useKBStore';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { useToastStore } from '../store/useToastStore';

const CATEGORIES = [
  { key: 'ALL', label: 'All Categories' },
  { key: 'Warehouse IT SOPs', label: 'Warehouse IT SOPs' },
  { key: 'Label Printers Calibration', label: 'Printer Calibration' },
  { key: 'Network & VPN Settings', label: 'Network & VPN' },
  { key: 'ERP Diagnostic Procedures', label: 'ERP Diagnostics' },
];

export const KnowledgeBasePage: React.FC = () => {
  const {
    articles, selectedArticle, searchQuery, categoryFilter,
    setSelectedArticle, setSearchQuery, setCategoryFilter,
    toggleFavorite, togglePin
  } = useKBStore();
  const { addToast } = useToastStore();
  const [copiedIndex, setCopiedIndex] = React.useState<number | null>(null);

  const filteredArticles = useMemo(() => {
    return articles
      .filter((art) => {
        const matchesSearch =
          art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          art.symptoms?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          art.category.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCat = categoryFilter === 'ALL' || art.category === categoryFilter;
        return matchesSearch && matchesCat;
      })
      .sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return 0;
      });
  }, [articles, searchQuery, categoryFilter]);

  const stats = useMemo(() => ({
    total: articles.length,
    pinned: articles.filter(a => a.isPinned).length,
    favorites: articles.filter(a => a.isFavorite).length,
    totalViews: articles.reduce((sum, a) => sum + (a.viewsCount ?? 0), 0),
  }), [articles]);

  const handleCopyCommand = (cmd: string, idx: number) => {
    navigator.clipboard.writeText(cmd);
    setCopiedIndex(idx);
    addToast({ tone: 'success', title: 'Command Copied', description: cmd });
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="space-y-6 text-right">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight">Knowledge Base & SOPs</h1>
          <p className="text-sm text-slate-400 mt-0.5">
            حلول المشكلات الفنية المتكررة، توثيق الأعطال السابقة، والأوامر التشغيلية المعتمدة
          </p>
        </div>
        {/* Stats Badges */}
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800">
            <BookOpen className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-slate-300 font-mono font-bold">{stats.total}</span>
            <span className="text-slate-500">articles</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800">
            <Pin className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-slate-300 font-mono font-bold">{stats.pinned}</span>
            <span className="text-slate-500">pinned</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800">
            <Eye className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-300 font-mono">{stats.totalViews.toLocaleString()}</span>
            <span className="text-slate-500">views</span>
          </div>
        </div>
      </div>

      {/* Search + Category Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, symptoms, or category..."
            className="w-full pr-9 pl-4 py-2.5 text-sm bg-slate-950 border border-slate-800 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 text-right"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {CATEGORIES.map(cat => (
            <button
              key={cat.key}
              onClick={() => setCategoryFilter(cat.key)}
              className={`px-3 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                categoryFilter === cat.key
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-700'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* 2-column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Article List */}
        <div className="lg:col-span-5 space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 font-mono">
            {filteredArticles.length} articles found
          </h3>

          {filteredArticles.length === 0 && (
            <div className="text-center py-12 text-slate-500 text-sm">
              No articles match your current search.
            </div>
          )}

          {filteredArticles.map((art) => {
            const isSelected = selectedArticle?.id === art.id;
            return (
              <Card
                key={art.id}
                onClick={() => setSelectedArticle(art)}
                className={`p-4 cursor-pointer transition-all text-right ${
                  isSelected ? 'border-blue-500 bg-blue-950/20' : 'hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs font-bold text-blue-400">{art.articleId}</span>
                      {art.isPinned && (
                        <Pin className="w-3 h-3 text-amber-400 fill-amber-400 flex-shrink-0" />
                      )}
                      {art.isFavorite && (
                        <Star className="w-3 h-3 text-yellow-400 fill-yellow-400 flex-shrink-0" />
                      )}
                    </div>
                    <h4 className="text-sm font-semibold text-slate-100 leading-snug">{art.title}</h4>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">{art.symptoms}</p>
                  </div>
                  <ChevronLeft className={`w-4 h-4 flex-shrink-0 mt-1 ${isSelected ? 'text-blue-400' : 'text-slate-600'}`} />
                </div>
                <div className="flex items-center gap-2 mt-3">
                  <Badge variant="neutral" size="sm">{art.category}</Badge>
                  <div className="flex items-center gap-1 text-[11px] text-slate-500">
                    <Clock className="w-3 h-3" />
                    <span>{art.timeToSolve}</span>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-slate-500 mr-auto">
                    <Eye className="w-3 h-3" />
                    <span className="font-mono">{art.viewsCount}</span>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Article Detail Viewer */}
        {selectedArticle ? (
          <div className="lg:col-span-7">
            <Card className="p-6 space-y-5 text-right">
              {/* Article Header */}
              <div className="space-y-3 border-b border-slate-800 pb-4">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-blue-400 text-sm">{selectedArticle.articleId}</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => togglePin(selectedArticle.id)}
                      className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                        selectedArticle.isPinned
                          ? 'text-amber-400 bg-amber-950/40 border border-amber-800'
                          : 'text-slate-500 hover:text-amber-400 hover:bg-slate-800'
                      }`}
                      title={selectedArticle.isPinned ? 'Unpin' : 'Pin Article'}
                    >
                      <Pin className={`w-4 h-4 ${selectedArticle.isPinned ? 'fill-amber-400' : ''}`} />
                    </button>
                    <button
                      onClick={() => toggleFavorite(selectedArticle.id)}
                      className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                        selectedArticle.isFavorite
                          ? 'text-yellow-400 bg-yellow-950/40 border border-yellow-800'
                          : 'text-slate-500 hover:text-yellow-400 hover:bg-slate-800'
                      }`}
                      title={selectedArticle.isFavorite ? 'Remove Favorite' : 'Add to Favorites'}
                    >
                      <Star className={`w-4 h-4 ${selectedArticle.isFavorite ? 'fill-yellow-400' : ''}`} />
                    </button>
                  </div>
                </div>
                <h2 className="text-xl font-bold text-slate-100 tracking-tight leading-tight">{selectedArticle.title}</h2>
                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
                  <span>Author: <strong className="text-slate-200">{selectedArticle.author}</strong></span>
                  <span>Updated: <strong className="text-slate-200 font-mono">{selectedArticle.lastUpdated}</strong></span>
                  <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> <span className="font-mono">{selectedArticle.viewsCount}</span> views</span>
                  <Badge variant="neutral" size="sm">{selectedArticle.category}</Badge>
                </div>
              </div>

              {/* Symptoms */}
              <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-900/50">
                <h3 className="flex items-center gap-2 text-xs font-bold text-rose-400 uppercase tracking-wider mb-2 font-mono">
                  <Stethoscope className="w-3.5 h-3.5" /> Symptoms
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed">{selectedArticle.symptoms}</p>
              </div>

              {/* Root Cause */}
              <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-900/50">
                <h3 className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider mb-2 font-mono">
                  <Wrench className="w-3.5 h-3.5" /> Root Cause
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed">{selectedArticle.rootCause}</p>
              </div>

              {/* Solution */}
              <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-900/50">
                <h3 className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2 font-mono">
                  <Zap className="w-3.5 h-3.5" /> Solution
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed">{selectedArticle.solution}</p>
              </div>

              {/* Commands Used */}
              {selectedArticle.commandsUsed.length > 0 && (
                <div>
                  <h3 className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 font-mono">
                    <Terminal className="w-3.5 h-3.5" /> Commands Used
                  </h3>
                  <div className="space-y-2 font-mono bg-slate-950 border border-slate-800 rounded-xl p-4 dir-ltr text-left">
                    {selectedArticle.commandsUsed.map((cmd, idx) => (
                      <div key={idx} className="flex items-center justify-between gap-2 p-1.5 rounded hover:bg-slate-900 transition-colors">
                        <div className="flex items-center gap-2 overflow-hidden">
                          <span className="text-slate-600 select-none text-xs">{idx + 1}.</span>
                          <code className="text-xs text-emerald-400 font-mono break-all">{cmd}</code>
                        </div>
                        <button
                          onClick={() => handleCopyCommand(cmd, idx)}
                          className="p-1 rounded text-slate-500 hover:text-blue-400 transition-colors cursor-pointer shrink-0"
                          title="Copy command"
                        >
                          {copiedIndex === idx ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Time + Devices + Software */}
              <div className="grid grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-slate-500 block mb-1 font-semibold flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Time to Solve
                  </span>
                  <span className="text-blue-400 font-semibold font-mono">{selectedArticle.timeToSolve}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-slate-500 block mb-1 font-semibold">Related Devices</span>
                  <div className="space-y-0.5">
                    {selectedArticle.relatedDevices.map(d => (
                      <div key={d} className="text-slate-300 truncate text-[11px]">{d}</div>
                    ))}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-slate-500 block mb-1 font-semibold">Related Software</span>
                  <div className="space-y-0.5">
                    {selectedArticle.relatedSoftware.map(s => (
                      <div key={s} className="text-slate-300 truncate text-[10px]">{s}</div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Attached Files */}
              {selectedArticle.files.length > 0 && (
                <div className="pt-4 border-t border-slate-800">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 font-mono">Attached Files</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedArticle.files.map(f => (
                      <span key={f} className="text-xs px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-blue-400 font-mono">
                        📎 {f}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          </div>
        ) : (
          <div className="lg:col-span-7 flex items-center justify-center text-slate-500">
            <div className="text-center">
              <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Select an article from the list to view details and resolution steps</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
