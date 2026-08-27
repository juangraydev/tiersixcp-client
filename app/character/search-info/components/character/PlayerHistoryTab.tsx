'use client';

import React from 'react';
import { History } from 'lucide-react';
import { CharacterData } from './types/character';

interface Props {
  character: CharacterData;
}

export default function PlayerHistoryTab({
  character,
}: Props) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 border-b border-neutral-800 pb-3">
        <History className="h-4 w-4 text-red-500" />

        <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-300">
          Player History
        </h2>
      </div>

      <div className="rounded-lg border border-neutral-800 bg-neutral-900/40 p-10 text-center">
        <History className="mx-auto mb-3 h-10 w-10 text-neutral-600" />

        <p className="text-sm font-bold text-neutral-300">
          Player History
        </p>

        <p className="mt-1 text-xs text-neutral-500">
          Player history will be implemented here.
        </p>

        <p className="mt-3 text-xs text-neutral-600">
          Character: {character.summary?.name}
        </p>
      </div>
    </div>
  );
}