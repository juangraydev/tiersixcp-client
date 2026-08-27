'use client';

import React from 'react';
import { UserCheck } from 'lucide-react';
import { CharacterData } from './types/character';

interface Props {
  character: CharacterData;
}

export default function CharacterStatsTab({
  character,
}: Props) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 border-b border-neutral-800 pb-3">
        <UserCheck className="h-4 w-4 text-red-500" />

        <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-300">
          Character Stats
        </h2>
      </div>

      <div className="rounded-lg border border-neutral-800 bg-neutral-900/40 p-10 text-center">
        <UserCheck className="mx-auto mb-3 h-10 w-10 text-neutral-600" />

        <p className="text-sm font-bold text-neutral-300">
          Character Stats
        </p>

        <p className="mt-1 text-xs text-neutral-500">
          Detailed character statistics will be implemented here.
        </p>
      </div>
    </div>
  );
}