'use client';

import React, { useState } from 'react';

import {
  Search,
  Loader2,
  AlertCircle,
} from 'lucide-react';

import {
  CharacterData,
} from './components/character/types/character';

import CharacterTabs from './components/character/CharacterTabs';

export default function CharacterSearchPage() {
  const [queryName, setQueryName] =
    useState('');

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const [character, setCharacter] =
    useState<CharacterData | null>(null);

  const handleSearch = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (!queryName.trim()) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(
        `/api/character/search?name=${encodeURIComponent(
          queryName
        )}`
      );

      const result = await res.json();

      if (!res.ok) {
        throw new Error(
          result.message ||
            'Character search failed'
        );
      }

      setCharacter(result.data);
    } catch (err: any) {
      setError(
        err.message ||
          'An error occurred while searching'
      );

      setCharacter(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex-1 py-6">
      <div className="mx-auto max-w-7xl space-y-6">

        {/* Search */}
        <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-6 shadow-2xl">

          <div className="mb-6 flex items-center gap-3 border-b border-neutral-800 pb-4">

            <div className="rounded-lg border border-red-500/30 bg-red-600/10 p-2">
              <Search className="h-5 w-5 text-red-500" />
            </div>

            <div>
              <h1 className="text-xl font-bold tracking-tight text-white">
                Character Information Search
              </h1>

              <p className="text-xs text-neutral-400">
                Inspect in-game statistics,
                equipment, inventory bags,
                and bank storage data
              </p>
            </div>
          </div>

          <form
            onSubmit={handleSearch}
            className="space-y-4"
          >
            <div className="rounded-lg border border-neutral-800 bg-neutral-900/60 p-4">

              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-neutral-400">
                Search Character Name
              </label>

              <div className="flex gap-3">

                <input
                  type="text"
                  value={queryName}
                  onChange={(e) =>
                    setQueryName(
                      e.target.value
                    )
                  }
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

        {/* Character */}
        {character && (
          <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-6 shadow-2xl">

            <CharacterTabs
              character={character}
            />

          </div>
        )}

      </div>
    </main>
  );
}