'use client';

import React, { useState } from 'react';
import {
  Search,
  Calendar,
  Clock,
  Loader2,
  UserCheck,
  User,
  Swords,
  Package,
  Layers,
  Briefcase,
  Shield,
  Zap,
  Sparkles,
  Flame,
  Coins,
  History,
  ShoppingCart,
} from 'lucide-react';

interface HistoryTimestamp {
  filename: string;
  display_time: string;
}

interface CharacterInfo {
  name?: string;
  race?: string;
  sex?: string;
  ipAddress?: string;
  world?: string;
  historyDate?: string;
}

interface StatDiff {
  before: number;
  after: number;
}

interface ItemObject {
  slotIndex?: number;
  itemCode?: string;
  itemName?: string;
  serial?: string | number;
  upgrades?: string | number;
  [key: string]: any;
}

type LogItem = string | ItemObject;

interface DiffCategory {
  before?: LogItem[];
  after?: LogItem[];
}

interface SingleCategory {
  items?: LogItem[];
}

interface HistoryLogDetail {
  characterInfo?: CharacterInfo;
  beforeState?: Record<string, any>;
  afterState?: Record<string, any>;
  stats?: Record<string, StatDiff>;
  equipment?: DiffCategory | any[];
  accessory?: DiffCategory;
  inventory?: DiffCategory;
  force?: DiffCategory;
  resource?: DiffCategory;
  animus?: DiffCategory;
  bank?: DiffCategory;
  experience?: SingleCategory;
  consume?: SingleCategory;
}

type TabType =
  | 'inventory'
  | 'equipment'
  | 'accessory'
  | 'force'
  | 'resource'
  | 'animus'
  | 'bank'
  | 'experience'
  | 'consume';

export default function CharacterHistoryPage() {
  const [characterName, setCharacterName] = useState('Roxy');
  const [selectedDate, setSelectedDate] = useState('2026-08-18');

  const [timestamps, setTimestamps] = useState<HistoryTimestamp[] | null>(null);
  const [selectedLog, setSelectedLog] = useState<HistoryLogDetail | null>(null);
  const [activeTimestampFilename, setActiveTimestampFilename] = useState<string | null>(null);
  const [activeTimestampLabel, setActiveTimestampLabel] = useState<string>('');

  const [activeTab, setActiveTab] = useState<TabType>('inventory');

  const [loadingTimestamps, setLoadingTimestamps] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Formats item text safely
  const renderItemText = (item: any): string => {
    if (item === null || item === undefined) return '(Empty)';
    if (typeof item === 'string' || typeof item === 'number') return String(item) || '(Empty)';
    if (typeof item === 'object') {
      const name = item.itemName || item.itemCode || item.name || '';
      const upgrades = item.upgrades ? ` (+${item.upgrades})` : '';
      const slot = item.slotIndex !== undefined ? `[Slot ${item.slotIndex}] ` : '';
      return `${slot}${name}${upgrades}`.trim() || JSON.stringify(item);
    }
    return String(item);
  };

  const getItemKey = (item: any): string => {
    if (typeof item === 'object' && item !== null) {
      return item.serial ? String(item.serial) : JSON.stringify(item);
    }
    return String(item);
  };

  // Converts "2026-08-18" to "260818"
  const formatYYMMDD = (dateStr: string): string => {
    if (!dateStr) return '';
    const cleanDate = dateStr.replace(/-/g, '');
    return cleanDate.length === 8 ? cleanDate.slice(2) : dateStr;
  };

  // Search Timestamps: e.g. /api/history_timestamps?name=Roxy&date=260818
  const handleSearchTimestamps = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!characterName || !selectedDate) return;

    const formattedDate = formatYYMMDD(selectedDate);

    setLoadingTimestamps(true);
    setError(null);
    setSelectedLog(null);
    setActiveTimestampFilename(null);
    setTimestamps(null);

    try {
      const response = await fetch(
        `/api/history_timestamps?name=${encodeURIComponent(characterName)}&date=${encodeURIComponent(formattedDate)}`
      );
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch history timestamps.');
      }

      setTimestamps(result);
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching timestamps.');
    } finally {
      setLoadingTimestamps(false);
    }
  };

  // Fetch Log Details
  const handleSelectTimestamp = async (item: HistoryTimestamp) => {
    if (activeTimestampFilename === item.filename) {
      setSelectedLog(null);
      setActiveTimestampFilename(null);
      return;
    }

    setLoadingDetails(true);
    setError(null);
    setActiveTimestampFilename(item.filename);
    setActiveTimestampLabel(item.display_time);

    const logId = item.filename.replace('.his', '');

    try {
      const response = await fetch(
        `/api/history_logs?log=${encodeURIComponent(logId)}`
      );
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch detailed log comparison.');
      }

      const logData = result.data || result;
      setSelectedLog(logData);
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching log details.');
    } finally {
      setLoadingDetails(false);
    }
  };

  const renderBeforeAfterGrid = (categoryData?: DiffCategory, title?: string) => {
    const beforeList = categoryData?.before || [];
    const afterList = categoryData?.after || [];

    return (
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold uppercase text-neutral-400">
            <Package className="h-3.5 w-3.5 text-neutral-500" />
            <span>{title || 'Items'} (Before)</span>
          </div>
          <div className="max-h-72 overflow-y-auto space-y-1.5 font-mono text-xs">
            {beforeList.length === 0 ? (
              <div className="rounded bg-neutral-950 p-3 text-center text-neutral-600 border border-neutral-800/60 italic">
                (Empty / No Items)
              </div>
            ) : (
              beforeList.map((item, idx) => (
                <div key={idx} className="rounded bg-neutral-950 p-2 text-neutral-400 border border-neutral-800/60">
                  [{idx}] {renderItemText(item)}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold uppercase text-emerald-400">
            <Layers className="h-3.5 w-3.5 text-emerald-400" />
            <span>{title || 'Items'} (After)</span>
          </div>
          <div className="max-h-72 overflow-y-auto space-y-1.5 font-mono text-xs">
            {afterList.length === 0 ? (
              <div className="rounded bg-neutral-950 p-3 text-center text-neutral-600 border border-neutral-800/60 italic">
                (Empty / No Items)
              </div>
            ) : (
              afterList.map((item, idx) => {
                const beforeKeys = beforeList.map(getItemKey);
                const isNew = !beforeKeys.includes(getItemKey(item));
                return (
                  <div
                    key={idx}
                    className={`rounded p-2 border ${
                      isNew
                        ? 'border-emerald-500/40 bg-emerald-950/20 text-emerald-300 font-semibold'
                        : 'border-neutral-800/60 bg-neutral-950 text-neutral-300'
                    }`}
                  >
                    [{idx}] {renderItemText(item)}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderSingleList = (categoryData?: SingleCategory, title?: string) => {
    const itemsList = categoryData?.items || [];

    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold uppercase text-neutral-300">
          <History className="h-3.5 w-3.5 text-sky-400" />
          <span>{title || 'Logged Entries'}</span>
        </div>
        <div className="max-h-72 overflow-y-auto space-y-1.5 font-mono text-xs">
          {itemsList.length === 0 ? (
            <div className="rounded bg-neutral-950 p-3 text-center text-neutral-600 border border-neutral-800/60 italic">
              (No Activity / Logged Items)
            </div>
          ) : (
            itemsList.map((item, idx) => (
              <div key={idx} className="rounded bg-neutral-950 p-2 text-neutral-300 border border-neutral-800">
                [{idx}] {renderItemText(item)}
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'inventory', label: 'Inventory', icon: <Package className="h-4 w-4 text-emerald-400" /> },
    { id: 'equipment', label: 'Equipment', icon: <Shield className="h-4 w-4 text-sky-400" /> },
    { id: 'accessory', label: 'Accessory', icon: <Sparkles className="h-4 w-4 text-purple-400" /> },
    { id: 'force', label: 'Force', icon: <Zap className="h-4 w-4 text-cyan-400" /> },
    { id: 'resource', label: 'Resource', icon: <Coins className="h-4 w-4 text-yellow-400" /> },
    { id: 'animus', label: 'Animus', icon: <Flame className="h-4 w-4 text-red-400" /> },
    { id: 'bank', label: 'Bank', icon: <Briefcase className="h-4 w-4 text-amber-400" /> },
    { id: 'experience', label: 'Experience', icon: <History className="h-4 w-4 text-blue-400" /> },
    { id: 'consume', label: 'Consume', icon: <ShoppingCart className="h-4 w-4 text-rose-400" /> },
  ];

  return (
    <main className="flex-1 py-6">
      <div className="mx-auto max-w-6xl rounded-xl border border-neutral-800 bg-neutral-950 p-6 shadow-2xl">
        
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-extrabold tracking-tight text-white">
            Character History Logs
          </h1>
        </div>

        {/* Global Error Message */}
        {error && (
          <div className="mb-6 rounded-lg border border-red-900/50 bg-red-950/20 p-4 text-center text-xs font-semibold text-red-400">
            {error}
          </div>
        )}

        {/* Search Form */}
        <div className="mb-8 rounded-lg border border-neutral-800 bg-neutral-900/60 p-4">
          <form onSubmit={handleSearchTimestamps} className="flex flex-col gap-4 sm:flex-row sm:items-end">
            
            {/* Character Name Input */}
            <div className="flex-1 space-y-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                Character Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 h-4 w-4 text-neutral-500" />
                <input
                  type="text"
                  value={characterName}
                  onChange={(e) => setCharacterName(e.target.value)}
                  placeholder="e.g. Roxy"
                  className="w-full rounded border border-neutral-800 bg-neutral-950 py-2 pl-9 pr-3 text-xs text-white placeholder-neutral-600 focus:border-red-500 focus:outline-none"
                  required
                />
              </div>
            </div>

            {/* Date Picker Input */}
            <div className="flex-1 space-y-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                Log Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-neutral-500" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full rounded border border-neutral-800 bg-neutral-950 py-2 pl-9 pr-3 text-xs text-white focus:border-red-500 focus:outline-none [color-scheme:dark]"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loadingTimestamps}
              className="flex items-center justify-center gap-2 rounded bg-red-600 px-5 py-2 text-xs font-bold uppercase text-white hover:bg-red-700 disabled:opacity-50 transition"
            >
              {loadingTimestamps ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
              <span>Search Logs</span>
            </button>
          </form>
        </div>

        {/* Timestamps Grid */}
        {timestamps && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-neutral-800 pb-2 text-xs font-bold uppercase tracking-wider text-neutral-400">
              <Clock className="h-4 w-4 text-red-500" />
              <span>Available Timestamps ({timestamps.length})</span>
            </div>

            {timestamps.length === 0 ? (
              <div className="rounded-lg border border-neutral-800 bg-neutral-900/30 p-8 text-center text-xs text-neutral-500">
                No log records found for Character <span className="text-white">{characterName}</span> on Date <span className="text-white">{selectedDate}</span>.
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                {timestamps.map((ts, idx) => {
                  const isActive = activeTimestampFilename === ts.filename;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectTimestamp(ts)}
                      className={`flex items-center justify-center gap-2 rounded border p-3 text-xs font-medium transition ${
                        isActive
                          ? 'border-red-500 bg-red-950/40 text-white font-bold ring-1 ring-red-500'
                          : 'border-neutral-800 bg-neutral-900/60 text-neutral-200 hover:border-red-500/50 hover:bg-neutral-900 hover:text-white'
                      }`}
                    >
                      <Clock className={`h-3.5 w-3.5 ${isActive ? 'text-red-400' : 'text-sky-400'}`} />
                      <span>{ts.display_time}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Loading details state */}
        {loadingDetails && (
          <div className="mt-8 flex min-h-[200px] flex-col items-center justify-center space-y-3 rounded-xl border border-neutral-800 bg-neutral-900/20 p-8">
            <Loader2 className="h-8 w-8 animate-spin text-red-500" />
            <p className="text-xs text-neutral-400">Loading snapshot log for {activeTimestampLabel}...</p>
          </div>
        )}

        {/* Inline Detailed Log View */}
        {!loadingDetails && selectedLog && (
          <div className="mt-8 space-y-6 pt-4 border-t border-neutral-800">
            
            {/* Timestamp Banner */}
            <div className="flex items-center justify-between rounded-lg border border-sky-500/30 bg-sky-950/20 px-4 py-3 text-xs">
              <span className="font-semibold text-sky-400">Selected Snapshot Timestamp:</span>
              <span className="font-mono font-bold text-white">{activeTimestampLabel}</span>
            </div>

            {/* Character Info */}
            {selectedLog.characterInfo && (
              <div className="overflow-hidden rounded-lg border border-neutral-800 bg-neutral-900/60">
                <div className="flex items-center gap-2 bg-red-600 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white">
                  <UserCheck className="h-4 w-4" />
                  <span>Character Info</span>
                </div>
                <div className="grid grid-cols-2 gap-4 p-4 text-xs sm:grid-cols-3 md:grid-cols-6">
                  <div>
                    <span className="block text-neutral-500">Name</span>
                    <span className="font-bold text-white">{selectedLog.characterInfo.name || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="block text-neutral-500">Race</span>
                    <span className="font-medium text-neutral-200">{selectedLog.characterInfo.race || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="block text-neutral-500">Sex</span>
                    <span className="font-medium text-neutral-200">{selectedLog.characterInfo.sex || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="block text-neutral-500">World</span>
                    <span className="font-medium text-neutral-200">{selectedLog.characterInfo.world || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="block text-neutral-500">IP Address</span>
                    <span className="font-mono text-neutral-200">{selectedLog.characterInfo.ipAddress || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="block text-neutral-500">Log Date</span>
                    <span className="font-medium text-neutral-200">{selectedLog.characterInfo.historyDate || 'N/A'}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Stats Table */}
            {selectedLog.stats && Object.keys(selectedLog.stats).length > 0 && (
              <div className="overflow-hidden rounded-lg border border-neutral-800 bg-neutral-900/60">
                <div className="flex items-center gap-2 bg-neutral-800 px-4 py-2 text-xs font-bold uppercase tracking-wider text-neutral-200">
                  <Swords className="h-4 w-4 text-amber-500" />
                  <span>Stats Comparison</span>
                </div>
                <div className="p-4">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-neutral-800 text-neutral-400">
                        <th className="pb-2 font-semibold">Stat Name</th>
                        <th className="pb-2 font-semibold text-neutral-400">Before</th>
                        <th className="pb-2 font-semibold text-neutral-400">After</th>
                        <th className="pb-2 font-semibold text-right">Difference</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-800/50">
                      {Object.entries(selectedLog.stats || {}).map(([statName, val]) => {
                        const before = val?.before ?? 0;
                        const after = val?.after ?? 0;
                        const diff = after - before;
                        return (
                          <tr key={statName}>
                            <td className="py-2.5 font-bold uppercase text-neutral-300">{statName}</td>
                            <td className="py-2.5 font-mono text-neutral-400">{before.toLocaleString()}</td>
                            <td className="py-2.5 font-mono text-white">{after.toLocaleString()}</td>
                            <td className={`py-2.5 font-mono font-bold text-right ${
                              diff > 0 ? 'text-emerald-400' : diff < 0 ? 'text-red-400' : 'text-neutral-500'
                            }`}>
                              {diff > 0 ? `+${diff.toLocaleString()}` : diff.toLocaleString()}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Multi-Tab Container */}
            <div className="overflow-hidden rounded-lg border border-neutral-800 bg-neutral-900/60">
              
              {/* Tab Navigation Header */}
              <div className="flex flex-wrap border-b border-neutral-800 bg-neutral-900">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 border-b-2 px-4 py-3 text-xs font-bold uppercase tracking-wider transition ${
                      activeTab === tab.id
                        ? 'border-red-500 bg-neutral-950 text-white'
                        : 'border-transparent text-neutral-400 hover:text-neutral-200'
                    }`}
                  >
                    {tab.icon}
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>

              {/* Tab Contents */}
              <div className="p-4">
                {activeTab === 'inventory' && renderBeforeAfterGrid(selectedLog.inventory, 'Inventory')}

                {activeTab === 'equipment' && (
                  Array.isArray(selectedLog.equipment) ? (
                    <div className="divide-y divide-neutral-800/50 text-xs">
                      {selectedLog.equipment.length === 0 ? (
                        <div className="py-4 text-center text-xs text-neutral-500 italic">(No Equipment Registered)</div>
                      ) : (
                        selectedLog.equipment.map((slot: any, i: number) => (
                          <div key={i} className="flex items-center justify-between py-2">
                            <span className="w-1/4 font-semibold text-neutral-400">{slot.slotName || `Slot ${i}`}</span>
                            <div className="flex w-3/4 items-center gap-4">
                              <span className="w-1/2 rounded bg-neutral-950 px-2 py-1 font-mono text-neutral-400 border border-neutral-800">
                                {renderItemText(slot.beforeItem)}
                              </span>
                              <span className="text-neutral-600">➔</span>
                              <span className={`w-1/2 rounded px-2 py-1 font-mono border ${
                                slot.isModified 
                                  ? 'border-amber-500/40 bg-amber-500/10 text-amber-400 font-bold' 
                                  : 'border-neutral-800 bg-neutral-950 text-neutral-300'
                              }`}>
                                {renderItemText(slot.afterItem)}
                              </span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  ) : (
                    renderBeforeAfterGrid(selectedLog.equipment as DiffCategory, 'Equipment')
                  )
                )}

                {activeTab === 'accessory' && renderBeforeAfterGrid(selectedLog.accessory, 'Accessory')}
                {activeTab === 'force' && renderBeforeAfterGrid(selectedLog.force, 'Force')}
                {activeTab === 'resource' && renderBeforeAfterGrid(selectedLog.resource, 'Resource')}
                {activeTab === 'animus' && renderBeforeAfterGrid(selectedLog.animus, 'Animus')}
                {activeTab === 'bank' && renderBeforeAfterGrid(selectedLog.bank, 'Bank')}
                
                {activeTab === 'experience' && renderSingleList(selectedLog.experience, 'Experience Logs')}
                {activeTab === 'consume' && renderSingleList(selectedLog.consume, 'Consumable Logs')}
              </div>

            </div>

          </div>
        )}

      </div>
    </main>
  );
}