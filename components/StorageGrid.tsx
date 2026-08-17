'use client';

import React, { useState } from 'react';

export interface InventoryItem {
  slot: number;
  itemId: number;
  itemCode: string;
  itemName: string;
  itemType: string;
  qty: number;
  upgradeLevel: number;
  icon?: string;
}

interface StorageGridContainerProps {
  title: string;
  slots: Record<number, InventoryItem>;
  startSlot: number;
  totalSlots?: number;
}

export const StorageGridContainer: React.FC<StorageGridContainerProps> = ({
  title,
  slots,
  startSlot,
  totalSlots = 20,
}) => {
  const gridSlots = Array.from({ length: totalSlots }, (_, index) => startSlot + index);

  return (
    <div className="w-[210px] shrink-0 rounded-md border border-neutral-800 bg-neutral-900/90 shadow-xl overflow-hidden select-none">
      <div className="border-b border-neutral-800 bg-neutral-950/90 py-1.5 text-center font-sans text-xs font-bold text-neutral-300 uppercase tracking-wider">
        {title}
      </div>

      <div className="grid grid-cols-5 gap-1.5 p-2">
        {gridSlots.map((slotIndex) => {
          const item = slots[slotIndex];

          return (
            <div
              key={slotIndex}
              className="group relative flex h-[38px] w-[38px] items-center justify-center rounded border border-neutral-800/80 bg-neutral-950 transition-colors hover:border-cyan-500/80"
            >
              {item ? (
                <>
                  <div className="relative flex h-full w-full items-center justify-center p-0.5">
                    {item.icon ? (
                      <img
                        src={`/icons/${item.icon}`}
                        alt={item.itemName}
                        className="h-full w-full object-contain pointer-events-none"
                      />
                    ) : (
                      <span className="text-[9px] font-bold text-cyan-300 uppercase tracking-tighter truncate px-0.5">
                        {item.itemCode}
                      </span>
                    )}

                    {/* Upgrade Level Indicator */}
                    {item.upgradeLevel > 0 && (
                      <span className="absolute top-0.5 right-0.5 font-mono text-[9px] font-extrabold text-cyan-400 drop-shadow-[0_1px_2px_rgba(0,0,0,1)]">
                        +{item.upgradeLevel}
                      </span>
                    )}

                    {/* Quantity Indicator */}
                    {item.qty > 1 && (
                      <span className="absolute bottom-0.5 right-0.5 font-mono text-[10px] font-bold leading-none text-amber-300 drop-shadow-[0_1px_2px_rgba(0,0,0,1)]">
                        {item.qty}
                      </span>
                    )}
                  </div>

                  {/* Hover Tooltip */}
                  <div className="pointer-events-none absolute bottom-full left-1/2 mb-2 hidden -translate-x-1/2 z-50 w-max max-w-[200px] rounded border border-neutral-700 bg-neutral-950 p-2 text-left shadow-2xl group-hover:block">
                    <p className="text-[11px] font-bold text-white leading-tight">
                      {item.itemName}
                    </p>
                    <p className="text-[9px] font-semibold text-neutral-400 uppercase tracking-wider mt-0.5">
                      Type: <span className="text-neutral-200">{item.itemType}</span>
                    </p>
                    <p className="text-[9px] font-mono text-cyan-400 mt-0.5">
                      Code: {item.itemCode}
                    </p>
                    {item.upgradeLevel > 0 && (
                      <p className="text-[9px] font-semibold text-cyan-300 mt-0.5">
                        Upgrade: +{item.upgradeLevel}
                      </p>
                    )}
                  </div>
                </>
              ) : (
                <span className="text-[8px] text-neutral-800 font-mono select-none">
                  {slotIndex}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default function CharacterSearchPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<{
    characterName: string;
    inventory: Record<number, InventoryItem>;
    storage: Record<number, InventoryItem>;
  } | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/character/search?name=${encodeURIComponent(searchTerm)}`);
      if (!response.ok) {
        const errJson = await response.json();
        throw new Error(errJson.error || 'Failed to fetch character details.');
      }
      const result = await response.json();
      setData(result);
    } catch (err: any) {
      setError(err.message || 'An error occurred.');
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 p-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-6">
        <header className="border-b border-neutral-800 pb-4">
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Character Item & Bank Storage Inspector
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Search character inventory and bank storage slots with decoded item attributes.
          </p>
        </header>

        {/* Search Input */}
        <form onSubmit={handleSearch} className="flex gap-2 max-w-md">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Enter character name..."
            className="flex-1 rounded border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-white placeholder-neutral-500 focus:border-cyan-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={loading}
            className="rounded bg-cyan-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-cyan-500 disabled:opacity-50"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </form>

        {error && (
          <div className="rounded border border-red-800/50 bg-red-950/30 p-3 text-xs text-red-400">
            {error}
          </div>
        )}

        {/* Inventory & Storage Display */}
        {data && (
          <div className="space-y-6 pt-2">
            <h2 className="text-lg font-semibold text-cyan-400">
              Results for: {data.characterName}
            </h2>

            <section className="space-y-3">
              <h3 className="text-sm font-bold text-neutral-300 uppercase tracking-wide">
                Character Inventory
              </h3>
              <div className="flex flex-wrap gap-4">
                <StorageGridContainer title="Bag 1" slots={data.inventory} startSlot={0} />
                <StorageGridContainer title="Bag 2" slots={data.inventory} startSlot={20} />
              </div>
            </section>

            <section className="space-y-3">
              <h3 className="text-sm font-bold text-neutral-300 uppercase tracking-wide">
                Account Storage / Bank
              </h3>
              <div className="flex flex-wrap gap-4">
                <StorageGridContainer title="Page 1" slots={data.storage} startSlot={0} />
                <StorageGridContainer title="Page 2" slots={data.storage} startSlot={20} />
              </div>
            </section>
          </div>
        )}
      </div>
    </main>
  );
}