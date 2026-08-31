import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, HardDrive, Server, Wrench, BookOpen, KeyRound, ArrowLeft, Boxes, Network, FileBarChart, Settings } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { useUiStore } from '../../store/useUiStore';
import { useAssetStore } from '../../store/useAssetStore';
import { useServerStore } from '../../store/useServerStore';
import { useMaintenanceStore } from '../../store/useMaintenanceStore';
import { useInventoryStore } from '../../store/useInventoryStore';
import { useKBStore } from '../../store/useKBStore';
import { useLicenseStore } from '../../store/useLicenseStore';

export const CommandPalette: React.FC = () => {
  const navigate = useNavigate();
  const { isCommandPaletteOpen, setCommandPaletteOpen } = useUiStore();
  const { assets } = useAssetStore();
  const { servers } = useServerStore();
  const { records } = useMaintenanceStore();
  const { inventory } = useInventoryStore();
  const { articles } = useKBStore();
  const { licenses } = useLicenseStore();

  const [query, setQuery] = useState('');

  useEffect(() => {
    if (isCommandPaletteOpen) setQuery('');
  }, [isCommandPaletteOpen]);

  const handleSelect = (path: string) => {
    setCommandPaletteOpen(false);
    navigate(path);
  };

  const filteredAssets = assets
    .filter((a) => a.deviceName.toLowerCase().includes(query.toLowerCase()) || a.assetNumber.toLowerCase().includes(query.toLowerCase()))
    .slice(0, 3);

  const filteredServers = servers
    .filter((s) => s.name.toLowerCase().includes(query.toLowerCase()) || s.ipAddress.includes(query))
    .slice(0, 3);

  const filteredTickets = records
    .filter((t) => t.problem.toLowerCase().includes(query.toLowerCase()) || t.ticketNumber.toLowerCase().includes(query.toLowerCase()))
    .slice(0, 3);

  const filteredInventory = inventory
    .filter((item) => `${item.sku} ${item.name} ${item.category} ${item.binLocation}`.toLowerCase().includes(query.toLowerCase()))
    .slice(0, 3);

  const filteredArticles = articles
    .filter((article) => `${article.title} ${article.category} ${article.symptoms} ${article.solution}`.toLowerCase().includes(query.toLowerCase()))
    .slice(0, 3);

  const filteredLicenses = licenses
    .filter((license) => `${license.softwareName} ${license.publisher} ${license.category} ${license.licenseKey}`.toLowerCase().includes(query.toLowerCase()))
    .slice(0, 3);

  return (
    <Modal
      isOpen={isCommandPaletteOpen}
      onClose={() => setCommandPaletteOpen(false)}
      title="Command Palette"
      maxWidth="xl"
    >
      <div className="space-y-4 text-right">
        {/* Search input field */}
        <div className="relative">
          <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-400" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search assets, servers, inventory, knowledge base, licenses..."
            className="w-full pr-11 pl-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm text-right"
          />
        </div>

        {/* Navigation Shortcuts */}
        {!query && (
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 font-mono">Quick Navigation</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm">
              <button
                onClick={() => handleSelect('/assets')}
                className="flex items-center justify-between p-2.5 bg-slate-950/60 hover:bg-slate-800 border border-slate-800 rounded-lg text-slate-300 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <HardDrive className="w-4 h-4 text-blue-400" />
                  <span>Assets</span>
                </div>
                <ArrowLeft className="w-3.5 h-3.5 text-slate-500" />
              </button>

              <button
                onClick={() => handleSelect('/inventory')}
                className="flex items-center justify-between p-2.5 bg-slate-950/60 hover:bg-slate-800 border border-slate-800 rounded-lg text-slate-300 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Boxes className="w-4 h-4 text-cyan-400" />
                  <span>Inventory</span>
                </div>
                <ArrowLeft className="w-3.5 h-3.5 text-slate-500" />
              </button>

              <button
                onClick={() => handleSelect('/servers')}
                className="flex items-center justify-between p-2.5 bg-slate-950/60 hover:bg-slate-800 border border-slate-800 rounded-lg text-slate-300 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Server className="w-4 h-4 text-emerald-400" />
                  <span>Servers</span>
                </div>
                <ArrowLeft className="w-3.5 h-3.5 text-slate-500" />
              </button>

              <button
                onClick={() => handleSelect('/maintenance')}
                className="flex items-center justify-between p-2.5 bg-slate-950/60 hover:bg-slate-800 border border-slate-800 rounded-lg text-slate-300 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-amber-400" />
                  <span>Maintenance</span>
                </div>
                <ArrowLeft className="w-3.5 h-3.5 text-slate-500" />
              </button>

              <button
                onClick={() => handleSelect('/kb')}
                className="flex items-center justify-between p-2.5 bg-slate-950/60 hover:bg-slate-800 border border-slate-800 rounded-lg text-slate-300 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-purple-400" />
                  <span>Knowledge Base</span>
                </div>
                <ArrowLeft className="w-3.5 h-3.5 text-slate-500" />
              </button>

              <button
                onClick={() => handleSelect('/licenses')}
                className="flex items-center justify-between p-2.5 bg-slate-950/60 hover:bg-slate-800 border border-slate-800 rounded-lg text-slate-300 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-rose-400" />
                  <span>Licenses</span>
                </div>
                <ArrowLeft className="w-3.5 h-3.5 text-slate-500" />
              </button>
            </div>
          </div>
        )}

        {/* Filtered Search Results */}
        {query && (
          <div className="space-y-4 max-h-80 overflow-y-auto">
            {filteredAssets.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 font-mono">Assets</p>
                <div className="space-y-1">
                  {filteredAssets.map((asset) => (
                    <div
                      key={asset.id}
                      onClick={() => handleSelect('/assets')}
                      className="flex items-center justify-between p-2.5 bg-slate-950/50 hover:bg-slate-800 border border-slate-800/80 rounded-lg transition-colors cursor-pointer text-xs"
                    >
                      <div>
                        <span className="font-semibold text-slate-200 block">{asset.deviceName}</span>
                        <span className="text-slate-400">{asset.department} · {asset.assignedEmployee}</span>
                      </div>
                      <span className="font-mono text-blue-400 font-bold">{asset.assetNumber}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {filteredInventory.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 font-mono">Inventory</p>
                <div className="space-y-1">
                  {filteredInventory.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleSelect('/inventory')}
                      className="flex items-center justify-between p-2.5 bg-slate-950/50 hover:bg-slate-800 border border-slate-800/80 rounded-lg transition-colors cursor-pointer text-xs"
                    >
                      <div>
                        <span className="font-semibold text-slate-200 block">{item.name}</span>
                        <span className="text-slate-400">{item.binLocation} · {item.quantityInStock} units</span>
                      </div>
                      <span className="font-mono text-cyan-400 font-bold">{item.sku}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {filteredServers.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 font-mono">Servers</p>
                <div className="space-y-1">
                  {filteredServers.map((srv) => (
                    <div
                      key={srv.id}
                      onClick={() => handleSelect('/servers')}
                      className="flex items-center justify-between p-2.5 bg-slate-950/50 hover:bg-slate-800 border border-slate-800/80 rounded-lg transition-colors cursor-pointer text-xs"
                    >
                      <div>
                        <span className="font-semibold text-slate-200 block">{srv.name}</span>
                        <span className="text-slate-400">{srv.role}</span>
                      </div>
                      <span className="font-mono text-emerald-400">{srv.ipAddress}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {filteredTickets.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 font-mono">Maintenance Tickets</p>
                <div className="space-y-1">
                  {filteredTickets.map((tkt) => (
                    <div
                      key={tkt.id}
                      onClick={() => handleSelect('/maintenance')}
                      className="flex items-center justify-between p-2.5 bg-slate-950/50 hover:bg-slate-800 border border-slate-800/80 rounded-lg transition-colors cursor-pointer text-xs"
                    >
                      <div>
                        <span className="font-semibold text-slate-200 block truncate max-w-xs">{tkt.problem}</span>
                        <span className="text-slate-400">{tkt.engineer}</span>
                      </div>
                      <span className="font-mono text-amber-400 font-bold">{tkt.ticketNumber}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {filteredArticles.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 font-mono">Knowledge Base</p>
                <div className="space-y-1">
                  {filteredArticles.map((art) => (
                    <div
                      key={art.id}
                      onClick={() => handleSelect('/kb')}
                      className="flex items-center justify-between p-2.5 bg-slate-950/50 hover:bg-slate-800 border border-slate-800/80 rounded-lg transition-colors cursor-pointer text-xs"
                    >
                      <div>
                        <span className="font-semibold text-slate-200 block truncate max-w-xs">{art.title}</span>
                        <span className="text-slate-400">{art.category}</span>
                      </div>
                      <span className="font-mono text-purple-400 font-bold">{art.articleId}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};
