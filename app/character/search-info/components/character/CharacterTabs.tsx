'use client';

import React from 'react';
import {
  Shield,
  Sword,
  Package,
  Landmark,
  UserCheck,
  History,
  TrendingUp,
} from 'lucide-react';

import { CharacterData } from './types/character';

import GameDataTab from './GameDataTab';
import EquipmentTab from './EquipmentTab';
import InventoryTab from './InventoryTab';
import BankTab from './BankTab';
import CharacterStatsTab from './CharacterStatsTab';
import LevelHistoryTab from './LevelHistoryTab';
import PlayerHistoryTab from './PlayerHistoryTab';

interface Props {
  character: CharacterData;
}

export default function CharacterTabs({
  character,
}: Props) {
  const [activeTab, setActiveTab] =
    React.useState('game_data');

  const tabs = [
    {
      id: 'game_data',
      label: 'Game Data',
      icon: Shield,
    },
    {
      id: 'equipment',
      label: 'Equipment',
      icon: Sword,
    },
    {
      id: 'inventory',
      label: 'Inventory',
      icon: Package,
    },
    {
      id: 'bank',
      label: 'Bank Storage',
      icon: Landmark,
    },
    {
      id: 'stats',
      label: 'Character Stats',
      icon: UserCheck,
    },
    {
      id: 'level_history',
      label: 'Level History',
      icon: TrendingUp,
    },
    {
      id: 'player_history',
      label: 'Player History',
      icon: History,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto border-b border-neutral-800 pb-3">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive =
            activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() =>
                setActiveTab(tab.id)
              }
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

      {/* Tab Content */}

      {activeTab === 'game_data' && (
        <GameDataTab
          character={character}
        />
      )}

      {activeTab === 'equipment' && (
        <EquipmentTab
          character={character}
        />
      )}

      {activeTab === 'inventory' && (
        <InventoryTab
          character={character}
        />
      )}

      {activeTab === 'bank' && (
        <BankTab
          character={character}
        />
      )}

      {activeTab === 'stats' && (
        <CharacterStatsTab
          character={character}
        />
      )}

      {activeTab === 'level_history' && (
        <LevelHistoryTab
          character={character}
        />
      )}

      {activeTab === 'player_history' && (
        <PlayerHistoryTab
          character={character}
        />
      )}
    </div>
  );
}