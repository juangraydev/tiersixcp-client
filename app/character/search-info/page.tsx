'use client';

import React, { useState } from 'react';
import {
  Search,
  Shield,
  Sword,
  Package,
  Landmark,
  UserCheck,
  History,
  TrendingUp,
  Loader2,
  AlertCircle,
  Coins,
  Skull,
  Swords,
  Play,
} from 'lucide-react';

interface EquipmentItem {
  itemId: number;
  itemCode?: string;
  itemName?: string;
  itemType?: string;
  upgradeLevel?: number;
  icon?: string | number;
  itemIcon?: number | string;
  itemIconPos?: number | string;
  iconPath?: string;
}

interface InventoryItem {
  slot: number;
  itemId: number;
  itemCode?: string;
  itemName?: string;
  itemType?: string;
  qty: number;
  upgradeLevel?: number;
  icon?: string | number;
  itemIcon?: number | string;
  itemIconPos?: number | string;
  iconPath?: string;
}

interface CharacterStats {
  hp: number;
  maxHp: number;
  fp: number;
  maxFp: number;
  sp: number;
  maxSp: number;
  killCount: number;
  deathCount: number;
  temporaryPoint: number;
  certainPoint: number;
  goldPoint: number;
  contPointVar: number;
  contPoint: number;
}

interface CharacterSummary {
  serial: number;
  accountSerial: number;
  name: string;
  race: number;
  class: number;
  level: number;
  guildName: string;
  gold: number;
  dalant: number;
  lastConnTime: string;
}

interface CharacterData {
  summary: CharacterSummary;
  stats: CharacterStats;
  equipment: Record<string, EquipmentItem | null>;
  inventory: InventoryItem[];
  bank: InventoryItem[];
}

/**
 * Item Icon Renderer
 *
 * RF Online icon sprite sheet:
 * - Sprite sheet: 256x256px
 * - Individual icon: 64x64px
 * - 16 columns x 4 rows
 * - 64 icons total
 *
 * itemIconPos is treated as a ZERO-BASED position:
 *   0  = first icon
 *   15 = last icon on row 1
 *   16 = first icon on row 2
 *   63 = last icon
 */
const ItemIconView = ({
  item,
  label,
}: {
  item: EquipmentItem | InventoryItem | null;
  label?: string;
}) => {
  const [spriteSize, setSpriteSize] = useState<{
    width: number;
    height: number;
  } | null>(null);

  if (!item) {
    return (
      <span className="text-[8px] font-bold uppercase text-neutral-600">
        {label}
      </span>
    );
  }

  const rawIconPos =
    item.itemIconPos !== undefined
      ? item.itemIconPos
      : item.itemIcon !== undefined
        ? item.itemIcon
        : item.icon;

  const iconPos =
    typeof rawIconPos === 'number'
      ? rawIconPos
      : typeof rawIconPos === 'string' && rawIconPos.trim() !== ''
        ? Number(rawIconPos)
        : null;

  const spriteSrc = item.iconPath;

  if (spriteSrc && iconPos !== null && Number.isFinite(iconPos)) {
    const SOURCE_ICON_SIZE = 64;
    const DISPLAY_ICON_SIZE = 38;

    // First load the sprite so we know its REAL dimensions.
    if (!spriteSize) {
      return (
        <div className="relative h-full w-full overflow-hidden">
          <img
            src={spriteSrc}
            alt=""
            draggable={false}
            className="hidden"
            onLoad={(e) => {
              const img = e.currentTarget;
              setSpriteSize({
                width: img.naturalWidth,
                height: img.naturalHeight,
              });
            }}
            onError={() => setSpriteSize({ width: 0, height: 0 })}
          />
        </div>
      );
    }

    if (spriteSize.width <= 0 || spriteSize.height <= 0) {
      return <span className="text-[8px] text-neutral-600">?</span>;
    }

    // Every source icon is 64x64. Determine the actual sheet grid.
    const columns = Math.floor(spriteSize.width / SOURCE_ICON_SIZE);
    const rows = Math.floor(spriteSize.height / SOURCE_ICON_SIZE);
    const totalIcons = columns * rows;

    // itemIconPos is ZERO-BASED: 0 = first icon.
    const index = Math.floor(iconPos);

    if (columns <= 0 || rows <= 0 || index < 0 || index >= totalIcons) {
      return <span className="text-[8px] text-neutral-600">?</span>;
    }

    const column = index % columns;
    const row = Math.floor(index / columns);

    // Uniformly scale the WHOLE sprite sheet: 64 source px -> 38 display px.
    const scale = DISPLAY_ICON_SIZE / SOURCE_ICON_SIZE;
    const displaySpriteWidth = spriteSize.width * scale;
    const displaySpriteHeight = spriteSize.height * scale;

    // After scaling, each icon occupies exactly 38px.
    const offsetX = -(column * DISPLAY_ICON_SIZE);
    const offsetY = -(row * DISPLAY_ICON_SIZE);

    return (
      <div
        className="relative shrink-0 overflow-hidden"
        style={{
          width: `${DISPLAY_ICON_SIZE}px`,
          height: `${DISPLAY_ICON_SIZE}px`,
          backgroundImage: `url("${spriteSrc}")`,
          backgroundRepeat: 'no-repeat',
          backgroundSize: `${displaySpriteWidth}px ${displaySpriteHeight}px`,
          backgroundPosition: `${offsetX}px ${offsetY}px`,
          imageRendering: 'auto',
        }}
      />
    );
  }

  const displayCode = item.itemCode || `${item.itemId}`;
  const imgSrc =
    item.iconPath ||
    (typeof item.icon === 'string' && item.icon.includes('.')
      ? item.icon
      : null);

  if (imgSrc) {
    return (
      <img
        src={imgSrc}
        alt={item.itemName || label || 'Item'}
        className="h-full w-full object-contain"
        draggable={false}
      />
    );
  }

  return (
    <span className="truncate px-0.5 font-sans text-[9px] font-bold uppercase tracking-tighter text-cyan-300">
      {displayCode}
    </span>
  );
};

/** Storage Grid Renderer (4x5 Grid - 4 Rows x 5 Columns = 20 Slots per Bag/Bank) */
const StorageGridContainer = ({
  title,
  slots,
  startSlot,
}: {
  title: string;
  slots: Record<number, InventoryItem>;
  startSlot: number;
}) => {
  const gridSlots = Array.from({ length: 20 }, (_, index) => startSlot + index);

  return (
    <div className="w-[230px] shrink-0 rounded border border-neutral-800 bg-neutral-900/90 shadow-lg">
      <div className="border-b border-neutral-800 bg-neutral-950/80 py-1 text-center font-sans text-[11px] font-bold text-neutral-300">
        {title}
      </div>
      {/* 5-Column Grid Layout */}
      <div className="grid grid-cols-5 gap-1 p-1.5">
        {gridSlots.map((slotIndex) => {
          const item = slots[slotIndex];

          return (
            <div
              key={slotIndex}
              className="group relative flex h-[38px] w-[38px] items-center justify-center rounded-[2px] border border-neutral-800/80 bg-neutral-950 transition-colors hover:border-neutral-500"
            >
              {item ? (
                <>
                  <div className="relative flex h-full w-full items-center justify-center p-0.5">
                    <ItemIconView item={item} />

                    {/* Quantity Indicator */}
                    {item.qty && item.qty > 1 ? (
                      <span className="absolute bottom-0.5 right-0.5 font-mono text-[10px] font-bold leading-none text-amber-300 drop-shadow-[0_1px_1px_rgba(0,0,0,1)]">
                        {item.qty}
                      </span>
                    ) : null}
                  </div>

                  {/* Hover Tooltip */}
                  <div className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 hidden w-max max-w-[180px] -translate-x-1/2 rounded border border-neutral-700 bg-neutral-950 p-2 text-left shadow-2xl group-hover:block">
                    <p className="text-[11px] font-bold leading-snug text-white">
                      {item.itemName || 'Unknown Item'}
                    </p>
                    <p className="mt-0.5 text-[9px] font-semibold uppercase tracking-wider text-neutral-400">
                      Type: {item.itemType || 'General'}
                    </p>
                    {item.itemCode ? (
                      <p className="mt-0.5 font-mono text-[9px] text-cyan-400">
                        Code: {item.itemCode}
                      </p>
                    ) : null}
                  </div>
                </>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
};

/** Paperdoll Slot Component */
const PaperdollSlot = ({
  item,
  label,
  className = '',
}: {
  item?: EquipmentItem | null;
  label?: string;
  className?: string;
}) => {
  return (
    <div
      className={`group relative flex h-11 w-11 items-center justify-center rounded border border-neutral-700/60 bg-neutral-950/90 shadow-inner ${className}`}
    >
      {item ? (
        <>
          <div className="relative flex h-full w-full items-center justify-center p-1">
            <ItemIconView item={item} label={label} />
            {item.upgradeLevel && item.upgradeLevel > 0 ? (
              <span className="absolute top-0.5 right-0.5 font-mono text-[10px] font-extrabold text-cyan-400 drop-shadow-[0_1px_1px_rgba(0,0,0,1)]">
                +{item.upgradeLevel}
              </span>
            ) : null}
          </div>

          {/* Hover Tooltip */}
          <div className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 hidden w-max max-w-[180px] -translate-x-1/2 rounded border border-neutral-700 bg-neutral-950 p-2 text-left shadow-2xl group-hover:block">
            <p className="text-[11px] font-bold leading-snug text-white">
              {item.itemName || 'Unknown Item'}
            </p>
            <p className="mt-0.5 text-[9px] font-semibold uppercase tracking-wider text-neutral-400">
              Type: {item.itemType || 'Equipment'}
            </p>
            {item.itemCode ? (
              <p className="mt-0.5 font-mono text-[9px] text-cyan-400">
                Code: {item.itemCode}
              </p>
            ) : null}
          </div>
        </>
      ) : (
        <span className="text-[8px] font-bold uppercase text-neutral-600">{label}</span>
      )}
    </div>
  );
};

export default function CharacterSearchPage() {
  const [queryName, setQueryName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [character, setCharacter] = useState<CharacterData | null>(null);
  const [activeTab, setActiveTab] = useState('game_data');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!queryName.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/character/search?name=${encodeURIComponent(queryName)}`);
      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || 'Character search failed');
      }

      setCharacter(result.data);
    } catch (err: any) {
      setError(err.message || 'An error occurred while searching');
      setCharacter(null);
    } finally {
      setLoading(false);
    }
  };

  const inventoryArray = Array.isArray(character?.inventory) ? character.inventory : [];
  const inventorySlots = inventoryArray.reduce<Record<number, InventoryItem>>((acc, item) => {
    if (item && typeof item.slot === 'number') {
      acc[item.slot] = item;
    }
    return acc;
  }, {});

  const bankArray = Array.isArray(character?.bank) ? character.bank : [];
  const bankSlots = bankArray.reduce<Record<number, InventoryItem>>((acc, item) => {
    if (item && typeof item.slot === 'number') {
      acc[item.slot] = item;
    }
    return acc;
  }, {});

  const hp = character?.stats?.hp ?? 0;
  const maxHp = character?.stats?.maxHp ?? 1;
  const fp = character?.stats?.fp ?? 0;
  const maxFp = character?.stats?.maxFp ?? 1;
  const sp = character?.stats?.sp ?? 0;
  const maxSp = character?.stats?.maxSp ?? 1;

  const tabs = [
    { id: 'game_data', label: 'Game Data', icon: Shield },
    { id: 'equipment', label: 'Equipment', icon: Sword },
    { id: 'inventory', label: 'Inventory', icon: Package },
    { id: 'bank', label: 'Bank Storage', icon: Landmark },
    { id: 'stats', label: 'Character Stats', icon: UserCheck },
    { id: 'level_history', label: 'Level History', icon: TrendingUp },
    { id: 'player_history', label: 'Player History', icon: History },
  ];

  return (
    <main className="flex-1 py-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header & Search */}
        <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-6 shadow-2xl">
          <div className="mb-6 flex items-center justify-between border-b border-neutral-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg border border-red-500/30 bg-red-600/10 p-2">
                <Search className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-white">
                  Character Information Search
                </h1>
                <p className="text-xs text-neutral-400">
                  Inspect in-game statistics, equipment, inventory bags, and bank storage data
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSearch} className="space-y-4">
            <div className="rounded-lg border border-neutral-800 bg-neutral-900/60 p-4">
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-neutral-400">
                Search Character Name
              </label>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={queryName}
                  onChange={(e) => setQueryName(e.target.value)}
                  placeholder="Enter character name..."
                  className="flex-1 rounded-lg border border-neutral-800 bg-neutral-950 px-4 py-2.5 text-xs text-white placeholder-neutral-500 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 rounded-lg bg-red-600 px-5 py-2.5 text-xs font-bold uppercase text-white transition-colors hover:bg-red-500 disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                  Search
                </button>
              </div>
            </div>
          </form>

          {error && (
            <div className="mt-4 flex items-center gap-2 rounded-lg border border-red-900/50 bg-red-950/20 p-3 text-xs text-red-400">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Character Result View */}
        {character && (
          <div className="space-y-6 rounded-xl border border-neutral-800 bg-neutral-950 p-6 shadow-2xl">
            {/* Tabs Bar */}
            <div className="flex gap-2 overflow-x-auto border-b border-neutral-800 pb-3">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 whitespace-nowrap rounded-lg px-3.5 py-2 text-xs font-bold uppercase transition-all ${
                      isActive
                        ? 'bg-red-600 text-white shadow-lg shadow-red-950/50'
                        : 'bg-neutral-900/80 text-neutral-400 hover:bg-neutral-800 hover:text-white'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* TAB 1: GAME DATA OVERVIEW */}
            {activeTab === 'game_data' && (
              <div className="space-y-8">
                {/* SECTION A: STATS & EQUIPMENT PANEL */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                  {/* Left Side: Level Circle, HP/FP/SP Bars, & PVP Details */}
                  <div className="space-y-5 lg:col-span-7">
                    <div className="flex items-center gap-4">
                      <div className="relative flex h-20 w-20 shrink-0 items-center justify-center rounded-full border-4 border-blue-600/60 bg-gradient-to-b from-blue-500 to-indigo-900 shadow-[0_0_15px_rgba(37,99,235,0.4)]">
                        <span className="font-mono text-2xl font-black text-white">
                          {character.summary?.level ?? 1}
                        </span>
                      </div>

                      <div className="flex-1 space-y-2">
                        {/* HP Bar */}
                        <div className="relative flex h-7 items-center overflow-hidden rounded border border-red-900/80 bg-neutral-950 px-3">
                          <span className="z-10 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-600 font-mono text-[10px] font-bold text-white">
                            H
                          </span>
                          <span className="z-10 flex-1 text-center font-mono text-xs font-bold tracking-wider text-white drop-shadow">
                            {hp.toLocaleString()} / {maxHp.toLocaleString()}
                          </span>
                          <div
                            className="absolute inset-y-0 left-0 bg-gradient-to-r from-red-700 to-red-500 transition-all duration-300"
                            style={{ width: `${Math.min(100, (hp / maxHp) * 100)}%` }}
                          />
                        </div>

                        {/* FP Bar */}
                        <div className="relative flex h-7 items-center overflow-hidden rounded border border-sky-900/80 bg-neutral-950 px-3">
                          <span className="z-10 flex h-4 w-4 items-center justify-center rounded-full bg-cyan-600 font-mono text-[10px] font-bold text-white">
                            F
                          </span>
                          <span className="z-10 flex-1 text-center font-mono text-xs font-bold tracking-wider text-white drop-shadow">
                            {fp.toLocaleString()} / {maxFp.toLocaleString()}
                          </span>
                          <div
                            className="absolute inset-y-0 left-0 bg-gradient-to-r from-cyan-600 to-blue-500 transition-all duration-300"
                            style={{ width: `${Math.min(100, (fp / maxFp) * 100)}%` }}
                          />
                        </div>

                        {/* SP Bar */}
                        <div className="relative flex h-7 items-center overflow-hidden rounded border border-amber-900/80 bg-neutral-950 px-3">
                          <span className="z-10 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 font-mono text-[10px] font-bold text-black">
                            S
                          </span>
                          <span className="z-10 flex-1 text-center font-mono text-xs font-bold tracking-wider text-white drop-shadow">
                            {sp.toLocaleString()} / {maxSp.toLocaleString()}
                          </span>
                          <div
                            className="absolute inset-y-0 left-0 bg-gradient-to-r from-amber-600 to-yellow-500 transition-all duration-300"
                            style={{ width: `${Math.min(100, (sp / maxSp) * 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* PVP Stats Box */}
                    <div className="flex rounded-lg border border-neutral-800 bg-neutral-900/60 p-4">
                      <div className="flex w-1/3 items-center justify-center border-r border-neutral-800 pr-4">
                        <div className="flex h-20 w-20 items-center justify-center rounded-full border border-red-600/40 bg-red-950/20 p-2">
                          <Swords className="h-10 w-10 text-red-500" />
                        </div>
                      </div>

                      <div className="w-2/3 space-y-1.5 pl-4 font-mono text-xs">
                        <div className="flex items-center gap-2 font-bold text-red-400">
                          <Swords className="h-3.5 w-3.5" />
                          <span>KILL: {character.stats?.killCount ?? 0}</span>
                        </div>
                        <div className="flex items-center gap-2 font-bold text-neutral-300">
                          <Skull className="h-3.5 w-3.5" />
                          <span>DEATH: {character.stats?.deathCount ?? 0}</span>
                        </div>
                        <div className="flex justify-between text-neutral-300">
                          <span className="flex items-center gap-1">
                            <Play className="h-2 w-2 fill-red-500 text-red-500" /> Temporary Point:
                          </span>
                          <span className="font-bold text-white">
                            {(character.stats?.temporaryPoint ?? 0).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between text-neutral-300">
                          <span className="flex items-center gap-1">
                            <Play className="h-2 w-2 fill-red-500 text-red-500" /> Certain Point:
                          </span>
                          <span className="font-bold text-white">
                            {(character.stats?.certainPoint ?? 0).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between text-neutral-300">
                          <span className="flex items-center gap-1">
                            <Play className="h-2 w-2 fill-red-500 text-red-500" /> Gold Point:
                          </span>
                          <span className="font-bold text-white">
                            {(character.stats?.goldPoint ?? 0).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between text-neutral-300">
                          <span className="flex items-center gap-1">
                            <Play className="h-2 w-2 fill-red-500 text-red-500" /> Cont. Point variation:
                          </span>
                          <span className="font-bold text-white">
                            {(character.stats?.contPointVar ?? 0).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between text-neutral-300">
                          <span className="flex items-center gap-1">
                            <Play className="h-2 w-2 fill-red-500 text-red-500" /> Cont. Point:
                          </span>
                          <span className="font-bold text-white">
                            {(character.stats?.contPoint ?? 0).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Side: Equipment Paperdoll View */}
                  <div className="flex flex-col items-center justify-center rounded-lg border border-neutral-800 bg-neutral-900/60 p-4 lg:col-span-5">
                    <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-neutral-300">
                      <span className="h-2 w-2 rounded-full bg-sky-400" />
                      <span>{character.summary?.name || 'CHARACTER'}</span>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div />
                      <PaperdollSlot item={character.equipment?.helmet} label="Helmet" />
                      <PaperdollSlot item={character.equipment?.cloak} label="Cloak" />

                      <PaperdollSlot item={character.equipment?.weapon} label="Weapon" />
                      <PaperdollSlot item={character.equipment?.upper} label="Upper" />
                      <PaperdollSlot item={character.equipment?.shield} label="Shield" />

                      <PaperdollSlot item={character.equipment?.gauntlet} label="Hands" />
                      <PaperdollSlot item={character.equipment?.lower} label="Lower" />
                      <PaperdollSlot item={character.equipment?.shoe} label="Shoes" />
                    </div>

                    <div className="mt-4 w-full border-t border-neutral-800 pt-2 text-right font-mono text-xs">
                      <p className="font-bold text-neutral-300">
                        {(character.summary?.dalant ?? 0).toLocaleString()} CP
                      </p>
                      <p className="font-bold text-amber-400">
                        {(character.summary?.gold ?? 0).toLocaleString()} Gold
                      </p>
                    </div>
                  </div>
                </div>

                {/* SECTION B: INVENTORY BAGS */}
                <div className="space-y-3 border-t border-neutral-800/80 pt-6">
                  <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-300">
                    <Package className="h-4 w-4 text-red-500" />
                    Inventory Bags (100 Slots)
                  </h3>
                  <div className="space-y-3">
                    {/* Row 1: Bags 1 & 2 */}
                    <div className="flex flex-wrap justify-center gap-3">
                      {[1, 2].map((bagNum) => (
                        <StorageGridContainer
                          key={`bag-${bagNum}`}
                          title={`Bag ${bagNum}`}
                          slots={inventorySlots}
                          startSlot={(bagNum - 1) * 20}
                        />
                      ))}
                    </div>
                    {/* Row 2: Bags 3, 4 & 5 */}
                    <div className="flex flex-wrap justify-center gap-3">
                      {[3, 4, 5].map((bagNum) => (
                        <StorageGridContainer
                          key={`bag-${bagNum}`}
                          title={`Bag ${bagNum}`}
                          slots={inventorySlots}
                          startSlot={(bagNum - 1) * 20}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* SECTION C: BANK STORAGE */}
                <div className="space-y-3 border-t border-neutral-800/80 pt-6">
                  <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-300">
                    <Landmark className="h-4 w-4 text-red-500" />
                    Bank Storage (140 Slots)
                  </h3>
                  <div className="space-y-3">
                    {/* Row 1: Banks 1, 2 & 3 */}
                    <div className="flex flex-wrap justify-center gap-3">
                      {[1, 2, 3].map((bankNum) => (
                        <StorageGridContainer
                          key={`bank-${bankNum}`}
                          title={`Bank ${bankNum}`}
                          slots={bankSlots}
                          startSlot={(bankNum - 1) * 20}
                        />
                      ))}
                    </div>
                    {/* Row 2: Banks 4, 5, 6 & 7 */}
                    <div className="flex flex-wrap justify-center gap-3">
                      {[4, 5, 6, 7].map((bankNum) => (
                        <StorageGridContainer
                          key={`bank-${bankNum}`}
                          title={`Bank ${bankNum}`}
                          slots={bankSlots}
                          startSlot={(bankNum - 1) * 20}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB FALLBACKS */}
            {activeTab !== 'game_data' && (
              <div className="rounded-lg border border-neutral-800 bg-neutral-900/40 p-8 text-center">
                <Coins className="mx-auto mb-2 h-8 w-8 text-neutral-600" />
                <p className="text-xs font-semibold capitalize text-neutral-300">
                  {activeTab.replace('_', ' ')} Tab Content
                </p>
                <p className="mt-1 text-[11px] text-neutral-500">
                  Detailed view for {character.summary?.name}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}